import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";
import {
  BALANCE_MINOR, COLLECTED_MINOR, PROCESSING_MINOR, VEYRO_FEE_MINOR, SETTLING_MINOR,
  SALE_GROSS_MINOR, SALE_FEE_MINOR, SALE_NAME, PRIOR,
} from "@/app/_ui/wallet-example";

// The hero's product visual: one money position, and a sale arriving.
//
// WHAT IT IS NOT, STILL. Not a checkout pane bolted to a wallet, not five
// interrogable fee terms, not three status chips, not a live region. Those
// came out for good reasons and they stay out. What came back is motion,
// and one line of arithmetic that earns its place.
//
// AND NOT A WAY OUT OF THE FUNNEL. It carried a "View in Stripe" link to
// dashboard.stripe.com, which was accurate -- that genuinely is where
// payouts are scheduled -- and wrong for the hero. A visitor here has no
// Veyro account and no context; the link dropped them into somebody else's
// onboarding, and it put the processor's name on a button at the exact
// moment a reader is deciding whether they could skip us and go straight
// there. That objection is the one the whole site is built to answer (see
// the note in GuardianPermissions on why the processor is not named in the
// six lines it renders), and the hero is the worst possible place to raise
// it. The card is an example; it has no controls at all now, and the one
// action in the hero is the one CTA beside it.
//
// The payout fact stays, as prose. It is load-bearing: it is the
// correction to a claim this site shipped saying nobody could block a
// payout, when the guardian owns the connected account.
//
// THE TWO MOVEMENTS, AND WHY EACH ONE IS TRUE.
//
// The balance counts from zero. See CountUp: it counts from nothing to the
// real figure, never between two real balances. An earlier version stepped
// $171.86 up to $195.00 as the sale settled, which was accurate and read as
// a glitch -- the smaller number on screen first, in the one place the page
// wants you to look. Counting from zero is a flourish; counting from
// another balance is a change, and a change needs a cause the viewer saw.
//
// The newest row arrives. That IS a cause the viewer sees, and it is the
// product's whole emotional point: somebody bought the thing you made. It
// slides in once, holds a pine tint for a beat, and settles. The row's box
// is reserved from the first paint, so nothing below it moves.
//
// They are two beats, in order: the balance settles at 850ms, the sale
// lands at 950ms, and everything is still by 1.9s. Overlapped, they read as
// one busy moment; sequenced, the card looks like it is working. The old
// hero sequence ran 3.3s and was still rearranging itself while you read
// the headline.
//
// THE ARITHMETIC LINE replaced a second figure block. "Available $195.00"
// beside "Settling $3.15" left a 145px hole between the figures and the
// action, and it invited the question it did not answer: where did the
// other fifteen dollars go. Collected, fees, settling -- one line, computed
// from the same constants, and the difference is the balance above it.
//
// NOTHING IS EVER A ZERO WAITING TO BE FILLED IN. The server renders the
// final state: full balance, both rows present. The arrival is a CSS
// animation with fill-mode both, so the only thing that hides the row is a
// declarative rule that prefers-reduced-motion switches off -- there is no
// state, no effect and no moment where a failed hydration could leave the
// card empty. CountUp is the one client island in the hero, and it starts
// from the real figure too.

const NET_MINOR = SALE_GROSS_MINOR - SALE_FEE_MINOR;
const FEES_MINOR = PROCESSING_MINOR + VEYRO_FEE_MINOR;

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
          An example founder wallet. {formatMinor(COLLECTED_MINOR, "USD")} collected this month,
          less {formatMinor(FEES_MINOR, "USD")} in fees and{" "}
          {formatMinor(SETTLING_MINOR, "USD")} still settling, leaving an available balance of{" "}
          {formatMinor(BALANCE_MINOR, "USD")}. The two most recent payments are listed. Payouts
          are scheduled in Stripe by the guardian, who is the account holder. Every figure is
          invented.
        </p>

        <div className="hw-top" aria-hidden="true">
          <div className="hw-figs">
            <span className="fig-k">Available</span>
            <span className="fig fig-xl hw-bal">
              {/* 850ms rather than the default 1100, so the balance has
                  settled before the sale lands on top of it. Two beats,
                  not one blur. */}
              <CountUp amountMinor={BALANCE_MINOR} currency="USD" durationMs={850} />
            </span>
            {/* Where the balance came from, computed rather than typed.
                Inside the figure block rather than beside it: when the
                card narrows and the action wraps onto its own line, a
                sibling here would have put the button between the balance
                and the sentence explaining it. */}
            <p className="hw-sum">
              <span>{formatMinor(COLLECTED_MINOR, "USD")} collected</span>
              <span className="hw-dot" aria-hidden="true" />
              <span>{formatMinor(FEES_MINOR, "USD")} fees</span>
              <span className="hw-dot" aria-hidden="true" />
              <span>{formatMinor(SETTLING_MINOR, "USD")} settling</span>
            </p>
          </div>
        </div>

        <ul className="hw-led" aria-hidden="true">
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

        {/* The one sentence the card cannot do without. "View in Stripe"
            only makes sense once you know whose Stripe, and this is the
            fact the rest of the site is at pains to establish. */}
        <p className="hw-foot">Payouts are scheduled in Stripe, by your guardian.</p>
      </div>
    </div>
  );
}
