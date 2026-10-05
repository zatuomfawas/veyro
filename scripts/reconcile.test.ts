// The reconciliation rule, as arithmetic.
//
// The asymmetry is the part worth pinning: a month with no refunds must match
// exactly, and a month with refunds may legitimately show MORE collected than
// the final QME implies, because the fee ratchets and the refund does not
// return it. Getting that backwards would either raise false alarms on every
// refunded month or hide genuine undercharging.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeMinor } from "../lib/pricing.ts";

/** The predicate lib/reconcile.ts applies, isolated so it can be tested. */
const ok = (collected: number, qme: number, hadReductions: boolean) =>
  hadReductions ? collected >= feeMinor(qme) : collected === feeMinor(qme);

test("a clean month must match exactly", () => {
  assert.equal(ok(feeMinor(20000), 20000, false), true);
  assert.equal(ok(feeMinor(20000) - 1, 20000, false), false);
  assert.equal(ok(feeMinor(20000) + 1, 20000, false), false);
});

test("a refunded month may have collected more than the final QME implies", () => {
  // Earned $200 (fee $3.00), then refunded $100 so QME is $100 and due is $0.
  // The $3.00 stays collected, and that is correct, not a discrepancy.
  assert.equal(ok(300, 10000, true), true);
});

test("undercharging is still caught in a refunded month", () => {
  // QME $200 means $3.00 due. Only $1.00 collected is a genuine shortfall
  // whether or not a refund happened.
  assert.equal(ok(100, 20000, true), false);
});

test("a month that earned nothing owes nothing", () => {
  assert.equal(ok(0, 0, false), true);
  assert.equal(ok(0, 5000, false), true);
});
