/** Bounded, revision-bound retry control records. Never executes submitted code. */
import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createGitHubClient } from "./github-client.mjs";
import { isSubmission, githubRepositoryReferences } from "./submission-identity.mjs";
import { reviewPolicyRevision } from "./review-policy.mjs";
import { reserveControlBudgets, readRadarBudgetGrant, settleRadarBudgets } from "./radar-budget.mjs";

export const MAX_RETRIES = 3;
export const RETRY_LEASE_MS = 90 * 60 * 1000;
const REPOSITORY = "logicrw/awesome-jev-projects";
const BOT = "github-actions[bot]";
const HASH = /^[a-f\d]{64}$/;
const TERMINAL = new Set(["completed", "rejected", "insufficient-evidence", "provider-unavailable", "invalid-output", "exhausted", "superseded", "control-budget-exhausted", "budget-exhausted"]);
const NOTICES = {
  pending: "自动审核已排队，最多自动重新审核 3 次。",
  "budget-exhausted": "本轮审查的模型预算已用尽或预留调用结果未知，已停止重复调用；这不表示项目不合格。",
  claimed: "自动重新审核已安排；成功收录仅在部署核验后通知。",
  "dispatch-unknown": "调度结果暂不确定，系统会核对当前任务；本次不会立即重复调度。",
  completed: "本轮自动审核已完成，收录及部署核验成功。",
  rejected: "本轮自动审核已结束，当前版本未通过收录检查。新的有效证据可触发下一轮审核。",
  "insufficient-evidence": "本轮自动审核已结束，当前版本的代码证据不足。补充有效代码位置后可自动复查。",
  "provider-unavailable": "本轮自动审核已结束，审查服务配置或权限不可用；未将服务故障判为项目不合格。",
  "invalid-output": "本轮自动审核已结束，模型输出未通过校验；项目未被收录。",
  exhausted: "本轮自动重试额度已用尽，已停止重复调用；项目未被自动收录。新的有效证据可触发下一轮审核。",
  superseded: "本轮自动审核已结束，投稿已修改或关闭；旧版本任务不会继续发布。",
  "control-budget-exhausted": "本轮自动审核已停止：状态历史超过读取预算，无法确认此前的尝试次数；不会重置额度或继续调用模型。这不表示项目不合格，也不表示已执行 3 次重试。",
};
const bodyHash = (body) => createHash("sha256").update(body ?? "").digest("hex");
const isDryRun = (value) => value === true || value === "true" || process.env.INGEST_DRY_RUN === "true";
function requireRepository(repository) {
  if (repository !== REPOSITORY) throw new Error("Unexpected retry repository");
}
function requireCandidate(candidate) {
  if (!Number.isSafeInteger(candidate?.issueNumber) || candidate.issueNumber < 1 || !HASH.test(candidate.bodySha ?? "") || (candidate.titleSha && !HASH.test(candidate.titleSha)) || (candidate.reviewRevision && !HASH.test(candidate.reviewRevision)))
    throw new Error("Invalid retry candidate");
}
export function trustedRetryWriter(login, trustedWriter = process.env.INGEST_TRUSTED_WRITER) {
  // The optional identity comes only from repository configuration, never an Issue or receipt.
  return typeof login === "string" && (login.toLowerCase() === BOT ||
    (typeof trustedWriter === "string" && /^[a-z\d](?:[a-z\d-]{0,38})(?:\[bot\])?$/i.test(trustedWriter) && login.toLowerCase() === trustedWriter.toLowerCase()));
}
export function retryClaimId(candidate) {
  requireCandidate(candidate);
  return bodyHash(candidate.reviewRevision
    ? `${candidate.issueNumber}:${candidate.bodySha}:${candidate.titleSha}:${candidate.reviewRevision}:${candidate.attempt}`
    : `${candidate.issueNumber}:${candidate.bodySha}:${candidate.attempt}`);
}
function validRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  const keys = ["version", "issueNumber", "bodySha", ...(record.version === 3 ? ["titleSha", "reviewRevision"] : []), "attempt", "state", "claimId"];
  if (Object.keys(record).some((key) => ![...keys, "notBefore"].includes(key)) || keys.some((key) => !Object.hasOwn(record, key))) return false;
  if (Object.hasOwn(record, "notBefore") && (typeof record.notBefore !== "string" || !Number.isFinite(Date.parse(record.notBefore)) || new Date(record.notBefore).toISOString() !== record.notBefore)) return false;
  if (![2, 3].includes(record.version) || (record.version === 3 && (!HASH.test(record.titleSha ?? "") || !HASH.test(record.reviewRevision ?? ""))) || !Number.isSafeInteger(record.issueNumber) || record.issueNumber < 1 || !HASH.test(record.bodySha ?? "") ||
      !Number.isInteger(record.attempt) || record.attempt < 0 || record.attempt > MAX_RETRIES || !Object.hasOwn(NOTICES, record.state)) return false;
  if (record.attempt === 0) return record.claimId === null && !["claimed", "dispatch-unknown"].includes(record.state);
  return record.claimId === retryClaimId(record) && record.state !== "pending";
}
export function renderRetryRecord(record) {
  if (!validRecord(record)) throw new Error("Invalid retry control record");
  const canonical = { version: record.version, issueNumber: record.issueNumber, bodySha: record.bodySha,
    ...(record.version === 3 ? { titleSha: record.titleSha, reviewRevision: record.reviewRevision } : {}), attempt: record.attempt, state: record.state, claimId: record.claimId,
    ...(record.notBefore ? { notBefore: record.notBefore } : {}) };
  return `${NOTICES[record.state]}\n\n<!-- awesome-jev-retry:v${record.version}:${JSON.stringify(canonical)} -->`;
}
export function parseRetryRecord(comment, { issueNumber, trustedWriter } = {}) {
  if (!trustedRetryWriter(comment?.user?.login, trustedWriter)) return null;
  const text = String(comment.body ?? "");
  const match = text.match(/\n\n<!-- awesome-jev-retry:v([23]):([^\n]+) -->$/);
  if (match) {
    try {
      const record = JSON.parse(match[2]);
      if (record.version === Number(match[1]) && validRecord(record) && record.issueNumber === issueNumber && renderRetryRecord(record) === text)
        return { ...record, createdAt: Date.parse(comment.created_at) };
    } catch { /* Malformed or embedded prose is never control data. */ }
    return null;
  }
  // Migration accepts only the exact historical machine template from an explicitly
  // trusted writer. A bare marker, quoted marker or model feedback is not a record.
  const legacy = text.match(/^([^\n]+)\n\n<!-- awesome-jev-retry:v1:([a-f\d]{64}):([0-3]) -->$/);
  if (!legacy) return null;
  const attempt = Number(legacy[3]);
  const notice = attempt === 0
    ? "自动审核已加入后台排队（可能由于并发更新或审查服务暂时抖动）。系统将自动安排重新审核，最多自动重试 3 次。"
    : `正在安排第 ${attempt}/${MAX_RETRIES} 次自动重新审核；收录结果会在实际部署核验后通知。`;
  if (legacy[1] !== notice || !Number.isSafeInteger(issueNumber) || issueNumber < 1) return null;
  const record = { version: 2, issueNumber, bodySha: legacy[2], attempt, state: attempt === 0 ? "pending" : "claimed", claimId: null };
  if (attempt > 0) record.claimId = retryClaimId(record);
  return { ...record, createdAt: Date.parse(comment.created_at), legacy: true };
}
export function retryRecord(comments, candidate, trustedWriter) {
  let current = null;
  for (const comment of comments) {
    const record = parseRetryRecord(comment, { issueNumber: candidate.issueNumber, trustedWriter });
    if (!record || record.bodySha !== candidate.bodySha ||
      (candidate.reviewRevision && (record.version !== 3 || record.reviewRevision !== candidate.reviewRevision || record.titleSha !== candidate.titleSha))) continue;
    if (current && TERMINAL.has(current.state)) continue;
    if (!current || TERMINAL.has(record.state) || record.attempt > current.attempt ||
        (record.attempt === current.attempt && !TERMINAL.has(current.state))) current = record;
  }
  return current;
}
export function retryState(comments, bodySha, { issueNumber = 1, trustedWriter } = {}) {
  return retryRecord(comments, { issueNumber, bodySha }, trustedWriter)?.attempt ?? -1;
}
function leaseActive(record, now) {
  return record?.attempt > 0 && (!Number.isFinite(record.createdAt) || now - record.createdAt < RETRY_LEASE_MS);
}
async function readComments(api, issueNumber) {
  const metadata = await api(`/repos/${REPOSITORY}/issues/${issueNumber}`);
  if (metadata.number !== issueNumber || metadata.pull_request) throw new Error("Retry issue identity changed");
  const comments = [];
  // GitHub owns this count. Read the newest pages first so ordinary comment
  // floods cannot bury a terminal record behind the old forward-page limit.
  if (Number.isSafeInteger(metadata.comments) && metadata.comments >= 0) {
    const lastPage = Math.max(1, Math.ceil(metadata.comments / 100));
    const pages = lastPage <= 5
      ? Array.from({ length: lastPage }, (_, i) => lastPage - i)
      : [lastPage, lastPage - 1, lastPage - 2, lastPage - 3, 1];
    for (const page of pages) {
      const rows = await api(`/repos/${REPOSITORY}/issues/${issueNumber}/comments?per_page=100&page=${page}`);
      if (!Array.isArray(rows)) throw new Error("Invalid issue comments response");
      comments.unshift(...rows);
    }
    comments.historyComplete = lastPage <= 5 && comments.length >= metadata.comments;
    return comments;
  }
  // Older fixtures/API adapters without a count must prove the end of history.
  for (let page = 1; page <= 5; page++) {
    const rows = await api(`/repos/${REPOSITORY}/issues/${issueNumber}/comments?per_page=100&page=${page}`);
    if (!Array.isArray(rows)) throw new Error("Invalid issue comments response");
    comments.push(...rows);
    if (rows.length < 100) { comments.historyComplete = true; return comments; }
  }
  comments.historyComplete = false;
  return comments;
}
async function readIssue(api, candidate) {
  requireCandidate(candidate);
  const issue = await api(`/repos/${REPOSITORY}/issues/${candidate.issueNumber}`);
  return issue.number === candidate.issueNumber && !issue.pull_request ? issue : null;
}
async function currentIssue(api, candidate) {
  const issue = await readIssue(api, candidate);
  return issue?.state === "open" && bodyHash(issue.body) === candidate.bodySha &&
    (!candidate.titleSha || bodyHash(issue.title) === candidate.titleSha) ? issue : null;
}
async function writeRecord(api, candidate, state, attempt = candidate.attempt ?? 0, notBefore) {
  const record = { version: candidate.reviewRevision ? 3 : 2, issueNumber: candidate.issueNumber, bodySha: candidate.bodySha,
    ...(candidate.reviewRevision ? { titleSha: candidate.titleSha, reviewRevision: candidate.reviewRevision } : {}), attempt, state,
    claimId: attempt > 0 ? retryClaimId({ ...candidate, attempt }) : null, ...(notBefore ? { notBefore } : {}) };
  // POST is deliberately not retried on unknown responses. The next run reads back.
  await api(`/repos/${REPOSITORY}/issues/${candidate.issueNumber}/comments`, { method: "POST", body: { body: renderRetryRecord(record) } });
}
export async function markRetry({ api, candidate, trustedWriter = process.env.INGEST_TRUSTED_WRITER, dryRun, repository = REPOSITORY }) {
  requireRepository(repository);
  if (isDryRun(dryRun)) return false;
  if (!await currentIssue(api, candidate)) return false;
  const comments = await readComments(api, candidate.issueNumber);
  const prior = retryRecord(comments, candidate, trustedWriter);
  if (prior && TERMINAL.has(prior.state)) return false;
  if (!comments.historyComplete) {
    if (!await currentIssue(api, candidate)) return false;
    await writeRecord(api, candidate, "control-budget-exhausted", MAX_RETRIES);
    return true;
  }
  const notBefore = candidate.retryNotBefore || undefined;
  if (notBefore && (typeof notBefore !== "string" || !Number.isFinite(Date.parse(notBefore)) || new Date(notBefore).toISOString() !== notBefore))
    throw new Error("Invalid retry not-before timestamp; no dispatch scheduled");
  if (prior && (TERMINAL.has(prior.state) || !notBefore || Date.parse(notBefore) <= (Date.parse(prior.notBefore) || 0))) return false;
  if (!await currentIssue(api, candidate)) return false;
  await writeRecord(api, candidate, prior?.state ?? "pending", prior?.attempt ?? 0, notBefore);
  return true;
}
export async function recoverRetry({ api, issueNumber, expectedBodySha, expectedTitleSha, reviewRevision = reviewPolicyRevision(), retryNotBefore, trustedWriter = process.env.INGEST_TRUSTED_WRITER, dryRun, repository = REPOSITORY }) {
  requireRepository(repository);
  if (isDryRun(dryRun)) return false;
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1 || (expectedBodySha && !HASH.test(expectedBodySha)))
    throw new Error("Invalid retry recovery identity");
  const issue = await api(`/repos/${REPOSITORY}/issues/${issueNumber}`);
  if (issue.number !== issueNumber || issue.pull_request || issue.state !== "open" || !isSubmission(issue)) return false;
  const bodySha = bodyHash(issue.body);
  if ((expectedBodySha && bodySha !== expectedBodySha) || (expectedTitleSha && bodyHash(issue.title) !== expectedTitleSha)) return false;
  return markRetry({ api, candidate: { issueNumber, bodySha, titleSha: bodyHash(issue.title), reviewRevision, retryNotBefore }, trustedWriter, dryRun, repository });
}
export async function selectRetry({ api, now = Date.now, reviewRevision = reviewPolicyRevision(), trustedWriter = process.env.INGEST_TRUSTED_WRITER, onWarning = (message) => console.warn(message) }) {
  // Include closed issues so a withdrawn pending submission reaches a terminal state.
  const q = encodeURIComponent(`repo:${REPOSITORY} is:issue in:comments "awesome-jev-retry"`);
  const query = `/search/issues?q=${q}&sort=updated&order=asc&per_page=30`;
  let result = await api(query + "&page=1", { search: true });
  if (!Array.isArray(result.items)) throw new Error("Invalid retry queue search response");
  if (result.incomplete_results || result.total_count > 990) onWarning("Retry search coverage is partial; scanning a bounded window, not claiming the queue is empty");
  const pages = Math.max(1, Math.min(33, Math.ceil((result.total_count ?? result.items.length) / 30)));
  const page = Math.floor(now() / 1_800_000) % pages + 1;
  if (page !== 1) result = await api(query + `&page=${page}`, { search: true });
  if (!Array.isArray(result.items)) throw new Error("Invalid retry queue window response");
  for (const issue of result.items.slice(0, 30)) {
    if (!Number.isSafeInteger(issue.number) || issue.pull_request) continue;
    try {
      const live = await api(`/repos/${REPOSITORY}/issues/${issue.number}`);
      if (live.number !== issue.number || live.pull_request) continue;
      const comments = await readComments(api, issue.number);
      // A formerly queued submission may have had its body withdrawn. Only a
      // genuine trusted control record authorizes reconciling that old revision.
      if (!isSubmission(live) && !comments.some((c) => parseRetryRecord(c, { issueNumber: issue.number, trustedWriter }))) continue;
      const candidate = { issueNumber: issue.number, bodySha: bodyHash(live.body), titleSha: bodyHash(live.title), reviewRevision };
      const record = retryRecord(comments, candidate, trustedWriter);
      if (record && TERMINAL.has(record.state)) continue;
      const obsolete = comments.map((c) => parseRetryRecord(c, { issueNumber: issue.number, trustedWriter }))
        .filter((r) => r && (r.bodySha !== candidate.bodySha || live.state !== "open" || (r.version === 3 && (r.titleSha !== candidate.titleSha || r.reviewRevision !== reviewRevision))))
        .map((r) => retryRecord(comments, r, trustedWriter)).find((r) => r && !TERMINAL.has(r.state));
      if (obsolete) return { issueNumber: issue.number, bodySha: obsolete.bodySha, ...(obsolete.version === 3 ? { titleSha: obsolete.titleSha, reviewRevision: obsolete.reviewRevision } : {}), attempt: obsolete.attempt, claimId: obsolete.claimId ?? "", action: "finish", state: "superseded" };
      if (!comments.historyComplete && live.state === "open" && isSubmission(live)) {
        const terminal = { ...candidate, attempt: MAX_RETRIES };
        return { ...terminal, claimId: retryClaimId(terminal), action: "finish", state: "control-budget-exhausted" };
      }
      if (process.env.REVIEW_PROVIDER_CONFIGURED === "false") continue;
      const reconfigured = !record && comments.map((comment) => parseRetryRecord(comment, { issueNumber: issue.number, trustedWriter }))
        .some((prior) => prior?.version === 3 && prior.state === "provider-unavailable" && prior.bodySha === candidate.bodySha &&
          prior.titleSha === candidate.titleSha && prior.reviewRevision !== reviewRevision);
      if (reconfigured) {
        const next = { ...candidate, attempt: 1 };
        return { ...next, claimId: retryClaimId(next), action: "review" };
      }
      const legacy = record ? null : retryRecord(comments.filter((comment) => parseRetryRecord(comment, { issueNumber: issue.number, trustedWriter })?.version === 2), { issueNumber: issue.number, bodySha: candidate.bodySha }, trustedWriter);
      if (!record && legacy && !TERMINAL.has(legacy.state) && live.state === "open" && !leaseActive(legacy, now()) && !(Date.parse(legacy.notBefore) > now())) {
        const migrated = { ...candidate, attempt: 1 };
        return { ...migrated, claimId: retryClaimId(migrated), action: "review" };
      }
      if (!record || TERMINAL.has(record.state) || live.state !== "open" || leaseActive(record, now()) || Date.parse(record.notBefore) > now()) continue;
      if (record.attempt === MAX_RETRIES)
        return { ...candidate, attempt: record.attempt, claimId: record.claimId, action: "finish", state: "exhausted" };
      const next = { ...candidate, attempt: record.attempt + 1 };
      return { ...next, claimId: retryClaimId(next), action: "review" };
    } catch (error) {
      onWarning(`Retry issue #${issue.number} deferred: ${error.message}`);
    }
  }
  return null;
}
export async function claimRetry({ api, candidate, now = Date.now, trustedWriter = process.env.INGEST_TRUSTED_WRITER, dryRun, repository = REPOSITORY }) {
  requireRepository(repository);
  if (isDryRun(dryRun)) return false;
  requireCandidate(candidate);
  if (!Number.isInteger(candidate.attempt) || candidate.attempt < 1 || candidate.attempt > MAX_RETRIES ||
      (candidate.claimId && candidate.claimId !== retryClaimId(candidate))) throw new Error("Invalid retry attempt or claim");
  if (!await currentIssue(api, candidate)) return false;
  const comments = await readComments(api, candidate.issueNumber);
  const record = retryRecord(comments, candidate, trustedWriter);
  if (!comments.historyComplete) {
    if (record && TERMINAL.has(record.state)) return false;
    if (await currentIssue(api, candidate)) await writeRecord(api, candidate, "control-budget-exhausted", MAX_RETRIES);
    return false;
  }
  const legacy = record ? null : retryRecord(comments.filter((comment) => parseRetryRecord(comment, { issueNumber: candidate.issueNumber, trustedWriter })?.version === 2), { issueNumber: candidate.issueNumber, bodySha: candidate.bodySha }, trustedWriter);
  const reconfigured = !record && comments.map((comment) => parseRetryRecord(comment, { issueNumber: candidate.issueNumber, trustedWriter }))
    .some((prior) => prior?.version === 3 && prior.state === "provider-unavailable" && prior.bodySha === candidate.bodySha &&
      prior.titleSha === candidate.titleSha && prior.reviewRevision !== candidate.reviewRevision);
  const migrating = !record && candidate.reviewRevision && candidate.attempt === 1 && (reconfigured ||
    (legacy && !TERMINAL.has(legacy.state) && !leaseActive(legacy, now()) && !(Date.parse(legacy.notBefore) > now())));
  if (process.env.REVIEW_PROVIDER_CONFIGURED === "false") return false;
  if (!migrating && (!record || TERMINAL.has(record.state) || record.attempt !== candidate.attempt - 1 || leaseActive(record, now()) || Date.parse(record.notBefore) > now())) return false;
  if (!await currentIssue(api, candidate)) return false;
  await writeRecord(api, candidate, "claimed");
  return true;
}
export async function validateRetryClaim({ api, candidate, now = Date.now, trustedWriter = process.env.INGEST_TRUSTED_WRITER, repository = REPOSITORY }) {
  requireRepository(repository);
  requireCandidate(candidate);
  if (candidate.reviewRevision && candidate.reviewRevision !== reviewPolicyRevision()) return false;
  if (!Number.isInteger(candidate.attempt) || candidate.attempt < 1 || candidate.attempt > MAX_RETRIES || candidate.claimId !== retryClaimId(candidate)) return false;
  if (!await currentIssue(api, candidate)) return false;
  const comments = await readComments(api, candidate.issueNumber);
  if (!comments.historyComplete) return false;
  const record = retryRecord(comments, candidate, trustedWriter);
  return Boolean(record && !record.legacy && ["claimed", "dispatch-unknown"].includes(record.state) &&
    record.claimId === candidate.claimId && record.attempt === candidate.attempt &&
    Number.isFinite(record.createdAt) && now() - record.createdAt < RETRY_LEASE_MS);
}
export async function settleRetry({ api, candidate, state, trustedWriter = process.env.INGEST_TRUSTED_WRITER, dryRun, repository = REPOSITORY }) {
  requireRepository(repository);
  if (isDryRun(dryRun)) return false;
  requireCandidate(candidate);
  if (!TERMINAL.has(state) && state !== "dispatch-unknown") throw new Error("Invalid retry terminal state");
  const comments = await readComments(api, candidate.issueNumber);
  const record = retryRecord(comments, candidate, trustedWriter);
  if (!comments.historyComplete && (!record || !TERMINAL.has(record.state))) {
    if (state === "superseded" && record) {
      const live = await readIssue(api, candidate);
      if (!live || (live.state === "open" && bodyHash(live.body) === candidate.bodySha && (!candidate.titleSha || bodyHash(live.title) === candidate.titleSha) && (!candidate.reviewRevision || candidate.reviewRevision === reviewPolicyRevision()))) return false;
      await writeRecord(api, candidate, "superseded", MAX_RETRIES);
      return true;
    }
    if (!await currentIssue(api, candidate)) return false;
    await writeRecord(api, candidate, "control-budget-exhausted", MAX_RETRIES);
    return true;
  }
  if (state === "control-budget-exhausted") return false;
  if (!record || TERMINAL.has(record.state) || record.state === state ||
      (candidate.claimId && (candidate.claimId !== record.claimId || candidate.attempt !== record.attempt))) return false;
  if (state === "dispatch-unknown" && record.state !== "claimed") return false;
  if (state === "exhausted" && record.attempt !== MAX_RETRIES) return false;
  const live = await readIssue(api, candidate);
  if (!live) return false;
  if (state === "superseded") {
    if (live.state === "open" && bodyHash(live.body) === candidate.bodySha && (!candidate.titleSha || bodyHash(live.title) === candidate.titleSha) && (!candidate.reviewRevision || candidate.reviewRevision === reviewPolicyRevision())) return false;
  } else if (bodyHash(live.body) !== candidate.bodySha || (live.state !== "open" && state !== "completed")) return false;
  await writeRecord(api, candidate, state, record.attempt);
  return true;
}
export const reviewCaseId = (issueNumber, bodySha, titleSha = bodyHash(""), reviewRevision = reviewPolicyRevision()) => bodyHash(`issue:${issueNumber}:${bodySha}:${titleSha}:${reviewRevision}`);
export async function reserveReviewBudget({ api, budgetApi = api, issueNumber, expectedBodySha, expectedTitleSha, expectedReviewRevision, existingProjects = [], runId, runAttempt = 1, trustedWriter = process.env.INGEST_TRUSTED_WRITER, dryRun }) {
  if (isDryRun(dryRun)) return { allowed: false, status: "dry-run" };
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) throw new Error("Invalid model budget reservation identity");
  const issue = await api(`/repos/${REPOSITORY}/issues/${issueNumber}`);
  if (issue.number !== issueNumber || issue.pull_request || issue.state !== "open" || !isSubmission(issue)) return { allowed: false, status: "ignored" };
  const candidate = { issueNumber, bodySha: bodyHash(issue.body), titleSha: bodyHash(issue.title), reviewRevision: reviewPolicyRevision() };
  if ((expectedBodySha && expectedBodySha !== candidate.bodySha) || (expectedTitleSha && expectedTitleSha !== candidate.titleSha) || (expectedReviewRevision && expectedReviewRevision !== candidate.reviewRevision))
    return { allowed: false, status: "superseded" };
  const references = githubRepositoryReferences(`${issue.title ?? ""}\n${issue.body ?? ""}`).slice(0, 3);
  const known = new Set(existingProjects.flatMap((project) => githubRepositoryReferences(project?.url ?? "")).map((name) => name.toLowerCase()));
  const unlisted = references.filter((name) => !known.has(name.toLowerCase()));
  if (references.length && !unlisted.length) return { allowed: false, localOnly: true, status: "already-listed", ...candidate };
  const comments = await readComments(api, issueNumber);
  const terminal = retryRecord(comments, candidate, trustedWriter);
  if (process.env.REVIEW_PROVIDER_CONFIGURED === "false") {
    if (terminal?.state !== "provider-unavailable" && await currentIssue(api, candidate))
      await writeRecord(api, candidate, "provider-unavailable", terminal?.attempt ?? 0);
    return { allowed: false, localOnly: true, status: "provider-unavailable", ...candidate };
  }
  if (terminal && TERMINAL.has(terminal.state)) return { allowed: false, status: terminal.state, ...candidate };
  if (!comments.historyComplete) {
    if (await currentIssue(api, candidate)) await writeRecord(api, candidate, "control-budget-exhausted", MAX_RETRIES);
    return { allowed: false, status: "control-budget-exhausted", ...candidate };
  }
  // Multi-target attribution is provisional: use the same ordered references
  // as ingestion, while the submitter and global daily caps remain hard bounds.
  const submitted = unlisted[0];
  if (!submitted) return { allowed: false, localOnly: true, status: "no-repository-reference", ...candidate };
  const result = await reserveControlBudgets({ api: budgetApi, cases: [{ caseId: reviewCaseId(issueNumber, candidate.bodySha, candidate.titleSha, candidate.reviewRevision),
    owner: Number.isSafeInteger(issue.user?.id) && issue.user.id > 0 ? `github-user:${issue.user.id}` : issue.user?.login, repository: submitted }], runId, runAttempt });
  const granted = result.grants[0];
  if (!granted) {
    const denied = result.deferred[0];
    if (denied?.retryNotBefore) await markRetry({ api, candidate: { ...candidate, retryNotBefore: denied.retryNotBefore }, trustedWriter });
    else if (await currentIssue(api, candidate)) await writeRecord(api, candidate, "budget-exhausted", terminal?.attempt ?? 0);
    return { allowed: false, status: denied?.status ?? "budget-exhausted", ...candidate };
  }
  return { allowed: true, status: "reserved", ...candidate, reservationId: granted.reservationId };
}
export async function readReviewBudgetGrant({ api, issueNumber, bodySha, titleSha = bodyHash(""), reviewRevision = reviewPolicyRevision(), reservationId, runId = process.env.GITHUB_RUN_ID,
  runAttempt = Number(process.env.GITHUB_RUN_ATTEMPT) }) {
  const candidate = { issueNumber, bodySha, titleSha, reviewRevision };
  requireCandidate(candidate);
  if (!/^(?:\d{4}-\d{2}-\d{2}:)?[a-f\d]{64}$/.test(reservationId ?? "") || !await currentIssue(api, candidate)) return null;
  return readRadarBudgetGrant({ api, caseId: reviewCaseId(issueNumber, bodySha, titleSha, reviewRevision), reservationId, runId, runAttempt });
}
export async function settleReviewBudget({ api, issueNumber, bodySha, titleSha = bodyHash(""), reviewRevision = reviewPolicyRevision(), reservationId, budgetLedger, accountingVerified = false,
  runId = process.env.GITHUB_RUN_ID, runAttempt = Number(process.env.GITHUB_RUN_ATTEMPT), dryRun }) {
  if (isDryRun(dryRun)) return false;
  requireCandidate({ issueNumber, bodySha });
  return settleRadarBudgets({ api, receipts: [{ caseId: reviewCaseId(issueNumber, bodySha, titleSha, reviewRevision), reservationId, budgetLedger, accountingVerified }], runId, runAttempt });
}
async function output(values) {
  if (process.env.GITHUB_OUTPUT)
    await appendFile(process.env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
}
async function main() {
  requireRepository(process.env.GITHUB_REPOSITORY);
  const mode = process.argv[2];
  if (!["select", "mark", "recover", "claim", "finish", "budget-reserve", "budget-settle"].includes(mode)) throw new Error("Invalid retry command");
  if (mode !== "select" && isDryRun(false)) { await output({ claimed: false }); console.log("Dry run: retry writes disabled"); return; }
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const api = createGitHubClient({ token, ...(mode === "select" ? {} : { writeRepository: REPOSITORY }) });
  const trustedWriter = process.env.INGEST_TRUSTED_WRITER;
  const budgetApi = mode.startsWith("budget-") ? createGitHubClient({ token, writeRepository: REPOSITORY, writeScope: "budget" }) : null;
  if (mode === "budget-reserve") {
    const reserved = await reserveReviewBudget({ api, budgetApi, issueNumber: Number(process.env.INGEST_ISSUE_NUMBER),
      expectedBodySha: process.env.INGEST_ISSUE_BODY_SHA || undefined, expectedTitleSha: process.env.INGEST_ISSUE_TITLE_SHA || undefined, expectedReviewRevision: process.env.INGEST_REVIEW_REVISION || undefined,
      existingProjects: JSON.parse(await readFile(new URL("../src/data/projects.json", import.meta.url), "utf8")), runId: process.env.GITHUB_RUN_ID,
      runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT || 1), trustedWriter });
    await output({ allowed: reserved.allowed, local_only: reserved.localOnly === true, status: reserved.status, issue_number: reserved.issueNumber ?? "", body_sha: reserved.bodySha ?? "", title_sha: reserved.titleSha ?? "", review_revision: reserved.reviewRevision ?? "", reservation_id: reserved.reservationId ?? "" });
    console.log(`Model budget: ${reserved.status}`); return;
  }
  if (mode === "budget-settle") {
    const prepared = JSON.parse(await readFile(process.env.INGEST_RESULT_FILE, "utf8"));
    if (prepared.budgetReservationId !== process.env.INGEST_BUDGET_RESERVATION_ID) throw new Error("Model budget receipt reservation mismatch");
    const settled = await settleReviewBudget({ api: budgetApi, issueNumber: Number(process.env.INGEST_ISSUE_NUMBER), bodySha: process.env.INGEST_ISSUE_BODY_SHA, titleSha: process.env.INGEST_ISSUE_TITLE_SHA, reviewRevision: process.env.INGEST_REVIEW_REVISION,
      reservationId: prepared.budgetReservationId, budgetLedger: prepared.budgetLedger,
      accountingVerified: prepared.reviewDetails?.usage?.status === "reported" && !prepared.reviewDetails?.budget?.accountingOverrun, trustedWriter });
    console.log(`Model budget: ${settled ? "settled" : "unchanged"}`); return;
  }
  if (mode === "select") {
    const candidate = await selectRetry({ api, trustedWriter });
    await output({ found: Boolean(candidate), issue_number: candidate?.issueNumber ?? "", body_sha: candidate?.bodySha ?? "", title_sha: candidate?.titleSha ?? "", review_revision: candidate?.reviewRevision ?? "", attempt: candidate?.attempt ?? "", claim_id: candidate?.claimId ?? "", action: candidate?.action ?? "", state: candidate?.state ?? "" });
    console.log(candidate ? `Queued issue #${candidate.issueNumber}: ${candidate.action}, attempt ${candidate.attempt}/${MAX_RETRIES}` : "No eligible submission in the scanned queue window");
    return;
  }
  const candidate = { issueNumber: Number(process.env.INGEST_ISSUE_NUMBER), bodySha: process.env.INGEST_ISSUE_BODY_SHA, titleSha: process.env.INGEST_ISSUE_TITLE_SHA || undefined, reviewRevision: process.env.INGEST_REVIEW_REVISION || undefined, attempt: Number(process.env.INGEST_RETRY_ATTEMPT), claimId: process.env.INGEST_RETRY_CLAIM_ID || undefined, retryNotBefore: process.env.INGEST_RETRY_NOT_BEFORE || undefined };
  const args = { api, candidate, trustedWriter };
  const changed = mode === "recover" ? await recoverRetry({ api, issueNumber: candidate.issueNumber, expectedBodySha: candidate.bodySha, expectedTitleSha: candidate.titleSha, retryNotBefore: candidate.retryNotBefore, trustedWriter })
    : mode === "mark" ? await markRetry(args) : mode === "claim" ? await claimRetry(args) : await settleRetry({ ...args, state: process.env.INGEST_RETRY_STATE });
  await output({ claimed: changed });
  console.log(`${mode}: ${changed ? "recorded" : "already recorded or no longer eligible"}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
