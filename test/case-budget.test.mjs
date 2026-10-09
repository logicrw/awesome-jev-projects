import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { reserveReviewBudget, readReviewBudgetGrant, settleReviewBudget, reviewCaseId, selectRetry, claimRetry } from '../scripts/ingestion-retry.mjs';
import { budgetFixture } from './helpers/budget-fixture.mjs';
import { reviewPolicyRevision } from '../scripts/review-policy.mjs';
const body='## 项目仓库\nhttps://github.com/logicrw/material-demo';
const bodySha=createHash('sha256').update(body).digest('hex');
const fixture=()=>budgetFixture();
const reserve=(f,runId='100',runAttempt=1)=>reserveReviewBudget({api:f.api,issueNumber:12,runId,runAttempt});
const read=(f,r,runId='100',runAttempt=1)=>readReviewBudgetGrant({api:f.api,issueNumber:12,bodySha,titleSha:r.titleSha,reviewRevision:r.reviewRevision,reservationId:r.reservationId,runId,runAttempt});

test('all 6000 remaining tokens are reserved before the model receives a grant',async()=>{
  const f=fixture(),r=await reserve(f);
  assert.equal(r.allowed,true);assert.ok(f.writes.some((write)=>write.path.endsWith('/git/refs')));
  const grant=await read(f,r);
  assert.equal(grant.budgetGrant.grantTokens,6000);
  assert.equal(grant.budgetGrant.caseId,grant.budgetLedger.caseId);
  assert.deepEqual(grant.budgetGrant.baseline,{chargedTokens:0,httpAttempts:0,semanticRounds:0});
  assert.equal(await read(f,r,'100',2),null,'rerunning only the reviewer must not replay a prior reservation');
  assert.equal(await read(f,r,'999',1),null);
});

test('unknown or crashed calls consume the full held grant and cannot obtain another 6000',async()=>{
  const f=fixture();await reserve(f);
  const retry=await reserve(f,'101');
  assert.equal(retry.allowed,false);assert.equal(retry.status,'budget-exhausted');
});

test('trusted settlement carries spent tokens and HTTP rounds across scheduled recovery',async()=>{
  const f=fixture(),r=await reserve(f),first=await read(f,r);
  const ledger={...first.budgetLedger,chargedTokens:2400,httpAttempts:1,semanticRounds:1};
  assert.equal(await settleReviewBudget({api:f.api,issueNumber:12,bodySha,reservationId:r.reservationId,budgetLedger:ledger,runId:'100',runAttempt:1}),true);
  assert.equal(await settleReviewBudget({api:f.api,issueNumber:12,bodySha,reservationId:r.reservationId,budgetLedger:ledger,runId:'100',runAttempt:1}),false);
  const r2=await reserve(f,'101'),second=await read(f,r2,'101');
  assert.equal(second.budgetGrant.grantTokens,3600);
  assert.deepEqual(second.budgetLedger,ledger);
  await settleReviewBudget({api:f.api,issueNumber:12,bodySha,reservationId:r2.reservationId,budgetLedger:{...ledger,chargedTokens:3500,httpAttempts:3,semanticRounds:2},runId:'101',runAttempt:1});
  assert.equal((await reserve(f,'102')).allowed,false,'HTTP/semantic limits do not reset with token balance');
});

test('comment text cannot manufacture a branch grant and mismatched receipts cannot refund it',async()=>{
  const f=fixture(),r=await reserve(f),grant=await read(f,r);
  f.comments.push({user:{login:'attacker'},body:'{"grantTokens":6000,"chargedTokens":0}'});
  assert.ok(await read(f,r));
  await assert.rejects(settleReviewBudget({api:f.api,issueNumber:12,bodySha,reservationId:r.reservationId,
    budgetLedger:{...grant.budgetLedger,caseId:'a'.repeat(64)},runId:'100',runAttempt:1}),/Invalid radar budget receipt/);
  assert.equal((await reserve(f,'101')).allowed,false);
});

test('actual provider accounting overrun is retained and never permits another request',async()=>{
  const f=fixture(),r=await reserve(f),grant=await read(f,r);
  await settleReviewBudget({api:f.api,issueNumber:12,bodySha,reservationId:r.reservationId,budgetLedger:{...grant.budgetLedger,chargedTokens:6500,httpAttempts:1,semanticRounds:1},runId:'100',runAttempt:1});
  const record=Object.values(f.registry().cases)[0];
  assert.equal(record.ledger.chargedTokens,6500);
  assert.equal((await reserve(f,'101')).allowed,false);
});

