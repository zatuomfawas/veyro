// The guardian accepts or declines an invite. The guardian must have an
// account and be signed in as themselves — the token proves which invite,
// the session proves who's answering, and the email must match both.
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { currentUser, audit } from "@/lib/auth";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }

  const token = String(body.token ?? "");
  const decision = body.decision === "accept" ? "ACCEPTED" : body.decision === "decline" ? "DECLINED" : null;
  if (!token) return NextResponse.json({ error: "Missing invite token." }, { status: 400 });
  if (!decision) return NextResponse.json({ error: "decision must be \"accept\" or \"decline\"." }, { status: 400 });

  const relationship = await db.guardianRelationship.findUnique({ where: { tokenHash: sha256(token) } });
  if (!relationship) return NextResponse.json({ error: "This invite link is invalid." }, { status: 404 });
  if (relationship.status !== "PENDING") {
    return NextResponse.json({ error: "This invite has already been responded to or is no longer active." }, { status: 409 });
  }
  if (relationship.expiresAt < new Date()) {
    await db.guardianRelationship.update({ where: { id: relationship.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "This invite has expired. Ask the founder to send a new one." }, { status: 410 });
  }
  if (relationship.invitedEmail !== user.email) {
    // Deliberately generic: don't confirm which email the invite was actually sent to.
    return NextResponse.json({ error: "This invite isn't addressed to your signed-in account." }, { status: 403 });
  }

  const updated = await db.guardianRelationship.update({
    where: { id: relationship.id },
    data: { status: decision, guardianId: user.id, respondedAt: new Date() },
  });

  await audit(user.id, decision === "ACCEPTED" ? "guardian.accepted" : "guardian.declined",
              relationship.id, relationship.businessId);

  return NextResponse.json({ ok: true, relationship: updated });
}
