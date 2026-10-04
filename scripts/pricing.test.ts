// The pricing page now computes its own figures rather than stating them, so
// the arithmetic is worth a test: a slider that is wrong is worse than a
// sentence that is wrong, because it is wrong in a thousand positions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeMinor } from "../lib/pricing.ts";

test("nothing is charged at or below the free floor", () => {
  assert.equal(feeMinor(0), 0);
  assert.equal(feeMinor(5000), 0);
  assert.equal(feeMinor(10000), 0);
});

test("only the amount above the floor is charged", () => {
  // $400 earned -> $300 over -> $9.00, the figure the copy has always used.
  assert.equal(feeMinor(40000), 900);
  // One cent over the floor is one cent charged at 3%, rounded.
  assert.equal(feeMinor(10100), 3);
});

test("the effective rate never reaches the headline rate", () => {
  for (const earned of [10001, 20000, 50000, 100000, 1000000]) {
    const eff = feeMinor(earned) / earned;
    assert.ok(eff < 0.03, `${earned} gave ${eff}`);
  }
});
