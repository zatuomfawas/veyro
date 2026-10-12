import Link from "next/link";
import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";
import {
  BALANCE_MINOR, SALE_GROSS_MINOR, SALE_FEE_MINOR, SALE_NAME, SALE_WHEN, PRIOR,
} from "@/app/_ui/wallet-example";

// The hero's money position: what you earned, and the two things that earned
// it.
//
// WHAT THIS REPLACED, AND WHY. The card used to carry five figures -- the
// balance, then Collected, Card fees, Veyro fee (3% over $100) and Settling
// (not cleared yet) -- over two paragraphs of disclosure. The argument for it
// was that every figure reconciles and a sceptical parent can add them up.
// That argument is right about the ledger and wrong about the hero, for three
// measured reasons.
//
//   It answered the wrong question first. A fee breakdown answers "what does
//   this cost", which is the second question a visitor has. The first is
//   "what is this", and the card spent 44% of a phone's first screen on the
//   answer to the second one.
//
//   Reconciliation is a task. Handing a reader 210.00 - 8.55 - 3.30 - 3.15
//   before they have been told what the product is asks them to do arithmetic
//   to earn the headline.
//
//   It did not fit. Measured at 390x844, the card ran 427px and pushed the
//   hero's own primary action to y=851 -- below the fold, on the one device
//   the primary audience is actually holding.
//
// The month's full arithmetic did not go anywhere: LiveWallet on
// /how-it-works carries all of it, interrogable, which is where a reader who
// wants to check the sums is already going. What the hero shows now is the
// thing the headline promises -- money that is yours, and the things you made
// that produced it.
//
// GREEN MARKS THE FOUNDER'S MONEY and nothing else: the balance, and the two
// amounts that landed. No green on the card, its border, its rule or its
// footer.
//
// THE SURFACE ASSEMBLES IN THE ORDER THE MONEY DID, and that order is the
// whole reason the motion is here rather than being decoration.
//
// Two sales settle into the ledger, and then the balance counts to the figure
// they add up to. Cause, then effect: it is what the product does, performed
// once. Running them together would have been two things moving at the same
// time for no stated reason, which is the version of this that is decoration.
//
// The count was removed in an earlier pass for a good reason -- at 1100ms
// from zero, the one green number in the hero was wrong for most of the first
// second, on a page whose argument is that its figures are checkable. The
// reason was right and the removal was the blunt answer to it. What fixes it
// is the curve and the clock, not the absence: at 760ms on a cubic ease-out
// the figure is within a few cents of $195.00 by about a third of the way
// through, so what a reader sees is a number arriving, never a wrong number
// sitting still.
//
// What has not changed is the safety: CountUp renders the true figure on the
// server, so with no JavaScript, with reduced motion, or if it never
// hydrates, $195.00 is already in the HTML. A zero is never painted on its
// own. On a page about money, a balance that could be caught reading nothing
// would be the worst failure available.

/** The two most recent payments, newest first, from the one invented month. */
const ROWS = [
  { name: SALE_NAME, when: SALE_WHEN, amt: SALE_GROSS_MINOR - SALE_FEE_MINOR },
  { name: PRIOR[0].name, when: PRIOR[0].when, amt: PRIOR[0].amt },
] as const;

export function HeroWallet() {
  return (
    <div className="hw">
      <p className="sr-only">
        An example founder wallet, with {formatMinor(BALANCE_MINOR, "USD")} available and the
        two most recent payments: {SALE_NAME},{" "}
        {formatMinor(SALE_GROSS_MINOR - SALE_FEE_MINOR, "USD")}, and {PRIOR[0].name},{" "}
        {formatMinor(PRIOR[0].amt, "USD")}. The account is in the guardian&rsquo;s name and they
        schedule payouts in Stripe, which holds the money. Every figure is invented.
      </p>

      <div className="hw-body" aria-hidden="true">
        <div className="hw-money">
          <span className="hw-k">Available</span>
          <span className="hw-bal">
            <CountUp amountMinor={BALANCE_MINOR} currency="USD" durationMs={760} startDelayMs={430} />
          </span>
        </div>

        {/* The real ledger row from the dashboard, not a drawing of one:
            .led / .led-row / .led-n / .led-sub / .led-amt are the same
            classes LiveWallet and the founder's own wallet use, so the hero
            is showing the product rather than an illustration of it. Two
            rows, because a balance with nothing behind it is a statistic and
            a balance with the things that produced it is a wallet. */}
        <div className="led hw-led" data-animate="1">
          {ROWS.map((r, i) => (
            // --i is what staggers them. The keyframe already reads it; with
            // it unset every row shared one delay and arrived as a block,
            // which is a list appearing rather than entries landing.
            <div className="led-row" key={r.name} style={{ "--i": i } as React.CSSProperties}>
              <span className="led-n">
                {r.name}
                <span className="led-sub">Paid {r.when}</span>
              </span>
              <span className="led-amt fig-pos">+{formatMinor(r.amt, "USD")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* One line, not two paragraphs.
          ------------------------------------------------------------
          The footer carried four facts over two columns -- 173px of grey
          disclosure inside a phone's first screen, more than the headline
          itself. What survives is the one fact a reader cannot get anywhere
          else on this screen and would be wrong to assume: whose account the
          money is in, and that it is never ours.

          The country caveat that used to sit beside it ("whether you can take
          payments depends on your country") is the entire subject of /check,
          which the button directly below this card goes to. Saying it here
          made the hero argue with its own call to action.

          NOT aria-hidden: it carries a link, and a focusable element inside
          an aria-hidden subtree is reachable by keyboard and invisible to a
          screen reader. Only the figures above are hidden, and the paragraph
          above those describes them. */}
      <div className="hw-foot">
        <p>
          The account is in your guardian&rsquo;s name and Stripe holds the money. Veyro never
          does. <Link className="linkbtn" href="/for-parents">What a parent takes on</Link>
        </p>
        <p className="hw-eg">Example figures</p>
      </div>
    </div>
  );
}
