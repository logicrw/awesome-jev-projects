import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { reserveQuota, settleQuota, createQuotaRegistry, validateQuotaRegistry, compactQuotaRegistry } from "../scripts/budget-quota.mjs";
const today = "2026-10-09";
const rid = (label, day = today) => `${day}:${createHash("sha256").update(label).digest("hex")}`;
const request = (overrides = {}) => ({ reservationId: rid("r1"), caseId: "case1", owner: "logicrw", repository: "logicrw/demo", grantTokens: 6000, now: `${today}T23:50:00Z`, ...overrides });

test("reserve is immutable and idempotent without a second dispatch authorization", () => {
  const first = reserveQuota(null, request()), before = structuredClone(first.registry);
  assert.equal(first.ok, true); assert.equal(first.dispatchAuthorized, true);
  const second = reserveQuota(first.registry, request());
  assert.equal(second.status, "already-reserved"); assert.equal(second.dispatchAuthorized, false);
  assert.deepEqual(first.registry, before);
  assert.equal(reserveQuota(first.registry, request({ reservationId: rid("r2") })).status, "case-budget-exhausted");
  assert.equal(reserveQuota(first.registry, request({ caseId: "other" })).status, "reservation-conflict");
});

test("known settlement releases only unused grant and cannot increase the case allowance", () => {
  let registry = reserveQuota(null, request()).registry;
  registry = settleQuota(registry, { reservationId: rid("r1"), chargedTokens: 1000 }).registry;
  assert.equal(reserveQuota(registry, request({ reservationId: rid("r2"), grantTokens: 5000 })).status, "reserved");
  assert.equal(reserveQuota(registry, request({ reservationId: rid("r2"), grantTokens: 5001 })).status, "case-budget-exhausted");
  assert.equal(reserveQuota(registry, request({ reservationId: rid("r2"), owner: "other" })).status, "case-identity-conflict");
  assert.equal(settleQuota(registry, { reservationId: rid("r1"), chargedTokens: 999 }).status, "settlement-conflict");
});

test("unknown work remains full debt in its original UTC day across midnight", () => {
  let registry = reserveQuota(null, request()).registry;
  registry = settleQuota(registry, { reservationId: rid("r1"), chargedTokens: null }).registry;
  const next = { reservationId: rid("r2", "2026-10-10"), now: "2026-10-10T01:00:00Z" };
  assert.equal(reserveQuota(registry, request(next)).status, "case-budget-exhausted");
  const nextDay = reserveQuota(registry, request({ ...next, caseId: "case2" }));
  assert.equal(nextDay.status, "reserved");
  assert.equal(nextDay.registry.reservations[rid("r1")].day, today);
  const late = settleQuota(nextDay.registry, { reservationId: rid("r1"), chargedTokens: 500 });
  assert.equal(late.registry.reservations[rid("r1")].day, today);
  assert.equal(late.registry.reservations[next.reservationId].chargedTokens, null);
});

test("daily global, owner and repository caps report the next UTC boundary", () => {
  const registry = reserveQuota(null, request()).registry;
  for (const [scope, limits, changes] of [
    ["global", { global: 6000, owner: 12000, repository: 12000 }, { owner: "other", repository: "other/demo" }],
    ["owner", { global: 18000, owner: 6000, repository: 12000 }, { repository: "logicrw/second" }],
    ["repository", { global: 18000, owner: 12000, repository: 6000 }, {}],
  ]) {
    const result = reserveQuota(registry, request({ reservationId: rid(scope), caseId: scope, limits, ...changes }));
    assert.equal(result.status, "daily-quota-exhausted"); assert.equal(result.scope, scope);
    assert.equal(result.retryNotBefore, "2026-10-10T00:00:00.000Z");
  }
});

test("overrun retains its actual charge, then allows one verified recovery probe next UTC day", () => {
  const initial = reserveQuota(null, request());
  const overrun = settleQuota(initial.registry, { reservationId: rid("r1"), chargedTokens: 7200, now: `${today}T23:55:00Z` });
  assert.equal(overrun.status, "provider-budget-violation");
  assert.equal(overrun.registry.reservations[rid("r1")].chargedTokens, 7200);
  assert.equal(overrun.registry.fusedUntilUTC, "2026-10-10T00:00:00.000Z");
  assert.equal(reserveQuota(overrun.registry, request({ reservationId: rid("r2"), caseId: "case2" })).status, "quota-fused");
  const probeId = rid("probe", "2026-10-10");
  const probe = reserveQuota(overrun.registry, request({ reservationId: probeId, caseId: "probe", now: "2026-10-10T01:00:00Z" }));
  assert.equal(probe.status, "reserved"); assert.equal(probe.recoveryProbe, true);
  assert.equal(reserveQuota(probe.registry, request({ reservationId: rid("other", "2026-10-10"), caseId: "other", now: "2026-10-10T02:00:00Z" })).status, "quota-recovery-pending");
  const recovered = settleQuota(probe.registry, { reservationId: probeId, chargedTokens: 1000, now: "2026-10-10T03:00:00Z", accountingVerified: true });
  assert.equal(recovered.registry.fused, false);
  assert.equal(recovered.registry.reservations[rid("r1")].chargedTokens, 7200);
  assert.equal(validateQuotaRegistry(recovered.registry), true);
  assert.equal(reserveQuota(recovered.registry, request({ reservationId: rid("normal", "2026-10-10"), caseId: "normal", grantTokens: 5000, now: "2026-10-10T04:00:00Z" })).status, "reserved");
});

