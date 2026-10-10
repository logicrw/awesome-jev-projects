/** Trusted workflow code only. Untrusted issues/READMEs are never executed. */
import { createHash } from "node:crypto";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createGitHubClient } from "./github-client.mjs";
import {
  extractSubmittedRepositories,
  extractSubmittedCodePaths,
  inspectRepository,
  collectAdditionalMaterials,
  isReadableMaterialPath,
} from "./project-source.mjs";
import { inferCanonicalTags } from "../src/lib/tags.mjs";
import {
  createSummaryEnricher,
  createSubmissionReviewer,
} from "./source-enrichment.mjs";
import { summarize, verifyIntegration, atomicJSON } from "./radar-sync.mjs";
import { readAssetBundle, validateAssetBundle } from "./ingestion-assets.mjs";
import { validateVerdict, resolveMaterialRefs, resolveMaterialFiles } from "./evidence-bundle.mjs";
import { licenseFactsFromRepo } from "../src/lib/catalog-contract.mjs";
import { reviewPolicyRevision } from "./review-policy.mjs";
import { settleRetry, validateRetryClaim, readReviewBudgetGrant } from "./ingestion-retry.mjs";
import { isSubmission } from "./submission-identity.mjs";
export { isSubmission } from "./submission-identity.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_URL = "https://logicrw.github.io/awesome-jev-projects/";
export const bodyHash = (body) =>
  createHash("sha256")
    .update(body ?? "")
    .digest("hex");
export const successComment =
  "🎉 感谢提交！项目已通过 Jev 相关材料审查，并已成功收录至 Awesome Jev 探索雷达：https://logicrw.github.io/awesome-jev-projects/ 欢迎持续关注并推荐更多 Jev 优秀项目！";
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

function matchesReviewedTitle(issue, hash, required = false) {
  if (hash === undefined) return !required;
  return /^[a-f\d]{64}$/.test(hash ?? "") && bodyHash(issue?.title) === hash;
}
function matchesReviewedIssue(issue, project) {
  return bodyHash(issue?.body) === project.ingestion?.issueBodySha256 &&
    matchesReviewedTitle(issue, project.ingestion?.issueTitleSha256, Boolean(project.catalogKind));
}

