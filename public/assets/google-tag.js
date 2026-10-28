// Run synchronously before gtag.js so consent defaults precede every Google command.
(() => {
  'use strict';
  const key = 'firstlane.ads-consent';
  let choice = null;
  try { choice = localStorage.getItem(key); } catch { /* Storage is optional. */ }
  if (!['granted', 'denied'].includes(choice)) choice = null;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const consent = value => ({
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });
  window.gtag('consent', 'default', consent(choice || 'denied'));
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('js', new Date());
  window.gtag('config', 'AW-16855601358', { allow_ad_personalization_signals: false });

  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('ads-consent');
    const status = document.getElementById('ads-consent-status');
    function render() {
      banner.hidden = choice !== null;
      if (status) status.textContent = choice === 'granted'
        ? 'Advertising measurement cookies are allowed. Personalized advertising is disabled.'
        : 'Advertising measurement cookies are off. Google receives limited cookieless measurements.';
    }
    document.querySelectorAll('[data-ads-consent]').forEach(button => {
      button.addEventListener('click', () => {
        choice = button.dataset.adsConsent === 'granted' ? 'granted' : 'denied';
        window.gtag('consent', 'update', consent(choice));
        try { localStorage.setItem(key, choice); } catch { /* Apply for this page even without storage. */ }
        render();
        // Removing consent stops further use; remove first-party Google Ads cookies too.
        if (choice === 'denied') {
          const host = location.hostname.split('.');
          for (const cookie of document.cookie.split(';')) {
            const name = cookie.trim().split('=')[0];
            if (!name.startsWith('_gcl_')) continue;
            document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
            for (let i = 0; i < host.length - 1; i++) {
              document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${host.slice(i).join('.')}; SameSite=Lax`;
            }
          }
        }
        if (banner.contains(button)) document.querySelector('main')?.focus({ preventScroll: true });
      });
    });
    render();
  });
})();
