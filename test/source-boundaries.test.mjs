import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRepository } from '../scripts/project-source.mjs';
import { createGitHubClient } from '../scripts/github-client.mjs';
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

test('untrusted preferred Markdown paths cannot consume executable discovery slots', async () => {
  const docs = Array.from({length:8}, (_,i)=>`docs/review${i}.md`);
  const f = fixture([...docs.map(entry),entry('src/entry.ts')], {'src/entry.ts':'export function run(client) { return client.decide(input); }'});
  const result = await inspectRepository({api:f.api,repository:repo,verifyIntegration,semanticReview:true,preferredPaths:docs});
  assert.equal(result.status,'inspected');
  assert.deepEqual(result.codeSources.map(s=>s.path),['src/entry.ts']);
  assert.ok(!f.calls.some(p=>p.includes('/contents/docs/')));
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
