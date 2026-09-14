// Shared scoping for the founder routes.
//
// Every route acts on a founder. By default that is the signed-in user acting
// on themselves; a guardian acts on their founder by naming them. Which founder
// is never taken on the caller's word — canActOnFounder asks the database.
import { NextResponse } from "next/server";
import { currentUser, canActOnFounder, isGuardianOf } from "@/lib/auth";

export type Scope = {
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  founderId: string;
  /** True when the caller is acting on someone else's founder record. */
  asGuardian: boolean;
};

/**
 * Resolve and authorise the founder this request is about. Returns a Response
 * to return as-is when the caller is not allowed, or a Scope when they are.
 */
export async function resolveScope(requestedFounderId?: unknown): Promise<Scope | NextResponse> {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const founderId =
    typeof requestedFounderId === "string" && requestedFounderId.trim()
      ? requestedFounderId.trim()
      : user.id;

  if (!(await canActOnFounder(user.id, founderId))) {
    return NextResponse.json({ error: "You don't have access to this founder." }, { status: 403 });
  }

  return { user, founderId, asGuardian: founderId !== user.id };
}

export function isResponse(v: Scope | NextResponse): v is NextResponse {
  return v instanceof NextResponse;
}

/** Read a JSON body, or a 400 to return as-is. */
export async function readJson(req: Request): Promise<Record<string, unknown> | NextResponse> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Send valid JSON." }, { status: 400 });
  }
}

export const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** The guardian of record, asserted. Used where only the guardian may act. */
export async function requireGuardian(userId: string, founderId: string) {
  return isGuardianOf(userId, founderId);
}
