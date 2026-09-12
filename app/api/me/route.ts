// Who am I, according to the server. The client asks this rather than
// remembering; a remembered identity is one the client can edit.
import { NextResponse } from "next/server";
import { currentUser, endSession } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function DELETE() {
  await endSession();
  return NextResponse.json({ ok: true });
}
