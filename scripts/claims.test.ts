// The everyone-list on /pricing must be things that exist.
//
// This page has been wrong in both directions: once gating real features
// behind a paid tier, then promising enhanced ones to everybody. The failure
// mode that matters now is marketing a feature nobody has built, so each line
// of the free list is pinned to the code that implements it. Delete the
// implementation and this test fails before the claim reaches a founder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : "");

/**
 * Source with its comments stripped.
 *
 * The first run of this test failed on the comment explaining why tax forms
 * are absent, which is the opposite of a tax claim. A check for what a page
 * tells a founder has to read what it renders, not what it says to the next
 * developer.
 */
const claims = (p: string) =>
  read(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

test("guardian verification and account setup is implemented", () => {
  const acct = read("lib/stripe-account.ts");
  assert.match(acct, /ConnectStatus/);
  assert.ok(existsSync("app/founder/[founderId]/consent/page.tsx"));
});

test("the integration snippet and dashboard are implemented", () => {
  assert.ok(existsSync("app/dashboard/founder/AddToApp.tsx"));
  assert.match(read("lib/ledger.ts"), /available/);
});

test("payouts are implemented", () => {
  assert.ok(existsSync("app/dashboard/founder/RequestPayout.tsx"));
});

test("account status monitoring is implemented", () => {
  // The claim is that we watch the account's standing and what the processor
  // still wants, and show both. That needs the webhook to sync on
  // account.updated, and the status/requirements to reach the founder's page.
  const hook = read("app/api/webhooks/stripe/route.ts");
  assert.match(hook, /account\.updated/);
  assert.match(hook, /syncAndAudit/);
  const acct = read("lib/stripe-account.ts");
  assert.match(acct, /RESTRICTED/);
  assert.match(acct, /REQUIREMENTS_DUE/);
  assert.match(read("app/dashboard/founder/page.tsx"), /requirements|due/i);
});

test("nothing about disputes is promised to everyone", () => {
  // There is no dispute webhook, no evidence submission and no dispute UI.
  // Until there is, the free list must stay silent about disputes -- and the
  // paid line must say assistance, never an outcome.
  const hook = read("app/api/webhooks/stripe/route.ts");
  assert.ok(!/charge\.dispute/.test(hook), "a dispute webhook exists: revisit the pricing copy");

  const pricing = claims("app/pricing/page.tsx");
  const free = pricing.slice(pricing.indexOf("const INCLUDED"), pricing.indexOf("const ABOVE"));
  assert.ok(!/dispute/i.test(free), "the everyone-list mentions disputes, which are not built");
  assert.ok(!/tax form|quarterly estimate/i.test(pricing), "tax claims are back");

  const above = pricing.slice(pricing.indexOf("const ABOVE"));
  assert.ok(/assistance/i.test(above), "the paid dispute line must be worded as assistance");
  assert.ok(!/we deal with them|we handle/i.test(above), "the paid line promises an outcome");
});
