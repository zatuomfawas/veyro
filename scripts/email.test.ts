// The email layer: what goes out, who it comes from, and how often.
//
// Three things are tested here, and they are the three that would be
// embarrassing rather than merely wrong.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderText, renderHtml } from "../lib/email-html.ts";
import {
  payoutMail, disputeMailForFounder, disputeMailForGuardian,
} from "../lib/email-bodies.ts";
import { crossedFreeLimit, FEES_EFFECTIVE_AT, FEES_EFFECTIVE_LABEL } from "../lib/pricing.ts";
import { SUPPORT_EMAIL } from "../lib/support.ts";

/* ---------------- the sender ---------------- */

test("mail is sent from a domain the provider can actually verify", () => {
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");

  // This is the test that would have caught the obvious change. When the
  // support inbox moved to withveyro@gmail.com, sending from it looked like
  // a one-line edit. Probed against the live Resend API:
  //
  //   Veyro <withveyro@gmail.com>   403  "The gmail.com domain is not verified"
  //   Veyro <hello@withveyro.com>   200
  //
  // Nobody can verify gmail.com, so a From on free mail stops every
  // transactional email on the platform at once -- and it fails in the one
  // place nothing watches, because send() is non-fatal by design.
  const sender = /const SENDING_ADDRESS = "([^"]+)";/.exec(src);
  assert.ok(sender, "the sending address has to be its own constant");
  assert.match(sender[1], /@withveyro\.com$/,
    "From must stay on the domain verified with the mail provider");
  for (const free of ["gmail", "googlemail", "outlook", "hotmail", "yahoo", "icloud", "proton"]) {
    assert.ok(!sender[1].includes(free),
      `${free} cannot be verified as a sending domain, so From cannot use it`);
  }

  assert.match(src, /const FROM = `Veyro <\$\{SENDING_ADDRESS\}>`;/);
  // Replies go to the inbox a person actually reads, which is the half that
  // is allowed to be anywhere.
  assert.match(src, /const REPLY_TO = SUPPORT_EMAIL;/);
  assert.ok(!/noreply@/.test(src.replace(/^\/\/.*$/gm, "")),
    "noreply@ should survive only in the comment explaining why it went");
});

test("one file owns the support address", () => {
  // Eleven files used to declare it independently, so changing it meant
  // finding all eleven. The eleventh was always the one that got missed.
  const src = readFileSync(new URL("../lib/support.ts", import.meta.url), "utf8");
  assert.match(src, /const SUPPORT_EMAIL = "withveyro@gmail\.com";/);
});

test("every send carries both a text and an HTML part", () => {
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");
  const call = src.slice(src.indexOf("resend.emails.send({"), src.indexOf("if (error)"));
  assert.match(call, /\btext: renderText\(mail\),/);
  assert.match(call, /\bhtml: renderHtml\(mail\),/);
});

/* ---------------- the HTML half ---------------- */

test("markup in the text cannot become markup in the mail", () => {
  const html = renderHtml("A <script>alert(1)</script> & an \"ampersand\".");
  assert.ok(!html.includes("<script>"), "the tag must not survive");
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
});

test("links become links, and the full stop after one does not", () => {
  const html = renderHtml("Your dashboard: https://withveyro.com/dashboard/founder");
  assert.ok(html.includes('href="https://withveyro.com/dashboard/founder"'));

  const stop = renderHtml("Read https://withveyro.com/pricing. Then decide.");
  assert.ok(stop.includes('href="https://withveyro.com/pricing"'),
    "the trailing full stop belongs to the sentence, not the URL");
  assert.ok(!stop.includes('href="https://withveyro.com/pricing."'));
});

test("blank lines become paragraphs and single ones become breaks", () => {
  const html = renderHtml("One.\n\nTwo.\nStill two.");
  assert.equal(html.match(/<p /g)?.length, 2);
  assert.equal(html.match(/<br>/g)?.length, 1);
});

/* ---------------- the house style, in an inbox ----------------
   Every assertion below is one of the ways an email quietly stops looking
   like the product, or quietly stops being readable, without anything
   failing. */

