import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { hashVerificationToken } from "@/lib/verification";
import { AuthShell } from "@/app/_ui/AuthShell";
import { Notice } from "@/app/_ui/form";

export const viewport = buildViewport();
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify your email | Veyro",
  robots: { index: false, follow: false },
};

// A page rather than an API route, because failure has to render something.
// A redirect-only endpoint cannot show "this link expired, here is how to get a
// new one", and that is the case people actually hit.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  if (token) {
    const user = await db.user.findUnique({
      where: { emailVerificationTokenHash: hashVerificationToken(token) },
    });

    if (user) {
      const expired =
        !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date();

      if (!expired) {
        // One-time use: the hash is cleared in the same write that records the
        // verification, so a link cannot be replayed from an inbox or a log.
        await db.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
          },
        });
        await audit(user.id, "auth.email_verified", user.email);
        redirect("/auth/signin?verified=1");
      }
    }
  }

  // Everything else lands here: no token, an unknown token, an expired one, or
  // one already used. They are deliberately not distinguished, because saying
  // "already verified" for one address and "invalid" for another turns this page
  // into a way to test which addresses have accounts.
  return (
    <AuthShell
      title="This link didn&rsquo;t work"
      lead="Verification links last 24 hours and can only be used once."
      footer={
        <>
          Already verified?{" "}
          <Link className="linkbtn" href="/auth/signin">Sign in</Link>.
        </>
      }
    >
      <Notice tone="amber" head="Request a new link">
        <p style={{ margin: "0 0 12px" }}>
          If the link has expired, or you have already used it and still cannot sign in, we can
          send another one.
        </p>
        <Link className="btn" href="/auth/resend-verification">Send a new link</Link>
      </Notice>
    </AuthShell>
  );
}
