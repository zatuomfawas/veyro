import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { PriceCalculator } from "@/app/_ui/PriceCalculator";
import { feeMinor, EXAMPLE_EARNINGS_MINOR } from "@/lib/pricing";
import { formatMinor } from "@/lib/money";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SectionRail } from "@/app/_ui/SectionRail";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { MarginNote } from "@/app/_ui/MarginNote";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Pricing: one product, free under $100 a month",
  description:
    "One product and one set of features for everyone. Free under $100 a month in earnings, "
    + "3% on what you earn above that. Most people never pay anything.",
  alternates: { canonical: SITE + "/pricing" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Pricing: one product, free under $100 a month",
    description: "Same product and same cover at every size. 3% above $100 a month.",
    url: SITE + "/pricing",
  },
};

// Deliberately not in the nav and not in the hero.
//
// The paid tier should be found by someone who has started earning, not pushed
// at someone deciding whether to try. A teenager who feels upsold leaves, and
// the free limit covers most of them permanently rather than being a
// trial that runs out.
//
// No feature table with ticks and crosses: a comparison grid makes the free
// column look like the deprived one, which is the opposite of true here.

// Two lists, and every line in the first one is something that exists today.
//
// This page has now been wrong in both directions. It began as two columns
// that put compliance monitoring and dispute handling behind the paid one,
// which was not the product. It was then rewritten as one product with
// everything for everyone -- which overshot: the Terms counsel settled put
// six enhanced services in months above $100, and marketing must not promise
// more than the binding document does.
//
// So the first list was built by reading the code, not the old copy:
//
//   guardian verification      lib/stripe-account.ts, the consent flow
//   dashboard and ledger       lib/ledger.ts
//   integration snippet        AddToApp
//   payouts                    RequestPayout
//   account status monitoring  the account.updated webhook syncs status and
//                              outstanding requirements; the dashboard shows
//                              both, which is what the Terms describe
//   support                    a person on the other end of the contact page
//
// Dispute features are NOT in that list. There is no dispute webhook, no
// evidence submission and no dispute UI anywhere in the codebase, so there is
// nothing truthful to say about disputes to someone earning under $100.
// Tax forms are not in it either, for the same reason.
const INCLUDED: readonly (readonly [string, string])[] = [
  ["Guardian verification and account setup", "Getting your parent verified and the payment account open."],
  ["Integration snippet and dashboard", "One snippet, your products, your ledger, your payout history."],
  ["Payouts", "Request your money whenever it is available."],
  ["Account status monitoring", "We watch the account's standing and what the processor still wants, and show you both."],
  ["Support", "A person on the other end, for you and for your parent."],
] as const;

// The enhanced services, worded to match the Terms rather than to sell past
// them: "subject to eligibility and availability", assistance rather than
// outcomes, a record rather than tax advice.
const ABOVE: readonly (readonly [string, string])[] = [
  ["Weekly payouts", "Instead of monthly, subject to processing and account status."],
  ["Dispute and chargeback assistance", "Guidance and templates. We cannot decide how a dispute ends, and we will not pretend to."],
  ["Enhanced Monthly Account Health Review", "A person reads the account and writes up anything material they find."],
  ["Priority support", "Target response within 24 hours."],
  ["Direct Guardian Support", "Your parent can talk to someone directly."],
  ["Annual Earnings & Payout Summary", "A record of what you earned and paid out. It is not tax advice."],
] as const;

