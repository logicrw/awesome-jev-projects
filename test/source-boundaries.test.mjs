import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRepository, extractSubmittedRepositories, collectAdditionalMaterials } from '../scripts/project-source.mjs';
import { createGitHubClient } from '../scripts/github-client.mjs';
import { buildEvidenceBundle } from '../scripts/evidence-bundle.mjs';
import { createHash } from 'node:crypto';
const repo = 'logicrw/audit-fixture', sha = 'a'.repeat(40);
function fixture(entries, files, metadata = {}) {
  const calls = [];
  const api = async path => {
    calls.push(path);
    if (path === `/repos/${repo}`) return {id: 123, full_name: repo, name: 'fixture', private: false, ...metadata};
    if (path.includes('/commits?')) return [{sha}];
    if (path.includes('/readme?')) return encode('README.md', '# Fixtures');
    if (path === `/repos/${repo}/contents?ref=${sha}`) return [];
    if (path.includes('/git/trees/')) return {tree: entries};
    for (const [name,text] of Object.entries(files)) {
      if (path === `/repos/${repo}/contents/${name}?ref=${sha}`) return encode(name, text);
    }
    throw Object.assign(new Error('Not Found'), {status:404});
  };
  return {api, calls};
}
const encode = (path,text) => ({path,type:'file',encoding:'base64',size:Buffer.byteLength(text),content:Buffer.from(text).toString('base64')});
const entry = path => ({path,type:'blob',mode:'100644',size:50});
const verifyIntegration = () => ({verified:false,reason:'mention-only directory'});

test('preferred documentation is readable but cannot consume every independent discovery slot', async () => {
  const docs = Array.from({length:8}, (_,i)=>`docs/review${i}.md`);
  const f = fixture([...docs.map(entry),entry('src/entry.ts')], {...Object.fromEntries(docs.map(p=>[p,'# Guide\nJev decision integration instructions.'])), 'src/entry.ts':'export function run(client) { return client.decide(input); }'});
  const result = await inspectRepository({api:f.api,repository:repo,verifyIntegration,semanticReview:true,preferredPaths:docs});
  assert.equal(result.status,'inspected');
  assert.deepEqual(result.codeSources.map(s=>s.path),['src/entry.ts']);
  assert.ok(f.calls.some(p=>p.includes('/contents/docs/')));
  assert.ok(result.materialSources.some(s=>s.path==='src/entry.ts'));
  assert.ok(result.materialSources.length<=8);
});

test('candidate extraction tolerates bilingual fields and keeps bounded multi-link alternatives',()=>{
  assert.deepEqual(extractSubmittedRepositories('### GitHub repository (项目仓库地址)\nhttps://github.com/logicrw/tool\n### Evidence\nhttps://github.com/logicrw/sdk'),['logicrw/tool','logicrw/sdk']);
  assert.equal(extractSubmittedRepositories(Array.from({length:6},(_,i)=>`https://github.com/logicrw/r${i}`).join('\n')).length,3);
  assert.deepEqual(extractSubmittedRepositories('https://evil.test/?next=https://github.com/logicrw/tool'),[]);
});

test('SQL, unknown DSL and docs are materials; 10MB text uses bounded streamed windows',async()=>{
  const paths=['db/integration.sql','spec/new.dsl','docs/implementation.md','README.md'];
  const tree={tree:paths.map(p=>({...entry(p),size:p==='README.md'?10_000_000:80}))};
  let largeOptions;
  const api=async(path,options)=>{
    if(path.includes('/git/trees'))return tree;
    if(path.includes('/README.md?')){largeOptions=options;const text='# Project\nJev integration documentation.';return {scannedBytes:100,complete:false,windows:[{text,startByte:0,endByte:Buffer.byteLength(text)}]};}
    const name=paths.find(p=>path.includes('/'+p+'?'));
    return encode(name,`material for ${name}`);
  };
  const result=await collectAdditionalMaterials({api,repository:repo,sha,maxFiles:8});
  assert.equal(result.sources.length,4);
  assert.deepEqual(largeOptions,{raw:true,responseBytes:10_485_760,sampleMaterials:true});
  const large=result.sources.find(s=>s.path==='README.md');
  assert.equal(large.partial,true);assert.equal(large.originalBytes,10_000_000);
  assert.equal(large.readSpan.endByte,Buffer.byteLength(large.text));
});