const REVIEW_MESSAGES = Object.freeze({
  "invalid-submission": "未取得有效的公开 GitHub 仓库候选。",
  "structural-rejection": "仓库未满足公开性、身份或固定版本等基本收录条件。",
  "duplicate": "此仓库已在目录中，无需重复收录。",
  "accepted": "模型已依据固定版本材料完成相关性与类型审查。",
  "model-rejected": "模型判断本次内容不属于可收录的 Jev 相关投稿；本轮自动审查已结束。",
  "insufficient-evidence": "当前材料不足以形成收录结论，本轮自动审查已结束；更新仓库材料或投稿说明后可触发下一轮。",
  "invalid-output": "模型输出未通过结构或证据引用校验，本轮自动审查已结束。",
  "provider-unavailable": "模型服务暂不可用，本轮未形成收录结论。",
  "transient-failure": "审查服务暂时不可用，将在限额内自动重试。",
  "budget-exhausted": "本轮自动审查额度已用尽，未形成可发布的收录结论。",
});
function reviewMessage(code) {
  return REVIEW_MESSAGES[code] ?? REVIEW_MESSAGES["invalid-output"];
}
function publicReviewMetadata(value, maximum = 160) {
  return typeof value === "string" && value.length <= maximum && /^[a-zA-Z0-9_./:-]+$/.test(value) &&
    !/github_pat_|gh[pousr]_|sk-[A-Za-z\d_-]{16,}|AKIA[A-Z\d]{16}/.test(value) ? value : undefined;
}
function reviewDiagnostics(review, reviewRevision) {
  if (!review || typeof review !== "object") return undefined;
  const attempts = Array.isArray(review.attempts) ? review.attempts.slice(0, 3).map((attempt) => ({
    attempt: Number.isSafeInteger(attempt.attempt) ? attempt.attempt : 0,
    ...(Number.isSafeInteger(attempt.phase) && attempt.phase >= 1 && attempt.phase <= 2 ? { phase: attempt.phase } : {}),
    status: publicReviewMetadata(attempt.status, 40) ?? "unknown",
    ...(Number.isInteger(attempt.httpStatus) ? { httpStatus: attempt.httpStatus } : {}),
    ...Object.fromEntries(["requestDigest", "requestModel", "thinking", "reasoningEffort", "responseModel", "systemFingerprint"]
      .filter((key) => publicReviewMetadata(attempt[key]))
      .map((key) => [key, attempt[key]])),
    usage: attempt.usage?.status === "reported" ? {
      status: "reported",
      ...Object.fromEntries(["promptTokens", "completionTokens", "totalTokens", "reasoningTokens", "cacheHitTokens", "cacheMissTokens"]
        .filter((key) => Number.isSafeInteger(attempt.usage[key]) && attempt.usage[key] >= 0)
        .map((key) => [key, attempt.usage[key]])),
    } : { status: "unknown" },
  })) : [];
  return {
    status: publicReviewMetadata(review.status, 40) ?? "invalid-output",
    decision: ["admit", "exclude", "need-more"].includes(review.decision) ? review.decision : null,
    reviewRevision, attempts,
    ...Object.fromEntries(["source", "requestModel"].filter((key) => publicReviewMetadata(review[key])).map((key) => [key, review[key]])),
    ...(review.budgetGrant ? { reservation: Object.fromEntries(["caseId", "reservationId"].filter((key) => publicReviewMetadata(review.budgetGrant[key])).map((key) => [key, review.budgetGrant[key]])) } : {}),
    ...(review.budget ? { budget: review.budget } : {}),
    ...(review.usage ? { usage: review.usage } : {}),
    ...(review.jevGate ? { jevGate: review.jevGate } : {}),
  };
}

