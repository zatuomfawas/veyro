// The guardian's dashboard — the mirror of the founder's.
//
// What differs is not the data but who may act on it. The guardian is the adult
// Stripe verifies, so payment setup lives here and only here: POST
// /api/founder/payment-setup refuses the founder on their own behalf. Everything
// about the business itself — products, money — is read-only. A guardian
// oversees; they do not run the shop.
//
// Which founders appear comes from guardianScopeWhere(), the same clause
// isGuardianOf() uses to authorise a single founder. Re-deriving it here is how
// a dashboard ends up listing a founder whose consent has since expired.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buildViewport } from "@/lib/seo";
import { currentUser, guardianScopeWhere } from "@/lib/auth";
import { db } from "@/lib/db";
import { foldWallet, type Wallet } from "@/lib/ledger";
import { describeRequirements } from "@/lib/stripe-account";
import { formatMinor } from "@/lib/checkout";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Notice } from "@/app/_ui/form";
import { Requirements } from "@/app/_ui/Requirements";
import SetUpPayments from "@/app/_ui/SetUpPayments";
import Notifications from "@/app/_ui/Notifications";
import { DashNav, DashHeader, Section, EmptyState, SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Guardian dashboard | Veyro",
  robots: { index: false, follow: false },
};

const PAYOUT_BADGE: Record<string, string> = {
  REQUESTED: "b-amber", APPROVED: "b-slate", SENT: "b-pine", FAILED: "b-clay",
};
const PRODUCT_BADGE: Record<string, string> = {
  LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey",
};

function AccountBadge({ status }: { status?: string }) {
  if (status === "ACTIVE") return <span className="badge b-pine">Live</span>;
  if (status === "REQUIREMENTS_DUE") return <span className="badge b-amber">Needs you</span>;
  if (status === "PENDING") return <span className="badge b-slate">In review</span>;
  if (status === "RESTRICTED" || status === "DISCONNECTED") return <span className="badge b-clay">On hold</span>;
  return <span className="badge b-grey">Not started</span>;
}

