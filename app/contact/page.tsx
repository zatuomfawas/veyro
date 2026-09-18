import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";

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
      <style>{CSS + CSS2}</style>
      <SkipLink />
      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <span className="lp-eyebrow">Contact</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Talk to a person.</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Veyro is small enough that your email reaches the person who built it.
        </p>

        <div className="card" style={{ marginTop: 32 }}>
          <div className="card-b">
            <h2 className="h4" style={{ marginTop: 0 }}>Email</h2>
            <p className="body">
              <a className="linkbtn mono" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
            <p className="small" style={{ marginBottom: 0 }}>
              There is no phone line and no support portal, so this is the whole of it. We have not
              measured a response time and will not invent one; it is usually the same day.
            </p>
          </div>
        </div>

        <h2 className="h3" style={{ marginTop: 40 }}>What to include</h2>
        <ul className="arrowlist" style={{ marginTop: 16 }}>
          <li>
            <strong>Something is broken.</strong> What you were trying to do, what happened
            instead, and the page you were on. A screenshot helps more than a description.
          </li>
          <li>
            <strong>A payment question.</strong> The reference shown on the payment page, which
            starts with <span className="mono">pi_</span>. Never send card details: nobody at Veyro
            can see them or needs them.
          </li>
          <li>
            <strong>You are a parent deciding whether to agree.</strong> Say so. That question gets
            a proper answer, not a sales reply. <Link className="linkbtn" href="/for-guardians">
            What a guardian takes on</Link> covers most of it.
          </li>
          <li>
            <strong>Access, correction or deletion of your data.</strong> Say what you want and we
            will do it. See <Link className="linkbtn" href="/privacy">the privacy policy</Link>.
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
      </main>

      <SiteFooter />
    </div>
  );
}
