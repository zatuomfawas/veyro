// Counsel's two worked cases, encoded literally.
//
// The fee rule is the one place where the Terms make an arithmetic promise to
// a founder, and it is not the obvious one: a refund lowers what later
// payments owe without returning what has already been taken. That ratchet is
// easy to "simplify" into something that silently refunds, so both cases
// counsel wrote out are pinned here exactly as they wrote them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeOnPaymentMinor, qmeMonthKey, mayCollectFee, FEES_EFFECTIVE_AT } from "../lib/pricing.ts";

test("counsel case one: a refund does not return the fee, and the next charge tops up", () => {
  // $150 charge -> QME $150 -> fee $1.50
  const first = feeOnPaymentMinor(15000, 0);
  assert.equal(first, 150);

  // $50 refund. The fee already incurred stays $1.50; QME is now $100.
  const collected = first;

  // $60 charge -> QME $160 -> total due $1.80 -> this charge carries $0.30
  const second = feeOnPaymentMinor(16000, collected);
  assert.equal(second, 30);
  assert.equal(collected + second, 180);
});

test("counsel case two: a larger refund means the next charge carries nothing", () => {
  // $150 -> $1.50
  const first = feeOnPaymentMinor(15000, 0);
  assert.equal(first, 150);

  // $100 refund, then a $60 charge -> QME $110 -> due $0.30.
  // $1.50 is already collected, so this charge carries $0.00 -- and the
  // difference is NOT refunded.
  const second = feeOnPaymentMinor(11000, first);
  assert.equal(second, 0);
});

test("the ratchet never produces a credit", () => {
  for (const [qme, collected] of [[0, 150], [5000, 150], [10000, 900], [12000, 5000]]) {
    assert.ok(feeOnPaymentMinor(qme, collected) >= 0);
  }
});

test("the calendar month is UTC, not local", () => {
  // 31 Oct 2026, 23:30 UTC is still October in UTC, whatever the local clock
  // says anywhere else.
  assert.equal(qmeMonthKey(Date.UTC(2026, 9, 31, 23, 30) / 1000), "2026-10");
  // One minute past midnight UTC is the next month.
  assert.equal(qmeMonthKey(Date.UTC(2026, 10, 1, 0, 1) / 1000), "2026-11");
});

test("no fee can be taken before the Terms take effect", () => {
  // The flag is on now, so the date is the only thing holding the line --
  // which is exactly why it exists as a separate lock.
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT - 1000), false);
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT - 1), false);
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT), true);
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT + 1000), true);
});

test("the effective date is 15 October 2026 at 00:00 UTC", () => {
  // The same instant the Terms give as their Effective Date. If one moves
  // without the other, a fee is taken under a document not yet in force.
  assert.equal(new Date(FEES_EFFECTIVE_AT).toISOString(), "2026-10-15T00:00:00.000Z");
});
