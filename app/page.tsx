import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { HeroPreview } from "@/app/_ui/HeroPreview";
import { CheckoutPreview } from "@/app/_ui/CheckoutPreview";
import { IntegrationPanel } from "@/app/_ui/IntegrationPanel";
import { GuardianStatus } from "@/app/_ui/GuardianStatus";
import { WalletTabs } from "@/app/_ui/WalletTabs";
import { EligibilityInline } from "@/app/check/CheckClient";
import { Reveal } from "@/app/_ui/Reveal";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { FAQ } from "@/app/_ui/faq";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. Three islands of client JS and nothing else: the wallet
// tabs, the integration panel and the mobile nav. The section links are plain
// anchors and the FAQ is <details>, so the page still reads end to end with
// JavaScript switched off — only the tabs and the prompt generator need it.
//
// The order is the product's order rather than the argument's. It used to open
// by explaining Stripe's age policy, which answers a question nobody has asked
// yet. What a visitor actually arrives with is "I built something — can I sell
// it?", so the page now answers that first and reaches the eligibility rules
// once they matter.
//
// currentUser() reads the session cookie, which opts this route out of static
// rendering. For anonymous traffic, which is nearly all of it, that costs a
// cookie read and no database query: currentUser() returns null before it
// touches the db.
//
// The Stripe evidence still matters and still exists in full on /how-it-works:
// the verbatim reply, the country grading, and what they would not confirm. It
// is linked from here rather than argued here.

/** One row of the who-does-what list. */
function Role({ icon, who, children }: { icon: string; who: string; children: React.ReactNode }) {
  return (
    <li>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={14} />
        <strong style={{ fontSize: "var(--fs-3)" }}>{who}</strong>
      </span>
      <span className="small">{children}</span>
    </li>
  );
}

/**
 * One line of the wallet.
 *
 * These are the six fields CurrencyFold actually has. There is deliberately no
 * "Stripe fees" row: Stripe deducts its fee on its own side before the money
 * reaches the connected account's balance, and Veyro never sees the figure. A
 * fee line here would promise a number the ledger does not hold.
 */
function Flow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="reqrow">
      <div>
        <span className="req-t">{label}</span>
        <span className="req-d">{children}</span>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="disc">
      <summary className="disc-q">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{q}</span>
        <span className="disc-sign" aria-hidden="true" />
      </summary>
      <p className="disc-a">{children}</p>
    </details>
  );
}

