import test from "node:test";
import assert from "node:assert/strict";
import { buildEvidenceBundle } from "../scripts/evidence-bundle.mjs";
import { prepareSubmission, sendReviewFeedback, bodyHash } from "../scripts/issue-ingestion.mjs";

const repository = "logicrw/awesome-jev-projects", candidate = "example/mobile", sha = "a".repeat(40);
const issue = { number: 12, state: "open", title: "[Project] Jev mobile", body: `https://github.com/${candidate}\nUses Jev decisions.`, comments: 0, labels: [] };
const taxonomy = [{ category: "CLI & Pipelines" }];
const file = (path, text) => ({ path, text, hash: bodyHash(text), url: `https://github.com/${candidate}/blob/${sha}/${path}` });
const readme = file("README_zh.md", "手机应用通过 Jev 做决策，核心客户端位于 Shared/。");
const code = file("Shared/JevService.swift", "throw BackendError.notImplemented");
async function prepare(sources, { omitCode = false, conflicts = false, conflictPath = code.path, decision = "exclude" } = {}) {
  return prepareSubmission({ issue, repository, projects: [], taxonomy, api: async () => [],
    inspect: async () => ({ status: "inspected", repo: { full_name: candidate, id: 42, private: false }, sha, sources }),
    reviewer: async (input) => {
      const evidenceBundle = buildEvidenceBundle({ ...input, sources: omitCode ? input.sources.filter((s) => s.path === readme.path) : input.sources });
      const id = evidenceBundle.modelData.materials.find((s) => evidenceBundle.sourceMap.get(s.id)?.path === conflictPath)?.id ?? evidenceBundle.modelData.materials[0]?.id;
      return { status: "completed", target: "R1", decision, catalogKind: "integration", jevRelation: "unrelated",
        reviewBasis: "mixed", claims: [], conflicts: conflicts ? [id] : [], need: null, category: null,
        plainSummary: "", plainSummaryEn: "", evidenceBundle };
    },
  });
}

test("no source or absent counterevidence produces needs-evidence, never a publishable project", async () => {
  for (const sources of [[readme], [readme, file("Package.swift", "// Jev dependency")], [readme, code], []]) {
    const result = await prepare(sources);
    assert.equal(result.status, "insufficient-evidence");
    assert.equal(result.needsEvidence, true);
    assert.equal(result.project, undefined);
  }
});

test("source collected but omitted from the actual review packet cannot justify rejection", async () => {
  const result = await prepare([readme, code], { omitCode: true, conflicts: true });
  assert.equal(result.status, "insufficient-evidence");
  assert.equal(result.needsEvidence, true);
});

test("an exclusion with inspected source and bound counterevidence remains a rejection", async () => {
  const result = await prepare([readme, code], { conflicts: true });
  assert.equal(result.status, "rejected");
  assert.equal(result.needsEvidence, false);
});

test("provisional feedback posts path guidance and a label without closing the issue", async () => {
  const prepared = await prepare([readme]), writes = [], comments = [];
  const api = async (path, options = {}) => {
    if (options.method) {
      writes.push({ path, ...options });
      if (path.endsWith("/comments")) comments.push({ user: { login: "github-actions[bot]" }, body: options.body.body });
      if (path.endsWith("/labels")) issue.labels = options.body.labels;
      return {};
    }
    return path.includes("/comments?") ? comments : { ...issue, comments: comments.length };
  };
  assert.equal((await sendReviewFeedback({ api, repository, prepared })).status, "notified");
  const feedback = comments.find((c) => c.body.includes("review-feedback"));
  assert.match(feedback.body, /Shared\/JevService.swift/);
  assert.match(feedback.body, /补入本 Issue 正文/);
  assert.match(feedback.body, /单独评论不会重启/);
  assert.ok(writes.some((w) => w.path.endsWith("/labels") && w.body.labels.includes("needs-evidence")));
  assert.ok(writes.every((w) => w.method !== "PATCH" && w.body?.state !== "closed"));
  const feedbackCount = comments.filter((c) => c.body.includes("review-feedback")).length;
  assert.equal((await sendReviewFeedback({ api, repository, prepared })).status, "already-notified");
  assert.equal(comments.filter((c) => c.body.includes("review-feedback")).length, feedbackCount);
});


test("README counterevidence plus unrelated source cannot authorize terminal rejection", async () => {
  const result = await prepare([readme, code], { conflicts: true, conflictPath: readme.path });
  assert.equal(result.status, "insufficient-evidence");
});

test("counterevidence in a truncated source remains provisional", async () => {
  const partial = { ...code, partial: true, originalBytes: 10000,
    readSpan: { startByte: 100, endByte: 100 + Buffer.byteLength(code.text) } };
  const result = await prepare([readme, partial], { conflicts: true });
  assert.equal(result.status, "insufficient-evidence");
  assert.equal(result.needsEvidence, true);
});