test("an unknown or crashed probe never refunds its case and only permits another probe next UTC day", () => {
  const fused = settleQuota(reserveQuota(null, request()).registry, { reservationId: rid("r1"), chargedTokens: 7000 }).registry;
  const probeId = rid("probe", "2026-10-10");
  let registry = reserveQuota(fused, request({ reservationId: probeId, caseId: "probe", now: "2026-10-10T01:00:00Z" })).registry;
  registry = settleQuota(registry, { reservationId: probeId, chargedTokens: null, now: "2026-10-10T02:00:00Z" }).registry;
  assert.equal(registry.fused, true);
  assert.equal(registry.reservations[probeId].chargedTokens, null);
  const next = reserveQuota(registry, request({ reservationId: rid("next-probe", "2026-10-11"), caseId: "next-probe", now: "2026-10-11T00:00:00Z" }));
  assert.equal(next.recoveryProbe, true);
  assert.equal(next.registry.reservations[probeId].chargedTokens, null);
});

test("new reservations require dated IDs while existing legacy IDs remain idempotent readbacks", () => {
  assert.equal(reserveQuota(null, request({ reservationId: "legacy-id" })).status, "stale-reservation");
  assert.equal(reserveQuota(null, request({ reservationId: rid("past", "2026-10-08") })).status, "stale-reservation");
  const seeded = reserveQuota(null, request()).registry;
  const legacy = { ...seeded, reservations: { legacy: seeded.reservations[rid("r1")] } };
  const replay = reserveQuota(legacy, request({ reservationId: "legacy" }));
  assert.equal(replay.status, "already-reserved"); assert.equal(replay.dispatchAuthorized, false);
});

test("default quota compaction retains unknown debt and removes only old settled rows", () => {
  const base = reserveQuota(null, request()).registry.reservations[rid("r1")];
  const registry = { ...createQuotaRegistry(), reservations: {
    [rid("old", "2026-09-09")]: { ...base, day: "2026-09-09", chargedTokens: 1000 },
    [rid("boundary", "2026-09-10")]: { ...base, day: "2026-09-10", chargedTokens: 1000 },
    [rid("current")]: { ...base, chargedTokens: 1000 },
    [rid("unknown", "2020-01-01")]: { ...base, day: "2020-01-01", chargedTokens: null },
  } };
  const original = structuredClone(registry), result = compactQuotaRegistry(registry, { now: `${today}T23:59:59Z` });
  assert.equal(result.removed, 1); assert.equal(result.cutoffDay, "2026-09-10");
  assert.equal(Object.hasOwn(result.registry.reservations, rid("unknown", "2020-01-01")), true);
  assert.deepEqual(registry, original);
  assert.equal(result.retiredBeforeUTC, "2026-09-10T00:00:00.000Z");
});

test("controller-authorized unknown GC restores row capacity without reviving retired IDs or refunds", () => {
  const base = reserveQuota(null, request()).registry.reservations[rid("r1")];
  const registry = { ...createQuotaRegistry(), reservations: Object.fromEntries(Array.from({ length: 10000 }, (_, i) =>
    [rid(`old-${i}`, "2020-01-01"), { ...base, caseId: `old-${i}`, day: "2020-01-01", chargedTokens: null }])) };
  const result = compactQuotaRegistry(registry, { now: `${today}T00:00:00Z`, permanentCaseAccounting: true });
  assert.equal(result.removed, 10000);
  assert.equal(reserveQuota(result.registry, request()).status, "reserved");
  const oldId = rid("old-1", "2020-01-01");
  assert.equal(reserveQuota(result.registry, request({ reservationId: oldId })).status, "stale-reservation");
  assert.equal(settleQuota(result.registry, { reservationId: oldId, chargedTokens: 0 }).status, "stale-reservation");
  const backwards = compactQuotaRegistry(result.registry, { now: "2026-09-01T00:00:00Z", permanentCaseAccounting: true });
  assert.equal(backwards.retiredBeforeUTC, result.retiredBeforeUTC);
});

test("GC preserves fuse recovery state rather than silently clearing old violations", () => {
  const oldDay = "2026-01-01", oldId = rid("old", oldDay);
  const initial = reserveQuota(null, request({ reservationId: oldId, now: `${oldDay}T00:00:00Z` }));
  const fused = settleQuota(initial.registry, { reservationId: oldId, chargedTokens: 7000 }).registry;
  const result = compactQuotaRegistry(fused, { now: `${today}T00:00:00Z`, permanentCaseAccounting: true });
  assert.equal(result.removed, 1); assert.equal(result.registry.fused, true);
  const probe = reserveQuota(result.registry, request({ reservationId: rid("new"), caseId: "new" }));
  assert.equal(probe.recoveryProbe, true);
});

test("malformed limits, dates and unbounded retention fail without mutation", () => {
  const initial = reserveQuota(null, request());
  assert.equal(reserveQuota(initial.registry, request({ reservationId: rid("r2"), caseId: "case2", limits: { global: Infinity, owner: 1, repository: 1 } })).status, "invalid-quota-input");
  assert.equal(settleQuota(initial.registry, { reservationId: rid("r1"), chargedTokens: Infinity }).status, "invalid-charge");
  const corrupt = structuredClone(initial.registry); corrupt.reservations[rid("r1")].day = "2026-02-31";
  assert.equal(validateQuotaRegistry(corrupt), false);
  for (const retentionDays of [0, -1, 1.5, 366, Infinity, "30"])
    assert.equal(compactQuotaRegistry(initial.registry, { now: `${today}T00:00:00Z`, retentionDays }).status, "invalid-quota-compaction");
  assert.equal(initial.registry.reservations[rid("r1")].chargedTokens, null);
});
