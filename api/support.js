import { HttpError, reply, validateOrigin, readJson, emailValue, text, configRequired, outbound, verifyCaptcha, safeError, stableRequestId } from '../lib/http.mjs';
const TOPICS = { account:'Account help', purchase:'Purchase or restoration', content:'Question report', privacy:'Privacy request', deletion:'Deletion assistance', other:'General support' };
export function createSupportHandler({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  return async function support(req, res) {
    try {
      validateOrigin(req, env);
      configRequired(env, ['RESEND_API_KEY','SUPPORT_FROM_EMAIL','SUPPORT_TO_EMAIL']);
      const body = await readJson(req);
      if (body.company) throw new HttpError(400, 'This request could not be processed.');
      const email = emailValue(body.email);
      const message = text(body.message,4000,10);
      if (!Object.hasOwn(TOPICS, body.topic)) throw new HttpError(400, 'Choose a support topic.');
      await verifyCaptcha(body.captchaToken,'support',env,fetcher);
      const from = emailValue(env.SUPPORT_FROM_EMAIL), to = emailValue(env.SUPPORT_TO_EMAIL);
      const response = await outbound(fetcher, 'https://api.resend.com/emails', {
        method:'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Idempotency-Key':stableRequestId([email,body.topic,message,String(Math.floor(now()/300000))]) },
        body:JSON.stringify({ from:`FirstLane Support <${from}>`, to:[to], reply_to:email, subject:`FirstLane — ${TOPICS[body.topic]}`, text:`Topic: ${TOPICS[body.topic]}\nReply to: ${email}\n\n${message}\n\nSent from the FirstLane website contact form.` })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.id) throw new HttpError(503, 'Your message could not be delivered to our support service. Please try again or use the support email.');
      return reply(res,200,{ accepted:true });
    } catch(error) { return safeError(res,error); }
  };
}
export default createSupportHandler();
