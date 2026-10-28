import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { securityHeaders } from '../lib/security.mjs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('public/assets/google-tag.js', root), 'utf8');
function browser(saved = null, blocked = false) {
  const storage = new Map(saved === null ? [] : [['firstlane.ads-consent', saved]]);
  const handlers = new Map();
  const banner = { hidden: true, contains: button => button.inBanner };
  const status = { textContent: '' };
  const buttons = ['granted', 'denied'].map(value => ({
    dataset: { adsConsent: value }, inBanner: true,
    addEventListener: (event, callback) => handlers.set(value, callback)
  }));
  let ready;
  let focused = false;
  let cookies = '_gcl_aw=synthetic; firstlane_required=keep';
  const deletions = [];
  const window = {};
  const document = {
    addEventListener: (event, callback) => { ready = callback; },
    getElementById: id => id === 'ads-consent' ? banner : status,
    querySelectorAll: () => buttons,
    querySelector: () => ({ focus: () => { focused = true; } }),
    get cookie() { return cookies; },
    set cookie(value) { deletions.push(value); }
  };
  const localStorage = {
    getItem: key => { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (blocked) throw Error('blocked'); storage.set(key, value); }
  };
  runInNewContext(source, { window, document, localStorage, location: { hostname: 'www.getfirstlane.com' } });
  const commands = () => window.dataLayer.map(args => JSON.parse(JSON.stringify([...args])));
  ready();
  return { commands, banner, status, storage, deletions, click: value => handlers.get(value)(), focused: () => focused };
}

test('Google defaults deny storage before initialization and never grant personalization', () => {
  for (const saved of [null, 'denied', 'invalid']) {
    const b = browser(saved);
    assert.deepEqual(b.commands()[0], ['consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    }]);
    assert.deepEqual(b.commands()[1], ['set', 'ads_data_redaction', true]);
    assert.deepEqual(b.commands()[3], ['config', 'AW-16855601358', { allow_ad_personalization_signals: false }]);
    assert.equal(b.banner.hidden, saved === 'denied');
  }
});

test('allow and withdrawal persist choices and delete only Google Ads cookies', () => {
  const b = browser();
  b.click('granted');
  assert.equal(b.storage.get('firstlane.ads-consent'), 'granted');
  assert.equal(b.banner.hidden, true);
  assert.equal(b.focused(), true);
  assert.equal(b.commands().at(-1)[2].ad_storage, 'granted');
  assert.equal(b.commands().at(-1)[2].ad_personalization, 'denied');
  b.click('denied');
  assert.equal(b.commands().at(-1)[2].ad_storage, 'denied');
  assert.equal(b.storage.get('firstlane.ads-consent'), 'denied');
  assert.ok(b.deletions.some(cookie => cookie.includes('Domain=getfirstlane.com')));
  assert.ok(b.deletions.every(cookie => cookie.startsWith('_gcl_aw=; Max-Age=0;')));
  assert.match(b.status.textContent, /cookies are off/);
});

test('saved consent is applied before config and storage failure still permits a page choice', () => {
  const saved = browser('granted');
  assert.equal(saved.commands()[0][2].ad_storage, 'granted');
  assert.equal(saved.banner.hidden, true);
  const blocked = browser(null, true);
  blocked.click('granted');
  assert.equal(blocked.commands().at(-1)[2].ad_storage, 'granted');
  assert.equal(blocked.banner.hidden, true);
});

test('all generated pages load one tag after synchronous consent setup and both hosts allow it', () => {
  for (const file of readdirSync(new URL('dist/', root)).filter(file => file.endsWith('.html'))) {
    const html = readFileSync(new URL(`dist/${file}`, root), 'utf8');
    const setup = html.match(/<script src="([^"]*assets\/google\.[a-f0-9]{12}\.js)"><\/script>/);
    assert.ok(setup, file);
    assert.ok(html.indexOf(setup[0]) < html.indexOf('https://www.googletagmanager.com/gtag/js'));
    assert.equal((html.match(/gtag\/js\?id=AW-16855601358/g) || []).length, 1);
    assert.match(html, /data-ads-consent="denied"/);
  }
  const vercel = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf8'));
  const csp = vercel.headers.flatMap(entry => entry.headers).find(header => header.key === 'Content-Security-Policy').value;
  assert.equal(csp, securityHeaders['Content-Security-Policy']);
  assert.match(csp, /script-src [^;]*https:\/\/www.googletagmanager.com/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});
