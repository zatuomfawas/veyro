// Recent transactions, plus the folded wallet.
//
// Readable by the founder or their consented guardian. The balance is folded
// here and sent down — the client is never asked to add money up itself.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { foldWallet } from "@/lib/ledger";
import { resolveScope, isResponse } from "../_scope";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;

  const scope = await resolveScope(params.get("founderId"));
  if (isResponse(scope)) return scope;

  const requested = Number(params.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const [transactions, wallet] = await Promise.all([
    db.founderTransaction.findMany({
      where: { founderId: scope.founderId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { product: { select: { id: true, name: true } } },
    }),
    foldWallet(scope.founderId),
  ]);

  return NextResponse.json({
    ok: true,
    founderId: scope.founderId,
    viewingAsGuardian: scope.asGuardian,
    wallet,
    transactions,
  });
}
