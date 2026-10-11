import { formatMinor } from "@/lib/money";
import { LiveWallet } from "@/app/_ui/LiveWallet";

// The hero's product surface: a payment arriving, and the money it becomes.
//
// WHY IT IS TWO PANES AND NOT TWO CARDS. The hero used to show the wallet on
// its own, which answers "what do I get" and leaves out the half a visitor
// actually came to find out -- that you can take the payment in the first
// place. Showing a checkout beside it as a second floating card would be two
// mockups in a hero; showing it as the top pane of the same surface is the
// product, because that is the order the two things happen in. One border,
// one radius, one shadow, and a labelled rule between them doing the work an
// arrow between cards would do badly.
//
// WHY THE TOP PANE IS SMALL. The checkout is the setup and the wallet is the
// payoff, so the checkout gets one row. A full checkout preview exists and is
// worth seeing -- it is on /get-started, from the same components the real
// /pay page renders -- and reproducing it here would make the hero a page of
// its own and bury the sentence it is supposed to support.
//
// THE PAY BUTTON IS THE REAL ONE'S COLOUR. app/pay renders `btn btn-lg
// btn-w`, which is the brand control, not the pine one. A preview that
// paints it green is showing a checkout that does not exist.
//
// EVERY FIGURE IS THE WALLET'S. The price and the fee below come from the
// same constants LiveWallet does its arithmetic with, so the sale shown
// arriving at the top is the sale shown landing at the bottom. A preview
// whose two halves quote different numbers is worse than one half.

/** The sale that LiveWallet animates into the ledger, priced once. */
export const DEMO_SALE = { name: "Notion Second Brain template", grossMinor: 2400 };

export function HeroPreview() {
  return (
    <div className="hp">
      {/* Not "a browser window". There is no fake chrome, no traffic lights
          and no URL bar -- just a labelled pane, because the thing worth
          showing is the checkout, not a picture of a browser. */}
      {/* The example marker, restored.
          LiveWallet carries its own "Example" chip in its title bar, and
          bare mode drops that bar -- so the hero was showing invented
          figures with nothing visible saying so. The screen-reader summary
          still said "every figure is invented"; sighted readers had lost
          it. It sits on the frame rather than on one pane, because both
          panes are the same example. */}
      <div className="hp-bar">
        <span className="hp-bar-t">A founder&rsquo;s account</span>
        <span className="dp-tag">Example figures</span>
      </div>

      <div className="hp-pane">
        <span className="hp-k">What your customer sees</span>
        <div className="hp-pay">
          <span className="hp-pay-n">{DEMO_SALE.name}</span>
          <span className="hp-pay-v">{formatMinor(DEMO_SALE.grossMinor, "USD")}</span>
          {/* Inert on purpose, and marked so. A disabled button reads as
              broken; aria-hidden with no tab stop reads as the picture it
              is, and the pane's label already says whose screen this is. */}
          <span className="hp-pay-b" aria-hidden="true">Pay</span>
        </div>
        <p className="hp-note">
          Your own checkout link, or the same thing embedded in what you built.
        </p>
      </div>

      {/* The join. It carries the one claim the two panes make together, and
          it is a real element rather than a ::before so a screen reader
          reaches it in the order it is read. */}
      <p className="hp-join">
        <span className="hp-join-d" aria-hidden="true" />
        The money lands in an account in your guardian&rsquo;s name. You watch it here; they
        schedule payouts in Stripe.
      </p>

      <div className="hp-pane hp-pane-b">
        <span className="hp-k">What you see</span>
        <LiveWallet bare rows={1} />
      </div>
    </div>
  );
}
