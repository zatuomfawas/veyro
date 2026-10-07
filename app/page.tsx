import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { LiveWallet } from "@/app/_ui/LiveWallet";
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { Reveal } from "@/app/_ui/Reveal";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { Journey } from "@/app/_ui/Journey";
import { AudienceSplit } from "@/app/_ui/AudienceSplit";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. Three islands of client JS and nothing else: the wallet
// tabs, the integration panel and the mobile nav. The section links are plain
// anchors and the FAQ is <details>, so the page still reads end to end with
// JavaScript switched off — only the tabs and the prompt generator need it.
//
// The order is the product's order rather than the argument's. It used to open
// by explaining the processor's age policy, which answers a question nobody has
// asked yet -- and worse, answers it in a way that points the reader at a free
// workaround. What a visitor arrives with is "I built something — can I sell
// it?", so the page answers that first and reaches eligibility once it matters.
//
// currentUser() reads the session cookie, which opts this route out of static
// rendering. For anonymous traffic, which is nearly all of it, that costs a
// cookie read and no database query: currentUser() returns null before it
// touches the db.
//
// The processor evidence still matters and still exists in full on
// /how-it-works: the verbatim reply, the country grading, and what they would
// not confirm. It is linked from here rather than argued here, which is also
// where naming the rails belongs -- on the page a reader reaches after they
// already want this, not in the first paragraph they read.

