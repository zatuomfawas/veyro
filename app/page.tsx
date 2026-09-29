import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { DashboardPreview } from "@/app/_ui/DashboardPreview";
import { Reveal } from "@/app/_ui/Reveal";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { FounderStories } from "@/app/_ui/FounderStories";
import { Journey } from "@/app/_ui/Journey";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";
import { AiIntegration } from "@/app/_ui/AiIntegration";

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
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/wallet">Founder Wallet</Link>
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
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/wallet", label: "The Founder Wallet" },
                  { href: "/docs/sdk", label: "Add it to your app" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/check", label: "Check eligibility" },
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
                  <span className="tagline">Take payments before you&rsquo;re 18.</span>
                  <span className="tagline-2">Your business. Your dashboard. Your money.</span>
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
                    Not a workaround, and not a wallet that holds your money for you. A real
                    Stripe account in your name, opened with a parent as the verified adult.
                    You run the business. You keep the money. You do not wait three years.
                  </p>
                </div>

                {/* Supporting, not the headline. The age rules are why Veyro
                    exists, but they are not what someone arrives wanting to
                    read; the checker two clicks away answers them properly. */}
                <p className="foldwho">
                  From 13, in 43 countries, with a parent or guardian on the account.{" "}
                  <Link className="linkbtn" href="/check">Check yours</Link> &mdash; two questions,
                  no account needed.
                </p>

                {/* The three numbers that answer "is this worth my afternoon".
                    "Live the same day" is deliberately about shipping, which is
                    the part Veyro controls -- not about a first sale, which
                    depends on whoever you built it for. */}
                <ul className="wins" aria-label="What setup costs you">
                  <li><b>5 min</b><span>to set up</span></li>
                  <li><b>2 calls</b><span>to integrate</span></li>
                  <li><b>0%</b><span>taken by Veyro</span></li>
                </ul>

                {/* The code is the product for most of the people arriving
                    here, so it is on the first screen rather than five
                    chapters down. Three lines, and they are the real ones. */}
                <figure className="herocode">
                  <pre>{`const { checkoutUrl } = await veyro.checkout(productId);
window.location = checkoutUrl;
// ...they pay, you get the money.`}</pre>
                  <figcaption>
                    That is the integration. <Link className="linkbtn" href="/docs/sdk">See the guide</Link>
                  </figcaption>
                </figure>

                {/* One ask. The checker is still reachable, from the line
                    above, where it belongs to the sentence about eligibility
                    rather than competing with the thing the page is for. */}
                <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/get-started">Start now</Link>
                </div>

              </div>

              <div>
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>

        {/* ---- one journey, four steps ---- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="headc" style={{ marginBottom: 32 }}>
              <span className="lp-eyebrow">Start to paid</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Four steps. One of them is your parent.</h2>
            </div>
            <Journey />

            {/* The guardian step is the one people get wrong in both
                directions, so the correction sits directly under the row that
                raises it rather than on another page. */}
            <div style={{ marginTop: "var(--sp-7)" }}>
              <GuardianPermissions />
            </div>
            <p className="small centred-note" style={{ marginTop: 16 }}>
              <Link className="linkbtn" href="/how-it-works">How the money actually moves</Link>
            </p>
          </div>
        </section>

        {/* ---- the AI story ---- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <AiIntegration />
          </div>
        </section>

        {/* Real founders, when there are real founders to quote. Renders
            nothing until lib/stories.ts has some. */}
        <FounderStories />

        {/* ================= 9. the end ================= */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">You built it. Now make it pay.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              Sign up, do the guardian step once, and the dashboard above is yours. Most of the
              waiting is Stripe verifying an adult, not you filling anything in.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/get-started">Start now</Link>
            </div>
            <p className="tiny" style={{ marginTop: 16 }}>
              <Link className="linkbtn" href="/how-it-works">How it works</Link>
              {" \u00b7 "}
              <Link className="linkbtn" href="/faq">Questions</Link>
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
        select="section.lp > .wrap-lp > *, section.lp .ai > *, section.lp .gperm > *"
        stagger=".jn, .ai-tools, .gperm-l"
      />

      <ScrollTop />
      {/* The checker, not "Get started". The navbar is sticky on a phone and
          already carries "Get started" at every scroll position, so a second
          fixed bar saying the same thing was duplication the whole way down
          the page — and at the foot it put four identical buttons on one
          screen: navbar, the closing CTA, the footer link and this. The bar
          is worth keeping for the action the page keeps offering as the
          lower-commitment one. */}
      <StickyCta note="Free to start. Veyro takes 0%." />
      <SiteFooter />
    </div>
  );
}
