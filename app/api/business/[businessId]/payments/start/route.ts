// The founder signals the business is ready to take payments. This does NOT
// touch Stripe. A Standard connected account has to be opened and verified by
// the guardian — the guardian is the adult who becomes the responsible
// individual on it, and the founder may be a minor. All this endpoint does is
// mark the business AWAITING_GUARDIAN and put the task in the guardian's queue.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser, canActOnBusiness, audit } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ businessId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { businessId } = await params;
  if (!(await canActOnBusiness(user.id, businessId))) {
    return NextResponse.json({ error: "You don't have access to this business." }, { status: 403 });
  }

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const relationship = await db.guardianRelationship.findUnique({ where: { businessId } });
  if (!relationship || relationship.status !== "ACCEPTED" || !relationship.guardianId) {
    await audit(user.id, "stripe.connect.blocked_no_guardian", businessId, businessId);
    return NextResponse.json({
      error: "A guardian must accept the invite before payment setup can start.",
      accountStatus: "AWAITING_GUARDIAN",
    }, { status: 409 });
  }

  const existing = await db.paymentAccount.findUnique({ where: { businessId } });
  if (existing?.providerAccountId) {
    // The guardian has already opened the account (or gone further). Nothing for
    // the founder to do here.
    return NextResponse.json({
      ok: true,
      accountStatus: existing.status,
      next: existing.status === "ACTIVE" ? "done" : "guardian",
    });
  }
  if (existing?.status === "AWAITING_GUARDIAN") {
    return NextResponse.json({
      ok: true, accountStatus: "AWAITING_GUARDIAN", next: "guardian", note: "Guardian already notified.",
    });
  }

  const account = await db.paymentAccount.upsert({
    where: { businessId },
    create: {
      businessId,
      provider: "STRIPE_CONNECT",
      status: "AWAITING_GUARDIAN",
      representativeUserId: relationship.guardianId,
    },
    update: {
      status: "AWAITING_GUARDIAN",
      representativeUserId: relationship.guardianId,
    },
  });

  await db.notification.create({
    data: {
      userId: relationship.guardianId,
      title: `Finish payment setup for ${business.name}`,
      body: `${user.name} is ready to take payments. You need to open and verify the Stripe account — `
        + `you will be the named adult on it. Sign in and go to this business's payments.`,
      routeName: "business.payments",
      routeId: businessId,
    },
  });

  await audit(user.id, "stripe.connect.handoff_to_guardian", account.id, businessId, {
    guardianUserId: relationship.guardianId,
  });

  return NextResponse.json({ ok: true, accountStatus: "AWAITING_GUARDIAN", next: "guardian" });
}
