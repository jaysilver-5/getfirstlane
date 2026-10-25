import { pricingSection } from './pricing.mjs';
import { readFileSync } from 'node:fs';
import { icon, webActions, faq, commonFAQ } from './shared.mjs';
const journey = readFileSync(new URL('./journey.html',import.meta.url),'utf8');
const ticks = list => `<ul class="feature-list">${list.map(t=>`<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>`;
export function home() { return `
<section class="hero wrap" aria-labelledby="hero-title">
 <div class="hero-copy"><div class="eyebrow"><span class="status-dot"></span> ONTARIO G1 PREP, AT YOUR PACE</div>
 <h1 id="hero-title">Get road<br><em>ready.</em></h1>
 <p class="hero-description">Prepare for your Ontario G1 with clear explanations, road signs and road rules. Create your free account to practise 40 questions and save your progress.</p>
 ${webActions()}
 <p class="hero-note conversion-disclosure">Independent study only. Not affiliated with MTO or DriveTest. No licences, applications, test bookings, government fees or pass guarantees.</p>
 </div>
 <div class="hero-scene" aria-label="FirstLane’s welcome screen and road artwork">
   <div class="scene-grid" aria-hidden="true"></div><div class="scene-orbit" aria-hidden="true"></div>
   <div class="scene-route"><span class="route-dot"></span> YOUR ROUTE <strong>Ontario G1</strong>${icon('arrowUp')}</div>
   <div class="hero-art">${journey}</div>
   <div class="hero-phone"><img src="assets/firstlane-welcome.webp" width="390" height="844" fetchpriority="high" alt="FirstLane welcome screen: The road ahead looks good on you. Create a free account or try 10 guest questions."></div>
   <div class="floating-note">${icon('spark')}<div><strong>A little practice.</strong><span>A whole new chapter.</span></div></div>
   <span class="scene-label">SMALL STEPS. REAL UNDERSTANDING.</span>
   <div class="scene-spark one" aria-hidden="true">✦</div><div class="scene-spark two" aria-hidden="true">✦</div>
 </div>
</section>
<div class="principles-band"><div class="wrap principles"><span>${icon('book')} Understand the why</span><span>${icon('clock')} Practise at your pace</span><span>${icon('refresh')} Learn from mistakes</span><span>${icon('lock')} One payment. No renewals.</span></div></div>
<section id="how" class="section wrap">
 <div class="section-heading split-heading"><div><div class="eyebrow">01 / FIND YOUR RHYTHM</div><h2>Less overwhelm.<br><em>More “I’ve got this.”</em></h2></div><p>You don’t need another endless list of questions. You need a little direction—and a reason to keep going.</p></div>
 <div class="steps-grid">
 <article class="step-card" data-reveal><div class="step-top"><span class="step-number">01</span>${icon('book')}</div><div class="mini-question" aria-hidden="true"><span class="mini-line"></span><span class="mini-line short"></span><div class="mini-answer"><span>A</span><i></i></div><div class="mini-answer selected"><span>B</span><i></i>${icon('check')}</div></div><h3>Create your free account.</h3><p>Verify your email to unlock 40 free questions: 20 road signs and 20 road rules. Save your progress as you practise.</p><a class="text-link" href="/app/auth/sign-up">Get started free ${icon('arrow')}</a></article>
 <article class="step-card" data-reveal><div class="step-top"><span class="step-number">02</span>${icon('spark')}</div><div class="mini-explanation" aria-hidden="true"><span class="mini-check">${icon('check')}</span><strong>Now that makes sense.</strong><span class="mini-line"></span><span class="mini-line short"></span></div><h3>Make it click.</h3><p>Go beyond a right or wrong answer. Clear explanations help you understand the rule behind the question.</p><span class="step-foot">Understanding beats memorising.</span></article>
 <article class="step-card" data-reveal><div class="step-top"><span class="step-number">03</span>${icon('flag')}</div><div class="mini-journey" aria-hidden="true"><span>${icon('book')}</span><i></i><span>${icon('refresh')}</span><i></i><span>${icon('flag')}</span></div><h3>Find your way forward.</h3><p>See what needs another look. With Complete, turn mistakes into focused practice and build your test-day confidence.</p><span class="step-foot">One useful step at a time.</span></article>
 </div>