function fixedMaterialSource(file, target) {
  if (!file || !isReadableMaterialPath(file.path) || typeof file.text !== "string" ||
      !/^[a-f\d]{64}$/.test(file.hash ?? "") || bodyHash(file.text) !== file.hash ||
      !/^[a-f\d]{40,64}$/.test(target.commit ?? "")) return false;
  try {
    const url = new URL(file.url);
    return url.origin === "https://github.com" && !url.search && !url.hash &&
      !url.username && !url.password &&
      decodeURIComponent(url.pathname) === `/${target.repository}/blob/${target.commit}/${file.path}`;
  } catch { return false; }
}
const VERDICT_FIELDS = ["target", "decision", "catalogKind", "jevRelation", "reviewBasis", "claims", "conflicts", "need", "category", "plainSummary", "plainSummaryEn"];
export async function prepareSubmission({
  issue, repository, projects, taxonomy, exclusions = [], api, enrich, reviewer,
  inspect = inspectRepository, now = () => new Date().toISOString(), commentBody = "",
  budgetLedger, budgetGrant, caseId, expectedReservationId, acquireEvidence,
  reviewRevision = reviewPolicyRevision(),
}) {
  requireOwner(repository);
  let reviewInvoked = false;
  const finish = (status, reasonCode, extra = {}) => ({
    status, reasonCode, reason: reviewMessage(reasonCode),
    issueNumber: issue?.number, issueBodySha: bodyHash(issue?.body), issueTitleSha: bodyHash(issue?.title),
    reviewContract: "material-v2", reviewRevision,
    needsEvidence: status === "insufficient-evidence",
    ...(!reviewInvoked && budgetLedger ? { budgetLedger } : {}), ...extra,
  });
  if (!Number.isSafeInteger(issue?.number) || issue.number < 1 || issue.pull_request || issue.state !== "open")
    return finish("ignored", "invalid-submission");
  if (!isSubmission(issue)) return finish("ignored", "invalid-submission");
  const submitted = extractSubmittedRepositories(issue.body, issue.title)
    .filter((name) => name.toLowerCase() !== repository.toLowerCase()).slice(0, 3);
  if (!submitted.length) return finish("rejected", "invalid-submission");
  // A deployed result for the exact same submission is already authoritative; this only resumes its acknowledgement.
  const resume = projects.find((project) => project.ingestion?.repository === repository &&
    project.ingestion.issueNumber === issue.number && matchesReviewedIssue(issue, project) &&
    submitted.some((name) => publicIdentity(project) === name.toLowerCase()));
  if (resume) return finish("resume", "duplicate", { project: resume });

  let fullIssueText = [issue.body ?? "", commentBody].filter(Boolean).join("\n\n");
  if (typeof api === "function") {
    try {
      const comments = await api(`/repos/${repository}/issues/${issue.number}/comments?per_page=100`);
      if (Array.isArray(comments)) fullIssueText += "\n\n" + comments
        .filter((comment) => comment.user?.type !== "Bot" && comment.user?.login !== "github-actions[bot]")
        .map((comment) => typeof comment.body === "string" ? comment.body.slice(0, 16000) : "")
        .join("\n\n");
    } catch { /* Hints are optional. They neither select a target nor grant admission. */ }
  }
  const snapshots = [];
  for (const [index, name] of submitted.entries()) {
    let inspection;
    try {
      inspection = await inspect({ api, repository: name, existingProjects: [], exclusions,
        verifyIntegration, semanticReview: true, preferredPaths: extractSubmittedCodePaths(fullIssueText, name) });
    } catch {
      inspection = { status: "unavailable", reason: "transport-failure" };
    }
    const repo = inspection.repo;
    const available = Boolean(repo?.private === false && Number.isSafeInteger(repo.id) && repo.id > 0 &&
      /^[a-f\d]{40,64}$/.test(inspection.sha ?? "") && inspection.status === "inspected");
    const target = {
      id: `R${index + 1}`, repository: repo?.full_name ?? name,
      repoId: Number.isSafeInteger(repo?.id) ? repo.id : null,
      commit: available ? inspection.sha : null, available,
      listed: projects.some((project) => (Number.isSafeInteger(repo?.id) && project.repoId === repo.id) || publicIdentity(project) === name.toLowerCase()),
      ...(repo?.fork ? { fork: true, parent: repo.parent?.full_name ?? null } : {}),
    };
    const materialSources = available ? (inspection.sources ?? inspection.materialSources ?? inspection.codeSources ?? inspection.evidence?.files ?? []) : [];
    const sources = materialSources.filter((source) => fixedMaterialSource(source, target))
      .map((source) => ({ ...source, targetId: target.id, repoId: target.repoId, commit: target.commit }));
    snapshots.push({ target, inspection, sources });
  }
  const targets = snapshots.map(({ target }) => target);
  const sources = snapshots.flatMap((snapshot) => snapshot.sources);
  const details = { candidateRepositories: targets.map(({ id, repository, available }) => ({ id, repository, available })) };
  if (targets.length && targets.every((target) => target.listed)) return finish("duplicate", "duplicate", details);
  if (typeof reviewer !== "function") return finish("provider-unavailable", "provider-unavailable", details);

  const supplement = acquireEvidence ?? (async ({ repository: name, commit, need, excludePaths }) =>
    collectAdditionalMaterials({ api, repository: name, sha: commit, need, excludePaths }));
  let review;
  try {
    reviewInvoked = true;
    review = await reviewer({ sources, targets, taxonomy, issue: { title: issue.title ?? "", body: issue.body ?? "" },
      budgetLedger, budgetGrant, caseId, expectedReservationId,
      ...(typeof supplement === "function" ? { acquireEvidence: async (request) => {
        const snapshot = snapshots.find(({ target }) => target.id === request.targetId);
        if (!snapshot?.target.available) return null;
        const extra = await supplement({ ...request, repository: snapshot.target.repository,
          repoId: snapshot.target.repoId, commit: snapshot.target.commit,
          excludePaths: snapshot.sources.map(({ path }) => path) });
        const added = (Array.isArray(extra) ? extra : extra?.sources ?? [])
          .filter((source) => fixedMaterialSource(source, snapshot.target))
          .map((source) => ({ ...source, targetId: snapshot.target.id, repoId: snapshot.target.repoId, commit: snapshot.target.commit }));
        for (const source of added) {
          if (!snapshot.sources.some((prior) => prior.path === source.path && prior.hash === source.hash)) {
            snapshot.sources.push(source); sources.push(source);
          }
        }
        return { targets, sources: [...sources] };
      } } : {}),
    });
  } catch { return finish("transient-retry", "transient-failure", { ...details, retryable: true }); }
  const diagnostics = reviewDiagnostics(review, reviewRevision);
  const reviewMeta = { ...details, reviewDetails: diagnostics, ...(review?.budgetLedger ? { budgetLedger: review.budgetLedger } : {}) };
  if (review?.status !== "completed") {
    if (review?.retryable === true) {
      const notBefore = Date.parse(review.retryNotBefore);
      const retryNotBefore = Number.isFinite(notBefore) && notBefore > Date.now() ? new Date(notBefore).toISOString() : undefined;
      return finish("transient-retry", "transient-failure", { ...reviewMeta, retryable: true, retryNotBefore });
    }
    const status = review?.status === "budget-not-reserved" ? "budget-exhausted" : ["insufficient-evidence", "budget-exhausted", "provider-unavailable", "dry-run"].includes(review?.status) ? review.status :
      ["missing-token", "missing-provider-config", "invalid-provider-config", "circuit-open", "http-error", "request-failed", "timeout"].includes(review?.status) ? "provider-unavailable" : "invalid-output";
    return finish(status, status, reviewMeta);
  }
  const bundle = review.evidenceBundle;
  const raw = Object.fromEntries(VERDICT_FIELDS.map((key) => [key, review[key]]));
  const verdict = bundle ? validateVerdict(raw, bundle, taxonomy) : null;
  if (!verdict) return finish("invalid-output", "invalid-output", reviewMeta);
  const snapshot = snapshots.find(({ target }) => target.id === verdict.target);
  if (!snapshot) return finish("invalid-output", "invalid-output", reviewMeta);
  const refs = resolveMaterialRefs(bundle, verdict);
  const files = resolveMaterialFiles(bundle, verdict);
  // All policy decisions belong to the model. This check only proves that the cited bytes
  // came from the selected, locally fetched snapshot, including supplemental materials.
  if (refs.some((ref) => {
    const source = sources.find((item) => item.targetId === ref.targetId && item.path === ref.path && item.hash === ref.sourceSha256);
    if (!source || ref.targetId !== verdict.target || ref.repoId !== snapshot.target.repoId || ref.commit !== snapshot.target.commit ||
        source.url !== ref.url || !ref.span || !Number.isSafeInteger(ref.span.startByte) || !Number.isSafeInteger(ref.span.endByte)) return true;
    const { startByte: start, endByte: end } = ref.span;
    const bytes = Buffer.from(source.text, "utf8");
    const base = source.readSpan?.startByte ?? 0;
    return !Number.isSafeInteger(base) || base < 0 || start < base || end <= start || end > base + bytes.length ||
      bodyHash(bytes.subarray(start - base, end - base)) !== ref.spanSha256;
  })) return finish("invalid-output", "invalid-output", reviewMeta);
  if (verdict.decision === "exclude") return finish("rejected", "model-rejected", { ...reviewMeta, submittedRepository: snapshot.target.repository });
  if (verdict.decision === "need-more") return finish("insufficient-evidence", "insufficient-evidence", { ...reviewMeta, submittedRepository: snapshot.target.repository });
  if (!snapshot.target.available || !refs.length || !files.length) return finish("invalid-output", "invalid-output", reviewMeta);
  const { repo, sha, commits = [], readme = "" } = snapshot.inspection;
  const existing = projects.find((project) => project.repoId === repo.id || publicIdentity(project) === repo.full_name.toLowerCase());
  if (existing) return finish("duplicate", "duplicate", { ...reviewMeta, submittedRepository: repo.full_name });

  const baseSummary = {
    category: verdict.category, catalogKind: verdict.catalogKind, jevRelation: verdict.jevRelation, reviewBasis: verdict.reviewBasis,
    plainSummary: verdict.plainSummary, plainSummaryEn: verdict.plainSummaryEn,
    jevDecisionPoint: verdict.plainSummary, jevDecisionPointEn: verdict.plainSummaryEn,
    highlightBenefit: "材料已绑定固定版本；收录不代表独立运行或性能验证。",
    highlightBenefitEn: "References are pinned to a fixed revision; inclusion is not independent runtime or performance verification.",
    tags: inferCanonicalTags({ category: verdict.category, tags: [] }), summarySource: "ai-material-review",
  };
  const enriched = typeof enrich === "function" ? await enrich({ repo, readme,
    fallback: baseSummary, reviewed: { ...review, ...verdict, evidenceBundle: bundle, materialsValidated: true } }) : baseSummary;
  const { enrichment: _enrichment, ...editorial } = { ...enriched, ...baseSummary };
  const [author, name] = repo.full_name.split("/");
  const project = {
    id: `${author}:${name}`.toLowerCase(), name, author,
    url: `https://github.com/${repo.full_name}`, repoId: repo.id, ...editorial,
    stars: repo.stargazers_count, forks: repo.forks_count, openIssues: repo.open_issues_count,
    license: licenseFactsFromRepo(repo), createdAt: repo.created_at,
    lastCommitAt: commits[0]?.commit?.committer?.date ?? null,
    headSha: sha, metadataFetchedAt: now(), metadataStatus: "ok", avatarUrl: repo.owner?.avatar_url,
    verificationStatus: "material-reviewed", runtimeVerified: false, discoveredAt: now(),
    claimStatus: "模型依据固定版本材料判断生态类型与 Jev 关联；未经本站独立运行、安全或性能验证。",
    claimStatusEn: "A model assessed the ecosystem role and Jev relationship from pinned materials; runtime, security and performance are not independently verified.",
    evidence: files.map(({ url }) => ({ url, note: "固定版本的相关材料" })),
    sourceVerification: { method: "ai-material-review-v2", sha, files, materials: refs, reviewRevision,
      model: { requested: publicReviewMetadata(review.requestModel) ?? null,
        response: publicReviewMetadata(review.attempts?.at(-1)?.responseModel) ?? null,
        systemFingerprint: publicReviewMetadata(review.attempts?.at(-1)?.systemFingerprint) ?? null },
      decision: verdict.decision, catalogKind: verdict.catalogKind, jevRelation: verdict.jevRelation, reviewBasis: verdict.reviewBasis,
      claims: verdict.claims, conflicts: verdict.conflicts },
    ingestion: { repository, issueNumber: issue.number, issueBodySha256: bodyHash(issue.body), issueTitleSha256: bodyHash(issue.title), reviewRevision,
      issueUrl: `https://github.com/${repository}/issues/${issue.number}` },
  };
  return finish("ready", "accepted", { project, ...reviewMeta });
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
  reviewRevision = reviewPolicyRevision(),
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
  if (project.catalogKind && !/^[a-f\d]{64}$/.test(ingestion.issueTitleSha256 ?? ""))
    throw new Error("Material-reviewed projects require an exact Issue title hash");
  if (project.catalogKind && !/^[a-f\d]{64}$/.test(ingestion.reviewRevision ?? ""))
    throw new Error("Material-reviewed projects require an exact review policy revision");
  if (ingestion.reviewRevision !== undefined && ingestion.reviewRevision !== reviewRevision)
    return { status: "superseded", changed: false, retryable: false };
  if (retryClaim && (retryClaim.issueNumber !== ingestion.issueNumber ||
      retryClaim.bodySha !== ingestion.issueBodySha256 ||
      ((project.catalogKind || retryClaim.titleSha) && retryClaim.titleSha !== ingestion.issueTitleSha256) ||
      ((project.catalogKind || retryClaim.reviewRevision) && retryClaim.reviewRevision !== ingestion.reviewRevision) ||
      !await validateRetryClaim({ api, repository, candidate: retryClaim, trustedWriter })))
    return { status: "superseded", changed: false, retryable: false };
  const issue = await api(
    `/repos/${repository}/issues/${ingestion.issueNumber}`,
  );
  if (
    issue.state !== "open" ||
    issue.pull_request ||
    !matchesReviewedIssue(issue, project)
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
          existing.ingestion.issueBodySha256 === ingestion.issueBodySha256 &&
          (!project.catalogKind || (existing.ingestion.issueTitleSha256 === ingestion.issueTitleSha256 &&
            existing.ingestion.reviewRevision === ingestion.reviewRevision));
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
    if (latestIssue.state !== "open" || latestIssue.pull_request || !matchesReviewedIssue(latestIssue, project))
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
    if (!matchesReviewedIssue(issue, project)) {
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
      !matchesReviewedIssue(latest, project)
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
      candidate: { issueNumber: issue.number, bodySha: project.ingestion.issueBodySha256, titleSha: project.ingestion.issueTitleSha256, reviewRevision: project.ingestion.reviewRevision }, state: "completed" });
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
  reviewRevision = reviewPolicyRevision(),
}) {
  requireOwner(repository);
  if (dryRun || process.env.INGEST_DRY_RUN === "true") return { status: "dry-run" };
  const issueNumber = prepared?.issueNumber;
  const issueBodySha = prepared?.issueBodySha;
  const issueTitleSha = prepared?.issueTitleSha;
  const requiresTitle = prepared?.reviewContract === "material-v2" || Boolean(prepared?.project?.catalogKind);
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1 || !/^[a-f\d]{64}$/.test(issueBodySha ?? "") ||
      (requiresTitle && (!/^[a-f\d]{64}$/.test(issueTitleSha ?? "") || !/^[a-f\d]{64}$/.test(prepared.reviewRevision ?? ""))))
    return { status: "invalid-receipt" };
  if (prepared.reviewRevision !== undefined && prepared.reviewRevision !== reviewRevision) return { status: "superseded" };
  if (prepared.retryClaim && (prepared.retryClaim.issueNumber !== issueNumber || prepared.retryClaim.bodySha !== issueBodySha ||
      ((requiresTitle || prepared.retryClaim.titleSha !== undefined) && prepared.retryClaim.titleSha !== issueTitleSha) ||
      ((requiresTitle || prepared.retryClaim.reviewRevision !== undefined) && prepared.retryClaim.reviewRevision !== prepared.reviewRevision)))
    return { status: "superseded" };
  const terminal = {
    rejected: "rejected", duplicate: "rejected", "insufficient-evidence": "insufficient-evidence",
    "invalid-output": "invalid-output",
  }[prepared.status];
  if (!terminal) return { status: "not-needed" };
  const candidate = { ...(prepared.retryClaim ?? {}), issueNumber, bodySha: issueBodySha,
    ...(issueTitleSha ? { titleSha: issueTitleSha } : {}), ...(prepared.reviewRevision ? { reviewRevision: prepared.reviewRevision } : {}) };
  const path = `/repos/${repository}/issues/${issueNumber}`;
  const current = async () => {
    const issue = await api(path);
    return issue.state === "open" && !issue.pull_request && bodyHash(issue.body) === issueBodySha &&
      matchesReviewedTitle(issue, issueTitleSha, requiresTitle) ? issue : null;
  };
  if (!await current()) return { status: "superseded" };
  if (prepared.retryClaim && !await validateRetryClaim({ api, repository, candidate, trustedWriter }))
    return { status: "superseded" };
  const reasonCode = Object.hasOwn(REVIEW_MESSAGES, prepared.reasonCode) ? prepared.reasonCode : "invalid-output";
  const marker = issueTitleSha
    ? `<!-- awesome-jev-review-feedback:v3:${issueNumber}:${issueBodySha}:${issueTitleSha}:${prepared.reviewRevision}:${reasonCode} -->`
    : `<!-- awesome-jev-review-feedback:v2:${issueNumber}:${issueBodySha}:${reasonCode} -->`;
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
      delete process.env.TYPESAFE_API_KEY;
      delete process.env.JEV_API_KEY;
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
        targets: [{ id: "R1", repository: "logicrw/probe", repoId: 1, commit: sha, available: true, listed: false }],
        sources: probeSources.map((source) => ({ ...source, targetId: "R1", repoId: 1, commit: sha })),
        issue: { title: "Diagnostic fixture", body: "Classify this synthetic Jev integration for endpoint diagnostics." },
        allowUnreserved: true, caseId: bodyHash("explicit-remote-diagnostic"),
        taxonomy,
      });
      result = {
        status: "remote-probe", decision: review.decision,
        reviewDetails: reviewDiagnostics(review, reviewPolicyRevision()), usage: review.usage,
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
      const reviewRevision = reviewPolicyRevision();
      const retryClaim = process.env.INGEST_RETRY_CLAIM_ID ? {
        issueNumber: number, bodySha: process.env.INGEST_EXPECTED_BODY_SHA,
        titleSha: process.env.INGEST_EXPECTED_TITLE_SHA, reviewRevision: process.env.INGEST_EXPECTED_REVIEW_REVISION,
        claimId: process.env.INGEST_RETRY_CLAIM_ID, attempt: Number(process.env.INGEST_RETRY_ATTEMPT),
      } : null;
      const expectedBody = process.env.INGEST_EXPECTED_BODY_SHA;
      const expectedTitle = process.env.INGEST_EXPECTED_TITLE_SHA;
      const expectedRevision = process.env.INGEST_EXPECTED_REVIEW_REVISION;
      if ((expectedBody && expectedBody !== bodyHash(issue.body)) || (expectedTitle && expectedTitle !== bodyHash(issue.title)) ||
          (expectedRevision && expectedRevision !== reviewRevision) ||
          (retryClaim && !await validateRetryClaim({ api, repository, candidate: retryClaim, trustedWriter: process.env.INGEST_TRUSTED_WRITER }))) {
        result = { status: "superseded", issueNumber: number, issueBodySha: bodyHash(issue.body), issueTitleSha: bodyHash(issue.title), reviewRevision, reviewContract: "material-v2", retryable: false };
      } else {
        const dryRun = process.env.INGEST_DRY_RUN === "true";
        const reservationId = process.env.INGEST_BUDGET_RESERVATION_ID;
        const grant = !dryRun && reservationId ? await readReviewBudgetGrant({
          api, issueNumber: number, bodySha: bodyHash(issue.body), titleSha: bodyHash(issue.title), reviewRevision, reservationId,
          trustedWriter: process.env.INGEST_TRUSTED_WRITER,
        }) : null;
        result = await prepareSubmission({
          issue, repository, projects, taxonomy, exclusions, api, enrich, reviewRevision,
          reviewer: dryRun ? async () => ({ status: "dry-run", retryable: false }) :
            grant ? reviewer : async () => ({ status: process.env.REVIEW_PROVIDER_CONFIGURED === "false" ? "provider-unavailable" : "budget-exhausted", retryable: false }),
          budgetLedger: grant?.budgetLedger, budgetGrant: grant?.budgetGrant,
          caseId: grant?.budgetLedger?.caseId, expectedReservationId: grant?.budgetGrant?.reservationId,
          commentBody: event.comment?.body ?? "",
        });
        if (retryClaim) result.retryClaim = retryClaim;
        if (grant) result.budgetReservationId = reservationId;
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
      issue_title_sha: result.issueTitleSha ?? result.project?.ingestion?.issueTitleSha256 ?? "",
      review_revision: result.reviewRevision ?? result.project?.ingestion?.reviewRevision ?? "",
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
      issue_title_sha: prepared.project.ingestion.issueTitleSha256 ?? "",
      review_revision: prepared.project.ingestion.reviewRevision ?? "",
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
