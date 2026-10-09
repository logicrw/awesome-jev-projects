import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createSubmissionReviewer } from "../scripts/source-enrichment.mjs";
import { requestBudget } from "../scripts/review-budget.mjs";

const sha = "b".repeat(40);
const target = { id: "R1", repository: "logicrw/demo", repoId: 1, commit: sha, available: true, listed: false };
function file(text = "# Jev tutorial\n\nExplains how Jev structures decision calls and includes complete worked examples.", path = "README.md", selected = target) {
  return { text, path, targetId: selected.id, repoId: selected.repoId, commit: selected.commit, repository: selected.repository,
    hash: createHash("sha256").update(text).digest("hex"), url: `https://github.com/${selected.repository}/blob/${selected.commit}/${path}` };
}
const input = { sources: [file()], targets: [target], taxonomy: [{ category: "CLI & Pipelines" }], allowUnreserved: true };
function verdict(options, overrides = {}) {
  const data = JSON.parse(JSON.parse(options.body).messages[1].content), material = data.evidence.materials[0];
  return { target: material.targetId, decision: "admit", catalogKind: "learning-resource", jevRelation: "described", reviewBasis: "descriptive-material",
    claims: [{ type: "purpose", text: "Explains Jev with worked examples.", support: [material.id] }], conflicts: [], need: null, category: 0,
    plainSummary: "通过示例解释 Jev 决策接口与调用方法。", plainSummaryEn: "Explains Jev decision APIs through worked examples.", ...overrides };
}
function response(value, extra = {}, tokens = 600) {
  return new Response(JSON.stringify({ model: "deepseek-flash", system_fingerprint: "fp_baseline",
    choices: [{ finish_reason: "stop", message: { content: typeof value === "string" ? value : JSON.stringify(value) } }],
    usage: { prompt_tokens: tokens - 100, completion_tokens: 100, total_tokens: tokens,
      prompt_cache_hit_tokens: 100, prompt_cache_miss_tokens: tokens - 200, completion_tokens_details: { reasoning_tokens: 0 } }, ...extra }));
}
function grant(base = {}) {
  const budgetLedger = { version: 1, caseId: "case:fixture", limitTokens: 6000, chargedTokens: 0, httpAttempts: 0, semanticRounds: 0, ...base };
  return { caseId: budgetLedger.caseId, expectedReservationId: "claim:fixture", budgetLedger,
    budgetGrant: { caseId: budgetLedger.caseId, reservationId: "claim:fixture", grantTokens: 6000 - budgetLedger.chargedTokens,
      baseline: { chargedTokens: budgetLedger.chargedTokens, httpAttempts: budgetLedger.httpAttempts, semanticRounds: budgetLedger.semanticRounds } } };
}

test("two phases use disabled/none/512 then enabled/low/2048 only after new same-snapshot evidence", async () => {
  const requests = [];
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    const body = JSON.parse(options.body); requests.push(body);
    if (requests.length === 1) return response(verdict(options, { decision: "need-more", jevRelation: "uncertain", need: "backend", category: null }));
    assert.match(options.body, /underlying-model/);
    return response(verdict(options, { catalogKind: "integration", jevRelation: "implemented", reviewBasis: "mixed" }), {}, 1200);
  } });
  const result = await reviewer({ ...input, ...grant(), allowUnreserved: false, acquireEvidence: async ({ targetId, need }) => {
    assert.equal(targetId, "R1"); assert.equal(need, "backend");
    return [file('The underlying-model is vendor/model; requests are dispatched through the inference backend.', "backend.md")];
  } });
  assert.equal(result.decision, "admit");
  assert.equal(requests.length, 2);
  assert.deepEqual(requests.map((r) => [r.thinking.type, r.reasoning_effort, r.max_tokens]), [["disabled", "none", 512], ["enabled", "low", 2048]]);
  assert.equal(Object.hasOwn(requests[1], "temperature"), false);
  assert.equal(result.budgetLedger.httpAttempts, 2);
  assert.equal(result.budgetLedger.semanticRounds, 2);
  assert.equal(result.budgetLedger.chargedTokens, 1800);
  assert.equal(result.usage.reportedTotalTokens, 1800);
  assert.equal(result.attempts[0].usage.cacheHitTokens, 100);
  assert.equal(result.attempts[0].responseModel, "deepseek-flash");
  assert.equal(result.attempts[0].systemFingerprint, "fp_baseline");
});

