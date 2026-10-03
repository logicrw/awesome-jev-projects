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
import { inspectRepository, hasOpenRouterJevSource, codeCandidate } from "./project-source.mjs";
import { validateVerdict, resolveWitnessFiles } from "./evidence-bundle.mjs";

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

const RADAR_REVIEW_VERSION = "witness-v1";
const MAX_REVIEW_ATTEMPTS = 3;
const VERDICT_FIELDS = ["verified", "role", "reasonCode", "category", "plainSummary", "plainSummaryEn", "witness"];
/** One semantic gate for radar discovery. The heuristic result never grants admission. */
export async function reviewRadarCandidate({
  inspection, taxonomy, reviewer = reviewCandidate, previousState = {},
  now = new Date().toISOString(), configRevision = process.env.RADAR_REVIEW_REVISION ?? "",
}) {
  const codeSources = inspection.codeSources ?? [];
  const fingerprint = createHash("sha256").update(JSON.stringify({
    policy: RADAR_REVIEW_VERSION, revision: configRevision,
    model: process.env.MUSE_MODEL ?? "", endpoint: process.env.MUSE_ENDPOINT ?? "",
    configured: Boolean(process.env.MUSE_API_KEY),
    sha: inspection.sha, files: codeSources.map(({ path, url, hash }) => ({ path, url, hash })),
    categories: taxonomy.map(({ category }) => category),
  })).digest("hex");
  const prior = previousState.fingerprint === fingerprint ? previousState : {};
  if (["rejected", "blocked", "retry-exhausted"].includes(prior.status) ||
      (prior.status === "deferred" && Date.parse(prior.nextAttemptAt) > Date.parse(now))) {
    return { status: prior.status, reason: prior.reason, cached: true, state: { ...prior, checkedAt: now } };
  }
  let reviewDetails;
  const finish = (status, reason, extra = {}) => ({
    status, reason, ...(reviewDetails ? { reviewDetails } : {}), ...extra,
    state: { fingerprint, checkedAt: now, status, reason, attempts: prior.attempts ?? 0, ...extra.state },
  });
  if (inspection.status !== "inspected" || !inspection.repo || !inspection.sha) {
    return finish("rejected", inspection.reason ?? "source-inspection-rejected");
  }
  if (!codeSources.length) return finish("blocked", "insufficient-evidence");
  const attempts = (prior.attempts ?? 0) + 1;
  const nextAttemptAt = (notBefore) => new Date(Math.max(
    Date.parse(now) + 6 * 60 * 60 * 1000 * 2 ** (attempts - 1),
    Number.isFinite(Date.parse(notBefore)) ? Date.parse(notBefore) : 0,
  )).toISOString();
  let reviewed;
  try { reviewed = await reviewer({ codeSources, taxonomy }); }
  catch { reviewed = { retryable: true, status: "request-failed" }; }
  // Provider diagnostics contain only locally built status/budget/usage facts, never source or model prose.
  reviewDetails = { status: reviewed?.status ?? "missing-response", attempts: reviewed?.attempts ?? [],
    budget: reviewed?.budget, usage: reviewed?.usage };
  if (!reviewed || reviewed.verified === null || typeof reviewed.verified !== "boolean") {
    const retryable = !reviewed || reviewed.retryable === true;
    const reason = typeof reviewed?.status === "string" && /^[a-z0-9-]{1,40}$/.test(reviewed.status)
      ? reviewed.status : "review-unavailable";
    const status = retryable ? attempts >= MAX_REVIEW_ATTEMPTS ? "retry-exhausted" : "deferred" : "blocked";
    return finish(status, reason, { state: { attempts, ...(status === "deferred" ? {
      nextAttemptAt: nextAttemptAt(reviewed?.retryNotBefore),
    } : {}) } });
  }
  const payload = Object.fromEntries(VERDICT_FIELDS.map((key) => [key, reviewed[key]]));
  let verdict, implementationFiles, witnessNodes;
  try {
    verdict = validateVerdict(payload, reviewed.evidenceBundle, taxonomy);
    implementationFiles = verdict?.verified ? resolveWitnessFiles(reviewed.evidenceBundle, verdict) : [];
    witnessNodes = verdict?.verified ? [...new Set(Object.values(verdict.witness).flat())]
      .map((id) => ({ id, ...reviewed.evidenceBundle.nodeMap.get(id) })) : [];
  } catch { verdict = null; }
  if (reviewed.status !== "completed" || !verdict || (verdict.verified && (!reviewed.witnessValidated || !implementationFiles?.length ||
      !witnessNodes?.length || witnessNodes.some(({ source, startLine, endLine, ranges }) =>
        !codeSources.some((candidate) =>
        source.path === candidate.path && source.url === candidate.url && source.hash === candidate.hash &&
        source.text === candidate.text && createHash("sha256").update(candidate.text).digest("hex") === candidate.hash) ||
        !/^[a-f\d]{40}$/.test(inspection.sha) ||
        !codeCandidate({ path: source.path, type: "blob", size: Buffer.byteLength(source.text) }) ||
        source.url !== `https://github.com/${inspection.repo.full_name}/blob/${inspection.sha}/${source.path.split("/").map(encodeURIComponent).join("/")}` ||
        !Number.isSafeInteger(startLine) || !Number.isSafeInteger(endLine) || startLine < 1 || endLine < startLine ||
        endLine > source.text.split("\n").length || !Array.isArray(ranges) || !ranges.length ||
        ranges.some((range) => !Array.isArray(range) || range.length !== 2 ||
          !Number.isSafeInteger(range[0]) || !Number.isSafeInteger(range[1]) ||
          range[0] < startLine || range[1] < range[0] || range[1] > endLine))))) {
    const status = attempts >= MAX_REVIEW_ATTEMPTS ? "retry-exhausted" : "deferred";
    return finish(status, "invalid-witness", { state: { attempts, ...(status === "deferred" ? {
      nextAttemptAt: nextAttemptAt(),
    } : {}) } });
  }
  if (!verdict.verified) return finish("rejected", verdict.reasonCode, { state: { attempts } });
  const baseSummary = {
    category: verdict.category,
    plainSummary: verdict.plainSummary, plainSummaryEn: verdict.plainSummaryEn,
    jevDecisionPoint: verdict.plainSummary, jevDecisionPointEn: verdict.plainSummaryEn,
    highlightBenefit: "已定位固定版本的实现源码；尚无独立运行或性能验证。",
    highlightBenefitEn: "Implementation evidence is pinned to a source revision; runtime and performance are not independently verified.",
    tags: inferCanonicalTags({ category: verdict.category, tags: [] }),
    summarySource: "ai-evidence-witness",
  };
  // Reuse the checked summaries without reading native prose or making a second request.
  const { enrichment: _diagnostics, ...enriched } = await enrichSummary({ reviewed, fallback: baseSummary });
  const files = [...new Map(witnessNodes.map(({ source }) => [source.path, source])).values()]
    .map(({ path, url, hash }) => ({ path, url, hash }));
  const nodes = witnessNodes.map(({ id, source, kind, startLine, endLine, ranges }) =>
    ({ id, path: source.path, hash: source.hash, kind, startLine, endLine, ranges: ranges.map((range) => [...range]) }));
  return finish("accepted", verdict.reasonCode, {
    reviewed: { ...reviewed, ...verdict }, implementationFiles,
    sourceVerification: { method: "ai-evidence-witness-v1", sha: inspection.sha, files, role: verdict.role,
      witness: verdict.witness, nodes, implementationFiles: implementationFiles.map(({ path }) => path) },
    summary: { ...enriched, ...baseSummary }, state: { attempts },
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
      license:
        meta.license?.spdx_id === "NOASSERTION"
          ? null
          : (meta.license?.spdx_id ?? null),
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
export async function main() {
  const started = new Date().toISOString();
  const args = new Set(process.argv.slice(2));
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
  const excluded = new Set(exclusions.map((x) => x.repo.toLowerCase()));
  const byRepo = new Map(
    known.map((p) => [normalizeRepo(p.url)?.toLowerCase(), p]),
  );
  const candidates = new Map();
  const add = (repo, path) => {
    const full = repo?.full_name;
    if (
      !full ||
      repo.private ||
      repo.fork ||
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
        "topic:jev fork:false",
        "typesafe jev fork:false",
        "typesafe-ai fork:false",
        "jev-mcp fork:false",
        "jev decision fork:false",
        '\"TypeSafe AI\" in:readme fork:false',
        '\"Jev API\" in:readme fork:false',
        "topic:typesafe-ai fork:false",
        "topic:typesafe ai fork:false",
        '"api.typesafe.ai" in:readme fork:false',
        '"typesafe.ai" "jev" in:readme fork:false',
        '"from typesafe import jev" in:readme fork:false',
        '"@typesafe/jev" in:readme fork:false',
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
  if (process.env.RADAR_SOURCES !== "code")
    for (const project of known) {
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
        requireCodeEvidence: true,
        semanticReview: true,
        preferredPaths: [...candidate.paths],
      });
      const nativeReadmes = inspection.readmeFiles ?? [];
      const decision = await reviewRadarCandidate({ inspection, taxonomy, previousState, now: started });
      reviewState[full] = decision.state;
      if (decision.status !== "accepted") {
        receipts.push({ repo: full, status: decision.status, reason: decision.reason, cached: decision.cached === true,
          reviewDetails: decision.reviewDetails });
        if (decision.status === "rejected") report.discovery.rejected++;
        else report.discovery.deferred++;
        continue;
      }

      const { repo, commits, sha } = inspection;
      const { implementationFiles, reviewed, summary } = decision;
      const implementation = implementationFiles[0];
      if (!implementation) throw new Error("No immutable implementation evidence");
      const sourceContent = implementation.text;
      const sourceUrl = implementation.url;
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
        license:
          repo.license?.spdx_id === "NOASSERTION"
            ? null
            : (repo.license?.spdx_id ?? null),
        createdAt: repo.created_at,
        lastCommitAt: commits[0]?.commit.committer.date ?? null,
        headSha: sha,
        metadataFetchedAt: new Date().toISOString(),
        metadataStatus: "ok",
        avatarUrl: repo.owner.avatar_url,
        verificationStatus: "integration-detected",
        runtimeVerified: false,
        discoveredAt: started,
        claimStatus: "模型依据固定版本源码关系见证自动裁决；未经本站运行、安全或性能验证。",
        claimStatusEn: "Model classification is supported by immutable source witnesses; runtime, security and performance are not independently verified.",
        evidence: decision.sourceVerification.files.map(({ url }) => ({ url, note: "固定版本的实现源码见证" })),
        sourceVerification: decision.sourceVerification,
        sourceHash: createHash("sha256").update(sourceContent).digest("hex"),
      };
      known.push(project);
      byRepo.set(full.toLowerCase(), project);
      report.newProjects++;
      receipts.push({
        repo: full,
        status: "accepted",
        sourceUrl,
        sourceHash: project.sourceHash,
        reason: decision.reason,
        role: reviewed.role,
        reviewDetails: decision.reviewDetails,
        readmeSources: nativeReadmes.map(({ path, url, hash }) => ({
          path,
          url,
          hash,
        })),
      });
      console.log(`[new] ${full} → ${project.category}`);
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
