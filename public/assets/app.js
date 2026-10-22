/* Progressive enhancement only: navigation, content and prices render without JavaScript. */
(() => {
  'use strict';
  const config = window.FIRSTLANE || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('firstlane.motion') === 'paused'; } catch { /* Storage is optional. */ }
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
    try { localStorage.setItem('firstlane.motion', userPaused ? 'paused' : 'playing'); } catch { /* Private browsing is supported. */ }
    updateMotion();
  }));
  reduced.addEventListener('change', updateMotion);
  updateMotion();
  $('#reset-preferences')?.addEventListener('click', () => {
    try { localStorage.removeItem('firstlane.motion'); } catch { /* no-op */ }
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

  const sampleQuiz = $('#sample-quiz');
  if (sampleQuiz) {
    const questions = $$('[data-question]', sampleQuiz);
    const score = $('#quiz-score');
    questions.forEach(question => {
      $$('.quiz-option', question).forEach(option => option.addEventListener('click', () => {
        if (question.dataset.answered === 'true') return;
        question.dataset.answered = 'true';
        const correct = option.dataset.correct === 'true';
        option.classList.add(correct ? 'correct' : 'incorrect');
        option.setAttribute('aria-pressed', 'true');
        $$('.quiz-option', question).forEach(button => {
          button.disabled = true;
          if (button.dataset.correct === 'true') button.classList.add('correct-answer');
        });
        const feedback = $('[data-feedback]', question);
        feedback.hidden = false;
        feedback.classList.toggle('needs-review', !correct);
        const answered = questions.filter(item => item.dataset.answered === 'true').length;
        const total = questions.filter(item => $('.quiz-option.correct', item)).length;
        score.textContent = answered === questions.length ? `${total} of ${questions.length} correct. Review the explanations, then try again.` : `${answered} of ${questions.length} answered.`;
      }));
    });
    sampleQuiz.addEventListener('reset', () => requestAnimationFrame(() => {
      questions.forEach(question => {
        delete question.dataset.answered;
        $('[data-feedback]', question).hidden = true;
        $$('.quiz-option', question).forEach(option => {
          option.disabled = false; option.removeAttribute('aria-pressed');
          option.classList.remove('correct', 'incorrect', 'correct-answer');
        });
      });
      score.textContent = 'Answer all five when you’re ready.';
      $('.quiz-option', questions[0])?.focus();
    }));
  }

  // No advertising/analytics SDK is installed. Store links work as ordinary links.
  // Form requests use same-origin, authenticated server handlers. No privileged keys in this file.
  function status(node, text, error = false) {
    if (!node) return;
    node.textContent = text; node.classList.toggle('error', error);
  }
  async function api(path, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(path, {
        method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'This request could not be completed. Please try again shortly.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The connection timed out. Please check your connection and try again.');
      if (error instanceof TypeError) throw new Error('We couldn’t reach FirstLane. Check your connection and try again.');
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
    if (!config.formsEnabled) throw new Error('This form is currently unavailable. Email support@getfirstlane.com for help, including an account-deletion request.');
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
      status(messageNode, 'This form is currently unavailable. Email support@getfirstlane.com for help, including an account-deletion request.');
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
      support.reset(); status(supportStatus, 'Your message has been accepted for delivery to FirstLane support. We’ll reply to the email address you provided.');
    } catch (error) { status(supportStatus, error.message, true); }
    finally { resetCaptcha('support'); busy(support, false); }
  });

})();
