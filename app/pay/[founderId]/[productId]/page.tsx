import type { Metadata } from "next";
import { db } from "@/lib/db";
import { resolvePurchasable, isPurchasable, REASON_TEXT, formatMinor } from "@/lib/checkout";
import { buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import PayClient from "./PayClient";

export const viewport = buildViewport();

// A stranger with the link is the audience, so nothing here needs a session.
// Rendered per request: a price or a product's status can change between the
// founder sharing the link and a customer opening it.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ founderId: string; productId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { founderId, productId } = await params;
  const product = await db.founderProduct.findUnique({ where: { id: productId } });
  if (!product || product.founderId !== founderId) {
    return { title: "Payment | Veyro", robots: { index: false, follow: false } };
  }
  return {
    title: `${product.name} — ${formatMinor(product.priceMinor, product.currency)}`,
    description: product.description,
    // A payment link is for whoever it was given to, not for search results.
    robots: { index: false, follow: false },
  };
}

export default async function PayPage({ params }: Params) {
  const { founderId, productId } = await params;
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
          <span className="tiny">Secure payment</span>
        </div>
      </div>

      <main id="main" className="wrap-s" style={{ marginTop: 10, marginBottom: 90 }}>
        {!isPurchasable(resolved) ? (
          <>
            <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>Not available</h1>
            <p className="body" style={{ marginTop: 12 }}>{REASON_TEXT[resolved]}</p>
            <p className="tiny" style={{ marginTop: 16 }}>
              Nothing has been charged. If you were sent this link, ask whoever sent it to check it.
            </p>
          </>
        ) : (
          <>
            <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>{resolved.product.name}</h1>
            {seller?.name && (
              <p className="tiny" style={{ marginTop: 6 }}>Sold by {seller.name}</p>
            )}

            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-b">
                <p className="small">{resolved.product.description}</p>
                <div className="row-b" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <span className="lbl">Total</span>
                  <span className="num" style={{ fontSize: "var(--fs-6)", fontWeight: 600 }}>
                    {formatMinor(resolved.product.priceMinor, resolved.product.currency)}
                    {resolved.product.priceRecurring && (
                      <span className="tiny" style={{ marginLeft: 6 }}>per month</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <PayClient
                founderId={founderId}
                productId={productId}
                amountLabel={formatMinor(resolved.product.priceMinor, resolved.product.currency)}
              />
            </div>

            <p className="tiny" style={{ marginTop: 20, maxWidth: "var(--m-body)" }}>
              Card details go straight to Stripe and are never seen by Veyro or by the seller. The
              money goes to the seller&rsquo;s own Stripe account, not to Veyro.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
