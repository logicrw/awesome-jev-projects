import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCandidateWithJev, JEV_GATE_QUESTIONS } from "./jev-decision.mjs";

test("evaluateCandidateWithJev returns skipped when apiKey is missing", async () => {
  const result = await evaluateCandidateWithJev({
    state: { repo: "test/repo" },
    apiKey: "",
  });
  assert.equal(result.status, "skipped");
  assert.equal(result.reason, "not-configured");
});

test("evaluateCandidateWithJev returns skipped when state is empty", async () => {
  const result = await evaluateCandidateWithJev({
    state: {},
    apiKey: "test-key",
  });
  assert.equal(result.status, "skipped");
  assert.equal(result.reason, "empty-state");
});

test("evaluateCandidateWithJev handles successful Jev System One response (admitted)", async () => {
  const mockFetch = async (url, opts) => {
    assert.equal(url, "https://api.typesafe.ai/v1/systemone");
    assert.equal(opts.method, "POST");
    assert.match(opts.headers.Authorization, /^Bearer /);
    const body = JSON.parse(opts.body);
    assert.equal(body.model, "jev-latest");
    assert.deepEqual(body.questions, JEV_GATE_QUESTIONS);

    return {
      ok: true,
      status: 200,
      json: async () => ({
        model: "jev-latest",
        answers: {
          is_genuine_jev: {
            type: "noul",
            noul: 0.96,
          },
          category_choice: {
            type: "choice",
            choice: "Browser & OS Action",
            confidence: 0.92,
            probabilities: { "Browser & OS Action": 0.92, "CLI & Pipelines": 0.08 },
          },
          integration_depth: {
            type: "score",
            score: 2.0,
            confidence: 0.90,
          },
        },
      }),
    };
  };

  const result = await evaluateCandidateWithJev({
    state: { repo: "browser-use/jev-ultrafast", evidenceFiles: [{ path: "src/client.ts", sample: "TypeSafeJevClient()" }] },
    apiKey: "test-key",
    fetchImpl: mockFetch,
  });

  assert.equal(result.status, "ok");
  assert.equal(result.isGenuine, true);
  assert.equal(result.isRejected, false);
  assert.equal(result.probability, 0.96);
  assert.equal(result.category, "Browser & OS Action");
  assert.equal(result.categoryConfidence, 0.92);
  assert.equal(result.depthScore, 2.0);
});

test("evaluateCandidateWithJev handles Jev System One rejection (rejected candidate)", async () => {
  const mockFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      model: "jev-latest",
      answers: {
        is_genuine_jev: {
          type: "noul",
          noul: 0.05,
        },
        evidence_basis: { choice: "counterevidence" },
        category_choice: {
          type: "choice",
          choice: "CLI & Pipelines",
          confidence: 0.40,
        },
        integration_depth: {
          type: "score",
          score: 0.0,
          confidence: 0.95,
        },
      },
    }),
  });

  const result = await evaluateCandidateWithJev({
    state: { repo: "fake/project", evidenceFiles: [{ path: "src/main.py", sample: "raise NotImplementedError()" }] },
    apiKey: "test-key",
    fetchImpl: mockFetch,
  });

  assert.equal(result.status, "ok");
  assert.equal(result.isGenuine, false);
  assert.equal(result.isRejected, true);
  assert.equal(result.probability, 0.05);
});

test("evaluateCandidateWithJev handles HTTP error gracefully", async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 500,
  });

  const result = await evaluateCandidateWithJev({
    state: { repo: "test/repo" },
    apiKey: "test-key",
    fetchImpl: mockFetch,
  });

  assert.equal(result.status, "fallback");
  assert.equal(result.reason, "http-error-500");
});

test("evaluateCandidateWithJev handles network exception gracefully", async () => {
  const mockFetch = async () => {
    throw new Error("DNS resolution failed");
  };

  const result = await evaluateCandidateWithJev({
    state: { repo: "test/repo" },
    apiKey: "test-key",
    fetchImpl: mockFetch,
  });

  assert.equal(result.status, "fallback");
  assert.equal(result.reason, "network-error");
});

const gateReply = (probability, basis = "insufficient") => async () => ({
  ok: true, json: async () => ({ answers: { is_genuine_jev: { noul: probability }, evidence_basis: { choice: basis } } }),
});

test("no source, config-only, and sampled stubs with declarations remain provisional", async () => {
  for (const evidenceFiles of [[], [{ path: "README_zh.md", sample: "集成 Jev" }],
    [{ path: "docs/README.md", sample: "Jev integration" }], [{ path: "Package.swift", sample: "Jev dependency" }],
    [{ path: "Shared/Service.swift", sample: "// Jev client will live here" }]]) {
    const result = await evaluateCandidateWithJev({ state: { intent: "Uses Jev", evidenceFiles }, apiKey: "fixture", fetchImpl: gateReply(0.05) });
    assert.equal(result.status, "provisional");
    assert.equal(result.needsEvidence, true);
    assert.equal(result.isRejected, false);
  }
});

test("a missing or invalid probability cannot become a conclusive gate result", async () => {
  for (const value of [undefined, null, "0.1", -1, 1.1, NaN, Infinity]) {
    const result = await evaluateCandidateWithJev({ state: { intent: "Jev" }, apiKey: "fixture", fetchImpl: gateReply(value) });
    assert.equal(result.status, "fallback");
    assert.equal(result.reason, "invalid-probability");
    assert.notEqual(result.isRejected, true);
  }
});

test("midrange scores and absent counterevidence cannot reject inspected source", async () => {
  for (const probability of [0, 0.19, 0.2, 0.5, 0.79]) {
    const result = await evaluateCandidateWithJev({ state: { evidenceFiles: [{ path: "pkg/client.go", sample: "package client" }] },
      apiKey: "fixture", fetchImpl: gateReply(probability) });
    assert.equal(result.status, "provisional");
    assert.equal(result.isRejected, false);
  }
});
