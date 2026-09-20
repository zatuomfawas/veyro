// Mark notifications read.
//
// Reading is done by the pages themselves, which already query the database
// server-side; an endpoint for it would be a second way to ask the same
// question. This exists only for the write.
//
// POST { id }   marks one read
// POST { all: true }  marks every unread one read
//
// Scoped to the signed-in user in the WHERE clause rather than by fetching and
// checking, so there is no window in which someone else's id could be updated:
// an id that is not theirs simply matches no rows.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { readJson, cap } from "../founder/_scope";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const now = new Date();

  if (body.all === true) {
    const { count } = await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: now },
    });
    return NextResponse.json({ ok: true, count });
  }

  const id = cap(body.id, 40);
  if (!id) return NextResponse.json({ error: "Nothing to mark." }, { status: 400 });

  // userId in the filter is the authorisation. A notification belonging to
  // someone else matches nothing and reports zero, which is the honest answer
  // and not a way to discover that the id exists.
  const { count } = await db.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: now },
  });

  return NextResponse.json({ ok: true, count });
}
