import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Pricing: free under $100 a month",
  description:
    "Free under $100 a month in earnings, with everything needed to get paid. 3% on what you "
    + "earn above that. Most people never pay anything.",
  alternates: { canonical: SITE + "/pricing" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Pricing: free under $100 a month",
    description: "3% above $100 a month. Most people never pay anything.",
    url: SITE + "/pricing",
  },
};

// Deliberately not in the nav and not in the hero.
//
// The paid tier should be found by someone who has started earning, not pushed
// at someone deciding whether to try. A teenager who feels upsold leaves, and
// the free tier is the product for most of them permanently rather than a
// trial that runs out.
//
// No feature table with ticks and crosses: a comparison grid makes the free
// column look like the deprived one, which is the opposite of true here.

const FREE = [
  "Guardian verification and the payment connection",
  "The integration snippet, and the dashboard",
  "Monthly payouts",
  "Tax forms",
];

const PAID = [
  ["Weekly payouts", "Instead of monthly."],
  ["Quarterly tax estimates", "So the bill in April is not a surprise."],
  ["Compliance monitoring", "We watch the account's standing and tell you before the processor does."],
  ["Disputes and chargebacks handled", "We deal with them rather than forwarding you the email."],
  ["Priority support", "For you."],
  ["Guardian support", "And for your parent, from a person, which is usually what they want."],
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

      <main id="main" className="wrap-lp longform" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <span className="lp-eyebrow">Pricing</span>
        <h1 className="d2" style={{ marginTop: 8, maxWidth: "20ch" }}>
          Free under $100 a month.
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Then 3% on whatever you earn above that. That is the whole price list. Most people who
          use Veyro will never pay anything, and that is not a funnel &mdash; it is what the
          numbers actually look like.
        </p>

        <hr className="rule" style={{ margin: "30px 0" }} />

        <div className="tiers">
          <section className="tier">
            <h2 className="tier-h">Free</h2>
            <p className="tier-p">$0</p>
            <p className="tier-d">
              Under $100 a month in earnings. No card, no trial, no expiry. Everything you need to
              actually get paid:
            </p>
            <ul className="ticks" style={{ marginTop: "var(--sp-5)" }}>
              {FREE.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </section>

          <section className="tier" data-paid="1">
            <h2 className="tier-h">Above $100 a month</h2>
            <p className="tier-p">3%</p>
            <p className="tier-d">
              Charged only on the amount over $100, so the first $100 stays free whatever you earn.
              Earn $400 in a month and you pay $9. Adds:
            </p>
            <dl className="tierlist">
              {PAID.map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <hr className="rule" style={{ margin: "36px 0 28px" }} />

        <h2 className="h3">Why these numbers</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Running an active seller costs about $3.25 a month before anyone earns a penny &mdash;
          the processor charges $2.00 for the account, $0.25 a payout, and a quarter of a percent
          each on the payout and on routing the funds. An account that sits dormant costs nothing,
          which is why the free tier is genuinely free rather than something paid users subsidise.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          In comparable marketplaces, 44% of sellers never earn anything at all and the median
          earner makes around $120 a month. A free tier at $100 therefore covers roughly half of
          everyone who ever earns a cent, which is the point of putting it there.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          3% is a number we can say out loud. Someone earning $400 a month pays $9. A higher rate
          would not survive that sentence.
        </p>

        <hr className="rule" style={{ margin: "36px 0 28px" }} />

        <h2 className="h3">The other fee, which is not ours</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Card processing costs money, and the payment processor takes its own fee on every
          payment. It sets that fee and deducts it before the money reaches your balance. It is
          not passed through Veyro, we do not mark it up, and it applies on the free tier too.
          Your dashboard shows it on every transaction rather than netting it away.
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
