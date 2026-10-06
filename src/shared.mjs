import { config as c, priceLabel } from '../lib/config.mjs';
export const escape = s => String(s ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const paths = {
 arrow:'M5 12h14m-6-6 6 6-6 6', arrowUp:'M6 18 18 6M6 6h12v12', check:'m5 12 4 4L19 6',
 book:'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V6',
 flag:'M5 21V4c5-5 9 5 14 0v10c-5 5-9-5-14 0',
 clock:'M12 8v5l3 2', refresh:'M20 7v5h-5M4 17v-5h5M5.3 7a8 8 0 0 1 13-2L20 8M4 16l1.7 3a8 8 0 0 0 13-2',
 lock:'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',
 chart:'M5 20V13m7 7V8m7 12V3', heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 phone:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h4',
 mail:'M3 5h18v14H3zM3 5l9 7 9-7', trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
 shield:'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Zm-5 10 3 3 7-7',
 wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0M12 20h.01',
 spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
 plus:'M12 5v14M5 12h14', close:'m6 6 12 12M6 18 18 6', menu:'M4 7h16M4 12h16M4 17h16',
 pause:'M9 5v14M15 5v14', play:'m8 4 12 8-12 8Z', help:'M9 9a3 3 0 1 1 5 2c-1 1-2 1-2 3m0 3v.1'
};
export function icon(name, cls='') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${['clock','help'].includes(name)?'<circle cx="12" cy="12" r="10"/>':''}<path d="${paths[name]||paths.arrow}"/></svg>`; }
export const brand = `<a class="brand" href="index.html" aria-label="Lane home"><img src="assets/logo.svg" width="34" height="34" alt=""><span>lane.</span></a>`;
export const operator = () => escape(c.operatorLegalName || c.operatorDisplayName);
export function stores(location='hero', invert=false) {
 return `<div class="store-links ${invert?'inverse':''}" aria-label="Get the Lane app">${[['appStoreUrl','App Store','iPhone'],['googlePlayUrl','Google Play','Android']].map(([key,label,platform]) => c[key] ? `<a class="store-button" href="${escape(c[key])}" data-store="${key}" data-location="${location}" target="_blank" rel="noopener noreferrer"><span class="store-icon">${icon('phone')}</span><span><small>Get Lane for ${platform}</small><strong>${label}</strong></span>${icon('arrowUp')}</a>` : `<span class="store-button upcoming" role="status"><span class="store-icon">${icon('phone')}</span><span><small>${platform}</small><strong>Coming soon</strong></span></span>`).join('')}</div>`;
}
export function faq(items) { return `<div class="faq-list">${items.map(([q,a],i)=>`<details class="faq-item"><summary>${q}<span class="faq-plus">${icon('plus')}</span></summary><div class="faq-answer">${a}</div></details>`).join('')}</div>`; }
export const commonFAQ = [
 ['Can I try Lane for free?', '<p>Yes. Explore 10 guest questions, or create a free account in the app for a fixed set of 40 Ontario practice questions, explanations and saved progress. There is no free-trial countdown.</p>'],
 ['Is '+priceLabel+' a subscription?', '<p>No. Ontario G1 Complete is a <strong>'+priceLabel+' one-time in-app purchase</strong>. There is no automatic renewal and no scheduled expiry on your Ontario pack. Apple or Google displays the final local price and any applicable taxes before you pay.</p>'],
 ['What does Ontario G1 Complete include?', '<p>The Ontario practice pack, focused topic practice, full mock sessions, mistake review, bookmarks and offline study after the pack is downloaded. Future jurisdictions are separate packs, not part of this purchase.</p>'],
 ['Can I study without an internet connection?', '<p>Downloaded study content can be used offline. You will still need a connection for account actions, purchases, downloads, syncing progress and periodic access checks. See the app for access-check requirements.</p>'],
 ['Is Lane the official Ontario G1 test?', '<p>No. Lane is an independent study tool, not an official test, government service or driving school. It is not affiliated with Ontario’s Ministry of Transportation or DriveTest. Practice results are not a guarantee of passing.</p>'],
 ['How do I restore a purchase or delete my account?', '<p>Purchase-restoration guidance is in <a href="support.html#purchases">Support</a>. You can initiate deletion in the app, or visit <a href="delete-account.html">Delete account</a> without reinstalling Lane. Deletion does not automatically request a store refund.</p>']
];
export function layout({ title, description, body, slug='', active='', noindex=false, assets }) {
 const url = c.siteUrl ? c.siteUrl + (slug ? '/'+slug : '/') : '';
 const effective = new Date(c.effectiveDate+'T12:00:00Z').toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'});
 return `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#F6F5EF"><meta name="color-scheme" content="light"><meta name="description" content="${escape(description)}"><meta name="robots" content="${noindex?'noindex, nofollow':'index, follow'}"><title>${escape(title)}</title>${url?`<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">`:''}<meta property="og:type" content="website"><meta property="og:site_name" content="Lane"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${c.siteUrl?`<meta property="og:image" content="${escape(c.siteUrl)}/assets/social-card.png"><meta name="twitter:image" content="${escape(c.siteUrl)}/assets/social-card.png">`:''}<meta name="twitter:card" content="summary_large_image"><meta property="og:locale" content="en_CA"><link rel="icon" type="image/svg+xml" href="assets/logo.svg"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png"><link rel="stylesheet" href="${assets.css}"><script defer src="${assets.config}"></script><script defer src="${assets.js}"></script></head>
<body data-page="${slug||'home'}"><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap header-inner">${brand}<nav class="desktop-nav" aria-label="Main navigation"><a href="index.html#how">How it works</a><a href="index.html#inside">Inside Lane</a><a href="index.html#pricing">Pricing</a><a href="support.html" ${active==='support'?'aria-current="page"':''}>Support</a></nav><div class="nav-actions"><a href="index.html#download" class="button small dark nav-cta">Get Lane ${icon('arrowUp')}</a><button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}</button></div></div><nav id="mobile-nav" class="mobile-nav wrap" aria-label="Mobile navigation" hidden><a href="index.html#how">How it works</a><a href="index.html#inside">Inside Lane</a><a href="index.html#pricing">Pricing</a><a href="support.html">Support</a><a href="index.html#download">Get Lane</a></nav></header>
<main id="main">${body}</main>
<footer class="site-footer"><div class="wrap"><div class="footer-top"><div class="footer-intro">${brand}<p>A little practice.<br>A whole new chapter.</p><span class="operator-credit">A ${escape(c.operatorDisplayName)} product.</span></div><div class="footer-column"><h2>Find your way</h2><a href="index.html#how">How it works</a><a href="index.html#pricing">Pricing</a><a href="index.html#download">Get the app</a><a href="support.html">Support</a></div><div class="footer-column"><h2>Your peace of mind</h2><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms of service</a><a href="delete-account.html">Delete account</a><a href="cookies.html">Cookies &amp; preferences</a></div><div class="footer-last"><span class="tiny-label">MADE FOR YOUR NEXT CHAPTER</span><span class="footer-mark" aria-hidden="true">↗</span></div></div><div class="footer-bottom"><p>© ${new Date(c.effectiveDate).getUTCFullYear()} ${operator()}.<br>Lane is independent preparation, not affiliated with Ontario’s Ministry of Transportation or DriveTest. No pass guarantees.</p><button class="motion-control" type="button" aria-pressed="false">${icon('pause')}<span>Pause animations</span></button></div></div></footer>
<div id="global-status" class="sr-only" role="status" aria-live="polite"></div>
</body></html>`;
}
