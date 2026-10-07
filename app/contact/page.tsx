import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { PageNext } from "@/app/_ui/PageNext";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Contact Veyro",
  description: "How to reach a person at Veyro, and what to expect when you do.",
  alternates: { canonical: SITE + "/contact" },
  robots: { index: true, follow: true },
};

const EMAIL = "hello@withveyro.com";

// One address, answered by one person. No phone number, because there is no
// phone line; no ticket portal, because there is no ticket system; no response
// time, because none has been measured. Inventing any of those would be the
// first thing a guardian discovered was untrue.
export default function Contact() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />
      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* A dispatcher, not a letter.
          ------------------------------------------------------------------
          There is one address and four reasons to use it, and the old page
          set that out as a card, a heading and a vertical list -- a reader
          looking for "I am a parent and I want to ask something" had to read
          past three cases that were not theirs.

          The address is the largest thing on the page, because it is the
          whole product of this page, and the four cases are routes laid out
          side by side so you can find your own without reading the others. */}
      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 56 }}>
        <div className="ctc-h">
          <div>
            <span className="lp-eyebrow">Contact</span>
            <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "14ch" }}>
              Talk to a person.
            </h1>
            <p className="body" style={{ marginTop: "var(--sp-4)", maxWidth: "40ch" }}>
              Veyro is small enough that your email reaches the person who built it.
            </p>
          </div>

          <div className="ctc-card">
            <span className="fig-k">The only address</span>
            <a className="ctc-mail mono" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <p className="tiny" style={{ margin: "var(--sp-4) 0 0" }}>
              No phone line and no support portal, so this is the whole of it. We have not
              measured a response time and will not invent one; it is usually the same day.
            </p>
          </div>
        </div>

        <h2 className="h3" style={{ marginTop: "var(--sp-9)" }}>Say which of these you are</h2>
        <p className="small" style={{ marginTop: "var(--sp-2)", maxWidth: "56ch" }}>
          One line at the top of the mail saves a round trip, and the second column is what to
          put in it.
        </p>
        <ul className="ctc-routes">
          <li className="ctc-route">
            <h3 className="ctc-route-t">Something is broken</h3>
            <p className="ctc-route-d">
              What you were trying to do, what happened instead, and the page you were on. A
              screenshot helps more than a description.
            </p>
          </li>
          <li className="ctc-route">
            <h3 className="ctc-route-t">A payment question</h3>
            <p className="ctc-route-d">
              The reference from the payment page, starting <span className="mono">pi_</span>.
              Never send card details &mdash; nobody here can see them or needs them.
            </p>
          </li>
          <li className="ctc-route" data-flag="1">
            <h3 className="ctc-route-t">You are a parent deciding</h3>
            <p className="ctc-route-d">
              Say so, and it gets a proper answer rather than a sales reply.{" "}
              <Link className="linkbtn" href="/for-parents">What a guardian takes on</Link>{" "}
              covers most of it first.
            </p>
          </li>
          <li className="ctc-route">
            <h3 className="ctc-route-t">Your data</h3>
            <p className="ctc-route-d">
              Access, correction or deletion. Say what you want and we will do it.{" "}
              <Link className="linkbtn" href="/privacy">The privacy policy</Link>.
            </p>
          </li>
        </ul>

        <div className="card" style={{ marginTop: 32 }}>
          <div className="card-b">
            <h2 className="h4" style={{ marginTop: 0 }}>Money that has already moved</h2>
            <p className="body" style={{ marginBottom: 0 }}>
              Veyro never holds your money, so a payment, a refund or a payout that has already
              started is with Stripe. We can tell you what our records show and help you work out
              what happened, but the balance and the timing are theirs. Email anyway and we will
              point you at the right place.
            </p>
          </div>
        </div>
        <PageNext
          head="Faster than waiting for us"
          lead="Most questions already have an answer written down, and the eligibility checker
            settles the commonest one in about twenty seconds without an account."
          primary={{ href: "/faq", label: "Read the questions" }}
          secondary={{ href: "/check", label: "Check where you live" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