function WalletSummary({ wallet }: { wallet: Wallet }) {
  if (wallet.currencies.length === 0) {
    return <p className="small" style={{ margin: 0 }}>No money has come in yet.</p>;
  }
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr>
            <th scope="col">Currency</th>
            <th scope="col" style={{ textAlign: "right" }}>Available</th>
            <th scope="col" style={{ textAlign: "right" }}>Earned</th>
            <th scope="col" style={{ textAlign: "right" }}>Paid out</th>
          </tr>
        </thead>
        <tbody>
          {wallet.currencies.map((c) => (
            <tr key={c.currency}>
              <td>{c.currency}</td>
              <td className="num" style={{ textAlign: "right", fontWeight: 560 }}>{formatMinor(c.available, c.currency)}</td>
              <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.earned, c.currency)}</td>
              <td className="num" style={{ textAlign: "right" }}>{formatMinor(c.paidOut, c.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GuardianDashboard() {
  const user = await currentUser();
  if (!user) redirect("/");
  if (user.role !== "GUARDIAN") redirect("/");

  const consents = await db.guardianConsent.findMany({
    where: guardianScopeWhere(user.id),
    include: { founder: { select: { id: true, name: true, countryCode: true } } },
    orderBy: { consentedAt: "asc" },
  });

  const founderIds = consents.map((c) => c.founderId);

  // Batched rather than per founder: one query each, not one each per founder.
  const [accounts, payouts, products, wallets, notifications] = await Promise.all([
    db.founderPaymentAccount.findMany({ where: { founderId: { in: founderIds } } }),
    db.founderPayoutRequest.findMany({
      where: { founderId: { in: founderIds } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.founderProduct.findMany({
      where: { founderId: { in: founderIds } },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all(founderIds.map((id) => foldWallet(id))),
    // Payout requests and account problems are written here as Notification
    // rows and, until now, never read back. Unread first, then newest.
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  const accountFor = new Map(accounts.map((a) => [a.founderId, a]));
  const walletFor = new Map(founderIds.map((id, i) => [id, wallets[i]]));

  const notificationRows = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    routeName: n.routeName,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }));

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <DashNav role="GUARDIAN" current="dashboard" />

      <main id="main" className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <DashHeader
          title="Your founders"
          subtitle={
            <>
              {user.name} &middot; <span className="mono">{user.email}</span> &middot;{" "}
              <Link className="linkbtn" href="/dashboard/settings">Edit account</Link>
            </>
          }
          badge={
            consents.length === 0
              ? <span className="badge b-grey">No founders yet</span>
              : <span className="badge b-slate">
                  {consents.length === 1 ? "1 founder" : `${consents.length} founders`}
                </span>
          }
        />

        <Notifications rows={notificationRows} />

        {consents.length === 0 ? (
          <Section title="Nothing to oversee yet">
            <EmptyState>
              <p className="body" style={{ marginTop: 0 }}>
                You are not the guardian of record for anyone. A founder invites you from their own
                dashboard, and their invite link brings you to a page where you can accept.
              </p>
              <p className="small" style={{ marginBottom: 0 }}>
                If you were expecting an invitation, ask them to send it again. Links expire after
                fourteen days, and sending a new one replaces the old.
              </p>
            </EmptyState>
          </Section>
        ) : (
          consents.map((consent) => {
            const founder = consent.founder;
            const account = accountFor.get(founder.id);
            const wallet = walletFor.get(founder.id)!;
            const theirPayouts = payouts.filter((p) => p.founderId === founder.id);
            const theirProducts = products.filter((p) => p.founderId === founder.id);

            const dueCodes = Array.isArray(account?.requirementsDue)
              ? (account.requirementsDue as unknown[]).filter((c): c is string => typeof c === "string")
              : [];
            const due = describeRequirements(dueCodes, founder.countryCode);

            return (
              <div key={consent.id} style={{ marginBottom: 40 }}>
                <Section
                  title={founder.name}
                  aside={<AccountBadge status={account?.status} />}
                >
                  <p className="small" style={{ marginTop: 0 }}>
                    You have been their guardian since {fmtDate(consent.consentedAt!)}. You are the
                    adult the payment provider verifies. You do not own their business.
                  </p>

                  <hr className="rule" style={{ margin: "18px 0" }} />

                  {/* ---- payments: the one thing only a guardian can do ---- */}
                  <h3 className="h4" style={{ marginTop: 0, marginBottom: 8 }}>Payments</h3>

                  {!account || account.status === "NOT_STARTED" || account.status === "AWAITING_GUARDIAN" ? (
                    <div>
                      <p className="body" style={{ marginTop: 0 }}>
                        {founder.name} cannot sell anything until the payment account exists. You
                        open it, because Stripe verifies you.
                      </p>
                      <SetUpPayments founderId={founder.id} />
                    </div>
                  ) : account.status === "ACTIVE" ? (
                    <p className="body" style={{ marginTop: 0 }}>
                      ✓ Live{account.connectedAt ? `, since ${fmtDate(account.connectedAt)}` : ""}.
                      You are notified of every payout request.
                    </p>
                  ) : account.status === "PENDING" ? (
                    <Notice tone="slate" head="Stripe is reviewing">
                      Everything asked for has been sent. Nothing is needed from you right now.
                    </Notice>
                  ) : account.status === "REQUIREMENTS_DUE" ? (
                    <div>
                      <p className="body" style={{ marginTop: 0 }}>
                        Stripe needs {due.length === 1 ? "one more thing" : `${due.length} more things`} from
                        you before this account can take payments. Veyro never sees identity documents.
                        they go straight to Stripe.
                      </p>
                      <div style={{ marginBottom: 16 }}><Requirements items={due} /></div>
                      <SetUpPayments founderId={founder.id} resume />
                    </div>
                  ) : (
                    <Notice tone="clay" head="This account is on hold">
                      {account.status === "DISCONNECTED"
                        ? "The Stripe connection was removed, so nothing can be sold. Reconnect it from your Stripe account."
                        : "Stripe has restricted this account. Open your Stripe account to see what it needs."}{" "}
                      If it is not clear, contact support at{" "}
                      <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </Notice>
                  )}

                  <hr className="rule" style={{ margin: "22px 0 18px" }} />

                  <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
                    {/* ---- payout requests ---- */}
                    <div>
                      <h3 className="h4" style={{ marginTop: 0, marginBottom: 8 }}>Payout requests</h3>
                      {theirPayouts.length === 0 ? (
                        <p className="small" style={{ margin: 0 }}>
                          None yet. You are told each time {founder.name} asks for one, and the
                          record is permanent. You are not asked to approve it: on this account
                          type that power does not exist for anyone to hold.
                        </p>
                      ) : (
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
                              {theirPayouts.map((p) => (
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
                      )}
                    </div>

                    {/* ---- wallet, read-only ---- */}
                    <div>
                      <h3 className="h4" style={{ marginTop: 0, marginBottom: 8 }}>Money</h3>
                      <WalletSummary wallet={wallet} />
                    </div>
                  </div>

                  <hr className="rule" style={{ margin: "22px 0 18px" }} />

                  {/* ---- products, read-only ---- */}
                  <h3 className="h4" style={{ marginTop: 0, marginBottom: 8 }}>
                    What {founder.name} sells
                  </h3>
                  {theirProducts.length === 0 ? (
                    <p className="small" style={{ margin: 0 }}>Nothing listed yet.</p>
                  ) : (
                    <div className="tblwrap">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th scope="col">Product</th>
                            <th scope="col" style={{ textAlign: "right" }}>Price</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {theirProducts.map((p) => (
                            <tr key={p.id} style={p.status === "LIVE" ? undefined : { color: "var(--ink-3)" }}>
                              <td>{p.name}</td>
                              <td className="num" style={{ textAlign: "right" }}>
                                {formatMinor(p.priceMinor, p.currency)}
                              </td>
                              <td>
                                <span className={"badge " + (PRODUCT_BADGE[p.status] ?? "b-grey")}>
                                  {p.status === "LIVE" ? "Live" : p.status === "DRAFT" ? "Draft" : "Archived"}
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
            );
          })
        )}

        <p className="tiny" style={{ marginTop: 8 }}>
          Questions about any of this? <Link className="linkbtn" href="/how-it-works">How Veyro works</Link>,
          or email <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </main>
    </div>
  );
}
