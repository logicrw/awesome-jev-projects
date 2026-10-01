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
import { inspectRepository, hasOpenRouterJevSource } from "./project-source.mjs";

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
    /(?:@[\w.]*\.post|router\.(?:post|handle|POST)|app\.(?:post|all)|Route\s*\(\s*["']POST["']|Endpoint|def\s+post|fn\s+handle|route|path\s*=)\s*\(?["']?\/v1\/(?:systemone|decide)["']?/i.test(text) &&
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
        /(?<![\w.-])api\.typesafe\.ai(?![\w.-])|@typesafe|typesafe\/jev|typesafe-ai\/jev|openrouter\.ai|from\s+typesafe|\bjev\b|TYPESAFE_API_KEY|TypeSafeClient/i.test(
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
    reviewState[full] = { checkedAt: started };
    try {
      const inspection = await inspectRepository({
        api,
        repository: full,
        existingProjects: known,
        exclusions,
        verifyIntegration,
        requireCodeEvidence: true,
      });
      if (inspection.repo?.fork) {
        receipts.push({ repo: full, status: "rejected", reason: "forks are not ingested" });
        report.discovery.rejected++;
        continue;
      }
      const nativeReadmes = inspection.readmeFiles ?? [];
      const sourceText =
        nativeReadmes.map((file) => file.text).join("\n\n") || inspection.readme || "";
      const codeSources = (inspection.evidence?.files ?? []).filter(
        (file) => !nativeReadmes.some((rf) => rf.path === file.path),
      );

      // L2: MUSE API Review Gate — Evaluate if candidate genuinely integrates Jev primitives
      let reviewVerdict = null;
      if (typeof reviewCandidate === "function" && inspection.repo && codeSources.length > 0) {
        reviewVerdict = await reviewCandidate({
          repo: inspection.repo,
          readme: sourceText,
          codeSources,
          issueBody: "",
          issueTrusted: false,
          taxonomy,
        });
      }

      if (reviewVerdict) {
        if (reviewVerdict.verified === false) {
          const hasDeterministicEvidence =
            inspection.status === "accepted" &&
            (inspection.evidence?.implementationFiles ?? []).length > 0;
          if (!hasDeterministicEvidence) {
            receipts.push({
              repo: full,
              status: "rejected",
              reason: reviewVerdict.reason || "MUSE 审查未通过：未发现有效的 Jev 原语决策调用",
              reviewDetails: {
                verified: false,
                confidence: reviewVerdict.confidence,
                reason: reviewVerdict.reason,
              },
            });
            report.discovery.rejected++;
            continue;
          }
        } else if (reviewVerdict.verified === true) {
          inspection.status = "accepted";
          if (inspection.evidence) {
            inspection.evidence.verified = true;
            if (!inspection.evidence.implementationFiles?.length && codeSources.length > 0) {
              inspection.evidence.implementationFiles = [codeSources[0]];
            }
          }
        }
      }

      if (inspection.status !== "accepted") {
        receipts.push({ repo: full, status: "rejected", reason: inspection.reason ?? "rejected" });
        report.discovery.rejected++;
        continue;
      }

      const { repo, commits, sha, readme, evidence } = inspection;
      const implementation = evidence.implementationFiles?.[0];
      if (!implementation) throw new Error("No immutable implementation evidence");
      const sourceContent = implementation.text;

      const baseSummary = summarize(repo, sourceText, taxonomy);
      if (reviewVerdict?.category && taxonomy.some((t) => t.category === reviewVerdict.category)) {
        baseSummary.category = reviewVerdict.category;
      }
      if (reviewVerdict?.tags?.length) {
        baseSummary.tags = inferCanonicalTags({
          category: baseSummary.category,
          tags: reviewVerdict.tags,
        });
      }
      if (reviewVerdict?.jevDecisionPoint) {
        baseSummary.jevDecisionPoint = reviewVerdict.jevDecisionPoint;
      }
      if (reviewVerdict?.plainSummary) {
        baseSummary.plainSummary = reviewVerdict.plainSummary;
      }
      if (reviewVerdict?.plainSummaryEn) {
        baseSummary.plainSummaryEn = reviewVerdict.plainSummaryEn;
      }

      const summary = await enrichCandidateSummary(
        repo,
        sourceText,
        baseSummary,
      );
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
        evidence: [{ url: sourceUrl, note: "自动发现的 Jev 集成证据" }],
        sourceVerification: {
          method: "bounded-source-heuristic",
          sha,
          files: evidence.implementationFiles.map(({path, url, hash}) => ({path, url, hash})),
        },
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
        evidence: evidence.evidence,
        readmeSources: nativeReadmes.map(({ path, url, hash }) => ({
          path,
          url,
          hash,
        })),
      });
      console.log(`[new] ${full} → ${project.category}`);
    } catch (e) {
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