test("the green is the site's green, not a near miss", () => {
  const html = renderHtml({ intro: "Hello.", cta: { label: "Go", href: "https://x.test" } });
  assert.ok(html.includes("#12513a"), "--pine, as the rest of the product uses");
  // #0f5132 was the old one: close enough to pass on its own and wrong beside
  // anything from the actual site. #10b981 is the stock emerald nothing here
  // has ever used.
  for (const wrong of ["#0f5132", "#10b981", "#10B981"]) {
    assert.ok(!html.toLowerCase().includes(wrong.toLowerCase()), `${wrong} must not appear`);
  }
});

test("the card survives a client that ignores max-width", () => {
  const html = renderHtml("Hello.");
  // Outlook renders through Word, which drops max-width -- so the card needs
  // a real table width as well, or it goes full-bleed on a desktop monitor.
  assert.match(html, /<table[^>]*width="560"/);
  assert.ok(html.includes("max-width:560px"));
  assert.ok(html.includes("width:100%"), "and still fits a 375px phone");
});

test("nothing essential is behind a remote image", () => {
  const html = renderHtml({
    intro: "Hello.", facts: [{ k: "Amount", v: "$10.00" }],
    cta: { label: "Go", href: "https://x.test" },
  });
  assert.ok(!/<img\b/i.test(html),
    "images are blocked by default on first open, which is the open that matters");
  assert.ok(html.includes(">Veyro<"), "so the wordmark is text");
});

test("the light rendering is declared, not assumed", () => {
  const html = renderHtml("Hello.");
  assert.ok(html.includes('name="color-scheme" content="light"'));
  assert.ok(html.includes("color-scheme:light"));
  // Declaring the scheme is what stops a client auto-inverting a #ffffff card
  // and leaving the inline dark text on it. Styling FOR dark mode is the
  // thing that was asked not to happen.
  assert.ok(!/prefers-color-scheme/.test(html), "no dark-mode styling");
});

/* ---------------- figures ---------------- */

test("figures are a real table, and the text half has the same numbers", () => {
  const facts = [{ k: "Amount requested", v: "$195.00" }, { k: "Requested by", v: "Ada" }];
  const html = renderHtml({ intro: "Hi.", facts });
  // <th scope="row"> rather than two cells: a screen reader then reads the
  // label with the number instead of leaving the number unattached.
  assert.match(html, /<th scope="row"[^>]*>Amount requested<\/th>/);
  assert.ok(html.includes("$195.00"));

  const text = renderText({ intro: "Hi.", facts });
  assert.ok(text.includes("Amount requested: $195.00"));
  assert.ok(text.includes("Requested by: Ada"));
});

test("a figure cannot say one thing in HTML and another in text", () => {
  // The whole reason for one MailBody and two renderers.
  const body = { intro: "Hi.", facts: [{ k: "Fee", v: "$3.30" }],
    cta: { label: "Open", href: "https://withveyro.com/x" } };
  for (const needle of ["$3.30", "https://withveyro.com/x"]) {
    assert.ok(renderText(body).includes(needle), `text is missing ${needle}`);
    assert.ok(renderHtml(body).includes(needle), `html is missing ${needle}`);
  }
});

test("the action is a button in HTML and a URL in text", () => {
  const body = { intro: "Hi.", cta: { label: "View in Stripe", href: "https://dash.test/p" } };
  const html = renderHtml(body);
  // A table round one cell: a styled <a> with padding loses its background in
  // Word's engine, and the button disappears with it.
  assert.match(html, /<td style="background:#12513a">/);
  assert.ok(html.includes(">View in Stripe</a>"));
  assert.ok(renderText(body).includes("View in Stripe: https://dash.test/p"));
});

/* ---------------- the footer ---------------- */

test("both halves close with the same footer", () => {
  for (const render of [renderText, renderHtml]) {
    const out = render("Hello.");
    assert.ok(out.includes("Payments for creators under 18"));
    assert.ok(out.includes(SUPPORT_EMAIL), "the footer carries the support address");
    for (const path of ["/dashboard/founder", "/terms", "/privacy"]) {
      assert.ok(out.includes(path), `the footer needs a ${path} link`);
    }
  }
});

test("guardian mail points at the guardian's own dashboard", () => {
  const body = { intro: "Hi.", dashboard: "/dashboard/guardian" };
  for (const render of [renderText, renderHtml]) {
    const out = render(body);
    assert.ok(out.includes("/dashboard/guardian"));
    assert.ok(!out.includes("/dashboard/founder"),
      "there is no bare /dashboard route to fall back on, so this has to be right");
  }
});

