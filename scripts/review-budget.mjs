import { createHash } from "node:crypto";

export const REVIEW_BUDGET = Object.freeze({
  version: 1, caseTokens: 6000, maxHTTPAttempts: 3, maxSemanticRounds: 2,
  framingReserve: 128, normalTargetTokens: 2000, reasoningTargetTokens: 4000,
  normalOutputTokens: 512, reasoningOutputTokens: 2048, maxMessagesBytes: 5120,
});
const integer = (n) => Number.isSafeInteger(n) && n >= 0;
export const requestDigest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** UTF-8 reservation is deliberately separate from the model-specific estimate.
 * Neither is advertised as an exact hosted-provider tokenizer or billing cap. */
export function requestBudget(messages, phase, tokenCount = null) {
  const encoded = JSON.stringify(messages);
  let estimated = 0;
  for (const char of encoded) {
    estimated += /\p{Script=Han}/u.test(char) ? 0.6 : char.codePointAt(0) < 128 ? 0.3 : Buffer.byteLength(char);
  }
  const outputTokenLimit = phase === 2 ? REVIEW_BUDGET.reasoningOutputTokens : REVIEW_BUDGET.normalOutputTokens;
  const inputUtf8Bytes = Buffer.byteLength(encoded);
  const counted = Boolean(tokenCount && integer(tokenCount.tokens) && typeof tokenCount.tokenizer === "string" && tokenCount.tokenizer.length <= 100);
  if (counted) estimated = tokenCount.tokens;
  return {
    inputUtf8Bytes, estimatedInputTokens: Math.ceil(estimated), outputTokenLimit,
    reservedTokens: inputUtf8Bytes + REVIEW_BUDGET.framingReserve + outputTokenLimit,
    estimatedTotalTokens: Math.ceil(estimated) + REVIEW_BUDGET.framingReserve + outputTokenLimit,
    targetTokens: phase === 2 ? REVIEW_BUDGET.reasoningTargetTokens : REVIEW_BUDGET.normalTargetTokens,
    counting: counted ? "utf8-reservation-and-local-tokenizer" : "utf8-reservation-and-character-estimate",
    localTokenizer: counted ? tokenCount.tokenizer : null,
    tokenizerVerified: counted && tokenCount.verifiedAgainstProvider === true,
    exactProviderBillingCap: false,
  };
}

export function createBudgetAccount({ budgetLedger, budgetGrant, caseId, expectedReservationId, allowUnreserved = false }) {
  const base = budgetLedger ?? {
    version: 1, caseId, limitTokens: 6000, chargedTokens: 0, httpAttempts: 0, semanticRounds: 0,
  };
  if (!base || (caseId && base.caseId !== caseId) || base.version !== 1 || typeof base.caseId !== "string" || !/^[\w:.-]{1,200}$/.test(base.caseId) ||
      base.limitTokens !== 6000 || !integer(base.chargedTokens) || base.chargedTokens > 6000 ||
      !integer(base.httpAttempts) || base.httpAttempts > 3 || !integer(base.semanticRounds) || base.semanticRounds > 2)
    return null;
  if (!budgetGrant && !allowUnreserved) return null;
  const baseline = { chargedTokens: base.chargedTokens, httpAttempts: base.httpAttempts, semanticRounds: base.semanticRounds };
  const grant = budgetGrant ?? { caseId: base.caseId, reservationId: "local-only", grantTokens: 6000 - base.chargedTokens, baseline };
  if (!grant || typeof grant.reservationId !== "string" || !/^[\w:.-]{1,200}$/.test(grant.reservationId) ||
      grant.caseId !== base.caseId || (budgetGrant && (!caseId || expectedReservationId !== grant.reservationId)) ||
      !grant.baseline || Object.keys(baseline).some((key) => grant.baseline[key] !== baseline[key]) ||
      !integer(grant.grantTokens) || grant.grantTokens > 6000 - base.chargedTokens) return null;
  const ledger = { version: 1, caseId: base.caseId, limitTokens: 6000,
    chargedTokens: base.chargedTokens, httpAttempts: base.httpAttempts, semanticRounds: base.semanticRounds };
  return { ledger, grant: { caseId: grant.caseId, reservationId: grant.reservationId, grantTokens: grant.grantTokens, baseline },
    baseChargedTokens: base.chargedTokens, durableReservation: Boolean(budgetGrant), accountingOverrun: false };
}

export function remainingTokens(account) {
  return Math.max(0, Math.min(account.ledger.limitTokens - account.ledger.chargedTokens,
    account.grant.grantTokens - (account.ledger.chargedTokens - account.baseChargedTokens)));
}

export function reserveRequest(account, budget) {
  if (account.ledger.httpAttempts >= REVIEW_BUDGET.maxHTTPAttempts ||
      !integer(budget.reservedTokens) || budget.reservedTokens > remainingTokens(account)) return false;
  account.ledger.httpAttempts++;
  account.ledger.chargedTokens += budget.reservedTokens;
  return true;
}

export function settleRequest(account, reservedTokens, usage) {
  if (usage.status !== "reported") return;
  if (usage.totalTokens > reservedTokens) {
    // The provider violated the assumed upper reservation. Preserve the actual
    // charge even if it exceeds the cap; the caller must stop and report it.
    account.accountingOverrun = true;
  }
  account.ledger.chargedTokens -= reservedTokens - usage.totalTokens;
}
