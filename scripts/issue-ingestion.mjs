/** Trusted workflow code only. Untrusted issues/READMEs are never executed. */
import { createHash } from "node:crypto";
import { readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createGitHubClient } from "./github-client.mjs";
import {
  extractSubmittedRepository,
  extractSubmittedTags,
  extractSubmittedCategory,
  extractSubmittedCodePaths,
  inspectRepository,
} from "./project-source.mjs";
import { inferCanonicalTags } from "../src/lib/tags.mjs";
import {
  createSummaryEnricher,
  createSubmissionReviewer,
} from "./source-enrichment.mjs";
import { summarize, verifyIntegration, atomicJSON } from "./radar-sync.mjs";
import { readAssetBundle, validateAssetBundle } from "./ingestion-assets.mjs";
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
export function isSubmission(issue) {
  const labeled = (issue.labels ?? []).some(
    (label) => (typeof label === "string" ? label : label?.name) === "project-submission",
  );
  const titled = /^\s*\[project\]/i.test(issue.title ?? "");
  const headed =
    /^#{1,6}\s+(?:GitHub repository|Project repository|项目仓库|仓库地址|repository)(?:\s*[\(（][\s\S]*?[\)）])?\s*$/im.test(
      issue.body ?? "",
    ) ||
    /^\s*(?:repository|github repository|project repository|项目仓库|仓库地址)[\s:：]+\s*https?:\/\/github\.com\//im.test(
      issue.body ?? "",
    );
  return labeled || titled || headed;
}
export async function prepareSubmission({
  issue,
  repository,
  projects,
  taxonomy,
  exclusions = [],
  api,
  enrich,
  reviewer,
  inspect = inspectRepository,
  now = () => new Date().toISOString(),
  commentBody = "",
}) {
  requireOwner(repository);
  if (
    !Number.isSafeInteger(issue?.number) ||
    issue.number < 1 ||
    issue.pull_request ||
    issue.state !== "open"
  )
    return { status: "ignored", reason: "not an open issue" };
  if (!isSubmission(issue))
    return { status: "ignored", reason: "not a project submission" };
  const submitted = extractSubmittedRepository(issue.body);
  if (!submitted)
    return {
      status: "rejected",
      reason: "missing or ambiguous repository URL",
      needsEvidence: false,
      issueNumber: issue.number,
    };
  if (submitted.toLowerCase() === repository.toLowerCase())
    return {
      status: "rejected",
      reason: "cannot ingest this directory itself",
      needsEvidence: false,
      issueNumber: issue.number,
    };
  let fullIssueText = [issue.body ?? "", commentBody].filter(Boolean).join("\n\n");
  if (typeof api === "function" && issue.number) {
    try {
      const comments = await api(
        `/repos/${repository}/issues/${issue.number}/comments?per_page=100`,
      );
      if (Array.isArray(comments)) {
        fullIssueText +=
          "\n\n" +
          comments
            .map((c) => c?.body ?? "")
            .filter(Boolean)
            .join("\n\n");
      }
    } catch {}
  }
  const preferredPaths = extractSubmittedCodePaths(fullIssueText, submitted);
  const result = await inspect({
    api,
    repository: submitted,
    existingProjects: projects,
    exclusions,
    verifyIntegration,
    requireCodeEvidence: true,
    preferredPaths,
  });
  if (result.status === "duplicate") {
    const prior = projects.find(
      (p) =>
        p.ingestion?.repository === repository &&
        p.ingestion.issueNumber === issue.number &&
        (p.repoId === result.repo?.id ||
          publicIdentity(p) === result.repo?.full_name?.toLowerCase()),
    );
    if (prior) return { status: "resume", project: prior };
    return {
      status: "duplicate",
      reason: result.reason,
      needsEvidence: false,
      issueNumber: issue.number,
      submittedRepository: submitted,
    };
  }

  const structuralRejections = new Set([
    "invalid repository",
    "repository not found or inaccessible",
    "invalid repository metadata",
    "repository is not public",
    "forks are not ingested",
    "repository already listed",
    "repository is excluded by editorial review",
    "repository has no accessible commit",
    "repository has no immutable commit",
    "mention-only directory",
  ]);
  if (result.status === "rejected" && structuralRejections.has(result.reason)) {
    return {
      status: "rejected",
      reason: result.reason,
      needsEvidence: false,
      issueNumber: issue.number,
      submittedRepository: submitted,
    };
  }

  const { repo, sha, commits, readme } = result;
  let evidence = result.evidence;
  const readmeFiles = result.readmeFiles ?? [];
  const codeSources = (evidence?.files ?? []).filter(
    (file) => !readmeFiles.some((rf) => rf.path === file.path),
  );

  const issueTrusted = Boolean(
    issue.user?.login &&
      (issue.user.login.toLowerCase() === repo?.owner?.login?.toLowerCase() ||
        ["OWNER", "MEMBER", "COLLABORATOR"].includes(issue.author_association)),
  );

  let reviewVerdict = null;
  if (typeof reviewer === "function" && repo) {
    reviewVerdict = await reviewer({
      repo,
      readme,
      codeSources,
      issueBody: issue.body ?? "",
      issueTrusted,
      taxonomy,
    });
  }

  if (reviewVerdict) {
    if (reviewVerdict.verified === false) {
      const hasDeterministicEvidence =
        result.status === "accepted" &&
        (result.evidence?.implementationFiles ?? []).length > 0;
      if (!hasDeterministicEvidence) {
        return {
          status: "rejected",
          reason: reviewVerdict.reason || "源码审查未发现有效的 Jev 原语调用代码证据。",
          needsEvidence: true,
          issueNumber: issue.number,
          submittedRepository: submitted,
          reviewDetails: reviewVerdict,
        };
      }
    }
    if (reviewVerdict.verified === true && evidence) {
      evidence = {
        ...evidence,
        verified: true,
        implementationFiles: evidence.implementationFiles?.length
          ? evidence.implementationFiles
          : codeSources.length > 0
            ? [codeSources[0]]
            : [],
      };
    }
  }

  if (result.status !== "accepted" && (!reviewVerdict || reviewVerdict.verified !== true)) {
    return {
      status: result.status,
      reason: result.reason,
      needsEvidence: result.reason === "no implementation source evidence",
      issueNumber: issue.number,
      submittedRepository: submitted,
    };
  }

  const submittedCategory = extractSubmittedCategory(issue.body ?? "", taxonomy);
  const submittedTags = extractSubmittedTags(issue.body ?? "");
  const baseSummary = summarize(repo, readme, taxonomy);
  if (submittedCategory) {
    baseSummary.category = submittedCategory;
  } else if (reviewVerdict?.category && taxonomy.some((t) => t.category === reviewVerdict.category)) {
    baseSummary.category = reviewVerdict.category;
  }
  if (submittedTags.length) {
    baseSummary.tags = inferCanonicalTags({
      category: baseSummary.category,
      tags: submittedTags,
    });
  } else if (reviewVerdict?.tags?.length) {
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
  // Provider diagnostics are not canonical project data. Strip them before the
  // candidate is persisted so review, validation and publication use identical bytes.
  const { enrichment: _enrichment, ...editorial } = await enrich({
    repo,
    readme,
    issueBody: issue.body ?? "",
    issueTrusted,
    fallback: baseSummary,
  });
  const [author, name] = repo.full_name.split("/");
  const project = {
    id: `${author}:${name}`.toLowerCase(),
    name,
    author,
    url: `https://github.com/${repo.full_name}`,
    repoId: repo.id,
    ...editorial,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    license:
      repo.license?.spdx_id === "NOASSERTION"
        ? null
        : (repo.license?.spdx_id ?? null),
    createdAt: repo.created_at,
    lastCommitAt: commits[0]?.commit?.committer?.date ?? null,
    headSha: sha,
    metadataFetchedAt: now(),
    metadataStatus: "ok",
    avatarUrl: repo.owner?.avatar_url,
    verificationStatus: "integration-detected",
    runtimeVerified: false,
    discoveredAt: now(),
    claimStatus:
      "优先保留投稿者与仓库原文，缺失语言自动补充；自动检查仅确认 Jev 集成证据，未经本站运行或性能复测。",
    claimStatusEn:
      "Author and repository text is preserved where clear; missing languages are enriched automatically. Checks establish source-level Jev integration, not runtime, safety, or performance validation.",
    evidence: evidence.files.map(({ url }) => ({
      url,
      note: "固定版本的 Jev 集成与说明来源",
    })),
    sourceVerification: {
      method: "bounded-source-heuristic",
      sha,
      files: evidence.files.map(({ path, url, hash }) => ({ path, url, hash })),
    },
    ingestion: {
      repository,
      issueNumber: issue.number,
      issueBodySha256: bodyHash(issue.body),
      issueUrl: `https://github.com/${repository}/issues/${issue.number}`,
    },
  };
  if (
    !project.evidence.length ||
    ![
      "plainSummary",
      "plainSummaryEn",
      "jevDecisionPoint",
      "highlightBenefit",
      "category",
    ].every((k) => typeof project[k] === "string" && project[k].trim()) ||
    !Array.isArray(project.tags) ||
    !project.tags.length
  )
    throw new Error("Prepared project failed required-field validation");
  return { status: "ready", project };
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
}) {
  requireOwner(repository);
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
}) {
  requireOwner(repository);
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
          c.user?.login === "github-actions[bot]" && c.body?.includes(marker),
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
    await api(`/repos/${repository}/issues/${issue.number}`, {
      method: "PATCH",
      body: { state: "closed", state_reason: "completed" },
    });
    results.push({ issue: issue.number, status: "completed" });
  }
  return results;
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
    if (modelsProbe) {
      if (process.env.GITHUB_EVENT_NAME !== "workflow_dispatch")
        throw new Error("Models probes require manual workflow dispatch");
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
    } else {
      const number = Number(
        event.issue?.number ?? process.env.INGEST_ISSUE_NUMBER,
      );
      if (!Number.isSafeInteger(number) || number < 1)
        throw new Error("A positive issue number is required");
      const issue = await api(`/repos/${repository}/issues/${number}`);
      result = await prepareSubmission({
        issue,
        repository,
        projects,
        taxonomy,
        exclusions,
        api,
        enrich,
        reviewer,
        commentBody: event.comment?.body ?? "",
      });
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
    await output({
      ready: ["ready", "resume"].includes(result.status),
      status: result.status,
      needs_evidence: result.needsEvidence === true,
      issue_number: issueNumber,
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
    const issueNumber = Number(
      prepared.issueNumber ?? process.env.INGEST_ISSUE_NUMBER,
    );
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
      console.log("No valid issue number for feedback; skipping.");
      return;
    }
    if (["ready", "resume", "ignored"].includes(prepared.status)) {
      console.log(`Issue #${issueNumber} status is ${prepared.status}; feedback not needed.`);
      return;
    }
    const issue = await api(`/repos/${repository}/issues/${issueNumber}`);
    if (issue.state !== "open") {
      console.log(`Issue #${issueNumber} is not open; skipping feedback.`);
      return;
    }
    const reason =
      prepared.reason ||
      "仓库源码中暂未检测到有效的 Jev/TypeSafe 原语调用代码证据。";
    const needsEvidence = prepared.needsEvidence === true;
    const triggerCommentId = prepared.triggerCommentId;
    const isCommentTrigger =
      Number.isSafeInteger(triggerCommentId) && triggerCommentId > 0;
    const initialMarker = `<!-- awesome-jev-review-feedback:${issueNumber} -->`;
    const recheckMarker = isCommentTrigger
      ? `<!-- awesome-jev-review-recheck:${issueNumber}:${triggerCommentId} -->`
      : null;
    const marker = recheckMarker || initialMarker;
    let alreadyCommented = false;
    for (let page = 1; page <= 5; page++) {
      const comments = await api(
        `/repos/${repository}/issues/${issueNumber}/comments?per_page=100&page=${page}`,
      );
      alreadyCommented ||= comments.some((c) => c.body?.includes(marker));
      if (alreadyCommented || comments.length < 100) break;
    }
    if (!alreadyCommented) {
      const feedbackBody = isCommentTrigger
        ? [
            "👋 **Awesome Jev 自动复查反馈**",
            "",
            "流水线已自动根据您补充的代码线索进行了重新复查：",
            "",
            `- **复查状态**：${needsEvidence ? "期待进一步补充代码证据 (Needs Evidence)" : "暂未检测到有效集成"}`,
            `- **审查分析**：${reason}`,
            "",
            needsEvidence
              ? "> 💡 请确认提供的链接或路径是否包含具体的决策原语调用逻辑（如 choice / score / noul / systemOne / /v1/systemone 等）。补充后流水线将再次自动复查推进收录！"
              : "> 💡 如有误判，非常欢迎指出具体的代码位置与调用逻辑，我们会持续跟进！",
            "",
            marker,
          ].join("\n")
        : [
            "👋 **Awesome Jev 项目收录反馈**",
            "",
            "非常感谢您向 Awesome Jev 社区提交项目！自动化代码集成流水线在对您的仓库进行源码检查后，整理了如下参考反馈：",
            "",
            `- **当前状态**：${needsEvidence ? "期待补充代码证据 (Needs Evidence)" : "暂未检测到有效集成"}`,
            `- **审查分析**：${reason}`,
            "",
            needsEvidence
              ? "> 💡 **如何快速复核**：如果项目中已接入 Jev / TypeSafe 决策机制（例如 Dart、Go、Rust、Java、Python、TS/JS 等多语言 SDK，或 OpenRouter decisions、`/v1/systemone` 调用），欢迎直接在本 Issue 中回复补充包含决策调用的**具体代码文件路径与关键行代码链接**。流水线将自动重新复查并推进收录！"
              : "> 💡 **如有误判**：开源生态百花齐放，如果自动化审查存在理解偏差或尚未覆盖到您的接入方式，非常欢迎在本 Issue 中留言指出具体的代码位置与调用逻辑，我们会第一时间跟进！",
            "",
            marker,
          ].join("\n");
      await api(`/repos/${repository}/issues/${issueNumber}/comments`, {
        method: "POST",
        body: { body: feedbackBody },
      });
      console.log(`Posted feedback comment to Issue #${issueNumber}`);
    } else {
      console.log(`Feedback comment already exists on Issue #${issueNumber}`);
    }
    if (needsEvidence) {
      try {
        await api(`/repos/${repository}/issues/${issueNumber}/labels`, {
          method: "POST",
          body: { labels: ["needs-evidence"] },
        });
        console.log(`Added label 'needs-evidence' to Issue #${issueNumber}`);
      } catch (err) {
        console.warn(`Could not add label: ${err.message}`);
      }
    }
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
