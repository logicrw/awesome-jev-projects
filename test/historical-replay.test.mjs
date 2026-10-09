import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { prepareSubmission } from '../scripts/issue-ingestion.mjs';
import { createSubmissionReviewer, createSummaryEnricher } from '../scripts/source-enrichment.mjs';
import { requestBudget } from '../scripts/review-budget.mjs';

const taxonomy=JSON.parse(await readFile(new URL('../src/data/taxonomy.json',import.meta.url),'utf8'));
const gold={
  111:{kind:'learning-resource',relation:'discussed',basis:'descriptive-material',category:'SDK & Decision Frameworks',zh:'汇集 Jev 问题模式、反模式与校准方法的学习资料。',en:'Collects Jev question patterns, anti-patterns, and calibration guidance.',mechanism:/pattern|模式|anti-pattern/i},
  113:{kind:'integration',relation:'implemented',basis:'mixed',category:'Data & Search',zh:'在 PostgreSQL 中提交 Jev 语义判断并查询异步结果。',en:'Submits Jev semantic decisions from PostgreSQL and retrieves asynchronous results.',mechanism:/jev\.submit|CREATE (?:OR REPLACE )?FUNCTION|NOT_EVALUATED/i},
  114:{kind:'benchmark',relation:'implemented',basis:'mixed',category:'High-Frequency & Simulation',zh:'通过 Jev 选择控制动作并评估飞机着陆的模拟基准。',en:'Evaluates aircraft landing in simulation with Jev-selected control actions.',mechanism:/JevController|system_one|Choice\(/},
};
function sourceAPI(fixture){
 const repo=fixture.repo.full_name,sha=fixture.sourceCommit;
 return async(path)=>{
  if(path.startsWith('/repos/logicrw/awesome-jev-projects/issues/'))return [];
  if(path===`/repos/${repo}`)return fixture.repo;
  if(path===`/repos/${repo}/commits?per_page=1`)return[{sha,commit:{committer:{date:fixture.commitDate}}}];
  if(path.includes(`/repos/${repo}/git/trees/${sha}`))return{tree:fixture.files.map(f=>({path:f.path,type:'blob',mode:'100644',size:Buffer.byteLength(f.text)}))};
  for(const f of fixture.files)if(path===`/repos/${repo}/contents/${f.path.split('/').map(encodeURIComponent).join('/')}?ref=${sha}`)
   return{path:f.path,type:'file',size:Buffer.byteLength(f.text),encoding:'base64',content:Buffer.from(f.text).toString('base64')};
  if(path.includes('/repos/')&&!path.startsWith(`/repos/${repo}/`))throw Object.assign(new Error('fixture target unavailable'),{status:404});
  throw new Error(`Unexpected fixture read: ${path}`);
 };
}
for(const issueNumber of [113,114])test(`fixed #${issueNumber}: genuine materials reach the model and a source-backed scripted verdict is admitted`,async(t)=>{
 const fixture=JSON.parse(await readFile(new URL(`./fixtures/historical/issue-${issueNumber}.json`,import.meta.url),'utf8'));
 const expected=gold[issueNumber];
 for(const file of fixture.files)assert.equal(createHash('sha256').update(file.text).digest('hex'),file.hash);
 let calls=0;const requests=[];
 // This is an explicitly scripted reference verdict, never reported as live LLM inference.
 const reviewer=createSubmissionReviewer({token:'offline-fixture',source:'deepseek',fetchImpl:async(_url,options)=>{
  const request=JSON.parse(options.body),packet=JSON.parse(request.messages[1].content);requests.push(request);calls++;
  assert.equal(request.model,'deepseek-flash');
  const own=packet.evidence.materials.filter(m=>m.targetId==='R1');
  assert.ok(own.length,'no syntax/extension gate may hide the project');
  const mechanism=own.find(m=>expected.mechanism.test(m.text));
  const need=!mechanism&&calls===1;
  if(!need)assert.ok(mechanism,`#${issueNumber}: mechanism absent even after bounded supplemental reading`);
  const support=(mechanism??own[0]).id;
  const verdict={target:'R1',decision:need?'need-more':'admit',catalogKind:expected.kind,jevRelation:need?'uncertain':expected.relation,
   reviewBasis:expected.basis,claims:[{type:'purpose',text:expected.en,support:[support]}],conflicts:[],
   need:need?(issueNumber===113?'configuration':'definition'):null,category:need?null:taxonomy.findIndex(x=>x.category===expected.category),plainSummary:expected.zh,plainSummaryEn:expected.en};
  return new Response(JSON.stringify({model:'deepseek-flash',choices:[{finish_reason:'stop',message:{content:JSON.stringify(verdict)}}],
   usage:{prompt_tokens:500,completion_tokens:200,total_tokens:700,completion_tokens_details:{reasoning_tokens:0}}}));
 }});
 const result=await prepareSubmission({issue:{...fixture.issue,state:'open'},repository:'logicrw/awesome-jev-projects',projects:[],taxonomy,
  api:sourceAPI(fixture),reviewer:input=>reviewer({...input,allowUnreserved:true}),
  enrich:createSummaryEnricher({token:'fixture',fetchImpl:()=>assert.fail('second summary call outside the case budget')})});
 assert.equal(result.status,'ready',JSON.stringify({status:result.status,reason:result.reason,review:result.reviewDetails}));
 assert.equal(result.project.catalogKind,expected.kind);assert.equal(result.project.jevRelation,expected.relation);
 assert.equal(result.project.runtimeVerified,false);assert.equal(result.project.headSha,fixture.sourceCommit);
 assert.ok(['identified','custom','undeclared'].includes(result.project.license.status));
 assert.ok(result.project.evidence.length>0);assert.ok(calls>=1&&calls<=2);
 assert.equal(requests[0].thinking.type,'disabled');assert.equal(requests[0].max_tokens,512);
 if(calls===2){assert.equal(requests[1].thinking.type,'enabled');assert.equal(requests[1].max_tokens,2048);}
 assert.ok(result.budgetLedger.chargedTokens<=6000);
 const metrics=requests.map((request,i)=>{const packet=JSON.parse(request.messages[1].content);return {
  phase:i+1,...requestBudget(request.messages,i+1),materialCount:packet.evidence.materials.length,
  materialBytes:packet.evidence.materials.reduce((n,m)=>n+Buffer.byteLength(m.text),0),
 }});
 t.diagnostic(JSON.stringify({issue:issueNumber,commit:fixture.sourceCommit,decision:'admit',catalogKind:result.project.catalogKind,
  sourceBytes:fixture.files.reduce((n,f)=>n+Buffer.byteLength(f.text),0),requests:metrics,
  accounting:'scripted usage, not provider measurement',chargedTokens:result.budgetLedger.chargedTokens}));
});

test('fixed #111: pure prompt pattern library without executable Jev API integration is excluded',async(t)=>{
 const fixture=JSON.parse(await readFile(new URL('./fixtures/historical/issue-111.json',import.meta.url),'utf8'));
 const reviewer=createSubmissionReviewer({token:'offline-fixture',source:'deepseek',fetchImpl:async(_url,options)=>{
  const verdict={target:'R1',decision:'exclude',catalogKind:'learning-resource',jevRelation:'discussed',
   reviewBasis:'descriptive-material',claims:[],conflicts:[],need:null,category:null,
   plainSummary:'纯提示词与问题设计模式列表，无代码级 JEV API 软件工程集成。',
   plainSummaryEn:'Curated prompt pattern library without executable Jev API software integration.'};
  return new Response(JSON.stringify({model:'deepseek-flash',choices:[{finish_reason:'stop',message:{content:JSON.stringify(verdict)}}],
   usage:{prompt_tokens:480,completion_tokens:120,total_tokens:600}}));
 }});
 const result=await prepareSubmission({issue:{...fixture.issue,state:'open'},repository:'logicrw/awesome-jev-projects',projects:[],taxonomy,
  api:sourceAPI(fixture),reviewer:input=>reviewer({...input,allowUnreserved:true}),
  enrich:createSummaryEnricher({token:'fixture',fetchImpl:()=>assert.fail('no summary call on exclusion')})});
 assert.equal(result.status,'rejected');
 assert.equal(result.reasonCode,'model-rejected');
 assert.equal(result.submittedRepository,'vicfei/awesome-jev-prompts');
 t.diagnostic(JSON.stringify({issue:111,decision:'exclude',reason:result.reason}));
});
