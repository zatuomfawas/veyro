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
    title: `${product.name}, ${formatMinor(product.priceMinor, product.currency)}`,
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
          <span className="tiny">Payments secured by Stripe</span>
        </div>
      </div>

      <main id="main" className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
        {!isPurchasable(resolved) ? (
          <>
            <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>Not available</h1>
            <p className="body" style={{ marginTop: 12 }}>{REASON_TEXT[resolved]}</p>
            <p className="tiny" style={{ marginTop: 16 }}>
              You have not been charged, and nothing has been taken from your card. If someone sent
              you this link, ask them to check it and send a new one.
            </p>
          </>
        ) : (
          <>
            <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>{resolved.product.name}</h1>
            {seller?.name && (
              <p className="tiny" style={{ marginTop: 4 }}>
                Sold by {seller.name}, through Veyro
              </p>
            )}

            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-b">
                <p className="small">{resolved.product.description}</p>
                <div className="row-b" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                  <span className="lbl">Total</span>
                  <span className="num" style={{ fontSize: "var(--fs-6)", fontWeight: 600 }}>
                    {formatMinor(resolved.product.priceMinor, resolved.product.currency)}
                    {resolved.product.priceRecurring && (
                      <span className="tiny" style={{ marginLeft: 4 }}>per month</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <PayClient
                founderId={founderId}
                productId={productId}
                amountLabel={formatMinor(resolved.product.priceMinor, resolved.product.currency)}
              />
            </div>

            <div className="statusblock" style={{ marginTop: 20 }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                <span className="sb-mark sb-mark-pine" />
                <div>
                  <div className="sb-head">Where your money and your card details go</div>
                  <p className="sb-body">
                    Your card details are entered on Stripe&rsquo;s own form and are never seen by
                    Veyro or by the seller. The payment goes directly to the seller&rsquo;s Stripe
                    account. Veyro never holds it and takes no percentage of it.
                  </p>
                </div>
              </div>
            </div>

            <p className="tiny" style={{ marginTop: 16, maxWidth: "var(--m-body)" }}>
              This seller is under 18 and has a parent or guardian named on the payment account, as
              the provider requires. Questions about a payment? Email{" "}
              <a className="linkbtn" href="mailto:hello@withveyro.com">hello@withveyro.com</a>.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
