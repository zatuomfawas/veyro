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
import { FEE_COLLECTION_ENABLED, FEES_EFFECTIVE_LABEL, mayCollectFee } from "../lib/pricing.ts";

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

test("published fee postponement is enforced by the collection guard", () => {
  assert.equal(FEE_COLLECTION_ENABLED, false);
  assert.equal(FEES_EFFECTIVE_LABEL, "Postponed");
  assert.equal(mayCollectFee(Date.UTC(2026, 9, 14)), false);
  assert.equal(mayCollectFee(Date.UTC(2026, 9, 15)), false);
  assert.equal(mayCollectFee(Date.UTC(2030, 0, 1)), false);

  for (const path of [
    "app/pricing/page.tsx", "app/_ui/faq.tsx", "app/about/page.tsx", "public/llms.txt",
  ]) {
    const source = claims(path);
    assert.match(source, /postponed/i, `${path} must state the current fee status`);
    assert.ok(!/15 October 2026/.test(source), `${path} must not promise the old launch date`);
  }
});

test("the Terms disclose postponement and retain the September version in force", () => {
  const terms = claims("app/terms/page.tsx");
  const current = claims("app/terms/2026-09-16/page.tsx");
  for (const [path, source] of [["updated Terms", terms], ["September Terms", current]]) {
    assert.match(source, /postponed/i, `${path} must explain the postponed update`);
    assert.ok(!/15 October 2026/.test(source), `${path} must not assert the old effective date`);
    assert.match(source, /remain in force|continues to govern/i,
      `${path} must identify which agreement still governs`);
  }
  assert.match(terms, /href="\/terms\/2026-09-16"/,
    "the updated Terms must link to the version that remains applicable");
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
