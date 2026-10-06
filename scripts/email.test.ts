// The email layer: what goes out, who it comes from, and how often.
//
// Three things are tested here, and they are the three that would be
// embarrassing rather than merely wrong.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { textToHtml } from "../lib/email-html.ts";
import { crossedFreeLimit, FEES_EFFECTIVE_AT, FEES_EFFECTIVE_LABEL } from "../lib/pricing.ts";

/* ---------------- the sender ---------------- */

test("mail is sent from the inbox a person can reply to", () => {
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");
  // Pinned because it is a one-word change that nothing else would catch:
  // noreply@ sends perfectly well, and the only symptom is replies falling
  // into a void that the footer of every message invites people to use.
  assert.match(src, /const SUPPORT_INBOX = "hello@withveyro\.com";/);
  assert.match(src, /const FROM = `Veyro <\$\{SUPPORT_INBOX\}>`;/);
  assert.match(src, /const REPLY_TO = SUPPORT_INBOX;/);
  assert.ok(!/noreply@/.test(src.replace(/^\/\/.*$/gm, "")),
    "noreply@ should survive only in the comment explaining why it went");
});

test("every send carries both a text and an HTML part", () => {
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");
  const call = src.slice(src.indexOf("resend.emails.send({"), src.indexOf("if (error)"));
  assert.match(call, /\btext,/);
  assert.match(call, /\bhtml: textToHtml\(text\),/);
});

/* ---------------- the HTML half ---------------- */

test("markup in the text cannot become markup in the mail", () => {
  const html = textToHtml("A <script>alert(1)</script> & an \"ampersand\".");
  assert.ok(!html.includes("<script>"), "the tag must not survive");
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
});

test("links become links, and the full stop after one does not", () => {
  const html = textToHtml("Your dashboard: https://withveyro.com/dashboard/founder");
  assert.ok(html.includes('href="https://withveyro.com/dashboard/founder"'));

  const stop = textToHtml("Read https://withveyro.com/pricing. Then decide.");
  assert.ok(stop.includes('href="https://withveyro.com/pricing"'),
    "the trailing full stop belongs to the sentence, not the URL");
  assert.ok(!stop.includes('href="https://withveyro.com/pricing."'));
});

test("blank lines become paragraphs and single ones become breaks", () => {
  const html = textToHtml("One.\n\nTwo.\nStill two.");
  assert.equal(html.match(/<p /g)?.length, 2);
  assert.equal(html.match(/<br>/g)?.length, 1);
});

test("the HTML is a whole document, because a fragment renders as text", () => {
  const html = textToHtml("Hello.");
  assert.ok(html.startsWith("<!doctype html>"));
  assert.ok(html.trimEnd().endsWith("</html>"));
});

/* ---------------- the threshold notice, once a month ---------------- */

/**
 * A month, played forward one payment at a time.
 *
 * The rule under test is "tell them once", so a single call proves nothing --
 * what matters is what the second, third and fourth payments do. This keeps
 * the marker exactly as lib/fees.ts keeps it: read before the decision,
 * written back when the decision is yes, never cleared.
 */
function playMonth(payments: number[], start: { qme?: number; notified?: boolean } = {}) {
  let qme = start.qme ?? 0;
  let notified = start.notified ?? false;
  const emails: boolean[] = [];
  for (const p of payments) {
    qme += p;
    const crossed = crossedFreeLimit(qme, notified);
    if (crossed) notified = true;
    emails.push(crossed);
  }
  return { emails, qme, notified, count: emails.filter(Boolean).length };
}

test("the payment that crosses $100 is the one that sends", () => {
  const { emails, qme } = playMonth([6000, 8000]);
  assert.deepEqual(emails, [false, true]);
  assert.equal(qme, 14000);
});

test("exactly $100 is not a crossing", () => {
  assert.deepEqual(playMonth([5000, 5000]).emails, [false, false]);
  assert.equal(crossedFreeLimit(10000, false), false);
  assert.equal(crossedFreeLimit(10001, false), true);
});

test("one email a month, however many more payments arrive", () => {
  const { emails, count } = playMonth([12000, 5000, 5000, 90000]);
  assert.deepEqual(emails, [true, false, false, false]);
  assert.equal(count, 1);
});

test("a refund that drops the month under $100 does not re-arm it", () => {
  // Counsel's case one, continued: $150 earned, $50 refunded, $60 more. The
  // month dips to $100 and crosses again, and that is still one month that
  // passed the limit.
  let qme = 15000, notified = false;
  assert.equal(crossedFreeLimit(qme, notified), true);
  notified = true;
  qme -= 5000;
  qme += 6000;
  assert.equal(crossedFreeLimit(qme, notified), false, "no second email");
});

test("a month that never passes $100 never sends", () => {
  assert.equal(playMonth([2000, 3000, 4000]).count, 0);
});

test("a new month starts with its own notice", () => {
  // lockMonth creates one row per founder per month, so a new month arrives
  // with the marker unset. Nothing carries over but the calendar.
  assert.equal(playMonth([20000], { notified: false }).count, 1);
});

/* ---------------- what the notice says ---------------- */

test("the date in the email is the date the code enforces", () => {
  // The email tells somebody when they will start being charged. If this
  // string were typed by hand it could disagree with the guard, and the
  // product would have promised one date and acted on another.
  assert.equal(FEES_EFFECTIVE_LABEL, "15 October 2026");
  assert.equal(new Date(FEES_EFFECTIVE_AT).toISOString(), "2026-10-15T00:00:00.000Z");
});

test("the notice offers nothing and promises nothing", () => {
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("export function sendThresholdEmail"),
    src.indexOf("/* ---------------- the annual summary"));
  for (const banned of [/\bupgrade\b/i, /\bunlock\b/i, /\bguarantee/i, /\bcompliant\b/i]) {
    assert.ok(!banned.test(body), `the threshold email must not say ${banned}`);
  }
  assert.match(body, /nothing\s+/i);
});
