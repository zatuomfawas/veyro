// Products a founder sells.
//
// POST creates one (founder only — a guardian oversees, they don't list
// products on someone's behalf). GET lists them, readable by the founder or
// their consented guardian.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { resolveScope, isResponse, readJson, cap } from "../_scope";
import {
  validateProductFields, NAME_MAX, DESCRIPTION_MAX, type ProductStatus,
} from "@/lib/product-rules";

export const runtime = "nodejs";

// The bounds live in lib/product-rules.ts, shared with the edit route. The
// browser capping the price at $999,999.99 is a hint; this is the control, and
// an edit must not be a way around it.

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

  const name = cap(body.name, NAME_MAX);
  const description = cap(body.description, DESCRIPTION_MAX);
  const currency = (cap(body.currency, 3) || "USD").toUpperCase();
  const priceMinor = Number(body.priceMinor ?? 0);
  const priceRecurring = body.priceRecurring === true;
  const status = (cap(body.status, 20).toUpperCase() || "DRAFT") as ProductStatus;

  // Reported in the {errors: {field}} shape the form maps to its inputs, so a
  // message lands beside the field rather than as a banner.
  const errors = validateProductFields({ name, description, priceMinor, currency, status });
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
