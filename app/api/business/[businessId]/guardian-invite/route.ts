// Invite a guardian for a business. Only the founder who owns the business can
// send this. The raw token is returned once, for the email link; only its
// hash is ever stored, same pattern as session tokens in lib/auth.ts.
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { currentUser, canActOnBusiness, audit } from "@/lib/auth";

const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const INVITE_DAYS = 14;

export async function POST(req: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { businessId } = await params;
  if (!(await canActOnBusiness(user.id, businessId))) {
    return NextResponse.json({ error: "You don't have access to this business." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }

  const invitedName = cap(body.invitedName, 80);
  const invitedEmail = cap(body.invitedEmail, 254).toLowerCase();
  const relation = cap(body.relation, 40);

  const errors: Record<string, string> = {};
  if (invitedName.length < 2) errors.invitedName = "Enter the guardian's name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invitedEmail)) errors.invitedEmail = "Enter a working email address.";
  if (!relation) errors.relation = "Say how this person is related, e.g. Parent or Legal guardian.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  // One relationship per business — @unique on businessId enforces this too,
  // but check first so a re-invite gets a clear error, not a raw DB conflict.
  const existing = await db.guardianRelationship.findUnique({ where: { businessId } });
  if (existing && existing.status !== "EXPIRED" && existing.status !== "DECLINED") {
    return NextResponse.json({ error: "This business already has a pending or accepted guardian." }, { status: 409 });
  }

  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 864e5);

  const relationship = existing
    ? await db.guardianRelationship.update({
        where: { businessId },
        data: { invitedName, invitedEmail, relation, status: "PENDING",
                tokenHash: sha256(rawToken), sentAt: new Date(), expiresAt,
                respondedAt: null, endedAt: null, guardianId: null },
      })
    : await db.guardianRelationship.create({
        data: { businessId, invitedName, invitedEmail, relation, status: "PENDING",
                tokenHash: sha256(rawToken), expiresAt },
      });

  await audit(user.id, "guardian.invited", relationship.id, businessId, { invitedEmail, relation });

  // rawToken goes into the invite email link; it is never stored anywhere.
  // Sending the actual email is not wired up yet — this is the value to send.
  return NextResponse.json({ ok: true, relationshipId: relationship.id, inviteToken: rawToken });
}
