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
import { ParentAccount } from "@/app/_ui/ParentAccount";
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
              <div>
                <h1 className="hero-h">
                  <Wordmark hero />
                  <span className="tagline">You can take payments before you&rsquo;re 18.</span>
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
                {/* Layer 1 is one sentence and one visual, and the sentence
                    is the subhead rather than this paragraph. What used to sit
                    here was the argument -- why this is hard, what we do about
                    it -- which is Layer 2 work being done above the fold in
                    prose. The wallet on the right now carries it: a reader who
                    watches a sale land and a payout get requested has been
                    told what this is without reading a word of it. */}
                <p className="hero-sub">From 13, with a parent or guardian on the account.</p>

                <div className="row" style={{ marginTop: "var(--sp-6)", gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                  <Link className="btn btn-2 btn-lg" href="/get-started">Start free</Link>
                </div>
                <p className="tiny" style={{ marginTop: 12 }}>
                  Two questions, no account needed. Free under $100 a month, which is most people.
                </p>

              </div>

              <div>
                <LiveWallet />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Layer 2: where the money goes, as one picture ---- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="headc" style={{ marginBottom: "var(--sp-8)" }}>
              <span className="lp-eyebrow">Where the money goes</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                It never stops here.
              </h2>
              <p className="lp-lead" style={{ marginTop: "var(--sp-4)" }}>
                A customer pays, and the money lands in an account with your name on the
                products and your guardian&rsquo;s name on the paperwork. Veyro is the checkout
                at one end and the record at the other. It is never the thing holding your money.
              </p>
            </div>

            <MoneyRail />

            <div className="layer">
              <div className="headc" style={{ marginBottom: "var(--sp-7)" }}>
                <span className="lp-eyebrow">Start to paid</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Three steps. One of them is your parent.
                </h2>
              </div>
              <Journey />
            </div>

            <p className="small centred-note" style={{ marginTop: "var(--sp-7)" }}>
              <Link className="linkbtn" href="/how-it-works">What Veyro does, and what it sits on</Link>
            </p>
          </div>
        </section>

        {/* ---- Layer 3: whichever of the two readers you are ---- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <div className="headc">
              <span className="lp-eyebrow">Two people have to say yes</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                One of them is reading over your shoulder.
              </h2>
            </div>
            <AudienceSplit />
          </div>
        </section>

        {/* ---- the objection that decides it ---- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <ParentAccount />
          </div>
        </section>

        {/* ---- 4. what it costs, then the ask ---- */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Your parent approves once. Then it&rsquo;s yours to run.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              Free under $100 a month. 3% on whatever you earn above that. Most people never pay
              anything, and the free tier is the whole product &mdash; not a trial.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/get-started">Start &mdash; it&rsquo;s free</Link>
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
