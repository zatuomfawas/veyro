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

test("dispute tools are listed but labelled, because they are not built", () => {
  // The Terms promise baseline dispute notifications and evidence submission
  // from 5 November. Until the code exists, the page must say so on the line
  // itself -- a promise dated in the future is honest; an undated one is not.
  // "Built" means a founder is actually served, not that a webhook exists.
  // The first version of this test checked only the handler, and went green
  // the moment the webhook landed -- while the dashboard still showed a
  // founder nothing about the dispute they were losing.
  const hook = read("app/api/webhooks/stripe/route.ts");
  const built =
    /charge\.dispute/.test(hook)                                   // we hear about it
    && existsSync("lib/dispute-notify.ts")                         // we tell them
    && existsSync("app/dashboard/founder/Disputes.tsx")            // they can see it
    && /Disputes/.test(read("app/dashboard/founder/page.tsx"));    // it is on the page

  const pricing = claims("app/pricing/page.tsx");
  const free = pricing.slice(pricing.indexOf("const INCLUDED"), pricing.indexOf("const ABOVE"));
  const disputeLine = free.split("\n").find((l) => /dispute/i.test(l)) ?? "";
  assert.ok(disputeLine, "the everyone-list no longer mentions disputes at all");

  if (built) {
    assert.ok(!/,\s*true\]/.test(disputeLine),
      "a dispute webhook exists, so the From 5 November label should come off");
  } else {
    assert.ok(/,\s*true\]/.test(disputeLine),
      "disputes are not built, so the line must carry the From 5 November label");
  }
});

test("every enhanced service is labelled if, and only if, it is not built", () => {
  // A blanket "all of these are labelled" assertion was right when none of
  // them existed and became wrong the moment three shipped. Each line is now
  // pinned to the thing that implements it, so a label cannot linger on a
  // feature that works or come off one that does not.
  const pricing = claims("app/pricing/page.tsx");
  const above = pricing.slice(pricing.indexOf("const ABOVE"), pricing.indexOf("export default"));
  const lines = above.split("\n").filter((l) => /^\s*\["/.test(l));
  assert.equal(lines.length, 5, "expected the five paid services from the Terms");

  const BUILT: [RegExp, boolean][] = [
    [/weekly payout/i, existsSync("app/dashboard/founder/PayoutSupport.tsx")],
    [/dispute and chargeback assistance/i, existsSync("app/dashboard/founder/Disputes.tsx")],
    [/priority support/i, existsSync("app/dashboard/founder/SupportCard.tsx")],
    [/direct guardian support/i, existsSync("app/dashboard/founder/SupportCard.tsx")],
    [/annual earnings/i, existsSync("lib/annual-summary.ts")],
  ];

  for (const [pattern, built] of BUILT) {
    const line = lines.find((l) => pattern.test(l));
    assert.ok(line, `no paid line matches ${pattern}`);
    const labelled = /,\s*true\]/.test(line);
    assert.equal(labelled, !built,
      built
        ? `${pattern} is built, so the From 5 November label should be off`
        : `${pattern} is not built, so it must carry the From 5 November label`);
  }

  assert.ok(/assistance/i.test(above), "the dispute line must be worded as assistance");
  assert.ok(!/we deal with them|we handle/i.test(above), "the paid line promises an outcome");
  assert.ok(!/Health Review/i.test(above), "the deferred health review is back on the page");
});

test("no tax claims anywhere on the pricing page", () => {
  assert.ok(!/tax form|quarterly estimate/i.test(claims("app/pricing/page.tsx")));
});

test("fees cannot be collected before the Terms take effect", () => {
  // The page says fees start on 5 November. The code must agree, or the page
  // is making a commitment the system can break.
  const pricing = claims("app/pricing/page.tsx");
  assert.match(pricing, /Fees start on 15 October 2026/);
  const lib = read("lib/pricing.ts");
  // Collection is on from 15 October. The date guard is now the only lock,
  // so the test asserts it is present and correct rather than that the flag
  // is off.
  assert.match(lib, /FEE_COLLECTION_ENABLED = true/);
  assert.match(lib, /Date\.UTC\(2026, 9, 15, 0, 0, 0\)/);
  assert.match(lib, /FEES_EFFECTIVE_AT/);
});

test("the fee start date in code and in the Terms are the same instant", () => {
  // The single most dangerous thing that can drift in this codebase.
  //
  // FEES_EFFECTIVE_AT decides when money may be taken; EFFECTIVE on /terms
  // decides when the document that provides for it is in force. If one moves
  // without the other, Veyro either charges under Terms not yet operative, or
  // publishes an obligation it is not yet enforcing. Both are the kind of
  // mistake nobody notices until somebody is owed a refund.
  const lib = read("lib/pricing.ts");
  const terms = read("app/terms/page.tsx");

  const m = lib.match(/FEES_EFFECTIVE_AT = Date\.UTC\((\d+), (\d+), (\d+)/);
  assert.ok(m, "FEES_EFFECTIVE_AT is not in the form this test can read");
  const [, y, mo, d] = m;
  const iso = new Date(Date.UTC(Number(y), Number(mo), Number(d))).toISOString();
  assert.equal(iso, "2026-10-15T00:00:00.000Z");

  const e = terms.match(/const EFFECTIVE = "([^"]+)"/);
  assert.ok(e, "EFFECTIVE is missing from the Terms");
  assert.equal(e[1], "15 October 2026");
});

test("the annual summary is scheduled for 5 January, not 1 January", () => {
  // Four days of slack so a payment made on 31 December has time to settle.
  // A summary mailed before its webhooks land disagrees with the dashboard
  // permanently, and it is a document people keep.
  const vercel = JSON.parse(read("vercel.json"));
  const job = vercel.crons.find((c: { path: string }) => c.path === "/api/cron/annual-summary");
  assert.ok(job, "the annual summary cron is not registered");
  const [, , day, month] = job.schedule.split(" ");
  assert.equal(day, "5", "the summary must go out on the 5th");
  assert.equal(month, "1", "the summary must go out in January");
});
