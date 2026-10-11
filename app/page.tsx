import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { HeroWallet } from "@/app/_ui/HeroWallet";
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

      <main id="main" className="has-sticky home">
        {/* ---- the hero ----
            Three things were wrong with the one this replaces.

            The headline was a permission ("You can take payments before
            you're 18"), which is the objection answered rather than the
            product described. A visitor who has not met us does not yet know
            there is a rule to be let through; they know they built something
            and want to sell it. So the headline is the two things they want,
            in their order, and the permission moves into the line below
            where it belongs as a qualifier.

            The composition was flung apart. .wrap-lp is 1600px, so at 1440
            the two columns sat at the extreme edges with a canyon between
            them and the copy column squeezed to 477px against an 810px
            wallet -- the preview was the protagonist and the sentence was
            the caption. The hero now has its own measure, narrower than the
            page, and the pair sits centred inside it.

            And the preview only showed half the product. See HeroPreview. */}
        {/* ---- the hero ----
            FIVE THINGS CAME OUT OF THIS AND NOTHING WENT IN.

            The eyebrow ("For builders aged 13 to 17", with its own square
            bullet) was a decorated label above the headline, competing with
            it for the first glance. The audience is in the first five words
            of the supporting line now, where it is read rather than
            registered.

            The three figures -- from age 13, signup countries 43, under
            $100 free -- were a second row of content directly under two
            buttons, and the pricing half of them is already three figures
            in the closing section. A visitor who wants the numbers is one
            click from /check and /pricing; a visitor reading a hero is not
            weighing a country list.

            The disclosure line under them went with the figures it was
            qualifying. The conditionality is in the verb now -- Veyro HELPS
            you take payments, it does not promise you can -- and the
            primary action is literally "check eligibility", which is the
            same sentence as a button.

            And the preview lost its checkout pane, its joining sentence and
            the whole fee arithmetic. See HeroWallet for what survived.

            What is left is four things in the order they should be read:
            headline, one line, one action, one picture. */}
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="hero-grid">
              <div className="hero-left">
                {/* No hard break. At a clamped size the right place to wrap
                    moves with the viewport, and text-wrap:balance picks it
                    better than a <br> frozen at one width ever could. */}
                {/* Two sentences, two weights of ink. The first is what
                    you do; the second is what you get, and it is set in
                    pine -- the colour this design system reserves for
                    money. It is the one place on the page where the brand
                    colour and the brand promise are the same words, and it
                    costs no extra element to say it. */}
                <h1 className="hero-h1">
                  Build your business.{" "}
                  <span className="hero-h1-pay">Start getting paid.</span>
                </h1>

                <p className="hero-lead">
                  Veyro helps founders aged 13 to 17 take online payments, with a parent or
                  guardian as the verified adult. Create checkout links, and track every
                  payment in one place.
                </p>

                {/* One button and one link, not two buttons. Two filled
                    rectangles side by side are two primary actions however
                    they are coloured, and the hero only has one thing it
                    wants you to do. */}
                <div className="hero-cta">
                  <Link className="btn btn-lg btn-xl" href="/check">Check eligibility</Link>
                  <Link className="hero-alt" href="/how-it-works">
                    How it works
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="hero-right">
                <HeroWallet />
              </div>
            </div>
          </div>
        </div>

        {/* ---- A + B. the problem, then the answer ----
            The page had no opening statement at all: it went from the hero
            straight to a diagram of where money travels, which is an answer
            to a question the reader has not asked yet.

            Deliberately not a grid. Every other section below is two columns
            or a rail, and a page whose every block is a grid has one texture
            the whole way down. This one is a single measure of type with the
            answer indented under it, which is the only place on the page
            that shape appears. */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="stmt">
              <span className="lp-eyebrow">The problem</span>
              <p className="stmt-q">
                You can build something worth selling long before you can open the account
                that would let you sell it.
              </p>
              <div className="stmt-a">
                <p className="body">
                  Payment providers require the person behind an account to be an adult. That
                  rule is not aimed at you, but it stops you the same way &mdash; so the usual
                  answer is to borrow a parent&rsquo;s account and keep your business inside
                  somebody else&rsquo;s payments.
                </p>
                {/* This used to restate the hero lead almost word for word
                     -- products, checkout link, record of every payment. The
                     hero has said it; what this section owes the reader is
                     the one thing the hero does not say, which is why
                     borrowing an account is the wrong answer. */}
                <p className="body" style={{ marginTop: "var(--sp-5)" }}>
                  Veyro is the other answer: an account of its own, with the adult named on it
                  where the provider requires one. Your sales stay separable from your
                  parent&rsquo;s, which matters the first time either of you needs to prove
                  whose money is whose.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-6)" }}>
                  <Link className="linkbtn" href="/how-it-works">
                    What the provider&rsquo;s own policy says, in full
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

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
              {/* The third sentence here was "It is never the thing holding
                   your money", which is word for word what the trust section
                   below exists to say. Two sections making the same claim is
                   one of them not having a job. */}
              <p className="moneyband-lead">
                A customer pays, and the money lands in an account with your name on the products
                and your guardian&rsquo;s name on the paperwork. Veyro is the checkout at one end
                and the record at the other.
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
                {/* The lead here said "from nothing to money in an account
                     with your name on the products", which the heading above
                     and the band above that had both already said. The three
                     steps are the content; a sentence introducing them was
                     the third telling. */}
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

        {/* ---- E. whichever of the two readers you are ----
            This was a third consecutive .aside-grid, and its left column was
            a two-line heading against two tall panels: 250px of nothing,
            directly below a section with the same shape and the same void.
            The heading runs full width now, which both removes the hole and
            stops the page reading as one layout repeated. */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="secth">
              <div>
                <span className="lp-eyebrow">Two people have to say yes</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  One of them is reading over your shoulder.
                </h2>
              </div>
              <p className="secth-l">
                Veyro is software, not a bank, and it never holds your money. The payment
                provider holds it and your guardian owns the account it sits in.{" "}
                <Link className="linkbtn" href="/legal">What is not settled yet</Link>.
              </p>
            </div>
            <div className="secth-body">
              <AudienceSplit />
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
            {/* "Your parent approves once" was the headline here. It is not
                true in the sense a reader takes it: a connected account can
                be put back into REQUIREMENTS_DUE at any time, which the
                schema models and the guardian dashboard renders. The
                approval is once; the verification is not guaranteed to be,
                and the first place a parent should learn that is not Stripe. */}
            <h2 className="lp-h2 lp-h2-tight">Find out if you can start.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              Two questions &mdash; where you live and how old you are &mdash; and you will know.
            </p>

            {/* Pricing, as three figures rather than a sentence.
                It was a clause in the paragraph above, which is the worst
                place for the second question every visitor has. Same
                .hero-facts cells the hero uses, so it is the page's own
                shape rather than a new one. */}
            <dl className="hero-facts ctafacts">
              <div>
                <dt className="fig-k">Free every month</dt>
                <dd className="fig fig-sm">$100</dd>
              </div>
              <div>
                <dt className="fig-k">Above that</dt>
                <dd className="fig fig-sm">3%</dd>
              </div>
              <div>
                <dt className="fig-k">Plan or subscription</dt>
                <dd className="fig fig-sm">None</dd>
              </div>
            </dl>
            {/* Two actions on a desktop, one on a phone.
                The sticky bar is phone-only and already carries "Get
                started" at the foot of the page, so on a phone this row put
                two identical buttons about forty pixels apart. The CSS
                drops the secondary at the same breakpoint the bar appears
                at, which keeps the decision in one place and needs no
                JavaScript to work out where the reader is. */}
            <div className="row ctarow" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg btn-xl" href="/check">Check eligibility</Link>
              <Link className="btn btn-2 btn-lg ctarow-2" href="/get-started">Get started</Link>
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
      {/* The bar carries whichever action the hero is NOT leading with.
          It used to be the checker, because the hero led with "Start"; the
          hero leads with the checker now, so a bar repeating it sat six
          inches below an identical button on the very first screen. Signing
          up is the other half of the same decision and the navbar's own
          "Get started" scrolls away behind the drawer on a phone. */}
      <StickyCta href="/get-started" label="Get started"
        note="Free under $100 a month. No card." />
      <SiteFooter />
    </div>
  );
}
