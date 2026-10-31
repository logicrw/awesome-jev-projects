import test from 'node:test';
import assert from 'node:assert/strict';
import { REVIEW_BUDGET, requestBudget, createBudgetAccount, validateBudgetLedger, remainingTokens, reserveRequest, settleRequest } from '../scripts/review-budget.mjs';
import { DEFAULT_QUOTA_LIMITS } from '../scripts/budget-quota.mjs';

const messagesOf = (text) => [{ role: 'user', content: text }];
function fiveKB(char) {
  const overhead = Buffer.byteLength(JSON.stringify(messagesOf('')));
  return messagesOf(char.repeat(Math.floor((5120 - overhead) / Buffer.byteLength(char))));
}

test('5KB ASCII and CJK payloads reserve estimated tokens with margin instead of one token per byte', () => {
  assert.equal(REVIEW_BUDGET.caseTokens, 16000);
  assert.deepEqual(DEFAULT_QUOTA_LIMITS, { global: 120000, owner: 24000, repository: 16000 });
  for (const char of ['a', '中', 'あ', '한']) {
    const budget = requestBudget(fiveKB(char), 1);
    assert.ok(budget.inputUtf8Bytes >= 5117 && budget.inputUtf8Bytes <= 5120);
    assert.ok(budget.reservedTokens < 3000, `${char}: ${budget.reservedTokens}`);
    assert.ok(budget.reservedInputTokens >= Math.ceil(budget.estimatedInputTokens * 1.2));
    assert.equal(budget.reservedTokens, budget.reservedInputTokens + REVIEW_BUDGET.framingReserve + REVIEW_BUDGET.normalOutputTokens);
    assert.equal(budget.exactProviderBillingCap, false);
    assert.equal(budget.tokenizerVerified, false);
  }
  const emoji = requestBudget(fiveKB('😀'), 1);
  assert.ok(emoji.reservedInputTokens > requestBudget(fiveKB('a'), 1).reservedInputTokens, 'uncommon Unicode keeps a larger estimate');
  assert.ok(emoji.reservedTokens < emoji.inputUtf8Bytes + REVIEW_BUDGET.framingReserve + emoji.outputTokenLimit);
});

test('local tokenizer counts cannot erase the conservative floor and large counts fail closed', () => {
  const messages = fiveKB('a'), fallback = requestBudget(messages, 1);
  for (const verifiedAgainstProvider of [false, true]) {
    const lower = requestBudget(messages, 1, { tokens: 1, tokenizer: 'local-fixture', verifiedAgainstProvider });
    assert.equal(lower.reservedTokens, fallback.reservedTokens);
    assert.equal(lower.tokenizerVerified, verifiedAgainstProvider);
  }
  const higher = requestBudget(messages, 1, { tokens: 3000, tokenizer: 'local-fixture' });
  assert.equal(higher.estimatedInputTokens, 3000);
  assert.equal(higher.reservedInputTokens, 3600);
  for (const invalid of [{ tokens: 0, tokenizer: 'x' }, { tokens: -1, tokenizer: 'x' }, { tokens: Infinity, tokenizer: 'x' },
    { tokens: '100', tokenizer: 'x' }, { tokens: 100, tokenizer: ' ' }, { tokens: 100, tokenizer: 'x'.repeat(101) }])
    assert.equal(requestBudget(messages, 1, invalid).reservedTokens, fallback.reservedTokens);
  const extreme = requestBudget(messages, 1, { tokens: Number.MAX_SAFE_INTEGER, tokenizer: 'local-fixture' });
  assert.equal(extreme.reservedTokens, Number.MAX_SAFE_INTEGER);
  assert.equal(reserveRequest(createBudgetAccount({ caseId: 'large-counter', allowUnreserved: true }), extreme), false);
});

test('two 5KB rounds with unknown usage retain their full debt and fit a new case grant', () => {
  const account = createBudgetAccount({ caseId: 'two-rounds', allowUnreserved: true });
  let reserved = 0;
  for (const phase of [1, 2]) {
    const budget = requestBudget(fiveKB('中'), phase);
    assert.equal(reserveRequest(account, budget), true);
    settleRequest(account, budget.reservedTokens, { status: 'unknown' });
    account.ledger.semanticRounds++;
    reserved += budget.reservedTokens;
  }
  assert.equal(account.ledger.version, 2);
  assert.equal(account.ledger.chargedTokens, reserved);
  assert.ok(reserved < REVIEW_BUDGET.caseTokens);
  assert.equal(account.ledger.httpAttempts, 2);
  assert.equal(reserveRequest(account, { reservedTokens: 1 }), false, 'a spare HTTP attempt cannot buy a third semantic round');
});

test('legacy ledgers keep their original allowance and invalid version-limit pairs cannot mint tokens', () => {
  const legacy = { version: 1, caseId: 'legacy', limitTokens: 6000, chargedTokens: 2400, httpAttempts: 1, semanticRounds: 0 };
  const account = createBudgetAccount({ budgetLedger: legacy, caseId: legacy.caseId, allowUnreserved: true });
  assert.deepEqual(account.ledger, legacy);
  assert.equal(remainingTokens(account), 3600);
  for (const changed of [{ version: 1, limitTokens: 16000 }, { version: 2, limitTokens: 6000 }, { version: 3, limitTokens: 16000 }]) {
    const ledger = { ...legacy, ...changed };
    assert.equal(validateBudgetLedger(ledger), false);
    assert.equal(createBudgetAccount({ budgetLedger: ledger, caseId: ledger.caseId, allowUnreserved: true }), null);
  }
});

test('a request overrun below the case ceiling retains actual usage and blocks all further reservations', () => {
  const account = createBudgetAccount({ caseId: 'overrun', allowUnreserved: true });
  assert.equal(reserveRequest(account, { reservedTokens: 1000 }), true);
  settleRequest(account, 1000, { status: 'reported', totalTokens: 1001 });
  assert.equal(account.ledger.chargedTokens, 1001);
  assert.equal(account.accountingOverrun, true);
  assert.equal(remainingTokens(account), 0);
  assert.equal(reserveRequest(account, { reservedTokens: 1 }), false);
});
