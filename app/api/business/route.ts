// Create a business for the signed-in founder. One founder can have more than
// one business, so this only ever adds a row — it never mutates an existing one.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser, audit } from "@/lib/auth";

const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

const BUSINESS_TYPES = ["SAAS", "DIGITAL_PRODUCT", "SERVICE", "CONTENT", "OTHER"];
const REVENUE_MODELS = ["SUBSCRIPTION", "ONE_TIME", "USAGE", "MIXED"];

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }

  const name = cap(body.name, 120);
  const type = cap(body.type, 40).toUpperCase();
  const url = body.url ? cap(body.url, 300) : null;
  const description = cap(body.description, 500);
  const revenueModel = cap(body.revenueModel, 40).toUpperCase();
  const priceMinor = Number(body.priceMinor ?? 0);
  const currency = cap(body.currency || "USD", 3).toUpperCase();
  const countryCode = cap(body.countryCode || user.countryCode, 2).toUpperCase();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Give the business a name.";
  if (!BUSINESS_TYPES.includes(type)) errors.type = "Choose a valid business type.";
  if (description.length < 10) errors.description = "Describe what the customer is paying for.";
  if (!REVENUE_MODELS.includes(revenueModel)) errors.revenueModel = "Choose a valid revenue model.";
  if (!Number.isInteger(priceMinor) || priceMinor < 0) errors.priceMinor = "Price must be a whole number of minor units, 0 or more.";
  if (!/^[A-Z]{2}$/.test(countryCode)) errors.countryCode = "Country must be a two-letter code.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  const business = await db.business.create({
    data: { founderId: user.id, name, type: type as never, url, description,
            revenueModel: revenueModel as never, priceMinor, currency, countryCode },
  });

  await audit(user.id, "business.created", business.id, business.id, { name, type });

  return NextResponse.json({ ok: true, business });
}
