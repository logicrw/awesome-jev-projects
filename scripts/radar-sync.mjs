#!/usr/bin/env node
import { inferCanonicalTags } from "../src/lib/tags.mjs";
/** Public GitHub radar. No repository code is executed; all remote text is untrusted data. */
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createGitHubClient } from "./github-client.mjs";
import {
  createSummaryEnricher,
  createSubmissionReviewer,
} from "./source-enrichment.mjs";
import { inspectRepository, collectAdditionalMaterials, hasOpenRouterJevSource } from "./project-source.mjs";
import { validateVerdict, resolveMaterialRefs, resolveMaterialFiles } from "./evidence-bundle.mjs";
import { licenseFactsFromRepo } from "../src/lib/catalog-contract.mjs";
import { reviewPolicyRevision } from "./review-policy.mjs";
import { radarCaseId, readRadarBudgetGrant } from "./radar-budget.mjs";

/** Manual/editorial copy must survive metadata sync. Keep existing statuses; curated is the same class. */
export const PROTECTED_SUMMARY_SOURCES = Object.freeze([
  "source-reviewed",
  "human-reviewed",
  "curated",
]);
export const PROTECTED_EDITORIAL_KEYS = Object.freeze([
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
  "evidence",
  "summarySource",
  "claimStatus",
  "claimStatusEn",
  "claimStatusJa",
  "claimStatusKo",
  "sourceVerification",
  "sourceReviewedAt",
  "verificationStatus",
  "runtimeVerified",
]);
export function isProtectedSummarySource(value) {
  return PROTECTED_SUMMARY_SOURCES.includes(value);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const normalizeRepo = (value) => {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.hostname !== "github.com") return null;
    const p = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    return p.length === 2 && p.every((x) => /^[\w.-]+$/.test(x))
      ? p.join("/")
      : null;
  } catch {
    return null;
  }
};
export function verifyIntegration(repo, text, { codeSources = [] } = {}) {
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  // Jev is also available through OpenRouter's decisions API. An exact model
  // identifier and provider request marker are both required; names alone fail.
  const routerDecision = codeSources.some(hasOpenRouterJevSource);
  const serverSystemOne =
    (/(?:@[\w.]*\.post|router\.(?:post|handle|POST)|app\.(?:post|all)|Route\s*\(\s*["']POST["']|Endpoint|def\s+post|fn\s+handle|route|do_POST|path\s*=)\s*\(?["']?\/v1\/(?:systemone|decide)["']?/i.test(text) ||
    /(?:path|url|route|endpoint)\b[^;\n]*["']\/v1\/(?:systemone|decide)["']|["']\/v1\/(?:systemone|decide)["'][^;\n]*(?:in|\.startswith|\.endswith|==|===|\.includes|\.indexOf|path|url|\))/i.test(text)) &&
    /\bchoice\b/i.test(text) &&
    (/\bscore\b/i.test(text) || /\bnoul\b/i.test(text) || /\blogits?\b/i.test(text) || /\bconfidence\b/i.test(text) || /\bquestions?\b/i.test(text));
  const exact = routerDecision || serverSystemOne ||
    /(?<![\w.-])(?:api\.)?typesafe\.ai(?![\w.-])|@typesafe(?:-ai)?\/[\w.-]+|from\s+typesafe(?:_ai|_sdk)?\s+import|typesafe(?:_ai|-ai|_sdk|-sdk)|\bjev\.(?:choice|score|noul|decision|query|client|ask)|\b(?:JevClient|TypeSafeClient)\b|TYPESAFE_API_KEY|(?<![~/\w.-])typesafe-ai\/jev|["'](?:package:(?:jev|typesafe)[\w./-]*|@typesafe(?:-ai)?\/[\w.-]+|github\.com\/(?:typesafe-ai|typesafe)[\w./-]*|(?:go\.)?typesafe\.ai\/[\w.-]*)["']|\buse\s+(?:typesafe(?:_ai|_sdk|_jev)?|jev)::/i.test(
      text,
    );
  const context =
    serverSystemOne ||
    (/(?:\b|_)jev(?:[A-Za-z0-9_]|\b)/i.test(text) &&
    /\b(ai|llm|agent|decision|inference|classification|model|choice|score|noul)\b/i.test(
      text,
    ));
  const implementation = routerDecision || serverSystemOne ||
    /(?<![\w.-])api\.typesafe\.ai(?![\w.-])|from\s+typesafe(?:_ai|_sdk)?\s+import|(?:import|require|npm\s+(?:i|install)|pip\s+install|uv\s+add).{0,100}(?:typesafe|jev)|\bjev\.(?:choice|score|noul|decision|query|client|ask)|TypeSafeClient|JevClient|TYPESAFE_API_KEY|JEV_API_KEY|typesafe\.Client|typesafe\.AsyncClient|(?<![~/\w.-])typesafe-ai\/jev|["'](?:package:(?:jev|typesafe)[\w./-]*|@typesafe(?:-ai)?\/[\w.-]+|github\.com\/(?:typesafe-ai|typesafe)[\w./-]*|(?:go\.)?typesafe\.ai\/[\w.-]*)["']|\buse\s+(?:typesafe(?:_ai|_sdk|_jev)?|jev)::/i.test(
      text,
    );
  const listOnly =
    /^(?:docs|documentation|.*-docs)$/i.test(repo.name) ||
    /^(?:awesome-|awesome$)|(?:curated (?:list|collection)|awesome list|collection of (?:ai|llm|tools))/i.test(
      repo.name + " " + (repo.description ?? ""),
    );
  return {
    verified: exact && context && implementation && !listOnly,
    reason: listOnly
      ? "mention-only directory"
      : !exact
        ? "no exact provider evidence"
        : !context
          ? "no Jev decision context"
          : !implementation
            ? "mention without integration evidence"
            : "provider + Jev + implementation",
    evidence: text
      .split("\n")
      .filter((l) =>
        /(?<![\w.-])api\.typesafe\.ai(?![\w.-])|@typesafe|typesafe\/jev|typesafe-ai\/jev|openrouter\.ai|from\s+typesafe|\bjev\b|TYPESAFE_API_KEY|TypeSafeClient|\/v1\/(?:systemone|decide)/i.test(
          l,
        ),
      )
      .slice(0, 8)
      .map((l) => l.slice(0, 220)),
  };
}

const enrichSummary = createSummaryEnricher();
const reviewCandidate = createSubmissionReviewer();
export async function enrichCandidateSummary(repo, readme, fallbackSummary) {
  return enrichSummary({ repo, readme, fallback: fallbackSummary });
}
export const summarizeWithGitHubModels = enrichCandidateSummary;

const MAX_REVIEW_ATTEMPTS = 3;
const VERDICT_FIELDS = ["target", "decision", "catalogKind", "jevRelation", "reviewBasis", "claims", "conflicts", "need", "category", "plainSummary", "plainSummaryEn"];
export function radarReviewFingerprint(inspection, taxonomy, configRevision = process.env.REVIEW_CONFIG_REVISION ?? process.env.RADAR_REVIEW_REVISION ?? "") {
  const sources = inspection.sources ?? [];
  const targets = inspection.targets ?? [{ id: "R1", repository: inspection.repo?.full_name, repoId: inspection.repo?.id ?? null,
    commit: inspection.sha ?? null, available: Boolean(inspection.repo && inspection.sha), listed: false }];
  return createHash("sha256").update(JSON.stringify({
    policyRevision: reviewPolicyRevision({ configRevision }),
    targets, files: sources.map(({ targetId, path, url, hash }) => ({ targetId, path, url, hash })),
    categories: taxonomy.map(({ category }) => category),
  })).digest("hex");
}
export function radarNeedsSemanticReview({ inspection, taxonomy, previousState = {}, now = new Date().toISOString(), configRevision }) {
  if (inspection.status !== "inspected") return false;
  if (previousState.fingerprint !== radarReviewFingerprint(inspection, taxonomy, configRevision)) return true;
  return !["rejected", "blocked", "retry-exhausted", "insufficient-evidence", "budget-exhausted"].includes(previousState.status) &&
    !(previousState.status === "deferred" && Date.parse(previousState.nextAttemptAt) > Date.parse(now));
}
/** The model makes the semantic decision; local checks bind its citations to inspected material. */
export async function reviewRadarCandidate({
  inspection, taxonomy, reviewer = reviewCandidate, previousState = {},
  now = new Date().toISOString(), configRevision = process.env.REVIEW_CONFIG_REVISION ?? process.env.RADAR_REVIEW_REVISION ?? "",
  budgetLedger, budgetGrant, expectedReservationId, acquireEvidence,
}) {
  const sources = [...(inspection.sources ?? [])];
  const targets = inspection.targets ?? [{ id: "R1", repository: inspection.repo?.full_name,
    repoId: inspection.repo?.id ?? null, commit: inspection.sha ?? null, available: Boolean(inspection.repo && inspection.sha), listed: false }];
  const fingerprint = radarReviewFingerprint(inspection, taxonomy, configRevision);
  const prior = previousState.fingerprint === fingerprint ? previousState : {};
  if (!radarNeedsSemanticReview({ inspection, taxonomy, previousState, now, configRevision }) && inspection.status === "inspected")
    return { status: prior.status, reason: prior.reason, cached: true, state: { ...prior, checkedAt: now } };
  let reviewDetails;
  const finish = (status, reason, extra = {}) => ({
    status, reason, ...(reviewDetails ? { reviewDetails } : {}), ...extra,
    state: { fingerprint, checkedAt: now, status, reason, attempts: prior.attempts ?? 0, ...extra.state },
  });
  if (inspection.status !== "inspected" || !inspection.repo || !inspection.sha)
    return finish("rejected", inspection.reason ?? "source-inspection-rejected");
  const attempts = (prior.attempts ?? 0) + 1;
  const nextAttemptAt = (notBefore) => new Date(Math.max(
    Date.parse(now) + 6 * 60 * 60 * 1000 * 2 ** (attempts - 1),
    Number.isFinite(Date.parse(notBefore)) ? Date.parse(notBefore) : 0,
  )).toISOString();
  let reviewed;
  const acquireScoped = typeof acquireEvidence === "function" ? async (request) => {
    const acquired = await acquireEvidence(request);
    const extras = Array.isArray(acquired) ? acquired : acquired?.sources ?? [];
    const accepted = extras.filter((source) => {
      const target = targets.find((entry) => entry.id === source.targetId);
      return target?.available === true && typeof source.text === "string" && createHash("sha256").update(source.text).digest("hex") === source.hash &&
        source.url === `https://github.com/${target.repository}/blob/${target.commit}/${source.path.split("/").map(encodeURIComponent).join("/")}`;
    });
    sources.push(...accepted);
    return accepted;
  } : undefined;
  try { reviewed = await reviewer({ sources, targets, taxonomy, acquireEvidence: acquireScoped,
    budgetLedger: budgetLedger ?? prior.budgetLedger, budgetGrant, expectedReservationId, caseId: budgetLedger?.caseId ?? prior.budgetLedger?.caseId }); }
  catch { reviewed = { retryable: true, status: "request-failed" }; }
  reviewDetails = { reviewRevision: reviewPolicyRevision({ configRevision }),
    requestModel: typeof reviewed?.requestModel === "string" && /^[a-zA-Z0-9_./:-]{1,120}$/.test(reviewed.requestModel) ? reviewed.requestModel : undefined,
    source: ["deepseek", "muse-spark", "github-models"].includes(reviewed?.source) ? reviewed.source : undefined,
    status: reviewed?.status ?? "missing-response", attempts: reviewed?.attempts ?? [],
    budget: reviewed?.budget, budgetLedger: reviewed?.budgetLedger, usage: reviewed?.usage };
  const state = { attempts, ...(reviewed?.budgetLedger ? { budgetLedger: reviewed.budgetLedger } : {}) };
  if (!reviewed || reviewed.status !== "completed") {
    const retryable = !reviewed || reviewed.retryable === true;
    const reason = typeof reviewed?.status === "string" && /^[a-z0-9-]{1,40}$/.test(reviewed.status)
      ? reviewed.status : "review-unavailable";
    const status = reason === "budget-exhausted" ? "budget-exhausted"
      : retryable ? attempts >= MAX_REVIEW_ATTEMPTS ? "retry-exhausted" : "deferred" : "blocked";
    return finish(status, reason, { state: { ...state, ...(status === "deferred" ? { nextAttemptAt: nextAttemptAt(reviewed?.retryNotBefore) } : {}) } });
  }
  let verdict, materials, files;
  try {
    verdict = validateVerdict(Object.fromEntries(VERDICT_FIELDS.map((key) => [key, reviewed[key]])), reviewed.evidenceBundle, taxonomy);
    materials = verdict ? resolveMaterialRefs(reviewed.evidenceBundle, verdict) : [];
    files = verdict ? resolveMaterialFiles(reviewed.evidenceBundle, verdict) : [];
    if (!verdict || materials.some((material) => {
      const manifest = reviewed.evidenceBundle.sourceMap.get(material.id);
      const target = targets.find((entry) => entry.id === material.targetId);
      return !manifest || !target || target.available !== true || target.commit !== material.commit || target.repoId !== material.repoId ||
        !sources.some((source) => source.path === manifest.path && source.url === manifest.url && source.hash === manifest.hash && source.text === manifest.text &&
          JSON.stringify(source.readSpan ?? { startByte: 0, endByte: Buffer.byteLength(source.text) }) === JSON.stringify(manifest.readSpan) &&
          (source.originalBytes == null || source.originalBytes === manifest.originalBytes) &&
          createHash("sha256").update(source.text).digest("hex") === source.hash) ||
        manifest.url !== `https://github.com/${target.repository}/blob/${target.commit}/${manifest.path.split("/").map(encodeURIComponent).join("/")}`;
    })) verdict = null;
  } catch { verdict = null; }
  if (!verdict) return finish(attempts >= MAX_REVIEW_ATTEMPTS ? "retry-exhausted" : "deferred", "invalid-material-reference", {
    state: { ...state, ...(attempts < MAX_REVIEW_ATTEMPTS ? { nextAttemptAt: nextAttemptAt() } : {}) },
  });
  if (verdict.decision === "exclude") return finish("rejected", "model-excluded", { state });
  if (verdict.decision === "need-more") return finish("insufficient-evidence", verdict.need ?? "material-needed", { state });
  const target = targets.find((entry) => entry.id === verdict.target);
  if (!target || target.available !== true || !/^[a-f\d]{40}$/.test(target.commit ?? ""))
    return finish("blocked", "target-unavailable", { state });
  const summary = {
    category: verdict.category, catalogKind: verdict.catalogKind, jevRelation: verdict.jevRelation, reviewBasis: verdict.reviewBasis,
    plainSummary: verdict.plainSummary, plainSummaryEn: verdict.plainSummaryEn,
    jevDecisionPoint: verdict.plainSummary, jevDecisionPointEn: verdict.plainSummaryEn,
    highlightBenefit: "依据固定版本材料整理；未独立验证运行效果或性能。",
    highlightBenefitEn: "Described from pinned material; runtime behavior and performance are not independently verified.",
    tags: inferCanonicalTags({ category: verdict.category, tags: [] }), summarySource: "ai-material-review",
  };
  return finish("accepted", "model-admitted", {
    reviewed: { ...reviewed, ...verdict }, target,
    sourceVerification: { method: "ai-material-review-v1", reviewRevision: reviewPolicyRevision({ configRevision }), caseRevision: fingerprint, sha: target.commit, target: verdict.target,
      catalogKind: verdict.catalogKind, jevRelation: verdict.jevRelation, reviewBasis: verdict.reviewBasis,
      files, materials, claims: verdict.claims, conflicts: verdict.conflicts },
    summary, state,
  });
}

export function summarize(repo, readme, taxonomy) {
  const focused = `${repo.name} ${repo.description ?? ""} ${(repo.topics ?? []).join(" ")} ${readme.slice(0, 7000)}`;
  const matches = taxonomy
    .map((rule) => ({
      ...rule,
      score: rule.patterns.reduce((score, pattern) => {
        const re = new RegExp(pattern, "i");
        return (
          score +
          (re.test(`${repo.name} ${repo.description ?? ""}`) ? 4 : 0) +
          (re.test((repo.topics ?? []).join(" ")) ? 3 : 0) +
          (re.test(readme.slice(0, 1500)) ? 2 : 0) +
          (re.test(focused) ? 1 : 0)
        );
      }, 0),
    }))
    .sort((a, b) => b.score - a.score);
  const rule = matches[0]?.score ? matches[0] : null;
  const subject = repo.description
    ?.replace(/https?:\/\/\S+/g, "")
    .trim()
    .slice(0, 150);
  const category = rule?.category ?? "Decision Tools";
  const tags = [
    ...new Set(
      [
        ...(rule?.tags ?? []),
        ...(repo.topics ?? []).filter(
          (t) => !["jev", "typesafe", "typesafe-ai"].includes(t),
        ),
        repo.language,
      ].filter(Boolean),
    ),
  ].slice(0, 6);
  return {
    category,
    plainSummary: subject
      ? `${repo.name}：${subject}`
      : `${repo.name} ${rule?.summary ?? "把 Jev 接入软件，让程序拿到可直接使用的判断。"}`,
    jevDecisionPoint:
      rule?.decision ??
      "把任务状态交给 Jev，返回供本地程序使用的结构化判断；具体策略请查看来源。",
    jevDecisionPointEn:
      rule?.decisionEn ??
      "Jev returns a structured decision for the local program; consult the source for the exact decision policy.",
    highlightBenefit:
      rule?.benefit ?? "把选择和打分接进现有程序；暂无可核验的性能对照。",
    highlightBenefitEn:
      rule?.benefitEn ??
      "Adds structured choices or scores to the workflow; performance and cost benefits have not been independently verified.",
    tags: inferCanonicalTags({ category, tags }),
    summarySource: "readme-extractive",
    claimStatus:
      "根据仓库简介与 README 自动提炼；决策机制为规则归类，待人工复核，未独立测试性能。",
    claimStatusEn:
      "Based on repository metadata and README with rule-based classification; pending human review, with no independent runtime or performance verification.",
  };
}
/** An allowlist keeps upstream descriptions and metadata out of reviewed copy. */
export function refreshMetadata(
  project,
  meta,
  commits,
  syncedAt = new Date().toISOString(),
) {
  if (
    !Number.isSafeInteger(meta.stargazers_count) ||
    meta.stargazers_count < 0
  ) {
    throw new Error("GitHub repository metadata has an invalid star count");
  }
  const refreshed = {
    ...project,
    stars: meta.stargazers_count,
    updatedAt: meta.updated_at ?? project.updatedAt,
    pushedAt: meta.pushed_at ?? project.pushedAt,
    lastCommitAt: commits[0]?.commit?.committer?.date ?? null,
    lastSyncedAt: syncedAt,
    metadataStatus: "ok",
    metadataFetchedAt: syncedAt,
  };
  // Pinned seeds retain every editorial and non-time field, including their
  // fixed source SHA, license and forks. Only stars/timestamps/status change.
  if (!project.pinned) {
    Object.assign(refreshed, {
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      license: licenseFactsFromRepo(meta),
      headSha: commits[0]?.sha ?? null,
      createdAt: meta.created_at,
      avatarUrl: meta.owner?.avatar_url,
      archived: meta.archived,
    });
  }
  if (project.pinned || isProtectedSummarySource(project.summarySource)) {
    for (const key of PROTECTED_EDITORIAL_KEYS) {
      if (Object.prototype.hasOwnProperty.call(project, key)) {
        refreshed[key] = project[key];
      }
    }
  }
  delete refreshed.metadataError;
  return refreshed;
}
export async function atomicJSON(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = path + `.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await rename(tmp, path);
}
async function projectFromMaterialDecision({ api, decision, inspection, started }) {
  const { reviewed, summary, target } = decision;
  const repo = target.repository === inspection.repo.full_name ? inspection.repo : await api(`/repos/${target.repository}`);
  if (repo.private !== false || repo.id !== target.repoId || repo.full_name !== target.repository)
    throw new Error("Reviewed target identity changed before catalog admission");
  const sha = target.commit;
  const commits = target.repository === inspection.repo.full_name ? inspection.commits : [];
  const sourceUrl = decision.sourceVerification.files[0]?.url ?? `https://github.com/${target.repository}/tree/${sha}`;
  const sourceHash = createHash("sha256").update(JSON.stringify(decision.sourceVerification.materials)).digest("hex");
  const project = {
    id: `${repo.owner.login}:${repo.name}`.toLowerCase(),
    name: repo.name,
    repoId: repo.id,
    author: repo.owner.login,
    url: repo.html_url,
    ...summary,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    license: licenseFactsFromRepo(repo),
    createdAt: repo.created_at,
    lastCommitAt: commits[0]?.commit.committer.date ?? null,
    headSha: sha,
    metadataFetchedAt: new Date().toISOString(),
    metadataStatus: "ok",
    avatarUrl: repo.owner.avatar_url,
    verificationStatus: "material-reviewed",
    runtimeVerified: false,
    discoveredAt: started,
    claimStatus: "模型依据固定版本材料判断收录类型与 Jev 关系；未经本站运行、安全或性能验证。",
    claimStatusEn: "Model classification identifies the entry type and Jev relationship from pinned material; runtime, security and performance are not independently verified.",
    evidence: decision.sourceVerification.files.map(({ url }) => ({ url, note: "固定版本的审查材料" })),
    sourceVerification: decision.sourceVerification,
    sourceHash,
  };
  return project;
}

async function reviewPlannedRadar() {
  const plan = JSON.parse(await readFile(process.env.RADAR_PLAN_FILE, "utf8"));
  const authorization = JSON.parse(await readFile(process.env.RADAR_GRANTS_FILE, "utf8"));
  if (plan.version !== 1 || !Array.isArray(plan.cases) || plan.cases.length > 250 ||
      new Set(plan.cases.map((entry) => entry.caseId)).size !== plan.cases.length || authorization.version !== 1 || !Array.isArray(authorization.grants))
    throw new Error("Invalid immutable radar review plan");
  const api = createGitHubClient({ token: process.env.GITHUB_TOKEN });
  const known = JSON.parse(await readFile(resolve(root, "src/data/projects.json"), "utf8"));
  const state = JSON.parse(await readFile(resolve(root, "radar/state.json"), "utf8"));
  const report = JSON.parse(await readFile(resolve(root, "src/data/radar.json"), "utf8"));
  const taxonomy = JSON.parse(await readFile(resolve(root, "src/data/taxonomy.json"), "utf8"));
  const receipts = [], budgetReceipts = [], started = new Date().toISOString();
  for (const entry of plan.cases) {
    if (entry.reviewRevision !== radarReviewFingerprint(entry.inspection, taxonomy) || entry.caseId !== radarCaseId(entry.inspection, entry.reviewRevision))
      throw new Error("Radar plan case or policy changed");
    const authorized = authorization.grants.find((grant) => grant.caseId === entry.caseId);
    if (!authorized) {
      const denied = authorization.deferred?.find((value) => value.caseId === entry.caseId);
      state[entry.full] = { ...entry.previousState, checkedAt: started,
        status: denied?.status === "provider-unavailable" ? "provider-unavailable" : denied?.retryNotBefore ? "deferred" : "budget-exhausted", reason: denied?.status ?? "budget-not-authorized",
        ...(denied?.retryNotBefore ? { nextAttemptAt: denied.retryNotBefore } : {}) };
      receipts.push({ repo: entry.full, status: state[entry.full].status, reason: state[entry.full].reason }); continue;
    }
    const grant = await readRadarBudgetGrant({ api, caseId: entry.caseId, reservationId: authorized.reservationId,
      runId: process.env.GITHUB_RUN_ID, runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT) });
    if (!grant) {
      state[entry.full] = { ...entry.previousState, checkedAt: started, status: "budget-exhausted", reason: "reservation-not-current" };
      receipts.push({ repo: entry.full, status: "budget-exhausted" }); continue;
    }
    const acquireEvidence = async ({ targetId, need }) => {
      const target = entry.inspection.targets?.find((candidate) => candidate.id === targetId);
      if (!target?.available || !target.commit) return [];
      const acquired = await collectAdditionalMaterials({ api, repository: target.repository, sha: target.commit, need,
        excludePaths: entry.inspection.sources.filter((source) => !source.targetId || source.targetId === targetId).map((source) => source.path),
        inventory: targetId === "R1" ? entry.inspection.sourceInventory : undefined, maxFiles: 3, maxTotalBytes: 192 * 1024 });
      return acquired.sources.map((source) => ({ ...source, targetId, repoId: target.repoId, commit: target.commit }));
    };
    const decision = await reviewRadarCandidate({ inspection: entry.inspection, taxonomy, previousState: entry.previousState,
      now: started, ...grant, expectedReservationId: authorized.reservationId, acquireEvidence });
    state[entry.full] = decision.state;
    budgetReceipts.push({ caseId: entry.caseId, reservationId: authorized.reservationId,
      budgetLedger: decision.cached ? grant.budgetLedger : decision.reviewDetails?.budgetLedger,
      accountingVerified: decision.reviewDetails?.usage?.status === "reported" && !decision.reviewDetails?.budget?.accountingOverrun });
    // Persist each local receipt before unrelated later cases can fail. Remote
    // settlement is separate; a missing receipt never releases its reservation.
    await atomicJSON(process.env.RADAR_BUDGET_RECEIPTS_FILE, budgetReceipts);
    if (decision.status !== "accepted") { receipts.push({ repo: entry.full, status: decision.status, reason: decision.reason }); continue; }
    const project = await projectFromMaterialDecision({ api, decision, inspection: entry.inspection, started });
    if (!known.some((row) => row.repoId === project.repoId)) { known.push(project); report.newProjects++; }
    receipts.push({ repo: entry.full, status: "accepted", sourceVerification: decision.sourceVerification, reviewDetails: decision.reviewDetails });
  }
  report.finishedAt = new Date().toISOString(); report.totalProjects = known.length;
  report.discovery.deferred += receipts.filter((receipt) => !["accepted", "rejected"].includes(receipt.status)).length;
  report.discovery.rejected += receipts.filter((receipt) => receipt.status === "rejected").length;
  report.status = receipts.some((receipt) => !["accepted", "rejected"].includes(receipt.status)) ? "partial" : report.status;
  report.projectsSha256 = createHash("sha256").update(JSON.stringify(known, null, 2) + "\n").digest("hex");
  await atomicJSON(resolve(root, "src/data/projects.json"), known);
  await atomicJSON(resolve(root, "src/data/radar.json"), report);
  await atomicJSON(resolve(root, "radar/state.json"), state);
  await atomicJSON(resolve(root, `radar/receipts/${started.replaceAll(":", "-")}.json`), { ...report, receipts });
  await atomicJSON(process.env.RADAR_BUDGET_RECEIPTS_FILE, budgetReceipts);
}

export async function main() {
  const started = new Date().toISOString();
  const args = new Set(process.argv.slice(2));
  if (args.has("--review-plan")) return reviewPlannedRadar();
  const planOnly = args.has("--plan");
  const plan = { version: 1, cases: [] };
  if (!planOnly && !args.has("--metadata-only")) throw new Error("Full radar reviews require the plan/reserve/review workflow");
  const metadataOnly = args.has("--metadata-only");
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const maxPages = Math.min(
    10,
    Math.max(1, Number(process.env.RADAR_MAX_PAGES ?? 2)),
  );
  const maxCandidates = Math.min(
    250,
    Math.max(1, Number(process.env.RADAR_MAX_CANDIDATES ?? 60)),
  );
  const dataPath = resolve(root, "src/data/projects.json");
  const statusPath = resolve(root, "src/data/radar.json");
  const known = JSON.parse(await readFile(dataPath, "utf8"));
  let old = {};
  try {
    old = JSON.parse(await readFile(statusPath, "utf8"));
  } catch {}
  const taxonomy = JSON.parse(
    await readFile(resolve(root, "src/data/taxonomy.json"), "utf8"),
  );
  const report = {
    lastAttemptAt: started,
    mode: process.env.RADAR_SOURCES === "code" ? "code-only" : "full",
    lastSuccessfulAt: old.lastSuccessfulAt ?? null,
    status: "partial",
    sources: [],
    newProjects: 0,
    schedule: "0 */6 * * *",
    schedulerStatus:
      process.env.GITHUB_ACTIONS === "true"
        ? "active"
        : (old.schedulerStatus ?? "not-configured"),
    submissionRepository:
      process.env.GITHUB_REPOSITORY ??
      old.submissionRepository ??
      "logicrw/awesome-jev-projects",
    metadata: { ok: 0, failed: 0 },
    discovery: { candidates: 0, checked: 0, rejected: 0, deferred: 0 },
    runUrl: process.env.GITHUB_RUN_ID
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
  };
  let reviewState = {};
  try {
    reviewState = JSON.parse(
      await readFile(resolve(root, "radar/state.json"), "utf8"),
    );
  } catch {}
  const receipts = [];
  let codeUnavailable = false;
  const api = createGitHubClient({
    token,
    onRetry: ({ waitMs }) =>
      console.log(`[rate-limit] backing off ${Math.ceil(waitMs / 1000)}s`),
  });
  async function search(kind, q) {
    const source = {
      name: `${kind}: ${q}`,
      query: q,
      status: "ok",
      count: 0,
      total: 0,
      pages: 0,
    };
    report.sources.push(source);
    if (kind === "code" && (!token || codeUnavailable)) {
      source.status = "skipped-auth";
      source.error = "Code search requires a compatible GitHub token";
      return [];
    }
    const found = [];
    const cursorKey = `${kind}:${q}`;
    const firstPage = reviewState._searchCursors?.[cursorKey] ?? 1;
    source.firstPage = firstPage;
    try {
      for (
        let page = firstPage;
        page < firstPage + maxPages && page <= 10;
        page++
      ) {
        const result = await api(
          `/search/${kind}?q=${encodeURIComponent(q + (kind === "code" ? "" : " is:public"))}&per_page=100&page=${page}&sort=${kind === "code" ? "indexed" : kind === "commits" ? "committer-date" : "updated"}&order=desc`,
          { search: true, code: kind === "code" },
        );
        source.pages++;
        source.total = result.total_count;
        source.count += result.items.length;
        found.push(...result.items);
        if (result.incomplete_results) source.status = "partial";
        const lastPage = Math.min(10, Math.ceil(result.total_count / 100));
        reviewState._searchCursors ??= {};
        reviewState._searchCursors[cursorKey] = page >= lastPage ? 1 : page + 1;
        if (result.total_count > 1000) source.status = "search-cap";
        if (firstPage > 1 || page < lastPage) source.status = "bounded";
        if (result.items.length < 100 || page >= lastPage) break;
      }
      if (source.total > 1000) source.status = "search-cap";
      else if (
        source.status === "bounded" &&
        firstPage === 1 &&
        source.count >= source.total
      )
        source.status = "ok";
      console.log(
        `[search] ${source.name}: ${source.count}/${source.total} (${source.status})`,
      );
    } catch (e) {
      source.status =
        e.status === 401 || e.status === 403 ? "unavailable" : "error";
      source.error = e.message;
      if (kind === "code" && [401, 403].includes(e.status))
        codeUnavailable = true;
      console.log(`[search] ${source.name}: ${source.error}`);
    }
    return found;
  }
  let exclusions = [];
  try {
    exclusions = JSON.parse(
      await readFile(resolve(root, "radar/exclusions.json"), "utf8"),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const excluded = new Set(exclusions.filter((entry) => ["maintainer-removed", "policy-blocked"].includes(entry.status)).map((entry) => entry.repo.toLowerCase()));
  const byRepo = new Map(
    known.map((p) => [normalizeRepo(p.url)?.toLowerCase(), p]),
  );
  const candidates = new Map();
  const add = (repo, path) => {
    const full = repo?.full_name;
    if (
      !full ||
      repo.private ||
      excluded.has(full.toLowerCase()) ||
      byRepo.has(full.toLowerCase()) ||
      full.toLowerCase() === report.submissionRepository.toLowerCase()
    )
      return;
    const value = candidates.get(full.toLowerCase()) ?? {
      repo,
      paths: new Set(),
    };
    if (path) value.paths.add(path);
    candidates.set(full.toLowerCase(), value);
  };
  if (!metadataOnly) {
    if (process.env.RADAR_SOURCES !== "code")
      for (const q of [
        "topic:jev fork:true",
        "typesafe jev fork:true",
        "typesafe-ai fork:true",
        "jev-mcp fork:true",
        "jev decision fork:true",
        '\"TypeSafe AI\" in:readme fork:true',
        '\"Jev API\" in:readme fork:true',
        "topic:typesafe-ai fork:true",
        "topic:typesafe ai fork:true",
        '"api.typesafe.ai" in:readme fork:true',
        '"typesafe.ai" "jev" in:readme fork:true',
        '"from typesafe import jev" in:readme fork:true',
        '"@typesafe/jev" in:readme fork:true',
      ])
        for (const repo of await search("repositories", q)) add(repo);
    for (const q of [
      '"api.typesafe.ai" in:file',
      '"typesafe.ai" in:file',
      '"from typesafe import" in:file',
      '"@typesafe/jev" in:file',
    ])
      for (const item of await search("code", q))
        add(item.repository, item.path);
    if (process.env.RADAR_SOURCES !== "code")
      for (const q of ['"typesafe.ai"', '"Jev" "AI"'])
        for (const item of await search("commits", q)) add(item.repository);
    if (process.env.RADAR_SOURCES !== "code")
      for (const q of [
        '"typesafe.ai" is:pr in:title,body',
        '"Jev" "TypeSafe" is:pr in:title,body',
      ])
        for (const item of await search("issues", q)) {
          const full = item.repository_url?.replace(
            "https://api.github.com/repos/",
            "",
          );
          if (full) add({ full_name: full, name: full.split("/")[1] });
        }
  }
  if (process.env.RADAR_SOURCES !== "code") {
    const maxMetadataRefresh = Number(process.env.RADAR_MAX_METADATA_REFRESH) || 120;
    const refreshTargets = [...known]
      .sort((a, b) => (a.metadataFetchedAt ?? "").localeCompare(b.metadataFetchedAt ?? ""))
      .slice(0, maxMetadataRefresh);
    for (const project of refreshTargets) {
      const repo = normalizeRepo(project.url);
      if (!repo) {
        report.metadata.failed++;
        project.metadataStatus = "invalid-url";
        continue;
      }
      try {
        const meta = await api(`/repos/${repo}`);
        const commits = await api(`/repos/${repo}/commits?per_page=1`);
        Object.assign(project, refreshMetadata(project, meta, commits));
        delete project.metadataError;
        report.metadata.ok++;
      } catch (e) {
        project.metadataStatus = e.status === 404 ? "unavailable" : "stale";
        project.metadataError = e.message;
        report.metadata.failed++;
        console.log(`[metadata] ${repo}: ${e.message}`);
      }
    }
  }
  report.sources.push({
    name: "Known repository metadata + latest commit",
    status:
      process.env.RADAR_SOURCES === "code"
        ? "retained"
        : report.metadata.failed
          ? "partial"
          : "ok",
    count:
      process.env.RADAR_SOURCES === "code" ? known.length : report.metadata.ok,
  });
  const list = [...candidates.values()].sort(
    (a, b) =>
      (reviewState[a.repo.full_name]?.checkedAt ?? "").localeCompare(
        reviewState[b.repo.full_name]?.checkedAt ?? "",
      ) ||
      Number(/jev/i.test(b.repo.name ?? "")) -
        Number(/jev/i.test(a.repo.name ?? "")) ||
      (b.repo.stargazers_count ?? 0) - (a.repo.stargazers_count ?? 0),
  );
  report.discovery.candidates = list.length;
  report.discovery.deferred = Math.max(0, list.length - maxCandidates);
  for (const candidate of list.slice(0, maxCandidates)) {
    const full = candidate.repo.full_name;
    report.discovery.checked++;
    const previousState = reviewState[full] ?? {};
    try {
      const inspection = await inspectRepository({
        api,
        repository: full,
        existingProjects: known,
        exclusions,
        verifyIntegration,
        requireCodeEvidence: false,
        semanticReview: true,
        preferredPaths: [...candidate.paths],
      });
      if (planOnly) {
        if (inspection.status === "inspected" && inspection.repo && inspection.sha) {
          if (radarNeedsSemanticReview({ inspection, taxonomy, previousState, now: started }))
            plan.cases.push({ caseId: radarCaseId(inspection, radarReviewFingerprint(inspection, taxonomy)), reviewRevision: radarReviewFingerprint(inspection, taxonomy),
              full, inspection, previousState, needsSemanticReview: true });
          else {
            reviewState[full] = { ...previousState, checkedAt: started };
            receipts.push({ repo: full, status: previousState.status, reason: previousState.reason, cached: true });
          }
        } else receipts.push({ repo: full, status: inspection.status, reason: inspection.reason });
        continue;
      }
    } catch (e) {
      reviewState[full] = { ...previousState, checkedAt: started };
      receipts.push({ repo: full, status: "error", error: e.message });
      console.log(`[candidate] ${full}: ${e.message}`);
    }
  }
  const failures =
    report.sources.some((s) => !["ok"].includes(s.status)) ||
    report.metadata.failed ||
    receipts.some(
      (r) => r.status === "error" || r.status === "evidence-error",
    ) ||
    report.discovery.deferred;
  report.status = metadataOnly
    ? "metadata-only"
    : failures || process.env.RADAR_SOURCES === "code"
      ? "partial"
      : "complete";
  if (report.status === "complete")
    report.lastSuccessfulAt = new Date().toISOString();
  report.finishedAt = new Date().toISOString();
  report.totalProjects = known.length;
  if (planOnly) await atomicJSON(process.env.RADAR_PLAN_FILE, plan);
  await atomicJSON(resolve(root, "radar/state.json"), reviewState);
  report.projectsSha256 = createHash("sha256")
    .update(JSON.stringify(known, null, 2) + "\n")
    .digest("hex");
  await atomicJSON(dataPath, known);
  await atomicJSON(statusPath, report);
  await atomicJSON(
    resolve(root, `radar/receipts/${started.replaceAll(":", "-")}.json`),
    { ...report, receipts },
  );
  console.log(
    JSON.stringify({
      status: report.status,
      total: known.length,
      new: report.newProjects,
      metadata: report.metadata,
      discovery: report.discovery,
    }),
  );
  if (report.metadata.ok === 0 && process.env.RADAR_SOURCES !== "code")
    process.exitCode = 1;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
