import { createHash } from "node:crypto";

export const REVIEW_BUDGET = Object.freeze({
  version: 2, caseTokens: 16000, maxHTTPAttempts: 3, maxSemanticRounds: 2,
  framingReserve: 128, normalTargetTokens: 4000, reasoningTargetTokens: 6000,
  normalOutputTokens: 512, reasoningOutputTokens: 2048, maxMessagesBytes: 5120,
});
const integer = (n) => Number.isSafeInteger(n) && n >= 0;
const bounded = (n) => Math.min(Number.MAX_SAFE_INTEGER, Math.ceil(n));
export const requestDigest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** A conservative estimate, not an exact hosted tokenizer or billing cap.
 * CJK text is counted by code point rather than its inflated UTF-8 byte length.
 * Local counters may increase the reservation, but cannot erase its estimate floor.
 * Reported provider usage remains authoritative; overruns stop further dispatch. */
export function requestBudget(messages, phase, tokenCount = null) {
  const encoded = JSON.stringify(messages);
  let characterEstimate = 0;
  for (const char of encoded) {
    characterEstimate += char.codePointAt(0) < 128 ? 0.3
      : /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(char) ? 1
        : Buffer.byteLength(char) * 0.75;
  }
  const outputTokenLimit = phase === 2 ? REVIEW_BUDGET.reasoningOutputTokens : REVIEW_BUDGET.normalOutputTokens;
  const inputUtf8Bytes = Buffer.byteLength(encoded);
  const counted = Boolean(tokenCount && integer(tokenCount.tokens) && tokenCount.tokens > 0 &&
    typeof tokenCount.tokenizer === "string" && tokenCount.tokenizer.trim().length > 0 && tokenCount.tokenizer.length <= 100);
  const estimatedInputTokens = bounded(counted ? tokenCount.tokens : characterEstimate);
  const reservedInputTokens = bounded(Math.max(characterEstimate, estimatedInputTokens) * 1.2);
  return {
    inputUtf8Bytes, estimatedInputTokens, reservedInputTokens, outputTokenLimit,
    reservedTokens: bounded(reservedInputTokens + REVIEW_BUDGET.framingReserve + outputTokenLimit),
    estimatedTotalTokens: bounded(estimatedInputTokens + REVIEW_BUDGET.framingReserve + outputTokenLimit),
    targetTokens: phase === 2 ? REVIEW_BUDGET.reasoningTargetTokens : REVIEW_BUDGET.normalTargetTokens,
    counting: counted ? "local-tokenizer-with-conservative-reserve" : "conservative-character-estimate",
    localTokenizer: counted ? tokenCount.tokenizer : null,
    tokenizerVerified: counted && tokenCount.verifiedAgainstProvider === true,
    exactProviderBillingCap: false,
  };
}

/** Version 1 authorizations retain their original 6000-token lifetime ceiling.
 * Only new version 2 cases receive the new policy; reading old counters never
 * upgrades, resets or refunds them, including unknown work and exhausted cases. */
export function validateBudgetLedger(ledger, { caseId, allowOverrun = false } = {}) {
  const limit = ledger?.version === 1 ? 6000 : ledger?.version === REVIEW_BUDGET.version ? REVIEW_BUDGET.caseTokens : null;
  return Boolean(ledger && Object.keys(ledger).sort().join(",") === "caseId,chargedTokens,httpAttempts,limitTokens,semanticRounds,version" &&
    limit !== null && ledger.limitTokens === limit && typeof ledger.caseId === "string" && /^[\w:.-]{1,200}$/.test(ledger.caseId) &&
    (!caseId || ledger.caseId === caseId) && integer(ledger.chargedTokens) && (allowOverrun || ledger.chargedTokens <= limit) &&
    integer(ledger.httpAttempts) && ledger.httpAttempts <= REVIEW_BUDGET.maxHTTPAttempts &&
    integer(ledger.semanticRounds) && ledger.semanticRounds <= REVIEW_BUDGET.maxSemanticRounds);
}

export function createBudgetAccount({ budgetLedger, budgetGrant, caseId, expectedReservationId, allowUnreserved = false }) {
  const base = budgetLedger ?? {
    version: REVIEW_BUDGET.version, caseId, limitTokens: REVIEW_BUDGET.caseTokens, chargedTokens: 0, httpAttempts: 0, semanticRounds: 0,
  };
  if (!validateBudgetLedger(base, { caseId })) return null;
  if (!budgetGrant && !allowUnreserved) return null;
  const baseline = { chargedTokens: base.chargedTokens, httpAttempts: base.httpAttempts, semanticRounds: base.semanticRounds };
  const grant = budgetGrant ?? { caseId: base.caseId, reservationId: "local-only", grantTokens: base.limitTokens - base.chargedTokens, baseline };
  if (!grant || typeof grant.reservationId !== "string" || !/^[\w:.-]{1,200}$/.test(grant.reservationId) ||
      grant.caseId !== base.caseId || (budgetGrant && (!caseId || expectedReservationId !== grant.reservationId)) ||
      !grant.baseline || Object.keys(baseline).some((key) => grant.baseline[key] !== baseline[key]) ||
      !integer(grant.grantTokens) || grant.grantTokens > base.limitTokens - base.chargedTokens) return null;
  const ledger = { ...base };
  return { ledger, grant: { caseId: grant.caseId, reservationId: grant.reservationId, grantTokens: grant.grantTokens, baseline },
    baseChargedTokens: base.chargedTokens, durableReservation: Boolean(budgetGrant), accountingOverrun: false };
}

export function remainingTokens(account) {
  if (account.accountingOverrun) return 0;
  return Math.max(0, Math.min(account.ledger.limitTokens - account.ledger.chargedTokens,
    account.grant.grantTokens - (account.ledger.chargedTokens - account.baseChargedTokens)));
}

export function reserveRequest(account, budget) {
  if (account.accountingOverrun || account.ledger.httpAttempts >= REVIEW_BUDGET.maxHTTPAttempts ||
      account.ledger.semanticRounds >= REVIEW_BUDGET.maxSemanticRounds ||
      !integer(budget.reservedTokens) || budget.reservedTokens <= 0 || budget.reservedTokens > remainingTokens(account)) return false;
  account.ledger.httpAttempts++;
  account.ledger.chargedTokens += budget.reservedTokens;
  return true;
}

export function settleRequest(account, reservedTokens, usage) {
  if (usage.status !== "reported") return;
  if (usage.totalTokens > reservedTokens) {
    // Retain the observed charge even above the cap, and stop this account.
    account.accountingOverrun = true;
  }
  account.ledger.chargedTokens -= reservedTokens - usage.totalTokens;
}
