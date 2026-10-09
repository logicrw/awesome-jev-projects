import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reserveRadarBudgets, readRadarBudgetGrant, settleRadarBudgets, reserveControlBudgets, radarCaseId } from '../scripts/radar-budget.mjs';
import { budgetFixture } from './helpers/budget-fixture.mjs';
function entry(n=1,owner='logicrw'){
  const inspection={repo:{id:n,full_name:`${owner}/demo-${n}`,owner:{login:owner}},sha:n.toString(16).padStart(40,'0')};
  return{caseId:radarCaseId(inspection),inspection,needsSemanticReview:true};
}
const grant=(f,e,r,runId='100',runAttempt=1)=>readRadarBudgetGrant({api:f.api,caseId:e.caseId,reservationId:r.grants[0].reservationId,runId,runAttempt});

test('radar planning reserves remote state before issuing data-only grants',async()=>{
  const f=budgetFixture(),e=entry(),r=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[e]},runId:'100',runAttempt:1});
  assert.equal(r.grants.length,1);
  assert.ok(f.writes.some(write=>write.path.endsWith('/git/refs')));
  for(const write of f.writes.filter(write=>write.path.endsWith('/git/trees'))){assert.ok(write.body.tree.length<=100);assert.equal(write.body.tree[0].path,'radar/review-budget.json');assert.ok(write.body.tree.slice(1).every(entry=>/^radar\/review-budget-cases\/[a-f0-9]{2}\/[a-f0-9]{64}\.json$/.test(entry.path)));}
  const authorization=await grant(f,e,r);assert.equal(authorization.budgetGrant.grantTokens,6000);
  assert.equal(await grant(f,e,r,'100',2),null);
  assert.equal(await grant(f,e,r,'200',1),null);
  const again=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[e]},runId:'101',runAttempt:1});
  assert.equal(again.grants.length,0,'crash cannot turn a held reservation into a new grant');
});

test('radar and Issue-shaped cases share the same daily owner/global quota',async()=>{
  const f=budgetFixture();
  const entries=[entry(1,'submitter'),entry(2,'submitter'),entry(3,'submitter')];
  const r=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:entries},runId:'100',runAttempt:1,now:'2026-10-09T00:00:00Z'});
  assert.equal(r.grants.length,2);assert.equal(r.deferred[0].status,'daily-quota-exhausted');
  const issue=await reserveControlBudgets({api:f.api,cases:[{caseId:'d'.repeat(64),owner:'submitter',repository:'logicrw/issue-project'}],runId:'200',runAttempt:1,now:'2026-10-09T01:00:00Z'});
  assert.equal(issue.grants.length,0);assert.equal(issue.deferred[0].retryNotBefore,'2026-10-10T00:00:00.000Z');
});

test('settlement releases only trusted measured unused tokens and keeps cumulative case limits',async()=>{
  const f=budgetFixture(),e=entry(),r=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[e]},runId:'100',runAttempt:1});
  const g=await grant(f,e,r),ledger={...g.budgetLedger,chargedTokens:2100,httpAttempts:1,semanticRounds:1};
  assert.equal(await settleRadarBudgets({api:f.api,runId:'100',runAttempt:1,receipts:[{caseId:e.caseId,reservationId:r.grants[0].reservationId,budgetLedger:ledger}]}),true);
  const r2=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[e]},runId:'101',runAttempt:1});
  const g2=await grant(f,e,r2,'101');assert.equal(g2.budgetGrant.grantTokens,3900);assert.equal(g2.budgetLedger.httpAttempts,1);
  const spent=Object.values(f.registry().quota.reservations).reduce((sum,row)=>sum+(row.chargedTokens??row.grantTokens),0);
  assert.equal(spent,6000);
});

test('an unknown ref response is read back and not republished or refunded',async()=>{
  const f=budgetFixture(),e=entry();let lost=false;
  const api=async(path,options)=>{const result=await f.api(path,options);if(!lost&&options?.method==='POST'&&path.endsWith('/git/refs')){lost=true;throw Error('lost response');}return result;};
  const r=await reserveRadarBudgets({api,plan:{version:1,cases:[e]},runId:'100',runAttempt:1});
  assert.equal(r.grants.length,1);
  assert.equal(f.writes.filter(write=>write.path.endsWith('/git/refs')).length,1);
});

test('workflow separates discovery, control writes, model calls and settlement',async()=>{
  const text=await readFile(new URL('../.github/workflows/radar.yml',import.meta.url),'utf8');
  const plan=text.split('  plan:\n')[1].split('  reserve-budget:\n')[0];
  const reserve=text.split('  reserve-budget:\n')[1].split('  scan:\n')[0];
  const review=text.split('  scan:\n')[1].split('  settle-budget:\n')[0];
  const settle=text.split('  settle-budget:\n')[1].split('  validate:\n')[0];
  assert.match(plan,/--plan/);assert.doesNotMatch(plan,/^\s+(?:DEEPSEEK|MUSE)_API_KEY:/m);
  assert.match(reserve,/contents: write/);assert.doesNotMatch(reserve,/^\s+(?:DEEPSEEK|MUSE)_API_KEY:|npm /m);
  assert.match(review,/contents: read/);assert.doesNotMatch(review,/contents: write/);assert.match(review,/--review-plan/);
  assert.match(settle,/radar-budget\.mjs settle/);assert.doesNotMatch(settle,/API_KEY|npm /);
});

