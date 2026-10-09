import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { reviewPolicyRevision } from "./review-policy.mjs";
import { retryState, retryRecord, renderRetryRecord, retryClaimId, selectRetry, markRetry, recoverRetry, claimRetry, settleRetry, validateRetryClaim, MAX_RETRIES, RETRY_LEASE_MS } from "./ingestion-retry.mjs";

const body = "## 项目仓库\nhttps://github.com/example/jev-tool";
const hash = (v) => createHash("sha256").update(v).digest("hex");
const candidate = { issueNumber: 12, bodySha: hash(body), titleSha: hash(""), reviewRevision: reviewPolicyRevision(), attempt: 1 };
candidate.claimId = retryClaimId(candidate);
const issue = { number: 12, state: "open", body };
const started = Date.parse("2026-10-03T00:00:00Z");
function comment(attempt, state = attempt ? "claimed" : "pending", patch = {}) {
  const c = { ...candidate, attempt };
  const record = { version: 3, issueNumber: c.issueNumber, bodySha: c.bodySha, titleSha: c.titleSha, reviewRevision: c.reviewRevision, attempt, state, claimId: attempt ? retryClaimId(c) : null };
  return { user: { login: "github-actions[bot]" }, body: renderRetryRecord(record), created_at: new Date(started).toISOString(), ...patch };
}
function fixture({ comments = [], current = issue, search = { items: [issue], total_count: 1 }, reread } = {}) {
  const writes = [], reads = [], warnings = [];
  let issueReads = 0;
  return { writes, reads, warnings, api: async (path, options = {}) => {
    if (options.method) { writes.push({ path, ...options }); comments.push({user:{login:"github-actions[bot]"},body:options.body.body,created_at:new Date(started).toISOString()}); return {}; }
    reads.push(path);
    if (path.startsWith("/search/issues?")) return search;
    if (path.includes("/comments?")) return comments;
    issueReads++;
    return {...(issueReads > 1 && reread ? reread : current),comments:comments.length};
  }};
}
const at = (offset = 0) => () => started + offset;

test("v2 records require trusted writer, complete template, exact revision and closed schema", () => {
  const opts = { issueNumber: 12 };
  assert.equal(retryState([comment(0), comment(2)], candidate.bodySha, opts), 2);
  assert.equal(retryState([comment(3, "claimed", {user:{login:"attacker"}})], candidate.bodySha, opts), -1);
  assert.equal(retryState([comment(0)], hash("edited"), opts), -1);
  assert.equal(retryState([comment(0, "pending", {body:`feedback: ${comment(3).body}`})], candidate.bodySha, opts), -1);
  assert.equal(retryState([comment(0, "pending", {body:comment(0).body.replace('"version":3','"version":3,"extra":true')})], candidate.bodySha, opts), -1);
});

test("only explicitly configured PAT writers are trusted", async () => {
  const comments = [comment(0, "pending", {user:{login:"logicrw"}})];
  assert.equal(await selectRetry({ api: fixture({comments}).api, now: at() }), null);
  assert.equal((await selectRetry({ api: fixture({comments}).api, now: at(), trustedWriter:"logicrw" })).attempt, 1);
  assert.equal((await selectRetry({ api: fixture({comments}).api, now: at(), trustedWriter:"LogicRW" })).attempt, 1);
  assert.equal(await selectRetry({ api: fixture({comments:[comment(0,"pending",{user:{login:"unrelated[bot]"}})]}).api, now:at() }), null);
});

test("queue selects claims and finishes exhausted, edited or closed revisions", async () => {
  const f = fixture({ comments: [comment(0)] });
  assert.deepEqual(await selectRetry({api:f.api,now:at()}), {...candidate,action:"review"});
  for (const current of [{...issue,state:"closed"},{...issue,body:"edited"}]) {
    const selected = await selectRetry({api:fixture({comments:[comment(0)],current}).api,now:at()});
    assert.equal(selected.action,"finish"); assert.equal(selected.state,"superseded");
  }
  const selected = await selectRetry({api:fixture({comments:[comment(MAX_RETRIES)]}).api,now:at(RETRY_LEASE_MS)});
  assert.equal(selected.action,"finish"); assert.equal(selected.state,"exhausted");
  assert.equal(await selectRetry({api:fixture({comments:[comment(1,"rejected")]}).api,now:at(RETRY_LEASE_MS)}),null);
});

test("queue windows rotate and report partial coverage without stopping all candidates", async () => {
  const f = fixture({comments:[comment(0)],search:{items:[issue],total_count:90}});
  await selectRetry({api:f.api,now:()=>1_800_000});
  assert.match(f.reads[1],/page=2$/);
  for (const search of [{items:[issue],total_count:1001},{items:[issue],incomplete_results:true}]) {
    const warnings=[];
    assert.ok(await selectRetry({api:fixture({comments:[comment(0)],search}).api,now:at(),onWarning:m=>warnings.push(m)}));
    assert.equal(warnings.length,1);
  }
});

