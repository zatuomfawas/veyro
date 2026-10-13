import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { PriceCalculator } from "@/app/_ui/PriceCalculator";
import { feeMinor, EXAMPLE_EARNINGS_MINOR, FREE_FLOOR_MINOR } from "@/lib/pricing";
import { formatMinor } from "@/lib/money";
import { SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SiteNav } from "@/app/_ui/SiteNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Pricing: one product, free under $100 a month",
  description:
    "Your first $100 of monthly earnings is free, then 3% on the amount above it. "
    + "No subscription. Stripe card processing fees apply separately.",
  alternates: { canonical: SITE + "/pricing" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Pricing: one product, free under $100 a month",
    description: "Core payment tools at every size. Free for your first $100 each month, then 3% above it.",
    url: SITE + "/pricing",
  },
};

// Feature names and availability mirror the Terms and scripts/claims.test.ts.
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
    <div className="fw public-page pricing-page">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />
      <SiteNav active="/pricing" />

      <main id="main">
        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <h1 className="hero-h1">Start free. Pay as you earn.</h1>
                <p className="hero-lead">
                  Your first $100 each calendar month is free. Veyro takes 3% of earnings
                  above that, with no subscription or plan to choose.
                </p>
                <div className="hero-cta">
                  <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                  <Link className="linkbtn" href="/get-started">See the setup</Link>
                </div>
                <p className="small" style={{ marginTop: "var(--sp-5)" }}>
                  Card processing fees apply separately. Fees start on 15 October 2026.
                </p>
              </div>
              <PriceCalculator />
            </div>
          </div>
        </div>

        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <h2 className="lp-h2">One core product for everyone.</h2>
            <p className="body" style={{ marginTop: "var(--sp-4)" }}>
              Payment tools from your first sale. Extra services in the months you earn
              above $100.{" "}
              {ANY_SOON
                ? <>Anything marked <span className="soon soon-inline">{SOON_LABEL}</span> is not built yet.</>
                : <>Every service listed below works today.</>}
            </p>
            <div className="public-feature-grid" style={{ marginTop: "var(--sp-8)" }}>
              <div>
                <h3 className="h4">Included at every size</h3>
                <dl className="tierlist">
                  {INCLUDED.map(([title, detail, soon]) => (
                    <div key={title}>
                      <dt>{title}{soon ? <span className="soon">{SOON_LABEL}</span> : null}</dt>
                      <dd>{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="h4">In months above $100</h3>
                <p className="small" style={{ marginTop: "var(--sp-3)" }}>
                  In addition to the core product, subject to eligibility and availability.
                  These apply for that month.
                </p>
                <dl className="tierlist">
                  {ABOVE.map(([title, detail, soon]) => (
                    <div key={title}>
                      <dt>{title}{soon ? <span className="soon">{SOON_LABEL}</span> : null}</dt>
                      <dd>{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp aside-grid">
            <div className="aside-head">
              <h2 className="lp-h2">The fee, in real numbers.</h2>
              <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                Subtract the first $100 of monthly earnings, then take 3% of the rest.
                These examples use the same calculation as your account.
              </p>
              <p className="small" style={{ marginTop: "var(--sp-5)" }}>
                Stripe sets and deducts card processing fees separately, including when
                Veyro is free. We do not mark them up. Your dashboard shows them on each transaction.
              </p>
            </div>
            <div className="tblwrap" role="region" aria-label="Monthly earnings and Veyro fees" tabIndex={0}>
              <table className="tbl ptable">
                <caption className="sr-only">Example monthly earnings and Veyro fees, in US dollars</caption>
                <thead>
                  <tr>
                    <th scope="col">Monthly earnings</th>
                    <th scope="col">Charged on</th>
                    <th scope="col">Veyro fee</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_EARNINGS_MINOR.map((earned) => {
                    const over = Math.max(0, earned - FREE_FLOOR_MINOR);
                    const fee = feeMinor(earned);
                    return (
                      <tr key={earned}>
                        <td className="num">{formatMinor(earned, "USD")}</td>
                        <td className="num ptable-mid">{over === 0 ? "Nothing" : formatMinor(over, "USD")}</td>
                        <td className="num ptable-fee" data-free={fee === 0 ? "1" : undefined}>
                          {formatMinor(fee, "USD")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp aside-grid">
            <div className="aside-head">
              <h2 className="lp-h2">Before your first sale.</h2>
              <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                The free allowance gives you room to try selling what you made. The fee
                helps cover the payment account and the support around it.
              </p>
              <div className="hero-cta">
                <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                <Link className="linkbtn" href="/terms">Read the terms</Link>
              </div>
            </div>
            <dl className="ruled">
              <div>
                <dt>Refunds</dt>
                <dd>
                  Veyro&rsquo;s fee is calculated when a payment succeeds and is not returned
                  if you refund it. A refund lowers the monthly earnings total used to
                  calculate fees on later payments.
                </dd>
              </div>
              <div>
                <dt>Fee timing</dt>
                <dd>Fees start on 15 October 2026. Nothing is charged before then.</dd>
              </div>
              <div>
                <dt>Our costs</dt>
                <dd>
                  An active seller costs about $3.25 a month: $2.00 for the account, $0.25
                  a payout, and 0.25% each on the payout and routing. A dormant account costs nothing.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