test("need-more with no new material or changed snapshot never buys a second call", async () => {
  for (const acquisition of [async () => [], async () => [file()], async () => [file("New backend", "backend.md", { ...target, commit: "c".repeat(40) })]]) {
    let calls = 0;
    const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => { calls++; return response(verdict(options,
      { decision: "need-more", need: "definition", category: null, jevRelation: "uncertain" })); } });
    const result = await reviewer({ ...input, acquireEvidence: acquisition });
    assert.equal(calls, 1);
    assert.equal(result.decision, "need-more");
    assert.equal(result.reason, "no-new-material");
  }
});

test("a bound conflict can request one reasoning round without pretending new evidence exists", async () => {
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    calls++; const result = verdict(options);
    if (calls === 1) result.conflicts = [result.claims[0].support[0]];
    return response(result);
  } });
  const result = await reviewer(input);
  assert.equal(calls, 2);
  assert.equal(result.decision, "admit");
  assert.equal(result.budgetLedger.semanticRounds, 2);
});

test("missing grants, cross-case replay, changed counters and wrong reservation IDs cannot spend", async () => {
  const valid = grant();
  const inputs = [
    { ...input, allowUnreserved: false },
    { ...input, ...valid, caseId: "case:different" },
    { ...input, ...valid, expectedReservationId: "claim:other" },
    { ...input, ...valid, budgetGrant: { ...valid.budgetGrant, caseId: "case:different" } },
    { ...input, ...valid, budgetGrant: { ...valid.budgetGrant, baseline: { ...valid.budgetGrant.baseline, httpAttempts: 1 } } },
  ];
  for (const candidate of inputs) {
    const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: () => assert.fail("unauthorized budget") });
    const result = await reviewer(candidate);
    assert.equal(result.status, "budget-not-reserved");
    assert.equal(result.decision, null);
  }
});

test("fresh factories retain the caller's cumulative HTTP, semantic and token limits", async () => {
  for (const base of [{ httpAttempts: 3 }, { semanticRounds: 2 }, { chargedTokens: 6000 }]) {
    const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: () => assert.fail("case exhausted") });
    const result = await reviewer({ ...input, ...grant(base) });
    assert.equal(result.status, "budget-exhausted");
  }
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async () => { calls++; return new Response("retry", { status: 500 }); } });
  const result = await reviewer({ ...input, ...grant({ httpAttempts: 2, chargedTokens: 300 }) });
  assert.equal(calls, 1);
  assert.equal(result.budgetLedger.httpAttempts, 3);
  assert.ok(result.budgetLedger.chargedTokens <= 6000);
});

test("unknown usage keeps full reservations; known usage releases only observed unused capacity", async () => {
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => response(verdict(options), { usage: undefined }) });
  const result = await reviewer(input);
  assert.equal(result.usage.status, "unknown");
  assert.equal(result.budgetLedger.chargedTokens, result.attempts[0].budget.reservedTokens);
  assert.ok(result.budgetLedger.chargedTokens <= 6000);
  assert.equal(result.budget.exactProviderBillingCap, false);
});

test("actual provider overrun is preserved rather than clamped into a false six-thousand guarantee", async () => {
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => { calls++; return response(verdict(options), {}, 7000); } });
  const result = await reviewer(input);
  assert.equal(calls, 1);
  assert.equal(result.decision, null);
  assert.equal(result.status, "provider-budget-violation");
  assert.equal(result.budget.accountingOverrun, true);
  assert.equal(result.budgetLedger.chargedTokens, 7000);
  assert.equal(result.usage.reportedTotalTokens, 7000);
});

