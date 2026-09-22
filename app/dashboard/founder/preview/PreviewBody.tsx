// The visible half of the preview page, taking plain values.
//
// Split from the route so it can be rendered without a session. The route does
// auth, ownership and the database; this does the looking. Nothing here reaches
// for a cookie or a row, which is what makes it possible to check the draft,
// the blocked draft and the live cases side by side rather than asserting they
// are probably fine.

import Link from "next/link";
import { OWNER_REASON_TEXT, formatMinor, type NotPurchasable } from "@/lib/checkout";
import { Wordmark } from "@/app/_ui/marks";
import { Notice } from "@/app/_ui/form";
import {
  CheckoutHeading, CheckoutSummary, CheckoutAssurance, CardFormStill,
} from "@/app/_ui/checkout-parts";

const BADGE: Record<string, string> = { LIVE: "b-pine", DRAFT: "b-amber", ARCHIVED: "b-grey" };
const LABEL: Record<string, string> = { LIVE: "Live", DRAFT: "Draft", ARCHIVED: "Archived" };

export function PreviewBody({
  name, description, priceMinor, currency, recurring, status, sellerName, blockers, payHref,
}: {
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  recurring?: boolean;
  status: string;
  sellerName: string | null;
  /** From saleBlockers: the same checks the real checkout runs. */
  blockers: NotPurchasable[];
  /** The real checkout, offered only when the product is actually live. */
  payHref: string | null;
}) {
  const live = status === "LIVE";

  return (
    <main id="main" className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
      <div className="card">
        <div className="card-h">
          <span style={{ fontSize: "var(--fs-2)", fontWeight: "var(--fw-med)", color: "var(--ink-3)" }}>
            Preview &middot; what a customer sees
          </span>
          <span className={"badge " + (BADGE[status] ?? "b-grey")}>{LABEL[status] ?? status}</span>
        </div>

        <div className="card-b">
          {/* The chrome the real page carries above the product. */}
          <div className="lp-nav" style={{ borderBottom: 0, height: "auto", paddingBottom: 12 }}>
            <span className="mono" style={{ fontWeight: "var(--fw-bold)" }}>Veyro</span>
            <span className="tiny">Payments secured by Stripe</span>
          </div>

          <CheckoutHeading name={name} sellerName={sellerName} />

          <CheckoutSummary
            description={description}
            priceMinor={priceMinor}
            currency={currency}
            recurring={recurring}
          />

          <CardFormStill amountLabel={formatMinor(priceMinor, currency)} />

          <CheckoutAssurance />
        </div>

        <div className="card-f">
          <p className="tiny" style={{ margin: 0 }}>
            Everything above is the checkout page&rsquo;s own components, so it cannot fall out of
            step with the real one. The card fields are drawn rather than live &mdash; nothing on
            this page can take a payment.
          </p>
        </div>
      </div>

      {/* Pre-flight. These are the same checks the real checkout runs, from the
          same function, so "nothing standing in the way" here means the page
          will actually render a form once the product is live. */}
      <div className="stack" style={{ marginTop: 20 }}>
        {blockers.length > 0 ? (
          <Notice
            tone="amber"
            head={blockers.length === 1 ? "One thing to fix first" : `${blockers.length} things to fix first`}
          >
            <ul style={{ margin: "4px 0 0", paddingLeft: "1.1em" }}>
              {blockers.map((b) => <li key={b}>{OWNER_REASON_TEXT[b]}</li>)}
            </ul>
          </Notice>
        ) : live && payHref ? (
          <Notice tone="pine" head="This is live">
            Customers can open it now.{" "}
            <a className="linkbtn" href={payHref} target="_blank" rel="noopener">
              Open the real checkout
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Notice>
        ) : status === "ARCHIVED" ? (
          /* Archived is retired on purpose, not "not published yet". Telling
             someone their archived product is one step from selling would be
             advice to undo a decision they made deliberately. */
          <Notice tone="grey" head="Archived">
            Nobody can open this. Nothing is wrong with it, so bringing it back is a matter of
            making it live again.
          </Notice>
        ) : (
          <Notice tone="slate" head="Nothing standing in the way">
            {OWNER_REASON_TEXT.product_not_live} Everything else is ready, so making it live is the
            only step left.
          </Notice>
        )}
      </div>
    </main>
  );
}

/** The page's own header, kept beside the body it belongs to. */
export function PreviewChrome() {
  return (
    <div className="wrap-s">
      <div className="lp-nav" style={{ borderBottom: 0 }}>
        <Wordmark size={18} />
        <Link className="linkbtn" href="/dashboard/founder#products">Back to products</Link>
      </div>
    </div>
  );
}
