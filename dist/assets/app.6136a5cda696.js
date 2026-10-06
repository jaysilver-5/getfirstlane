/* Progressive enhancement only: navigation, content and prices render without JavaScript. */
(() => {
  'use strict';
  const config = window.LANE || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('lane.motion') === 'paused'; } catch { /* Storage is optional. */ }
  function updateMotion() {
    const paused = reduced.matches || userPaused;
    document.documentElement.classList.toggle('motion-paused', paused);
    $$('.motion-control').forEach(button => {
      button.setAttribute('aria-pressed', String(paused));
      button.disabled = reduced.matches;
      $('span', button).textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume animations' : 'Pause animations';
    });
  }
  $$('.motion-control').forEach(button => button.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('lane.motion', userPaused ? 'paused' : 'playing'); } catch { /* Private browsing is supported. */ }
    updateMotion();
  }));
  reduced.addEventListener('change', updateMotion);
  updateMotion();
  $('#reset-preferences')?.addEventListener('click', () => {
    try { localStorage.removeItem('lane.motion'); } catch { /* no-op */ }
    userPaused = false; updateMotion();
    $('#preferences-status').textContent = 'Your website preferences have been reset. Your device’s motion preference still applies.';
  });

  const menu = $('#mobile-nav'), menuButton = $('.menu-toggle');
  function closeMenu(focus = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation');
    if (focus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('a', menu || document.createElement('div')).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (menu && !menu.hidden && !event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 851px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  const tabs = $$('[role="tab"]');
  function activateTab(tab, focus = false) {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected)); t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', e => {
      const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length : e.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { e.preventDefault(); activateTab(tabs[next], true); }
    });
  });
  if ('IntersectionObserver' in window && !reduced.matches && !userPaused) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('will-reveal'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    $$('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) el.classList.add('will-reveal');
      observer.observe(el);
    });
  }

  // No advertising/analytics SDK is installed. Store links work as ordinary links.
  // Form requests use same-origin, authenticated server handlers. No privileged keys in this file.
  function status(node, text, error = false) {
    if (!node) return;
    node.textContent = text; node.classList.toggle('error', error);
  }
  async function api(path, body, accessToken) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(path, {
        method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}) },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'This request could not be completed. Please try again shortly.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The connection timed out. Please check your connection and try again.');
      if (error instanceof TypeError) throw new Error('We couldn’t reach Lane. Check your connection and try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  function busy(form, isBusy) {
    form.dataset.busy = isBusy ? 'true' : 'false';
    const button = $('[type="submit"]', form);
    if (button) { button.disabled = isBusy; button.setAttribute('aria-busy', String(isBusy)); }
  }
  const captchaWidgets = new Map();
  let captchaLoading;
  function loadCaptcha() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!captchaLoading) captchaLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => reject(new Error('The security check did not load. Check your connection or contact support.')), 18000);
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
      script.onload = () => { clearTimeout(timer); window.turnstile ? resolve(window.turnstile) : reject(new Error('The security check is unavailable.')); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('The security check could not load. Please try again.')); };
      document.head.append(script);
    }).catch(error => { captchaLoading = null; throw error; });
    return captchaLoading;
  }
  async function ensureCaptcha(kind) {
    if (!config.formsEnabled) throw new Error('This form is currently unavailable. Please try again later or use Help in the Lane app.');
    const turnstile = await loadCaptcha();
    if (!captchaWidgets.has(kind)) {
      const node = $(`[data-captcha="${kind}"]`);
      const record = { id: null, token: '', rendering: true };
      captchaWidgets.set(kind, record);
      record.id = turnstile.render(node, {
        sitekey: config.turnstileSiteKey, action: kind, theme: 'light', size: 'flexible',
        callback: token => { record.token = token; },
        'expired-callback': () => { record.token = ''; },
        'error-callback': () => { record.token = ''; }
      });
      record.rendering = false;
    }
    return captchaWidgets.get(kind);
  }
  async function captchaToken(kind) {
    const record = await ensureCaptcha(kind);
    if (!record.token) throw new Error('Please complete the security check, then submit again.');
    return record.token;
  }
  function resetCaptcha(kind) {
    const record = captchaWidgets.get(kind);
    if (record) { record.token = ''; try { window.turnstile?.reset(record.id); } catch { /* Subsequent requests must obtain a new token. */ } }
  }
  function prepareForm(form, kind, messageNode) {
    if (!form) return;
    if (!config.formsEnabled) {
      status(messageNode, 'This form is currently unavailable. Please try again later or use Help in the Lane app.');
      $('[type="submit"]', form).disabled = true;
      return;
    }
    form.addEventListener('focusin', () => ensureCaptcha(kind).catch(e => status(messageNode, e.message, true)), { once: true });
  }
  const support = $('#support-form'), supportStatus = $('#support-status');
  prepareForm(support, 'support', supportStatus);
  support?.addEventListener('submit', async event => {
    event.preventDefault();
    if (support.dataset.busy === 'true' || !support.reportValidity()) return;
    busy(support, true); status(supportStatus, 'Sending your message…');
    try {
      const token = await captchaToken('support');
      const fields = new FormData(support);
      const data = await api('/api/support', { email: fields.get('email'), topic: fields.get('topic'), message: fields.get('message'), company: fields.get('company'), captchaToken: token });
      if (data.accepted !== true) throw new Error('Message delivery was not confirmed. Please try again.');
      support.reset(); status(supportStatus, 'Your message has been accepted for delivery to Lane support. We’ll reply to the email address you provided.');
    } catch (error) { status(supportStatus, error.message, true); }
    finally { resetCaptcha('support'); busy(support, false); }
  });

  const emailForm = $('#delete-email-form'), codeForm = $('#delete-code-form'), confirmForm = $('#delete-confirm-form');
  const deleteStatus = $('#delete-status');
  let accountEmail = '', accessToken = '', expiryTimer;
  function deletePanel(name) {
    ['email','code','confirm','success'].forEach(x => { const el = $(`#delete-${x}-panel`); if (el) el.hidden = x !== name; });
    const step = { email: '1', code: '2', confirm: '3' }[name];
    $$('.delete-steps [data-step]').forEach(el => el.classList.toggle('current', el.dataset.step === step));
    if (name === 'success') { $('.delete-steps').hidden = true; $('#delete-privacy-note').hidden = true; }
  }
  async function clearSession(revoke = true) {
    const oldToken = accessToken; accessToken = ''; clearTimeout(expiryTimer);
    if (oldToken && revoke) { try { await api('/api/account', { action: 'signout' }, oldToken); } catch { /* Token is not persisted locally; server expiry is still enforced. */ } }
  }
  prepareForm(emailForm, 'deletion', deleteStatus);
  emailForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (emailForm.dataset.busy === 'true' || !emailForm.reportValidity()) return;
    busy(emailForm, true); status(deleteStatus, 'Requesting a verification code…');
    try {
      const token = await captchaToken('deletion');
      const fields = new FormData(emailForm);
      const email = String(fields.get('email') || '').trim();
      const data = await api('/api/account', { action: 'send-code', email, company: fields.get('company'), captchaToken: token });
      if (data.sent !== true) throw new Error('The code request could not be confirmed. Please try again.');
      accountEmail = email; await clearSession(); deletePanel('code'); $('#delete-code').focus();
      status(deleteStatus, 'Check your inbox and spam folder. If this email belongs to an account, it will receive a code.');
    } catch (error) { status(deleteStatus, error.message, true); }
    finally { resetCaptcha('deletion'); busy(emailForm, false); }
  });
  codeForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (codeForm.dataset.busy === 'true' || !codeForm.reportValidity()) return;
    busy(codeForm, true); status(deleteStatus, 'Verifying your code…');
    try {
      const code = $('#delete-code').value.trim();
      const data = await api('/api/account', { action: 'verify-code', email: accountEmail, code });
      if (typeof data.accessToken !== 'string' || !data.accessToken || data.verified !== true) throw new Error('Verification was not confirmed. Request a new code.');
      accessToken = data.accessToken; $('#delete-code').value = '';
      expiryTimer = setTimeout(() => { void clearSession(); deletePanel('email'); status(deleteStatus, 'Your verification expired. Verify your email again before deleting.', true); }, 10 * 60 * 1000);
      confirmForm.reset(); deletePanel('confirm'); $('#delete-ack').focus();
      status(deleteStatus, 'Your email is verified. Your account has not been deleted.');
    } catch (error) { status(deleteStatus, error.message, true); }
    finally { busy(codeForm, false); }
  });
  confirmForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (confirmForm.dataset.busy === 'true' || !confirmForm.reportValidity()) return;
    if (!accessToken) { deletePanel('email'); status(deleteStatus, 'Please verify your email again.', true); return; }
    if ($('#delete-confirm-text').value !== 'DELETE' || !$('#delete-ack').checked) {
      status(deleteStatus, 'Tick the confirmation and type DELETE exactly to continue.', true); return;
    }
    busy(confirmForm, true); $('#delete-cancel').disabled = true;
    status(deleteStatus, 'Deleting your Lane account. Please keep this page open…');
    try {
      const data = await api('/api/account', { action: 'delete', confirmation: 'DELETE' }, accessToken);
      if (data.deleted !== true) throw new Error('Account deletion was not confirmed. Contact support if you are unsure of your account status.');
      await clearSession(false); accountEmail = ''; emailForm.reset(); codeForm.reset(); confirmForm.reset();
      status(deleteStatus, ''); deletePanel('success');
      $('#delete-success-panel h2').tabIndex = -1; $('#delete-success-panel h2').focus();
    } catch (error) { status(deleteStatus, error.message, true); }
    finally { busy(confirmForm, false); $('#delete-cancel').disabled = false; }
  });
  $('#delete-restart')?.addEventListener('click', async () => {
    if (codeForm.dataset.busy === 'true') return;
    await clearSession(); codeForm.reset(); deletePanel('email'); $('#delete-email').focus();
    status(deleteStatus, 'Enter your email again to request a fresh code. Requests may be limited for security.');
  });
  $('#delete-cancel')?.addEventListener('click', async () => {
    if (confirmForm.dataset.busy === 'true') return;
    await clearSession(); confirmForm.reset(); deletePanel('email'); $('#delete-email').focus();
    status(deleteStatus, 'Deletion cancelled. Your Lane account has not been changed.');
  });
  window.addEventListener('pagehide', () => { accessToken = ''; accountEmail = ''; clearTimeout(expiryTimer); });
  window.addEventListener('pageshow', event => {
    if (event.persisted && emailForm) { accessToken = ''; accountEmail = ''; deletePanel('email'); codeForm.reset(); confirmForm.reset(); status(deleteStatus, 'Verify your email again to continue.'); }
  });
})();
