import assert from 'node:assert/strict';
export const NOW=1791316800000;
// Synthetic test-only configuration: not live credentials, addresses or release approvals.
export const env = {
 SITE_ORIGIN:'https://getfirstlane.com', SUPABASE_URL:'https://project-ref.supabase.co', SUPABASE_PUBLIC_KEY:'sb_publishable_synthetic_test_only',
 TURNSTILE_SECRET_KEY:'synthetic-turnstile-secret', RESEND_API_KEY:'synthetic-resend-secret', SUPPORT_FROM_EMAIL:'forms@getfirstlane.com',SUPPORT_TO_EMAIL:'support@getfirstlane.com'
};
export const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
export const captcha=(action='deletion',extra={})=>json({success:true,action,hostname:'getfirstlane.com',...extra});
export function fetchSequence(...responses){const calls=[];const fetcher=async(...args)=>{calls.push(args);assert.ok(responses.length,`Unexpected outbound call: ${args[0]}`);const next=responses.shift();if(next instanceof Error)throw next;return typeof next==='function'?next(...args):next;};return {calls,fetcher};}
export function token(extra={}){return Buffer.from(JSON.stringify({alg:'HS256'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:'user-1',exp:NOW/1000+3600,amr:[{method:'otp',timestamp:NOW/1000-30}],...extra})).toString('base64url')+'.synthetic_not_a_real_signature';}
export async function invoke(handler,body,overrides={}){
 const req={method:'POST',headers:{'content-type':'application/json',origin:env.SITE_ORIGIN,...overrides.headers},body,...overrides};
 req.headers={'content-type':'application/json',origin:env.SITE_ORIGIN,...overrides.headers};
 const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},end(data){this.data=JSON.parse(data);}};
 await handler(req,res); return res;
}
