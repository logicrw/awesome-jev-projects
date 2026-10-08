/** Trusted workflow code only. Untrusted issues/READMEs are never executed. */
import { createHash } from "node:crypto";
import { readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createGitHubClient } from "./github-client.mjs";
import {
  extractSubmittedRepository,
  extractSubmittedCodePaths,
  inspectRepository,
  codeCandidate,
} from "./project-source.mjs";
import { inferCanonicalTags } from "../src/lib/tags.mjs";
import {
  createSummaryEnricher,
  createSubmissionReviewer,
} from "./source-enrichment.mjs";
import { summarize, verifyIntegration, atomicJSON } from "./radar-sync.mjs";
import { readAssetBundle, validateAssetBundle } from "./ingestion-assets.mjs";
import { validateVerdict, resolveWitnessFiles } from "./evidence-bundle.mjs";
import { settleRetry, validateRetryClaim } from "./ingestion-retry.mjs";
import { isSubmission } from "./submission-identity.mjs";
export { isSubmission } from "./submission-identity.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_URL = "https://logicrw.github.io/awesome-jev-projects/";
export const bodyHash = (body) =>
  createHash("sha256")
    .update(body ?? "")
    .digest("hex");
export const successComment =
  "🎉 感谢提交！项目已通过 Jev 源码集成检查，并已成功收录至 Awesome Jev 探索雷达：https://logicrw.github.io/awesome-jev-projects/ 欢迎持续关注并推荐更多 Jev 优秀项目！";
const OWNER_REPO = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[a-z\d_.-]{1,100}$/i;
function requireOwner(repository) {
  if (!OWNER_REPO.test(repository ?? ""))
    throw new Error("Invalid owning repository");
  return repository;
}
function publicIdentity(project) {
  try {
    const u = new URL(project.url);
    const identity = u.pathname.replace(/^\/|\/$/g, "");
    return u.protocol === "https:" && u.hostname === "github.com" &&
      !u.username && !u.password && !u.port && !u.search && !u.hash && OWNER_REPO.test(identity)
      ? identity.toLowerCase() : null;
  } catch {
    return null;
  }
}
function sameProject(a, b) {
  return (
    a.id === b.id ||
    (publicIdentity(a) !== null && publicIdentity(a) === publicIdentity(b)) ||
    (Number.isSafeInteger(a.repoId) && a.repoId === b.repoId)
  );
}

