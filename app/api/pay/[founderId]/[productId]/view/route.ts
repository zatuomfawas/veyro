// Record that someone opened a checkout page.
//
// Called from the browser after the page renders, not during the render, and
// the difference matters for every number built on top of it. Recording in the
// server component would count Next's own re-renders, link prefetches, crawlers
// and anything else that fetches HTML without a person looking at it, and the
// conversion rate would then be divided by a denominator full of machines.
//
// Nothing about the visitor is stored or sent. Repeat-view suppression happens
// in the customer's own browser, in sessionStorage, so there is no cookie, no
// fingerprint and no identifier to leak. The cost of that choice is that the
// count cannot be perfectly deduplicated — someone opening the link in two
// browsers counts twice — and the dashboard says as much rather than implying
// a precision this does not have.
//
// Failure is silent by design. A view that goes unrecorded is a slightly low
// number on a dashboard; an error thrown here would be an error on a page where
// a stranger is trying to pay a teenager. The payment always wins.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolvePurchasable, isPurchasable } from "@/lib/checkout";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Generous, because a legitimate customer hits this once per product per
// session. Anything above this is a script, and a script's views are not worth
// counting.
const LIMIT = 10;
const WINDOW_MS = 60_000;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ founderId: string; productId: string }> },
) {
  const { founderId, productId } = await ctx.params;

  const gate = rateLimit(`view:${clientIp(req)}:${productId}`, LIMIT, WINDOW_MS);
  if (!gate.ok) {
    // 204 rather than 429: the caller is a fire-and-forget beacon with nothing
    // to retry, and telling a scraper which requests were counted invites it to
    // pace itself to the limit.
    return new NextResponse(null, { status: 204 });
  }

  // Only count what a customer could actually have bought. A view of an
  // archived or unpayable product is not a missed sale, and letting those into
  // the denominator would push the conversion rate down for a reason the
  // founder cannot act on.
  const resolved = await resolvePurchasable(founderId, productId);
  if (!isPurchasable(resolved)) return new NextResponse(null, { status: 204 });

  const now = new Date();
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  try {
    // Upsert on the (productId, day) unique index. Two simultaneous first
    // views of the day race on the insert; the loser's unique violation is
    // turned into the update by Prisma, so neither is dropped.
    await db.checkoutView.upsert({
      where: { productId_day: { productId, day } },
      create: { founderId, productId, day, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    // See the note at the top: a lost count is not worth an error response.
  }

  return new NextResponse(null, { status: 204 });
}
