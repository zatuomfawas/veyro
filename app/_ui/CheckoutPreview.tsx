// What your customer sees, on the home page.
//
// Built from the checkout page's own components rather than framed, screenshot
// or retyped. Three reasons, and the first two are not preferences:
//
//   Veyro sends frame-ancestors 'none' and X-Frame-Options: DENY on every
//   response, so no page can put a Veyro page in an iframe — including this
//   one. There is no partial version of that; the browser refuses.
//
//   The real page creates a Stripe PaymentIntent when it loads. Embedding it
//   here would create one every time a stranger scrolled past the home page:
//   abandoned intents, a burnt rate limit, and the per-IP ceiling tripping for
//   real customers behind a shared connection.
//
//   A screenshot or a hand-typed copy is true on the day it is made and
//   quietly false afterwards. These are the same components the checkout page
//   renders, so the preview cannot drift from it without the build noticing.
//
// Everything except the card form is therefore the real thing. The card form
// is Stripe's PaymentElement and cannot render without a live payment, so that
// one part is a labelled still.

import Link from "next/link";
import { formatMinor } from "@/lib/money";
import {
  CheckoutHeading, CheckoutSummary, CheckoutAssurance, CardFormStill,
} from "@/app/_ui/checkout-parts";

/** Illustrative, and labelled as such everywhere it appears. */
const DEMO = {
  sellerName: "Alex Taylor",
  name: "Notion Second Brain",
  description: "A Notion workspace for notes, tasks and reading, set up and ready to duplicate.",
  priceMinor: 2500,
  currency: "USD",
};

export function CheckoutPreview() {
  const amount = formatMinor(DEMO.priceMinor, DEMO.currency);

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="card-h">
        <span style={{ fontSize: "var(--fs-2)", fontWeight: "var(--fw-med)", color: "var(--ink-3)" }}>
          Your checkout page
        </span>
        <span className="badge b-grey">Example</span>
      </div>

      {/* The same chrome the real page carries above the product. */}
      <div className="card-b">
        <div className="lp-nav" style={{ borderBottom: 0, height: "auto", paddingBottom: 12 }}>
          <span className="mono" style={{ fontWeight: "var(--fw-bold)" }}>Veyro</span>
          <span className="tiny">Payments secured by Stripe</span>
        </div>

        <CheckoutHeading as="h3" name={DEMO.name} sellerName={DEMO.sellerName} />

        <CheckoutSummary
          description={DEMO.description}
          priceMinor={DEMO.priceMinor}
          currency={DEMO.currency}
        />

        <CardFormStill amountLabel={amount} />

        {/* The under-18 line belongs to a real seller's page, not to an
            example, so it is left off here and the assurance is kept. */}
        <CheckoutAssurance underAgeNote={false} />
      </div>

      <div className="card-f">
        <p className="tiny" style={{ margin: 0 }}>
          Everything above is the checkout page&rsquo;s own components, so it cannot fall out of
          step with the real one. The card fields are drawn rather than live: the real form is
          Stripe&rsquo;s, and it only appears once a customer is actually paying.{" "}
          <Link className="linkbtn" href="/get-started">How you get one</Link>
        </p>
      </div>
    </div>
  );
}
