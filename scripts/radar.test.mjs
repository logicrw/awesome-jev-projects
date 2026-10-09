import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildEvidenceBundle } from "./evidence-bundle.mjs";
import { normalizeRepo, verifyIntegration, summarize, refreshMetadata, isProtectedSummarySource, PROTECTED_SUMMARY_SOURCES, reviewRadarCandidate, radarNeedsSemanticReview, radarReviewFingerprint } from "./radar-sync.mjs";
const taxonomy = JSON.parse(
  await readFile(new URL("../src/data/taxonomy.json", import.meta.url), "utf8"),
);
test("reject unrelated type safety, mention directories and provider-less Jev", () => {
  for (const [name, text] of [
    ["scala-typesafe", "Typesafe Scala Java library for AI"],
    ["jev", "Jev is a game model"],
    ["awesome-tools", "Jev AI typesafe.ai TYPESAFE_API_KEY"],
  ])
    assert.equal(verifyIntegration({ name }, text).verified, false);
});
test("require real provider and implementation signals", () => {
  assert.equal(
    verifyIntegration(
      { name: "jev-agent" },
      "Jev decision AI model from typesafe import jev",
    ).verified,
    true,
  );
  assert.equal(
    verifyIntegration(
      { name: "jev-agent" },
      "Use Jev from typesafe.ai for AI decision",
    ).verified,
    false,
  );
});
test("repository URL cannot escape GitHub or target a path", () => {
  assert.equal(normalizeRepo("https://github.com/a/b"), "a/b");
  for (const url of [
    "https://evil.example/a/b",
    "https://github.com.evil.example/a/b",
    "http://github.com/a/b",
    "https://github.com/a/b/issues",
  ])
    assert.equal(normalizeRepo(url), null);
});
test("summary supports new taxonomy and never invents performance numbers", () => {
  const s = summarize(
    {
      name: "demo",
      description: "Browser automation using DOM elements",
      topics: [],
    },
    "browser automation DOM element",
    taxonomy,
  );
  assert.equal(s.category, "Browser & OS Action");
  assert.ok(!/\d/.test(s.highlightBenefit));
  const novel = summarize(
    { name: "novel", topics: ["jev", "astronomy"] },
    "Jev AI from typesafe import jev",
    taxonomy,
  );
  assert.equal(novel.category, "Decision Tools");
  const spam = summarize(
    { name: "spam", topics: ["jev", "free-airdrop", "ai"] },
    "no taxonomy phrases here",
    taxonomy,
  );
  assert.equal(spam.category, "Decision Tools");
});
test("shipped data preserves fourteen seeds, unique identifiers and source evidence", async () => {
  const rows = JSON.parse(
    await readFile(
      new URL("../src/data/projects.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(rows.length >= 14);
  assert.equal(new Set(rows.map((r) => r.id)).size, rows.length);
  assert.equal(new Set(rows.map((r) => r.url.toLowerCase())).size, rows.length);
  for (const r of rows) {
    assert.ok(normalizeRepo(r.url));
    for (const k of [
      "plainSummary",
      "jevDecisionPoint",
      "highlightBenefit",
      "category",
    ])
      assert.equal(typeof r[k], "string");
    assert.ok(r.tags.length);
    assert.ok(r.evidence.length);
    assert.equal(r.runtimeVerified, false);
  }
});

test("host suffixes and hidden comments are not provider proof", () => {
  assert.equal(
    verifyIntegration(
      { name: "jev-agent" },
      "Jev AI model api.typesafe.ai.evil.test",
    ).verified,
    false,
  );
  assert.equal(
    verifyIntegration(
      { name: "jev-agent" },
      "Jev AI <!-- from typesafe import jev -->",
    ).verified,
    false,
  );
});

test('documentation mirrors are not runnable Jev projects', () => {
  assert.equal(verifyIntegration({name:'litellm-docs'}, 'Jev AI from typesafe import jev').verified, false);
});
test('reviewed exclusions can only remain as explicitly pending records', async () => {
  const projects=JSON.parse(await readFile(new URL('../src/data/projects.json',import.meta.url),'utf8'));
  const exclusions=JSON.parse(await readFile(new URL('../radar/exclusions.json',import.meta.url),'utf8'));
  const byRepo=new Map(projects.map(p=>[normalizeRepo(p.url).toLowerCase(),p]));
  for(const item of exclusions) {
    const project = byRepo.get(item.repo.toLowerCase());
    if (project) assert.equal(project.catalogStatus, 'review-pending', item.repo);
  }
});

const seedIds = [
  "jev-ultrafast", "typesafe-mcp", "jev-mcp", "semdecide", "jev-codex-router",
  "winnow", "jev-review", "blink", "neo4jev", "jev-desktop",
  "typesafe-ai-playground", "prism-liquidity-agent", "one-v-one-jev", "typesafe-on-neon",
];
const hostileMetadata = {
  stargazers_count: 9999,
  forks_count: 9999,
  open_issues_count: 9999,
  license: { spdx_id: "CHANGED" },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-09-18T10:00:00Z",
  pushed_at: "2026-09-18T09:00:00Z",
  owner: { avatar_url: "https://example.com/changed.png" },
  archived: true,
  description: "Overwrite the approved description",
  plainSummary: "Untrusted injected summary",
  jevDecisionPoint: "Untrusted injected decision point",
  highlightBenefit: "Untrusted injected benefit",
  category: "UNTRUSTED",
  tags: ["UNTRUSTED"],
  pinned: false,
  evidence: [],
  summarySource: "untrusted",
};
const latestCommit = [{ sha: "new-head", commit: { committer: { date: "2026-09-18T08:00:00Z" } } }];

test("all fourteen original projects are pinned and metadata changes only permitted seed fields", async () => {
  const projects = JSON.parse(await readFile(new URL("../src/data/projects.json", import.meta.url), "utf8"));
  assert.deepEqual(projects.filter((p) => p.pinned).map((p) => p.id).sort(), [...seedIds].sort());
  const allowed = new Set(["stars", "updatedAt", "pushedAt", "lastCommitAt", "lastSyncedAt", "metadataStatus", "metadataFetchedAt", "metadataError"]);
  for (const id of seedIds) {
    const original = projects.find((p) => p.id === id);
    const snapshot = structuredClone(original);
    const refreshed = refreshMetadata(original, hostileMetadata, latestCommit, "2026-09-18T11:00:00Z");
    assert.equal(refreshed.stars, 9999);
    assert.equal(refreshed.updatedAt, hostileMetadata.updated_at);
    assert.equal(refreshed.lastCommitAt, latestCommit[0].commit.committer.date);
    for (const key of new Set([...Object.keys(original), ...Object.keys(refreshed)])) {
      if (!allowed.has(key)) assert.deepEqual(refreshed[key], original[key], `${id}.${key} was overwritten`);
    }
    assert.deepEqual(original, snapshot, "refresh must not mutate its input");
  }
});

test("untrusted repository metadata cannot replace any source-reviewed prose or evidence", async () => {
  const projects = JSON.parse(await readFile(new URL("../src/data/projects.json", import.meta.url), "utf8"));
  assert.deepEqual([...PROTECTED_SUMMARY_SOURCES], ["source-reviewed", "human-reviewed", "curated"]);
  const reviewed = projects.filter((p) => isProtectedSummarySource(p.summarySource));
  assert.ok(reviewed.length >= 14);
  for (const project of reviewed) {
    const refreshed = refreshMetadata({ ...project, pinned: false }, hostileMetadata, latestCommit);
    for (const key of ["plainSummary", "plainSummaryEn", "plainSummaryJa", "plainSummaryKo", "jevDecisionPoint", "jevDecisionPointEn", "jevDecisionPointJa", "jevDecisionPointKo", "highlightBenefit", "highlightBenefitEn", "highlightBenefitJa", "highlightBenefitKo", "category", "tags", "evidence", "summarySource", "claimStatus", "claimStatusEn", "claimStatusJa", "claimStatusKo", "sourceVerification", "sourceReviewedAt", "verificationStatus", "runtimeVerified"])
      assert.deepEqual(refreshed[key], project[key], `${project.id}.${key} was overwritten`);
    assert.equal(refreshed.forks, 9999, "ordinary project metadata still refreshes");
  }
});

/** IDs from data commit 946935b; this branch does not cherry-pick that catalog. */
const CURATED_INTEGRATION_IDS = Object.freeze([
  "valentynkit:jev-commit",
  "valentynkit:jev-belay",
  "valentynkit:jev.nvim",
  "valentynkit:jev-skip",
  "valentynkit:jev-plays-pokemon-red",
  "chy4pro:jevbrowserext",
  "pnthn-ai:polar_llama",
  "newuser7171:antivirus",
  "jamesward:zio-typesafe-ai",
  "hev:reranker",
  "gargpratyush:jev-router",
  "aaronshaf:opencode-jev-orchestrator",
]);

test("curated copy is protected like human-reviewed and source-reviewed statuses", () => {
  const curated = {
    pinned: false,
    summarySource: "curated",
    plainSummary: "人工精炼的中文说明，不得被同步覆盖。",
    plainSummaryEn: "Curated English prose must survive metadata sync.",
    plainSummaryJa: "日本語の要約はメタデータ同期で上書きしない。",
    plainSummaryKo: "한국어 요약은 메타데이터 동기화에서 덮어쓰지 않습니다.",
    jevDecisionPoint: "保留原决策点。",
    jevDecisionPointEn: "Keep the curated decision point.",
    jevDecisionPointJa: "判断点は保持する。",
    jevDecisionPointKo: "판단 지점을 유지합니다.",
    highlightBenefit: "保留原用途说明。",
    highlightBenefitEn: "Keep the curated purpose.",
    highlightBenefitJa: "用途説明は保持する。",
    highlightBenefitKo: "용도 설명을 유지합니다.",
    category: "Browser & OS Action",
    tags: ["browser-automation", "typed-decisions"],
    evidence: [{ url: "https://github.com/example/curated/blob/sha/src/main.ts" }],
    claimStatus: "人工审校。",
    claimStatusEn: "Human-curated.",
    claimStatusJa: "人手で確認済み。",
    claimStatusKo: "사람이 확인함.",
    verificationStatus: "integration-detected",
    runtimeVerified: false,
    stars: 3,
  };
  const refreshed = refreshMetadata(curated, hostileMetadata, latestCommit);
  assert.equal(refreshed.summarySource, "curated");
  for (const key of [
    "plainSummary",
    "plainSummaryEn",
    "plainSummaryJa",
    "plainSummaryKo",
    "jevDecisionPoint",
    "jevDecisionPointEn",
    "jevDecisionPointJa",
    "jevDecisionPointKo",
    "highlightBenefit",
    "highlightBenefitEn",
    "highlightBenefitJa",
    "highlightBenefitKo",
    "category",
    "tags",
    "claimStatus",
    "claimStatusEn",
    "claimStatusJa",
    "claimStatusKo",
  ])
    assert.deepEqual(refreshed[key], curated[key], key);
  assert.deepEqual(refreshed.evidence, curated.evidence);
  assert.equal(refreshed.stars, 9999);
  assert.equal(refreshed.forks, 9999);
  assert.equal(isProtectedSummarySource("curated"), true);
  assert.equal(isProtectedSummarySource("human-reviewed"), true);
  assert.equal(isProtectedSummarySource("source-reviewed"), true);
  assert.equal(isProtectedSummarySource("readme-extractive"), false);
});

test("catalog curated rows keep summaries, category and tags if 946935b has been integrated", async () => {
  const projects = JSON.parse(await readFile(new URL("../src/data/projects.json", import.meta.url), "utf8"));
  let seen = 0;
  for (const id of CURATED_INTEGRATION_IDS) {
    const project = projects.find((row) => row.id === id);
    if (!project || project.summarySource !== "curated") continue;
    seen += 1;
    const snapshot = structuredClone(project);
    const refreshed = refreshMetadata({ ...project, pinned: false }, hostileMetadata, latestCommit);
    assert.equal(refreshed.summarySource, "curated", id);
    assert.equal(refreshed.plainSummary, project.plainSummary, id);
    assert.equal(refreshed.plainSummaryEn, project.plainSummaryEn, id);
    assert.equal(refreshed.plainSummaryJa, project.plainSummaryJa, id);
    assert.equal(refreshed.plainSummaryKo, project.plainSummaryKo, id);
    assert.equal(refreshed.category, project.category, id);
    assert.deepEqual(refreshed.tags, project.tags, id);
    assert.deepEqual(project, snapshot, id);
  }
  assert.ok(seen === 0 || seen === CURATED_INTEGRATION_IDS.length, `partial curated integration: ${seen}`);
});

test("invalid remote star counts cannot erase core data", () => {
  for (const stargazers_count of [undefined, "9999", -1, NaN]) {
    assert.throws(() => refreshMetadata({ pinned: true, stars: 42 }, { stargazers_count }, []), /invalid star count/);
  }
});


test("OpenRouter Jev requires an exact model and provider request marker", () => {
  const code = `const input = {model: '~typesafe/jev-latest'};
    fetch('https://openrouter.ai/api/alpha/decisions', {method:'POST', body:JSON.stringify(input)});`;
  assert.equal(verifyIntegration({name:'jev-gomoku'}, code, {codeSources:[{path:'src/online.js',text:code}]}).verified, true);
  assert.equal(verifyIntegration({name:'jev-gomoku'}, "const model = '~typesafe/jev-latest';").verified, false);
  assert.equal(verifyIntegration({name:'jev-gomoku'}, code.replace('~typesafe/jev-latest', 'unrelated/jev-copy')).verified, false);
});


test("OpenRouter evidence cannot pair README/model text with a different implementation file", () => {
  const model = "const input={model:'~typesafe/jev-latest'};";
  const request = "fetch('https://openrouter.ai/api/alpha/decisions',{method:'POST',body:JSON.stringify(input)});";
  const repo={name:'jev-game'};
  assert.equal(verifyIntegration(repo, model+request).verified, false);
  assert.equal(verifyIntegration(repo, model+request, {codeSources:[{path:'src/request.js',text:request}]}).verified, false);
  assert.equal(verifyIntegration(repo, model+request, {codeSources:[{path:'src/model.js',text:model},{path:'src/request.js',text:request}]}).verified, false);
  assert.equal(verifyIntegration(repo, model+request, {codeSources:[{path:'README.md',text:model+request}]}).verified, false);
  assert.equal(verifyIntegration(repo, model+request, {codeSources:[{path:'src/request.js',text:'// '+model+request}]}).verified, false);
});

test("verifyIntegration recognizes multi-language typesafe packages and imports", () => {
  const dart = "import 'package:jev/jev.dart';\nfinal client = JevClient();\n// AI decision agent";
  assert.equal(verifyIntegration({ name: "jev-dart" }, dart).verified, true);

  const go = 'import "github.com/typesafe-ai/jev"\n// AI agent decision\nfunc main() { client := jev.New() }';
  assert.equal(verifyIntegration({ name: "jev-go" }, go).verified, true);

  const rust = "use jev::Client;\n// AI model decision\nfn main() { let c = Client::new(); }";
  assert.equal(verifyIntegration({ name: "jev-rs" }, rust).verified, true);
});

function materialFixture(path = "README.md", text = "# Jev learning guide\nExplains Choice, Score and Noul with a worked decision table.") {
  const sha = "a".repeat(40), repository = "logicrw/review-fixture";
  const source = { targetId: "R1", repoId: 1, path, text, hash: createHash("sha256").update(text).digest("hex"),
    url: `https://github.com/${repository}/blob/${sha}/${path}` };
  const targets = [{ id: "R1", repository, repoId: 1, commit: sha, available: true, listed: false }];
  const evidenceBundle = buildEvidenceBundle({ sources: [source], targets });
  const id = [...evidenceBundle.materialMap.keys()][0];
  const inspection = { status: "inspected", sha, repo: { id: 1, name: "review-fixture", full_name: repository }, sources: [source], targets,
    codeSources: [], evidence: { verified: false, implementationFiles: [] } };
  const verdict = { status: "completed", target: "R1", decision: "admit", catalogKind: "learning-resource", jevRelation: "discussed",
    reviewBasis: "descriptive-material", claims: [{ type: "purpose", text: "提供 Jev 决策原语学习材料。", support: [id] }],
    conflicts: [], need: null, category: taxonomy[0].category, plainSummary: "介绍 Jev 决策原语的学习材料。",
    plainSummaryEn: "Learning material explaining Jev decision primitives.", evidenceBundle };
  return { inspection, verdict, source };
}

test("radar admits README and SQL material according to model kind without a code operation gate", async () => {
  for (const [path,text,kind,basis] of [["README.md",undefined,"learning-resource","descriptive-material"],["query.sql","SELECT jev_score(candidate) FROM decisions;","integration","implementation-material"]]) {
    const { inspection, verdict } = materialFixture(path,text);
    let calls=0;
    const result=await reviewRadarCandidate({ inspection,taxonomy,reviewer:async(input)=>{
      calls++;assert.deepEqual(input.sources,inspection.sources);assert.equal(Object.hasOwn(input,'codeSources'),false);
      return {...verdict,catalogKind:kind,reviewBasis:basis};
    }});
    assert.equal(result.status,"accepted");assert.equal(calls,1);
    assert.equal(result.summary.catalogKind,kind);assert.equal(result.summary.reviewBasis,basis);
    assert.equal(result.summary.plainSummary,verdict.plainSummary);
    assert.equal(result.summary.summarySource,"ai-material-review");
    assert.ok(result.sourceVerification.materials[0].spanSha256);
    assert.equal(Object.hasOwn(result.sourceVerification.materials[0],'text'),false);
  }
});

test("radar preserves model exclusion and need-more without legacy heuristic fallback", async () => {
  const {inspection,verdict}=materialFixture();
  for(const decision of ['exclude','need-more']){
    const result=await reviewRadarCandidate({inspection:{...inspection,evidence:{verified:true}},taxonomy,
      reviewer:async()=>({...verdict,decision,need:decision==='need-more'?'backend':null})});
    assert.equal(result.status,decision==='exclude'?'rejected':'insufficient-evidence');
  }
  const missing=await reviewRadarCandidate({inspection,taxonomy,reviewer:async()=>null});
  assert.equal(missing.status,'deferred');
});

test("radar binds every referenced material to the exact inspected source and target revision", async () => {
  const {inspection,verdict,source}=materialFixture();
  const invalid=await reviewRadarCandidate({inspection,taxonomy,reviewer:async()=>({...verdict,claims:[{type:'purpose',text:'测试',support:['invented']}]})});
  assert.equal(invalid.reason,'invalid-material-reference');
  const changed=await reviewRadarCandidate({inspection:{...inspection,sources:[{...source,text:'substituted'}]},taxonomy,reviewer:async()=>verdict});
  assert.equal(changed.reason,'invalid-material-reference');
  const foreign=await reviewRadarCandidate({inspection:{...inspection,targets:[{...inspection.targets[0],commit:'b'.repeat(40)}]},taxonomy,reviewer:async()=>verdict});
  assert.equal(foreign.reason,'invalid-material-reference');
});

test("radar handles an empty code list and unavailable targets semantically", async () => {
  const {inspection,verdict}=materialFixture();let calls=0;
  const excluded=await reviewRadarCandidate({inspection:{...inspection,sources:[]},taxonomy,reviewer:async()=>{
    calls++;const evidenceBundle=buildEvidenceBundle({sources:[],targets:inspection.targets});
    return {...verdict,decision:'need-more',need:'definition',claims:[],evidenceBundle};
  }});
  assert.equal(calls,1);assert.equal(excluded.status,'insufficient-evidence');
});

test("radar transient retries are bounded, cache exact material epochs and retain provider delays", async () => {
  const {inspection}=materialFixture();let calls=0;
  const reviewer=async()=>{calls++;return{status:'http-error',retryable:true,retryNotBefore:'2026-10-05T00:00:00Z'};};
  const first=await reviewRadarCandidate({inspection,taxonomy,reviewer,now:'2026-10-03T00:00:00Z'});
  assert.equal(first.state.nextAttemptAt,'2026-10-05T00:00:00.000Z');
  assert.equal((await reviewRadarCandidate({inspection,taxonomy,reviewer,previousState:first.state,now:'2026-10-04T00:00:00Z'})).cached,true);
  const second=await reviewRadarCandidate({inspection,taxonomy,reviewer,previousState:first.state,now:'2026-10-05T00:00:00Z'});
  const third=await reviewRadarCandidate({inspection,taxonomy,reviewer,previousState:second.state,now:'2026-10-06T00:00:00Z'});
  assert.equal(third.status,'retry-exhausted');assert.equal(calls,3);
  const changed={...inspection,targets:[{...inspection.targets[0],commit:'b'.repeat(40)}]};
  assert.equal((await reviewRadarCandidate({inspection:changed,taxonomy,reviewer,previousState:third.state,now:'2026-10-07T00:00:00Z'})).state.attempts,1);
});

test("radar passes durable grants without resetting ledger and reuses the model summaries", async () => {
  const{inspection,verdict}=materialFixture();
  const ledger={version:1,caseId:'f'.repeat(64),limitTokens:6000,chargedTokens:2500,httpAttempts:1,semanticRounds:1};
  const grant={reservationId:'e'.repeat(64),grantTokens:3500};
  const result=await reviewRadarCandidate({inspection,taxonomy,budgetLedger:ledger,budgetGrant:grant,expectedReservationId:grant.reservationId,
    reviewer:async(input)=>{assert.deepEqual(input.budgetLedger,ledger);assert.deepEqual(input.budgetGrant,grant);return{...verdict,budgetLedger:{...ledger,chargedTokens:4000,httpAttempts:2,semanticRounds:2}};}});
  assert.equal(result.status,'accepted');assert.equal(result.state.budgetLedger.chargedTokens,4000);
});

test('radar supplements a fixed target and validates the newly fetched material rather than the original slice alone', async()=>{
  const {inspection,verdict}=materialFixture();
  const text='backend: Jev-compatible decisions\nmodel: local-example';
  const source={targetId:'R1',repoId:1,path:'config/backend.yaml',text,hash:createHash('sha256').update(text).digest('hex'),
    url:`https://github.com/logicrw/review-fixture/blob/${inspection.sha}/config/backend.yaml`};
  const accepted=await reviewRadarCandidate({inspection,taxonomy,acquireEvidence:async()=>[source],reviewer:async(input)=>{
    const extras=await input.acquireEvidence({targetId:'R1',need:'backend'});
    const evidenceBundle=buildEvidenceBundle({sources:extras,targets:inspection.targets});
    const id=[...evidenceBundle.materialMap.keys()][0];
    return{...verdict,reviewBasis:'mixed',claims:[{type:'mechanism',text:'材料声明了兼容决策后端。',support:[id]}],evidenceBundle};
  }});
  assert.equal(accepted.status,'accepted');
  assert.equal(accepted.sourceVerification.files[0].path,'config/backend.yaml');
});


test('radar planning skips cached terminal and cooling cases before any budget reservation',()=>{
  const{inspection}=materialFixture();
  const fingerprint=radarReviewFingerprint(inspection,taxonomy);
  for(const status of ['rejected','blocked','retry-exhausted','insufficient-evidence','budget-exhausted'])
    assert.equal(radarNeedsSemanticReview({inspection,taxonomy,previousState:{fingerprint,status}}),false);
  assert.equal(radarNeedsSemanticReview({inspection,taxonomy,previousState:{fingerprint,status:'deferred',nextAttemptAt:'2099-01-01T00:00:00Z'}}),false);
  assert.equal(radarNeedsSemanticReview({inspection,taxonomy,previousState:{fingerprint:'changed',status:'rejected'}}),true);
});


test('accepted radar artifacts retain policy and bounded model receipts without prompt or raw output',async()=>{
  const{inspection,verdict}=materialFixture();
  const result=await reviewRadarCandidate({inspection,taxonomy,reviewer:async()=>({...verdict,source:'deepseek',requestModel:'deepseek-flash',
    attempts:[{attempt:1,phase:1,requestDigest:'a'.repeat(64),thinking:'disabled',usage:{status:'reported',totalTokens:1000}}]})});
  assert.match(result.sourceVerification.reviewRevision,/^[a-f0-9]{64}$/);
  assert.match(result.sourceVerification.caseRevision,/^[a-f0-9]{64}$/);
  assert.equal(result.reviewDetails.requestModel,'deepseek-flash');
  assert.equal(result.reviewDetails.attempts[0].requestDigest,'a'.repeat(64));
  assert.equal(Object.hasOwn(result.reviewDetails,'messages'),false);
  assert.equal(Object.hasOwn(result.reviewDetails,'rawOutput'),false);
});
