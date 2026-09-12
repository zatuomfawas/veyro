import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkPassword, createSession, hashPassword, audit } from "@/lib/auth";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(body.password ?? "");

  const user = await db.user.findUnique({ where: { email } });

  // Hash even when there is no user, so the response takes the same time either
  // way. Otherwise the timing difference tells an attacker which emails exist.
  if (!user?.passwordHash) {
    await hashPassword(password);
    return NextResponse.json({ error: "Email or password is wrong." }, { status: 401 });
  }

  if (!(await checkPassword(user.passwordHash, password))) {
    await audit(null, "auth.failed", email);
    return NextResponse.json({ error: "Email or password is wrong." }, { status: 401 });
  }
  if (user.deletedAt) {
    return NextResponse.json({ error: "Email or password is wrong." }, { status: 401 });
  }

  await createSession(user.id);
  await audit(user.id, "auth.signed_in", email);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
