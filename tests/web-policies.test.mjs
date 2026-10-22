import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

test('homepage and pricing disclose the same future offer and have no unavailable app/payment links', () => {
 for (const page of ['index','pricing']) {
  const html = read(`dist/${page}.html`);
  assert.match(html, /Web launch in preparation/);
  assert.match(html, /paid purchases are not yet open/i);
  assert.match(html, /CA\$14\.99 is the Canadian-dollar base price/);
  assert.match(html, /plus applicable tax/);
  assert.match(html, /40 free questions in total/);
  assert.match(html, /requires content approval before public sale/);
  assert.match(html, /Keep going practice until you choose to finish/);
  assert.match(html, /href="index.html#practice-sample"/);
  assert.doesNotMatch(html, /href="https:\/\/app\.getfirstlane\.com|No web checkout|Purchase through Apple or Google|OFFLINE STUDY WITH COMPLETE/);
 }
 const pricing = read('dist/pricing.html');
 assert.equal((pricing.match(/<h1(?: |>)/g)||[]).length, 1);
 assert.match(pricing, /rel="canonical" href="https:\/\/getfirstlane.com\/pricing"/);
});

test('public policies identify the actual company/country, web providers and Paddle purchase terms', () => {
 for (const page of ['terms','privacy']) {
  const html = read(`dist/${page}.html`);
  assert.match(html, /Tervlon Labs Limited/);
  assert.match(html, /registered in Nigeria/);
  assert.match(html, /Ontario learners in Canada/);
  assert.match(html, /October 23, 2026/);
  assert.doesNotMatch(html, /Operator details will be published|Store publisher and seller details will be confirmed|Supabase handles authentication|RevenueCat|Purchases take place inside the app through Apple or Google/);
 }
 const terms=read('dist/terms.html'), privacy=read('dist/privacy.html');
 assert.match(terms, /href="https:\/\/www.paddle.com\/legal\/buyer-terms"/);
 assert.match(terms, /href="refunds.html"/);
 assert.match(terms, /paid purchases are being prepared for web launch/);
 assert.match(privacy, /Clerk handles web authentication/);
 assert.match(privacy, /Vercel hosts this public website/);
 assert.match(privacy, /Canadian-only processing or storage is not promised/);
 assert.doesNotMatch(privacy, /removed within \d+ days|backups age out within \d+ days/);
});

test('inactive forms and account controls accurately match the privacy policy', () => {
 const support=read('dist/support.html'), account=read('dist/delete-account.html');
 assert.match(support, /website contact form is not currently available/);
 assert.match(support, /mailto:support@getfirstlane.com/);
 assert.doesNotMatch(support, /id="support-form"/);
 assert.match(account, /public FirstLane web app is not open for account creation yet/);
 assert.doesNotMatch(account, /delete-email-form|delete-code-form|href="https:\/\/app.getfirstlane.com/);
 for (const file of readdirSync(new URL('dist/assets/',root)).filter(x=>x.endsWith('.js'))) {
  assert.doesNotMatch(read('dist/assets/'+file), /\/api\/account|send-code|verify-code/);
 }
 const config=JSON.parse(read('site.config.json'));
 assert.equal(config.webAppAvailable,false);
 for(const value of Object.values(config.approvals))assert.equal(value,false);
});

test('published structured metadata is covered by the exact CSP hash in Vercel and local serving', () => {
 const metadata=read('dist/index.html').match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1];
 const hash=createHash('sha256').update(metadata).digest('base64');
 const vercel=JSON.parse(read('vercel.json'));
 const header=vercel.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;
 assert.ok(header.includes(`'sha256-${hash}'`));
 assert.ok(read('lib/security.mjs').includes(hash));
 assert.doesNotMatch(header, /unsafe-inline/);
});
