import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildEvidenceBundle } from "./evidence-bundle.mjs";
import { normalizeRepo, verifyIntegration, summarize, refreshMetadata, isProtectedSummarySource, PROTECTED_SUMMARY_SOURCES, reviewRadarCandidate } from "./radar-sync.mjs";
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

function witnessFixture() {
  const sha = "a".repeat(40);
  const text = 'import {JevClient} from "jev";\nconst client = new JevClient();\nconst result = client.choice(input);\nreturn result;';
  const source = {
    path: "src/client.js", text,
    hash: createHash("sha256").update(text).digest("hex"),
    url: `https://github.com/logicrw/review-fixture/blob/${sha}/src/client.js`,
  };
  const evidenceBundle = buildEvidenceBundle({ codeSources: [source] });
  const id = evidenceBundle.modelData.nodes.find((node) => node.kind === "operation").id;
  const inspection = {
    status: "inspected", sha, repo: { id: 1, name: "review-fixture", full_name: "logicrw/review-fixture" }, codeSources: [source],
    // A positive legacy heuristic must have no authority over the semantic verdict.
    evidence: { verified: true, implementationFiles: [source], files: [source] },
  };
  const verdict = {
    status: "completed", verified: true, role: "client", reasonCode: "implementation-observed",
    category: taxonomy[0].category, plainSummary: "源码使用结构化选择接口处理输入。",
    plainSummaryEn: "The source processes input through a structured choice interface.",
    witness: { entry: [id], operation: [id], result: [id] },
    evidenceBundle, witnessValidated: true,
  };
  return { inspection, verdict, source };
}

test("radar cannot promote legacy matches after a model rejection or missing response", async () => {
  const { inspection, verdict } = witnessFixture();
  const rejected = await reviewRadarCandidate({ inspection, taxonomy, reviewer: async () => ({
    ...verdict, verified: false, role: "none", reasonCode: "not-integrated", category: null,
    plainSummary: "", plainSummaryEn: "", witness: { entry: [], operation: [], result: [] },
  }) });
  assert.equal(rejected.status, "rejected");
  const missing = await reviewRadarCandidate({ inspection, taxonomy, reviewer: async () => null });
  assert.equal(missing.status, "deferred");
  assert.equal(missing.implementationFiles, undefined);
});

test("radar admission resolves the model witness against the exact inspected sources", async () => {
  const { inspection, verdict, source } = witnessFixture();
  const accepted = await reviewRadarCandidate({ inspection, taxonomy, reviewer: async () => verdict });
  assert.equal(accepted.status, "accepted");
  assert.deepEqual(accepted.implementationFiles, [source]);
  assert.equal(accepted.reviewed.category, verdict.category);
  assert.equal(accepted.reviewed.plainSummary, verdict.plainSummary);
  assert.equal(accepted.summary.category, verdict.category);
  assert.equal(accepted.summary.plainSummary, verdict.plainSummary);
  assert.equal(accepted.summary.plainSummaryEn, verdict.plainSummaryEn);
  assert.equal(accepted.summary.summarySource, "ai-evidence-witness");
  assert.ok(accepted.summary.tags.length > 0);
  assert.match(accepted.summary.highlightBenefit, /尚无独立运行或性能验证/);

  const fabricated = await reviewRadarCandidate({ inspection, taxonomy, reviewer: async () => ({
    ...verdict, witness: { ...verdict.witness, operation: ["invented"] },
  }) });
  assert.equal(fabricated.status, "deferred");
  assert.equal(fabricated.reason, "invalid-witness");

  const substituted = await reviewRadarCandidate({
    inspection: { ...inspection, codeSources: [{ ...source, text: "return false;" }] },
    taxonomy, reviewer: async () => verdict,
  });
  assert.equal(substituted.status, "deferred");
  assert.equal(substituted.reason, "invalid-witness");
});

test("radar cannot relabel uninspected legacy acceptance as semantic verification", async () => {
  const { inspection, verdict } = witnessFixture();
  let calls = 0;
  const decision = await reviewRadarCandidate({
    inspection: { ...inspection, status: "accepted" }, taxonomy,
    reviewer: async () => { calls++; return verdict; },
  });
  assert.equal(decision.status, "rejected");
  assert.equal(calls, 0);
});

test("radar transient attempts stop after three cycles and restart on new evidence", async () => {
  const { inspection } = witnessFixture();
  let calls = 0;
  const reviewer = async () => { calls++; return { verified: null, status: "timeout", retryable: true }; };
  const base = { inspection, taxonomy, reviewer };
  const first = await reviewRadarCandidate({ ...base, now: "2026-10-03T00:00:00Z" });
  assert.equal(first.status, "deferred");
  const cooling = await reviewRadarCandidate({ ...base, previousState: first.state, now: "2026-10-03T01:00:00Z" });
  assert.equal(cooling.cached, true);
  assert.equal(calls, 1);
  const second = await reviewRadarCandidate({ ...base, previousState: first.state, now: "2026-10-03T06:00:00Z" });
  const third = await reviewRadarCandidate({ ...base, previousState: second.state, now: "2026-10-03T18:00:00Z" });
  assert.equal(third.status, "retry-exhausted");
  const stopped = await reviewRadarCandidate({ ...base, previousState: third.state, now: "2026-10-10T18:00:00Z" });
  assert.equal(stopped.status, "retry-exhausted");
  assert.equal(stopped.cached, true);
  assert.equal(calls, 3);
  const changed = await reviewRadarCandidate({
    ...base, inspection: { ...inspection, sha: "b".repeat(40) }, previousState: third.state, now: "2026-10-10T18:00:00Z",
  });
  assert.equal(changed.status, "deferred");
  assert.equal(changed.state.attempts, 1);
  assert.equal(calls, 4);
  assert.equal(JSON.stringify(changed.state).includes(inspection.codeSources[0].text), false);
});

