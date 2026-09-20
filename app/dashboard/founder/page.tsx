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
import { consentState } from "@/lib/consent";
import { describeRequirements } from "@/lib/stripe-account";
import { formatMinor } from "@/lib/checkout";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Notice } from "@/app/_ui/form";
import { Requirements } from "@/app/_ui/Requirements";
import { MoneyPosition } from "@/app/_ui/MoneyPosition";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { DashNav, Section, EmptyState, SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";

import InviteGuardian, { ResendInvite } from "./InviteGuardian";
import NewProduct from "./NewProduct";
import RequestPayout from "./RequestPayout";
import {
  BusinessHeader, RevenueCard, GuardianStatus, PaymentStatus, PrimaryAction,
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
const PRODUCT_BADGE: Record<string, string> = { LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey" };
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

  const [consent, account, products, transactions, wallet, activity, payouts] = await Promise.all([
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
  ]);

  const state = consentState(consent);
  const guardianName = consent?.guardian?.name ?? consent?.invitedEmail ?? "Your guardian";

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

      <main id="main" className="wrap-w" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {/* ---------------- header ---------------- */}
        <BusinessHeader
          name={user.name}
          country={COUNTRY_NAME.get(user.countryCode) ?? user.countryCode}
          status={computeOverall(state, account?.status)}
        />

        {/* ---------------- the two questions ----------------
            "How much have I made" on the left, "what happens next" on the
            right. grid-2 collapses at 760px with revenue first, which is the
            right order on a phone too. */}
        <div className="grid-2" style={{ gap: "var(--sp-7)", alignItems: "start", marginBottom: "var(--sp-7)" }}>
          <RevenueCard
            fold={primaryFold}
            monthMinor={monthMinor}
            otherCurrencies={otherFolds}
            hasTransactions={transactions.length > 0}
            firstLiveHref={firstLive ? `/pay/${founderId}/${firstLive.id}` : null}
          />

          <div className="card">
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

              <p className="tiny" style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}>
                <span className="mono">{user.email}</span> &middot;{" "}
                <Link className="linkbtn" href="/dashboard/settings">Account settings</Link>
              </p>
            </div>
          </div>
        </div>

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
                <div className="stack">
                  <p className="body" style={{ margin: 0 }}>
                    Invite a guardian to get started. They are the adult the payment provider
                    verifies, not the owner of your business.
                  </p>
                  <InviteGuardian founderId={founderId} />
                </div>
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

            {/* ---------------- 4. wallet ---------------- */}
            <Section title="Wallet">
              {wallet.currencies.length === 0 ? (
                <EmptyState>
                  <p className="body" style={{ margin: 0 }}>
                    Nothing yet. Money appears here once a customer pays.
                  </p>
                </EmptyState>
              ) : (
                <div className="stack">
                  {wallet.currencies.map((c) => (
                    <MoneyPosition key={c.currency} fold={c} />
                  ))}
                  <p className="tiny" style={{ margin: 0 }}>
                    Folded from your own records. No balance is stored, so this cannot drift from
                    the transactions beside it.
                  </p>
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
                  <div className="tblwrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col" style={{ textAlign: "right" }}>Amount</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((p) => (
                          <tr key={p.id}>
                            <td className="num">{fmtDate(p.createdAt)}</td>
                            <td className="num" style={{ textAlign: "right" }}>
                              {formatMinor(p.amountMinor, p.currency)}
                            </td>
                            <td>
                              <span className={"badge " + (PAYOUT_BADGE[p.status] ?? "b-grey")}>
                                {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Section>

            {/* ---------------- 7. recent activity ---------------- */}
            <Section title="Recent activity">
              {activityLines.length === 0 ? (
                <EmptyState>
                  <p className="body" style={{ margin: 0 }}>Nothing has happened yet.</p>
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
              <NewProduct founderId={founderId} />

              <hr className="rule" style={{ margin: "24px 0 18px" }} />

              {products.length === 0 ? (
                <EmptyState>
                  <p className="body" style={{ margin: 0 }}>Nothing listed yet.</p>
                </EmptyState>
              ) : (
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                        <th scope="col">Checkout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const live = p.status === "LIVE";
                        return (
                          <tr key={p.id} style={live ? undefined : { color: "var(--ink-3)" }}>
                            <td>{p.name}</td>
                            <td className="num">{formatMinor(p.priceMinor, p.currency)}</td>
                            <td>
                              <span className={"badge " + (PRODUCT_BADGE[p.status] ?? "b-grey")}>
                                {p.status === "LIVE" ? "Live" : p.status === "DRAFT" ? "Draft" : "Archived"}
                              </span>
                            </td>
                            <td>
                              {live ? (
                                <Link className="linkbtn" href={`/pay/${founderId}/${p.id}`}>
                                  Open checkout
                                </Link>
                              ) : (
                                // Checkout refuses anything not LIVE, so a link
                                // here would only be a dead end.
                                <span className="tiny">(not published)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* ---------------- 6. transactions ---------------- */}
            <Section title="Transactions">
              {transactions.length === 0 ? (
                <EmptyState>
                  <p className="body" style={{ margin: 0 }}>
                    No transactions yet. Every completed payment is recorded here from
                    Stripe&rsquo;s own signed webhook, never from the customer&rsquo;s browser.
                  </p>
                </EmptyState>
              ) : (
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Product</th>
                        <th scope="col" style={{ textAlign: "right" }}>Paid</th>
                        <th scope="col" style={{ textAlign: "right" }}>Fee</th>
                        <th scope="col" style={{ textAlign: "right" }}>Net</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="num">{fmtDate(t.createdAt)}</td>
                          <td>
                            {t.product?.name ?? "None"}
                            {/* The provider's own reference, so a founder asking
                                us about a payment can quote something Stripe
                                recognises rather than describing it. */}
                            <span className="req-d mono" style={{ fontSize: "var(--fs-1)" }}>
                              {t.stripePaymentIntentId}
                            </span>
                          </td>
                          <td className="num" style={{ textAlign: "right" }}>
                            {formatMinor(t.amountMinor, t.currency)}
                          </td>
                          <td className="num" style={{ textAlign: "right" }}>
                            {t.feeMinor == null
                              ? <span className="tiny">Pending</span>
                              : "− " + formatMinor(t.feeMinor, t.currency)}
                          </td>
                          <td className="num" style={{ textAlign: "right", fontWeight: 560 }}>
                            {/* Net per row, so "paid" and "kept" can never be
                                read as the same number. Blank rather than a
                                guess while Stripe has not reported the fee. */}
                            {t.feeMinor == null
                              ? <span className="tiny">&mdash;</span>
                              : formatMinor(t.amountMinor - t.feeMinor, t.currency)}
                          </td>
                          <td>
                            <span className={"badge " + (TX_BADGE[t.status] ?? "b-grey")}>
                              {TX_LABEL[t.status] ?? t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        </div>
      </main>

    </div>
  );
}
