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
    state: { repo: "browser-use/jev-ultrafast", code: "TypeSafeJevClient" },
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
    state: { repo: "fake/project", code: "no jev here" },
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