test("radar records permanent provider failure without repeated paid attempts", async () => {
  const { inspection } = witnessFixture();
  let calls = 0;
  const reviewer = async () => { calls++; return { verified: null, status: "http-unauthorized", retryable: false }; };
  const first = await reviewRadarCandidate({ inspection, taxonomy, reviewer });
  assert.equal(first.status, "blocked");
  const cached = await reviewRadarCandidate({ inspection, taxonomy, reviewer, previousState: first.state });
  assert.equal(cached.cached, true);
  assert.equal(calls, 1);
  await reviewRadarCandidate({ inspection, taxonomy, reviewer, previousState: first.state, configRevision: "reconfigured" });
  assert.equal(calls, 2);
});

test("radar respects provider Retry-After beyond its scheduled backoff", async () => {
  const { inspection } = witnessFixture();
  let calls = 0;
  const reviewer = async () => { calls++; return {
    verified: null, status: "http-error", retryable: true,
    retryNotBefore: "2026-10-04T00:00:00Z",
  }; };
  const first = await reviewRadarCandidate({ inspection, taxonomy, reviewer, now: "2026-10-03T00:00:00Z" });
  assert.equal(first.state.nextAttemptAt, "2026-10-04T00:00:00.000Z");
  const delayed = await reviewRadarCandidate({
    inspection, taxonomy, reviewer, previousState: first.state, now: "2026-10-03T18:00:00Z",
  });
  assert.equal(delayed.cached, true);
  assert.equal(calls, 1);
});

test("radar persists all cross-file witness nodes and immutable line ranges through JSON", async () => {
  const { inspection, verdict, source } = witnessFixture();
  const text = 'export const input = { candidates: ["safe"] };\nexport const resultField = "answer";';
  const context = { path: "src/definitions.js", text,
    hash: createHash("sha256").update(text).digest("hex"),
    url: `https://github.com/logicrw/review-fixture/blob/${inspection.sha}/src/definitions.js` };
  const sources = [source, context];
  const evidenceBundle = buildEvidenceBundle({ codeSources: sources });
  const nodes = [...evidenceBundle.nodeMap];
  const operationId = nodes.find(([, node]) => node.source.path === source.path)[0];
  const contextId = nodes.find(([, node]) => node.source.path === context.path)[0];
  const witness = { entry: [contextId], operation: [operationId], result: [contextId] };
  const accepted = await reviewRadarCandidate({
    inspection: { ...inspection, codeSources: sources }, taxonomy,
    reviewer: async () => ({ ...verdict, evidenceBundle, witness }),
  });
  assert.equal(accepted.status, "accepted");
  const restored = JSON.parse(JSON.stringify(accepted.sourceVerification));
  assert.deepEqual(restored.implementationFiles, [source.path]);
  assert.deepEqual(new Set(restored.files.map(({ path }) => path)), new Set(sources.map(({ path }) => path)));
  for (const id of new Set(Object.values(restored.witness).flat())) {
    const node = restored.nodes.find((entry) => entry.id === id);
    const file = restored.files.find((entry) => entry.path === node.path);
    const original = sources.find((entry) => entry.path === node.path);
    assert.equal(node.hash, original.hash);
    assert.equal(file.hash, original.hash);
    assert.equal(file.url, original.url);
    assert.deepEqual(node.ranges, evidenceBundle.nodeMap.get(id).ranges);
    assert.ok(node.startLine >= 1 && node.endLine <= original.text.split("\n").length);
    assert.equal(Object.hasOwn(file, "text"), false);
    assert.equal(Object.hasOwn(node, "source"), false);
  }

  const substituted = { ...context, text: context.text + '\nexport const override = "unreviewed";' };
  substituted.hash = createHash("sha256").update(substituted.text).digest("hex");
  const substitutedBundle = buildEvidenceBundle({ codeSources: [source, substituted] });
  for (const slot of ["entry", "result"]) {
    const decision = await reviewRadarCandidate({
      inspection: { ...inspection, codeSources: sources }, taxonomy,
      reviewer: async () => ({ ...verdict, evidenceBundle: substitutedBundle,
        witness: { entry: [operationId], operation: [operationId], result: [operationId], [slot]: [contextId] } }),
    });
    assert.equal(decision.status, "deferred", slot);
    assert.equal(decision.reason, "invalid-witness", slot);
  }
});

test("radar rejects a witness from a different fixed repository revision", async () => {
  const { inspection, verdict, source } = witnessFixture();
  const foreign = { ...source, url: source.url.replace(inspection.sha, "b".repeat(40)) };
  const evidenceBundle = buildEvidenceBundle({ codeSources: [foreign] });
  const decision = await reviewRadarCandidate({
    inspection: { ...inspection, codeSources: [foreign] }, taxonomy,
    reviewer: async () => ({ ...verdict, evidenceBundle }),
  });
  assert.equal(decision.status, "deferred");
  assert.equal(decision.reason, "invalid-witness");
});
