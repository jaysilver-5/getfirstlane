import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountHandler} from '../api/account.js';
import {createSupportHandler} from '../api/support.js';
import {readJson} from '../lib/http.mjs';
import {NOW,env,json,captcha,fetchSequence,token,invoke} from './helpers.mjs';
const send={action:'send-code',email:'learner@getfirstlane.com',captchaToken:'solved-captcha'};
const supportBody={email:send.email,topic:'account',message:'Please help me restore my account.',captchaToken:'solved-captcha'};
const account=(mock,extra={})=>createAccountHandler({env,now:()=>NOW,...mock,...extra});
const support=(mock,extra={})=>createSupportHandler({env,now:()=>NOW,...mock,...extra});
const authorized=(value=token())=>({headers:{authorization:`Bearer ${value}`}});
test('non-POST requests are rejected',async()=>assert.equal((await invoke(account({}),send,{method:'GET'})).statusCode,405));
test('cross-origin requests are rejected before upstream work',async()=>assert.equal((await invoke(account({}),send,{headers:{origin:'https://attacker.invalid'}})).statusCode,403));
test('non-JSON and oversized bodies are rejected',async()=>{assert.equal((await invoke(account({}),send,{headers:{'content-type':'text/plain'}})).statusCode,415);assert.equal((await invoke(account({}),send,{headers:{'content-length':'20000'}})).statusCode,413);});
test('retired account actions cannot send codes, authenticate or delete via Supabase',async()=>{
 for(const action of ['send-code','verify-code','delete','signout','unknown']){
  const m=fetchSequence(new Error('No upstream call is allowed'));
  const r=await invoke(account(m),{action,confirmation:'DELETE',email:send.email},authorized());
  assert.equal(r.statusCode,410);assert.equal(r.data.accountUrl,'https://getfirstlane.com/app/account');
  assert.equal(r.data.deleted,undefined);assert.equal(r.data.sent,undefined);assert.equal(r.data.accessToken,undefined);assert.equal(m.calls.length,0);
 }
});

test('retired adapter needs no Supabase credentials',async()=>{
 const r=await invoke(account({}, {env:{SITE_ORIGIN:env.SITE_ORIGIN}}),send);assert.equal(r.statusCode,410);
});

test('malformed, array and primitive JSON bodies fail validation',async()=>{for(const body of ['bad json','"string"','[]','null'])await assert.rejects(()=>readJson({body}));});

test('support captcha checks action, hostname and success before email delivery',async()=>{
 for(const extra of [{action:'deletion'},{hostname:'attacker.invalid'},{success:false}]){
  const m=fetchSequence(captcha('support',extra));assert.equal((await invoke(support(m),supportBody)).statusCode,400);assert.equal(m.calls.length,1);
 }
});

test('every API response is non-cacheable',async()=>{const r=await invoke(account({}),{action:'unknown'});assert.match(r.headers['cache-control'],/no-store/);assert.equal(r.headers['referrer-policy'],'no-referrer');});
test('support only acknowledges accepted provider email and uses safe plain text',async()=>{const m=fetchSequence(captcha('support'),json({id:'message-1'}));const r=await invoke(support(m),{...supportBody,message:'<script>hello!</script> Please help.'});assert.deepEqual(r.data,{accepted:true});const payload=JSON.parse(m.calls[1][1].body);assert.equal(payload.reply_to,send.email);assert.deepEqual(payload.to,[env.SUPPORT_TO_EMAIL]);assert.equal(payload.html,undefined);assert.match(payload.text,/<script>/);assert.ok(m.calls[1][1].headers['Idempotency-Key']);});
test('support message boundaries and topic whitelist are enforced',async()=>{for(const update of [{message:'x'},{message:'x'.repeat(4001)},{topic:'__proto__'},{company:'bot'},{email:'bad'}])assert.equal((await invoke(support({}),{...supportBody,...update})).statusCode,400);});
test('failed or unconfirmed email sends are not acknowledged',async()=>{for(const response of [json({},200),json({id:'not-success'},500)]){const m=fetchSequence(captcha('support'),response);assert.equal((await invoke(support(m),supportBody)).statusCode,503);}});
test('duplicate support messages use the same short-window idempotency key',async()=>{const keys=[];for(let i=0;i<2;i++){const m=fetchSequence(captcha('support'),json({id:'same-message'}));await invoke(support(m),supportBody);keys.push(m.calls[1][1].headers['Idempotency-Key']);}assert.equal(keys[0],keys[1]);});
test('Vercel lazy body parse errors are a clean 400',async()=>{const req={get body(){throw new Error('SyntaxError with private input');}};await assert.rejects(()=>readJson(req),e=>e.status===400&&e.message==='Invalid request.');});
