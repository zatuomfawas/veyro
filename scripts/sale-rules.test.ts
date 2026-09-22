// Tests for the rules that decide whether a stranger can be charged.
//
// These matter more than most. The draft preview tells a founder whether their
// product will sell once published, and resolvePurchasable decides whether the
// real checkout renders a form. Both now call saleBlockers, so a wrong answer
// here is wrong in two places at once — which is exactly why it is one function
// and exactly why it is tested.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  saleBlockers, REASON_TEXT, OWNER_REASON_TEXT,
  type SellerAccount,
} from "../lib/sale-rules.ts";

const ready: SellerAccount = { providerAccountId: "acct_123", status: "ACTIVE" };

test("a priced product on an active account has nothing wrong with it", () => {
  assert.deepEqual(saleBlockers({ priceMinor: 500, currency: "USD" }, ready), []);
});

test("no price is reported, and the minimum check does not also fire", () => {
  // Both would be true of a zero price, but "set a price" is the only useful
  // instruction. Reporting both would have the founder fixing one thing twice.
  const out = saleBlockers({ priceMinor: 0, currency: "USD" }, ready);
  assert.deepEqual(out, ["price_not_set"]);
});

test("a negative price is a missing price, not a tiny one", () => {
  assert.deepEqual(saleBlockers({ priceMinor: -100, currency: "USD" }, ready), ["price_not_set"]);
});

test("the card network minimum is per currency, not a flat 50", () => {
  // 40 is under the USD floor of 50 but over the GBP floor of 30. A flat
  // minimum would wrongly block the GBP product.
  assert.deepEqual(saleBlockers({ priceMinor: 40, currency: "USD" }, ready), ["price_below_minimum"]);
  assert.deepEqual(saleBlockers({ priceMinor: 40, currency: "GBP" }, ready), []);
});

test("currencies with a much higher floor are respected", () => {
  assert.deepEqual(saleBlockers({ priceMinor: 500, currency: "MXN" }, ready), ["price_below_minimum"]);
  assert.deepEqual(saleBlockers({ priceMinor: 1000, currency: "MXN" }, ready), []);
});

test("exactly the minimum is allowed", () => {
  // `<` not `<=`: an off-by-one here refuses a perfectly chargeable price.
  assert.deepEqual(saleBlockers({ priceMinor: 50, currency: "USD" }, ready), []);
  assert.deepEqual(saleBlockers({ priceMinor: 30, currency: "GBP" }, ready), []);
});

test("an unknown currency falls back to 50 rather than allowing anything", () => {
  assert.deepEqual(saleBlockers({ priceMinor: 10, currency: "XYZ" }, ready), ["price_below_minimum"]);
  assert.deepEqual(saleBlockers({ priceMinor: 60, currency: "XYZ" }, ready), []);
});

test("currency case does not change the answer", () => {
  assert.deepEqual(saleBlockers({ priceMinor: 40, currency: "gbp" }, ready), []);
  assert.deepEqual(saleBlockers({ priceMinor: 40, currency: "usd" }, ready), ["price_below_minimum"]);
});

test("an account that is missing, unconnected or not active blocks the sale", () => {
  const priced = { priceMinor: 500, currency: "USD" };
  assert.deepEqual(saleBlockers(priced, null), ["payments_not_set_up"]);
  assert.deepEqual(saleBlockers(priced, { providerAccountId: null, status: "ACTIVE" }), ["payments_not_set_up"]);
  for (const status of ["PENDING", "RESTRICTED", "REQUIREMENTS_DUE", "DISCONNECTED", "NOT_STARTED"]) {
    assert.deepEqual(
      saleBlockers(priced, { providerAccountId: "acct_1", status }),
      ["payments_not_set_up"],
      `status ${status} must not be treated as ready`,
    );
  }
});

test("several problems are all reported, price first", () => {
  // The founder should see everything standing between them and a sale, not be
  // sent back round the loop discovering one at a time.
  assert.deepEqual(
    saleBlockers({ priceMinor: 0, currency: "USD" }, null),
    ["price_not_set", "payments_not_set_up"],
  );
});

test("status is not judged here", () => {
  // A draft is unpublished, not broken. If this started returning
  // product_not_live the preview would bury the real problems under it.
  const out = saleBlockers({ priceMinor: 500, currency: "USD" }, ready);
  assert.ok(!out.includes("product_not_live"));
});

test("every reason has text for both audiences", () => {
  // A blocker with no sentence renders as a blank notice.
  const reasons = [
    "product_not_found", "product_not_live", "price_not_set",
    "price_below_minimum", "payments_not_set_up",
  ] as const;
  for (const r of reasons) {
    assert.ok(REASON_TEXT[r]?.length > 0, `${r} has customer text`);
    assert.ok(OWNER_REASON_TEXT[r]?.length > 0, `${r} has owner text`);
    assert.notEqual(
      REASON_TEXT[r], OWNER_REASON_TEXT[r],
      `${r}: the owner wording should not just repeat the customer wording`,
    );
  }
});

test("owner wording never calls the founder a seller in the third person", () => {
  // "This seller hasn't finished setting up payments" is the wrong sentence to
  // show someone looking at their own draft.
  for (const text of Object.values(OWNER_REASON_TEXT)) {
    assert.ok(!/\bseller\b/i.test(text), `owner text should not say "seller": ${text}`);
  }
});
