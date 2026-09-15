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
import { consentState, type ConsentState } from "@/lib/consent";
import { describeRequirements } from "@/lib/stripe-account";
import { formatMinor } from "@/lib/checkout";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { Notice } from "@/app/_ui/form";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";

import InviteGuardian, { ResendInvite } from "./InviteGuardian";
import NewProduct from "./NewProduct";
import SignOut from "./SignOut";

export const viewport = buildViewport();

// Private by definition. No canonical, no Open Graph: there is nothing here to
// share and nothing that should ever appear in a search result.
export const metadata: Metadata = {
  title: "Your business | Veyro",
  robots: { index: false, follow: false },
};

const SUPPORT_EMAIL = "hello@withveyro.com";

const COUNTRY_NAME = new Map(SIGNUP_COUNTRIES);

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ---------------- overall status ---------------- */

type Overall = "setup_incomplete" | "awaiting_guardian" | "live" | "restricted";

const OVERALL: Record<Overall, { label: string; badge: string }> = {
  live: { label: "Live", badge: "b-pine" },
  restricted: { label: "On hold", badge: "b-clay" },
  awaiting_guardian: { label: "Waiting on your guardian", badge: "b-amber" },
  setup_incomplete: { label: "Setup incomplete", badge: "b-slate" },
};

function overallStatus(state: ConsentState, accountStatus: string | undefined): Overall {
  if (accountStatus === "ACTIVE") return "live";
  if (accountStatus === "RESTRICTED" || accountStatus === "DISCONNECTED") return "restricted";
  // Before an account exists, the next move belongs to the guardian either way:
  // they consent, then they open it.
  if (state !== "consented") return "awaiting_guardian";
  if (!accountStatus || accountStatus === "NOT_STARTED" || accountStatus === "AWAITING_GUARDIAN") {
    return "awaiting_guardian";
  }
  return "setup_incomplete";
}

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

function Section({
  title, aside, children,
}: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <div className="card-h">
        <h2 className="h4" style={{ margin: 0 }}>{title}</h2>
        {aside}
      </div>
      <div className="card-b">{children}</div>
    </section>
  );
}

const TX_BADGE: Record<string, string> = { COMPLETED: "b-pine", PENDING: "b-amber", REFUNDED: "b-grey" };
const TX_LABEL: Record<string, string> = { COMPLETED: "Paid", PENDING: "Settling", REFUNDED: "Refunded" };
const PRODUCT_BADGE: Record<string, string> = { LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey" };

/* ---------------- page ---------------- */

export default async function FounderDashboard() {
  const user = await currentUser();
  if (!user) redirect("/");
  // Not "is a guardian": Role is FOUNDER | GUARDIAN | ADMIN, and an admin
  // landing here would get a founder dashboard scoped to their own id.
  if (user.role !== "FOUNDER") redirect("/");

  const founderId = user.id;

  const [consent, account, products, transactions, wallet, activity] = await Promise.all([
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
  ]);

  const state = consentState(consent);
  const guardianName = consent?.guardian?.name ?? consent?.invitedEmail ?? "Your guardian";
  const overall = overallStatus(state, account?.status);

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

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="wrap-n">
        <div className="lp-nav">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <div className="lp-links">
            <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
            <SignOut />
          </div>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 28, paddingBottom: 80 }}>
        {/* ---------------- 1. header ---------------- */}
        <div className="page-h" style={{ marginBottom: 24 }}>
          <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 className="d2" style={{ fontSize: "var(--fs-8)", margin: 0 }}>Your business</h1>
            <span className={"badge " + OVERALL[overall].badge}>{OVERALL[overall].label}</span>
          </div>
          <p className="body" style={{ marginTop: 8 }}>
            {user.name} &middot; {COUNTRY_NAME.get(user.countryCode) ?? user.countryCode}
          </p>
        </div>

        <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>
          {/* ================= left: state ================= */}
          <div>
            {/* ---------------- 2. guardian ---------------- */}
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
                    verifies — not the owner of your business.
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
                    {due.length === 1 ? "it" : "them"} in Stripe&rsquo;s own form — Veyro never sees
                    identity documents.
                  </p>
                  {due.length > 0 ? (
                    <div className="reqlist">
                      {due.map((r) => (
                        <div className="reqrow" key={r.code}>
                          <div>
                            <span className="req-t">{r.label}</span>
                            <span className="req-d mono">{r.code}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                  <strong>{guardianName}</strong> needs to reconnect it from their own account —
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
                <div className="empty">
                  <p className="body" style={{ margin: 0 }}>
                    Nothing yet. Money appears here once a customer pays.
                  </p>
                </div>
              ) : (
                <div className="stack">
                  {wallet.currencies.map((c) => (
                    <div key={c.currency}>
                      {!c.balances && (
                        <div style={{ marginBottom: 10 }}>
                          <Notice tone="clay" head="Balances don&rsquo;t reconcile">
                            The fold disagrees with itself for {c.currency}, so the figures below are
                            not trustworthy. Nothing has been lost — the records are intact — but
                            contact support at{" "}
                            <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
                            before acting on this.
                          </Notice>
                        </div>
                      )}
                      <p className="body" style={{ margin: "0 0 8px", fontWeight: 560 }}>
                        {c.currency} {formatMinor(c.available, c.currency)} available
                      </p>
                      <div className="tblwrap">
                        <table className="tbl">
                          <tbody>
                            {([
                              ["Earned", c.earned],
                              ["Refunded", c.refunded],
                              ["Still settling", c.pending],
                              ["Committed to a payout", c.reserved],
                              ["Already paid out", c.paidOut],
                            ] as const).map(([label, value]) => (
                              <tr key={label}>
                                <th scope="row">{label}</th>
                                <td className="num" style={{ textAlign: "right" }}>
                                  {formatMinor(value, c.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  <p className="tiny" style={{ margin: 0 }}>
                    Folded from your own records. No balance is stored, so this cannot drift from
                    the transactions beside it.
                  </p>
                </div>
              )}
            </Section>

            {/* ---------------- 7. recent activity ---------------- */}
            <Section title="Recent activity">
              {activityLines.length === 0 ? (
                <div className="empty">
                  <p className="body" style={{ margin: 0 }}>Nothing has happened yet.</p>
                </div>
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
            <Section title="Products">
              <NewProduct />

              <hr className="rule" style={{ margin: "24px 0 18px" }} />

              {products.length === 0 ? (
                <div className="empty">
                  <p className="body" style={{ margin: 0 }}>Nothing listed yet.</p>
                </div>
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
                <div className="empty">
                  <p className="body" style={{ margin: 0 }}>
                    No transactions yet. Every completed payment is recorded here from
                    Stripe&rsquo;s own signed webhook — never from the customer&rsquo;s browser.
                  </p>
                </div>
              ) : (
                <div className="tblwrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Product</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td className="num">{fmtDate(t.createdAt)}</td>
                          <td>{t.product?.name ?? "—"}</td>
                          <td className="num">{formatMinor(t.amountMinor, t.currency)}</td>
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

      <SiteFooter />
    </div>
  );
}
