import type { Metadata } from "next";
import { db } from "@/lib/db";
import { resolvePurchasable, isPurchasable, REASON_TEXT, formatMinor } from "@/lib/checkout";
import { buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import PayClient from "./PayClient";
import RecordView from "./RecordView";
import {
  CheckoutHeading, CheckoutSummary, CheckoutAssurance, CheckoutUnavailable,
} from "@/app/_ui/checkout-parts";

export const viewport = buildViewport();

// The visible parts come from app/_ui/checkout-parts.tsx, shared with the
// preview on the home page so the two cannot describe this page differently.
//
// A stranger with the link is the audience, so nothing here needs a session.
// Rendered per request: a price or a product's status can change between the
// founder sharing the link and a customer opening it.
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ founderId: string; productId: string }>;
  searchParams?: Promise<{ intent?: string | string[] }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { founderId, productId } = await params;
  const product = await db.founderProduct.findUnique({ where: { id: productId } });
  if (!product || product.founderId !== founderId) {
    return { title: "Payment | Veyro", robots: { index: false, follow: false } };
  }
  return {
    title: `${product.name}, ${formatMinor(product.priceMinor, product.currency)}`,
    description: product.description,
    // A payment link is for whoever it was given to, not for search results.
    robots: { index: false, follow: false },
  };
}

export default async function PayPage({ params, searchParams }: Params) {
  const { founderId, productId } = await params;

  // An intent minted by POST /api/checkout/create, carried here by the SDK so
  // the customer pays the one the integrator is waiting on. Passed along as a
  // hint only — checkout-intent re-reads it from Stripe and refuses one whose
  // metadata does not name this product, so a pasted id buys nothing.
  const rawIntent = (await searchParams)?.intent;
  const intentHint = (Array.isArray(rawIntent) ? rawIntent[0] : rawIntent)?.trim();
  const resolved = await resolvePurchasable(founderId, productId);

  const seller = await db.user.findUnique({
    where: { id: founderId },
    select: { name: true },
  });

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="wrap-s">
        <div className="lp-nav" style={{ borderBottom: 0 }}>
          <Wordmark size={18} />
          <span className="tiny">Payments secured by Stripe</span>
        </div>
      </div>

      <main id="main" className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
        {!isPurchasable(resolved) ? (
          <CheckoutUnavailable reason={REASON_TEXT[resolved]} sellerName={seller?.name} />
        ) : (
          <>
            <CheckoutHeading name={resolved.product.name} sellerName={seller?.name} />

            <CheckoutSummary
              description={resolved.product.description}
              priceMinor={resolved.product.priceMinor}
              currency={resolved.product.currency}
              recurring={resolved.product.priceRecurring}
            />

            <div style={{ marginTop: 16 }}>
              <PayClient
                founderId={founderId}
                productId={productId}
                intentHint={intentHint}
                amountLabel={formatMinor(resolved.product.priceMinor, resolved.product.currency)}
              />
            </div>

            <CheckoutAssurance />

            {/* Counts this page load, from the browser. Inside the purchasable
                branch on purpose: a view of something nobody could have bought
                is not a missed sale and does not belong in the denominator. */}
            <RecordView founderId={founderId} productId={productId} />
          </>
        )}
      </main>
    </div>
  );
}