</section>
<section id="inside" class="inside-section">
 <div class="wrap inside-layout"><div class="inside-art-panel"><span class="eyebrow">MADE TO FEEL LIKE PROGRESS</span><div class="inside-art">${journey.replaceAll('id="','id="inside-').replaceAll('url(#','url(#inside-')}</div><div class="journey-caption"><span class="route-dot"></span><span>Your pace. Your path.</span><strong>Keep going ↗</strong></div></div>
 <div class="inside-content"><div class="eyebrow">02 / THE WAY FIRSTLANE WORKS</div><h2>Small sessions.<br><em>A bigger picture.</em></h2><p class="inside-lead">A study routine that feels less like a chore, and more like getting somewhere.</p>
 <div class="study-tabs" role="tablist" aria-label="Explore FirstLane’s study features"><button type="button" role="tab" aria-selected="true" aria-controls="panel-practise" id="tab-practise" tabindex="0">Practise</button><button type="button" role="tab" aria-selected="false" aria-controls="panel-understand" id="tab-understand" tabindex="-1">Understand</button><button type="button" role="tab" aria-selected="false" aria-controls="panel-progress" id="tab-progress" tabindex="-1">Progress</button></div>
 <div class="study-panel" role="tabpanel" id="panel-practise" aria-labelledby="tab-practise" tabindex="0"><div class="panel-icon">${icon('book')}</div><h3>A little practice, whenever it fits.</h3><p>Work through Ontario road rules and signs. Pick a topic, revisit a bookmark, or settle into a full mock session with Complete.</p><span class="panel-meta">FOCUSED TOPICS <span>•</span> MOCK SESSIONS <span>•</span> BOOKMARKS</span></div>
 <div class="study-panel" role="tabpanel" id="panel-understand" aria-labelledby="tab-understand" tabindex="0" hidden><div class="panel-icon">${icon('spark')}</div><h3>Learn the reason. Not just the answer.</h3><p>Explanations give each answer context. Mistake review helps you return to the things that need a little more attention.</p><span class="panel-meta">CLEAR EXPLANATIONS <span>•</span> MISTAKE REVIEW</span></div>
 <div class="study-panel" role="tabpanel" id="panel-progress" aria-labelledby="tab-progress" tabindex="0" hidden><div class="panel-icon">${icon('chart')}</div><h3>See where your practice is taking you.</h3><p>Keep your study history together. Sync progress when you’re online and use it to decide what deserves your next session.</p><span class="panel-meta">SAVED HISTORY <span>•</span> FOCUSED REVISION</span></div>
 </div></div>
</section>
<section id="practice-sample" class="practice-sample section" aria-labelledby="practice-sample-title">
 <div class="wrap sample-layout">
  <div class="sample-intro"><div class="eyebrow">03 / TRY A SHORT STUDY SESSION</div><h2 id="practice-sample-title">Five questions.<br><em>Clear explanations.</em></h2><p>Try an original FirstLane learning activity in your browser. These are practice prompts, not official or live exam questions, and the result is not a prediction of your G1 result.</p><a class="text-link" href="https://www.ontario.ca/document/official-mto-drivers-handbook/signs" target="_blank" rel="noopener noreferrer">Check the current Ontario handbook ${icon('arrowUp')}</a></div>
  <form class="sample-quiz" id="sample-quiz">
   ${[
    ['A red, eight-sided sign marked STOP means:', ['Slow down only if traffic is nearby','Come to a complete stop','Stop only when another vehicle is visible'], 1, 'A STOP sign requires a complete stop. Check that the way is clear before proceeding.'],
    ['An inverted triangle with a red border means:', ['Yield to conflicting traffic','You always have priority','The road is closed'], 0, 'A yield sign tells you to give the right-of-way and stop when necessary.'],
    ['An X-shaped crossbuck beside the road warns of:', ['A hospital entrance','A railway crossing','A place to overtake'], 1, 'A crossbuck identifies a railway crossing. Check both directions and obey any signals.'],
    ['A DO NOT ENTER sign means:', ['Enter only at low speed','Do not enter from this direction','Trucks only'], 1, 'Do not enter from that direction. Choose another lawful route.'],
    ['An official bicycle-route sign tells drivers to:', ['Expect cyclists and share the road','Use the sidewalk','Treat the whole road as bicycle-only'], 0, 'The sign alerts drivers that cyclists may be present; it does not by itself exclude motor vehicles.']
   ].map((q,i)=>`<fieldset class="quiz-question" data-question><legend><span>${String(i+1).padStart(2,'0')}</span>${q[0]}</legend><div class="quiz-options">${q[1].map((answer,j)=>`<button type="button" class="quiz-option" data-correct="${j===q[2]}">${answer}</button>`).join('')}</div><p class="quiz-feedback" data-feedback hidden>${q[3]}</p></fieldset>`).join('')}
   <div class="quiz-summary" aria-live="polite"><div><span class="eyebrow">YOUR PRACTICE RESULT</span><strong id="quiz-score">Answer all five when you’re ready.</strong></div><button type="reset" class="button outline" id="quiz-reset">Try again</button></div>
   <div class="sample-next-step"><div><h3>Keep your practice going.</h3><p>Create a free account for 40 questions, clear explanations and saved progress.</p></div><a class="button dark" href="/app/auth/sign-up">Create my free account ${icon('arrow')}</a><span>No card needed. Free access has no time limit.</span></div>
   <p class="quiz-source">Learning content is based on the current Ontario driver’s handbook. FirstLane is independent and is not affiliated with MTO or DriveTest.</p>
  </form>
 </div>
