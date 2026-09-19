// Consume a verification token. POST only, deliberately.
//
// This used to happen on GET, and that was the bug. Mail providers and
// corporate security filters fetch every URL in an email to scan it, and link
// previews do the same. A GET that burns a one-time token is therefore consumed
// by a robot before the person ever clicks, and the human then sees "this link
// didn't work" on an account that was in fact already verified. That is exactly
// what happened in production.
//
// GET requests must be safe: no side effects. The page at /auth/verify now only
// looks, and this route is the only thing that writes, reached by submitting a
// form. Scanners follow links; they do not submit forms.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { hashVerificationToken } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "").trim();
  const origin = new URL(req.url).origin;

  if (!token) return NextResponse.redirect(`${origin}/auth/verify?state=invalid`, 303);

  const user = await db.user.findUnique({
    where: { emailVerificationTokenHash: hashVerificationToken(token) },
  });

  if (!user) return NextResponse.redirect(`${origin}/auth/verify?state=invalid`, 303);

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    return NextResponse.redirect(`${origin}/auth/verify?state=expired`, 303);
  }

  // Already verified, token still present: nothing to do, and no reason to make
  // it look like a failure.
  if (user.emailVerifiedAt) {
    return NextResponse.redirect(`${origin}/auth/signin?verified=1`, 303);
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });
  await audit(user.id, "auth.email_verified", user.email);

  // 303 so the browser follows with a GET and a refresh cannot re-post.
  return NextResponse.redirect(`${origin}/auth/signin?verified=1`, 303);
}
