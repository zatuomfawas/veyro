// The guardian's invitation page.
//
// The founder is resolved from the TOKEN, never from [founderId] in the path.
// Founder ids are not secret — every public checkout URL contains one
// (/pay/[founderId]/[productId]) — so trusting the path would let anyone who
// has ever been sent a payment link read that founder's real name off this
// page. The id in the path is verified against the token's consent and
// otherwise ignored.
//
// The invited email is never printed here either. Possession of the token is
// not the same as being the recipient, and naming the address would hand
// someone holding a leaked link the one detail they would otherwise lack.

import type { Metadata } from "next";
import Link from "next/link";

import { buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { consentState, hashInviteToken } from "@/lib/consent";
import { authUrlWithNext } from "@/lib/next-path";
import { describeRequirements } from "@/lib/stripe-account";
import { Requirements } from "@/app/_ui/Requirements";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { Notice } from "@/app/_ui/form";
import { SiteFooter } from "@/app/_ui/SiteFooter";

import ConsentActions from "./ConsentActions";
import RequestNewLink from "./RequestNewLink";
import SetUpPayments from "@/app/_ui/SetUpPayments";

export const viewport = buildViewport();
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guardian invitation | Veyro",
  robots: { index: false, follow: false },
};

const SUPPORT_EMAIL = "hello@withveyro.com";

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />
      <div className="wrap-s">
        <div className="lp-nav" style={{ borderBottom: 0 }}>
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <Link className="btn btn-q btn-sm" href="/how-it-works">What this means</Link>
        </div>
      </div>
      <main id="main" className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Same answer for a missing token, a wrong token, and a token for another founder. */
/**
 * A link that does not open anything.
 *
 * Usually an out-of-date one: sending a new invite replaces the stored hash, so
 * every earlier link stops working, and an inbox keeps them all. The visitor
 * did nothing wrong and has no way to tell which of the emails is current.
 *
 * When they are signed in as the adult this founder actually invited, that is
 * enough to know they are the right person holding the wrong link, so they get
 * the same "ask for a new one" button as an expired invite. Everyone else gets
 * the generic text, unchanged: the response must not become a way to discover
 * which founder ids or invitations exist.
 */
function InvalidLink({
  founderName, founderId, alreadyRequested,
}: {
  founderName?: string | null;
  founderId?: string | null;
  alreadyRequested?: Date | null;
} = {}) {
  const canAsk = Boolean(founderName && founderId);
  return (
    <Shell>
      <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>
        {canAsk ? "This link is out of date" : "Invalid link"}
      </h1>
      <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
        {canAsk
          ? `${founderName} has invited you, but this particular link no longer works. Sending a `
            + "new invite makes every earlier link stop working, so an older email will do this "
            + "even though the invitation itself is fine."
          : "This invitation link is not valid. It may have been mistyped, already used, or "
            + "replaced by a newer one. Sending a new invite makes the previous link stop working."}
      </p>
      {canAsk ? (
        <>
          <p className="small" style={{ marginTop: 16 }}>
            Check your inbox for the most recent message from Veyro first, since that link will
            still open. If you cannot find it, ask for another.
          </p>
          <div style={{ marginTop: 24 }}>
            {alreadyRequested ? (
              <Notice tone="pine" head="Already asked">
                {founderName} was told on {fmtDate(alreadyRequested)}. The new invitation will
                arrive at the address this one was sent to.
              </Notice>
            ) : (
              <RequestNewLink founderId={founderId!} founderName={founderName!} />
            )}
          </div>
        </>
      ) : (
        <p className="body" style={{ marginTop: 12 }}>
          Ask the founder who invited you to send a fresh link from their dashboard.
        </p>
      )}
    </Shell>
  );
}

/**
 * Whether the person reading a dead link is the adult this founder invited.
 *
 * Deliberately keyed on the signed-in session rather than on anything in the
 * URL: the token is what failed, so it cannot be the thing that authorises.
 */
async function staleLinkContext(founderId: string) {
  const user = await currentUser();
  if (!user) return {};
  const live = await db.guardianConsent.findUnique({
    where: { founderId },
    include: { founder: { select: { name: true } } },
  });
  if (!live || live.consentedAt) return {};
  if (live.invitedEmail.toLowerCase() !== user.email.toLowerCase()) return {};
  return {
    founderName: live.founder.name,
    founderId,
    alreadyRequested: live.newLinkRequestedAt,
  };
}

