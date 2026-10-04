// The pricing page now computes its own figures rather than stating them, so
// the arithmetic is worth a test: a slider that is wrong is worse than a
// sentence that is wrong, because it is wrong in a thousand positions.
import { test } from "node:test";
import assert from "node:assert/strict";
import { feeMinor, EXAMPLE_EARNINGS_MINOR } from "../lib/pricing.ts";

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

test("the worked examples on /pricing are the figures we claim", () => {
  // $50 -> $0, $100 -> $0, $200 -> $3, $500 -> $12, $1,000 -> $27.
  const expected = [0, 0, 300, 1200, 2700];
  assert.deepEqual(EXAMPLE_EARNINGS_MINOR.map(feeMinor), expected);
});

test("the free floor is inclusive, so $100 exactly costs nothing", () => {
  // The page says "free under $100" and the examples show $100 at zero. Both
  // are true only if the floor is inclusive, which is worth pinning down.
  assert.equal(feeMinor(10000), 0);
  // And the charge starts above it. Not at $100.01, though: 3% of one cent
  // rounds to nothing, so the first few cents over the line are still free.
  // That is the rounding being generous in the reader's favour, which is the
  // right direction for it to err, but it means "above $100 you pay" is only
  // true from about $100.17 and the page should not promise otherwise.
  assert.equal(feeMinor(10001), 0);
  assert.ok(feeMinor(10100) > 0);
});
