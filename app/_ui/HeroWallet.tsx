import { formatMinor } from "@/lib/money";
import { PAYOUTS_URL } from "@/lib/stripe-urls";
import {
  BALANCE_MINOR, SETTLING_MINOR, SALE_GROSS_MINOR, SALE_FEE_MINOR, SALE_NAME, PRIOR,
} from "@/app/_ui/wallet-example";

// The hero's product visual: a money position, and the last two things that
// happened. Nothing else.
//
// WHAT IT REPLACED. The hero carried a composite -- a checkout pane, a
// labelled join, and a cut-down LiveWallet -- which between them put a
// frame bar, two pane labels, a product row, a Pay button, a note, a joining
// sentence, a balance, a payout control, five interrogable fee terms, a live
// region, three status chips, two ledger rows and a payout footer on the
// screen. Fourteen things, next to a headline that wanted to be the only
// thing. Every one of them was defensible on its own and the total was
// noise.
//
// WHAT IS LEFT, AND WHY EACH SURVIVED.
//
//   Available       the number a founder opens the page for
//   Settling        so the available figure means something; one implies
//                   the other, and a wallet with a single number looks
//                   like a bank balance rather than a payments position
//   View in Stripe  where payouts actually happen, named honestly
//   Two rows        proof that it is a ledger and not a statistic
//   Example         because every figure on it is invented
//
// The fee arithmetic went to /how-it-works, where a reader has asked for it.
// The checkout went to the sections below, which already show it. Status
// chips went entirely: the two balances above already say what state money
// is in, so a badge on each row was the same fact a third and fourth time.
//
// A SERVER COMPONENT, WITH NO JAVASCRIPT. The old one counted up, observed
// its own intersection and walked a sale through three states on a timer.
// It was good work and it was the wrong thing above the fold: a hero that
// animates while you are reading its headline is competing with itself. The
// section's existing CSS entrance is motion enough, and it already honours
// prefers-reduced-motion. This file ships no runtime at all.

const NET_MINOR = SALE_GROSS_MINOR - SALE_FEE_MINOR;

export function HeroWallet() {
  return (
    <div className="hw">
      {/* Says "Example" where a sighted reader can see it, not only in the
          screen-reader summary. The figures are invented and a product
          preview that does not admit it is a different kind of product. */}
      <div className="hw-bar" aria-hidden="true">
        <span className="hw-bar-t">Your wallet</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="hw-body">
        <p className="sr-only">
          An example founder wallet. {formatMinor(BALANCE_MINOR, "USD")} available and{" "}
          {formatMinor(SETTLING_MINOR, "USD")} still settling, with the two most recent
          payments listed. Payouts are scheduled in Stripe by the guardian, who is the
          account holder. Every figure is invented.
        </p>

        <div className="hw-top" aria-hidden="true">
          <div className="hw-figs">
            <div>
              <span className="fig-k">Available</span>
              <span className="fig fig-xl hw-bal">{formatMinor(BALANCE_MINOR, "USD")}</span>
            </div>
            <div className="hw-pending">
              <span className="fig-k">Settling</span>
              <span className="fig fig-sm">{formatMinor(SETTLING_MINOR, "USD")}</span>
            </div>
          </div>
          {/* A real link to the real place. The balance beside it is an
              example; the destination is not. */}
          <a className="hw-cta" href={PAYOUTS_URL} target="_blank" rel="noopener noreferrer">
            View in Stripe
          </a>
        </div>

        <ul className="hw-led" aria-hidden="true">
          <li>
            <span className="hw-n">{SALE_NAME}</span>
            <span className="hw-w">Today</span>
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

        {/* The one sentence the card cannot do without. "View in Stripe"
            only makes sense once you know whose Stripe, and this is the
            fact the rest of the site is at pains to establish. */}
        <p className="hw-foot">Payouts are scheduled in Stripe, by your guardian.</p>
      </div>
    </div>
  );
}
