// Products a founder sells.
//
// POST creates one (founder only — a guardian oversees, they don't list
// products on someone's behalf). GET lists them, readable by the founder or
// their consented guardian.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { resolveScope, isResponse, readJson, cap } from "../_scope";

export const runtime = "nodejs";

const STATUSES = ["DRAFT", "LIVE", "ARCHIVED"] as const;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const scope = await resolveScope(body.founderId);
  if (isResponse(scope)) return scope;
  if (scope.asGuardian) {
    return NextResponse.json(
      { error: "Only the founder can add a product." },
      { status: 403 },
    );
  }

  const name = cap(body.name, 120);
  const description = cap(body.description, 500);
  const currency = (cap(body.currency, 3) || "USD").toUpperCase();
  const priceMinor = Number(body.priceMinor ?? 0);
  const priceRecurring = body.priceRecurring === true;
  const status = (cap(body.status, 20).toUpperCase() || "DRAFT") as (typeof STATUSES)[number];

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Give the product a name.";
  if (description.length < 10) errors.description = "Describe what the customer is paying for.";
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    errors.priceMinor = "Price must be a whole number of minor units, 0 or more.";
  }
  if (!/^[A-Z]{3}$/.test(currency)) errors.currency = "Currency must be a three-letter code.";
  if (!STATUSES.includes(status)) errors.status = "Choose a valid status.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  const product = await db.founderProduct.create({
    data: {
      founderId: scope.founderId,
      name,
      description,
      priceMinor,
      currency,
      priceRecurring,
      status,
    },
  });

  await audit(scope.user.id, "product.created", product.id, scope.founderId, { name, status });

  return NextResponse.json({ ok: true, product });
}

export async function GET(req: Request) {
  const founderId = new URL(req.url).searchParams.get("founderId");
  const scope = await resolveScope(founderId);
  if (isResponse(scope)) return scope;

  const products = await db.founderProduct.findMany({
    where: { founderId: scope.founderId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, products });
}
