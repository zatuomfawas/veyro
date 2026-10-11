import { formatMinor } from "@/lib/money";
import {
  BALANCE_MINOR, COLLECTED_MINOR, PROCESSING_MINOR, VEYRO_FEE_MINOR, SETTLING_MINOR,
  SALE_GROSS_MINOR, SALE_FEE_MINOR, SALE_NAME, PRIOR,
} from "@/app/_ui/wallet-example";
import { CountUp } from "@/app/_ui/CountUp";

// The hero's money position. Not a card: the page itself.
//
// WHAT WENT. A border, a grey header strip and an "EXAMPLE" chip in the
// corner. Together they framed this as a screenshot of a product sitting
// beside a headline, rather than as the product. The chip was the worst of
// the three -- an all-caps badge stapled to the one surface on the site
// that shows instead of explaining, undercutting it at the moment it is
// meant to carry the page.
//
// WHAT REPLACED THE CHIP. A plain sentence under the figures: an example
// wallet, yours once your country is supported and a guardian is verified.
// It is honest in words a person reads rather than a badge that shouts, and
// it carries the eligibility qualifier the headline above it needs -- so
// one line does the work of a disclaimer, a caption and a condition.
//
// WHY TWO HAIRLINES SURVIVED. Taking every frame away was the obvious move
// and it is half wrong. Unbounded, invented figures stop reading as an
// example of somebody's wallet and start reading as THIS visitor's data,
// which makes the honesty problem worse rather than better. A rule above
// and below bounds the surface in the page's own language, and puts the
// honest line immediately beneath the lower rule where it reads as a
// caption to the thing it closes.
//
// THE FEES LINE IS SPLIT, AND THAT IS A CORRECTION. It read "$11.85 fees",
// which is true -- $8.55 to the card processor plus $3.30 to Veyro -- and
// unverifiable, because the published schedule is 3% above $100 and 3% of
// $110 is $3.30, not $11.85. Anyone checking the hero with a calculator
// found a number that did not match the pricing page. Same figures, named
// separately, and now the 3% is the one you can check. Veyro's fee being
// the smaller of the two is also the better thing to show.
//
// EVERY FIGURE RECONCILES. feeMinor() computes the $3.30 from the same
// function that charges a real founder, and 210.00 - 8.55 - 3.30 - 3.15 is
// 195.00 exactly. /how-it-works renders the same constants.

const NET_MINOR = SALE_GROSS_MINOR - SALE_FEE_MINOR;

/** The month, named so each figure can be checked on its own. */
const BREAKDOWN = [
  { k: "Collected", v: COLLECTED_MINOR },
  { k: "Card fees", v: PROCESSING_MINOR },
  { k: "Veyro fee", v: VEYRO_FEE_MINOR },
  { k: "Settling", v: SETTLING_MINOR },
] as const;

export function HeroWallet() {
  return (
    <div className="hw">
      <p className="sr-only">
        An example founder wallet. {formatMinor(COLLECTED_MINOR, "USD")} collected this month,
        less {formatMinor(PROCESSING_MINOR, "USD")} in card processing fees,{" "}
        {formatMinor(VEYRO_FEE_MINOR, "USD")} to Veyro and{" "}
        {formatMinor(SETTLING_MINOR, "USD")} still settling, leaving an available balance of{" "}
        {formatMinor(BALANCE_MINOR, "USD")}. The two most recent payments are listed. Payouts
        are scheduled in Stripe by the guardian, who is the account holder. Every figure is
        invented.
      </p>

      <div className="hw-grid" aria-hidden="true">
        <div className="hw-money">
          {/* Sentence case. An all-caps label on the single most important
              number in the hero is the one place the page could least
              afford to look machine-set. */}
          <span className="hw-k">Available</span>
          <span className="hw-bal">
            <CountUp amountMinor={BALANCE_MINOR} currency="USD" durationMs={850} />
          </span>

          <dl className="hw-break">
            {BREAKDOWN.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{formatMinor(f.v, "USD")}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hw-side">
          <ul className="hw-led">
            <li className="hw-new">
              <span className="hw-n">{SALE_NAME}</span>
              <span className="hw-w">Just now</span>
              <span className="hw-a fig-pos">+{formatMinor(NET_MINOR, "USD")}</span>
            </li>
            {PRIOR.slice(0, 1).map((r) => (
              <li key={r.name}>
                <span className="hw-n">{r.name}</span>
                <span className="hw-w">{r.when}</span>
                <span className="hw-a">{formatMinor(r.amt, "USD")}</span>
              </li>
            ))}
          </ul>
          {/* Load-bearing for accuracy, and the stated exception to keeping
              the processor out of marketing copy: the guardian holds the
              payout settings, and this is the correction to a claim the
              site shipped saying nobody could block a payout. */}
          <p className="hw-foot">Payouts are scheduled in Stripe, by your guardian.</p>
        </div>
      </div>
    </div>
  );
}
