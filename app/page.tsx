import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { FREE_FLOOR_MINOR, RATE } from "@/lib/pricing";
import { formatMinor } from "@/lib/money";
import { SkipLink } from "@/app/_ui/marks";
import { HeroWallet } from "@/app/_ui/HeroWallet";
import { SiteNav } from "@/app/_ui/SiteNav";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { FAQ } from "@/app/_ui/faq";
import { Accordion } from "@/app/_ui/Accordion";
import { Reveal, type RevealGroup } from "@/app/_ui/Reveal";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

const STEPS = [
  {
    title: "Make your founder account",
    description: "Start with your country and age. If Veyro is available to you, create your account and invite a parent or guardian.",
  },
  {
    title: "Your guardian gets verified",
    description: "They accept your invitation and complete Stripe’s secure onboarding as the adult on the payment account.",
  },
  {
    title: "Share your checkout link",
    description: "Add what you sell and set a price. Put the link in your app or share it directly, and track your sales in Veyro.",
  },
];

// Answers stay shared with /faq; the homepage is a short route into the product.
const HOME_QUESTIONS = [FAQ[0], FAQ[2], FAQ[5]];

/**
 * What moves as the page is scrolled, and how.
 *
 * Declared here rather than inside Reveal, so the motion is readable beside
 * the markup it belongs to. The groups are deliberately disjoint: nothing
 * animates inside something else that is also animating, because two fades
 * on nested elements multiply into one slower and dimmer than either.
 *
 * The hero is absent on purpose. It is on screen at load, so there is nothing
 * to reveal, and a first viewport that animates itself on arrival is a splash
 * screen.
 */
const REVEAL: RevealGroup[] = [
  // The three steps draw their own dividing rules, one after another, and
  // rise behind them. This is the page's one authored moment: the layout is
  // built from hairlines, so the hairlines are what move.
  { select: ".home-steps > li", kind: "rule", stagger: 110 },
  // The pricing panel hangs off a vertical rule, which draws downward as the
  // panel settles. Below 760 the real border moves to the top of the panel
  // and the drawn one follows it.
  { select: ".home-pricing", kind: "rule-y" },
  // Headings with their leads, in reading order.
  { select: ".home-section-head > *", stagger: 70 },
  { select: ".home-money-grid > div:first-child > *", stagger: 60 },
  { select: ".home-questions-grid > div:first-child > *", stagger: 60 },
  { select: ".public-faq > *", stagger: 70 },
  { select: ".home-close-inner > *", stagger: 80 },
];

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="fw public-page home-page">
      <SkipLink />
      <SiteNav user={user} />

      <main id="main">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="wrap-lp home-hero-grid">
            <div className="home-hero-copy">
              <h1 id="home-title" className="home-title">
                Get paid for what you make, before you&rsquo;re 18.
              </h1>
              <p className="home-lead">
                Sell your apps, templates and commissions with your own checkout link.
                Your guardian handles verification. You run the business.
              </p>
              <div className="public-actions">
                <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                <Link className="linkbtn" href="/how-it-works">How it works</Link>
              </div>
              <p className="home-hero-note">Free to check. No account needed.</p>
            </div>
            <HeroWallet />
          </div>
        </section>

        <section className="home-section home-setup" aria-labelledby="setup-title">
          <div className="wrap-lp">
            <div className="home-section-head">
              <h2 id="setup-title">Your business. A little adult support.</h2>
              <p className="body">You build and sell. Your guardian takes care of the verification that makes payments possible.</p>
            </div>
            <ol className="home-steps">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className="home-step-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <Link className="linkbtn home-section-link" href="/get-started">See the setup, step by step</Link>
          </div>
        </section>

        <section className="home-section home-money contrast-surface" aria-labelledby="money-title">
          <div className="wrap-lp home-money-grid">
            <div>
              <h2 id="money-title">A clear picture of your business money.</h2>
              <p className="body">
                Your products, sales, fees and payout history, together in your own dashboard.
                Your business records stay separate from your guardian&rsquo;s everyday spending.
              </p>
              <p className="home-money-assurance">
                Stripe processes payments and holds the funds. Veyro keeps the record.
              </p>
              <Link className="linkbtn" href="/for-parents">What your guardian takes on</Link>
            </div>
            <div className="home-pricing">
              <h3>Start small. Keep the costs small.</h3>
              <dl className="home-price-rules">
                <div>
                  <dt>First {formatMinor(FREE_FLOOR_MINOR, "USD").replace(/\.00$/, "")} earned each month</dt>
                  <dd>Free</dd>
                </div>
                <div>
                  <dt>On earnings above that</dt>
                  <dd>{RATE * 100}%</dd>
                </div>
              </dl>
              <p className="small">No subscription. Stripe&rsquo;s processing fees are separate.</p>
              <Link className="linkbtn" href="/pricing">See pricing and calculate your fee</Link>
            </div>
          </div>
        </section>

        <section className="home-section home-questions" aria-labelledby="questions-title">
          <div className="wrap-lp home-questions-grid">
            <div>
              <h2 id="questions-title">A few things worth knowing.</h2>
              <p className="body">Real money deserves clear answers. Here are a few to start with.</p>
              <Link className="linkbtn" href="/faq">All questions</Link>
            </div>
            <div className="public-faq">
              {HOME_QUESTIONS.map((entry) => (
                <Accordion key={entry.q} summary={entry.q}>
                  <div className="small">{entry.a}</div>
                </Accordion>
              ))}
              <p className="home-policy-note">
                Stripe&rsquo;s policy supports guardian involvement for under-18 accounts.
                Availability depends on your country, and some legal questions remain unsettled.{" "}
                <Link className="linkbtn" href="/how-it-works">Read the provider&rsquo;s reply</Link>
                {" or "}<Link className="linkbtn" href="/legal">the open questions</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="home-close" aria-labelledby="start-title">
          <div className="wrap-lp home-close-inner">
            <div>
              <h2 id="start-title">Made something? Start here.</h2>
              <p>Check your country and age. Find out which route is open to you.</p>
            </div>
            <Link className="btn btn-lg" href="/check">Check eligibility</Link>
          </div>
        </section>
      </main>
      <Reveal scope=".fw" groups={REVEAL} />
      <SiteFooter />
    </div>
  );
}
