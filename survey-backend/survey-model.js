export const SURVEY_VERSION = 'signup-feedback-v1';
export const questions = [
  { id: 'stage', title: 'How far did you get with FirstLane?', hint: 'Choose the closest match.', options: [
    ['signed_up', 'I signed up but haven’t tried the practice questions'],
    ['tried', 'I tried a few practice questions'],
    ['used_free', 'I used most or all of the free questions'],
    ['checkout', 'I tried to upgrade or pay'],
    ['paid', 'I already paid for Complete'],
    ['not_sure', 'I don’t remember / something else']
  ] },
  { id: 'blocker', title: 'What has held you back from upgrading?', hint: 'Select all that apply.', multiple: true, when: a => a.stage !== 'paid', options: [
    ['not_tried', 'I haven’t had enough time to try it'],
    ['free_enough', 'The free questions are enough for now'],
    ['price', 'The price is more than I want to pay'],
    ['value', 'I’m not sure what I would get for the money'],
    ['error', 'Something didn’t work or got in my way'],
    ['mobile', 'I would rather use an iPhone or Android app'],
    ['alternative', 'I’m using another way to study'],
    ['not_needed', 'I don’t need G1 preparation right now'],
    ['unavailable', 'I couldn’t find an available way to upgrade'],
    ['other', 'Another reason']
  ] },
  { id: 'friction', title: 'Did anything make FirstLane difficult to use?', hint: 'Select all that apply.', multiple: true, options: [
    ['none', 'No problems that I noticed'],
    ['not_used', 'I haven’t used it enough to say'],
    ['signin', 'Signing in or receiving the email code'],
    ['navigation', 'Finding what to do next'],
    ['loading', 'Slow loading, freezing, or an error'],
    ['questions', 'Using the questions or understanding explanations'],
    ['progress', 'Saving progress or returning to a session'],
    ['phone', 'Reading or tapping things on my phone'],
    ['payment', 'Opening checkout or completing payment'],
    ['other', 'Something else']
  ] },
  { id: 'issueDetails', title: 'What happened, and what were you trying to do?', hint: 'Optional. A page name or error message is helpful. Please don’t include passwords or payment details.', kind: 'textarea', when: a => (a.blocker || []).some(v => ['error','unavailable'].includes(v)) || (a.friction || []).some(v => !['none', 'not_used'].includes(v)) },
  { id: 'priceView', title: 'How do you feel about the price?', hint: 'Ontario G1 Complete is listed at CA$14.99 once, plus applicable tax. It includes 500 practice questions, topic practice, mock tests, and mistake review. No subscription.', when: a => a.stage !== 'paid', options: [
    ['fair', 'It seems fair for what’s included'],
    ['high', 'It’s more than I would pay'],
    ['budget', 'It could be fair, but it doesn’t fit my budget now'],
    ['unclear', 'I need to try more before I can judge the value'],
    ['unaware', 'I hadn’t seen or understood the price before'],
    ['not_buying', 'I wouldn’t pay for G1 practice at any price']
  ] },
  { id: 'priceRange', title: 'What one-time price would you seriously consider?', hint: 'Optional. This is feedback, not a purchase or a promised offer. Amounts are in Canadian dollars, before tax.', when: a => ['high', 'budget'].includes(a.priceView), optional: true, options: [
    ['free_only', 'I would only use a free version'], ['under_5', 'Under CA$5'], ['5_to_9', 'CA$5–9.99'], ['10_to_14', 'CA$10–14.99'], ['unsure', 'I’m not sure']
  ] },
  { id: 'platform', title: 'Where would you prefer to study?', hint: 'Choose the way you would actually use most.', options: [
    ['phone_web', 'In my phone’s browser'], ['desktop_web', 'In a computer or tablet browser'], ['ios', 'In an iPhone app'], ['android', 'In an Android app'], ['either', 'Browser or app — either works for me'], ['not_sure', 'I’m not sure yet']
  ] },
  { id: 'mobileNeed', title: 'What would an installed app improve for you?', hint: 'Select all that apply.', multiple: true, when: a => ['ios', 'android'].includes(a.platform) || (a.blocker || []).includes('mobile'), options: [
    ['access', 'Easier to find and open again'], ['offline', 'Practice without an internet connection'], ['reminders', 'Study reminders'], ['experience', 'A smoother experience on my phone'], ['trust', 'I feel more comfortable using an app from an app store'], ['preference', 'I simply prefer installed apps'], ['other', 'Something else']
  ] },
  { id: 'improvement', title: 'What one change would make FirstLane more useful to you?', hint: 'Optional. Tell us what would make the biggest difference.', kind: 'textarea' },
  { id: 'contact', title: 'May we follow up about your feedback?', hint: 'Optional. Leave your email only if you’re happy for us to contact you about this response. No marketing signup.', kind: 'email' }
];

export function activeQuestions(answers) {
  const active = {}, result = [];
  for (const q of questions) if (!q.when || q.when(active)) { result.push(q); active[q.id] = answers[q.id]; }
  return result;
}

export function cleanAnswers(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Please check your answers.');
  const output = {};
  for (const q of questions) {
    if (q.when && !q.when(output)) continue;
    const value = input[q.id];
    if (q.kind) {
      if (value === undefined || value === '') continue;
      if (typeof value !== 'string' || value.length > (q.kind === 'email' ? 254 : 1500) || value.includes('\0')) throw new Error('Please shorten your written answer.');
      const trimmed = value.trim();
      if (q.kind === 'email' && trimmed && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed)) throw new Error('Please enter a valid email, or leave it blank.');
      if (trimmed) output[q.id] = trimmed;
    } else {
      const allowed = q.options.map(o => o[0]);
      if ((value === undefined || value === '') && q.optional) continue;
      if (q.multiple) {
        if (!Array.isArray(value) || value.length === 0 || value.length > allowed.length || value.some(v => !allowed.includes(v))) throw new Error('Please answer each required question.');
        if (q.id === 'friction' && value.length > 1 && value.some(v => ['none', 'not_used'].includes(v))) throw new Error('Choose either a problem or “no problems / haven’t used it”.');
        output[q.id] = [...new Set(value)];
      } else {
        if (!allowed.includes(value)) throw new Error('Please answer each required question.');
        output[q.id] = value;
      }
    }
  }
  return output;
}