test('bounded GitHub reads stop oversized JSON and keep exact UTF8 text prefixes',async()=>{
  const api=createGitHubClient({sleep:async()=>{},fetchImpl:async()=>new Response('x'.repeat(1000))});
  await assert.rejects(api('/repos/logicrw/demo',{responseBytes:10}),{code:'RESPONSE_BUDGET'});
  assert.equal(await api('/repos/logicrw/demo',{responseBytes:10,raw:true,truncate:true}),'x'.repeat(10));
  const bom=createGitHubClient({sleep:async()=>{},fetchImpl:async()=>new Response('\uFEFFabcdef')});
  assert.equal(await bom('/repos/logicrw/demo',{responseBytes:6,raw:true,truncate:true}),'\uFEFFabc');
});

test('budget control writer is limited to one branch and one isolated data file',async()=>{
  let calls=0;
  const api=createGitHubClient({writeRepository:repo,writeScope:'budget',sleep:async()=>{},fetchImpl:async()=>{calls++;return new Response('{}');}});
  await api(`/repos/${repo}/git/refs`,{method:'POST',body:{ref:'refs/heads/ingestion-budget',sha}});
  await api(`/repos/${repo}/git/trees`,{method:'POST',body:{base_tree:sha,tree:[{path:'radar/review-budget.json',mode:'100644',type:'blob',content:'{}'}]}});
  for(const ref of ['refs/heads/attacker','refs/tags/ingestion-budget']) await assert.rejects(api(`/repos/${repo}/git/refs`,{method:'POST',body:{ref,sha}}),/outside/);
  await assert.rejects(api(`/repos/${repo}/git/refs/heads/ingestion-budget`,{method:'PATCH',body:{sha,force:true}}),/outside/);
  await assert.rejects(api(`/repos/${repo}/git/refs/heads/main`,{method:'PATCH',body:{sha,force:false}}),/outside/);
  await assert.rejects(api(`/repos/${repo}/issues/1/comments`,{method:'POST',body:{body:'unauthorized'}}),/outside/);
  await assert.rejects(api(`/repos/${repo}/git/trees`,{method:'POST',body:{base_tree:sha,tree:[{path:'radar/review-budget.json',mode:'100644',type:'blob',content:'{}'},{path:'src/data/projects.json',mode:'100644',type:'blob',content:'[]'}]}}),/outside/);
  assert.equal(calls,2);
});

test('collector and bundle retain a genuine README mechanism after byte 65536 without buffering the whole document',async()=>{
  const text='# Project\n\n'+'noise '.repeat(16000)+'\n\n# Jev integration\nUse Jev semantic decisions through SQL: CREATE FUNCTION jev.submit; results are asynchronous.\n';
  const blobOid='c'.repeat(40);
  const api=createGitHubClient({sleep:async()=>{},fetchImpl:async(url)=>new Response(url.includes('/git/trees/')?
    JSON.stringify({tree:[{...entry('README.md'),size:Buffer.byteLength(text),sha:blobOid}]}):text)});
  const fetched=await collectAdditionalMaterials({api,repository:repo,sha,maxFiles:3});
  assert.ok(fetched.sources.some(source=>source.readSpan.startByte>65536&&source.text.includes('CREATE FUNCTION')));
  assert.ok(fetched.sources.every(source=>Buffer.byteLength(source.text)<=16384&&source.partial&&source.blobOid===blobOid));
  assert.ok(fetched.sources.every(source=>source.contentSha256===createHash('sha256').update(text).digest('hex')));
  const sources=fetched.sources.map(source=>({...source,targetId:'R1',repoId:1,commit:sha,repository:repo}));
  const bundle=buildEvidenceBundle({sources,targets:[{id:'R1',repoId:1,repository:repo,commit:sha,available:true}],maxBytes:6000});
  assert.match(JSON.stringify(bundle.modelData),/CREATE FUNCTION/);
});

