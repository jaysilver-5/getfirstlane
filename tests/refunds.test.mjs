import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const dist = new URL('../dist/', import.meta.url);

test('refund policy describes the actual one-time offer and Paddle route without inventing a guarantee', () => {
 const html = readFileSync(new URL('refunds.html', dist), 'utf8');
 assert.match(html, /Tervlon Labs Limited/);
 assert.match(html, /CA\$14\.99 once, plus applicable tax/);
 assert.match(html, /7-day cancellation window/);
 assert.match(html, /discretionary requests made within 14 days/);
 assert.match(html, /does not guarantee approval/);
 assert.match(html, /href="https:\/\/paddle.net"/);
 assert.match(html, /href="https:\/\/www.paddle.com\/legal\/refund-policy"/);
 assert.match(html, /href="https:\/\/www.paddle.com\/legal\/buyer-terms"/);
 assert.match(html, /does not itself delete your account/);
 assert.match(html, /does not request a refund/);
 assert.doesNotMatch(html, /all sales are final|no refunds|guaranteed refund|30-day money-back/i);
});

test('refund help is discoverable from every page, terms and support', () => {
 for (const file of readdirSync(dist).filter(x => x.endsWith('.html'))) {
  assert.match(readFileSync(new URL(file, dist), 'utf8'), /href="\/?refunds.html"/);
 }
 for (const file of ['terms.html', 'support.html']) {
  const html = readFileSync(new URL(file, dist), 'utf8');
  assert.match(html.slice(html.indexOf('<main'), html.indexOf('</main>')), /href="refunds.html"/);
 }
 const html = readFileSync(new URL('refunds.html', dist), 'utf8');
 assert.match(html, /rel="canonical" href="https:\/\/getfirstlane.com\/refunds"/);
});