const REVIEW_MESSAGES = Object.freeze({
  "invalid-submission": "投稿未提供唯一、有效的公开仓库地址。",
  "structural-rejection": "仓库未满足公开性、身份或固定版本等基本收录条件。",
  "duplicate": "此仓库已在目录中，无需重复收录。",
  "accepted": "模型与固定源码见证均通过校验。",
  "model-rejected": "模型未确认可收录的 Jev 源码集成；本轮自动审查已结束。",
  "insufficient-evidence": "本轮未取得可核验的实现源码与关系见证，自动审查已结束；有效源码变化或新代码线索可触发下一轮。",
  "invalid-output": "模型输出未通过结构或证据引用校验，本轮自动审查已结束。",
  "provider-unavailable": "模型服务暂不可用，本轮未形成收录结论。",
  "transient-failure": "审查服务暂时不可用，将在限额内自动重试。",
});
function reviewMessage(code) {
  return REVIEW_MESSAGES[code] ?? REVIEW_MESSAGES["invalid-output"];
}
function reviewDiagnostics(review) {
  if (!review || typeof review !== "object") return undefined;
  return {
    status: typeof review.status === "string" ? review.status.slice(0, 40) : "invalid-output",
    verified: review.verified === true ? true : review.verified === false ? false : null,
    ...(Array.isArray(review.attempts) ? { attempts: review.attempts.slice(0, 3).map((attempt) => ({
      attempt: Number.isSafeInteger(attempt.attempt) ? attempt.attempt : 0,
      status: typeof attempt.status === "string" ? attempt.status.slice(0, 40) : "unknown",
      ...(Number.isInteger(attempt.httpStatus) ? { httpStatus: attempt.httpStatus } : {}),
      usage: attempt.usage?.status === "reported" ? {
        status: "reported",
        ...Object.fromEntries(["promptTokens", "completionTokens", "totalTokens", "reasoningTokens"]
          .filter((key) => Number.isSafeInteger(attempt.usage[key]) && attempt.usage[key] >= 0)
          .map((key) => [key, attempt.usage[key]])),
      } : { status: "unknown" },
    })) } : {}),
    ...(review.budget ? { budget: review.budget } : {}),
    ...(review.usage ? { usage: review.usage } : {}),
  };
}
function fixedSource(file, repo, sha) {
  if (!file || typeof file.path !== "string" || !file.path ||
      typeof file.text !== "string" || !file.text.trim() ||
      !/^[a-f\d]{64}$/.test(file.hash ?? "") ||
      bodyHash(file.text) !== file.hash || !/^[a-f\d]{40}$/.test(sha ?? "") ||
      !codeCandidate({ path: file.path, type: "blob", size: Buffer.byteLength(file.text) })) return false;
  try {
    const url = new URL(file.url);
    return url.origin === "https://github.com" && !url.search && !url.hash &&
      !url.username && !url.password &&
      decodeURIComponent(url.pathname) === `/${repo.full_name}/blob/${sha}/${file.path}`;
  } catch { return false; }
}
export async function prepareSubmission({
  issue, repository, projects, taxonomy, exclusions = [], api, enrich, reviewer,
  inspect = inspectRepository, now = () => new Date().toISOString(), commentBody = "",
}) {
  requireOwner(repository);
  const finish = (status, reasonCode, extra = {}) => ({
    status, reasonCode, reason: reviewMessage(reasonCode),
    issueNumber: issue?.number, issueBodySha: bodyHash(issue?.body),
    needsEvidence: status === "insufficient-evidence", ...extra,
  });
  if (!Number.isSafeInteger(issue?.number) || issue.number < 1 || issue.pull_request || issue.state !== "open")
    return finish("ignored", "invalid-submission");
  if (!isSubmission(issue)) return finish("ignored", "invalid-submission");
  const submitted = extractSubmittedRepository(issue.body);
  if (!submitted || submitted.toLowerCase() === repository.toLowerCase())
    return finish("rejected", "invalid-submission");

  let fullIssueText = [issue.body ?? "", commentBody].filter(Boolean).join("\n\n");
  if (typeof api === "function") {
    try {
      const comments = await api(`/repos/${repository}/issues/${issue.number}/comments?per_page=100`);
      if (Array.isArray(comments)) fullIssueText += "\n\n" + comments
        .filter((c) => c.user?.type !== "Bot" && c.user?.login !== "github-actions[bot]")
        .map((c) => typeof c.body === "string" ? c.body.slice(0, 16000) : "")
        .join("\n\n");
    } catch { /* Comment hints are optional; immutable repository evidence is authoritative. */ }
  }
  const preferredPaths = extractSubmittedCodePaths(fullIssueText, submitted);
  let result;
  try {
    result = await inspect({
      api, repository: submitted, existingProjects: projects, exclusions,
      verifyIntegration, requireCodeEvidence: true, semanticReview: true, preferredPaths,
    });
  } catch {
    return finish("transient-retry", "transient-failure", { retryable: true, submittedRepository: submitted });
  }
  if (result.status === "duplicate") {
    const prior = projects.find((p) => p.ingestion?.repository === repository &&
      p.ingestion.issueNumber === issue.number && p.ingestion.issueBodySha256 === bodyHash(issue.body) &&
      (p.repoId === result.repo?.id || publicIdentity(p) === result.repo?.full_name?.toLowerCase()));
    if (prior) return finish("resume", "duplicate", { project: prior });
    return finish("duplicate", "duplicate", { submittedRepository: submitted });
  }
  const structuralRejections = new Set([
    "invalid repository", "repository not found or inaccessible", "invalid repository metadata",
    "repository is not public", "forks are not ingested", "repository already listed",
    "repository is excluded by editorial review", "repository has no accessible commit",
    "repository has no immutable commit",
  ]);
  if (result.status === "rejected" && structuralRejections.has(result.reason))
    return finish("rejected", "structural-rejection", { submittedRepository: submitted });

  const { repo, sha, commits = [], readme = "" } = result;
  const readmeFiles = result.readmeFiles ?? [];
  const codeSources = (result.codeSources ?? result.evidence?.files ?? []).filter((file) =>
    !readmeFiles.some((rf) => rf.path === file.path) &&
    !/(?:^|\/)readme(?:\.[^/]*)?$/i.test(file.path ?? "") &&
    fixedSource(file, repo, sha));
  const details = { submittedRepository: submitted };
  if (!repo || !codeSources.length)
    return finish("insufficient-evidence", "insufficient-evidence", details);
  if (typeof reviewer !== "function")
    return finish("provider-unavailable", "provider-unavailable", details);

  let review;
  try { review = await reviewer({ repo, readme, codeSources, taxonomy }); }
  catch { return finish("transient-retry", "transient-failure", { ...details, retryable: true }); }
  const diagnostics = reviewDiagnostics(review);
  // A strict negative always vetoes L1, including syntactically plausible dead code.
  if (review?.verified === false)
    return finish("rejected", "model-rejected", { ...details, reviewDetails: diagnostics });
  if (review?.verified !== true) {
    if (review?.retryable === true) {
      const notBefore = Date.parse(review.retryNotBefore);
      const retryNotBefore = Number.isFinite(notBefore) && notBefore > Date.now()
        ? new Date(notBefore).toISOString() : undefined;
      return finish("transient-retry", "transient-failure", { ...details, retryable: true, retryNotBefore, reviewDetails: diagnostics });
    }
    const status = review?.status === "insufficient-evidence" ? "insufficient-evidence" :
      ["missing-token", "circuit-open", "http-error", "request-failed", "timeout"].includes(review?.status) ?
        "provider-unavailable" : "invalid-output";
    return finish(status, status, { ...details, reviewDetails: diagnostics });
  }
  if (review.status !== "completed")
    return finish("invalid-output", "invalid-output", { ...details, reviewDetails: diagnostics });
  // The bundle is built by trusted local reviewer code, never deserialized from model output.
  // Revalidate its witness and bind every referenced source to the actual fixed snapshot.
  const bundle = review.evidenceBundle;
  const raw = Object.fromEntries(["verified", "role", "witness", "reasonCode", "category", "plainSummary", "plainSummaryEn"]
    .map((key) => [key, review[key]]));
  const verdict = bundle ? validateVerdict(raw, bundle, taxonomy) : null;
  const implementationFiles = verdict ? resolveWitnessFiles(bundle, verdict) : [];
  const witnessNodes = verdict ? [...new Set(Object.values(verdict.witness).flat())]
    .map((id) => ({ id, ...bundle.nodeMap.get(id) })) : [];
  if (!verdict || !implementationFiles.length || !witnessNodes.length || witnessNodes.some(({ source: file, startLine, endLine, ranges }) => {
    if (!codeSources.some((source) => source.path === file.path && source.url === file.url && source.hash === file.hash && source.text === file.text)) return true;
    const lineCount = file.text.split("\n").length;
    if (!Number.isSafeInteger(startLine) || !Number.isSafeInteger(endLine) || startLine < 1 || endLine < startLine || endLine > lineCount ||
        !Array.isArray(ranges) || !ranges.length || ranges.length > 100) return true;
    let previous = 0;
    return ranges.some((range) => {
      if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isSafeInteger) || range[0] < startLine || range[1] > endLine || range[0] <= previous || range[1] < range[0]) return true;
      previous = range[1];
      return false;
    });
  }))
    return finish("invalid-output", "invalid-output", { ...details, reviewDetails: diagnostics });

  const baseSummary = {
    category: verdict.category,
    plainSummary: verdict.plainSummary, plainSummaryEn: verdict.plainSummaryEn,
    jevDecisionPoint: verdict.plainSummary, jevDecisionPointEn: verdict.plainSummaryEn,
    highlightBenefit: "已定位固定版本的实现源码；尚无独立运行或性能验证。",
    highlightBenefitEn: "Implementation evidence is pinned to a source revision; runtime and performance are not independently verified.",
    tags: inferCanonicalTags({ category: verdict.category, tags: [] }),
    summarySource: "ai-evidence-witness",
  };
  const issueTrusted = Boolean(issue.user?.login && (issue.user.login.toLowerCase() === repo.owner?.login?.toLowerCase() ||
    ["OWNER", "MEMBER", "COLLABORATOR"].includes(issue.author_association)));
  const enriched = typeof enrich === "function" ? await enrich({
    repo, readme, issueBody: issue.body ?? "", issueTrusted,
    fallback: baseSummary, reviewed: { ...review, ...verdict, witnessValidated: true },
  }) : baseSummary;
  // Classification and summaries belong to the witness verdict; extractive copy cannot override them.
  const { enrichment: _enrichment, ...editorial } = { ...enriched, ...baseSummary };
  const [author, name] = repo.full_name.split("/");
  const files = [...new Map(witnessNodes.map(({ source }) => [source.path, source])).values()]
    .map(({ path, url, hash }) => ({ path, url, hash }));
  const evidenceNodes = witnessNodes.map(({ id, source, kind, startLine, endLine, ranges }) =>
    ({ id, path: source.path, hash: source.hash, kind, startLine, endLine, ranges: ranges.map((range) => [...range]) }));
  const project = {
    id: `${author}:${name}`.toLowerCase(), name, author,
    url: `https://github.com/${repo.full_name}`, repoId: repo.id, ...editorial,
    stars: repo.stargazers_count, forks: repo.forks_count, openIssues: repo.open_issues_count,
    license: repo.license?.spdx_id === "NOASSERTION" ? null : (repo.license?.spdx_id ?? null),
    createdAt: repo.created_at, lastCommitAt: commits[0]?.commit?.committer?.date ?? null,
    headSha: sha, metadataFetchedAt: now(), metadataStatus: "ok", avatarUrl: repo.owner?.avatar_url,
    verificationStatus: "integration-detected", runtimeVerified: false, discoveredAt: now(),
    claimStatus: "模型依据固定版本源码关系见证自动裁决；未经本站运行、安全或性能验证。",
    claimStatusEn: "Model classification is supported by immutable source witnesses; runtime, security and performance are not independently verified.",
    evidence: files.map(({ url }) => ({ url, note: "固定版本的实现源码见证" })),
    sourceVerification: { method: "ai-evidence-witness-v1", sha, files, role: verdict.role, witness: verdict.witness,
      nodes: evidenceNodes, implementationFiles: implementationFiles.map(({ path }) => path) },
    ingestion: { repository, issueNumber: issue.number, issueBodySha256: bodyHash(issue.body),
      issueUrl: `https://github.com/${repository}/issues/${issue.number}` },
  };
  if (!project.evidence.length || !["plainSummary", "plainSummaryEn", "jevDecisionPoint", "highlightBenefit", "category"]
    .every((key) => typeof project[key] === "string" && project[key].trim()) || !project.tags.length)
    return finish("invalid-output", "invalid-output", { ...details, reviewDetails: diagnostics });
  return finish("ready", "accepted", { project, reviewDetails: diagnostics });
}

