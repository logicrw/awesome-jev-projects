/** Pure quota control. All periods use UTC; permanent case accounting belongs to the controller. */
export const DEFAULT_QUOTA_LIMITS = Object.freeze({ global: 60000, owner: 12000, repository: 6000 });
const CASE_LIMIT = 6000;
const MAX_RESERVATIONS = 10000;
const nonnegative = (n) => Number.isSafeInteger(n) && n >= 0;
const identity = (s) => typeof s === "string" && /^[\w:.-]{1,200}$/.test(s);
const repositoryName = (s) => typeof s === "string" && /^[a-z\d][a-z\d-]*\/[a-z\d_.-]+$/i.test(s);
const owns = (object, key) => Object.hasOwn(object, key);
const object = (value) => value && typeof value === "object" && !Array.isArray(value);
const debit = (row) => row.chargedTokens === null ? row.grantTokens : row.chargedTokens;
function validDay(day) {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const stamp = Date.parse(`${day}T00:00:00.000Z`);
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === day;
}
function validUTC(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(Date.parse(value)).toISOString() === value;
}
const reservationDay = (id) => /^(\d{4}-\d{2}-\d{2}):[a-f\d]{64}$/.exec(id ?? "")?.[1] ?? null;
export function createQuotaRegistry() {
  return { version: 1, reservations: {}, retiredBeforeUTC: null, fused: false, fusedUntilUTC: null, recoveryProbe: null };
}

function readRegistry(value) {
  if (value == null) return createQuotaRegistry();
  if (!object(value) || value.version !== 1 || !object(value.reservations) || typeof value.fused !== "boolean" ||
      Object.keys(value.reservations).length > MAX_RESERVATIONS) return null;
  const retiredBeforeUTC = value.retiredBeforeUTC ?? null, fusedUntilUTC = value.fusedUntilUTC ?? null, recoveryProbe = value.recoveryProbe ?? null;
  if ((retiredBeforeUTC !== null && !validUTC(retiredBeforeUTC)) || (fusedUntilUTC !== null && !validUTC(fusedUntilUTC)) ||
      (recoveryProbe !== null && (!object(recoveryProbe) || !identity(recoveryProbe.reservationId) || !validUTC(recoveryProbe.expiresUTC)))) return null;
  for (const [id, row] of Object.entries(value.reservations)) {
    if (!identity(id) || !object(row) || !identity(row.caseId) || !identity(row.owner) || !repositoryName(row.repository) ||
        !validDay(row.day) || !nonnegative(row.grantTokens) || row.grantTokens > CASE_LIMIT ||
        !(row.chargedTokens === null || nonnegative(row.chargedTokens))) return null;
    const encodedDay = reservationDay(id);
    if (encodedDay && encodedDay !== row.day) return null;
  }
  return { version: 1, retiredBeforeUTC, fused: value.fused, fusedUntilUTC,
    recoveryProbe: recoveryProbe && { reservationId: recoveryProbe.reservationId, expiresUTC: recoveryProbe.expiresUTC },
    reservations: Object.fromEntries(Object.entries(value.reservations).map(([id, row]) =>
      [id, { caseId: row.caseId, owner: row.owner, repository: row.repository, day: row.day, grantTokens: row.grantTokens, chargedTokens: row.chargedTokens }])) };
}
export function validateQuotaRegistry(value) { return value != null && readRegistry(value) !== null; }
function clock(now) {
  const stamp = now instanceof Date ? now.getTime() : typeof now === "string" ? Date.parse(now) : now;
  if (!Number.isSafeInteger(stamp) || stamp < 0 || stamp > 253402214400000) return null;
  const day = new Date(stamp).toISOString().slice(0, 10);
  return { stamp, day, retryNotBefore: new Date(Date.parse(`${day}T00:00:00.000Z`) + 86400000).toISOString() };
}
function fail(status, registry, extra = {}) { return { ok: false, status, registry, ...extra }; }
const retired = (registry, day) => Boolean(registry.retiredBeforeUTC && day < registry.retiredBeforeUTC.slice(0, 10));

