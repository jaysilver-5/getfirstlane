import { HttpError, readJson, reply, safeError, outbound } from '../lib/http.mjs';
import { cleanAnswers, SURVEY_VERSION } from '../public/assets/survey-model.js';

export const SURVEY_ENDPOINT = 'https://jinbdlckkyzffnocuugn.supabase.co/functions/v1/survey-feedback';
export function createSurveyHandler({fetcher = fetch} = {}) {
  return async function survey(req, res) {
    try {
      if (req.method !== 'POST') { res.setHeader('Allow','POST'); throw new HttpError(405,'Use a POST request.'); }
      if (!['https://getfirstlane.com','https://www.getfirstlane.com'].includes(req.headers.origin)) throw new HttpError(403,'Please send feedback from the FirstLane survey.');
      if (String(req.headers['content-type'] || '').split(';')[0].trim() !== 'application/json') throw new HttpError(415,'Send a JSON request.');
      const body = await readJson(req);
      if (body.company) throw new HttpError(400,'This request could not be processed.');
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id || '') || body.version !== SURVEY_VERSION) throw new HttpError(400,'Please reload the survey and try again.');
      let answers;
      try { answers = cleanAnswers(body.answers); } catch (err) { throw new HttpError(400,err.message); }
      // Forward only the validated survey, never account cookies or authentication headers.
      const response = await outbound(fetcher,SURVEY_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Origin':req.headers.origin},body:JSON.stringify({id:body.id,version:SURVEY_VERSION,answers})});
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.accepted !== true) throw new HttpError(response.status === 429 ? 429 : 503,'We couldn’t save your feedback. Please try again shortly.');
      return reply(res,200,{accepted:true});
    } catch (error) { return safeError(res,error); }
  };
}
export default createSurveyHandler();
