// The founder's dashboard.
//
// A Server Component that reads the database directly rather than calling
// Veyro's own API over HTTP. The founder only ever sees their own record, which
// is what resolveScope() would resolve to anyway, so the round trip would buy
// nothing and cost a request. Every mutation still goes through the API routes
// from the client islands below, where the validation and the audit trail live.
//
// There is deliberately no "Set up payments" button here. POST
// /api/founder/payment-setup refuses a founder acting on their own behalf —
// "Payment setup is completed by your guardian, not by you." — because the
// guardian is the adult Stripe verifies. A button that 403s every time is worse
// than no button, so this page reports the state and says whose move it is.

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

import InviteGuardian from "./InviteGuardian";
import NewProduct from "./NewProduct";
import SignOut from "./SignOut";

export const viewport = buildViewport();

// Private by definition. No canonical, no Open Graph: there is nothing here to
// share and nothing that should ever appear in a search result.
export const metadata: Metadata = {
  title: "Your dashboard | Veyro",
  robots: { index: false, follow: false },
};

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** A section, as a card with a heading. */
function Section({
  title, aside, children,
}: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card" style={{ marginTop: 20 }}>
      <div className="card-h">
        <h2 className="h4" style={{ margin: 0 }}>{title}</h2>
        {aside}
      </div>
      <div className="card-b">{children}</div>
    </section>
  );
}

const TX_BADGE: Record<string, string> = {
  COMPLETED: "b-pine", PENDING: "b-amber", REFUNDED: "b-grey",
};
const PRODUCT_BADGE: Record<string, string> = {
  LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey",
};