test('valid nominated sources reserve independent source discovery and do not stop at a heuristic match', async () => {
  const nominated = Array.from({length:8},(_,i)=>`src/nominee${i}.ts`);
  const independent = Array.from({length:4},(_,i)=>`lib/real${i}.ts`);
  const paths = [...nominated,...independent];
  const f=fixture(paths.map(entry),Object.fromEntries(paths.map(p=>[p,'export function call(c) { return c.decide(input); }'])));
  const result=await inspectRepository({api:f.api,repository:repo,verifyIntegration:()=>({verified:true}),semanticReview:true,requireCodeEvidence:true,preferredPaths:nominated});
  assert.equal(result.codeSources.length,8);
  assert.equal(result.codeSources.filter(s=>independent.includes(s.path)).length,4);
  assert.equal(result.status,'inspected');
});

test('neutral collection does not semantically reject a server named docs or a novel SDK', async () => {
  const path='server/runtime.py';
  const text='from novel.runtime import Engine\nengine = Engine()\n@app.post("/v1/systemone")\ndef serve(request):\n    return engine.infer(request)';
  const f=fixture([entry(path)],{[path]:text},{name:'docs'});
  const result=await inspectRepository({api:f.api,repository:repo,verifyIntegration,semanticReview:true});
  assert.equal(result.status,'inspected');
  assert.equal(result.codeSources[0].text,text);
});

test('direct hints cannot bypass oversized, symlink, documentation, or response identity boundaries',async()=>{
  const f=fixture([entry('src/x.ts')],{});
  const api=async path=>path.includes('/contents/src/x.ts?')?encode('docs/unrelated.md','not source'):f.api(path);
  const result=await inspectRepository({api,repository:repo,verifyIntegration,semanticReview:true,preferredPaths:['docs/payload.md','src/x.ts']});
  assert.deepEqual(result.codeSources,[]);
});

test('label deletion allows only needs-evidence in the fixed owning repository', async () => {
  const calls=[];
  const api=createGitHubClient({writeRepository:repo,token:'fixture',sleep:async()=>{},fetchImpl:async(url,init)=>{calls.push({url,method:init.method});return new Response(null,{status:204});}});
  await api(`/repos/${repo}/issues/1/labels/needs-evidence`,{method:'DELETE'});
  assert.equal(calls.length,1);
  for(const path of [`/repos/${repo}/issues/1/labels/security`,`/repos/${repo}/issues/1`,`/repos/logicrw/other/issues/1/labels/needs-evidence`])
    await assert.rejects(api(path,{method:'DELETE'}),/outside the explicit/);
  assert.equal(calls.length,1);
});

test('large README sampling retains middle limitations independently from positive Jev anchors',async()=>{
  const text='# Jev project\n'+('padding '.repeat(9000))+'\n## Limitations\nThis is a stub, not implemented; mock only.\n'+('padding '.repeat(9000))+'\n# Jev usage\n';
  const api=createGitHubClient({sleep:async()=>{},fetchImpl:async(url)=>new Response(url.includes('/git/trees/')?
    JSON.stringify({tree:[{...entry('README.md'),size:Buffer.byteLength(text)}]}):text,{headers:{'content-length':String(Buffer.byteLength(text))}})});
  const {sources}=await collectAdditionalMaterials({api,repository:repo,sha,maxFiles:3});
  assert.ok(sources.some(s=>s.text.includes('not implemented; mock only')));
  assert.ok(sources.reduce((sum,s)=>sum+Buffer.byteLength(s.text),0)<=262144);
  const bundle=buildEvidenceBundle({sources:sources.map(s=>({...s,repoId:1,commit:sha,repository:repo,targetId:'R1'})),targets:[{id:'R1',repoId:1,repository:repo,commit:sha,available:true}],maxBytes:6000});
  assert.match(JSON.stringify(bundle.modelData),/not implemented; mock only/);
});
