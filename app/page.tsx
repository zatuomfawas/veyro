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
import { ParentAccount } from "@/app/_ui/ParentAccount";

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
              {/* Pricing, not Docs. The nav has three quiet slots and this one
                  was pointing a thirteen-to-seventeen-year-old who has just
                  arrived asking "can I sell this?" at an SDK reference. What
                  they ask second, every time, is what it costs -- the page
                  below answers it in a three-figure row for exactly that
                  reason. Docs keeps its place in the footer and in the phone
                  drawer, where a developer looking for it will look. */}
              <Link className="btn btn-q btn-sm hide-s" href="/pricing">Pricing</Link>
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
            TWO COLUMNS FROM 940 UP, AND THIS FILE ARGUED THE OPPOSITE FOR
            A LONG TIME, SO HERE IS WHY IT CHANGED.

            The argument against a split was that headline-left /
            wallet-right is the most common SaaS hero arrangement there is
            and reads as "headline, and also here is a screenshot". That
            was a fair description of what this hero used to be: the card
            was a 616px fee table parked in the right-hand half, and it did
            read as a screenshot beside a sentence.

            So the hero became a single column -- statement, surface,
            action, all spanning the measure. That fixed the screenshot
            problem and bought a worse one. A 780px headline and a 760px
            card inside a 1240px measure leave most of the right-hand third
            of the first screen empty from the headline down, and the
            vertical sequence pushed the band to 822px. Negative space that
            large is not restraint, it is a column that stopped.

            What changed in between is the card. It is three facts now, not
            a fee table, so it is small enough to sit beside the argument
            instead of underneath it, and the thing the old objection was
            really about -- a big mock dashboard competing with the
            headline -- cannot happen at this size. The band is 555px, both
            columns are occupied, and the two share a top edge.

            The action still comes before the evidence in the left column,
            which was the point of the single-column pass and survives this
            one. Below 940 the whole thing is still that single column:
            claim, action, evidence, in that order. 940 is the breakpoint
            DESIGN.md already calls "hero splits".

            THE HEADLINE IS THE OLD ONE. "Build your business. Start
            getting paid." could run on Stripe, Gumroad, Shopify or Paddle
            unchanged, which is the test it fails. This one cannot be said
            by anybody else. "You built it. Now get paid for it." was
            proposed and declined for two reasons: the section one screen
            down already opens "You built it. Getting paid for it is the
            hard part", and the replacement drops the only clause no
            competitor can copy. No two-tone colour accent: the weight
            comes from scale and tracking. */}
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="hero-stack">
              {/* Outcome, not capability.
                  "You can take payments before you're 18" states a
                  permission. It is unique to Veyro, which is why it beat
                  the commodity line before it, but it leaves the visitor
                  to work out what they get -- a capability, not a
                  transformation. Leading on getting paid for what you
                  make says the outcome and keeps the only claim no other
                  payments company can make.

                  Not "You built it. Now get paid", which is the obvious
                  rewrite: the section one screen down already opens "You
                  built it. Getting paid for it is the hard part", and two
                  identical openings a screen apart is the repetition the
                  last few passes went to remove. */}
              <h1 className="hero-h1">
                Get paid for what you make, before you&rsquo;re 18.
              </h1>

              {/* One sentence, because the hero had none.
                  It went from the headline straight into a fee breakdown,
                  so a visitor met the accounting before they knew what
                  the product was -- two separate reviews landed on this
                  independently, which is usually the signal to stop
                  defending the omission.

                  Named use cases rather than "products": apps, templates
                  and commissions are the things this audience actually
                  sells, and a reader recognises one of them faster than
                  they parse a category.

                  TWO SENTENCES, AND THE SECOND ONE IS THE PRODUCT.
                  It ran as one for a while, with the guardian clause moved
                  down into the card's footer, on the argument that the
                  hook should not be interrupted. That was the wrong trade.
                  The headline says a reader can get paid before they are
                  18; the sentence explaining how that is possible is the
                  one thing standing between "interesting" and "this is a
                  loophole", and it was 11.5px of grey four hundred pixels
                  further down. It is here, at lead size, where the claim
                  it qualifies is.

                  No inline link in it any more. The link pulled the eye off
                  the hook, and the card's footer carries the same
                  destination a screen-inch below. */}
              <p className="hero-lead">
                Sell the apps, templates and commissions you build, with your own checkout
                link. A parent or guardian is the verified adult on the payment account; the
                business on it is yours.
              </p>

              <HeroWallet />

              <div className="hero-cta">
                <Link className="btn btn-lg btn-xl" href="/check">Check eligibility</Link>
                {/* No appended arrow. The link works without one. */}
                <Link className="hero-alt" href="/how-it-works">How it works</Link>
              </div>

              {/* The checker genuinely needs nothing: app/check is a public
                  standalone page with no auth, no database and no API
                  calls, which its own header comment says. Worth saying,
                  because "check eligibility" sounds like a form that
                  wants your details. */}
              <p className="hero-sub2">Free to check. No account needed.</p>
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
              {/* Recognition, not explanation.
                  ----------------------------------------------------------
                  This block used to open "You can build something worth
                  selling long before you can open the account that would
                  let you sell it", and then explain account structures for
                  two paragraphs. Five things were wrong with it and they
                  compounded.

                  It was written in the register of a terms page -- "the
                  person behind an account", "where the provider requires
                  one" -- to a fifteen-year-old who has just finished
                  something and wants to sell it.

                  Its one concrete image, "keep your business inside
                  somebody else's payments", is not an image at all. Nobody
                  can picture it.

                  It taught the mechanics before it earned the right to:
                  account holders, providers, separability, all before the
                  reader had been told the page understood their problem.

                  And it had the wrong feeling. It ended on proving whose
                  money is whose, which is a parent's worry and belongs on
                  the parent's page. The founder's worry is that they are
                  ready and the money is not.

                  Ninety-six words down to seventy-one, and the first line
                  is now something a reader recognises rather than
                  something they have to parse. */}
              <p className="stmt-q">
                You built it. Getting paid for it is the hard part.
              </p>
              <div className="stmt-a">
                <p className="body">
                  Payment services want an adult on the account, so under 18 that is usually
                  where it stops. The workaround is to use a parent&rsquo;s, and watch your
                  first sales land in the middle of their grocery shopping.
                </p>
                <p className="body" style={{ marginTop: "var(--sp-5)" }}>
                  Veyro is the other way. A parent or guardian is the verified adult on the
                  account; the business on it is yours.
                </p>
                {/* "What the provider's own policy says, in full" was the
                    same terms-page register as the paragraphs above it.
                    Four plain words, and it is the question a sceptical
                    reader actually has. */}
                <p className="small" style={{ marginTop: "var(--sp-6)" }}>
                  <Link className="linkbtn" href="/how-it-works">How this is allowed</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- the objection, immediately after the problem ----
            The section above ends on the workaround: "use a parent's, and
            watch your first sales land in the middle of their grocery
            shopping". The very next thought a reader has is "...and is that
            actually bad?", so this is where it gets answered, before the
            page asks for anything.

            It used to live here, moved to /how-it-works, and is back. The
            reason it was moved was that it ran long and its heading did not
            anchor to the page's left edge. Both of those were true of the
            old five-tick version and neither is true of this one: it is a
            comparison on the page's own spine, and the argument belongs in
            front of the reader who is still weighing a free alternative,
            not on the page they only reach once they have stopped weighing
            it. It is no longer on /how-it-works, so nothing is said twice. */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <ParentAccount />
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
                <h2 className="lp-h2">It never stops here.</h2>
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
                <h2 className="lp-h2">Three steps. One of them is your parent.</h2>
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
                <h2 className="lp-h2">One of them is reading over your shoulder.</h2>
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
              Two questions: where you live, and how old you are.
            </p>

            {/* Pricing, as three figures rather than a sentence.
                It was a clause in the paragraph above, which is the worst
                place for the second question every visitor has. Same
                .hero-facts cells the hero uses, so it is the page's own
                shape rather than a new one. */}
            <dl className="hero-facts ctafacts">
              <div>
                {/* "Free every month / $100" inverted. As a dt over a dd the
                    eye resolves the pair as label: value -- "free every
                    month: $100" -- which is a reading of our pricing that
                    says we charge a hundred dollars a month, in the last
                    block before the decision. Its two siblings read
                    correctly, which is what made this one invisible. */}
                <dt className="fig-k">First $100 each month</dt>
                <dd className="fig fig-sm">Free</dd>
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
        note="Free until you earn $100 in a month. No card." />
      <SiteFooter />
    </div>
  );
}