export default async function FounderDashboard() {
  const user = await currentUser();
  if (!user) redirect("/");
  // A guardian's view of a founder is a different page with different powers.
  // Until it exists, they go home rather than see a founder's controls.
  if (user.role === "GUARDIAN") redirect("/");

  const founderId = user.id;

  const [consent, account, products, transactions, wallet] = await Promise.all([
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
  ]);

  const state: ConsentState | null = consent ? consentState(consent) : null;

  // requirementsDue is a Json column, so it is whatever was last written to it.
  // Narrow it rather than trusting the type.
  const dueCodes = Array.isArray(account?.requirementsDue)
    ? (account.requirementsDue as unknown[]).filter((c): c is string => typeof c === "string")
    : [];
  const due = describeRequirements(dueCodes, user.countryCode);

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
        <div className="page-h">
          <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>Your dashboard</h1>
          <p className="body" style={{ marginTop: 8 }}>
            Signed in as {user.name} &middot; <span className="mono">{user.email}</span>
          </p>
        </div>

        {/* ---------------- guardian ---------------- */}
        <Section
          title="Your guardian"
          aside={
            state === "consented"
              ? <span className="badge b-pine">Consented</span>
              : state === "pending"
                ? <span className="badge b-amber">Invited</span>
                : state === "declined"
                  ? <span className="badge b-clay">Declined</span>
                  : state === "expired"
                    ? <span className="badge b-grey">Expired</span>
                    : <span className="badge b-grey">None yet</span>
          }
        >
          {state === "consented" && consent ? (
            <p className="body" style={{ margin: 0 }}>
              <strong>{consent.guardian?.name ?? consent.invitedEmail}</strong> agreed on{" "}
              {fmtDate(consent.consentedAt!)}. They are the adult Stripe verifies, and they open
              the payment account for you.
            </p>
          ) : (
            <div className="stack">
              {state === "pending" && consent && (
                <Notice tone="amber" head="Waiting for your guardian">
                  Sent to <strong>{consent.invitedEmail}</strong> on {fmtDate(consent.invitedAt)}.
                  The code stops working on {fmtDate(consent.inviteExpiresAt)}. They need to sign in
                  to their own guardian account to accept.
                </Notice>
              )}
              {state === "declined" && consent && (
                <Notice tone="clay" head="Your guardian declined">
                  {consent.invitedEmail} answered no. Talk to them, or invite a different adult.
                  Nothing can take a payment until someone consents.
                </Notice>
              )}
              {state === "expired" && consent && (
                <Notice tone="grey" head="That invite expired">
                  The code sent to {consent.invitedEmail} was never used and has stopped working.
                  Send a new one.
                </Notice>
              )}
              {!consent && (
                <p className="body" style={{ margin: 0 }}>
                  You need a parent or guardian on the account before you can take money. They are
                  the adult the payment provider verifies — not the owner of your business.
                </p>
              )}
              <InviteGuardian reinvite={Boolean(consent)} />
            </div>
          )}
        </Section>

        {/* ---------------- payments ---------------- */}
        <Section
          title="Payments"
          aside={
            account?.status === "ACTIVE"
              ? <span className="badge b-pine">Live</span>
              : account?.status === "REQUIREMENTS_DUE"
                ? <span className="badge b-amber">Action needed</span>
                : account?.status === "PENDING"
                  ? <span className="badge b-slate">In review</span>
                  : account?.status === "RESTRICTED" || account?.status === "DISCONNECTED"
                    ? <span className="badge b-clay">On hold</span>
                    : <span className="badge b-grey">Not started</span>
          }
        >
          {state !== "consented" ? (
            <Notice tone="grey" head="A guardian comes first">
              {!consent
                ? "Invite a parent or guardian above. Payment setup cannot start until an adult has consented."
                : "Payment setup starts once your guardian accepts. Nothing here is yours to do yet."}
            </Notice>
          ) : !account || account.status === "NOT_STARTED" || account.status === "AWAITING_GUARDIAN" ? (
            <Notice tone="amber" head="Your guardian opens the account">
              This one is not yours to do. Stripe verifies the adult on the account, so your
              guardian signs in and completes Stripe&rsquo;s own form as themselves. Ask them to
              open payment setup from their account.
            </Notice>
          ) : account.status === "ACTIVE" ? (
            <p className="body" style={{ margin: 0 }}>
              Your payment account is live. Live products below have a checkout link you can share.
            </p>
          ) : account.status === "PENDING" ? (
            <Notice tone="slate" head="Stripe is reviewing">
              Everything asked for has been sent. This is waiting on Stripe, not on you or your
              guardian. It usually clears on its own.
            </Notice>
          ) : account.status === "REQUIREMENTS_DUE" ? (
            <div>
              <p className="body" style={{ marginTop: 0 }}>
                Stripe still needs {due.length === 1 ? "one thing" : `${due.length} things`} before
                this account can take payments. Your guardian supplies {due.length === 1 ? "it" : "them"} in
                Stripe&rsquo;s own form — Veyro never sees identity documents.
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
                  Stripe has flagged this account but has not said which field is outstanding. It
                  often resolves without anyone doing anything.
                </Notice>
              )}
            </div>
          ) : (
            <Notice tone="clay" head="This account is on hold">
              {account.status === "DISCONNECTED"
                ? "The Stripe connection was removed. Your guardian needs to reconnect it before anything can be sold."
                : "Stripe has restricted this account. Your guardian should open their Stripe account to see what it needs."}
            </Notice>
          )}
        </Section>

        {/* ---------------- wallet ---------------- */}
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
                      <Notice tone="clay" head="These figures do not reconcile">
                        The fold disagrees with itself for {c.currency}, so the balance below is not
                        trustworthy. Nothing has been lost — the records are intact — but do not act
                        on this number until it is looked at.
                      </Notice>
                    </div>
                  )}
                  <div className="tblwrap">
                    <table className="tbl">
                      <caption className="captbl" style={{ textAlign: "left" }}>
                        {c.currency}
                      </caption>
                      <tbody>
                        <tr>
                          <th scope="row">Available to pay out</th>
                          <td className="num" style={{ textAlign: "right", fontWeight: 560 }}>
                            {formatMinor(c.available, c.currency)}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Earned</th>
                          <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.earned, c.currency)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Still settling</th>
                          <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.pending, c.currency)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Refunded</th>
                          <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.refunded, c.currency)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Committed to a payout</th>
                          <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.reserved, c.currency)}</td>
                        </tr>
                        <tr>
                          <th scope="row">Already paid out</th>
                          <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.paidOut, c.currency)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <p className="tiny" style={{ margin: 0 }}>
                Folded from your own records at {new Date(wallet.asOf).toLocaleTimeString("en-GB")}.
                No balance is stored, so this cannot drift from the transactions below.
              </p>
            </div>
          )}
        </Section>

        {/* ---------------- products ---------------- */}
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
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className="num">{formatMinor(p.priceMinor, p.currency)}</td>
                      <td>
                        <span className={"badge " + (PRODUCT_BADGE[p.status] ?? "b-grey")}>
                          {p.status === "LIVE" ? "Live" : p.status === "DRAFT" ? "Draft" : "Archived"}
                        </span>
                      </td>
                      <td>
                        {p.status === "LIVE" ? (
                          <Link className="linkbtn" href={`/pay/${founderId}/${p.id}`}>
                            Open checkout
                          </Link>
                        ) : (
                          // Checkout refuses anything not LIVE, so linking it
                          // would only produce a dead end.
                          <span className="tiny">Live products only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ---------------- transactions ---------------- */}
        <Section title="Transactions">
          {transactions.length === 0 ? (
            <div className="empty">
              <p className="body" style={{ margin: 0 }}>
                No payments yet. Every completed payment is recorded here from Stripe&rsquo;s own
                signed webhook — never from the customer&rsquo;s browser.
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
                          {t.status === "COMPLETED" ? "Paid"
                            : t.status === "PENDING" ? "Settling" : "Refunded"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
