/** Bounded retry queue for CAS conflicts. Never executes submitted code. */
import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { createGitHubClient } from "./github-client.mjs";

export const MAX_RETRIES = 3;
export const RETRY_LEASE_MS = 90 * 60 * 1000;
const marker = /<!-- awesome-jev-retry:v1:([a-f\d]{64}):([0-3]) -->/g;
const bot = "github-actions[bot]";
const repository = "logicrw/awesome-jev-projects";
// Keep privileged queue writes independent of the source-scanning module graph.
const bodyHash = (body) => createHash("sha256").update(body ?? "").digest("hex");
function requireCandidate(candidate) {
  if (!Number.isSafeInteger(candidate?.issueNumber) || candidate.issueNumber < 1 ||
      !/^[a-f\d]{64}$/.test(candidate.bodySha ?? ""))
    throw new Error("Invalid retry candidate");
}
export function retryState(comments, bodySha) {
  let attempt = -1;
  for (const comment of comments) {
    if (comment.user?.login !== bot) continue;
    for (const match of String(comment.body ?? "").matchAll(marker))
      if (match[1] === bodySha) attempt = Math.max(attempt, Number(match[2]));
  }
  return attempt;
}
function leaseActive(comments, bodySha, attempt, now) {
  if (attempt <= 0) return false;
  let newestClaim = -Infinity;
  for (const comment of comments) {
    if (comment.user?.login !== bot) continue;
    if (![...String(comment.body ?? "").matchAll(marker)].some((m) => m[1] === bodySha && Number(m[2]) === attempt)) continue;
    const timestamp = Date.parse(comment.created_at);
    // GitHub owns created_at. Missing/malformed timestamps must not burn attempts.
    if (!Number.isFinite(timestamp)) return true;
    newestClaim = Math.max(newestClaim, timestamp);
  }
  return now - newestClaim < RETRY_LEASE_MS;
}
async function readComments(api, issueNumber) {
  const comments = [];
  for (let page = 1; page <= 5; page++) {
    const rows = await api(`/repos/${repository}/issues/${issueNumber}/comments?per_page=100&page=${page}`);
    if (!Array.isArray(rows)) throw new Error("Invalid issue comments response");
    comments.push(...rows);
    if (rows.length < 100) return comments;
  }
  throw new Error("Retry comment budget exceeded; manual review required");
}
async function currentIssue(api, candidate) {
  requireCandidate(candidate);
  const issue = await api(`/repos/${repository}/issues/${candidate.issueNumber}`);
  return issue.number === candidate.issueNumber && issue.state === "open" && !issue.pull_request &&
    bodyHash(issue.body) === candidate.bodySha ? issue : null;
}
async function writeMarker(api, candidate, attempt) {
  const text = attempt === 0
    ? "自动审核已加入后台排队（可能由于并发更新或审查服务暂时抖动）。系统将自动安排重新审核，最多自动重试 3 次。"
    : `正在安排第 ${attempt}/${MAX_RETRIES} 次自动重新审核；收录结果会在实际部署核验后通知。`;
  await api(`/repos/${repository}/issues/${candidate.issueNumber}/comments`, {
    method: "POST",
    body: { body: `${text}\n\n<!-- awesome-jev-retry:v1:${candidate.bodySha}:${attempt} -->` },
  });
}
export async function markRetry({ api, candidate }) {
  if (!await currentIssue(api, candidate)) return false;
  const comments = await readComments(api, candidate.issueNumber);
  // A new stale run must not reset the persistent attempt budget.
  if (retryState(comments, candidate.bodySha) >= 0) return false;
  if (!await currentIssue(api, candidate)) return false;
  await writeMarker(api, candidate, 0);
  return true;
}
export async function selectRetry({ api, now = Date.now }) {
  // Search only explicitly queued submissions; ordinary open Issues are never re-reviewed.
  // Search indexing can lag; the next scheduled run picks up a newly posted marker.
  const q = encodeURIComponent(`repo:${repository} is:issue is:open in:comments "awesome-jev-retry"`);
  const query = `/search/issues?q=${q}&sort=updated&order=asc&per_page=30`;
  let result = await api(query + "&page=1", { search: true });
  if (!Array.isArray(result.items) || result.incomplete_results || result.total_count > 1000)
    throw new Error("Incomplete or oversized retry queue search; manual review required");
  // Rotate bounded windows so old exhausted submissions cannot starve newer ones.
  const pages = Math.max(1, Math.ceil((result.total_count ?? result.items.length) / 30));
  const page = Math.floor(now() / 1_800_000) % pages + 1;
  if (page !== 1) result = await api(query + `&page=${page}`, { search: true });
  if (!Array.isArray(result.items) || result.incomplete_results)
    throw new Error("Incomplete retry queue window; no dispatch performed");
  for (const issue of result.items.slice(0, 30)) {
    if (!Number.isSafeInteger(issue.number) || issue.pull_request) continue;
    const live = await api(`/repos/${repository}/issues/${issue.number}`);
    if (live.number !== issue.number || live.state !== "open" || live.pull_request) continue;
    const bodySha = bodyHash(live.body);
    const comments = await readComments(api, issue.number);
    const attempt = retryState(comments, bodySha);
    if (attempt >= 0 && attempt < MAX_RETRIES && !leaseActive(comments, bodySha, attempt, now()))
      return { issueNumber: issue.number, bodySha, attempt: attempt + 1 };
  }
  return null;
}
export async function claimRetry({ api, candidate, now = Date.now }) {
  requireCandidate(candidate);
  if (!Number.isInteger(candidate.attempt) || candidate.attempt < 1 || candidate.attempt > MAX_RETRIES)
    throw new Error("Invalid retry attempt");
  if (!await currentIssue(api, candidate)) return false;
  const comments = await readComments(api, candidate.issueNumber);
  const attempt = retryState(comments, candidate.bodySha);
  if (attempt !== candidate.attempt - 1 || leaseActive(comments, candidate.bodySha, attempt, now())) return false;
  if (!await currentIssue(api, candidate)) return false;
  // A 90-minute lease exceeds the normal review/validation/publication timeout
  // budget and avoids consuming attempts while a prior dispatch is in flight.
  // Persist BEFORE dispatch: runner/dispatch failures consume a bounded attempt too.
  // Only the dedicated scheduler writes claims and its concurrency group is serial.
  await writeMarker(api, candidate, candidate.attempt);
  return true;
}
async function output(values) {
  if (process.env.GITHUB_OUTPUT)
    await appendFile(process.env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
}
async function main() {
  if (process.env.GITHUB_REPOSITORY !== repository) throw new Error("Unexpected retry repository");
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const mode = process.argv[2];
  if (!["select", "mark", "claim"].includes(mode)) throw new Error("Invalid retry command");
  const api = createGitHubClient({ token, ...(mode === "select" ? {} : { writeRepository: repository }) });
  if (mode === "select") {
    const candidate = await selectRetry({ api });
    await output({ found: Boolean(candidate), issue_number: candidate?.issueNumber ?? "", body_sha: candidate?.bodySha ?? "", attempt: candidate?.attempt ?? "" });
    console.log(candidate ? `Queued issue #${candidate.issueNumber}, retry ${candidate.attempt}/${MAX_RETRIES}` : "No eligible queued submissions");
    return;
  }
  const candidate = { issueNumber: Number(process.env.INGEST_ISSUE_NUMBER), bodySha: process.env.INGEST_ISSUE_BODY_SHA, attempt: Number(process.env.INGEST_RETRY_ATTEMPT) };
  const changed = mode === "mark" ? await markRetry({ api, candidate }) : await claimRetry({ api, candidate });
  await output({ claimed: changed });
  console.log(`${mode}: ${changed ? "recorded" : "already recorded or no longer eligible"}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