function decodeSnapshot(file) {
  if (
    file.encoding !== "base64" ||
    typeof file.content !== "string" ||
    !file.sha
  )
    throw new Error("Invalid canonical data response");
  const rows = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  if (!Array.isArray(rows))
    throw new Error("Canonical projects must be an array");
  return rows;
}
/** A non-force ref update atomically compares the entire reviewed branch, not just its data blob. */
export async function publishSubmission({
  api,
  repository,
  project,
  reviewedSourceSha,
  assetBundle,
  maxAttempts = 4,
  retryClaim = null,
  trustedWriter = process.env.INGEST_TRUSTED_WRITER,
  dryRun = process.env.INGEST_DRY_RUN === "true",
}) {
  requireOwner(repository);
  if (dryRun || process.env.INGEST_DRY_RUN === "true") throw new Error("Dry-run publication is forbidden");
  const identity = publicIdentity(project);
  if (!identity || !Number.isSafeInteger(project.repoId) || project.repoId < 1 ||
      project.id !== identity.replace("/", ":"))
    throw new Error("Invalid prepared project identity");
  if (!/^[a-f\d]{40}$/.test(reviewedSourceSha ?? ""))
    throw new Error("Exact reviewed source SHA is required for publication");
  const ingestion = project.ingestion;
  if (
    ingestion?.repository !== repository ||
    !Number.isSafeInteger(ingestion.issueNumber) ||
    ingestion.issueNumber < 1
  )
    throw new Error("Invalid submission provenance");
  if (retryClaim && (retryClaim.issueNumber !== ingestion.issueNumber ||
      retryClaim.bodySha !== ingestion.issueBodySha256 ||
      !await validateRetryClaim({ api, repository, candidate: retryClaim, trustedWriter })))
    return { status: "superseded", changed: false, retryable: false };
  const issue = await api(
    `/repos/${repository}/issues/${ingestion.issueNumber}`,
  );
  if (
    issue.state !== "open" ||
    issue.pull_request ||
    bodyHash(issue.body) !== ingestion.issueBodySha256
  )
    return {
      status: "changed",
      reason: "issue changed or closed before publication",
    };
  const publicRepo = await api(`/repos/${publicIdentity(project)}`);
  if (publicRepo.private !== false || publicRepo.id !== project.repoId)
    return {
      status: "changed",
      reason: "target repository is no longer the verified public repository",
    };
  const contentsPath = `/repos/${repository}/contents/src/data/projects.json`;
  const refPath = `/repos/${repository}/git/refs/heads/main`;
  const headPath = `/repos/${repository}/git/ref/heads/main`;
  let createdCommit;
  const stale = () => ({
    status: "changed",
    retryable: true,
    reason: "main advanced after review; retry against the current policy and schema",
  });
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const head = (await api(headPath)).object?.sha;
    if (createdCommit && head === createdCommit)
      return { status: "ingested", changed: true, commit: createdCommit };
    if (head !== reviewedSourceSha) return stale();
    if (!createdCommit) {
      // Both policy code and source dataset are read from the reviewed immutable revision.
      const file = await api(contentsPath + `?ref=${reviewedSourceSha}`);
      if (typeof file.sha !== "string" || (file.size ?? 0) > 10_000_000)
        throw new Error("Canonical dataset is unavailable or exceeds the publication budget");
      const current = decodeSnapshot(file.encoding === "base64"
        ? file : await api(`/repos/${repository}/git/blobs/${file.sha}`));
      const existing = current.find((row) => sameProject(row, project));
      if (existing) {
        const own = existing.ingestion?.repository === repository &&
          existing.ingestion.issueNumber === ingestion.issueNumber &&
          existing.ingestion.issueBodySha256 === ingestion.issueBodySha256;
        return { status: own ? "ingested" : "duplicate", changed: false };
      }
      const candidateContent = JSON.stringify([...current, project], null, 2) + "\n";
      const assets = validateAssetBundle(assetBundle, { reviewedSourceSha, candidateContent });
      const base = await api(`/repos/${repository}/git/commits/${reviewedSourceSha}`);
      if (!/^[a-f\d]{40}$/.test(base.tree?.sha ?? ""))
        throw new Error("Reviewed commit has no valid tree");
      const assetEntries = [];
      for (const { path, bytes } of assets) {
        // Base64 blobs preserve the exact validated bytes, including binary avatars.
        const blob = await api(`/repos/${repository}/git/blobs`, {
          method: "POST", body: { encoding: "base64", content: bytes.toString("base64") },
        });
        if (!/^[a-f\d]{40}$/.test(blob.sha ?? "")) throw new Error("Invalid prepared asset blob SHA");
        assetEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      }
      const tree = await api(`/repos/${repository}/git/trees`, {
        method: "POST",
        body: {
          base_tree: base.tree.sha,
          tree: [{ path: "src/data/projects.json", mode: "100644", type: "blob",
            content: candidateContent }, ...assetEntries],
        },
      });
      if (!/^[a-f\d]{40}$/.test(tree.sha ?? "")) throw new Error("Invalid prepared tree SHA");
      const commit = await api(`/repos/${repository}/git/commits`, {
        method: "POST",
        body: {
          message: `data: ingest ${identity} from #${ingestion.issueNumber}`,
          tree: tree.sha,
          parents: [reviewedSourceSha],
        },
      });
      if (!/^[a-f\d]{40}$/.test(commit.sha ?? "")) throw new Error("Invalid prepared commit SHA");
      createdCommit = commit.sha;
    }
    // Fail cheaply if main already changed. The non-force update below also
    // closes the check→write race: our commit's only parent is reviewedSourceSha.
    if ((await api(headPath)).object?.sha !== reviewedSourceSha) return stale();
    if (retryClaim && !await validateRetryClaim({ api, repository, candidate: retryClaim, trustedWriter }))
      return { status: "superseded", changed: false, retryable: false };
    const latestIssue = await api(`/repos/${repository}/issues/${ingestion.issueNumber}`);
    if (latestIssue.state !== "open" || latestIssue.pull_request || bodyHash(latestIssue.body) !== ingestion.issueBodySha256)
      return { status: "changed", reason: "issue changed before branch update", retryable: false };
    try {
      await api(refPath, { method: "PATCH", body: { sha: createdCommit, force: false } });
      return { status: "ingested", changed: true, commit: createdCommit };
    } catch (error) {
      // Read back unknown outcomes; never force-update or rebase under new policy.
      if (attempt === maxAttempts - 1) throw error;
      if (error.status && ![409, 422, 500, 502, 503, 504].includes(error.status)) throw error;
    }
  }
  throw new Error("Publication retries exhausted");
}
/** Called only by the Pages workflow AFTER its deployment succeeds. */
export async function acknowledgePublished({
  api,
  repository,
  projects,
  publishedProjects,
  trustedWriter = process.env.INGEST_TRUSTED_WRITER,
  dryRun = process.env.INGEST_DRY_RUN === "true",
}) {
  requireOwner(repository);
  if (dryRun || process.env.INGEST_DRY_RUN === "true") return [];
  const byIssue = new Map();
  for (const project of projects) {
    const i = project.ingestion;
    if (
      i?.repository === repository &&
      Number.isSafeInteger(i.issueNumber) &&
      i.issueNumber > 0 &&
      typeof i.issueBodySha256 === "string"
    )
      byIssue.set(i.issueNumber, project);
  }
  const results = [];
  if (!byIssue.size) return results;
  const open = [];
  for (let page = 1; page <= 20; page++) {
    const rows = await api(
      `/repos/${repository}/issues?state=open&per_page=100&page=${page}`,
    );
    open.push(...rows);
    if (rows.length < 100) break;
    if (page === 20)
      throw new Error(
        "Open issue pagination limit reached; no completion claims sent",
      );
  }
  for (const issue of open) {
    const project = byIssue.get(issue.number);
    if (!project || issue.pull_request) continue;
    if (bodyHash(issue.body) !== project.ingestion.issueBodySha256) {
      results.push({ issue: issue.number, status: "edited-after-review" });
      continue;
    }
    if (
      !publishedProjects.some(
        (row) =>
          row.id === project.id &&
          publicIdentity(row) === publicIdentity(project),
      )
    ) {
      results.push({
        issue: issue.number,
        status: "not-in-published-snapshot",
      });
      continue;
    }
    const marker = `<!-- awesome-jev-ingestion:${issue.number}:${project.repoId} -->`;
    let commented = false;
    for (let page = 1; page <= 20; page++) {
      const comments = await api(
        `/repos/${repository}/issues/${issue.number}/comments?per_page=100&page=${page}`,
      );
      commented ||= comments.some(
        (c) =>
          trustedComment(c, trustedWriter) &&
          (c.body === marker || c.body === `${successComment}\n\n${marker}`),
      );
      if (commented || comments.length < 100) break;
      if (page === 20)
        throw new Error(
          "Comment pagination limit reached; avoiding duplicate notification",
        );
    }
    // Recheck just before side effects: an author may retract or edit a queued submission.
    const latest = await api(`/repos/${repository}/issues/${issue.number}`);
    if (
      latest.state !== "open" ||
      latest.pull_request ||
      bodyHash(latest.body) !== project.ingestion.issueBodySha256
    ) {
      results.push({
        issue: issue.number,
        status: "changed-before-acknowledgement",
      });
      continue;
    }
    if (!commented)
      await api(`/repos/${repository}/issues/${issue.number}/comments`, {
        method: "POST",
        body: { body: `${successComment}\n\n${marker}` },
      });
    const hasNeedsEvidence = issue.labels?.some(
      (l) => (typeof l === "string" ? l : l.name) === "needs-evidence",
    );
    if (hasNeedsEvidence) {
      try {
        await api(
          `/repos/${repository}/issues/${issue.number}/labels/needs-evidence`,
          { method: "DELETE" },
        );
      } catch (err) {
        console.warn(`Could not remove needs-evidence label: ${err.message}`);
      }
    }
    await settleRetry({ api, repository, trustedWriter, dryRun,
      candidate: { issueNumber: issue.number, bodySha: project.ingestion.issueBodySha256 }, state: "completed" });
    await api(`/repos/${repository}/issues/${issue.number}`, {
      method: "PATCH",
      body: { state: "closed", state_reason: "completed" },
    });
    results.push({ issue: issue.number, status: "completed" });
  }
  return results;
}
function trustedComment(comment, trustedWriter) {
  const login = comment.user?.login;
  return login === "github-actions[bot]" ||
    (typeof trustedWriter === "string" && /^[a-z\d](?:[a-z\d-]{0,38})(?:\[bot\])?$/i.test(trustedWriter) &&
      login?.toLowerCase() === trustedWriter.toLowerCase());
}
/** Feedback is rendered entirely from local enums; model prose is never a control channel. */
export async function sendReviewFeedback({
  api, repository, prepared, trustedWriter = process.env.INGEST_TRUSTED_WRITER,
  dryRun = process.env.INGEST_DRY_RUN === "true",
}) {
  requireOwner(repository);
  if (dryRun || process.env.INGEST_DRY_RUN === "true") return { status: "dry-run" };
  const issueNumber = prepared?.issueNumber;
  const issueBodySha = prepared?.issueBodySha;
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1 || !/^[a-f\d]{64}$/.test(issueBodySha ?? ""))
    return { status: "invalid-receipt" };
  const terminal = {
    rejected: "rejected", duplicate: "rejected", "insufficient-evidence": "insufficient-evidence",
    "invalid-output": "invalid-output",
  }[prepared.status];
  if (!terminal) return { status: "not-needed" };
  const candidate = { ...(prepared.retryClaim ?? {}), issueNumber, bodySha: issueBodySha };
  const path = `/repos/${repository}/issues/${issueNumber}`;
  const current = async () => {
    const issue = await api(path);
    return issue.state === "open" && !issue.pull_request && bodyHash(issue.body) === issueBodySha ? issue : null;
  };
  if (!await current()) return { status: "superseded" };
  if (prepared.retryClaim && !await validateRetryClaim({ api, repository, candidate, trustedWriter }))
    return { status: "superseded" };
  const reasonCode = Object.hasOwn(REVIEW_MESSAGES, prepared.reasonCode) ? prepared.reasonCode : "invalid-output";
  const marker = `<!-- awesome-jev-review-feedback:v2:${issueNumber}:${issueBodySha}:${reasonCode} -->`;
  const body = `**Awesome Jev 自动审查结果**\n\n${reviewMessage(reasonCode)}\n\n${marker}`;
  let exists = false;
  for (let page = 1; page <= 20; page++) {
    const comments = await api(`${path}/comments?per_page=100&page=${page}`);
    if (!Array.isArray(comments)) throw new Error("Invalid feedback comments response");
    exists ||= comments.some((c) => trustedComment(c, trustedWriter) && c.body === body);
    if (exists || comments.length < 100) break;
    if (page === 20) throw new Error("Feedback pagination budget exhausted; no duplicate feedback written");
  }
  const latest = await current();
  if (!latest) return { status: "superseded" };
  if (!exists) await api(`${path}/comments`, { method: "POST", body: { body } });
  const hasLabel = latest.labels?.some((label) => (typeof label === "string" ? label : label.name) === "needs-evidence");
  const needsEvidence = prepared.status === "insufficient-evidence";
  if (needsEvidence && !hasLabel)
    await api(`${path}/labels`, { method: "POST", body: { labels: ["needs-evidence"] } });
  else if (!needsEvidence && hasLabel)
    await api(`${path}/labels/needs-evidence`, { method: "DELETE" });
  await settleRetry({ api, repository, candidate, state: terminal, trustedWriter, dryRun });
  return { status: exists ? "already-notified" : "notified" };
}