test("schema attacks and raw malformed output never become control or public debug fields", async () => {
  const changes = [{ decision: "ready" }, { verified: true }, { role: "maintainer" }, { target: "R4" },
    { claims: [{ type: "purpose", text: "Invented", support: ["Mforged"] }] }, { category: "CLI & Pipelines" },
    { need: "https://attacker.invalid" }, { source: "trusted" }, { reason: "<!-- retry:3 -->" }];
  for (const change of changes) {
    let calls = 0;
    const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => { calls++; return response({ ...verdict(options), ...change }); } });
    const result = await reviewer(input);
    assert.equal(result.decision, null);
    assert.equal(result.status, "invalid-output");
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(result), /Mforged|attacker|retry:3|rawContent|generatedVerified/);
  }
  const malformed = await createSubmissionReviewer({ token: "fixture", fetchImpl: async () => response("secret-in-malformed-content") })(input);
  assert.equal(malformed.status, "invalid-output");
  assert.equal(JSON.stringify(malformed).includes("secret-in-malformed-content"), false);
});

test("length truncation is a terminal output condition, not an identical retry", async () => {
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async () => { calls++; return response("{", { choices: [{ finish_reason: "length", message: { content: "{" } }] }); } });
  const result = await reviewer(input);
  assert.equal(calls, 1);
  assert.equal(result.status, "invalid-output");
  assert.equal(result.reason, "output-truncated");
});

test("wide materials keep more than 1450 bytes while regular target and reservation remain explicit", async () => {
  const text = Array.from({ length: 4 }, (_, i) => `Section ${i}: Jev documentation describes structured decisions and worked examples. ${"Examples explain a supported workflow. ".repeat(7)}`).join("\n\n");
  const taxonomy = JSON.parse(await readFile(new URL("../src/data/taxonomy.json", import.meta.url)));
  let bodyBytes = 0;
  const result = await createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    bodyBytes = Buffer.byteLength(options.body);
    return response(verdict(options));
  } })({ ...input, sources: [file(text)], taxonomy });
  assert.equal(result.decision, "admit");
  assert.ok(bodyBytes > 3000);
  assert.ok(bodyBytes < 6144);
  assert.ok(result.attempts[0].budget.estimatedTotalTokens <= 2000);
  assert.ok(result.attempts[0].budget.reservedTokens <= 6000);
  assert.equal(result.attempts[0].budget.tokenizerVerified, false);
});

test("official-counter injection may calibrate estimates but cannot enlarge the byte reservation", async () => {
  let counted = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", countInputTokens: async (_messages, config) => {
    counted++; assert.equal(config.model, "deepseek-flash"); return { tokens: 300, tokenizer: "fixture-v41", verifiedAgainstProvider: false };
  }, fetchImpl: async (_, options) => response(verdict(options)) });
  const result = await reviewer(input);
  assert.ok(counted > 0);
  const budget = result.attempts[0].budget;
  assert.equal(budget.estimatedInputTokens, 300);
  assert.equal(budget.localTokenizer, "fixture-v41");
  assert.equal(budget.reservedTokens, budget.inputUtf8Bytes + 128 + 512);
  assert.equal(requestBudget([{ role: "user", content: "中文" }], 2).outputTokenLimit, 2048);
});

test("long and invalid Retry-After values cannot bypass the case ledger or cause early retries", async () => {
  for (const [value, invalid] of [["172800", false], ["8640000000000", true], ["9".repeat(400), true]]) {
    let calls = 0;
    const reviewer = createSubmissionReviewer({ token: "fixture", now: () => Date.parse("2026-10-09T00:00:00Z"), sleep: () => assert.fail("early retry"), fetchImpl: async () => {
      calls++; return new Response("wait", { status: 429, headers: { "Retry-After": value } });
    } });
    const result = await reviewer(input);
    assert.equal(calls, 1);
    assert.equal(result.status, "provider-unavailable");
    assert.equal(result.decision, null);
    if (invalid) assert.equal(result.reason, "invalid-retry-after");
    else assert.equal(result.retryNotBefore, "2026-10-11T00:00:00.000Z");
  }
});