/** New IDs carry the authorization's UTC day; legacy IDs are read-only migration records. */
export function reserveQuota(registry, { reservationId, caseId, owner, repository, grantTokens, now, limits = DEFAULT_QUOTA_LIMITS } = {}) {
  const next = readRegistry(registry), current = clock(now);
  if (!next || !current || !identity(reservationId) || !identity(caseId) || !identity(owner) || !repositoryName(repository) ||
      !nonnegative(grantTokens) || grantTokens <= 0 || grantTokens > CASE_LIMIT || !object(limits) ||
      ["global", "owner", "repository"].some((name) => !nonnegative(limits[name]) || limits[name] <= 0))
    return fail("invalid-quota-input", next ?? registry ?? null);
  owner = owner.toLowerCase(); repository = repository.toLowerCase();
  if (owns(next.reservations, reservationId)) {
    const prior = next.reservations[reservationId];
    if (retired(next, prior.day)) return fail("stale-reservation", next);
    if (prior.caseId !== caseId || prior.owner !== owner || prior.repository !== repository || prior.grantTokens !== grantTokens)
      return fail("reservation-conflict", next);
    return { ok: true, status: "already-reserved", registry: next, reservation: prior, dispatchAuthorized: false };
  }
  const encodedDay = reservationDay(reservationId);
  if (!encodedDay || encodedDay !== current.day || retired(next, encodedDay)) return fail("stale-reservation", next);
  let recovery = false;
  if (next.fused) {
    if (next.fusedUntilUTC && current.stamp < Date.parse(next.fusedUntilUTC))
      return fail("quota-fused", next, { retryNotBefore: next.fusedUntilUTC });
    if (next.recoveryProbe && current.stamp < Date.parse(next.recoveryProbe.expiresUTC))
      return fail("quota-recovery-pending", next, { retryNotBefore: next.recoveryProbe.expiresUTC });
    recovery = true;
  }
  if (Object.keys(next.reservations).length >= MAX_RESERVATIONS) return fail("quota-registry-full", next);
  const rows = Object.values(next.reservations), sameCase = rows.filter((row) => row.caseId === caseId);
  if (sameCase.some((row) => row.owner !== owner || row.repository !== repository)) return fail("case-identity-conflict", next);
  const caseDebits = sameCase.reduce((sum, row) => sum + debit(row), 0);
  if (!Number.isSafeInteger(caseDebits) || caseDebits + grantTokens > CASE_LIMIT) return fail("case-budget-exhausted", next);
  const dayRows = rows.filter((row) => row.day === current.day);
  const used = {
    global: dayRows.reduce((sum, row) => sum + debit(row), 0),
    owner: dayRows.filter((row) => row.owner === owner).reduce((sum, row) => sum + debit(row), 0),
    repository: dayRows.filter((row) => row.repository === repository).reduce((sum, row) => sum + debit(row), 0),
  };
  const scope = ["global", "owner", "repository"].find((name) => !Number.isSafeInteger(used[name]) || used[name] + grantTokens > limits[name]);
  if (scope) return fail("daily-quota-exhausted", next, { scope, retryNotBefore: current.retryNotBefore });
  const row = { caseId, owner, repository, day: current.day, grantTokens, chargedTokens: null };
  Object.defineProperty(next.reservations, reservationId, { value: row, enumerable: true, writable: true, configurable: true });
  if (recovery) next.recoveryProbe = { reservationId, expiresUTC: current.retryNotBefore };
  return { ok: true, status: "reserved", registry: next, reservation: row, dispatchAuthorized: true, recoveryProbe: recovery };
}

/** chargedTokens is this reservation's charge, not the cumulative case ledger. */
export function settleQuota(registry, { reservationId, chargedTokens, now, accountingVerified = false } = {}) {
  const next = readRegistry(registry);
  if (!next || !identity(reservationId)) return fail("reservation-not-found", next ?? registry ?? null);
  const encodedDay = reservationDay(reservationId);
  if ((encodedDay && retired(next, encodedDay)) || (owns(next.reservations, reservationId) && retired(next, next.reservations[reservationId].day)))
    return fail("stale-reservation", next);
  if (!owns(next.reservations, reservationId)) return fail("reservation-not-found", next);
  const row = next.reservations[reservationId];
  if (chargedTokens == null) return { ok: true, status: "unknown-charge-retained", registry: next, reservation: row };
  if (!nonnegative(chargedTokens)) return fail("invalid-charge", next);
  if (row.chargedTokens !== null) return row.chargedTokens === chargedTokens ?
    { ok: true, status: "already-settled", registry: next, reservation: row } : fail("settlement-conflict", next);
  const current = clock(now ?? `${row.day}T00:00:00.000Z`);
  if (!current) return fail("invalid-settlement-time", next);
  row.chargedTokens = chargedTokens;
  const overrun = chargedTokens > row.grantTokens;
  if (overrun) {
    next.fused = true;
    next.fusedUntilUTC = next.fusedUntilUTC && next.fusedUntilUTC > current.retryNotBefore ? next.fusedUntilUTC : current.retryNotBefore;
    next.recoveryProbe = null;
  } else if (next.fused && next.recoveryProbe?.reservationId === reservationId && accountingVerified === true) {
    next.fused = false; next.fusedUntilUTC = null; next.recoveryProbe = null;
  }
  return { ok: true, status: overrun ? "provider-budget-violation" : "settled", registry: next, reservation: row, accountingOverrun: overrun };
}

/** Preserve unknown debts by default. Only a controller retaining permanent case
 * tombstones may retire unknown daily rows; retirement never refunds that case.
 * The monotone watermark also prevents expired IDs and late refunds resurrecting them. */
export function compactQuotaRegistry(registry, { now, retentionDays = 30, permanentCaseAccounting = false } = {}) {
  const next = readRegistry(registry), current = clock(now);
  if (!next || !current || !Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 365 || typeof permanentCaseAccounting !== "boolean")
    return fail("invalid-quota-compaction", next ?? registry ?? null);
  const cutoffUTC = new Date(Date.parse(`${current.day}T00:00:00.000Z`) - (retentionDays - 1) * 86400000).toISOString();
  next.retiredBeforeUTC = next.retiredBeforeUTC && next.retiredBeforeUTC > cutoffUTC ? next.retiredBeforeUTC : cutoffUTC;
  const cutoffDay = next.retiredBeforeUTC.slice(0, 10), before = Object.keys(next.reservations).length;
  next.reservations = Object.fromEntries(Object.entries(next.reservations)
    .filter(([, row]) => row.day >= cutoffDay || (row.chargedTokens === null && !permanentCaseAccounting)));
  const removed = before - Object.keys(next.reservations).length;
  return { ok: true, status: removed ? "compacted" : "unchanged", registry: next, removed, cutoffDay, retiredBeforeUTC: next.retiredBeforeUTC };
}