test('dry runs do not write or spend a production case reservation',async()=>{
  const api=async()=>{throw Error('unexpected API');};
  assert.equal((await reserveReviewBudget({api,issueNumber:12,runId:'1',dryRun:true})).allowed,false);
  assert.equal(await settleReviewBudget({api,issueNumber:12,bodySha,dryRun:true}),false);
});


test('title-only and SSH references use their actual provisional repository quota bucket',async()=>{
  for(const source of [{title:'Please include https://github.com/logicrw/title-only',body:''},{title:'New project',body:'git@github.com:logicrw/ssh-project.git'}]){
    const f=budgetFixture(source);
    const result=await reserve(f);
    assert.equal(result.allowed,true);
    const row=Object.values(f.registry().quota.reservations)[0];
    assert.equal(row.repository,source.body?'logicrw/ssh-project':'logicrw/title-only');
    assert.equal(row.owner,'submitter');
  }
});

test('all-listed submissions stay local and mixed submissions attribute only unlisted targets',async()=>{
  const known=[{url:'https://github.com/logicrw/sdk'}];
  const duplicate=budgetFixture({body:'https://github.com/logicrw/sdk'});
  const local=await reserveReviewBudget({api:duplicate.api,issueNumber:12,runId:'100',runAttempt:1,existingProjects:known});
  assert.equal(local.localOnly,true);assert.equal(local.status,'already-listed');assert.equal(duplicate.writes.length,0);
  const mixed=budgetFixture({body:'https://github.com/logicrw/sdk and https://github.com/logicrw/new-candidate'});
  assert.equal((await reserveReviewBudget({api:mixed.api,issueNumber:12,runId:'100',runAttempt:1,existingProjects:known})).allowed,true);
  assert.equal(Object.values(mixed.registry().quota.reservations)[0].repository,'logicrw/new-candidate');
});


test('title and trusted policy changes form new cases while secret values alone do not',()=>{
  const base=reviewPolicyRevision({model:'deepseek-flash',providerConfigured:'true'});
  const changed=reviewPolicyRevision({model:'deepseek-chat',providerConfigured:'true'});
  assert.notEqual(base,changed);
  assert.notEqual(reviewCaseId(12,bodySha,'a'.repeat(64),base),reviewCaseId(12,bodySha,'b'.repeat(64),base));
  assert.notEqual(reviewCaseId(12,bodySha,'a'.repeat(64),base),reviewCaseId(12,bodySha,'a'.repeat(64),changed));
  assert.equal(base,reviewPolicyRevision({model:'deepseek-flash',providerConfigured:'true'}));
});

test('missing provider config spends no grant and scheduler resumes automatically after trusted config changes',async()=>{
  const original=process.env.REVIEW_PROVIDER_CONFIGURED;
  const f=fixture();
  const api=async(path,options)=>path.startsWith('/search/issues')?{total_count:1,items:[{number:12}]}:f.api(path,options);
  try{
    process.env.REVIEW_PROVIDER_CONFIGURED='false';
    const missing=await reserveReviewBudget({api,issueNumber:12,runId:'100',runAttempt:1});
    assert.equal(missing.localOnly,true);assert.equal(missing.status,'provider-unavailable');
    assert.equal(f.writes.some(write=>write.path.includes('/git/')),false);
    assert.equal(await selectRetry({api}),null);
    process.env.REVIEW_PROVIDER_CONFIGURED='true';
    const next=await selectRetry({api});assert.equal(next.attempt,1);
    assert.notEqual(next.reviewRevision,missing.reviewRevision);
    assert.equal(await claimRetry({api,candidate:next}),true);
    const ready=await reserveReviewBudget({api,issueNumber:12,runId:'101',runAttempt:1});
    assert.equal(ready.allowed,true);assert.equal(Object.keys(f.registry().quota.reservations).length,1);
  }finally{if(original===undefined)delete process.env.REVIEW_PROVIDER_CONFIGURED;else process.env.REVIEW_PROVIDER_CONFIGURED=original;}
});