test("response size and stalled-body limits still fail closed with no raw error persistence", async () => {
  let cancelled = false;
  const oversized = await createSubmissionReviewer({ token: "fixture", fetchImpl: async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(40000)); }, cancel() { cancelled = true; return new Promise(() => {}); },
  })) })(input);
  assert.equal(cancelled, true);
  assert.equal(oversized.status, "invalid-output");
  const reviewer = createSubmissionReviewer({ token: "fixture", timeoutMs: 10, maxAttempts: 1, fetchImpl: async () => new Response(new ReadableStream({})) });
  let timer;
  try {
    const result = await Promise.race([reviewer(input), new Promise((_, reject) => { timer = setTimeout(() => reject(Error("timeout")), 1000); })]);
    assert.equal(result.status, "provider-unavailable");
    assert.equal(result.reason, "timeout");
  } finally { clearTimeout(timer); }
});

test("the model selects any of three fixed targets without borrowing another target's citations", async () => {
  const second = { ...target, id: "R2", repository: "logicrw/research", repoId: 2, listed: true };
  const third = { ...target, id: "R3", repository: "logicrw/learning", repoId: 3 };
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    const data = JSON.parse(JSON.parse(options.body).messages[1].content);
    assert.equal(data.evidence.targets.length, 3);
    const material = data.evidence.materials.find((entry) => entry.targetId === "R3");
    return response(verdict(options, { target: "R3", claims: [{ type: "contribution", text: "Provides worked Jev lessons.", support: [material.id] }] }));
  } });
  const result = await reviewer({ ...input, targets: [target, second, third], sources: [file(), file("Jev research methods.", "paper.md", second), file("Jev learning examples.", "guide.md", third)] });
  assert.equal(result.decision, "admit");
  assert.equal(result.target, "R3");
  assert.ok(result.materialRefs.every((ref) => ref.targetId === "R3"));
});

test("an unresolved conflict cannot silently fall back to phase-one admission when the grant is exhausted", async () => {
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    calls++; const value = verdict(options); value.conflicts = [value.claims[0].support[0]];
    return response(value, { usage: undefined });
  } });
  const supplied = grant(); supplied.budgetGrant.grantTokens = 2800;
  const result = await reviewer({ ...input, ...supplied });
  assert.equal(calls, 1);
  assert.equal(result.decision, null);
  assert.equal(result.status, "insufficient-evidence");
  assert.equal(result.reason, "followup-budget-exhausted");
  assert.ok(result.budgetLedger.chargedTokens <= 2800);
});

