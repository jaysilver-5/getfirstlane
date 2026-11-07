import { activeQuestions, cleanAnswers, SURVEY_VERSION } from './survey-model.js';
const root = document.getElementById('survey-content');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let answers = {}, step = 0, submitting = false;
// Keep only the submission ID / receipt in session storage; never persist answers or email.
let responseId;
try { responseId = sessionStorage.getItem('firstlane-survey-id'); } catch {}
if (!/^[0-9a-f-]{36}$/.test(responseId || '')) responseId = crypto.randomUUID();
try { sessionStorage.setItem('firstlane-survey-id', responseId); } catch {}
function success() {
  root.innerHTML = '<div class="success" tabindex="-1"><div class="success-icon" aria-hidden="true">✓</div><span class="eyebrow">FEEDBACK RECEIVED</span><h2>Thanks for helping us<br>find the way forward.</h2><p>We’ll use your feedback to decide what to improve next. Your time means a lot to our small team.</p><a class="primary" href="https://getfirstlane.com">Back to FirstLane ↗</a></div>';
  root.querySelector('.success').focus({preventScroll:true});
}
function render(focus = true) {
  const qs = activeQuestions(answers), q = qs[step];
  root.innerHTML = `<div class="step-meta"><span>QUESTION ${step + 1} OF ${qs.length}</span><span class="optional">${q.kind || q.optional ? 'Optional' : q.multiple ? 'Choose all that apply' : 'Choose one'}</span></div><div class="progress" role="progressbar" aria-label="Survey progress" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${step}"><span></span></div><form novalidate><fieldset><legend tabindex="-1">${esc(q.title)}</legend><p class="hint" id="question-hint">${esc(q.hint)}</p>${q.kind ? q.kind === 'email' ? `<input type="email" name="answer" aria-label="Your email (optional)" aria-describedby="question-hint" autocomplete="email" maxlength="254" placeholder="you@example.com" value="${esc(answers[q.id] || '')}"><p class="reassurance">Leaving this blank is completely fine.</p>` : `<textarea name="answer" aria-label="Your answer (optional)" aria-describedby="question-hint" maxlength="1500" placeholder="Your feedback…">${esc(answers[q.id] || '')}</textarea>` : `<div class="options">${q.options.map(([value, label]) => `<label class="choice"><input type="${q.multiple ? 'checkbox' : 'radio'}" name="answer" value="${value}" ${q.multiple ? (answers[q.id] || []).includes(value) ? 'checked' : '' : answers[q.id] === value ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div>`}</fieldset><div class="trap" aria-hidden="true"><label>Leave this field empty<input name="company" tabindex="-1" autocomplete="off"></label></div><p id="survey-error" class="error" role="alert"></p><div class="actions"><button type="button" class="secondary" id="back">${step ? '← Back' : ''}</button><button type="submit" class="primary">${step === qs.length - 1 ? 'Send feedback ↗' : 'Continue →'}</button></div></form>`;
  // CSP disallows inline styles; set the progress width through the CSSOM.
  root.querySelector('.progress span').style.width = `${Math.round(step / qs.length * 100)}%`;
  const form = root.querySelector('form'), error = root.querySelector('#survey-error');
  const read = () => q.kind ? form.elements.answer.value : q.multiple ? [...form.querySelectorAll('input[name=answer]:checked')].map(e => e.value) : form.querySelector('input[name=answer]:checked')?.value;
  if (!step) root.querySelector('#back').hidden = true;
  root.querySelector('#back').addEventListener('click', () => { answers[q.id] = read(); step--; render(); });
  if (q.id === 'friction') form.addEventListener('change', e => {
    if (e.target.name !== 'answer' || !e.target.checked) return;
    const exclusive = ['none', 'not_used'];
    for (const input of form.querySelectorAll('input[name=answer]')) if (input !== e.target && (exclusive.includes(e.target.value) || exclusive.includes(input.value))) input.checked = false;
  });
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (submitting) return;
    const value = read();
    if (!q.kind && !q.optional && (!value || (Array.isArray(value) && !value.length))) { error.textContent = 'Choose an answer to continue.'; return; }
    if (q.kind === 'email' && value && !form.elements.answer.validity.valid) { error.textContent = 'Enter a valid email, or leave it blank.'; return; }
    answers[q.id] = value;
    if (step < activeQuestions(answers).length - 1) { step++; render(); return; }
    let payload;
    try { payload = cleanAnswers(answers); } catch (err) { error.textContent = err.message; return; }
    submitting = true;
    const button = form.querySelector('[type=submit]'); button.disabled = true; button.textContent = 'Sending…'; error.textContent = '';
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/survey', { method: 'POST', credentials: 'omit', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id:responseId, version:SURVEY_VERSION, answers:payload, company:form.elements.company.value}), signal:controller.signal });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) throw new Error(result.message || 'We couldn’t save your feedback. Please try again.');
      try { sessionStorage.setItem('firstlane-survey-sent', responseId); } catch {}
      answers = {}; success();
    } catch (err) { error.textContent = err.name === 'AbortError' ? 'This is taking longer than expected. Your answers are still here. Please try again.' : 'We couldn’t save your feedback. Your answers are still here. Please try again, or email support@getfirstlane.com.'; button.disabled = false; button.textContent = 'Try sending again ↗'; }
    finally { clearTimeout(timer); submitting = false; }
  });
  if (focus) { root.querySelector('legend').focus({preventScroll:true}); root.scrollIntoView({block:'start',behavior:'instant'}); }
}
let sent = false;
try { sent = sessionStorage.getItem('firstlane-survey-sent') === responseId; } catch {}
if (sent) success(); else render(false);

