// Edit a product after it exists.
//
// The thing this protects is the checkout link. A founder who prices a $100
// template at $1 and has already put the link in a Discord server needs to fix
// the price without the link changing, and the id is the primary key, so
// editing never moves it. Every link already shared keeps working.
//
// PATCH, not PUT: only the fields that were sent are touched. `cap(undefined)`
// returns "", so absence is checked with Object.hasOwn rather than by
// truthiness — otherwise an edit that only changes the price would arrive
// looking like a request to blank the name.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { resolveScope, isResponse, readJson, cap } from "../../_scope";
import {
  validateProductFields, NAME_MAX, DESCRIPTION_MAX, type ProductStatus,
} from "@/lib/product-rules";
import { canTakePayment } from "@/lib/sale-rules";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const scope = await resolveScope(body.founderId);
  if (isResponse(scope)) return scope;
  if (scope.asGuardian) {
    // A guardian is the adult on the payment account, not the shopkeeper.
    return NextResponse.json(
      { error: "Only the founder can edit a product." },
      { status: 403 },
    );
  }

  const existing = await db.founderProduct.findUnique({ where: { id: productId } });
  // One answer for "no such product" and "not yours": a founder with a valid
  // session must not be able to discover which ids exist under other accounts.
  if (!existing || existing.founderId !== scope.founderId) {
    return NextResponse.json({ error: "No such product." }, { status: 404 });
  }

  const has = (k: string) => Object.hasOwn(body, k);

  const next: {
    name?: string; description?: string; priceMinor?: number; status?: ProductStatus;
  } = {};
  if (has("name")) next.name = cap(body.name, NAME_MAX);
  if (has("description")) next.description = cap(body.description, DESCRIPTION_MAX);
  if (has("priceMinor")) next.priceMinor = Number(body.priceMinor);
  if (has("status")) next.status = cap(body.status, 20).toUpperCase() as ProductStatus;

  // Currency is deliberately not editable. It is written into every
  // transaction this product has taken and the wallet folds per currency, so
  // changing it here would silently reinterpret money that has already moved.
  if (has("currency") && cap(body.currency, 3).toUpperCase() !== existing.currency) {
    return NextResponse.json(
      {
        errors: {
          currency:
            "A product's currency cannot be changed after it exists. Create a new product "
            + "instead, so past payments keep their meaning.",
        },
      },
      { status: 400 },
    );
  }

  if (Object.keys(next).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  const errors = validateProductFields(next);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  // Publishing onto an account that cannot take a card yet.
  //
  // Not blocked. Under 18 the Stripe step belongs to the guardian, so refusing
  // here would stop a founder doing something they have no way to fix — and the
  // checkout gate already refuses the payment itself, so nobody is ever charged
  // for a product in this state. What was wrong was the silence: the product
  // flipped to Live, the founder shared the link, and the first they heard of it
  // was a customer telling them it did not work.
  //
  // canTakePayment is the same predicate saleBlockers uses for
  // "payments_not_set_up", imported rather than restated, so the dashboard and
  // the checkout cannot come to different conclusions about the same account.
  const goingLive = next.status === "LIVE" && existing.status !== "LIVE";
  const account = goingLive
    ? await db.founderPaymentAccount.findUnique({
        where: { founderId: scope.founderId },
        select: { providerAccountId: true, status: true },
      })
    : null;
  const liveWithoutPayments = goingLive && !canTakePayment(account);

  const product = await db.founderProduct.update({ where: { id: productId }, data: next });

  // Price and status are the two that change what a customer is charged and
  // whether they can buy at all, so both sides of the change go on the record.
  const changes: Record<string, unknown> = {};
  if (next.priceMinor !== undefined && next.priceMinor !== existing.priceMinor) {
    changes.priceFrom = existing.priceMinor;
    changes.priceTo = next.priceMinor;
  }
  if (next.status !== undefined && next.status !== existing.status) {
    changes.statusFrom = existing.status;
    changes.statusTo = next.status;
  }
  // The text is not copied into the audit metadata, only the fact that it
  // moved: a description can be 500 characters and the log is not the place
  // to keep a second copy of the product catalogue.
  if (next.name !== undefined && next.name !== existing.name) changes.renamed = true;
  if (next.description !== undefined && next.description !== existing.description) {
    changes.describedAgain = true;
  }

  await audit(scope.user.id, "product.updated", product.id, scope.founderId, {
    name: product.name,
    ...changes,
    // On the record, so "why was this live and unpayable for a week" has an
    // answer that does not depend on anyone remembering.
    ...(liveWithoutPayments ? { liveWithoutPayments: true } : {}),
  });

  // The client decides how loudly to say it; the API's job is not to imply the
  // product is ready when it is not.
  return NextResponse.json({
    ok: true,
    product,
    ...(liveWithoutPayments
      ? {
          warning: {
            code: "payments_not_set_up" as const,
            message:
              "This is Live, but your payment setup isn't finished, so anyone who opens the "
              + "link is told the item is not available and no card is charged.",
          },
        }
      : {}),
  });
}
