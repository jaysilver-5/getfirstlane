import { config, priceLabel } from '../lib/config.mjs';
import { icon, escape } from './shared.mjs';

const features = items => `<ul class="feature-list">${items.map(item=>`<li>${icon('check')}<span>${item}</span></li>`).join('')}</ul>`;

export function pricingSection({ standalone = false } = {}) {
 const title = standalone ? 'h1' : 'h2';
 const cardTitle = standalone ? 'h2' : 'h3';
 return `<section id="pricing" class="pricing-section ${standalone?'pricing-page ':''}section"><div class="wrap">
 <div class="section-heading centered ${standalone?'page-heading':''}"><div class="eyebrow">FIRSTLANE PRICING</div><${title}>Start free.<br><em>Build your confidence.</em></${title}><p>40 free Ontario G1 questions. No card, no subscription trial. Create your account and start practising.</p></div>
 <div class="pricing-grid">
 <article class="price-card free-card"><span class="price-tag">START HERE · FREE ACCOUNT</span><${cardTitle}>FirstLane Free</${cardTitle}><div class="price"><span class="currency">CA$</span>0<span class="price-period">no payment details</span></div><p>40 free questions in total after email verification, including the guest 10.</p>${features(['20 road signs + 20 road rules','Clear explanations for every answer','Saved questions and synced progress','Choose 5, 10, 20 or 40 questions per session','Unlimited repeats of the same free question set'])}<a href="/app/auth/sign-up" class="button dark">Create my free account ${icon('arrow')}</a><p class="price-fine">Free access has no time limit. Prefer to explore first? <a href="/app">Try 10 guest questions</a>.</p></article>
 <article class="price-card complete-card"><div class="complete-tag">EXPLORE THE FULL ONTARIO PACK ${icon('spark')}</div><${cardTitle}>Ontario G1 Complete</${cardTitle}><div class="price"><span class="currency">CA$</span>14<span class="price-decimal">.99</span></div><div class="once-label"><span class="status-dot"></span> One payment, plus applicable tax. No subscription.</div><p class="plan-availability">Public paid purchases are not yet open. You can start free now and explore Complete in the app.</p>${features(['500 Ontario questions in the Complete bank','Keep going practice until you choose to finish','Optional fixed sessions of 5, 10, 20, 40 or 60 questions','Focused topics, mock tests, mistake review and bookmarks','Browser access on phone, tablet and computer','No scheduled expiry on valid, non-refunded Ontario access'])}<a href="/app/plans" class="button lime">Explore G1 Complete ${icon('arrow')}</a><p class="price-fine">${priceLabel} is the Canadian-dollar base price. Paddle calculates applicable tax from your billing location and shows the total before you pay. Future jurisdictions are separate purchases. An internet connection is required. <a href="refunds.html">Read the refund policy</a>.</p></article>
 </div><div class="pricing-reassurance"><span>${icon('lock')} No card for free access</span><span>${icon('check')} No automatic renewal</span><span>${icon('refresh')} Practise at your own pace</span></div>
 <p>FirstLane is operated by ${escape(config.operatorLegalName)}, registered in ${escape(config.operatorCountry)}. It serves Ontario learners in Canada and is not affiliated with MTO or DriveTest. iOS and Android apps are coming soon.</p>
 <p><a href="terms.html">Terms of service</a> · <a href="privacy.html">Privacy policy</a> · <a href="refunds.html">Refund policy</a> · <a href="support.html">Contact support</a></p>
 </div></section>`;
}

export function pricing() { return pricingSection({ standalone: true }); }
