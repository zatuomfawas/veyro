import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { db } from "@/lib/db";
import { hashVerificationToken } from "@/lib/verification";
import { AuthShell } from "@/app/_ui/AuthShell";
import { Btn, Notice } from "@/app/_ui/form";

export const viewport = buildViewport();
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify your email | Veyro",
  robots: { index: false, follow: false },
};

// This page LOOKS. It does not write.
//
// Verification used to happen here, on the GET, and that was the bug. Mail
// providers and corporate filters fetch every URL in an email to scan it, and
// link previews do the same, so a one-time token was being spent by a robot
// before the person clicked. The human then saw "this link didn't work" on an
// account that had in fact just been verified by the scanner.
//
// So the GET only checks whether the token is still good and renders a button.
// The write happens in POST /api/auth/verify, which scanners do not trigger
// because they follow links rather than submitting forms. The extra click is
// the cost of the link surviving contact with an inbox.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[]; state?: string }>;
}) {
  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  // Set by the POST route when it refuses, so the reason survives the redirect.
  const failed = params.state === "invalid" || params.state === "expired";

  let usable = false;
  if (token && !failed) {
    const user = await db.user.findUnique({
      where: { emailVerificationTokenHash: hashVerificationToken(token) },
      select: { emailVerifiedAt: true, emailVerificationExpiresAt: true },
    });
    usable = Boolean(
      user
        && !user.emailVerifiedAt
        && user.emailVerificationExpiresAt
        && user.emailVerificationExpiresAt > new Date(),
    );
  }

  if (usable) {
    return (
      <AuthShell
        title="One more tap"
        lead="Confirm this was you, and your address is verified."
        footer={
          <>
            Wrong account? <Link className="linkbtn" href="/auth/signin">Sign in</Link> instead.
          </>
        }
      >
        <form method="post" action="/api/auth/verify">
          <input type="hidden" name="token" value={token} />
          <p className="body" style={{ marginTop: 0 }}>
            This confirms the email address you signed up with. Nothing else changes.
          </p>
          <Btn className="btn-w" type="submit">Verify my email</Btn>
          <p className="hint" style={{ marginTop: 8 }}>
            The button is here rather than happening automatically because some email providers
            open every link in a message to scan it, which would use up your link before you got
            to it.
          </p>
        </form>
      </AuthShell>
    );
  }

  // No token, an unknown one, an expired one, or one already used. Deliberately
  // not distinguished: telling one address "already verified" and another
  // "invalid" turns this page into a way to test which addresses have accounts.
  return (
    <AuthShell
      title="This link didn&rsquo;t work"
      lead="Verification links last 24 hours and can only be used once."
      footer={
        <>
          Already verified? <Link className="linkbtn" href="/auth/signin">Sign in</Link>.
        </>
      }
    >
      <Notice tone="amber" head="Two things this usually means">
        <p style={{ margin: "0 0 8px" }}>
          The link has expired, or it has already been used. If you have verified once, you do not
          need to again: just sign in.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          If signing in still says your email is unverified, get a fresh link.
        </p>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href="/auth/signin">Try signing in</Link>
          <Link className="btn btn-2" href="/auth/resend-verification">Send a new link</Link>
        </div>
      </Notice>
    </AuthShell>
  );
}