test("provider identity comes from explicit configuration, never a credential prefix", async () => {
  for (const options of [
    { source: "muse-spark", endpoint: "https://api.meta.ai/v1/chat/completions", model: "muse-spark-1.3-contributor" },
    { endpoint: "https://api.meta.ai/v1/chat/completions", model: "muse-spark-1.3-contributor" },
    { source: "deepseek", endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-flash" },
  ]) {
    let called = false;
    const result = await createSubmissionReviewer({ ...options, token: "credential-without-provider-prefix", fetchImpl: async (url, request) => {
      called = true; assert.equal(url, options.endpoint);
      const body = JSON.parse(request.body); assert.equal(body.model, options.model);
      assert.equal(Boolean(body.thinking), options.source === "deepseek");
      return response(verdict(request));
    } })(input);
    assert.equal(called, true); assert.equal(result.decision, "admit");
  }
});

test("a Muse-only credential without provider configuration is never sent to DeepSeek", async () => {
  const names = ["DEEPSEEK_API_KEY", "DEEPSEEK_ENDPOINT", "DEEPSEEK_MODEL", "MUSE_API_KEY", "MUSE_ENDPOINT", "MUSE_MODEL", "MODELS_URL", "MODELS_MODEL"];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    process.env.MUSE_API_KEY = "fixture-muse-credential";
    const blocked = await createSubmissionReviewer({ fetchImpl: () => assert.fail("credential crossed provider boundary") })(input);
    assert.equal(blocked.status, "missing-provider-config");
    let called = false;
    const explicit = await createSubmissionReviewer({ endpoint: "https://api.meta.ai/v1/chat/completions", model: "muse-spark-1.3-contributor", fetchImpl: async (url, request) => {
      called = true; assert.equal(url, "https://api.meta.ai/v1/chat/completions");
      assert.equal(request.headers.Authorization, "Bearer fixture-muse-credential");
      return response(verdict(request));
    } })(input);
    assert.equal(called, true); assert.equal(explicit.decision, "admit");
  } finally {
    for (const [name, value] of Object.entries(saved)) if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});

test("phase two can read previously omitted spans from precollected snapshot material without network acquisition", async () => {
  const text = Array.from({ length: 12 }, (_, i) => `## Jev example ${i}\n\nExample ${i} explains a distinct Jev workflow. ${"This paragraph documents the decision mechanism and its limitations. ".repeat(4)}`).join("\n\n");
  let calls = 0, firstIds;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    calls++;
    const data = JSON.parse(JSON.parse(options.body).messages[1].content);
    const ids = data.evidence.materials.map((material) => material.id);
    if (calls === 1) {
      firstIds = new Set(ids);
      assert.ok(data.evidence.omitted > 0);
      return response(verdict(options, { decision: "need-more", need: "usage-example", category: null }));
    }
    assert.ok(ids.some((id) => !firstIds.has(id)));
    return response(verdict(options));
  } });
  const result = await reviewer({ ...input, sources: [file(text)] });
  assert.equal(calls, 2);
  assert.equal(result.decision, "admit");
  assert.equal(result.budgetLedger.semanticRounds, 2);
});

test("a collector returning its whole cache cannot push previously unread SQL behind old documents", async () => {
  const documents = Array.from({ length: 8 }, (_, i) => file(`Document ${i} explains Jev usage. ${"This documentation describes configuration and examples. ".repeat(6)}`, `docs/page-${i}.md`));
  const sql = file("CREATE FUNCTION jev_choice(input text) RETURNS text AS $$ SELECT request_jev(input); $$ LANGUAGE SQL;", "sql/decision.sql");
  const sources = [...documents, sql];
  let calls = 0;
  const reviewer = createSubmissionReviewer({ token: "fixture", fetchImpl: async (_, options) => {
    calls++;
    const data = JSON.parse(JSON.parse(options.body).messages[1].content);
    if (calls === 1) {
      assert.equal(data.evidence.materials.some((material) => material.form === "sql"), false, "fixture must leave SQL unread in phase one");
      return response(verdict(options, { decision: "need-more", need: "definition", category: null }));
    }
    assert.ok(data.evidence.materials.some((material) => material.form === "sql" && material.text.includes("CREATE FUNCTION")));
    return response(verdict(options, { catalogKind: "integration", jevRelation: "implemented", reviewBasis: "mixed" }));
  } });
  const result = await reviewer({ ...input, sources, acquireEvidence: async () => ({ sources }) });
  assert.equal(calls, 2);
  assert.equal(result.decision, "admit");
});

test("provider identity metadata cannot echo the configured credential", async () => {
  const token = "opaque-provider-credential";
  const result = await createSubmissionReviewer({ token, fetchImpl: async (_, options) => response(verdict(options), { model: token, system_fingerprint: token }) })(input);
  assert.equal(result.decision, "admit");
  assert.equal(result.attempts[0].responseModel, null);
  assert.equal(result.attempts[0].systemFingerprint, null);
  assert.equal(JSON.stringify(result).includes(token), false);
});
