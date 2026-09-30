// Tests for the starter product's name. Run with `npm test`.
//
// The subject is the pure half of the feature. Creating the row needs Prisma
// and a database; deciding what to call it does not, and the naming is where
// the behaviour someone would notice actually lives.

import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultProductName } from "../lib/product-rules.ts";

test("uses the founder's first name", () => {
  assert.equal(defaultProductName("Zat Fawas"), "Zat's first product");
  assert.equal(defaultProductName("Maya"), "Maya's first product");
});

test("a name already ending in s takes a bare apostrophe", () => {
  assert.equal(defaultProductName("Chris"), "Chris' first product");
  assert.equal(defaultProductName("jos"), "jos' first product");
});

test("falls back when there is no usable name", () => {
  // A blank name is not hypothetical: the column is a string, and a row that
  // arrived with whitespace in it would otherwise produce "'s first product".
  for (const v of [undefined, null, "", "   "]) {
    assert.equal(defaultProductName(v), "Your first product");
  }
});

test("ignores surrounding and repeated whitespace", () => {
  assert.equal(defaultProductName("  Zat   Fawas "), "Zat's first product");
});
