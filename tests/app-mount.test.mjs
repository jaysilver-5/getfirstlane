import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { config } from '../lib/config.mjs';
import { webActions } from '../src/shared.mjs';

test('app URLs use the approved main domain and include the account mount', () => {
  assert.equal(config.webAppUrl, 'https://getfirstlane.com/app');
  assert.equal(new URL(config.webAppUrl + '/account').pathname, '/app/account');
  const prior = config.webAppAvailable;
  try {
    config.webAppAvailable = true;
    assert.match(webActions(), /href="\/app"/);
    assert.match(webActions(), /href="\/app\/auth\/sign-in"/);
  } finally { config.webAppAvailable = prior; }
});

test('only the app namespace is proxied and marketing CSP stays scoped to marketing', () => {
  const host = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(host.rewrites.map(rule => rule.source), ['/app', '/app/:path*']);
  for (const rule of host.rewrites) assert.equal(new URL(rule.destination).hostname, 'project-n8lqe.vercel.app');
  const marketingHeaders = host.headers.find(rule => rule.headers.some(header => header.key === 'Content-Security-Policy'));
  const applies = new RegExp('^' + marketingHeaders.source + '$');
  for (const path of ['/', '/privacy', '/refunds', '/api/support', '/assets/icon.png', '/application']) assert.ok(applies.test(path), path);
  for (const path of ['/app', '/app/auth/sign-in', '/app/_expo/static/js/web/entry.js']) assert.equal(applies.test(path), false, path);
});
