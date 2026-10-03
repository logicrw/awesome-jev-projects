import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { parseRetryRecord, renderRetryRecord, retryClaimId, retryRecord, selectRetry, markRetry, claimRetry, settleRetry } from "../scripts/ingestion-retry.mjs";
const body="repository: https://github.com/logicrw/example";
const bodySha=createHash("sha256").update(body).digest("hex");
const candidate={issueNumber:12,bodySha,attempt:3};
const record={version:2,...candidate,state:"claimed",claimId:retryClaimId(candidate)};
const c=(body,login="github-actions[bot]")=>({user:{login},body,created_at:"2026-10-03T00:00:00Z"});

test("model-prose markers and untrusted whole-record copies cannot poison control state",()=>{
  const valid=renderRetryRecord(record);
  for(const text of [`审查分析：${valid}`,`> ${valid}`,`\`\`\`\n${valid}\n\`\`\``,`${valid}\n<!-- awesome-jev-review-feedback:12 -->`,`<!-- awesome-jev-retry:v1:${bodySha}:3 -->`])
    assert.equal(parseRetryRecord(c(text),{issueNumber:12}),null);
  assert.equal(parseRetryRecord(c(valid,"attacker"),{issueNumber:12}),null);
  assert.equal(parseRetryRecord(c(valid,"github-actions-fake[bot]"),{issueNumber:12}),null);
  assert.equal(parseRetryRecord(c(valid),{issueNumber:13}),null);
});

test("legacy migration requires full exact machine template and explicitly trusted PAT",()=>{
  const text=`正在安排第 3/3 次自动重新审核；收录结果会在实际部署核验后通知。\n\n<!-- awesome-jev-retry:v1:${bodySha}:3 -->`;
  assert.equal(parseRetryRecord(c(text,"logicrw"),{issueNumber:12}),null);
  assert.equal(parseRetryRecord(c(text,"logicrw"),{issueNumber:12,trustedWriter:"logicrw"}).legacy,true);
  assert.equal(parseRetryRecord(c(`审查分析：${text}`,"logicrw"),{issueNumber:12,trustedWriter:"logicrw"}),null);
});

function floodedFixture({lateState='pending',earlyState='claimed'}={}){
  const first={...record,state:earlyState};
  const late={version:2,issueNumber:12,bodySha,attempt:0,state:lateState,claimId:null};
  const rows=[c(renderRetryRecord(first)),...Array.from({length:600},()=>c('ordinary comment','attacker')),c(renderRetryRecord(late))];
  const second={version:2,issueNumber:13,bodySha,attempt:0,state:'pending',claimId:null};
  const reads=[],writes=[];
  const api=async(path,options={})=>{
    if(options.method){writes.push(options);rows.push(c(options.body.body));return{};}
    reads.push(path);
    if(path.startsWith('/search/issues'))return{total_count:2,items:[{number:12},{number:13}]};
    if(path.includes('/12/comments')){const p=Number(new URL('https://api.github.com'+path).searchParams.get('page'));return rows.slice((p-1)*100,p*100);}
    if(path.includes('/13/comments'))return[c(renderRetryRecord(second))];
    return{number:path.includes('/12')?12:13,state:'open',body,comments:path.includes('/12')?rows.length:1};
  };
  return{api,rows,reads,writes};
}

test('a buried attempt 3 cannot be reset by a partial history or late pending marker',async()=>{
  const f=floodedFixture();
  const result=await selectRetry({api:f.api,now:()=>Date.parse('2026-10-04T00:00:00Z')});
  assert.equal(result.state,'control-budget-exhausted');
  assert.equal(result.action,'finish');
  assert.ok(f.reads.find(p=>p.includes('page=7')));
  assert.equal(await settleRetry({api:f.api,candidate:result,state:result.state}),true);
  assert.match(f.writes[0].body.body,/状态历史超过读取预算/);
  assert.match(f.writes[0].body.body,/不表示已执行 3 次重试/);
  assert.equal(await settleRetry({api:f.api,candidate:result,state:result.state}),false);
  const next=await selectRetry({api:f.api,now:()=>Date.parse('2026-10-04T00:00:00Z')});
  assert.equal(next.issueNumber,13);
  assert.equal(f.writes.length,1);
});

test('mark and claim fail closed with an observable terminal when old state cannot be proven',async()=>{
  const f=floodedFixture();
  assert.equal(await markRetry({api:f.api,candidate:{issueNumber:12,bodySha}}),true);
  assert.equal(parseRetryRecord(c(f.writes[0].body.body),{issueNumber:12}).state,'control-budget-exhausted');
  const g=floodedFixture();
  const next={issueNumber:12,bodySha,attempt:1};next.claimId=retryClaimId(next);
  assert.equal(await claimRetry({api:g.api,candidate:next}),false);
  assert.equal(parseRetryRecord(c(g.writes[0].body.body),{issueNumber:12}).state,'control-budget-exhausted');
});

test('a recent trusted terminal is sufficient and earlier/later attempts cannot override it',async()=>{
  const f=floodedFixture({lateState:'rejected'});
  assert.equal((await selectRetry({api:f.api,now:()=>0})).issueNumber,13);
  assert.equal(await markRetry({api:f.api,candidate:{issueNumber:12,bodySha}}),false);
  const terminal={...record,attempt:0,state:'rejected',claimId:null};
  assert.equal(retryRecord([c(renderRetryRecord(terminal)),c(renderRetryRecord(record))],candidate).state,'rejected');
  assert.equal(retryRecord([c(renderRetryRecord(record)),c(renderRetryRecord(terminal))],candidate).state,'rejected');
});

test('ordinary issues with attacker retry text never receive control records',async()=>{
  let writes=0;
  const api=async(path,options={})=>{
    if(options.method){writes++;return{};}
    if(path.startsWith('/search/issues'))return{total_count:1,items:[{number:12}]};
    if(path.includes('/comments'))return Array.from({length:100},()=>c('awesome-jev-retry','attacker'));
    return{number:12,state:'open',body:'normal support question',comments:700};
  };
  assert.equal(await selectRetry({api}),null);
  assert.equal(writes,0);
});

test("CLI dry-run refuses writes before credentials or any network are needed",()=>{
  const file=new URL("../scripts/ingestion-retry.mjs",import.meta.url).pathname;
  for(const command of ["mark","recover","claim","finish"]){
    const result=spawnSync(process.execPath,[file,command],{encoding:"utf8",env:{PATH:process.env.PATH,GITHUB_REPOSITORY:"logicrw/awesome-jev-projects",INGEST_DRY_RUN:"true"}});
    assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/writes disabled/);
  }
});
