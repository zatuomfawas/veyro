// The founder's dashboard.
//
// A Server Component that reads the database directly rather than calling
// Veyro's own API over HTTP. The founder only ever sees their own record, which
// is what resolveScope() would resolve to anyway, so the round trip would buy
// nothing and cost a request. Every mutation still goes through the API routes
// from the client islands below, where the validation and the audit trail live.
//
// There is deliberately no "Set up payments" button here, and no "reconnect"
// link. POST /api/founder/payment-setup refuses a founder acting on their own
// behalf — "Payment setup is completed by your guardian, not by you." — because
// the guardian is the adult who gets verified. A control that 403s every time is
// worse than none, so this page reports the state and names whose move it is.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { currentMonthKey, hasCrossedLimit, isEligible, mayCollectFee } from "@/lib/fees";
import { feeMinor as dueForQme } from "@/lib/pricing";
import { ThisMonth } from "./ThisMonth";
import { Disputes } from "./Disputes";
import { PayoutSupport } from "./PayoutSupport";
import { SupportCard } from "./SupportCard";
import { readPayoutSchedule } from "@/lib/payout-schedule";
import { foldWallet } from "@/lib/ledger";
import { foldAnalytics } from "@/lib/analytics";
import { consentState } from "@/lib/consent";
import { describeRequirements } from "@/lib/stripe-account";
import { formatMinor } from "@/lib/checkout";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Notice } from "@/app/_ui/form";
import { Requirements } from "@/app/_ui/Requirements";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { DashNav, Section, EmptyState, SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";

import InviteGuardian, { ResendInvite } from "./InviteGuardian";
import Notifications from "@/app/_ui/Notifications";
import { AddToApp } from "./AddToApp";
import RequestPayout from "./RequestPayout";
import { EarningsHero } from "./EarningsHero";
import { weekStart, foldWeek } from "@/lib/week";
import { canTakePayment } from "@/lib/sale-rules";
import {
  BusinessHeader, GuardianStatus, PaymentStatus, PrimaryAction,
  overallStatus as computeOverall,
} from "./Overview";

export const viewport = buildViewport();

// Private by definition. No canonical, no Open Graph: there is nothing here to
// share and nothing that should ever appear in a search result.
export const metadata: Metadata = {
  title: "Your build | Veyro",
  robots: { index: false, follow: false },
};

const COUNTRY_NAME = new Map(SIGNUP_COUNTRIES);

/* ---------------- recent activity ---------------- */

type AuditRow = { id: string; action: string; target: string; metadata: unknown; createdAt: Date };

const str = (m: Record<string, unknown>, k: string) =>
  typeof m[k] === "string" ? (m[k] as string) : null;

/**
 * Plain-language activity lines.
 *
 * Only actions a founder should see are mapped. The rest — operational alarms
 * like payment.attribution_mismatch, payout.blocked_unbalanced and the various
 * *_failed events — fall through to a neutral line rather than showing someone
 * a raw slug that reads like something broke on their account. They are still
 * in AuditEvent for whoever investigates.
 */
function activityLine(row: AuditRow): string | null {
  const m = (row.metadata && typeof row.metadata === "object" ? row.metadata : {}) as Record<string, unknown>;
  const money = () => {
    const amount = typeof m.amountMinor === "number" ? m.amountMinor : null;
    const currency = str(m, "currency");
    return amount !== null && currency ? formatMinor(amount, currency) : null;
  };

  switch (row.action) {
    case "product.created": {
      const name = str(m, "name");
      return name ? `Created product “${name}”` : "Created a product";
    }
    case "guardian.invited": {
      const email = str(m, "invitedEmail");
      return email ? `Invited ${email} as your guardian` : "Invited a guardian";
    }
    case "guardian.consented": return "Your guardian agreed";
    case "guardian.declined": return "Your guardian declined";
    case "payment.completed": {
      const amount = money();
      return amount ? `Payment received, ${amount}` : "Payment received";
    }
    case "payout.requested": {
      const amount = money();
      return amount ? `Requested a payout of ${amount}` : "Requested a payout";
    }
    case "stripe.connect.account_created": return "Payment account opened by your guardian";
    case "stripe.connect.onboarding_link_created": return "Payment setup started";
    case "stripe.account.status_changed": {
      const to = str(m, "to");
      return to === "ACTIVE" ? "Payment account went live" : "Payment account status changed";
    }
    case "stripe.account.deauthorized": return "Payment account disconnected";
    default: return null;
  }
}

/* ---------------- small pieces ---------------- */

const TX_BADGE: Record<string, string> = { COMPLETED: "b-pine", PENDING: "b-amber", REFUNDED: "b-grey" };
const TX_LABEL: Record<string, string> = { COMPLETED: "Paid", PENDING: "Settling", REFUNDED: "Refunded" };
const PAYOUT_BADGE: Record<string, string> = {
  REQUESTED: "b-amber", APPROVED: "b-slate", SENT: "b-pine", FAILED: "b-clay",
};

/** One step of setup. `done` comes from state, never from a stored flag. */
function SetupStep({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <div className="reqrow">
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <span
          aria-hidden="true"
          style={{
            width: 13, height: 13, flex: "none", marginTop: 3,
            border: "1px solid " + (done ? "var(--pine)" : "var(--line)"),
            background: done ? "var(--pine)" : "transparent",
          }}
        />
        <span>
          <span className="req-t" style={{ color: done ? "var(--ink)" : "var(--ink-2)" }}>
            {label}
            <span className="sr-only">{done ? " (complete)" : " (not done yet)"}</span>
          </span>
          <span className="req-d">{detail}</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default async function FounderDashboard() {
  const user = await currentUser();
  if (!user) redirect("/");
  // Not "is a guardian": Role is FOUNDER | GUARDIAN | ADMIN, and an admin
  // landing here would get a founder dashboard scoped to their own id.
  if (user.role !== "FOUNDER") redirect("/");

  const founderId = user.id;

  const [consent, account, products, transactions, wallet, activity, payouts, notifications, analytics, weekRows, paymentCount, monthLedger, disputes, eligibility, allMonths] =
    await Promise.all([
    db.guardianConsent.findUnique({
      where: { founderId },
      include: { guardian: { select: { name: true, email: true } } },
    }),
    db.founderPaymentAccount.findUnique({ where: { founderId } }),
    db.founderProduct.findMany({ where: { founderId }, orderBy: { createdAt: "desc" } }),
    db.founderTransaction.findMany({
      where: { founderId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { product: { select: { id: true, name: true } } },
    }),
    foldWallet(founderId),
    db.auditEvent.findMany({
      where: { founderId },
      orderBy: { createdAt: "desc" },
      take: 12, // over-fetch: unmapped operational events are dropped below
    }),
    db.founderPayoutRequest.findMany({
      where: { founderId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Unread first, then newest, so the thing you have not seen is never
    // pushed off the end by older rows you already read.
    db.notification.findMany({
      where: { userId: founderId },
      orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
      take: 6,
    }),
    // How many payments each product has taken, for the warning shown when a
    // price is edited. One grouped query rather than one per row, and counted
    // over every transaction rather than the twenty the table below shows.
    foldAnalytics(founderId, 30),
    // The week behind the chart in the hero. Its own query rather than a slice
    // of the twenty rows above: twenty rows is not seven days on a busy
    // account, and a chart drawn from whatever happened to be fetched would
    // under-report exactly when there is most to show.
    db.founderTransaction.findMany({
      where: {
        founderId,
        status: "COMPLETED",
        createdAt: { gte: weekStart() },
      },
      select: { createdAt: true, amountMinor: true },
    }),
    db.founderTransaction.count({ where: { founderId, status: "COMPLETED" } }),
    // This month's running totals, for the fee line. One row, already locked
    // and maintained by the webhook -- never recomputed from transactions here.
    db.monthlyLedger.findUnique({
      where: { founderId_month: { founderId, month: currentMonthKey() } },
    }),
    db.founderDispute.findMany({
      where: { founderId },
      orderBy: [{ state: "asc" }, { openedAt: "desc" }],
      take: 10,
    }),
    isEligible(founderId),
    db.monthlyLedger.findMany({
      where: { founderId },
      select: { month: true, qmeMinor: true },
    }),
  ]);

  const state = consentState(consent);
  const guardianName = consent?.guardian?.name ?? consent?.invitedEmail ?? "Your guardian";

  // Dates cross to the client as ISO strings: a Date would be serialised
  // anyway, and being explicit keeps the component's props honest about it.
  const notificationRows = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    routeName: n.routeName,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }));

  // requirementsDue is a Json column, so it is whatever was last written to it.
  // Narrow it rather than trusting the type.
  const dueCodes = Array.isArray(account?.requirementsDue)
    ? (account.requirementsDue as unknown[]).filter((c): c is string => typeof c === "string")
    : [];
  const due = describeRequirements(dueCodes, user.countryCode);

  const activityLines = activity
    .map((row) => ({ row, line: activityLine(row) }))
    .filter((x): x is { row: (typeof activity)[number]; line: string } => x.line !== null)
    .slice(0, 5);

  const weekSeries = foldWeek(weekRows);

  // This month, in USD minor units. The ledger is authoritative; a missing
  // row simply means nothing has been earned this month yet.
  const qmeMinor = monthLedger?.qmeMinor ?? 0;
  const monthFeeMinor = dueForQme(qmeMinor);
  const collecting = mayCollectFee();
  // F2: the crossing is a fact about the month, shown while they are over the
  // line -- not a banner to dismiss, because there is nothing to accept.
  const crossedThreshold = hasCrossedLimit(qmeMinor);

  // Read from Stripe rather than stored: a schedule the account holder
  // changed in their own dashboard five minutes ago must not be reported here
  // as whatever we cached last week.
  const payoutSchedule = account?.providerAccountId
    ? await readPayoutSchedule(account.providerAccountId)
    : null;

  // Years with at least one month over the limit. The route decides
  // eligibility again on request; this only decides what to offer.
  const summaryYears = [...new Set(
    allMonths.filter((m) => m.qmeMinor > 10000).map((m) => Number(m.month.slice(0, 4))),
  )].sort((a, b) => b - a);

  const firstLive = products.find((p) => p.status === "LIVE");

  // The product the integration panel talks about: the live one if there is
  // one, otherwise whatever they have. A founder who signed up a minute ago
  // has a starter draft, and the snippet is worth handing over before the
  // guardian has finished verifying -- they can be pasting it meanwhile.
  const snippetProduct = firstLive ?? products[0] ?? null;
  const canCharge = canTakePayment(account);
  const snippetLive = Boolean(firstLive) && canCharge;
  const snippetBlocked = snippetLive
    ? null
    : !canCharge
      ? "It cannot take money until your guardian finishes payment setup below."
      : "Set it live on your products page when you are ready to be paid.";

  // What "copy your payment link" should copy, and whether it can copy at all.
  //
  // A founder can have several products, so "your link" has to resolve to one:
  // the first live one, which is almost always the one they just made. A DRAFT
  // has no working checkout, so a founder holding only drafts gets told to make
  // one live rather than handed a URL that does not take money. The three cases
  // are distinct and each needs different words.
  const payPath = firstLive ? `/pay/${founderId}/${firstLive.id}` : null;
  const draftsOnly = products.length > 0 && !firstLive;

  // Setup progress, derived from the same state the steps render. Nothing is
  // stored, so a step cannot claim complete while its subject is not.
  const setupFlags = [
    true,
    state === "consented",
    account?.status === "ACTIVE",
    products.some((p) => p.status === "LIVE"),
    transactions.length > 0,
  ];
  const setupTotal = setupFlags.length;
  const setupDone = setupFlags.filter(Boolean).length;

  // The payout form acts on one currency. The wallet folds per currency, so
  // the one with the most available is the sensible default; USD when empty.
  // Revenue is shown in one currency at a time. Summing them would need an
  // exchange rate this app does not have, and an invented total is worse than
  // two honest ones, so the rest are listed rather than added.
  const byEarned = [...wallet.currencies].sort((a, b) => b.earned - a.earned);
  const primaryFold = byEarned[0] ?? null;
  const otherFolds = byEarned.slice(1);


  const richest = [...wallet.currencies].sort((a, b) => b.available - a.available)[0];
  const primaryCurrency = richest?.currency ?? "USD";
  const primaryAvailable = richest?.available ?? 0;

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <DashNav role="FOUNDER" current="dashboard" />

      <main id="main" className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        {/* ---------------- header ---------------- */}
        <BusinessHeader
          name={user.name}
          country={COUNTRY_NAME.get(user.countryCode) ?? user.countryCode}
          status={computeOverall(state, account?.status)}
          email={user.email}
        />

        {/* ---------------- the two questions ----------------
            "How much have I made" on the left, "what happens next" on the
            right. grid-2 collapses at 760px with revenue first, which is the
            right order on a phone too. */}
        {/* stretch, not start: two cards of different heights side by side read
            as an accident. Matched frames read as a pair, and the one action in
            the right-hand card sits on its floor rather than halfway up. */}
          {/* ---------------- the money, once ----------------
              This was two things: a RevenueCard here reading $207.00 earned,
              and a Wallet section halfway down the left column reading $186.27
              net. Two money summaries on one screen, different figures,
              neither obviously the answer to "how much do I have". The fold is
              the real one, so it comes up here and the duplicate below goes.

              Dark, and the full width of the page. On a page that was nine
              identical white cards this is the only container that says "start
              here", and it is the reversal the marketing page ends on, so the
              product looks like what was promised. */}
          {/* Rendered whether or not anything has sold. primaryFold is null
              until the first payment, and gating the whole band on it meant a
              founder who had just signed up got no wallet at all — the one
              thing they opened the page for, missing, on the day it matters
              most. The empty case shows a real zero and says what fills it. */}
          {primaryFold ? (
            <EarningsHero
              fold={primaryFold}
              payments={paymentCount}
              series={weekSeries}
              otherFolds={otherFolds}
            />
          ) : (
            <div className="wallethero">
              <span className="wh-label">Available to request</span>
              <span className="wh-big">{formatMinor(0, "USD")}</span>
              <span className="wh-sub">
                Nothing has sold yet. The first time someone pays, what they paid, what the
                processing fee took and what you keep all appear here &mdash; and this figure is what you can
                request.
              </span>
              <div className="row" style={{ marginTop: "var(--sp-7)", gap: 8, flexWrap: "wrap" }}>
                {firstLive
                  ? (
                    <Link className="btn" href={`/pay/${founderId}/${firstLive.id}`} target="_blank" rel="noreferrer">
                      Open your checkout
                    </Link>
                  )
                  : null}
              </div>
            </div>
          )}

          {snippetProduct && (
            <AddToApp
              productId={snippetProduct.id}
              productName={snippetProduct.name}
              live={snippetLive}
              blockedReason={snippetBlocked}
            />
          )}

          <ThisMonth
            qmeMinor={qmeMinor}
            feeMinor={monthFeeMinor}
            currency={primaryFold?.currency ?? "USD"}
            collecting={collecting}
            crossed={crossedThreshold}
            feesStart="15 October 2026"
          />

          {/* Context, not content. Figures a founder glances at, so they sit on
              a rule rather than inside four more bordered cards on a page whose
              whole problem is bordered cards. */}
          {/* What is left of the old top row: the half that answers "what
              happens next". A strip now, not a column, because the money it
              used to sit beside has moved above it. */}
          <div className="card" style={{ marginBottom: "var(--sp-7)" }}>
            <div className="card-b">
              <div className="reqlist">
                <GuardianStatus
                  state={state}
                  guardianName={guardianName}
                  invitedEmail={consent?.invitedEmail}
                  consentedAt={consent?.consentedAt}
                  expiresAt={consent?.inviteExpiresAt}
                />
                <PaymentStatus
                  accountStatus={account?.status}
                  requirements={due}
                  guardianName={guardianName}
                  connectedAt={account?.connectedAt}
                />
              </div>
              <div style={{ marginTop: "var(--sp-5)" }}>
                <PrimaryAction state={state} accountStatus={account?.status} />
              </div>
            </div>
          </div>


        {/* Below revenue, above the working sections. An unread "Payment setup
            needs redoing" is urgent, but not more urgent than the number the
            founder opened the page to see. */}
        <Notifications rows={notificationRows} />

        {/* One column, in the order the questions get asked: how much
            have I made, how do I wire it up, what came in, when does it
            reach my bank. Everything that is not one of those is behind
            the disclosure at the bottom.

            The products section is not here and is not gone: it moved to
            /dashboard/founder/products. It is still the only place a
            product can be made or edited, and the snippet above needs a
            product id to be worth pasting -- deleting it would remove the
            ability to sell anything, not just the clutter. */}
          {/* ---------------- 6. transactions ---------------- */}
          {summaryYears.length > 0 && (
            <Section title="Annual Earnings &amp; Payout Summary">
              <p className="body" style={{ marginTop: 0 }}>
                A record of what you earned and what was paid out, for any year you were over
                $100 in at least one month. It is not tax advice &mdash; it is a document to give
                an accountant, not one to file.
              </p>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: "var(--sp-4)" }}>
                {summaryYears.map((y) => (
                  <a key={y} className="btn btn-2 btn-sm"
                     href={`/api/founder/annual-summary?year=${y}`}>
                    Download {y}
                  </a>
                ))}
              </div>
            </Section>
          )}

          <Section title="Support">
            <SupportCard
              founderId={founderId}
              eligible={eligibility.eligible}
              guardianName={guardianName}
            />
          </Section>

          <Section title="Payout frequency">
            <PayoutSupport
              schedule={payoutSchedule}
              eligible={eligibility.eligible}
              guardianName={guardianName}
            />
          </Section>

          <Section title="Disputes">
            <Disputes
              rows={disputes.map((d) => ({
                id: d.id,
                stripeDisputeId: d.stripeDisputeId,
                amountMinor: d.amountMinor,
                currency: d.currency,
                reason: d.reason,
                state: d.state,
                evidenceDueBy: d.evidenceDueBy?.toISOString() ?? null,
                openedAt: d.openedAt.toISOString(),
              }))}
              eligible={eligibility.eligible}
              guardianName={guardianName}
            />
          </Section>

          <Section title="Transactions">
            {transactions.length === 0 ? (
              /* Three situations, and the common one first. Veyro is the layer
                 that gets payments working, not a shop someone stocks, so the
                 empty state points at the integration panel above rather than
                 telling them to go and make something to sell.

                 The draft branch used to link to #products, an anchor on this
                 page. Products moved to their own page and the anchor went
                 with them, so that button had been scrolling nowhere. */
              products.length === 0 ? (
                <EmptyState
                  heading="No payments yet"
                  action={
                    <Link className="btn" href="/dashboard/founder/products">
                      Add payments to your app
                    </Link>
                  }
                >
                  Payments will show up here once you&rsquo;ve integrated Veyro&rsquo;s code into
                  your app and customers start paying you. You need one product first &mdash; it
                  is what the code points at.
                </EmptyState>
              ) : draftsOnly ? (
                <EmptyState
                  heading="No payments yet"
                  action={<Link className="btn" href="#integrate">Get integration code</Link>}
                  secondary={{ label: "Set it live", href: "/dashboard/founder/products" }}
                >
                  Payments will show up here once you&rsquo;ve integrated Veyro&rsquo;s code into
                  your app and customers start paying you. Your product is still a draft, so set
                  it live before you send anyone to it.
                </EmptyState>
              ) : (
                <EmptyState
                  heading="No payments yet"
                  action={<Link className="btn" href="#integrate">Get integration code</Link>}
                  secondary={{ label: "Or copy the link", href: payPath! }}
                >
                  Payments will show up here once you&rsquo;ve integrated Veyro&rsquo;s code into
                  your app and customers start paying you. Every one lands here within seconds
                  &mdash; amount, product, and the processing fee.
                </EmptyState>
              )
            ) : (
                <div>
                  {/* Grouped by the day the money moved, because that is how a
                      founder remembers a sale — "the two on Friday", not rows
                      14 and 15. The day carries its own cleared total, which
                      six numeric columns never showed. */}
                  {Object.entries(
                    transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
                      const k = fmtDate(t.createdAt);
                      (acc[k] ??= []).push(t);
                      return acc;
                    }, {}),
                  ).map(([day, rows]) => {
                    // Only cleared money counts toward the day's figure, and
                    // only in one currency — a day that mixed USD and EUR
                    // would otherwise get a total that means nothing.
                    const cur = rows[0].currency;
                    const sameCurrency = rows.every((r) => r.currency === cur);
                    const cleared = rows
                      .filter((r) => r.status === "COMPLETED" && r.feeMinor != null)
                      .reduce((n, r) => n + (r.amountMinor - (r.feeMinor ?? 0)), 0);
                    return (
                      <div className="txgroup" key={day}>
                        <div className="txday">
                          <span className="txday-d">{day}</span>
                          {sameCurrency && cleared > 0 && (
                            <span className="txday-t">{formatMinor(cleared, cur)} kept</span>
                          )}
                        </div>
                        <ul className="txlist" aria-label={`Payments on ${day}`}>
                        {rows.map((t) => {
                          const refunded = t.status === "REFUNDED";
                          const settled = t.status === "COMPLETED" && t.feeMinor != null;
                          return (
                            <li className="txrow" key={t.id}>
                              <div>
                                <span className="tx-name">{t.product?.name ?? "None"}</span>
                                {/* The processor's own reference, so a founder
                                    asking about a payment can quote something
                                    support recognises rather than describing
                                    it. */}
                                <span className="tx-ref">{t.stripePaymentIntentId}</span>
                              </div>
                              <div className="tx-flow">
                                <span>{formatMinor(t.amountMinor, t.currency)}</span>
                                <span className="tx-arrow">&minus;</span>
                                <span>
                                  {t.feeMinor == null
                                    ? "fee pending"
                                    : formatMinor(t.feeMinor, t.currency) + " fee"}
                                </span>
                                <span className="tx-arrow">&rarr;</span>
                                {/* Blank rather than a guess while the fee has
                                    not been reported: net is not knowable
                                    yet and a placeholder number would be a
                                    claim about the founder's money. */}
                                <span
                                  className="tx-net"
                                  data-tone={refunded ? "out" : settled ? "settled" : undefined}
                                >
                                  {refunded
                                    ? "refunded"
                                    : t.feeMinor == null
                                      ? "—"
                                      : formatMinor(t.amountMinor - t.feeMinor, t.currency)}
                                </span>
                                <span className={"badge " + (TX_BADGE[t.status] ?? "b-grey")}>
                                  {TX_LABEL[t.status] ?? t.status}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
            )}
          </Section>
          {/* ---------------- payouts ---------------- */}
          <div id="payouts" />
          <Section
            title="Payouts"
            aside={
              payouts.length > 0
                ? <span className="badge b-grey">
                    {payouts.length === 1 ? "1 request" : `${payouts.length} requests`}
                  </span>
                : undefined
            }
          >
            <RequestPayout
              currency={primaryCurrency}
              availableMinor={primaryAvailable}
              accountActive={account?.status === "ACTIVE"}
            />

            {payouts.length > 0 && (
              <>
                <hr className="rule" style={{ margin: "20px 0 16px" }} />
                  {/* A sequence, not a table. A requested payout and a sent
                      one used to get the same row and the same weight, so
                      "where is my money now" had to be read out of a badge.
                      The spine is .tl, which already carries the guardian
                      relationship on the marketing page. */}
                  <ol className="tl payoutline" aria-label="Payout requests, newest first">
                    {payouts.map((p) => {
                      const done = p.status === "SENT";
                      const failed = p.status === "FAILED";
                      return (
                        <li key={p.id}>
                          <span
                            className="pt"
                            data-on={failed ? "bad" : done ? "done" : "waiting"}
                            aria-hidden="true"
                          />
                          <span>
                            <span className="tl-t">
                              <span className="po-amt">
                                {formatMinor(p.amountMinor, p.currency)}
                              </span>
                              <span className={"badge " + (PAYOUT_BADGE[p.status] ?? "b-grey")}>
                                {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                              </span>
                            </span>
                            <span className="tl-d">
                              {/* What each state actually means for the money,
                                  rather than restating the badge. */}
                              {done
                                ? `Sent on ${fmtDate(p.createdAt)}. It is paid into the bank account on your payment account.`
                                : failed
                                  ? `Requested ${fmtDate(p.createdAt)} and did not go through. The money is still in your wallet.`
                                  : p.status === "APPROVED"
                                    ? `Approved, waiting on the processor. Requested ${fmtDate(p.createdAt)}.`
                                    : `Requested ${fmtDate(p.createdAt)}. Held out of your available balance so it cannot be spent twice.`}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
              </>
            )}
          </Section>

        {/* ---------------- everything else, folded away ---------------- */}
        <details className="acct">
          <summary>Account &amp; setup</summary>
          <div className="acct-b">
              {/* ---------------- setup ---------------- */}
              <Section
                title="Setup"
                aside={
                  <span className={"badge " + (setupDone === setupTotal ? "b-pine" : "b-grey")}>
                    {setupDone} of {setupTotal}
                  </span>
                }
              >
                <div className="reqlist">
                  <SetupStep
                    done
                    label="Account created"
                    detail={`You signed up on ${fmtDate(user.createdAt)}.`}
                  />
                  <SetupStep
                    done={state === "consented"}
                    label="Guardian consented"
                    detail={
                      state === "consented"
                        ? `${guardianName} agreed and is the adult on the account.`
                        : state === "none"
                          ? "Invite a parent or guardian below."
                          : "Waiting for them to accept the invitation."
                    }
                  />
                  <SetupStep
                    done={account?.status === "ACTIVE"}
                    label="Payment account live"
                    detail={
                      account?.status === "ACTIVE"
                        ? "Charges and payouts are enabled."
                        : account
                          ? "Your guardian finishes this on the processor's own form."
                          : "Opens once your guardian has consented."
                    }
                  />
                  <SetupStep
                    done={products.some((p) => p.status === "LIVE")}
                    label="Something to sell"
                    detail={
                      products.some((p) => p.status === "LIVE")
                        ? "Live, with a checkout link ready to share."
                        : "Add a product and set it live to get your checkout link."
                    }
                  />
                  <SetupStep
                    done={transactions.length > 0}
                    label="First payment"
                    detail={
                      transactions.length > 0
                        ? "Money came in. It is in your wallet."
                        : "Share your checkout link. The first payment shows up here."
                    }
                  />
                </div>
              </Section>
  
              {/* ---------------- 2. guardian ---------------- */}
              <div id="guardian" />
              <Section
                title="Your guardian"
                aside={
                  state === "consented" ? <span className="badge b-pine">Consented</span>
                    : state === "pending" ? <span className="badge b-amber">Invited</span>
                      : state === "declined" ? <span className="badge b-clay">Declined</span>
                        : state === "expired" ? <span className="badge b-grey">Expired</span>
                          : <span className="badge b-grey">None yet</span>
                }
              >
                {state === "consented" && consent ? (
                  <p className="body" style={{ margin: 0 }}>
                    <strong>{guardianName}</strong> agreed on {fmtDate(consent.consentedAt!)}. They are
                    the verified adult on it, and they open the payment account for you.
                  </p>
                ) : state === "none" ? (
                  /* The invite form is the action, handed to EmptyState rather
                     than replaced by a link. There is no separate invite route,
                     and swapping a working form for a button that goes looking
                     for one would be a step backwards dressed as a redesign. */
                  <EmptyState
                    heading="You need a parent or guardian"
                    action={<InviteGuardian founderId={founderId} />}
                  >
                    A verified adult is required because you&rsquo;re under 18. Your guardian
                    makes their own login and completes the identity checks. You keep control of
                    products and links.
                  </EmptyState>
                ) : (
                  <div className="stack">
                    {state === "pending" && consent && (
                      <Notice tone="amber" head={`Waiting for ${consent.invitedEmail}`}>
                        Sent on {fmtDate(consent.invitedAt)}. The code expires on{" "}
                        {fmtDate(consent.inviteExpiresAt)}. They need to sign in to their own guardian
                        account to accept.
                      </Notice>
                    )}
                    {state === "declined" && consent && (
                      <Notice tone="clay" head="Your guardian declined">
                        {consent.invitedEmail} answered no. Talk to them, or invite a different adult.
                        Nothing can take a payment until someone consents.
                      </Notice>
                    )}
                    {state === "expired" && consent && (
                      <Notice tone="grey" head={`Expired on ${fmtDate(consent.inviteExpiresAt)}`}>
                        The code sent to {consent.invitedEmail} was never used and has stopped
                        working. Sending a new one replaces it.
                      </Notice>
                    )}
                    {/* They opened a dead link and asked for another. This is the
                        one thing blocking the account, and the person waiting has
                        no way to move it forward themselves. */}
                    {consent?.newLinkRequestedAt && (
                      <Notice
                        tone="amber"
                        head={`${consent.invitedEmail} asked for a new link`}
                      >
                        On {fmtDate(consent.newLinkRequestedAt)}. The invitation they have does not
                        work for them{state === "declined" ? ", and they have had second thoughts" : ""}.
                        Send a new one below and it goes to the same address.
                      </Notice>
                    )}
                    {consent && <ResendInvite email={consent.invitedEmail} founderId={founderId} />}
                  </div>
                )}
              </Section>
  
              {/* ---------------- 3. payments ---------------- */}
              <Section
                title="Payments"
                aside={
                  account?.status === "ACTIVE" ? <span className="badge b-pine">Live</span>
                    : account?.status === "REQUIREMENTS_DUE" ? <span className="badge b-amber">Action needed</span>
                      : account?.status === "PENDING" ? <span className="badge b-slate">Setting up</span>
                        : account?.status === "RESTRICTED" || account?.status === "DISCONNECTED"
                          ? <span className="badge b-clay">On hold</span>
                          : <span className="badge b-grey">Not started</span>
                }
              >
                {state !== "consented" ? (
                  <Notice tone="grey" head="A guardian comes first">
                    {state === "none"
                      ? "Invite a parent or guardian. Payment setup cannot start until an adult has consented."
                      : "Payment setup starts once your guardian accepts. Nothing here is yours to do yet."}
                  </Notice>
                ) : !account || account.status === "NOT_STARTED" || account.status === "AWAITING_GUARDIAN" ? (
                  <Notice tone="amber" head={`${guardianName} will set up payments`}>
                    This one is not yours to do. It is the adult on the account who gets
                    verified, so your guardian signs in and completes the form as themselves.
                  </Notice>
                ) : account.status === "PENDING" ? (
                  <Notice tone="slate" head="Setting up…">
                    Everything asked for has been sent. This is waiting on the processor, not on
                    you or your guardian. It usually clears on its own.
                  </Notice>
                ) : account.status === "REQUIREMENTS_DUE" ? (
                  <div>
                    <p className="body" style={{ marginTop: 0 }}>
                      The processor still needs {due.length === 1 ? "one thing" : `${due.length} things`} before
                      this account can take payments. {guardianName} supplies{" "}
                      {due.length === 1 ? "it" : "them"} in its own form. Veyro never sees
                      identity documents.
                    </p>
                    {due.length > 0 ? (
                      <Requirements items={due} />
                    ) : (
                      <Notice tone="grey" head="Nothing itemised yet">
                        The account has been flagged but no outstanding field has been named.
                        It often resolves without anyone doing anything.
                      </Notice>
                    )}
                  </div>
                ) : account.status === "ACTIVE" ? (
                  <div>
                    <p className="body" style={{ marginTop: 0 }}>
                      ✓ Live{account.connectedAt ? ` since ${fmtDate(account.connectedAt)}` : ""}. Your
                      payment account can take money.
                    </p>
                    {firstLive ? (
                      <Link className="btn btn-2 btn-sm" href={`/pay/${founderId}/${firstLive.id}`}>
                        Open the checkout for “{firstLive.name}”
                      </Link>
                    ) : (
                      <p className="small" style={{ margin: 0 }}>
                        Create a live product below and its checkout link appears here.
                      </p>
                    )}
                  </div>
                ) : account.status === "DISCONNECTED" ? (
                  <Notice tone="clay" head="Account disconnected">
                    The payment connection was removed, so nothing can be sold right now.{" "}
                    <strong>{guardianName}</strong> needs to reconnect it from their own account.
                    Reconnecting is theirs to do, not yours, because they are the verified adult.
                  </Notice>
                ) : (
                  /* The only place the processor is named in this file.
                     Everywhere else it has been reframed, because the brand in
                     a status line is noise at best and, on the marketing side,
                     an invitation to go and arrange this for free. Here the
                     reader has to send someone to a specific dashboard, and an
                     instruction that will not name its destination is not an
                     instruction. */
                  <Notice tone="clay" head="This account has been restricted">
                    {account.connectedAt
                      ? `Connected on ${fmtDate(account.connectedAt)}, and since restricted. `
                      : ""}
                    {guardianName} should open their Stripe account to see what it needs. If it is not
                    clear, contact support at{" "}
                    <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                  </Notice>
                )}
              </Section>
  
              {/* ---------------- last 30 days ---------------- */}
              {/* Above the wallet on purpose. The wallet answers "where is my
                  money"; this answers "is any of this working", which is the
                  question you arrive with. */}
              {/* "Last 30 days" stood here and repeated the four figures now on the
                  rule at the top of the page. What it had that the rail does not is
                  the best seller and the caveat about how views are counted, so that
                  is what is left of it. */}
              {analytics.topProduct && (
                <p className="small" style={{ marginTop: "calc(-1 * var(--sp-5))", marginBottom: "var(--sp-7)" }}>
                  Best seller: <strong>{analytics.topProduct.name}</strong>, {analytics.topProduct.purchases}
                  {analytics.topProduct.purchases === 1 ? " sale" : " sales"} totalling{" "}
                  {formatMinor(analytics.topProduct.grossMinor, analytics.topProduct.currency)}. Views are
                  counted once per browser session, and amounts are gross, before the processing fee.
                </p>
              )}
  
              {/* The Wallet section stood here. It is the dark hero at the top of
                  the page now: it was the second money summary on one screen, with a
                  different figure from the first, and two answers to "how much do I
                  have" is worse than either alone. */}
  
              {/* ---------------- 7. recent activity ---------------- */}
              <Section title="Recent activity">
                {activityLines.length === 0 ? (
                  /* Not one of the four in the brief, but it used the same
                     component and said even less. Activity is a record of things
                     the other sections cause, so it points at the first of them
                     rather than inventing an action of its own. */
                  <EmptyState heading="Nothing has happened yet">
                    Invites, payments and payouts are listed here as they happen, newest first.
                  </EmptyState>
                ) : (
                  <div className="reqlist">
                    {activityLines.map(({ row, line }) => (
                      <div className="reqrow" key={row.id}>
                        <div>
                          <span className="req-t">{line}</span>
                          <span className="req-d">{fmtDate(row.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            <Section title="Products">
              <p className="body" style={{ margin: 0 }}>
                What people pay for, and the checkout link for each one, live on their
                own page.{" "}
                <Link className="linkbtn" href="/dashboard/founder/products">Open your products</Link>
              </p>
            </Section>
          </div>
        </details>
      </main>

    </div>
  );
}
