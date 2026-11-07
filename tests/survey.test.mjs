import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {activeQuestions,cleanAnswers,SURVEY_VERSION} from '../public/assets/survey-model.js';
import {createSurveyHandler} from '../api/survey.js';
import {createFeedbackHandler} from '../survey-backend/handler.mjs';
import {invoke,json,fetchSequence} from './helpers.mjs';
const id='ce61c37c-6623-4bb6-82f1-f12f57cda2ea';
const answers={stage:'tried',blocker:'value',friction:['none'],priceView:'unclear',platform:'phone_web'};
const payload={id,version:SURVEY_VERSION,answers};
const request=(body=payload,headers={})=>new Request('https://edge.example/feedback',{method:'POST',headers:{Origin:'https://getfirstlane.com','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const env=name=>({SUPABASE_URL:'https://project.example',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'}[name]);

test('survey branches distinguish price, friction and mobile without carrying hidden stale answers',()=>{
  const price={...answers,priceView:'high'};
  assert.ok(activeQuestions(price).some(q=>q.id==='priceRange'));
  const mobile={...answers,platform:'android'};
  assert.ok(activeQuestions(mobile).some(q=>q.id==='mobileNeed'));
  const paid={...price,stage:'paid',blocker:'mobile',friction:['none'],priceRange:'under_5',mobileNeed:['access']};
  const keys=activeQuestions(paid).map(q=>q.id);
  for(const key of ['blocker','priceView','priceRange','mobileNeed']) assert.ok(!keys.includes(key),key);
  const clean=cleanAnswers(paid);
  for(const key of ['blocker','priceView','priceRange','mobileNeed']) assert.equal(clean[key],undefined);
});
test('survey validates required choices, mutually exclusive problems, lengths and email',()=>{
  assert.deepEqual(cleanAnswers(answers),answers);
  assert.throws(()=>cleanAnswers({...answers,blocker:'made_up'}));
  assert.throws(()=>cleanAnswers({...answers,friction:['none','payment']}));
  assert.throws(()=>cleanAnswers({...answers,improvement:'a'.repeat(1501)}));
  assert.throws(()=>cleanAnswers({...answers,contact:'invalid'}));
  assert.equal(cleanAnswers({...answers,contact:'',accountId:'secret'}).accountId,undefined);
});
test('edge deployed schema matches browser validation',()=>assert.equal(readFileSync(new URL('../survey-backend/survey-model.js',import.meta.url),'utf8'),readFileSync(new URL('../public/assets/survey-model.js',import.meta.url),'utf8')));
test('API accepts signup-free feedback and forwards no cookies or account credentials',async()=>{
  const {fetcher,calls}=fetchSequence(json({accepted:true}));
  const result=await invoke(createSurveyHandler({fetcher}),payload,{headers:{cookie:'private-session',authorization:'Bearer account-token'}});
  assert.equal(result.statusCode,200);assert.deepEqual(result.data,{accepted:true});
  assert.equal(calls[0][1].headers.cookie,undefined);assert.equal(calls[0][1].headers.authorization,undefined);
});
test('API accepts canonical www origin and rejects foreign origins, bots, invalid IDs and oversized bodies',async()=>{
  const {fetcher}=fetchSequence(json({accepted:true}));
  assert.equal((await invoke(createSurveyHandler({fetcher}),payload,{headers:{origin:'https://www.getfirstlane.com'}})).statusCode,200);
  const handler=createSurveyHandler({fetcher:()=>{throw new Error('must not call backend');}});
  for(const [body,options,status] of [[payload,{headers:{origin:'https://attacker.example'}},403],[{...payload,company:'spam'},{},400],[{...payload,id:'bad'},{},400],[{...payload,extra:'x'.repeat(20000)},{},413]]) assert.equal((await invoke(handler,body,options)).statusCode,status);
  assert.equal((await invoke(handler,payload,{method:'GET'})).statusCode,405);
});
test('failed storage never produces a successful API response',async()=>{
  const {fetcher}=fetchSequence(json({message:'failure'},503));
  const result=await invoke(createSurveyHandler({fetcher}),payload);
  assert.equal(result.statusCode,503);assert.equal(result.data.accepted,undefined);
});
test('edge writes validated feedback privately and returns only a receipt',async()=>{
  const {fetcher,calls}=fetchSequence(json([]),json([]),new Response(null,{status:201}));
  const response=await createFeedbackHandler({env,fetcher})(request());
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{accepted:true});
  assert.deepEqual(JSON.parse(calls[2][1].body),payload);
  assert.equal(calls[2][1].headers.Prefer,'resolution=ignore-duplicates,return=minimal');
});
test('edge duplicate retry is idempotent and never updates answers',async()=>{
  const {fetcher,calls}=fetchSequence(json([{id}]));
  assert.equal((await createFeedbackHandler({env,fetcher})(request())).status,200);assert.equal(calls.length,1);
});
test('edge disallows public reads, foreign origins and invalid answers',async()=>{
  const handler=createFeedbackHandler({env,fetcher:()=>{throw new Error('must not access storage');}});
  assert.equal((await handler(new Request('https://edge.example/feedback'))).status,405);
  assert.equal((await handler(request(payload,{Origin:'https://attacker.example'}))).status,403);
  assert.equal((await handler(request({...payload,answers:{}}))).status,400);
  assert.equal((await handler(request({...payload,extra:'x'.repeat(18000)}))).status,413);
});
test('edge handles provider failures and bounds anonymous submissions',async()=>{
  let sequence=fetchSequence(json([]),json(Array.from({length:200},()=>({id}))));
  assert.equal((await createFeedbackHandler({env,fetcher:sequence.fetcher})(request())).status,429);
  sequence=fetchSequence(json([]),json([]),json({message:'db failure'},500));
  const response=await createFeedbackHandler({env,fetcher:sequence.fetcher})(request());
  assert.equal(response.status,503);assert.equal((await response.json()).accepted,undefined);
});
