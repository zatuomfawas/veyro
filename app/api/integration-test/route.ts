// Is this product actually ready to sell?
//
// A founder pastes a product id and gets back a list of yes and no. Every field
// is something the server can genuinely observe: the brief also asked for
// `sdkInstalled`, which is not one of them — the server sees a product id, not
// somebody's node_modules — so it is absent rather than guessed. A check that
// reports what it cannot know is worse than no check, because it is believed.
//
// checkoutOpens is the interesting one. It is not a claim that a payment will
// succeed, which nobody can know without taking one; it is the same question
// the hosted page asks before rendering a form, answered by the same function.
import { db } from "@/lib/db";
import { resolvePurchasable, isPurchasable } from "@/lib/checkout";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { corsJson, corsPreflight } from "@/lib/cors";
import { explain } from "@/lib/sdk-errors";
import { PRICE_MIN_MINOR } from "@/lib/product-rules";

/** explain() without its ok:false — the check succeeded, the product did not. */
function why(code: Parameters<typeof explain>[0]) {
  const { error, fixPrompt, code: c } = explain(code);
  return { code: c, error, fixPrompt };
}

export const runtime = "nodejs";

const LIMIT = 30;
const WINDOW_MS = 60_000;

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const gate = rateLimit(`sdk-test:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) {
    return corsJson(explain("rate_limited"), { status: 429, headers: { "retry-after": String(gate.retryAfter) } });
  }

  const body = await req.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  if (!productId) return corsJson(explain("no_product_id"), { status: 400 });

  const product = await db.founderProduct.findUnique({ where: { id: productId } });

  if (!product) {
    return corsJson({
      ok: true,
      productFound: false,
      productLive: false,
      priceValid: false,
      accountActive: false,
      checkoutOpens: false,
      everSold: false,
      readyToLaunch: false,
      ...why("product_not_found"),
    });
  }

  const account = await db.founderPaymentAccount.findUnique({
    where: { founderId: product.founderId },
  });
  const resolved = await resolvePurchasable(product.founderId, productId);
  const sold = await db.founderTransaction.count({
    where: { productId, status: "COMPLETED" },
  });

  const productLive = product.status === "LIVE";
  const priceValid = product.priceMinor >= PRICE_MIN_MINOR;
  const accountActive = account?.status === "ACTIVE" && Boolean(account.providerAccountId);
  const checkoutOpens = isPurchasable(resolved);

  // The first thing standing in the way, so a founder is told one job rather
  // than a wall of red. Ordered the way the work actually happens.
  const blocker = !productLive ? "product_not_live"
    : !priceValid ? "price_not_set"
      : !accountActive ? "payments_not_set_up"
        : !checkoutOpens && !isPurchasable(resolved) ? resolved
          : null;

  return corsJson({
    ok: true,
    productFound: true,
    productLive,
    priceValid,
    accountActive,
    checkoutOpens,
    everSold: sold > 0,
    readyToLaunch: checkoutOpens,
    ...(blocker ? why(blocker) : {}),
  });
}
