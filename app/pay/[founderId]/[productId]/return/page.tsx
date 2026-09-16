import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";

export const viewport = buildViewport();
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment | Veyro",
  robots: { index: false, follow: false },
};

// Where Stripe sends the customer back after a redirect-based method (3D
// Secure, bank apps). Informational only, and deliberately so: `redirect_status`
// arrives in the URL, so it tells the customer what happened but is not what
// records the payment. The webhook does that, from Stripe's signed event.
export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_status?: string; payment_intent?: string }>;
}) {
  const { redirect_status: status, payment_intent: intentId } = await searchParams;

  const copy =
    status === "succeeded"
      ? {
          head: "Payment received",
          body: "Thank you. The seller has been notified and your payment is on its record.",
          tone: "sb-success",
          mark: "sb-mark-pine",
        }
      : status === "processing"
        ? {
            head: "Payment processing",
            body:
              "Your bank is still confirming this one. It usually takes a few moments, and the "
              + "seller sees it as soon as it clears. You can close this page.",
            tone: "",
            mark: "sb-mark-grey",
          }
        : {
            head: "Payment not completed",
            body:
              "This payment did not go through, and you have not been charged. You can go back "
              + "and try again, or use a different card.",
            tone: "sb-error",
            mark: "sb-mark-clay",
          };

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

      <main id="main" className="wrap-s" style={{ marginTop: 24, marginBottom: 90 }}>
        <div className={"statusblock " + copy.tone}>
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <span className={"sb-mark " + copy.mark} />
            <div>
              <div className="sb-head">{copy.head}</div>
              <p className="sb-body">{copy.body}</p>
            </div>
          </div>
        </div>

        {intentId && (
          <p className="tiny" style={{ marginTop: 16 }}>
            Reference <span className="mono">{intentId}</span>. Quote this if you need to ask about
            the payment.
          </p>
        )}
      </main>
    </div>
  );
}