test("mark persists once and dry-run methods never read or write", async () => {
  const f=fixture();
  assert.equal(await markRetry({api:f.api,candidate}),true);
  assert.equal(await markRetry({api:f.api,candidate}),false);
  assert.equal(f.writes.length,1);
  const api=async()=>{throw new Error("dry run must not call API");};
  assert.equal(await markRetry({api,candidate,dryRun:true}),false);
  assert.equal(await claimRetry({api,candidate,dryRun:true}),false);
  assert.equal(await settleRetry({api,candidate,state:"rejected",dryRun:true}),false);
});

test("unknown POST delivery is read back instead of blindly duplicated", async () => {
  const f=fixture();
  let delivered=0;
  const api=async(path,options)=>{
    const result=await f.api(path,options);
    if(options?.method){delivered++;throw new Error("response lost after delivery");}
    return result;
  };
  await assert.rejects(markRetry({api,candidate}),/response lost/);
  assert.equal(await markRetry({api,candidate}),false);
  assert.equal(delivered,1);
});

test("claim persists before dispatch, enforces lease and validates identity", async () => {
  const f=fixture({comments:[comment(0)]});
  assert.equal(await claimRetry({api:f.api,candidate,now:at()}),true);
  assert.equal(await claimRetry({api:f.api,candidate,now:at()}),false);
  assert.equal(await validateRetryClaim({api:f.api,candidate,now:at()}),true);
  assert.equal(await validateRetryClaim({api:f.api,candidate:{...candidate,claimId:"a".repeat(64)},now:at()}),false);
  assert.equal(await validateRetryClaim({api:f.api,candidate,now:at(RETRY_LEASE_MS)}),false);
  const next={...candidate,attempt:2};next.claimId=retryClaimId(next);
  assert.equal(await claimRetry({api:f.api,candidate:next,now:at(RETRY_LEASE_MS-1)}),false);
  assert.equal(await claimRetry({api:f.api,candidate:next,now:at(RETRY_LEASE_MS)}),true);
  assert.equal(await validateRetryClaim({api:f.api,candidate,now:at()}),false);
});

test("terminal results persist once, suppress retries and cannot be replaced by late claims", async () => {
  for (const state of ["completed","rejected","insufficient-evidence","provider-unavailable","invalid-output"]) {
    const f=fixture({comments:[comment(0),comment(1)]});
    assert.equal(await settleRetry({api:f.api,candidate,state}),true);
    assert.equal(await settleRetry({api:f.api,candidate,state}),false);
    assert.equal(await selectRetry({api:f.api,now:at(RETRY_LEASE_MS)}),null);
    assert.equal(await validateRetryClaim({api:f.api,candidate,now:at()}),false);
    assert.equal(f.writes.length,1);
  }
});

test("exhaustion and supersession are observable terminal records", async () => {
  const c={...candidate,attempt:3};c.claimId=retryClaimId(c);
  const f=fixture({comments:[comment(3)]});
  assert.equal(await settleRetry({api:f.api,candidate:c,state:"exhausted"}),true);
  assert.match(f.writes[0].body.body,/额度已用尽/);
  assert.equal(await settleRetry({api:f.api,candidate:c,state:"exhausted"}),false);
  const changed=fixture({comments:[comment(0)],current:{...issue,body:"changed"}});
  assert.equal(await settleRetry({api:changed.api,candidate:{issueNumber:12,bodySha:candidate.bodySha},state:"superseded"}),true);
});

test("unknown dispatch holds the claim and cannot immediately create another attempt", async () => {
  const f=fixture({comments:[comment(0),comment(1)]});
  assert.equal(await settleRetry({api:f.api,candidate,state:"dispatch-unknown"}),true);
  assert.equal(await settleRetry({api:f.api,candidate,state:"dispatch-unknown"}),false);
  assert.equal(await validateRetryClaim({api:f.api,candidate,now:at()}),true);
  assert.equal(await selectRetry({api:f.api,now:at(RETRY_LEASE_MS-1)}),null);
  assert.equal((await selectRetry({api:f.api,now:at(RETRY_LEASE_MS)})).attempt,2);
});

