import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeRepo, verifyIntegration, summarize, refreshMetadata, isProtectedSummarySource, PROTECTED_SUMMARY_SOURCES } from "./radar-sync.mjs";
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