export default async function Home() {
  // A revoked or expired session must still show "Sign in". Hiding it because
  // a stale cookie exists would strand someone who is, in fact, logged out.
  const user = await currentUser();

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="#connect">Connect your app</Link>
              <Link className="btn btn-q btn-sm hide-s" href="#wallet">Founder Wallet</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              {user ? (
                <Link className="btn btn-sm" href={defaultLandingFor(user.role)}>
                  Back to your dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-q btn-sm hide-s" href="/auth/signin">Sign in</Link>
                  <Link className="btn btn-sm" href="/get-started">Get started</Link>
                </>
              )}
              <MobileNav
                items={[
                  { href: "#connect", label: "Connect your app" },
                  { href: "#how", label: "How it works" },
                  { href: "#wallet", label: "Founder Wallet" },
                  { href: "#guardian", label: "Your guardian" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/how-it-works", label: "What Stripe told us" },
                  { href: "#faq", label: "Questions" },
                  { href: "/auth/signin", label: "Sign in" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">
        {/* ---------------- hero ---------------- */}
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="split-lead hero-grid">
              <div>
                <h1 className="hero-h">
                  <Wordmark hero />
                  <span className="tagline">Your idea. Your app. Your money.</span>
                </h1>

                {/* "Block you at 18" is a compression rather than a claim we
                    cannot stand behind, and the clause after it supplies the
                    context: on your own the bar is majority age, and the
                    guardian route this product arranges is what moves it. The
                    figure further down carries its own qualifier — "with a
                    guardian on the account" — so the two are consistent read
                    together.

                    Where it is not universally true, the page says so within a
                    line: the disclaimer directly below, and the checker as the
                    secondary CTA, which exists precisely to answer "does this
                    apply where I live" and which returns no for Brazil. */}
                <div className="hero-accent" style={{ marginTop: "var(--sp-5)" }}>
                  <p className="lead" style={{ margin: 0 }}>
                    You built something people want. Payment processors block you at 18. Veyro
                    removes that blocker &mdash; add payments to your app, keep your products and
                    business decisions fully yours, and get paid to an account in your name.
                  </p>
                </div>

                {/* Supporting, not the headline. The age rules are why Veyro
                    exists, but they are not what someone arrives wanting to
                    read; the checker two clicks away answers them properly. */}
                <p className="foldwho">
                  Built for young founders. Guardian involvement may be required depending on your
                  setup.
                </p>

                <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/get-started">Get started</Link>
                  <Link className="btn btn-2 btn-lg" href="/check">Check eligibility</Link>
                </div>

                <p className="tiny" style={{ marginTop: 12 }}>
                  The checker takes two questions. No account, no email address.
                </p>

              </div>

              <HeroPreview />
            </div>
          </div>
        </div>

        {/* ---------------- the three numbers ---------------- */}
        {/* Out of the hero, which was carrying six things against one preview
            card. On their own they get read; stacked under two buttons they
            were scenery. */}
        <section className="lp lp-pad-sm" id="facts">
          <div className="wrap-lp">
            <div className="herofacts">
              <div>
                <span className="hf-n">13</span>
                <span className="hf-l">
                  The real minimum age with a guardian on the account, not 18
                </span>
              </div>
              <div>
                <span className="hf-n">43</span>
                <span className="hf-l">
                  Countries the payment provider supports for self-serve signup
                </span>
              </div>
              <div>
                <span className="hf-n">0%</span>
                <span className="hf-l">
                  Veyro&rsquo;s cut of what you earn. Stripe&rsquo;s own fees still apply
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- the problem ---------------- */}
        {/* Not "processors require you to be 18": they don't, and the stat
            three inches above this says so with Stripe's written confirmation
            behind it. The real problem is whose account it ends up being. */}
        <section className="lp" id="problem">
          <div className="wrap-lp">
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">The problem</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Whose account is it?
                </h2>
              </div>
              <div>
                <p className="lp-lead">
                  Under 18, no payment provider will open an account for you on your own. The usual
                  workaround is to use an adult&rsquo;s account instead &mdash; their login, their
                  dashboard, their name on everything you sell.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  That works, and it costs you every bit of visibility into your own money. Veyro
                  keeps the account in your name, gives you your own login, and puts an adult where
                  the provider actually requires one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- how it works ---------------- */}
        <section className="lp" id="how">
          <div className="wrap-lp">
            <span className="lp-eyebrow">How it works</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Four steps.</h2>
            <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 24 }}>
              Nothing can take a payment until each one is done. That order is the payment
              provider&rsquo;s, not ours.
            </p>

            {/* Each step carries a small piece of the real interface rather
                than an illustration of one: the same .badge, .mono and .num
                classes the dashboard uses, at the size a step allows. It shows
                what you would actually be looking at, and it cannot drift from
                the product the way a drawing would. */}
            <ol className="steps">
              <li>
                <span className="st-n">01</span>
                <span className="st-t">Build it</span>
                <span className="st-d">You have done this part already.</span>
                <span className="st-v">
                  <span className="badge b-grey">Your app</span>
                  <span className="badge b-grey">Your domain</span>
                </span>
              </li>
              <li>
                <span className="st-n">02</span>
                <span className="st-t">Invite a parent</span>
                <span className="st-d">They make their own login and complete the provider&rsquo;s checks.</span>
                <span className="st-v">
                  <span className="badge b-pine">Consented</span>
                  <span className="tiny">Their own login</span>
                </span>
              </li>
              <li>
                <span className="st-n">03</span>
                <span className="st-t">Add payments</span>
                <span className="st-d">A payment link needs no code. A button in your app takes two calls.</span>
                <span className="st-v">
                  <span className="mono st-url">/pay/&hellip;/sticker-pack</span>
                </span>
              </li>
              <li>
                <span className="st-n">04</span>
                <span className="st-t">Get paid</span>
                <span className="st-d">Money settles into the account in your name, and you can see all of it.</span>
                <span className="st-v">
                  <span className="num st-amt">+$25.00</span>
                  <span className="badge b-pine">Available</span>
                </span>
              </li>
            </ol>

            <p className="lp-note" style={{ marginTop: 20 }}>
              <Link className="linkbtn" href="/get-started">The same steps, with the detail</Link>
            </p>
          </div>
        </section>

        {/* ---------------- what you get ---------------- */}
        <section className="lp" id="value">
          <div className="wrap-lp">
            <span className="lp-eyebrow">What you get</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 24 }}>
              Three things that are yours.
            </h2>

            <div className="props">
              <div>
                <span className="pr-t">See every payment</span>
                <span className="pr-d">
                  Each sale, each fee Stripe reported, what is still settling and what you can
                  draw today. Folded from your own records, never a stored number.
                </span>
              </div>
              <div>
                <span className="pr-t">Your account, your login</span>
                <span className="pr-d">
                  Opened in your name. You and your guardian have separate logins, and on this
                  account type they cannot block a payout.
                </span>
              </div>
              <div>
                <span className="pr-t">No cut</span>
                <span className="pr-d">
                  Veyro takes no percentage and charges no platform fee. Stripe charges its own
                  processing fees, which Stripe sets and deducts.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- already built it ---------------- */}
        {/* Directly after the hero, because "I have already made the thing"
            is the state most people arrive in, and the old page made them
            read to the bottom before it addressed them. */}
        <section className="lp" id="connect">
          <div className="wrap-lp">
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Already built it?</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Add Veyro to what you made.
                </h2>
                <p className="lp-lead" style={{ marginTop: 16 }}>
                  Your website or app does not need rebuilding. Connect Veyro to what you already
                  have and add a payment flow without becoming a payment engineer.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  It is two HTTP calls: one to start a checkout, one to ask whether it was paid.
                  If you built with an AI coding tool, the prompt does the wiring for you.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  Prefer to read it yourself?{" "}
                  <Link className="linkbtn" href="/docs/sdk">The integration docs</Link>
                </p>
              </div>

              <IntegrationPanel />
            </div>
          </div>
        </section>

        <section className="lp" id="wallet">
          <div className="wrap-lp">
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Founder Wallet</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Know where every dollar is.
                </h2>
                <p className="lp-lead" style={{ marginTop: 16 }}>
                  Revenue should not disappear into a payment dashboard. Founder Wallet shows what
                  was collected, what Stripe took, what is settling, what you can draw today and
                  what has already been paid out.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  Every figure is folded from your own payment records each time you look. No
                  balance is stored anywhere, so it cannot drift from the payments behind it.
                </p>

                <div className="reqlist" style={{ marginTop: 20 }}>
                  <Flow label="Earned">A customer paid, and it cleared.</Flow>
                  <Flow label="Still settling">Paid, not yet cleared by the provider.</Flow>
                  <Flow label="Refunded">Sent back to a customer.</Flow>
                  <Flow label="Committed">You have asked for it, so it cannot be spent twice.</Flow>
                  <Flow label="Available">What you can request today.</Flow>
                  <Flow label="Paid out">Already in the bank account on the payment account.</Flow>
                </div>

                <p className="small" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/wallet">How the wallet is calculated</Link>
                </p>
              </div>

              <WalletTabs />
            </div>
          </div>
        </section>

        {/* ---------------- the wallet ---------------- */}
        {/* ---------------- what the customer sees ---------------- */}
        <section className="lp" id="checkout">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <span className="lp-eyebrow">Your customer</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  This is the page they pay on.
                </h2>
                <p className="body" style={{ marginTop: 16 }}>
                  You send a link. It opens this. Your name is on it, your product is on it, and
                  the card form belongs to Stripe — neither you nor Veyro ever sees the number
                  typed into it.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  There is nothing to design and nothing to install. Adding a product gives you the
                  link, and the link works anywhere you can paste one.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/get-started">The steps, in order</Link>
                </p>
              </div>

              <CheckoutPreview />
            </div>
          </div>
        </section>

        {/* ---------------- guardian ---------------- */}
        <section className="lp" id="guardian">
          <div className="wrap-lp">
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Your guardian</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  An adult on the account, not on your business.
                </h2>
                <p className="body" style={{ marginTop: 16 }}>
                  Under 18, the payment provider requires a verified adult. Your guardian makes
                  their own login, completes Stripe&rsquo;s identity checks on Stripe&rsquo;s own
                  form, and is notified of every payout request.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  What they do not get is your business. You keep the products, the links and the
                  decisions, and on this account type a guardian cannot block a payout.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/for-guardians">What a guardian is agreeing to</Link>
                </p>
              </div>

              <GuardianStatus />
            </div>
          </div>
        </section>

        {/* ---------------- eligibility ---------------- */}
        <section className="lp" id="eligibility">
          <div className="wrap-lp">
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Before you build around it</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Find out if this applies to you.
                </h2>
                <p className="lp-lead" style={{ marginTop: 16 }}>
                  Two questions, no account and no email address. Where you live and how old you
                  are decide which route is open, and whether you need Veyro at all.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  It tells you when the answer is no. Provider availability and the age at which
                  you can enter a contract both vary by country and both change; where Stripe would
                  not confirm something, the result says so rather than guessing.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/how-it-works">
                    What Stripe told us, quoted in full
                  </Link>
                </p>
              </div>

              {/* The checker itself, not a button that goes to it. This is the
                  question every visitor arrives with, and it is two dropdowns
                  and a year — cheap enough to answer here rather than spending
                  a page load on it. Same component /check renders. */}
              <EligibilityInline />
            </div>
          </div>
        </section>

        {/* ---------------- the roles ---------------- */}
        <section className="lp" id="roles">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Who does what</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Four parts, one order.</h2>
            <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 24 }}>
              Nothing can take a payment until each one is done. That sequence is the payment
              provider&rsquo;s, not ours.
            </p>

            <ol className="numbered">
              <Role icon="person" who="You">
                Own and build the business. It is yours, and nothing here transfers it to anyone.
              </Role>
              <Role icon="home" who="Your guardian">
                Completes the identity verification the provider requires, as the adult on the
                account. Needed while you are under 18.
              </Role>
              <Role icon="list" who="Veyro">
                Coordinates the steps, keeps your ledger, and records who agreed to what and when.
              </Role>
              <Role icon="card" who="Stripe">
                Processes the payments and settles the money into the account in your name.
              </Role>
            </ol>

            <p className="lp-note" style={{ marginTop: 20 }}>
              Availability and the exact requirements vary by country.{" "}
              <Link className="linkbtn" href="/check">The checker</Link> gives the answer for where
              you live, and{" "}
              <Link className="linkbtn" href="/how-it-works">/how-it-works</Link> quotes the
              provider&rsquo;s written policy in full.
            </p>
          </div>
        </section>

        {/* ---------------- commitments ---------------- */}
        <section className="lp">
          <div className="wrap-lp">
            <span className="lp-eyebrow">What Veyro commits to</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 24 }}>
              Six things, all checkable.
            </h2>

            <div className="cardgrid">
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>Stripe verifies your guardian</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    They are notified of every payout request. They cannot block one, and neither
                    can anyone else on this account type.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>The money is never ours</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Customers pay your Stripe account directly. Veyro is not in the path of the
                    money and never holds a customer&rsquo;s funds.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>We never see your documents</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Identity and bank details go straight to Stripe&rsquo;s own form. Veyro stores a
                    reference to the account, nothing more.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>We take no percentage</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    No cut, no platform fee. Stripe charges its own processing fees, which Stripe
                    sets and deducts.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>The checker is free</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    No account, no email address. It tells you when the answer is no, and when you
                    do not need us at all.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>Software, not a bank</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Provider policy permits this route. No court has tested it, and we say so rather
                    than let you assume otherwise.
                  </p>
                </div>
              </div>
            </div>

            <p className="body" style={{ marginTop: 24 }}>
              <Link className="linkbtn" href="/about">
                All six in full, and what is not finished yet
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------- why it exists ---------------- */}
        <section className="lp" id="why">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <span className="lp-eyebrow">Why this exists</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Building it was never the hard part.
                </h2>
              </div>
              <div>
                <p className="lp-lead">
                  I built Veyro after watching my brother hit the same wall over and over. Building
                  the business was the easy part. Getting the financial infrastructure to run it
                  wasn&rsquo;t.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  A capable fifteen-year-old can ship a product months before anyone will let them
                  charge for it. Veyro closes that gap.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  Mike Daniels &middot;{" "}
                  <Link className="linkbtn" href="/about">Read the full story</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp" id="faq">
          <div className="wrap-lp">
            {/* truthgrid, like every other section on this page. Stacking the
                heading above a 76ch column left roughly half the width empty
                beside nine collapsed one-line questions, which read as a void
                rather than as breathing room. */}
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Questions</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  The ones people actually ask.
                </h2>
                <p className="body" style={{ marginTop: 16 }}>
                  Short answers here. Where something is not built yet, it says so rather than
                  going quiet.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/faq">
                    Every question, with the longer answers
                  </Link>
                </p>
              </div>

              <div>
                {FAQ.filter((f) => f.homepage).map((f) => (
                  <Faq key={f.q} q={f.q}>{f.a}</Faq>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- closing ---------------- */}
        {/* The one dark band on the page. .lp-dark was fully designed in the
            stylesheet — ground, headings, body, eyebrow, buttons — and never
            used by anything, so this is the palette's own black rather than a
            new colour. It sits on the closing question, where the change of
            ground is the page saying "this is the part to answer". */}
        <section className="lp lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">You built it. Now make it sellable.</h2>
            <p className="body" style={{ marginTop: 12, marginLeft: "auto", marginRight: "auto" }}>
              Connect what you made, complete the setup with your guardian, and start taking
              payments. If you are not sure the route is open where you live, check first &mdash;
              it takes two questions and no account.
            </p>
            <div className="row" style={{ marginTop: 20, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/get-started">Get started</Link>
              <Link className="btn btn-2 btn-lg" href="/check">Check eligibility</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll entrances for everything below the hero, which has its own
          CSS entrance. One observer for the page; the selector is here rather
          than inside the component so what moves is readable where it is
          decided. */}
      <Reveal
        scope=".fw"
        select="section.lp > .wrap-lp > *, section.lp .truthgrid > *"
        stagger=".props, .steps, .herofacts"
      />

      <ScrollTop />
      <StickyCta href="/get-started" label="Get started" note="Or check eligibility first. No account." />
      <SiteFooter />
    </div>
  );
}
