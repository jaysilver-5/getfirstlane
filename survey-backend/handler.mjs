import { cleanAnswers, SURVEY_VERSION } from './survey-model.js';

export function createFeedbackHandler({env, fetcher = fetch} = {}) {
  return async request => {
    const headers = {'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
    const reply = (status, body) => new Response(JSON.stringify(body),{status,headers});
    if (request.method !== 'POST') return reply(405,{message:'Use a POST request.'});
    if (!['https://getfirstlane.com','https://www.getfirstlane.com'].includes(request.headers.get('Origin'))) return reply(403,{message:'Use the FirstLane survey.'});
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return reply(415,{message:'Send a JSON request.'});
    try {
      if (Number(request.headers.get('content-length') || 0) > 16384) return reply(413,{message:'Request too large.'});
      const reader = request.body?.getReader();
      if (!reader) return reply(400,{message:'Missing answers.'});
      const chunks = []; let length = 0;
      while (true) { const {value,done} = await reader.read(); if (done) break; length += value.length; if (length > 16384) { await reader.cancel(); return reply(413,{message:'Request too large.'}); } chunks.push(value); }
      const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.length;}
      let body, answers;
      try {
        body = JSON.parse(new TextDecoder().decode(bytes));
        if (!body || body.company || body.version !== SURVEY_VERSION || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id || '')) throw new Error();
        answers = cleanAnswers(body.answers);
      } catch { return reply(400,{message:'Please check your answers.'}); }
      const url = env('SUPABASE_URL'), key = env('SUPABASE_SERVICE_ROLE_KEY');
      if (!url || !key) return reply(503,{message:'Feedback is temporarily unavailable.'});
      const auth = {apikey:key,Authorization:`Bearer ${key}`};
      // Idempotent retries never overwrite an existing response.
      const duplicate = await fetcher(`${url}/rest/v1/survey_feedback?id=eq.${body.id}&select=id`,{headers:auth,signal:AbortSignal.timeout(10000)});
      if (!duplicate.ok) return reply(503,{message:'Please try again shortly.'});
      const existing = await duplicate.json();
      if (existing.length) return reply(200,{accepted:true});
      // A small daily ceiling bounds abuse of this public, one-off survey without collecting IP addresses.
      const since = new Date(Date.now() - 86400000).toISOString();
      const count = await fetcher(`${url}/rest/v1/survey_feedback?received_at=gte.${encodeURIComponent(since)}&select=id&limit=201`,{headers:auth,signal:AbortSignal.timeout(10000)});
      if (!count.ok) return reply(503,{message:'Please try again shortly.'});
      if ((await count.json()).length >= 200) return reply(429,{message:'Please try again tomorrow.'});
      const saved = await fetcher(`${url}/rest/v1/survey_feedback?on_conflict=id`,{method:'POST',headers:{...auth,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({id:body.id,version:SURVEY_VERSION,answers}),signal:AbortSignal.timeout(10000)});
      if (!saved.ok) return reply(503,{message:'Please try again shortly.'});
      return reply(200,{accepted:true});
    } catch { return reply(503,{message:'Please try again shortly.'}); }
  };
}
