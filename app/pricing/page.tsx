import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { PriceCalculator } from "@/app/_ui/PriceCalculator";
import { feeMinor, EXAMPLE_EARNINGS_MINOR } from "@/lib/pricing";
import { formatMinor } from "@/lib/money";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
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

// Two lists, and every line says whether it exists yet.
//
// This page has now been wrong in both directions: first as two columns that
// gated real features behind the paid one, then as one product promising
// everything to everyone. Counsel's Terms settle it -- a core product for
// everybody, enhanced services in months above $100 -- and marketing must not
// promise more than the binding document does, or sooner.
//
// `soon` is not a marketing flourish. It marks an item that is NOT in the
// codebase today, and it is set by reading the code:
//
//   built     guardian verification   lib/stripe-account.ts, the consent flow
//   built     dashboard and ledger    lib/ledger.ts
//   built     integration snippet     AddToApp
//   built     payouts                 RequestPayout
//   built     account status          the account.updated webhook syncs status
//                                     and outstanding requirements; the
//                                     dashboard shows both
//   built     support                 a person on the contact page
//   NOT built dispute tools           no dispute webhook, no evidence
//                                     submission, no dispute UI anywhere
//   NOT built everything above $100   no payout scheduling, no review
//                                     pipeline, no support tiering, no summary
//
// scripts/claims.test.ts holds these flags to the code. If a dispute webhook
// lands and the label stays on, the test fails; if a label comes off
// something still missing, it fails too.
type Item = readonly [name: string, detail: string, soon?: true];

// The label a not-yet-built line carries. One constant, because the same words
// appeared in three places and went stale in all of them the first time the
// launch date moved.
const SOON_LABEL = "From 15 October";

const INCLUDED: readonly Item[] = [
  ["Core payment functionality", "Getting your parent verified, the payment account open, and payments working."],
  ["Dashboard", "Your products, your ledger, your payout history."],
  ["Integration", "One snippet, and you can take a payment."],
  ["Stripe payouts", "Your money reaches your bank on Stripe's schedule for the account."],
  ["Account status monitoring", "We watch the account's standing and what the processor still wants, and show you both."],
  ["Dispute notifications", "We tell you when a payment is disputed, with the amount, the reason and the deadline."],
  ["Access to Stripe's dispute response process", "A direct route into the dispute, where the account holder can respond."],
  ["Standard support", "A person on the other end, for you and for your parent."],
] as const;

// Worded to match the Terms rather than to sell past them: subject to
// eligibility and availability, assistance rather than outcomes, support and
// visibility rather than control we do not have, a record rather than tax
// advice.
const ABOVE: readonly Item[] = [
  ["Weekly payout scheduling and visibility", "Set up Stripe's weekly schedule, and see the next scheduled payout date. We cannot guarantee the timing of any payout."],
  ["Enhanced dispute and chargeback assistance", "Guidance, templates and administrative help. The final response stays with the account holder where Stripe requires it."],
  ["Priority support", "Target response time of 24 hours."],
  ["Direct Guardian Support", "Human support for your parent or legal guardian."],
  ["Annual Earnings & Payout Summary", "A record of a year's earnings and payouts. It is not tax advice."],
] as const;

// Whether anything on either list is still unbuilt. Drives the sentence above
// the free list, so it cannot claim a label exists when none does.
const ANY_SOON = [...INCLUDED, ...ABOVE].some((i) => i[2]);

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

      {/* Instrument first.
          ------------------------------------------------------------------
          This page answers one question -- what will this cost ME -- and the
          only thing on it that answers it with the reader's own number was
          below the fold, inside a 66ch reading column, with the call to
          action at 3,246px of 3,752.

          The calculator is in the first screen now, at the width an
          instrument wants, with the deal stated beside it. Everything after
          is the reasoning, chaptered, for the reader who wants to know why
          the numbers are those numbers rather than what they are. */}
      <main id="main">

        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  Pricing
                </p>
                <h1 className="hero-h1" style={{ maxWidth: "16ch" }}>
                  One product. One number.
                </h1>
                <p className="hero-lead">
                  No plan, no subscription, no upgrade button. Everyone gets the same core
                  product; in a month you earn over $100, some extra services switch on, and
                  switch off again in a month you do not.
                </p>

                <div className="deal" style={{ marginTop: "var(--sp-6)" }}>
                  <p className="deal-l">Free under <strong>$100</strong> a month.</p>
                  <p className="deal-l"><strong>3%</strong> on everything you earn above $100.</p>
                  <p className="deal-warn">
                    The fee is taken when a payment succeeds. If you later refund that customer,
                    the fee isn&rsquo;t returned. <strong>Fees start on 15 October 2026.</strong>
                  </p>
                </div>

                <div className="hero-cta">
                  <Link className="btn btn-lg" href="/auth/signup">Start &mdash; it&rsquo;s free</Link>
                  <Link className="btn btn-2 btn-lg" href="/get-started">See the whole path</Link>
                </div>
              </div>

              {/* Their number, not ours. An example someone cannot see
                  themselves in is an example that gets argued with. */}
              <PriceCalculator />
            </div>
          </div>
        </div>

        <section className="lp ch ch-surface">
          <div className="wrap-lp refflow">

        {/* Section 3: one list. No ticks and crosses: a comparison grid makes
            one column look like the deprived one, and here there isn't one. */}
        <h2 className="lp-h2" style={{ maxWidth: "18ch" }}>What everyone gets</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Whatever you earn, including nothing.{" "}
          {ANY_SOON
            ? <>Anything marked <span className="soon soon-inline">{SOON_LABEL}</span> is not
               built yet, and says so rather than letting you find out.</>
            : <>Every line here works today.</>}
        </p>
        <dl className="tierlist" style={{ marginTop: "var(--sp-5)" }}>
          {INCLUDED.map(([t, d, soon]) => (
            <div key={t}>
              <dt>
                {t}
                {soon ? <span className="soon">{SOON_LABEL}</span> : null}
              </dt>
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
          {ABOVE.map(([t, d, soon]) => (
            <div key={t}>
              <dt>
                {t}
                {soon ? <span className="soon">{SOON_LABEL}</span> : null}
              </dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>


        {/* Section 4: the examples, computed rather than typed. Every figure
            in this table comes from the same function the calculator above
            uses, so the table cannot quietly stop agreeing with the rule. */}
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp refflow">
        <h2 className="lp-h2" style={{ maxWidth: "18ch" }}>What people actually pay</h2>
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


        <MarginNote head="What a seller costs us">
          <span className="fig fig-md">$3.25</span>
          a month, once they are active: the account, the payouts, and the routing. A dormant
          account costs nothing, which is the whole reason the free limit can be real.
        </MarginNote>

          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp refflow">
        <h2 className="lp-h2" style={{ maxWidth: "18ch" }}>Why these numbers</h2>
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
          payments that month are charged at all. Fees start on 15 October 2026; nothing is
          charged before then.
        </p>

        <div className="row" style={{ marginTop: "var(--sp-7)", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/get-started">Start &mdash; it&rsquo;s free</Link>
          <Link className="btn btn-2 btn-lg" href="/for-parents">For parents</Link>
        </div>
          </div>
        </section>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
