import { config, priceLabel } from '../lib/config.mjs';
import { icon, escape } from './shared.mjs';

const features = items => `<ul class="feature-list">${items.map(item=>`<li>${icon('check')}<span>${item}</span></li>`).join('')}</ul>`;

export function pricingSection({ standalone = false } = {}) {
 const title = standalone ? 'h1' : 'h2';
 const cardTitle = standalone ? 'h2' : 'h3';
 return `<section id="pricing" class="pricing-section ${standalone?'pricing-page ':''}section"><div class="wrap">
 <div class="section-heading centered ${standalone?'page-heading':''}"><div class="eyebrow">FIRSTLANE PRICING</div><${title}>Your pace.<br><em>One clear price.</em></${title}><p>Independent Ontario G1 study software. Free practice and an optional one-time upgrade.</p></div>
 <div class="policy-intro" role="status"><strong>Web launch in preparation.</strong><p>Account-based practice and paid purchases are not yet open to the public. You can <a href="index.html#practice-sample">try five sample questions now</a>. The prices and features below describe the planned web offer.</p></div>
 <div class="pricing-grid">
 <article class="price-card free-card"><span class="price-tag">PLANNED FREE ACCESS</span><${cardTitle}>FirstLane Free</${cardTitle}><div class="price"><span class="currency">CA$</span>0<span class="price-period">no payment details</span></div><p>40 free questions in total after email verification, including the guest 10.</p>${features(['10 fixed guest questions before signup','40 fixed account questions: 20 signs + 20 rules','Unlimited repeats of your available questions','Choose 5, 10, 20 or 40 questions with a free account','Explanations, saved questions and synced progress'])}<a href="index.html#practice-sample" class="button outline">Try the five-question sample ${icon('arrowUp')}</a></article>
 <article class="price-card complete-card"><div class="complete-tag">PLANNED ONTARIO UPGRADE ${icon('spark')}</div><${cardTitle}>Ontario G1 Complete</${cardTitle}><div class="price"><span class="currency">CA$</span>14<span class="price-decimal">.99</span></div><div class="once-label"><span class="status-dot"></span> One payment, plus applicable tax. No subscription.</div><p>The planned 500-question bank requires content approval before public sale.</p>${features(['500 Ontario questions after the approved release','Keep going practice until you choose to finish','Optional fixed sessions of 5, 10, 20, 40 or 60 questions','Focused topics, mock tests, mistake review and bookmarks','Browser access on phone, tablet and computer','No scheduled expiry on valid, non-refunded Ontario access'])}<p class="price-fine">${priceLabel} is the Canadian-dollar base price. When checkout launches, Paddle will calculate applicable tax from your billing location and show the total before you pay. Future jurisdictions are separate purchases. The web app requires an internet connection.</p><a href="refunds.html" class="button lime">Read the refund policy ${icon('arrowUp')}</a></article>
 </div><div class="pricing-reassurance"><span>${icon('lock')} Web payments through Paddle at launch</span><span>${icon('check')} No automatic renewal</span><span>${icon('refresh')} Purchase help and refunds</span></div>
 <p>FirstLane is operated by ${escape(config.operatorLegalName)}, registered in ${escape(config.operatorCountry)}. It serves Ontario learners in Canada and is not affiliated with MTO or DriveTest. iOS and Android apps are coming soon.</p>
 <p><a href="terms.html">Terms of service</a> · <a href="privacy.html">Privacy policy</a> · <a href="refunds.html">Refund policy</a> · <a href="support.html">Contact support</a></p>
 </div></section>`;
}

export function pricing() { return pricingSection({ standalone: true }); }
