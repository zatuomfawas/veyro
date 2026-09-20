import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "For founders: get your business ready to take payments",
  description:
    "What you need before you can charge for what you built: a payment account, a guardian if "
    + "you are under 18, and a ledger that shows where the money went.",
  alternates: { canonical: SITE + "/for-founders" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "For founders",
    description: "Get your business ready to take payments.",
    url: SITE + "/for-founders",
  },
};

export default function ForFounders() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/wallet">The Wallet</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/wallet", label: "The Founder Wallet" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/faq", label: "Questions" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp has-sticky" style={{ paddingTop: 32 }}>
        <span className="lp-eyebrow">For founders</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          You can build it. Now charge for it.
        </h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Shipping the product is the part you already know how to do. This page is the other part:
          what has to exist before a stranger can pay you, and who has to do each piece.
        </p>
        <p className="small" style={{ marginTop: 14 }}>
          Want the steps in order, with the code for the buy button?{" "}
          <Link className="linkbtn" href="/get-started">Start here</Link>.
        </p>

        <hr className="rule" style={{ margin: "26px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What you need</h2>
          </div>
          <div>
            <ol className="numbered">
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="person" size={14} />
                  <strong style={{ fontSize: "var(--fs-3)" }}>An account, from 13</strong>
                </span>
                <span className="small">
                  Your real date of birth, because the rules turn on the exact date rather than the
                  year.
                </span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="home" size={14} />
                  <strong style={{ fontSize: "var(--fs-3)" }}>A guardian, while you are under 18</strong>
                </span>
                <span className="small">
                  You invite them, they accept in their own account, and Stripe verifies them. They
                  do not become the owner of what you built.
                </span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="card" size={14} />
                  <strong style={{ fontSize: "var(--fs-3)" }}>A payment account</strong>
                </span>
                <span className="small">
                  Opened in your name with your guardian as the verified adult. Money settles there
                  directly, never through Veyro.
                </span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="list" size={14} />
                  <strong style={{ fontSize: "var(--fs-3)" }}>Something to sell</strong>
                </span>
                <span className="small">
                  A product with a name, a description and a price. It gets a checkout link you can
                  put anywhere.
                </span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="wallet" size={14} />
                  <strong style={{ fontSize: "var(--fs-3)" }}>Somewhere to watch the money</strong>
                </span>
                <span className="small">
                  Collected, fees, refunds, what is still settling and what you can withdraw.{" "}
                  <Link className="linkbtn" href="/wallet">The Founder Wallet</Link>.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <hr className="rule" style={{ margin: "26px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What stays yours</h2>
          </div>
          <div style={{ maxWidth: "var(--m-wide)" }}>
            <p className="body" style={{ marginTop: 0 }}>
              The business is yours. Involving a guardian is a requirement of the payment provider,
              not a transfer of ownership, and Veyro keeps its records against you rather than
              against them.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              Your guardian can see your products, your balance and your payout requests. That
              visibility is the arrangement, and you agree to it when you send the invitation.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              They are told about every payout request and cannot block one. On this account type
              nobody can be given that power.
            </p>
          </div>
        </div>

        <hr className="rule" style={{ margin: "26px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>Before you start</h2>
          </div>
          <div style={{ maxWidth: "var(--m-wide)" }}>
            <ul className="arrowlist" style={{ marginTop: 0 }}>
              <li>
                <strong>Check your country first.</strong> This route is not open everywhere, and
                Brazil is excluded outright. The checker is free and takes about twenty seconds.
              </li>
              <li>
                <strong>Talk to your guardian before you invite them.</strong> They are taking on
                real responsibility, including for refunds and chargebacks.{" "}
                <Link className="linkbtn" href="/for-guardians">Send them this</Link>.
              </li>
              <li>
                <strong>Only sell what you can actually deliver.</strong> It is your guardian&rsquo;s
                name on the account when a customer complains.
              </li>
            </ul>
          </div>
        </div>

        <div className="row" style={{ marginTop: 32, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check my eligibility</Link>
          <Link className="btn btn-2 btn-lg" href="/how-it-works">How the setup works</Link>
        </div>
      </main>

      <ScrollTop />
      <StickyCta label="Check my eligibility" note="Two questions. No account." />
      <SiteFooter />
    </div>
  );
}
