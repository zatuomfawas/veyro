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

import { Notice } from "@/app/_ui/form";
import { Requirements } from "@/app/_ui/Requirements";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { DashNav, Section, EmptyState, SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";

import InviteGuardian, { ResendInvite } from "./InviteGuardian";
import Notifications from "@/app/_ui/Notifications";
import { AddToApp } from "./AddToApp";
import { RevealAnchor } from "./RevealAnchor";
import RequestPayout from "./RequestPayout";
import { EarningsHero, RevenueDetails } from "./EarningsHero";
import { PayoutOverview } from "./PayoutOverview";
import { Analytics } from "./Analytics";
import { Accordion } from "@/app/_ui/Accordion";
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

const TX_BADGE: Record<string, string> = { COMPLETED: "b-pine", PENDING: "b-amber", REFUNDED: "b-clay" };
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


  const needsSetup = state !== "consented" || account?.status !== "ACTIVE" || !firstLive || Boolean(consent?.newLinkRequestedAt);
  const responseNeeded = disputes.filter((d) => d.state === "NEEDS_RESPONSE").length;
  const disputeRows = disputes.map((d) => ({
    id: d.id, stripeDisputeId: d.stripeDisputeId, amountMinor: d.amountMinor,
    currency: d.currency, reason: d.reason, state: d.state,
    evidenceDueBy: d.evidenceDueBy?.toISOString() ?? null,
    openedAt: d.openedAt.toISOString(),
  }));

  return (
    <div className="fw founder-dashboard">
      <DashNav role="FOUNDER" current="dashboard" />
      <RevealAnchor />
      <main id="main" className="wrap-w dashboard-main">
        <BusinessHeader
          name={user.name}
          country={COUNTRY_NAME.get(user.countryCode) ?? user.countryCode}
          status={computeOverall(state, account?.status)}
          email={user.email}
        />
        <nav className="dashboard-subnav" aria-label="On this page">
          <a href="#transactions">Transactions</a>
          <a href="#payouts">Payout requests</a>
          <a href="#revenue-details">Revenue &amp; fees</a>
          <a href="#account-setup">Account &amp; setup</a>
        </nav>

        {needsSetup && (
          <section className="dashboard-actions" aria-labelledby="action-heading">
            <div className="dashboard-action-context">
              <h2 className="h4" id="action-heading">
                {consent?.newLinkRequestedAt ? "Your guardian needs a new invite"
                  : state === "none" ? "Start with your guardian"
                  : state === "declined" || state === "expired" ? "Send a new guardian invite"
                  : account?.status === "ACTIVE" ? "Get your checkout ready"
                  : "Payment setup"}
              </h2>
              <div className="dashboard-action-status">
                <GuardianStatus state={state} guardianName={guardianName}
                  invitedEmail={consent?.invitedEmail} consentedAt={consent?.consentedAt}
                  expiresAt={consent?.inviteExpiresAt} />
                <PaymentStatus accountStatus={account?.status} requirements={due}
                  guardianName={guardianName} connectedAt={account?.connectedAt} />
              </div>
            </div>
            <div className="dashboard-action-control">
              {consent?.newLinkRequestedAt
                ? <Link className="btn" href="#guardian">Send a new invite</Link>
                : <PrimaryAction state={state} accountStatus={account?.status} />}
              <Link className="linkbtn" href="#account-setup">View setup &middot; {setupDone} of {setupTotal}</Link>
            </div>
          </section>
        )}
        <div className="dashboard-top">
          <EarningsHero fold={primaryFold} otherFolds={otherFolds}
            checkoutHref={snippetLive ? payPath : null} />
          <PayoutOverview schedule={payoutSchedule} latest={payouts[0] ?? null}
            hasAccount={Boolean(account?.providerAccountId)} guardianName={guardianName} />
        </div>

        {responseNeeded > 0 && (
          <Notice tone="clay" head={`${responseNeeded} disputed ${responseNeeded === 1 ? "payment needs" : "payments need"} a response`}>
            {guardianName} responds in Stripe. <Link className="linkbtn" href="#disputes">View the dispute and deadline</Link>.
          </Notice>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-primary">
            <Section title="Recent transactions" id="transactions" className="anchor dashboard-transactions"
              aside={transactions.length > 0 ? <span className="small">Latest {transactions.length}</span> : undefined}>
              {transactions.length === 0 ? (
                <EmptyState heading="No payments yet"
                  action={products.length === 0
                    ? { label: "Create your first product", href: "/dashboard/founder/products" }
                    : { label: "Get integration code", href: "#integrate" }}
                  secondary={products.length > 0
                    ? draftsOnly || !canCharge
                      ? { label: draftsOnly ? "Set your product live" : "View payment setup", href: draftsOnly ? "/dashboard/founder/products" : "#account-setup" }
                      : { label: "Open your checkout", href: payPath! }
                    : undefined}>
                  {products.length === 0
                    ? "Create a product, then add your checkout to your app. Customer payments will appear here."
                    : draftsOnly
                      ? "Your product is still a draft. You can integrate the code now, then set it live when payment setup is complete."
                      : !canCharge
                        ? "Your guardian needs to finish payment setup before customers can pay. You can prepare your integration in the meantime."
                        : "Your checkout is ready. Share it or add it to your app; customer payments and their processing status will appear here."}
                </EmptyState>
              ) : Object.entries(
                transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
                  const day = fmtDate(t.createdAt);
                  (acc[day] ??= []).push(t);
                  return acc;
                }, {}),
              ).map(([day, rows]) => {
                const cur = rows[0].currency;
                const sameCurrency = rows.every((r) => r.currency === cur);
                const cleared = rows
                  .filter((r) => r.status === "COMPLETED" && r.feeMinor != null)
                  .reduce((n, r) => n + (r.amountMinor - (r.feeMinor ?? 0)), 0);
                return (
                  <div className="txgroup" key={day}>
                    <div className="txday">
                      <span className="txday-d">{day}</span>
                      {sameCurrency && cleared > 0 && <span className="txday-t num">{formatMinor(cleared, cur)} after fees</span>}
                    </div>
                    <ul className="txlist" aria-label={`Payments on ${day}`}>
                      {rows.map((t) => {
                        const refunded = t.status === "REFUNDED";
                        const settled = t.status === "COMPLETED" && t.feeMinor != null;
                        return (
                          <li className="txrow" key={t.id}>
                            <div className="tx-identity">
                              <span className="tx-name">{t.product?.name ?? "None"}</span>
                              <span className="tx-ref" title={t.stripePaymentIntentId}>Reference: {t.stripePaymentIntentId}</span>
                              {t.refundedMinor > 0 && <span className="tx-adjustments" data-tone="clay">Refund recorded: {formatMinor(t.refundedMinor, t.currency)}</span>}
                              {t.disputedMinor > 0 && <span className="tx-adjustments" data-tone="clay">Dispute loss recorded: {formatMinor(t.disputedMinor, t.currency)}</span>}
                            </div>
                            <div className="tx-financial">
                              <span className="tx-amount"><span className="tx-field-label">Paid &middot; {t.currency}</span><span className="num">{formatMinor(t.amountMinor, t.currency)}</span></span>
                              <span className="tx-fee"><span className="tx-field-label">Processing fee</span><span className="num">{t.feeMinor == null ? "Not reported yet" : formatMinor(t.feeMinor, t.currency)}</span></span>
                              <span className="tx-net" data-tone={refunded ? "out" : settled ? "settled" : undefined}><span className="tx-field-label">{refunded ? "Refund status" : "After fees"}</span><span className="num">{refunded ? "Refunded" : t.feeMinor == null ? "—" : formatMinor(t.amountMinor - t.feeMinor, t.currency)}</span></span>
                            </div>
                            <span className={"badge tx-status " + (TX_BADGE[t.status] ?? "b-grey")}>{TX_LABEL[t.status] ?? t.status}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {transactions.length > 0 && <p className="transaction-note small">Amounts remain in their original currency. A fee that Stripe has not reported is shown as unknown, never as zero.</p>}
            </Section>

            {responseNeeded > 0 && (
              <Section title="Disputes" id="disputes" className="anchor">
                <Disputes rows={disputeRows} eligible={eligibility.eligible} guardianName={guardianName} />
              </Section>
            )}
          </div>
          <aside className="dashboard-aside" aria-label="Payout requests and updates">
            <Section title="Request a payout" id="payouts" className="anchor dashboard-payouts"
              aside={<span className="balance-currency">{primaryCurrency}</span>}>
              {primaryFold && primaryFold.currency !== primaryCurrency && (
                <p className="small payout-currency-note">The overview above is in {primaryFold.currency}. This request uses {primaryCurrency}, the currency with the most available to request. Currencies are never combined.</p>
              )}
              <RequestPayout currency={primaryCurrency} availableMinor={primaryAvailable}
                accountActive={account?.status === "ACTIVE"} />
              {payouts.length > 0 && (
                <div className="payout-history">
                  <h3 className="h4">Request history</h3>
                  <ol className="tl payoutline" aria-label="Payout requests, newest first">
                    {payouts.map((p) => {
                      const done = p.status === "SENT";
                      const failed = p.status === "FAILED";
                      return (
                        <li key={p.id}>
                          <span className="pt" data-on={failed ? "bad" : done ? "done" : "waiting"} aria-hidden="true" />
                          <div>
                            <span className="tl-t">
                              <span className="po-amt num">{formatMinor(p.amountMinor, p.currency)} <span className="payout-history-currency">{p.currency}</span></span>
                              <span className={"badge " + (PAYOUT_BADGE[p.status] ?? "b-grey")}>{p.status.charAt(0) + p.status.slice(1).toLowerCase()}</span>
                            </span>
                            <span className="tl-d">Requested {fmtDate(p.createdAt)}.</span>
                            <span className="tl-d">{done
                              ? "Recorded as sent to the bank account on your payment account."
                              : failed ? "Did not go through. This request is no longer reserved from your available balance."
                              : p.status === "APPROVED" ? "Approved; not yet recorded as sent."
                              : "Reserved from your available balance; not yet recorded as sent."}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </Section>
            <Notifications rows={notificationRows} />
          </aside>
        </div>

        <div className="dashboard-disclosures">
          <Accordion className="dashboard-disclosure" summary={<span className="dashboard-disclosure-title">Add payments to your app</span>} defaultOpen={transactions.length === 0 && snippetLive}>
            {snippetProduct ? (
              <AddToApp productId={snippetProduct.id} productName={snippetProduct.name}
                live={snippetLive} blockedReason={snippetBlocked} />
            ) : (
              <div className="dashboard-disclosure-inner" id="integrate">
                <EmptyState heading="Start with a product" action={{ label: "Create a product", href: "/dashboard/founder/products" }}>Your integration uses a product ID. Create the product first, then return for the code.</EmptyState>
              </div>
            )}
          </Accordion>

          <Accordion className="dashboard-disclosure" summary={<span className="dashboard-disclosure-title">Revenue &amp; fees</span>}>
            <div className="dashboard-disclosure-inner anchor" id="revenue-details">
              <RevenueDetails folds={byEarned} payments={paymentCount} series={weekSeries} />
              <ThisMonth qmeMinor={qmeMinor} feeMinor={monthFeeMinor} currency="USD"
                collecting={collecting} crossed={crossedThreshold} />
              <section className="dashboard-report-section" aria-labelledby="analytics-heading">
                <h3 id="analytics-heading" className="h4">Last 30 days</h3>
                <Analytics fold={analytics} hasProducts={products.length > 0} />
              </section>
              {summaryYears.length > 0 && (
                <section className="dashboard-report-section" aria-labelledby="annual-heading">
                  <h3 className="h4" id="annual-heading">Annual earnings &amp; payout summary</h3>
                  <p className="small">A record for any year you earned over $100 in at least one month, to share with an accountant. It is not tax advice or a document to file.</p>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {summaryYears.map((y) => <a key={y} className="btn btn-2 btn-sm" href={`/api/founder/annual-summary?year=${y}`}>Download {y}</a>)}
                  </div>
                </section>
              )}
            </div>
          </Accordion>

          <Accordion className="dashboard-disclosure" summary={<span className="dashboard-disclosure-title">Account &amp; setup <span className="dashboard-disclosure-meta">{setupDone} of {setupTotal} complete</span></span>}>
            <div className="dashboard-disclosure-inner anchor" id="account-setup">
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
                        ? "A payment has been recorded. Its status is shown in transactions."
                        : "Share your checkout link. The first payment shows up here."
                    }
                  />
                </div>
              </Section>
  
              
              <div id="guardian" className="anchor" />
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
                      Live{account.connectedAt ? ` since ${fmtDate(account.connectedAt)}` : ""}. Your
                      payment account can take money.
                    </p>
                    {firstLive ? (
                      <Link className="btn btn-2 btn-sm" href={`/pay/${founderId}/${firstLive.id}`}>
                        Open the checkout for “{firstLive.name}”
                      </Link>
                    ) : (
                      <p className="small" style={{ margin: 0 }}>
                        Set a product live on your products page and its checkout link appears here.
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
  

              <div id="products" className="anchor" />
              <Section title="Products">
                <p className="body" style={{ margin: 0 }}>Manage what customers pay for and each checkout link on your <Link className="linkbtn" href="/dashboard/founder/products">products page</Link>.</p>
              </Section>
            </div>
          </Accordion>

          <Accordion className="dashboard-disclosure" summary={<span className="dashboard-disclosure-title">Payout schedule &amp; support</span>}>
            <div className="dashboard-disclosure-inner">
              <Section title="Payout frequency"><PayoutSupport schedule={payoutSchedule} eligible={eligibility.eligible} guardianName={guardianName} /></Section>
              <Section title="Support"><SupportCard founderId={founderId} eligible={eligibility.eligible} guardianName={guardianName} /></Section>
              {responseNeeded === 0 && <Section title="Disputes" id="disputes" className="anchor"><Disputes rows={disputeRows} eligible={eligibility.eligible} guardianName={guardianName} /></Section>}
            </div>
          </Accordion>

          <Accordion className="dashboard-disclosure" summary={<span className="dashboard-disclosure-title">Account activity</span>}>
            <div className="dashboard-disclosure-inner">
              {activityLines.length === 0 ? (
                <EmptyState heading="No account activity yet">Invites, payments and payouts are recorded here as they happen.</EmptyState>
              ) : (
                <ul className="account-activity-list">
                  {activityLines.map(({ row, line }) => <li key={row.id}><span>{line}</span><time dateTime={row.createdAt.toISOString()}>{fmtDate(row.createdAt)}</time></li>)}
                </ul>
              )}
            </div>
          </Accordion>
        </div>
      </main>
    </div>
  );
}