export default async function GuardianConsentPage({
  params, searchParams,
}: {
  params: Promise<{ founderId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { founderId } = await params;
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  // 1. No token at all.
  if (!token) return <InvalidLink {...(await staleLinkContext(founderId))} />;

  const consent = await db.guardianConsent.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { founder: { select: { id: true, name: true } } },
  });

  // 2. Token does not match anything, or 3. matches a different founder than
  // the path claims. Both answer identically, so the path cannot be used to
  // probe which ids exist. staleLinkContext adds nothing for anyone who is not
  // already signed in as the invited adult, so that stays true.
  if (!consent || consent.founderId !== founderId) {
    return <InvalidLink {...(await staleLinkContext(founderId))} />;
  }

  // Where an auth detour must return to, token and all.
  const here = `/founder/${founderId}/consent?token=${encodeURIComponent(token)}`;
  const founderName = consent.founder.name;
  const state = consentState(consent);
  const user = await currentUser();

  /* ---------------- not signed in ---------------- */
  if (!user) {
    return (
      <Shell>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>
          {founderName} has asked you to be their guardian
        </h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
          Sign in first, so the agreement is tied to a real account rather than to whoever opens
          this link.
        </p>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-b">
            <p className="body" style={{ marginTop: 0 }}>
              Use the email address this invitation was sent to. If you have not got a Veyro account
              yet, create one as a parent or guardian. You need to be 18 or over.
            </p>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Link className="btn" href={authUrlWithNext("/auth/signin", here)}>Sign in</Link>
              <Link className="btn btn-2" href={authUrlWithNext("/auth/signup", here)}>
                Create a guardian account
              </Link>
            </div>
            <p className="tiny" style={{ marginTop: 12, marginBottom: 0 }}>
              You will come straight back here afterwards, ready to answer.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------- signed in as somebody else ---------------- */
  if (user.email.toLowerCase() !== consent.invitedEmail.toLowerCase()) {
    return (
      <Shell>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>This invitation is not for this account</h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
          You are signed in as <span className="mono">{user.email}</span>, and this invitation was
          sent to a different address.
        </p>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-b">
            <p className="body" style={{ marginTop: 0 }}>
              Sign in with the address the invitation was sent to, then open this link again. If you
              think it should have come to this account, ask {founderName} to re-send it.
            </p>
            <Link className="btn btn-2" href={authUrlWithNext("/auth/signin", here)}>Sign in as someone else</Link>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------- already answered, or the window closed ---------------- */
  if (state === "declined") {
    return (
      <Shell>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>You declined this invitation</h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
          Answered on {fmtDate(consent.respondedAt!)}. Declining is a real answer and it has been
          recorded; {founderName} cannot take payments without a guardian.
        </p>
        <p className="small" style={{ marginTop: 16 }}>
          If that was a mistake, or you have since talked it over, you can ask for a new
          invitation. A decline cannot be undone from here: {founderName} has to invite you
          again, and you would answer afresh.
        </p>
        <div style={{ marginTop: 24 }}>
          {consent.newLinkRequestedAt ? (
            <Notice tone="pine" head="Already asked">
              {founderName} was told on {fmtDate(consent.newLinkRequestedAt)}. If they send a new
              invitation it will arrive at this address.
            </Notice>
          ) : (
            <RequestNewLink token={token} founderName={founderName} />
          )}
        </div>
      </Shell>
    );
  }

  if (state === "expired") {
    return (
      <Shell>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>This invitation expired</h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
          Invitations last 14 days. This one stopped working on{" "}
          {fmtDate(consent.inviteExpiresAt)} and was never answered. That is normal and nothing
          has gone wrong; {founderName} just needs to send a new one.
        </p>
        <p className="small" style={{ marginTop: 16 }}>
          A new link goes to this same address. Only {founderName} can issue one, which is why
          this asks them rather than renewing it here.
        </p>
        <div style={{ marginTop: 24 }}>
          {consent.newLinkRequestedAt ? (
            <Notice tone="pine" head="Already asked">
              {founderName} was told on {fmtDate(consent.newLinkRequestedAt)}. When they send the
              new invitation it will arrive at this address. Nothing else is needed from you.
            </Notice>
          ) : (
            <RequestNewLink token={token} founderName={founderName} />
          )}
        </div>
      </Shell>
    );
  }

  /* ---------------- accepted: what happens next ---------------- */
  if (state === "consented") {
    const account = await db.founderPaymentAccount.findUnique({
      where: { founderId: consent.founderId },
    });

    const dueCodes = Array.isArray(account?.requirementsDue)
      ? (account.requirementsDue as unknown[]).filter((c): c is string => typeof c === "string")
      : [];
    const due = describeRequirements(dueCodes, user.countryCode);

    return (
      <Shell>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>✓ You&rsquo;ve accepted</h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
          You are {founderName}&rsquo;s guardian of record as of {fmtDate(consent.consentedAt!)}.
          You are the adult the payment provider verifies.
        </p>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-h">
            <h2 className="h4" style={{ margin: 0 }}>Payments</h2>
            {account?.status === "ACTIVE"
              ? <span className="badge b-pine">Live</span>
              : account?.status === "REQUIREMENTS_DUE"
                ? <span className="badge b-amber">Action needed</span>
                : account?.status === "PENDING"
                  ? <span className="badge b-slate">Setting up</span>
                  : account?.status === "RESTRICTED" || account?.status === "DISCONNECTED"
                    ? <span className="badge b-clay">On hold</span>
                    : <span className="badge b-grey">Not started</span>}
          </div>
          <div className="card-b">
            {!account || account.status === "NOT_STARTED" || account.status === "AWAITING_GUARDIAN" ? (
              <div>
                <p className="body" style={{ marginTop: 0 }}>
                  Nothing can be sold until the payment account exists. You open it, because Stripe
                  verifies you, not {founderName}, who may be under 18.
                </p>
                <SetUpPayments founderId={consent.founderId} />
              </div>
            ) : account.status === "ACTIVE" ? (
              <p className="body" style={{ margin: 0 }}>
                ✓ Payments are live
                {account.connectedAt ? `, since ${fmtDate(account.connectedAt)}` : ""}.{" "}
                {founderName} can sell, and you are notified of every payout request.
              </p>
            ) : account.status === "PENDING" ? (
              <Notice tone="slate" head="Setting up…">
                Everything asked for has been sent, and Stripe is reviewing it. Nothing is needed
                from you right now.
              </Notice>
            ) : account.status === "REQUIREMENTS_DUE" ? (
              <div>
                <p className="body" style={{ marginTop: 0 }}>
                  Setting up… Stripe still needs{" "}
                  {due.length === 1 ? "one thing" : `${due.length} things`} from you before this
                  account can take payments.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <Requirements items={due} />
                </div>
                <SetUpPayments founderId={consent.founderId} resume />
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
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------- pending: the actual question ---------------- */
  return (
    <Shell>
      <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>
        Accept invitation from {founderName}?
      </h1>
      <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>
        {founderName} has asked you to be the guardian on their Veyro account. Read what that means
        before you answer. It is a real responsibility, not a formality.
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-b">
          <ul className="arrowlist" style={{ marginTop: 0 }}>
            <li>
              You become the adult on the payment account. Stripe verifies <em>your</em> identity,
              and you accept their terms, not {founderName}.
            </li>
            <li>
              You do not own their business, and Veyro keeps a separate ledger so that stays
              obvious.
            </li>
            <li>
              You are notified of every payout request and keep a permanent record of it. You do not
              get a veto. On this account type that control does not exist for anyone to grant, which is
              worth knowing before you agree rather than after.
            </li>
            <li>
              Veyro never receives your identity documents. They go directly to Stripe&rsquo;s own
              form.
            </li>
          </ul>

          <p className="small" style={{ marginBottom: 16 }}>
            This invitation expires on {fmtDate(consent.inviteExpiresAt)}.
          </p>

          <ConsentActions token={token} />
        </div>
      </div>

      <p className="small" style={{ marginTop: 16 }}>
        Not sure? <Link className="linkbtn" href="/how-it-works">Read how Veyro works</Link>{" "}
        first. Nothing is recorded until you choose.
      </p>
    </Shell>
  );
}
