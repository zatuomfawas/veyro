import Link from "next/link";
import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";
import {
  PRODUCT_NAME, PRODUCT_PRICE_MINOR, PRODUCT_SALES, PRODUCT_EARNED_MINOR, PRODUCT_FEE_MINOR,
} from "@/app/_ui/wallet-example";

// One product, and what it earned.
//
// WHAT THIS REPLACED, AND WHY IT KEPT FAILING. Three versions of this card
// have shown the month's balance, and all three had the same problem under
// different surfaces: $195.00 is an abstract figure. It arrives from nowhere,
// it is labelled as invented, and the only thing it tells a fifteen-year-old
// is that Veyro has a wallet screen. The first version surrounded it with a
// fee table, the second with two ledger rows that did not add up to it, the
// third with a sentence that did. Each fixed the arithmetic and none of them
// fixed the fact that the number was not worth reading.
//
// What a founder wants to know before they spend ten minutes on this is
// smaller and much more concrete: if I put a thing up at twelve dollars and
// twelve people buy it, what happens? So that is what the card says. A price
// they might plausibly charge, a number of sales they can picture, the total
// those produce, and what Veyro takes out of it.
//
// THE FEE IS THE POINT OF THE CARD, not a disclosure bolted onto it. $1.32 on
// $144.00 is the free allowance doing its work in public: the first $100 each
// month costs nothing, so the fee lands on $44 of it. A reader can check that
// in their head, and it is a far better argument for the pricing than the
// word "free" anywhere on the page. It is computed by feeMinor(), the same
// function that charges a real founder, so it cannot drift from the rule.
//
// WHAT IS DELIBERATELY NOT HERE. No card-processing figure. Stripe sets and
// deducts its own fees and they vary by country, and this repository does not
// encode a per-transaction rate -- so quoting one would be inventing a number
// on the one surface whose whole argument is that its numbers are checkable.
// The footer says Stripe holds the money; /pricing carries the detail.
//
// THE COUNT STAYS, on the one figure that is the outcome. CountUp renders the
// true value on the server, so with no JavaScript, with reduced motion, or
// before hydration $144.00 is already in the HTML.

export function HeroWallet() {
  return (
    <div className="hw">
      <div className="hw-body">
        <div className="hw-head">
          <p className="hw-k">{PRODUCT_NAME}</p>
          <p className="hw-eg">Example</p>
        </div>

        {/* Price and volume first, because they are the two things the reader
            supplies from their own life. The total is the consequence. */}
        <p className="hw-terms">
          {formatMinor(PRODUCT_PRICE_MINOR, "USD")} each, {PRODUCT_SALES} sold this month
        </p>

        <p className="hw-bal">
          <CountUp amountMinor={PRODUCT_EARNED_MINOR} currency="USD" durationMs={760} startDelayMs={260} />
        </p>

        <p className="hw-sum">
          Veyro&rsquo;s fee on that is {formatMinor(PRODUCT_FEE_MINOR, "USD")}, because the first
          $100 each month is free.
        </p>
      </div>

      <div className="hw-foot">
        <p>
          The account is in your guardian&rsquo;s name and Stripe holds the money. Veyro never
          does. <Link className="linkbtn" href="/for-parents">What a parent takes on</Link>
        </p>
      </div>
    </div>
  );
}