</section>
<section class="section wrap details-section"><div class="section-heading centered"><div class="eyebrow">A LITTLE MORE THOUGHT IN EVERY DETAIL</div><h2>Made for real life.<br><em>Not just test day.</em></h2></div><div class="detail-grid">
 <article class="detail-card" data-reveal><div class="detail-icon">${icon('wifi')}</div><h3>Take your practice with you.</h3><p>Practise in your browser on your phone, tablet or computer. Sign in to keep your study progress together. An internet connection is required.</p><span class="card-tag">NO DOWNLOAD NEEDED</span></article>
 <article class="detail-card" data-reveal><div class="detail-icon peach">${icon('heart')}</div><h3>A calmer place to learn.</h3><p>Short sessions, clear language and a gentle pace. Make a mistake, understand it, and try again.</p><span class="card-tag">PROGRESS WITHOUT THE PRESSURE</span></article>
 <article class="detail-card" data-reveal><div class="detail-icon lavender">${icon('shield')}</div><h3>Your account. Your choice.</h3><p>Plain-language privacy information, purchase help and a clear route to delete your account.</p><a class="text-link" href="privacy.html">Your privacy, explained ${icon('arrowUp')}</a></article>
 </div></section>
${pricingSection()}
<section class="independence wrap"><div class="independence-icon">${icon('flag')}</div><div><div class="eyebrow">CONFIDENCE, WITHOUT THE BIG CLAIMS</div><h2>Your study companion.<br>Not a licensing service.</h2></div><p>FirstLane is independent Ontario G1 preparation. We are not affiliated with MTO or DriveTest. We do not issue licences, submit applications, book tests or appointments, collect government fees, provide official exam questions, or promise a pass.</p></section>
<section id="faq" class="section wrap faq-section"><div class="faq-heading"><div class="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</div><h2>A little clarity<br><em>before you start.</em></h2><p>Still wondering about something?</p><a class="text-link" href="support.html">Let’s get it sorted ${icon('arrowUp')}</a></div>${faq(commonFAQ)}</section>
<section id="download" class="download-section wrap"><div class="download-card"><div class="download-content"><div class="eyebrow">YOUR NEXT STEP</div><h2>Ready for your<br><em>first session?</em></h2><p>Create your free account, verify your email and start practising Ontario G1 road rules and signs.</p>${webActions(true)}<span class="download-note">Already have an account? <a href="/app/auth/sign-in">Sign in</a></span></div><div class="download-road" aria-hidden="true"><img src="assets/road.svg" width="480" height="280" alt="" loading="lazy"></div><div class="download-stamp" aria-hidden="true">LET’S<br>GO <span>↗</span></div></div></section>`; }
