/** Fixed control-branch budget ledger. No model secret or untrusted code execution. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createGitHubClient } from './github-client.mjs';
import { reviewPolicyRevision } from './review-policy.mjs';
import { createQuotaRegistry, validateQuotaRegistry, compactQuotaRegistry, reserveQuota, settleQuota } from './budget-quota.mjs';
const REPO = 'logicrw/awesome-jev-projects', BRANCH = 'ingestion-budget', FILE = 'radar/review-budget.json', LIMIT = 6000;
const hash = (text) => createHash('sha256').update(text).digest('hex');
const sha = (value) => /^[a-f\d]{40}$/.test(value ?? '');
const id = (value) => /^[a-f\d]{64}$/.test(value ?? '');
const reservationIdentity = (value) => /^(?:\d{4}-\d{2}-\d{2}:)?[a-f\d]{64}$/.test(value ?? '');
export const budgetCasePath = (caseId) => {
  if (!id(caseId)) throw Error('Invalid budget case identity');
  return `radar/review-budget-cases/${caseId.slice(0, 2)}/${caseId}.json`;
};
export function radarCaseId(inspection, reviewRevision = reviewPolicyRevision()) {
  if (!Number.isSafeInteger(inspection?.repo?.id) || !sha(inspection.sha) || !id(reviewRevision)) throw Error('Invalid radar case identity');
  return hash(`radar:${inspection.repo.id}:${inspection.sha}:${reviewRevision}`);
}
function validLedger(ledger, caseId) {
  return ledger && Object.keys(ledger).sort().join(',') === 'caseId,chargedTokens,httpAttempts,limitTokens,semanticRounds,version' &&
    ledger.version === 1 && ledger.caseId === caseId && ledger.limitTokens === LIMIT && Number.isSafeInteger(ledger.chargedTokens) && ledger.chargedTokens >= 0 &&
    Number.isInteger(ledger.httpAttempts) && ledger.httpAttempts >= 0 && ledger.httpAttempts <= 3 && Number.isInteger(ledger.semanticRounds) && ledger.semanticRounds >= 0 && ledger.semanticRounds <= 2;
}
function initial(caseId) { return { version: 1, caseId, limitTokens: LIMIT, chargedTokens: 0, httpAttempts: 0, semanticRounds: 0 }; }
function validRecord(record, caseId) {
  return record && Object.keys(record).sort().join(',') === 'baseLedger,grantTokens,ledger,reservationId,runAttempt,runId,status' &&
    ['reserved', 'settled'].includes(record.status) && reservationIdentity(record.reservationId) && /^[1-9]\d{0,19}$/.test(record.runId) && Number.isSafeInteger(record.runAttempt) && record.runAttempt >= 1 &&
    validLedger(record.baseLedger, caseId) && Number.isSafeInteger(record.grantTokens) && record.grantTokens > 0 && record.grantTokens === LIMIT - record.baseLedger.chargedTokens &&
    (record.status === 'reserved' ? record.ledger === null : validLedger(record.ledger, caseId) && record.ledger.chargedTokens >= record.baseLedger.chargedTokens &&
      record.ledger.httpAttempts >= record.baseLedger.httpAttempts && record.ledger.semanticRounds >= record.baseLedger.semanticRounds);
}
async function readJSON(api, path, head, maximum) {
  const responseBytes = Math.min(10_000_000, Math.ceil(maximum * 1.5) + 4096);
  const file = await api(`/repos/${REPO}/contents/${path}?ref=${head}`, { responseBytes });
  if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > maximum) throw Error('Invalid budget control file size');
  const blob = file.encoding === 'base64' ? file : sha(file.sha) ? await api(`/repos/${REPO}/git/blobs/${file.sha}`, { responseBytes }) : null;
  if (blob?.encoding !== 'base64' || typeof blob.content !== 'string') throw Error('Invalid budget control encoding');
  const bytes = Buffer.from(blob.content, 'base64');
  if (bytes.length > maximum) throw Error('Budget control file exceeds read limit');
  return JSON.parse(bytes.toString('utf8'));
}
async function readRegistry(api) {
  let head;
  try { head = (await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`)).object?.sha; }
  catch (error) {
    if (error.status !== 404) throw error;
    const main = (await api(`/repos/${REPO}/git/ref/heads/main`)).object?.sha;
    if (!sha(main)) throw Error('Invalid budget base');
    return { head: main, exists: false, quota: createQuotaRegistry(), legacyCases: {}, cache: new Map(), changedCases: new Map() };
  }
  if (!sha(head)) throw Error('Invalid budget control head');
  // A bounded migration read also permits compaction of older large quota files; all new writes remain <=2MB.
  const value = await readJSON(api, FILE, head, 6_000_000);
  const keys = Object.keys(value ?? {}).sort().join(',');
  if (![1, 2].includes(value?.version) || !validateQuotaRegistry(value.quota) ||
    (value.version === 2 ? keys !== 'quota,version' : keys !== 'cases,quota,version' || !value.cases || typeof value.cases !== 'object' || Array.isArray(value.cases) ||
      Object.entries(value.cases).some(([key, record]) => !id(key) || !validRecord(record, key))))
    throw Error('Invalid persistent budget; refusing to reset it');
  return { head, exists: true, quota: value.quota, legacyCases: value.version === 1 ? value.cases : {}, cache: new Map(), changedCases: new Map() };
}
async function readCase(api, snapshot, caseId) {
  if (snapshot.cache.has(caseId)) return snapshot.cache.get(caseId);
  let record = null;
  if (snapshot.exists) {
    try { record = await readJSON(api, budgetCasePath(caseId), snapshot.head, 8192); }
    catch (error) { if (error.status !== 404) throw error; record = snapshot.legacyCases[caseId] ?? null; }
  }
  if (record && !validRecord(record, caseId)) throw Error('Invalid persistent case; refusing to reset its budget');
  snapshot.cache.set(caseId, record);
  return record;
}
async function persist(api, snapshot) {
  if (snapshot.changedCases.size > 99) throw Error('Budget transaction case limit exceeded');
  const remainingLegacy = { ...snapshot.legacyCases };
  const entries = [];
  for (const [caseId, record] of snapshot.changedCases) {
    const content = JSON.stringify(record) + '\n';
    if (!validRecord(record, caseId) || Buffer.byteLength(content) > 8192) throw Error('Invalid budget case write');
    entries.push({ path: budgetCasePath(caseId), mode: '100644', type: 'blob', content });
    delete remainingLegacy[caseId];
  }
  // Legacy inline counters are retained until each one has moved to its direct
  // case path; a missing new file can never silently reset an old case.
  const value = Object.keys(remainingLegacy).length ? { version: 1, cases: remainingLegacy, quota: snapshot.quota } : { version: 2, quota: snapshot.quota };
  const content = JSON.stringify(value) + '\n';
  entries.unshift({ path: FILE, mode: '100644', type: 'blob', content });
  if (entries.reduce((total, entry) => total + Buffer.byteLength(entry.content), 0) > 2_000_000) throw Error('Budget transaction storage limit reached; no new grants');
  const base = await api(`/repos/${REPO}/git/commits/${snapshot.head}`);
  if (!sha(base.tree?.sha)) throw Error('Invalid budget control tree');
  const tree = await api(`/repos/${REPO}/git/trees`, { method: 'POST', body: { base_tree: base.tree.sha, tree: entries } });
  if (!sha(tree.sha)) throw Error('Invalid budget tree receipt');
  const commit = await api(`/repos/${REPO}/git/commits`, { method: 'POST', body: { message: 'control: reserve or settle review budgets', tree: tree.sha, parents: [snapshot.head] } });
  if (!sha(commit.sha)) throw Error('Invalid budget commit receipt');
  try {
    if (snapshot.exists) await api(`/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: { sha: commit.sha, force: false } });
    else await api(`/repos/${REPO}/git/refs`, { method: 'POST', body: { ref: `refs/heads/${BRANCH}`, sha: commit.sha } });
  } catch (error) {
    const actual = (await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`)).object?.sha;
    if (actual !== commit.sha) throw error;
  }
}
export async function reserveControlBudgets({ api, cases, runId, runAttempt, dryRun = false, now = new Date().toISOString(), limits }) {
  if (dryRun) return { version: 1, grants: [], deferred: [], status: 'dry-run' };
  if (process.env.REVIEW_PROVIDER_CONFIGURED === 'false') return { version: 1, grants: [],
    deferred: cases.map(({ caseId }) => ({ caseId, status: 'provider-unavailable' })), status: 'provider-unavailable' };
  if (!/^[1-9]\d{0,19}$/.test(String(runId)) || !Number.isSafeInteger(runAttempt) || runAttempt < 1 || !Array.isArray(cases) || cases.length > 250) throw Error('Invalid budget plan');
  const snapshot = await readRegistry(api), grants = [], deferred = [];
  const oldQuota = JSON.stringify(snapshot.quota);
  const compacted = compactQuotaRegistry(snapshot.quota, { now, permanentCaseAccounting: true });
  if (!compacted.ok) throw Error('Invalid budget quota retention state');
  snapshot.quota = compacted.registry;
  for (const entry of cases) {
    const { caseId, owner, repository } = entry;
    if (!id(caseId)) throw Error('Invalid budget case identity');
    if (snapshot.changedCases.size >= 99) { deferred.push({ caseId, status: 'transaction-capacity' }); continue; }
    const prior = await readCase(api, snapshot, caseId);
    if (prior?.status === 'reserved' || (prior && prior.runId === String(runId) && prior.runAttempt === runAttempt)) {
      deferred.push({ caseId, status: 'budget-exhausted' });
      if (snapshot.legacyCases[caseId]) snapshot.changedCases.set(caseId, prior);
      continue;
    }
    const baseLedger = prior?.ledger ?? initial(caseId);
    if (baseLedger.chargedTokens >= LIMIT || baseLedger.httpAttempts >= 3 || baseLedger.semanticRounds >= 2) {
      deferred.push({ caseId, status: 'budget-exhausted' });
      if (snapshot.legacyCases[caseId]) snapshot.changedCases.set(caseId, prior);
      continue;
    }
    const reservationId = `${new Date(now).toISOString().slice(0, 10)}:${hash(`${caseId}:${runId}:${runAttempt}:${randomUUID()}`)}`, grantTokens = LIMIT - baseLedger.chargedTokens;
    const quota = reserveQuota(snapshot.quota, { reservationId, caseId, owner, repository, grantTokens, now, limits });
    if (!quota.ok || !quota.dispatchAuthorized) { deferred.push({ caseId, status: quota.status, retryNotBefore: quota.retryNotBefore }); continue; }
    snapshot.quota = quota.registry;
    const record = { reservationId, runId: String(runId), runAttempt, status: 'reserved', baseLedger, grantTokens, ledger: null };
    snapshot.changedCases.set(caseId, record); snapshot.cache.set(caseId, record);
    grants.push({ caseId, reservationId });
  }
  if (snapshot.changedCases.size || oldQuota !== JSON.stringify(snapshot.quota)) await persist(api, snapshot);
  return { version: 1, grants, deferred, status: grants.length ? 'reserved' : 'no-budget' };
}
export async function reserveRadarBudgets({ api, plan, ...options }) {
  if (plan?.version !== 1 || !Array.isArray(plan.cases) || plan.cases.length > 250 ||
    new Set(plan.cases.map((entry) => entry.caseId)).size !== plan.cases.length) throw Error('Invalid radar budget plan');
  const cases = plan.cases.filter((entry) => entry.needsSemanticReview === true).map((entry) => {
    const caseId = radarCaseId(entry.inspection, entry.reviewRevision);
    if (entry.caseId !== caseId) throw Error('Radar plan case identity mismatch');
    return { caseId, owner: Number.isSafeInteger(entry.inspection.repo.owner?.id) && entry.inspection.repo.owner.id > 0
      ? `github-user:${entry.inspection.repo.owner.id}` : entry.inspection.repo.owner?.login ?? entry.inspection.repo.full_name?.split('/')[0], repository: entry.inspection.repo.full_name };
  });
  return reserveControlBudgets({ api, cases, ...options });
}
export async function readRadarBudgetGrant({ api, caseId, reservationId, runId, runAttempt, now = Date.now() }) {
  const snapshot = await readRegistry(api), record = await readCase(api, snapshot, caseId);
  const quota = snapshot.quota.reservations[reservationId];
  const probeAuthorized = snapshot.quota.recoveryProbe?.reservationId === reservationId && Date.parse(snapshot.quota.recoveryProbe.expiresUTC) > new Date(now).getTime();
  if ((snapshot.quota.fused && !probeAuthorized) || !quota || quota.caseId !== caseId || quota.chargedTokens !== null ||
    (snapshot.quota.retiredBeforeUTC && quota.day < snapshot.quota.retiredBeforeUTC.slice(0, 10)) ||
    !record || record.status !== 'reserved' || record.reservationId !== reservationId || record.runId !== String(runId) || record.runAttempt !== runAttempt ||
    quota.grantTokens !== record.grantTokens) return null;
  const { chargedTokens, httpAttempts, semanticRounds } = record.baseLedger;
  return { budgetLedger: { ...record.baseLedger }, budgetGrant: { caseId, reservationId, grantTokens: record.grantTokens, baseline: { chargedTokens, httpAttempts, semanticRounds } } };
}
export async function settleRadarBudgets({ api, receipts, runId, runAttempt, dryRun = false, now = new Date().toISOString() }) {
  if (dryRun) return false;
  if (!Array.isArray(receipts) || receipts.length > 99) throw Error('Invalid budget receipts');
  const snapshot = await readRegistry(api);
  for (const receipt of receipts) {
    const prior = await readCase(api, snapshot, receipt.caseId);
    if (!prior || prior.status !== 'reserved' || prior.reservationId !== receipt.reservationId || prior.runId !== String(runId) || prior.runAttempt !== runAttempt) continue;
    if (!receipt.budgetLedger) continue;
    const record = { ...prior, status: 'settled', ledger: receipt.budgetLedger };
    if (!validRecord(record, receipt.caseId)) throw Error('Invalid radar budget receipt; reservation retained');
    const quota = settleQuota(snapshot.quota, { reservationId: prior.reservationId, chargedTokens: receipt.budgetLedger.chargedTokens - prior.baseLedger.chargedTokens, now, accountingVerified: receipt.accountingVerified === true });
    if (!quota.ok) throw Error('Invalid global quota settlement; reservation retained');
    snapshot.quota = quota.registry; snapshot.changedCases.set(receipt.caseId, record); snapshot.cache.set(receipt.caseId, record);
  }
  if (snapshot.changedCases.size) await persist(api, snapshot);
  return snapshot.changedCases.size > 0;
}
async function main() {
  if (process.env.GITHUB_REPOSITORY !== REPO) throw Error('Unexpected budget repository');
  const mode = process.argv[2]; if (!['reserve', 'settle'].includes(mode)) throw Error('Invalid radar budget command');
  const api = createGitHubClient({ token: process.env.GITHUB_TOKEN, writeRepository: REPO, writeScope: 'budget' });
  const common = { api, runId: process.env.GITHUB_RUN_ID, runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT), dryRun: process.env.INGEST_DRY_RUN === 'true' };
  if (mode === 'reserve') {
    const result = await reserveRadarBudgets({ ...common, plan: JSON.parse(await readFile(process.env.RADAR_PLAN_FILE, 'utf8')) });
    await mkdir(dirname(process.env.RADAR_GRANTS_FILE), { recursive: true }); await writeFile(process.env.RADAR_GRANTS_FILE, JSON.stringify(result) + '\n');
    console.log(`Radar model grants: ${result.grants.length}`);
  } else {
    const receipts = JSON.parse(await readFile(process.env.RADAR_BUDGET_RECEIPTS_FILE, 'utf8'));
    console.log(`Radar budgets settled: ${await settleRadarBudgets({ ...common, receipts })}`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