export default async function Home() {
  // A revoked or expired session must still show "Sign in". Hiding it because
  // a stale cookie exists would strand someone who is, in fact, logged out.
  const user = await currentUser();

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
              <Link className="btn btn-q btn-sm hide-s" href="/docs/sdk">Docs</Link>
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
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/for-parents", label: "For parents" },
                  { href: "/docs/sdk", label: "Docs" },
                  { href: "/check", label: "Check eligibility" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/faq", label: "Questions" },
                  { href: "/legal", label: "What is not settled" },
                  { href: "/auth/signin", label: "Sign in" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="split-lead hero-grid">
              <div className="hero-left">
                {/* The wordmark is no longer the h1.
                    ------------------------------------------------------
                    It was, at 56px, with the actual proposition underneath
                    it at a third the size -- so the largest thing on the
                    page was a word that means nothing to anybody who has
                    not heard of us, and the sentence that does the work
                    read as its subtitle. The logo is in the nav, two inches
                    above, and does not need saying twice. */}
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  For builders aged 13 to 17
                </p>

                {/* No hard break. At a clamped size the right place to wrap
                    moves with the viewport, and text-wrap:balance picks it
                    better than a <br> frozen at one width ever could. */}
                {/* No hard break. At a clamped size the right place to wrap
                    moves with the viewport, and text-wrap:balance picks it
                    better than a <br> frozen at one width ever could. */}
                <h1 className="hero-h1">You can take payments before you&rsquo;re 18.</h1>

                {/* Two sentences, down from four lines of them. The clause
                    that went -- "not with a workaround, and not in your
                    parent's name" -- was the opening move of the
                    free-workaround argument, and that argument now lives in
                    full on /how-it-works rather than half-stated here. On a
                    phone it was five lines of lead pushing the product
                    surface off the first screen. */}
                <p className="hero-lead">
                  Your own products, your own checkout, your own money &mdash; with a parent
                  verified once on the account. That once is what makes it lawful.
                </p>

                <div className="hero-cta">
                  <Link className="btn btn-lg btn-xl" href="/get-started">Start &mdash; it&rsquo;s free</Link>
                  <Link className="btn btn-2 btn-lg" href="/check">Check where you live</Link>
                </div>

                {/* Three facts, as figures. They answer the three things a
                    reader is actually weighing -- can I, where, and what
                    does it cost -- without a paragraph each, and they fill
                    the bottom of a column that was ending in white space. */}
                <dl className="hero-facts">
                  <div>
                    <dt className="fig-k">From age</dt>
                    <dd className="fig fig-sm">13</dd>
                  </div>
                  <div>
                    <dt className="fig-k">Countries</dt>
                    <dd className="fig fig-sm">43</dd>
                  </div>
                  <div>
                    <dt className="fig-k">Under $100 a month</dt>
                    <dd className="fig fig-sm fig-pos">Free</dd>
                  </div>
                </dl>
              </div>

              <div className="hero-right">
                <LiveWallet />
              </div>
            </div>
          </div>
        </div>

        {/* ---- the money, on a dark band ----
            Five sections in a row used the same shape: a centred eyebrow, a
            centred h2 at 44px, a centred lead, then a grid. Read end to end
            it was one rhythm repeated until it stopped registering, and the
            page had no moment that felt different from the moment before it.

            This one is dark and full-bleed. It earns the emphasis -- it is
            the claim the whole product rests on, that the money is never
            ours -- and it gives the page a break in the middle that you can
            see from the scrollbar. */}
        <section className="lp ch lp-dark moneyband">
          <div className="wrap-lp">
            <div className="moneyband-h">
              <div>
                <span className="lp-eyebrow">Where the money goes</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  It never stops here.
                </h2>
              </div>
              <p className="moneyband-lead">
                A customer pays, and the money lands in an account with your name on the products
                and your guardian&rsquo;s name on the paperwork. Veyro is the checkout at one end
                and the record at the other. It is never the thing holding your money.
              </p>
            </div>

            <div className="moneyband-rail">
              <MoneyRail />
            </div>
          </div>
        </section>

        {/* ---- the three steps, asymmetric ----
            Heading pinned to the left and sticky, steps running down the
            right. A reader scanning the three keeps the question they are
            answering in view, and the page stops centring everything. */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">Start to paid</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Three steps. One of them is your parent.
                </h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  The whole of it, from nothing to money in an account with your name on the
                  products.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-5)" }}>
                  <Link className="linkbtn" href="/how-it-works">
                    What Veyro does, and what it sits on
                  </Link>
                </p>
              </div>
              <div className="aside-body">
                <Journey />
              </div>
            </div>
          </div>
        </section>

        {/* ---- whichever of the two readers you are ---- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">Two people have to say yes</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  One of them is reading over your shoulder.
                </h2>
              </div>
              <div className="aside-body">
                <AudienceSplit />
              </div>
            </div>
          </div>
        </section>

        {/* The five-answer "why not just use your parent's account?" block
            lived here and now lives on /how-it-works.

            Three reasons, and they were all measurable. It was the longest
            run of explanatory prose on the page, on a page already 15-25%
            too long. Its heading was the only one that did not anchor to
            the page's left edge -- 454px against 48 everywhere else, which
            is most of why the homepage read as a collection of blocks. And
            a reader who is still weighing a free workaround has not been
            convinced by the hero, so the argument belongs on the page they
            go to when they want the mechanics, not in the middle of the
            one that is meant to show rather than argue. */}

        {/* ---- 4. what it costs, then the ask ---- */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Your parent approves once. Then it&rsquo;s yours to run.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              Free under $100 a month. 3% on whatever you earn above that. No plan, no
              subscription: the core product is the same whether you are paying us or not, and
              some extra services switch on in the months you earn above $100.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg btn-xl" href="/get-started">Start &mdash; it&rsquo;s free</Link>
            </div>
            <p className="tiny" style={{ marginTop: 16 }}>
              <Link className="linkbtn" href="/pricing">What the 3% buys</Link>
              {" \u00b7 "}
              <Link className="linkbtn" href="/for-parents">For parents</Link>
              {" \u00b7 "}
              <Link className="linkbtn" href="/legal">What is not settled yet</Link>
            </p>
          </div>
        </section>

      </main>

      {/* Scroll entrances for everything below the hero, which has its own
          CSS entrance. One observer for the page; the selector is here rather
          than inside the component so what moves is readable where it is
          decided. */}
      <Reveal
        scope=".fw"
        select="section.lp > .wrap-lp > *, section.lp .objection > *"
        stagger=".jn, .objlist"
      />

      <ScrollTop />
      {/* The checker, not "Get started". The navbar is sticky on a phone and
          already carries "Get started" at every scroll position, so a second
          fixed bar saying the same thing was duplication the whole way down
          the page — and at the foot it put four identical buttons on one
          screen: navbar, the closing CTA, the footer link and this. The bar
          is worth keeping for the action the page keeps offering as the
          lower-commitment one. */}
      <StickyCta note="Free under $100 a month. No card." />
      <SiteFooter />
    </div>
  );
}