test('ten cached terminal cases cannot reserve the daily pool ahead of one new case',async()=>{
  const f=budgetFixture();
  const cached=Array.from({length:10},(_,index)=>({...entry(index+1,`owner${index}`),needsSemanticReview:false}));
  const fresh=entry(11,'newowner');
  const result=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[...cached,fresh]},runId:'100',runAttempt:1});
  assert.deepEqual(result.grants.map(row=>row.caseId),[fresh.caseId]);
  assert.equal(Object.keys(f.registry().quota.reservations).length,1);
});

test('old unknown daily rows are compacted without unlocking any permanent case or accepting stale settlement',async()=>{
  const f=budgetFixture();
  const {createQuotaRegistry}=await import('../scripts/budget-quota.mjs');
  const quota=createQuotaRegistry(),cases={};
  for(let index=0;index<10000;index++){
    const caseId=index.toString(16).padStart(64,'0'),day=new Date(Date.UTC(1990,0,1)+index*86400000).toISOString().slice(0,10),reservationId=`${day}:${caseId}`;
    quota.reservations[reservationId]={caseId,owner:'o',repository:'o/r',day,grantTokens:6000,chargedTokens:null};
    cases[caseId]={reservationId,runId:'100',runAttempt:1,status:'reserved',baseLedger:{version:1,caseId,limitTokens:6000,chargedTokens:0,httpAttempts:0,semanticRounds:0},grantTokens:6000,ledger:null};
  }
  f.seed({version:2,quota},cases);
  const fresh=entry(50000,'freshowner');
  const result=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[fresh]},runId:'200',runAttempt:1,now:'2026-10-09T00:00:00Z'});
  assert.equal(result.grants.length,1);assert.equal(Object.keys(f.registry().quota.reservations).length,1);
  const oldId='0'.repeat(64),prior=cases[oldId];
  assert.equal((await reserveControlBudgets({api:f.api,cases:[{caseId:oldId,owner:'o',repository:'o/r'}],runId:'201',runAttempt:1,now:'2026-10-09T01:00:00Z'})).grants.length,0);
  await assert.rejects(settleRadarBudgets({api:f.api,runId:'100',runAttempt:1,receipts:[{caseId:oldId,reservationId:prior.reservationId,budgetLedger:{...prior.baseLedger,chargedTokens:0}}]}),/Invalid global quota settlement/);
  assert.equal(f.registry().cases[oldId].status,'reserved');
});

test('legacy inline cases migrate without resetting an unknown reservation',async()=>{
  const first=budgetFixture(),e=entry();
  await reserveRadarBudgets({api:first.api,plan:{version:1,cases:[e]},runId:'100',runAttempt:1});
  const old=first.registry(),f=budgetFixture();f.seed({version:1,quota:old.quota,cases:old.cases});
  const result=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[e]},runId:'101',runAttempt:1});
  assert.equal(result.grants.length,0);assert.equal(f.registry().version,2);assert.equal(f.registry().cases[e.caseId].status,'reserved');
});

test('a fused provider authorizes only its delayed recovery probe and trusted accounting can close the circuit',async()=>{
  const f=budgetFixture(),first=entry(1),second=entry(2),third=entry(3);
  const a=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[first]},runId:'100',runAttempt:1,now:'2026-10-09T00:00:00Z'});
  const base=(await grant(f,first,a)).budgetLedger;
  await settleRadarBudgets({api:f.api,runId:'100',runAttempt:1,now:'2026-10-09T01:00:00Z',receipts:[{
    caseId:first.caseId,reservationId:a.grants[0].reservationId,budgetLedger:{...base,chargedTokens:6500,httpAttempts:1,semanticRounds:1},accountingVerified:true}]});
  const b=await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[second]},runId:'101',runAttempt:1,now:'2026-10-10T00:00:00Z'});
  assert.equal(b.grants.length,1);
  const probe=await readRadarBudgetGrant({api:f.api,caseId:second.caseId,reservationId:b.grants[0].reservationId,runId:'101',runAttempt:1,now:'2026-10-10T00:00:01Z'});
  assert.ok(probe);
  assert.equal((await reserveRadarBudgets({api:f.api,plan:{version:1,cases:[third]},runId:'102',runAttempt:1,now:'2026-10-10T00:00:02Z'})).grants.length,0);
  await settleRadarBudgets({api:f.api,runId:'101',runAttempt:1,now:'2026-10-10T00:00:03Z',receipts:[{
    caseId:second.caseId,reservationId:b.grants[0].reservationId,budgetLedger:{...probe.budgetLedger,chargedTokens:1000,httpAttempts:1,semanticRounds:1},accountingVerified:true}]});
  assert.equal(f.registry().quota.fused,false);
});
