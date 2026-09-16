// Change a password.
//
// POST { currentPassword, newPassword }
//
// The current password is required even though the caller is already signed in.
// A session cookie proves the browser was once authenticated; it does not prove
// the person at the keyboard is the account holder. Without this check, anyone
// who reaches an unlocked laptop — or who has a stolen cookie — can lock the
// real owner out permanently, which is a far worse outcome than the friction.
//
// Succeeding revokes every other session, so a password change actually ends
// whatever access prompted it.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser, checkPassword, hashPassword, revokeOtherSessions, audit } from "@/lib/auth";
import { readJson } from "../../founder/_scope";

export const runtime = "nodejs";

/** Length beats complexity rules; matches signup. */
const MIN_LENGTH = 10;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  const errors: Record<string, string> = {};
  if (!currentPassword) errors.currentPassword = "Enter your current password.";
  if (newPassword.length < MIN_LENGTH) {
    errors.newPassword = `Use at least ${MIN_LENGTH} characters. A short sentence is fine.`;
  }
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  // An account with no password is SSO-only; there is nothing here to change.
  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "This account does not sign in with a password." },
      { status: 409 },
    );
  }

  if (!(await checkPassword(user.passwordHash, currentPassword))) {
    await audit(user.id, "auth.password_change_failed", user.email);
    return NextResponse.json(
      { errors: { currentPassword: "That is not your current password." } },
      { status: 403 },
    );
  }

  if (await checkPassword(user.passwordHash, newPassword)) {
    return NextResponse.json(
      { errors: { newPassword: "That is the password you already have." } },
      { status: 400 },
    );
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  const revoked = await revokeOtherSessions(user.id);
  await audit(user.id, "auth.password_changed", user.email, undefined, { revokedSessions: revoked });

  return NextResponse.json({ ok: true, signedOutElsewhere: revoked });
}