test("provider Retry-After survives workflow handoff and is never shortened by the scheduler", async () => {
  const f=fixture();
  const retryNotBefore=new Date(started+6*60*60*1000).toISOString();
  assert.equal(await markRetry({api:f.api,candidate:{...candidate,retryNotBefore}}),true);
  assert.equal(await selectRetry({api:f.api,now:at(5*60*60*1000)}),null);
  assert.equal(await claimRetry({api:f.api,candidate,now:at(5*60*60*1000)}),false);
  assert.equal((await selectRetry({api:f.api,now:at(6*60*60*1000)})).attempt,1);
  assert.equal(await claimRetry({api:f.api,candidate,now:at(6*60*60*1000)}),true);
  const later=new Date(started+48*60*60*1000).toISOString();
  assert.equal(await markRetry({api:f.api,candidate:{...candidate,retryNotBefore:later}}),true);
  assert.equal(await selectRetry({api:f.api,now:at(47*60*60*1000)}),null);
  assert.equal(retryRecord(await f.api('/comments?'),candidate).attempt,1);
  await assert.rejects(markRetry({api:fixture().api,candidate:{...candidate,retryNotBefore:'tomorrow'}}),/Invalid retry not-before/);
});

test("failure recovery queues current submissions only and retains expected revision checks", async () => {
  const f=fixture();
  assert.equal(await recoverRetry({api:f.api,issueNumber:12}),true);
  for(const current of [{...issue,number:13},{...issue,pull_request:{}},{...issue,state:'closed'},{...issue,body:'ordinary support question'}]){
    const bad=fixture({current});
    assert.equal(await recoverRetry({api:bad.api,issueNumber:12}),false);
    assert.equal(bad.writes.length,0);
  }
  const stale=fixture();
  assert.equal(await recoverRetry({api:stale.api,issueNumber:12,expectedBodySha:hash('different')}),false);
  assert.equal(stale.writes.length,0);
  assert.equal(await recoverRetry({api:async()=>{throw Error('API forbidden');},issueNumber:12,dryRun:true}),false);
});

test("workflow carries revision and claim, forbids dry-run queue writes and uses dedicated bot", async () => {
  const workflow=await readFile(new URL("../.github/workflows/reconcile-ingestion.yml",import.meta.url),"utf8");
  assert.match(workflow,/cron: "17,47 \* \* \* \*"/);
  assert.match(workflow,/retry_claim_id=\$CLAIM_ID/);
  assert.match(workflow,/body_sha=\$BODY_SHA/);
  assert.match(workflow,/INGEST_RETRY_STATE: dispatch-unknown/);
  assert.doesNotMatch(workflow,/npm |contents: write|pull_request_target|API_KEY:/);
  const ingestion=await readFile(new URL("../.github/workflows/auto-ingest-issue.yml",import.meta.url),"utf8");
  const record=ingestion.split("  record-retry:\n")[1].split("  respond-feedback:\n")[0];
  assert.match(record,/!inputs\.dry_run/);
  assert.match(record,/GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(record,/INGEST_DRY_RUN:/);
  assert.match(record,/!inputs\.remote_probe && !inputs\.models_probe/);
  assert.match(record,/needs: \[reserve-budget, review, settle-budget, validate, publish\]/);
  for(const stage of ['review','validate','publish'])assert.ok(record.includes(`needs.${stage}.result == 'failure'`));
  assert.match(record,/ingestion-retry\.mjs recover/);
  assert.match(record,/github\.event\.issue\.number \|\| inputs\.issue_number/);
  const feedback=ingestion.split("  respond-feedback:\n")[1];
  assert.match(feedback,/contains\(fromJSON\('\["rejected","duplicate","insufficient-evidence","invalid-output","provider-unavailable","budget-exhausted"\]'\), needs\.review\.outputs\.status\)/);
  assert.match(feedback,/!inputs\.dry_run/);
  assert.match(feedback,/GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
});


test('a changed title invalidates a scheduled claim without spending or resetting it',async()=>{
  const f=fixture({comments:[comment(0)],current:{...issue,title:'new target'}});
  const prior={...candidate,titleSha:hash('old target')};prior.claimId=retryClaimId(prior);
  assert.equal(await claimRetry({api:f.api,candidate:prior,now:at()}),false);
  assert.equal(f.writes.length,0);
});

test('legacy terminal records do not veto a new title or policy epoch',async()=>{
  const old={version:2,issueNumber:12,bodySha:candidate.bodySha,attempt:0,state:'rejected',claimId:null};
  const f=fixture({comments:[{user:{login:'github-actions[bot]'},body:renderRetryRecord(old)}]});
  assert.equal(await markRetry({api:f.api,candidate}),true);
  const selected=await selectRetry({api:f.api,now:at()});
  assert.equal(selected.reviewRevision,candidate.reviewRevision);
  assert.equal(selected.attempt,1);
});

test('legacy active migration retains a provider not-before deadline',async()=>{
  const old={version:2,issueNumber:12,bodySha:candidate.bodySha,attempt:0,state:'pending',claimId:null,notBefore:new Date(started+48*60*60*1000).toISOString()};
  const f=fixture({comments:[{user:{login:'github-actions[bot]'},body:renderRetryRecord(old)}]});
  assert.equal(await selectRetry({api:f.api,now:at()}),null);
  assert.equal((await selectRetry({api:f.api,now:at(48*60*60*1000)})).reviewRevision,candidate.reviewRevision);
});
