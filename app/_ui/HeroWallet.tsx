import Link from "next/link";
import { formatMinor } from "@/lib/money";
import { CountUp } from "@/app/_ui/CountUp";
import {
  BALANCE_MINOR, COLLECTED_MINOR, PROCESSING_MINOR, VEYRO_FEE_MINOR, SETTLING_MINOR,
} from "@/app/_ui/wallet-example";

// The founder's money, stated so it can be checked in one subtraction.
//
// THE PROBLEM THIS SOLVES. This card has been through two wrong answers and
// they failed in opposite directions.
//
// First it was five figures over two disclaimer paragraphs: Collected, Card
// fees, Veyro fee, Settling, and the balance. That reconciles, and it asks a
// visitor to do arithmetic before they have been told what the product is.
//
// Then it was the balance plus two ledger rows. That read as a product, and
// the figures stopped adding up: $23.14 and $43.39 against a balance of
// $195.00 is a relationship no reader can resolve. On a site whose stated
// principle is that every figure traces to the function computing it, an
// unreconciled number in the hero is the worst available place to put one.
// The rows were arbitrary too -- two sales out of a month, picked because two
// rows filled the space.
//
// What is here now is the same month said in one line. 210.00 collected,
// 15.00 off, 195.00 left: one subtraction, in words, checkable at a glance,
// with no table and no rows inviting a sum they do not satisfy. The 15.00 is
// not a rounded figure either. It is 8.55 of card fees, 3.30 to Veyro and
// 3.15 still settling, which is exactly 15.00, added up below rather than
// typed out here.
//
// THE TRUST LINE IS NOT A FOOTNOTE ANY MORE. Who holds the account and who
// holds the money is the whole mechanism of this product: it is why a
// thirteen-year-old can be here at all, and it is the first thing a parent
// needs. It was set at 11.5px in the quietest ink on the page, which made the
// most important sentence in the hero the smallest text in it. It reads at
// body size now, as the second half of the card rather than as small print
// underneath it.
//
// THE CARD IS NARROWER THAN THE MEASURE. At the full 1240 it held three facts
// across a width built for twelve, and no arrangement of three facts fills
// that honestly -- the hole was the content, not the layout. Sized to what it
// says, the space to its right is the page's left spine doing its job, which
// is a different thing from emptiness inside an object.
//
// THE COUNT STAYS. CountUp renders the true figure on the server, so with no
// JavaScript, with reduced motion, or before hydration $195.00 is already in
// the HTML; a balance is never caught showing a zero it will fill in later.
// At 760ms on a cubic ease-out it is within a few cents by about a third of
// the way through, so a reader sees a number arriving rather than a wrong
// number sitting still.

/** 8.55 + 3.30 + 3.15. Added here so the sentence cannot drift from the month. */
const DEDUCTED_MINOR = PROCESSING_MINOR + VEYRO_FEE_MINOR + SETTLING_MINOR;

export function HeroWallet() {
  return (
    <div className="hw">
      <div className="hw-body">
        <div className="hw-head">
          <p className="hw-k">Available</p>
          {/* The tag labels the figures, so it sits with them. Under the trust
              sentence it wrapped onto a line of its own and read as a third
              statement rather than as a note about the data. */}
          <p className="hw-eg">Example figures</p>
        </div>
        <p className="hw-bal">
          <CountUp amountMinor={BALANCE_MINOR} currency="USD" durationMs={760} startDelayMs={260} />
        </p>
        {/* The reconciliation, as a sentence. Every figure traces to
            wallet-example.ts, which computes the Veyro fee with the same
            function that charges a real founder. */}
        <p className="hw-sum">
          {formatMinor(COLLECTED_MINOR, "USD")} collected this month, less{" "}
          {formatMinor(DEDUCTED_MINOR, "USD")} in fees and money still settling.
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