test("nothing offers to unsubscribe from a receipt", () => {
  // These are transactional -- a deadline, a password change, money arriving.
  // There is nothing to unsubscribe from, and offering it implies there is.
  for (const render of [renderText, renderHtml]) {
    assert.ok(!/unsubscribe/i.test(render("Hello.")));
  }
});

test("the HTML is a whole document, because a fragment renders as text", () => {
  const html = renderHtml("Hello.");
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

/* ---------------- the payout notice ----------------
   This email tells an adult what control they have over money, and it has
   been wrong before. The assertions are about claims, not wording. */

const PAYOUT = {
  founderName: "Ada", guardianName: "Jo", amountMinor: 19500, currency: "USD",
};

test("the payout email never reports a Stripe payout status it does not have", () => {
  // payout.* webhooks are deliberately not ingested, so there is no Stripe
  // payout object here. Mapping one anyway -- pending, in transit, paid --
  // would be an invented status on a message about money.
  for (const payouts of [
    null,
    { interval: "manual" as const, description: "Manual.", payoutsEnabled: true },
    { interval: "weekly" as const, description: "Payouts run weekly, on Friday.", payoutsEnabled: true },
  ]) {
    const text = renderText(payoutMail({ ...PAYOUT, payouts }));
    for (const invented of ["in transit", "in_transit", "completed", "scheduled for"]) {
      assert.ok(!new RegExp(`\\b${invented}\\b`, "i").test(text.replace(/is pending, in transit or paid/gi, "")),
        `must not claim a status: ${invented}`);
    }
    assert.ok(text.includes("Recorded by Veyro as: Requested"),
      "what Veyro actually knows, named as Veyro's own record");
    assert.ok(text.includes("https://dashboard.stripe.com/payouts"),
      "and Stripe's status is one validated link away");
  }
});

test("'you can schedule this payout' appears only when payouts are manual", () => {
  const says = (payouts: Parameters<typeof payoutMail>[0]["payouts"]) =>
    renderText(payoutMail({ ...PAYOUT, payouts })).includes("can schedule this payout in Stripe");

  assert.ok(says({ interval: "manual", description: "Manual.", payoutsEnabled: true }),
    "manual is the one configuration where a specific payout is waiting to be sent");

  for (const interval of ["daily", "weekly", "monthly", "unknown"] as const) {
    assert.ok(!says({ interval, description: "Payouts run weekly.", payoutsEnabled: true }),
      `${interval} runs on its own, so there is nothing to go and schedule`);
  }
  assert.ok(!says(null), "an unreadable account is not a licence to guess");
  assert.ok(!says({ interval: "manual", description: "Manual.", payoutsEnabled: false }),
    "nothing can be scheduled on an account that cannot pay out yet");
});

test("the payout email does not claim the guardian is powerless", () => {
  const text = renderText(payoutMail({
    ...PAYOUT, payouts: { interval: "weekly", description: "Payouts run weekly.", payoutsEnabled: true },
  }));
  // The old copy said "nobody, including you, can block one". The guardian
  // owns the connected account; they can set payouts to manual, change the
  // schedule or close it, none of which passes through Veyro.
  for (const banned of [/cannot block/i, /can't block/i, /nobody.{0,30}can stop/i,
    /not a request to approve/i]) {
    assert.ok(!banned.test(text), `the payout email must not say ${banned}`);
  }
  assert.ok(/payout settings are yours|settings on this account are yours/i.test(text));
});

test("the payout email says who asked and who holds the account", () => {
  const text = renderText(payoutMail({
    ...PAYOUT, payouts: { interval: "manual", description: "Manual.", payoutsEnabled: true },
  }));
  assert.ok(text.includes("Requested by: Ada"), "the founder asks");
  assert.ok(text.includes("Jo, you can schedule"), "the guardian is the one who can act");
  assert.ok(text.includes("/dashboard/guardian"), "and the footer goes to their dashboard");
});

/* ---------------- the dispute notice ---------------- */

const DISPUTE = {
  founderName: "Ada", guardianName: "Jo", amount: "$42.00",
  reason: "The cardholder says they did not recognise the charge.",
  due: "Fri, 24 Oct 2026 23:59:59 GMT", opened: "Fri, 10 Oct 2026 09:14:00 GMT",
  disputeId: "dp_test_123", url: "https://dashboard.stripe.com/disputes/dp_test_123",
  disclaimer: "Veyro does not guarantee any dispute will be won.",
};

test("the deadline is Stripe's, and is never a number of days we made up", () => {
  const withDue = renderText(disputeMailForGuardian(DISPUTE));
  assert.ok(withDue.includes("Fri, 24 Oct 2026 23:59:59 GMT"));

  const without = renderText(disputeMailForGuardian({ ...DISPUTE, due: null }));
  assert.ok(without.includes("Response deadline: See the dispute in Stripe"));
  // The window varies by network, by reason and by region. A hardcoded figure
  // here is a dispute lost on our arithmetic.
  for (const body of [withDue, without]) {
    assert.ok(!/\b(7|10|14|20|21|30)\s*(calendar\s*)?days\b/i.test(body),
      "no invented response window");
  }
});

test("both readers get the same facts and a different job", () => {
  const f = renderText(disputeMailForFounder(DISPUTE));
  const g = renderText(disputeMailForGuardian(DISPUTE));

  for (const fact of ["Amount: $42.00", "Dispute ID: dp_test_123", "Disputed on:"]) {
    assert.ok(f.includes(fact) && g.includes(fact), `both need ${fact}`);
  }
  assert.ok(g.includes("Jo, you'll need to respond through Stripe"));
  assert.ok(f.includes("please coordinate with Jo"));
  assert.ok(f.includes("Jo is the account holder"));
});

test("the dispute email does not claim Veyro handles the dispute", () => {
  for (const body of [disputeMailForFounder(DISPUTE), disputeMailForGuardian(DISPUTE)]) {
    const text = renderText(body);
    // On a Standard connected account the platform cannot submit evidence.
    // Saying otherwise would be a promise the code cannot keep on the one
    // deadline that costs real money to miss.
    for (const banned of [/we(?:'ll| will) respond/i, /submits? (the )?evidence for you/i,
      /we(?:'ll| will) handle/i, /resolve[sd]? (the )?(dispute|chargeback) for you/i]) {
      assert.ok(!banned.test(text), `must not say ${banned}`);
    }
    assert.ok(text.includes("Veyro cannot respond to this for you"));
    assert.ok(text.includes("Respond in Stripe: https://dashboard.stripe.com/disputes/dp_test_123"));
  }
});

test("no customer personal information rides along", () => {
  // The amount, the date and the dispute id identify the transaction on their
  // own. Stripe's dispute object can carry a buyer's name; putting it into
  // two inboxes to save one click is not a trade worth making.
  const src = readFileSync(new URL("../lib/email-bodies.ts", import.meta.url), "utf8");
  const built = src.slice(src.indexOf("function disputeFacts"), src.indexOf("const deadlineLine"));
  for (const field of ["customerName", "customer_name", "billing_details", "payerName", "email"]) {
    assert.ok(!built.includes(field), `the dispute facts must not carry ${field}`);
  }
});

/* ---------------- what is deliberately not sent yet ---------------- */

test("the annual summary is only promised by the email that carries it", () => {
  // It exists, it is tested, and it is scheduled for 5 January. What must not
  // happen is another email announcing it, because an unkept January promise
  // is worse than a January surprise.
  const src = readFileSync(new URL("../lib/email.ts", import.meta.url), "utf8");
  // Comments first: this is about what reaches an inbox, and the module is
  // more comment than code. A section banner naming the summary is fine.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const others = code.replace(
    code.slice(code.indexOf("export function sendAnnualSummary"),
      code.indexOf("export function sendDisputeNotification")), "");
  for (const promise of [/annual summary/i, /annual report/i, /year[- ]end summary/i]) {
    assert.ok(!promise.test(others), `only the summary email itself may mention ${promise}`);
  }
});

test("a value that is a sentence does not push the card off a phone", () => {
  const html = renderHtml({ intro: "Hi.", facts: [
    { k: "Amount", v: "$42.00" },
    { k: "Reason", v: "The cardholder says they did not recognise the charge.", prose: true },
  ] });
  // white-space:nowrap on the value column is what clipped the right-hand
  // edge of every paragraph at 375px: a reason is a sentence, and a sentence
  // that cannot wrap makes the table, and then the card, wider than the
  // screen.
  assert.ok(!html.includes("white-space:nowrap"));
  assert.ok(html.includes("word-break:break-word"), "a Stripe id still has to break somewhere");
  assert.match(html, /align="left"[^>]*font-weight:400/,
    "and a sentence is left-aligned regular, not right-aligned bold");
});
