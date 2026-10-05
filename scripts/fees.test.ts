// The fee engine's arithmetic, including the cases the Terms turn on.
//
// These test the pure functions. The locking and the webhook paths need a
// database and are covered by the end-to-end run; what is here is the part
// that must never drift, because it decides what a founder is charged.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeMinor, feeOnPaymentMinor, qmeMonthKey, mayCollectFee, FEES_EFFECTIVE_AT }
  from "../lib/pricing.ts";

const run = (payments: number[]) => {
  let qme = 0, collected = 0;
  const fees: number[] = [];
  for (const p of payments) {
    qme += p;
    const f = feeOnPaymentMinor(qme, collected);
    collected += f;
    fees.push(f);
  }
  return { fees, qme, collected };
};

test("below the limit nothing is ever charged", () => {
  const { fees, collected } = run([2000, 3000, 4000]); // $90 total
  assert.deepEqual(fees, [0, 0, 0]);
  assert.equal(collected, 0);
});

test("exactly at the limit is still free", () => {
  const { collected } = run([5000, 5000]); // $100
  assert.equal(collected, 0);
});

test("a payment that crosses the limit is charged only on the part above it", () => {
  // $60 then $80: QME $140, so $40 is chargeable -> $1.20
  const { fees, collected } = run([6000, 8000]);
  assert.deepEqual(fees, [0, 120]);
  assert.equal(collected, 120);
  assert.equal(collected, feeMinor(14000));
});

test("well above the limit, the running total always equals due(QME)", () => {
  const { collected, qme } = run([50000, 25000, 25000, 100000]);
  assert.equal(collected, feeMinor(qme));
});

test("a refund after the threshold lowers QME without returning the fee", () => {
  // Counsel's case one.
  let qme = 15000;
  const collected = feeOnPaymentMinor(qme, 0);
  assert.equal(collected, 150);

  qme -= 5000;                      // $50 refunded -> QME $100
  assert.equal(collected, 150);     // nothing returned

  qme += 6000;                      // $60 charge -> QME $160
  const next = feeOnPaymentMinor(qme, collected);
  assert.equal(next, 30);           // $1.80 due, $1.50 taken
});

test("a dispute lost behaves exactly like a refund for the fee", () => {
  // The Terms treat refunds, reversals and chargebacks identically here, so
  // the arithmetic must not care which one happened.
  let qme = 20000;
  const collected = feeOnPaymentMinor(qme, 0);
  assert.equal(collected, 300);
  qme -= 12000;                     // $120 charged back -> QME $80
  assert.equal(feeOnPaymentMinor(qme, collected), 0);
});

test("rounding is always down, in the founder's favour", () => {
  // $100.33 -> 33c over -> 0.99c -> floors to 0. Never rounds up to 1.
  assert.equal(feeMinor(10033), 0);
  // $101.00 -> 100c over -> exactly 3.
  assert.equal(feeMinor(10100), 3);
  // A figure that would round up under half-up rounding.
  assert.equal(feeMinor(10084), 2); // 84 * 0.03 = 2.52 -> 2
});

test("the month boundary is UTC and keyed on Stripe's timestamp", () => {
  assert.equal(qmeMonthKey(Date.UTC(2026, 9, 31, 23, 59, 59) / 1000), "2026-10");
  assert.equal(qmeMonthKey(Date.UTC(2026, 10, 1, 0, 0, 0) / 1000), "2026-11");
});

test("no fee can be taken before 15 October 2026", () => {
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT - 1), false);
  assert.equal(mayCollectFee(FEES_EFFECTIVE_AT), true);
  assert.equal(new Date(FEES_EFFECTIVE_AT).toISOString(), "2026-10-15T00:00:00.000Z");
});

test("a simulated race cannot produce two under-limit decisions", () => {
  // What the row lock prevents, expressed as arithmetic: whatever order two
  // charges are applied in, the total collected is the same and equals due().
  const a = 6000, b = 8000;
  const order1 = run([a, b]);
  const order2 = run([b, a]);
  assert.equal(order1.collected, order2.collected);
  assert.equal(order1.collected, feeMinor(a + b));
});
