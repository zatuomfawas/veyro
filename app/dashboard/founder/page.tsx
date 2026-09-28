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
// the guardian is the adult Stripe verifies. A control that 403s every time is
// worse than none, so this page reports the state and names whose move it is.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { foldWallet } from "@/lib/ledger";
import { foldAnalytics } from "@/lib/analytics";
import { consentState } from "@/lib/consent";
import { describeRequirements } from "@/lib/stripe-account";
import { canTakePayment } from "@/lib/sale-rules";
import { formatMinor } from "@/lib/checkout";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Notice } from "@/app/_ui/form";
import { Requirements } from "@/app/_ui/Requirements";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { CopyLink } from "@/app/_ui/CopyLink";
import { FocusButton } from "@/app/_ui/FocusButton";
import { DashNav, Section, EmptyState, SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";

import InviteGuardian, { ResendInvite } from "./InviteGuardian";
import Notifications from "@/app/_ui/Notifications";
import NewProduct, { NAME_FIELD_ID } from "./NewProduct";
import ProductRows from "./ProductRows";
import RequestPayout from "./RequestPayout";
import {
  BusinessHeader, GuardianStatus, PaymentStatus, PrimaryAction,
  overallStatus as computeOverall,
} from "./Overview";

export const viewport = buildViewport();

// Private by definition. No canonical, no Open Graph: there is nothing here to
// share and nothing that should ever appear in a search result.
export const metadata: Metadata = {
  title: "Your business | Veyro",
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

  const [consent, account, products, transactions, wallet, activity, payouts, notifications, salesByProduct, viewsByProduct, analytics] =
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
    db.founderTransaction.groupBy({
      by: ["productId"],
      where: { founderId, status: "COMPLETED" },
      _count: { _all: true },
    }),
    // Views per product, for the editor's own little analytics strip. Joins
    // this Promise.all rather than being awaited after it: it is one indexed
    // group-by and there is no reason for the page to wait twice.
    db.checkoutView.groupBy({
      by: ["productId"],
      where: { founderId },
      _sum: { count: true },
    }),
    // Joins the same Promise.all rather than awaiting after it: it reads three
    // tables of its own and there is no reason for the page to wait twice.
    foldAnalytics(founderId, 30),
  ]);

  const state = consentState(consent);
  const guardianName = consent?.guardian?.name ?? consent?.invitedEmail ?? "Your guardian";

  // Dates cross to the client as ISO strings: a Date would be serialised
  // anyway, and being explicit keeps the component's props honest about it.
  const salesFor = new Map(salesByProduct.map((r) => [r.productId, r._count._all]));
  const viewsFor = new Map(viewsByProduct.map((r) => [r.productId, r._sum.count ?? 0]));
  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceMinor: p.priceMinor,
    currency: p.currency,
    status: p.status,
    sales: salesFor.get(p.id) ?? 0,
    views: viewsFor.get(p.id) ?? 0,
  }));

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

  const firstLive = products.find((p) => p.status === "LIVE");

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

  // This month, in the primary currency only, computed here so the toggle
  // switches between two known numbers instead of refetching.
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthMinor = transactions
    .filter((t) => t.status === "COMPLETED"
      && t.currency === (primaryFold?.currency ?? "USD")
      && t.createdAt >= monthStart)
    .reduce((total, t) => total + t.amountMinor, 0);

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
            <div className="wallethero">
              <span className="wh-label">Available to request &middot; {primaryFold.currency}</span>
              <span className="wh-big">{formatMinor(primaryFold.available, primaryFold.currency)}</span>
              <span className="wh-sub">
                {primaryFold.available > 0
                  ? "Cleared, yours, and nothing is holding it. Requesting sends it to the bank account on your payment account."
                  : "Nothing has cleared yet. Money lands here once a payment settles."}
              </span>

              <dl className="wh-break">
                <div><dt>Earned</dt><dd>{formatMinor(primaryFold.earned, primaryFold.currency)}</dd></div>
                <div><dt>Stripe fees</dt><dd data-tone="out">&minus;{formatMinor(primaryFold.fees, primaryFold.currency)}</dd></div>
                <div><dt>Refunded</dt><dd data-tone="out">&minus;{formatMinor(primaryFold.refunded, primaryFold.currency)}</dd></div>
                <div><dt>Still settling</dt><dd>{formatMinor(primaryFold.pending, primaryFold.currency)}</dd></div>
                <div><dt>Paid out</dt><dd data-tone="settled">{formatMinor(primaryFold.paidOut, primaryFold.currency)}</dd></div>
              </dl>

              {/* Never summed with the figure above: a minor-unit integer means
                  nothing without its currency, and adding JPY to USD would be a
                  lie with a decimal point in it. */}
              {otherFolds.length > 0 && (
                <p className="wh-sub" style={{ marginTop: "var(--sp-5)" }}>
                  Also holding{" "}
                  {otherFolds.map((f, i) => (
                    <span key={f.currency}>
                      {i > 0 ? ", " : ""}
                      {formatMinor(f.available, f.currency)} available in {f.currency}
                    </span>
                  ))}
                  . Each currency is kept on its own.
                </p>
              )}

              {primaryAvailable > 0 && (
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn" href="#payouts">Request a payout</Link>
                  {firstLive && (
                    <Link className="btn btn-2" href={`/pay/${founderId}/${firstLive.id}`} target="_blank" rel="noreferrer">
                      Open your checkout
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="wallethero">
              <span className="wh-label">Available to request</span>
              <span className="wh-big">{formatMinor(0, "USD")}</span>
              <span className="wh-sub">
                Nothing has sold yet. The first time someone pays, what they paid, what Stripe
                took and what you keep all appear here &mdash; and this figure is what you can
                request.
              </span>
              <div className="row" style={{ marginTop: "var(--sp-7)", gap: 8, flexWrap: "wrap" }}>
                {firstLive
                  ? (
                    <Link className="btn" href={`/pay/${founderId}/${firstLive.id}`} target="_blank" rel="noreferrer">
                      Open your checkout
                    </Link>
                  )
                  : <Link className="btn" href="#products">Set up something to sell</Link>}
              </div>
            </div>
          )}

          {/* Context, not content. Figures a founder glances at, so they sit on
              a rule rather than inside four more bordered cards on a page whose
              whole problem is bordered cards. */}
          <div className="stattiles">
            <div>
              <span className="st-n">{analytics.views}</span>
              <span className="st-l">Checkout views &middot; last {analytics.days} days</span>
            </div>
            <div>
              <span className="st-n">{analytics.purchases}</span>
              <span className="st-l">Purchases</span>
            </div>
            <div>
              <span className="st-n">{analytics.conversion === null ? "—" : Math.round(analytics.conversion * 100) + "%"}</span>
              <span className="st-l">{analytics.conversion === null ? "Conversion, once anyone looks" : "Of views that bought"}</span>
            </div>
            <div>
              <span className="st-n">{formatMinor(monthMinor, primaryFold?.currency ?? "USD")}</span>
              <span className="st-l">This month, cleared</span>
            </div>
          </div>

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

        <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
          {/* ================= left: state ================= */}
          <div>
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
                      ? "Stripe has enabled charges and payouts."
                      : account
                        ? "Your guardian finishes this on Stripe's own form."
                        : "Opens once your guardian has consented."
                  }
                />
                <SetupStep
                  done={products.some((p) => p.status === "LIVE")}
                  label="Something to sell"
                  detail={
                    products.some((p) => p.status === "LIVE")
                      ? "You have a live product with a checkout link."
                      : "Add a product and make it live to get a checkout link."
                  }
                />
                <SetupStep
                  done={transactions.length > 0}
                  label="First payment"
                  detail={
                    transactions.length > 0
                      ? "Money has come in and is in your wallet."
                      : "Share a checkout link. The first payment appears here."
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
                  the adult Stripe verifies, and they open the payment account for you.
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
                  Stripe requires a verified adult because you&rsquo;re under 18. Your guardian
                  makes their own login and completes Stripe&rsquo;s checks. You keep control of
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
                  This one is not yours to do. Stripe verifies the adult on the account, so your
                  guardian signs in and completes Stripe&rsquo;s own form as themselves.
                </Notice>
              ) : account.status === "PENDING" ? (
                <Notice tone="slate" head="Setting up…">
                  Everything asked for has been sent. This is waiting on Stripe, not on you or your
                  guardian. It usually clears on its own.
                </Notice>
              ) : account.status === "REQUIREMENTS_DUE" ? (
                <div>
                  <p className="body" style={{ marginTop: 0 }}>
                    Stripe still needs {due.length === 1 ? "one thing" : `${due.length} things`} before
                    this account can take payments. {guardianName} supplies{" "}
                    {due.length === 1 ? "it" : "them"} in Stripe&rsquo;s own form. Veyro never sees
                    identity documents.
                  </p>
                  {due.length > 0 ? (
                    <Requirements items={due} />
                  ) : (
                    <Notice tone="grey" head="Nothing itemised yet">
                      Stripe has flagged this account but has not said which field is outstanding.
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
                  The Stripe connection was removed, so nothing can be sold right now.{" "}
                  <strong>{guardianName}</strong> needs to reconnect it from their own account.
                  reconnecting is theirs to do, not yours, because Stripe verifies them.
                </Notice>
              ) : (
                <Notice tone="clay" head="Stripe has restricted this account">
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
                counted once per browser session, and amounts are gross, before Stripe&rsquo;s fee.
              </p>
            )}

            {/* The Wallet section stood here. It is the dark hero at the top of
                the page now: it was the second money summary on one screen, with a
                different figure from the first, and two answers to "how much do I
                have" is worse than either alone. */}

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
                                  ? `Sent on ${fmtDate(p.createdAt)}. Stripe pays it into the bank account on your payment account.`
                                  : failed
                                    ? `Requested ${fmtDate(p.createdAt)} and did not go through. The money is still in your wallet.`
                                    : p.status === "APPROVED"
                                      ? `Approved, waiting on Stripe. Requested ${fmtDate(p.createdAt)}.`
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
          </div>

          {/* ================= right: things ================= */}
          <div>
            {/* ---------------- 5. products ---------------- */}
            <div id="products" />
            <Section title="Products">
              {/* The list first. The create form used to sit above it, which is
                  right exactly once — the first time. Every visit after that, a
                  founder is coming back to look at what they already made, and
                  the form pushed it below the fold. The empty state still points
                  at the form, so the first run is unchanged. */}

              {products.length === 0 ? (
                <EmptyState
                  heading="No products yet"
                  action={
                    <FocusButton target={NAME_FIELD_ID} label="Create your first product" />
                  }
                  secondary={{ label: "See what checkout looks like", href: "/get-started" }}
                >
                  A product is the thing someone pays for &mdash; a commission slot, a digital
                  file, a one-off service. Create one and you get a payment link you can send
                  anywhere.
                </EmptyState>
              ) : (
                <ProductRows
                  founderId={founderId}
                  founderName={user.name}
                  products={productRows}
                  paymentsReady={canTakePayment(account)}
                />
              )}

              {/* "Another" only once there is a first. With none, the empty
                  state above already says "Create your first product", and a
                  heading contradicting it directly underneath is worse than no
                  heading at all. */}
              {products.length > 0 && (
                <>
                  <hr className="rule" style={{ margin: "var(--sp-7) 0 var(--sp-5)" }} />
                  <h3 className="h4" style={{ margin: "0 0 var(--sp-4)" }}>Add another product</h3>
                </>
              )}
              <NewProduct founderId={founderId} />

            </Section>

            {/* ---------------- 6. transactions ---------------- */}
            <Section title="Transactions">
              {transactions.length === 0 ? (
                /* Three different situations, not one. With no products at all
                   this would be the second dead end in a column that already
                   says "no products yet", so it points at that one instead of
                   repeating it. With only drafts there is nothing to copy. */
                products.length === 0 ? (
                  <EmptyState
                    heading="No payments yet"
                    action={
                      <FocusButton target={NAME_FIELD_ID} label="Create your first product" />
                    }
                  >
                    Payments show up here once you have something to sell. Start with a product,
                    and the link it gives you is what customers pay through.
                  </EmptyState>
                ) : draftsOnly ? (
                  <EmptyState
                    heading="No payments yet"
                    secondary={{ label: "Go to your products", href: "#products" }}
                  >
                    Your product is still a draft. Make it live and you&rsquo;ll get a link you
                    can send.
                  </EmptyState>
                ) : (
                  <EmptyState
                    heading="No payments yet"
                    action={<CopyLink path={payPath!} />}
                  >
                    When someone pays, it appears here within seconds &mdash; amount, product,
                    and Stripe&rsquo;s fee.
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
                                  {/* Stripe's own reference, so a founder asking
                                      about a payment can quote something Stripe
                                      recognises rather than describing it. */}
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
                                  {/* Blank rather than a guess while Stripe has
                                      not reported the fee: net is not knowable
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
          </div>
        </div>
      </main>

    </div>
  );
}