export default function Pricing() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-parents">For parents</Link>
              <Link className="btn btn-sm" href="/get-started">Start</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/for-parents", label: "For parents" },
                  { href: "/docs/sdk", label: "Docs" },
                  { href: "/faq", label: "Questions" },
                  { href: "/get-started", label: "Start" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp longform has-rail" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <SectionRail />
        <span className="lp-eyebrow">Pricing</span>
        <h1 className="d2" style={{ marginTop: 8, maxWidth: "22ch" }}>
          One product. Different costs depending on what you earn.
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          There is no plan, no subscription and no upgrade button. Everyone gets the same core
          product. In any month you earn more than $100, some extra services switch on for that
          month, and switch off again in a month you do not.
        </p>

        {/* Section 1: the deal, stated as three lines rather than a table. */}
        <div className="deal">
          <p className="deal-l">Free under <strong>$100</strong> a month.</p>
          <p className="deal-l"><strong>3%</strong> on everything you earn above $100.</p>
          <p className="deal-n">
            Same core product at every size. Extra services in the months you earn above $100.
          </p>
          <p className="deal-warn">
            The fee is taken when a payment succeeds. If you later refund that customer, the fee
            isn&rsquo;t returned.
          </p>
        </div>

        {/* Section 2: the instrument, so the reader can put their own number
            in rather than find themselves in someone else's example. */}
        <div className="layer-tight">
          <PriceCalculator />
        </div>

        <hr className="rule" style={{ margin: "var(--sp-9) 0 var(--sp-7)" }} />

        {/* Section 3: one list. No ticks and crosses: a comparison grid makes
            one column look like the deprived one, and here there isn't one. */}
        <h2 className="h3">What everyone gets</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Whatever you earn, including nothing. Every line here is something that works today.
        </p>
        <dl className="tierlist" style={{ marginTop: "var(--sp-5)" }}>
          {INCLUDED.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>

        <h2 className="h3" style={{ marginTop: "var(--sp-9)" }}>
          In a month you earn above $100
        </h2>
        <p className="body" style={{ marginTop: 8 }}>
          These are in addition to everything above, subject to eligibility and availability. They
          apply in the months you are over the line, not to your account forever.
        </p>
        <dl className="tierlist" style={{ marginTop: "var(--sp-5)" }}>
          {ABOVE.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>

        <hr className="rule" style={{ margin: "var(--sp-9) 0 var(--sp-7)" }} />

        {/* Section 4: the examples, computed rather than typed. Every figure
            in this table comes from the same function the calculator above
            uses, so the table cannot quietly stop agreeing with the rule. */}
        <h2 className="h3">What people actually pay</h2>
        <p className="body" style={{ marginTop: 8 }}>
          The sum is: take what you earned, subtract the first $100, and take 3% of the rest.
          Here it is run for five months of different sizes.
        </p>
        <table className="tbl ptable" style={{ marginTop: "var(--sp-5)" }}>
          <thead>
            <tr>
              <th scope="col">You earn in a month</th>
              <th scope="col">Charged on</th>
              <th scope="col">You pay</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE_EARNINGS_MINOR.map((earned) => {
              const over = Math.max(0, earned - 10000);
              const fee = feeMinor(earned);
              return (
                <tr key={earned}>
                  <td className="num">{formatMinor(earned, "USD")}</td>
                  <td className="num ptable-mid">
                    {over === 0 ? "nothing" : formatMinor(over, "USD")}
                  </td>
                  <td className="num ptable-fee" data-free={fee === 0 ? "1" : undefined}>
                    {formatMinor(fee, "USD")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <MarginNote head="The other fee">
          Card processing is charged separately by the payment processor, at every size including
          the free one. It is not ours, we do not mark it up, and your dashboard shows it on
          every transaction.
        </MarginNote>

        <hr className="rule" style={{ margin: "var(--sp-9) 0 var(--sp-7)" }} />

        <MarginNote head="What a seller costs us">
          <span className="fig fig-md">$3.25</span>
          a month, once they are active: the account, the payouts, and the routing. A dormant
          account costs nothing, which is the whole reason the free limit can be real.
        </MarginNote>

        <h2 className="h3">Why these numbers</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Running an active seller costs about $3.25 a month before anyone earns a penny &mdash;
          the processor charges $2.00 for the account, $0.25 a payout, and a quarter of a percent
          each on the payout and on routing the funds. A dormant account costs nothing, which is
          why being under the limit is genuinely free rather than something paid users subsidise.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Once you are earning $100 or more a month, the 3% pays for the part that only matters
          when real money is moving: watching the account&rsquo;s standing, handling the disputes,
          and answering your parent when they ring. Those things are there from the first sale
          either way &mdash; the fee is what makes them sustainable, not what unlocks them.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          In comparable marketplaces, 44% of sellers never earn anything at all and the median
          earner makes around $120 a month. A free limit at $100 therefore covers roughly half of
          everyone who ever earns a cent, which is the point of putting it there.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          3% is a number we can say out loud. Someone earning $400 a month pays $9. A higher rate
          would not survive that sentence.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          One thing to know before you take a payment: the fee is worked out and taken at the
          moment a payment succeeds. If you refund that customer afterwards, the fee is not
          returned to you. A refund does lower the running total used to decide whether later
          payments that month are charged at all.
        </p>

        <div className="row" style={{ marginTop: "var(--sp-7)", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/get-started">Start &mdash; it&rsquo;s free</Link>
          <Link className="btn btn-2 btn-lg" href="/for-parents">For parents</Link>
        </div>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
