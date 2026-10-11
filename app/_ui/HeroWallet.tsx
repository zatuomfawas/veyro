import { formatMinor } from "@/lib/money";
import {
  BALANCE_MINOR, COLLECTED_MINOR, PROCESSING_MINOR, VEYRO_FEE_MINOR, SETTLING_MINOR,
} from "@/app/_ui/wallet-example";
import { CountUp } from "@/app/_ui/CountUp";

// The hero's money position, as one contained surface.
//
// WHAT THIS REPLACED. Two hairlines bounding figures that sat directly on
// the page ground, with a transaction ledger in a second zone to the
// right. It read as loose parts arranged on a background rather than as
// one object: four rules, two columns and a caption outside the thing it
// captioned.
//
// Now: one surface colour, one border, one padding, and a footer divided
// from the body by the only internal rule. Square, because the design
// system is square -- .card sets a border and a background and no radius,
// and buttons set border-radius:0 explicitly. A rounded card here would be
// a new corner style on a page that has none.
//
// THE LEDGER IS GONE, not hidden. Two transaction rows and a payout line
// were the second half of this surface, and they are deleted rather than
// display:none -- a row nobody can see is still a row somebody maintains.
// /how-it-works still shows a full ledger through LiveWallet, which is
// where a reader who wants the month's detail is already going; nothing
// was added there.
//
// THE FOUR FIGURES SIT BESIDE THE BALANCE, not under it. Removing the
// ledger left roughly 840x110 of empty card to the right of the figure --
// the hole the ledger used to fill, and a worse one, because a card with
// content only in its top-left corner reads as unfinished rather than as
// spacious. Side by side, the card's top is used edge to edge.
//
// EVERY FIGURE RECONCILES. feeMinor() computes the $3.30 from the same
// function that charges a real founder, and
// 210.00 - 8.55 - 3.30 - 3.15 = 195.00 exactly.
//
// GREEN MARKS THE MONEY THAT IS THE FOUNDER'S and nothing else: the
// available balance and the amount still settling. Collected is the gross
// before anything is taken and the two fees are what leaves, so they stay
// ink. No green on the card, its border, its footer or its rule.

/**
 * The month, named so each figure can be checked on its own.
 *
 * The two bracketed labels are the point. "Veyro fee" alone is a number
 * you take on trust; "Veyro fee (3% over $100)" is one you can do in your
 * head against the pricing page. And "Settling" is our word rather than a
 * word, so it says what it means where a reader first meets it.
 */
const BREAKDOWN = [
  { k: "Collected", v: COLLECTED_MINOR },
  { k: "Card fees", v: PROCESSING_MINOR },
  { k: "Veyro fee (3% over $100)", v: VEYRO_FEE_MINOR },
  { k: "Settling (not cleared yet)", v: SETTLING_MINOR, money: true },
] as const;

export function HeroWallet() {
  return (
    <div className="hw">
      <p className="sr-only">
        An example founder wallet. {formatMinor(COLLECTED_MINOR, "USD")} collected this month,
        less {formatMinor(PROCESSING_MINOR, "USD")} in card processing fees,{" "}
        {formatMinor(VEYRO_FEE_MINOR, "USD")} to Veyro and{" "}
        {formatMinor(SETTLING_MINOR, "USD")} still settling, leaving an available balance of{" "}
        {formatMinor(BALANCE_MINOR, "USD")}. Payouts are scheduled in Stripe by the guardian,
        who is the account holder. Every figure is invented.
      </p>

      <div className="hw-body" aria-hidden="true">
        <div className="hw-money">
          <span className="hw-k">Available</span>
          <span className="hw-bal">
            <CountUp amountMinor={BALANCE_MINOR} currency="USD" durationMs={850} />
          </span>
        </div>

        <dl className="hw-break">
          {BREAKDOWN.map((f) => (
            <div key={f.k}>
              <dt>{f.k}</dt>
              <dd data-money={"money" in f && f.money ? "1" : undefined}>
                {formatMinor(f.v, "USD")}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The card's footer carries both of the things said about the card
          rather than about the money. The payout line is load-bearing for
          accuracy -- it is the correction to a claim this site shipped
          saying nobody could block a payout -- and it lost its home when
          the ledger zone went, so it sits here beside the caption. */}
      <div className="hw-foot" aria-hidden="true">
        <p>
          An example wallet. Yours once your country is supported and a parent or guardian is
          verified on the account.
        </p>
        <p>Payouts are scheduled in Stripe, by your guardian.</p>
      </div>
    </div>
  );
}