async function output(values) {
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      Object.entries(values)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n") + "\n",
    );
}
async function main() {
  const mode = process.argv[2] ?? "prepare";
  const repository = requireOwner(
    process.env.GITHUB_REPOSITORY ?? "logicrw/awesome-jev-projects",
  );
  if (["publish", "acknowledge", "feedback"].includes(mode) && process.env.INGEST_DRY_RUN === "true") {
    console.log(JSON.stringify({ status: "dry-run", mode }));
    return;
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    throw new Error(
      "GITHUB_TOKEN is required for workflow repository operations",
    );
  const api = createGitHubClient({
    token,
    ...(mode === "publish" || mode === "acknowledge" || mode === "feedback" ? { writeRepository: repository } : {}),
  });
  const resultPath =
    process.env.INGEST_RESULT_FILE ??
    resolve(
      process.env.RUNNER_TEMP ?? resolve(root, ".sites-runtime"),
      "ingestion-result.json",
    );
  if (mode === "prepare") {
    const event = JSON.parse(
      await readFile(process.env.GITHUB_EVENT_PATH, "utf8"),
    );
    if (
      event.repository?.full_name !== repository ||
      event.repository.private === true
    )
      throw new Error("Workflow event must belong to this public repository");
    const projects = JSON.parse(
      await readFile(resolve(root, "src/data/projects.json"), "utf8"),
    );
    const taxonomy = JSON.parse(
      await readFile(resolve(root, "src/data/taxonomy.json"), "utf8"),
    );
    const exclusions = JSON.parse(
      await readFile(resolve(root, "radar/exclusions.json"), "utf8"),
    );
    const modelsProbe = process.env.INGEST_MODELS_PROBE === "true";
    const remoteProbe = process.env.INGEST_REMOTE_PROBE === "true";
    if (modelsProbe) {
      if (process.env.GITHUB_EVENT_NAME !== "workflow_dispatch")
        throw new Error("Models probes require manual workflow dispatch");
      delete process.env.DEEPSEEK_API_KEY;
      delete process.env.MUSE_API_KEY;
      delete process.env.GH_MODELS_TOKEN;
    }
    const enrich = createSummaryEnricher(modelsProbe ? { token: "" } : {});
    const reviewer = createSubmissionReviewer(modelsProbe ? { token: "" } : {});
    let result;
    if (modelsProbe) {
      const repo = {
        name: "jev-probe",
        description:
          "A command-line tool that uses Jev to classify log lines before passing relevant context to an Agent.",
      };
      const summary = await enrich({
        repo,
        readme:
          "# Jev probe\n\nA command-line tool that uses Jev to classify log lines before passing relevant context to an Agent.",
        fallback: summarize(repo, "", taxonomy),
      });
      result = { status: "models-probe", enrichment: summary.enrichment };
    } else if (remoteProbe) {
      if (process.env.GITHUB_EVENT_NAME !== "workflow_dispatch")
        throw new Error("Remote probes require manual workflow dispatch");
      const sha = "a".repeat(40);
      const text = "import typesafe\n\nclient = typesafe.Client()\nresult = client.choice(['left', 'right'], 'direction')\nprint(result)\n";
      const hash = createHash("sha256").update(text).digest("hex");
      const probeSources = [{
        path: "src/probe.py",
        text,
        hash,
        url: `https://github.com/logicrw/probe/blob/${sha}/src/probe.py`,
      }];
      const review = await reviewer({
        repo: { full_name: "logicrw/probe", name: "probe" },
        readme: "# Jev probe",
        codeSources: probeSources,
        taxonomy,
      });
      result = {
        status: "remote-probe",
        verified: review.verified,
        reviewStatus: review.status,
        reason: review.reason,
        attempts: review.attempts?.map((a) => ({
          attempt: a.attempt,
          status: a.status,
          httpStatus: a.httpStatus,
          failureStage: a.failureStage,
          finishReason: a.finishReason,
          contentLength: a.contentLength,
          rawContentHead: a.rawContentHead,
          categoryValue: a.categoryValue,
          verdictNull: a.verdictNull,
          generatedVerified: a.generatedVerified,
          generated: a.generated,
        })),
        usage: review.usage,
      };
      await atomicJSON(resultPath, result);
      await output({ ready: "false", status: "remote-probe" });
      return;
    } else {
      const number = Number(
        event.issue?.number ?? process.env.INGEST_ISSUE_NUMBER,
      );
      if (!Number.isSafeInteger(number) || number < 1)
        throw new Error("A positive issue number is required");
      const issue = await api(`/repos/${repository}/issues/${number}`);
      const retryClaim = process.env.INGEST_RETRY_CLAIM_ID ? {
        issueNumber: number, bodySha: process.env.INGEST_EXPECTED_BODY_SHA,
        claimId: process.env.INGEST_RETRY_CLAIM_ID, attempt: Number(process.env.INGEST_RETRY_ATTEMPT),
      } : null;
      const expectedBody = process.env.INGEST_EXPECTED_BODY_SHA;
      if ((expectedBody && expectedBody !== bodyHash(issue.body)) ||
          (retryClaim && !await validateRetryClaim({ api, repository, candidate: retryClaim, trustedWriter: process.env.INGEST_TRUSTED_WRITER }))) {
        result = { status: "superseded", issueNumber: number, issueBodySha: bodyHash(issue.body), retryable: false };
      } else {
        result = await prepareSubmission({
          issue, repository, projects, taxonomy, exclusions, api, enrich, reviewer,
          commentBody: event.comment?.body ?? "",
        });
        if (retryClaim) result.retryClaim = retryClaim;
      }
      if (result.status === "ready") {
        const withoutCurrent = projects.filter(
          (p) => !(p.ingestion?.repository === repository && p.ingestion?.issueNumber === number) &&
                 !sameProject(p, result.project)
        );
        await atomicJSON(resolve(root, "src/data/projects.json"), [
          ...withoutCurrent,
          result.project,
        ]);
      }
    }
    const reviewedSourceSha = process.env.INGEST_REVIEWED_SHA;
    if (!/^[a-f\d]{40}$/.test(reviewedSourceSha ?? ""))
      throw new Error("Exact review checkout SHA is required");
    const issueNumber = Number(
      event?.issue?.number ?? process.env.INGEST_ISSUE_NUMBER ?? 0,
    );
    result = {
      ...result,
      reviewedSourceSha,
      ...(issueNumber > 0 ? { issueNumber } : {}),
      triggerCommentId: event?.comment?.id ?? null,
    };
    if (result.project && Object.prototype.hasOwnProperty.call(result.project, "enrichment")) {
      const { enrichment: _omit, ...project } = result.project;
      result = { ...result, project };
    }
    await mkdir(dirname(resultPath), { recursive: true });
    await atomicJSON(resultPath, result);
    const issueBodySha = result.issueBodySha ?? (result.project?.ingestion?.issueBodySha256 ?? "");
    await output({
      ready: ["ready", "resume"].includes(result.status),
      status: result.status,
      needs_evidence: result.needsEvidence === true,
      retry: result.retryable === true,
      issue_number: issueNumber,
      issue_body_sha: issueBodySha,
      retry_not_before: result.retryNotBefore ?? "",
    });
    console.log(
      JSON.stringify({
        status: result.status,
        reason: result.reason,
        enrichment: result.project?.enrichment ?? result.enrichment,
      }),
    );
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `Ingestion result: **${result.status}**\n\n${result.reason ?? ""}\n\nModels: ${result.project?.enrichment?.ai?.status ?? result.enrichment?.ai?.status ?? "not-called"}\n`,
      );
  } else if (mode === "publish") {
    if (process.env.INGEST_DRY_RUN === "true")
      throw new Error("Dry-run publication is forbidden");
    const prepared = JSON.parse(await readFile(resultPath, "utf8"));
    if (!["ready", "resume"].includes(prepared.status))
      throw new Error("No validated prepared project");
    if (prepared.reviewedSourceSha !== process.env.INGEST_REVIEWED_SHA)
      throw new Error("Immutable receipt does not match the reviewed source SHA");
    if (!process.env.INGEST_ASSET_FILE) throw new Error("Validated ingestion assets are required");
    const candidateContent = await readFile(resolve(dirname(resultPath), "candidate-projects.json"), "utf8");
    const assetBundle = await readAssetBundle(process.env.INGEST_ASSET_FILE, {
      reviewedSourceSha: prepared.reviewedSourceSha, candidateContent,
    });
    const result = await publishSubmission({
      api,
      repository,
      project: prepared.project,
      reviewedSourceSha: prepared.reviewedSourceSha,
      assetBundle,
      retryClaim: prepared.retryClaim,
    });
    await atomicJSON(resultPath, { ...prepared, publication: result });
    await output({
      ingested: result.status === "ingested",
      commit: result.commit ?? "",
      retry: result.retryable === true,
      issue_number: prepared.project.ingestion.issueNumber,
      issue_body_sha: prepared.project.ingestion.issueBodySha256,
    });
    console.log(JSON.stringify(result));
    if (result.status === "changed") process.exitCode = 1;
  } else if (mode === "acknowledge") {
    const projects = JSON.parse(
      await readFile(resolve(root, "src/data/projects.json"), "utf8"),
    );
    if (!projects.some((p) => p.ingestion?.repository === repository)) {
      console.log("No ingested submissions awaiting reconciliation.");
      return;
    }
    const revision = process.env.DEPLOYED_SHA;
    if (!/^[a-f\d]{40}$/.test(revision ?? ""))
      throw new Error("Exact deployed source SHA is required");
    let publishedProjects;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const response = await fetch(
          `${SITE_URL}projects.json?deployment=${revision}`,
          {
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(15000),
          },
        );
        if (!response.ok)
          throw new Error(`Published snapshot HTTP ${response.status}`);
        publishedProjects = await response.json();
        if (!Array.isArray(publishedProjects))
          throw new Error("Published snapshot is not an array");
        const expected = projects.filter(
          (p) => p.ingestion?.repository === repository,
        );
        if (
          expected.every((p) =>
            publishedProjects.some(
              (row) =>
                row.id === p.id && publicIdentity(row) === publicIdentity(p),
            ),
          )
        )
          break;
        publishedProjects = null;
      } catch {
        publishedProjects = null;
      }
      if (attempt < 5) await new Promise((r) => setTimeout(r, 5000));
    }
    if (!publishedProjects)
      throw new Error(
        "Published project snapshot not confirmed; issues remain open",
      );
    const results = await acknowledgePublished({
      api,
      repository,
      projects,
      publishedProjects,
    });
    console.log(JSON.stringify({ acknowledgements: results }));
  } else if (mode === "feedback") {
    const prepared = JSON.parse(await readFile(resultPath, "utf8"));
    console.log(JSON.stringify(await sendReviewFeedback({ api, repository, prepared })));
  } else throw new Error("Unknown ingestion command");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
