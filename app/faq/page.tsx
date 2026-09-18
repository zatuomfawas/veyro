import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ScrollProgress } from "@/app/_ui/ScrollProgress";
import { FAQ } from "@/app/_ui/faq";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Questions about taking payments under 18",
  description:
    "Whether a guardian can block a payout, what happens at 18, how age is checked, what it "
    + "costs, and which countries are open. Straight answers, including the unwelcome ones.",
  alternates: { canonical: SITE + "/faq" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "Questions about taking payments under 18",
    description: "Straight answers, including the unwelcome ones.",
    url: SITE + "/faq",
  },
};

// The same entries the homepage shows, from app/_ui/faq.tsx. Native <details>,
// so it opens without JavaScript and every answer is in the HTML for a crawler
// and a screen reader to reach.
export default function FaqPage() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <ScrollProgress />
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/wallet", label: "The Founder Wallet" },
                  { href: "/for-founders", label: "For founders" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <span className="lp-eyebrow">Questions</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          The ones people actually ask.
        </h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Including the ones with answers you might not want. Where something is not built yet, it
          says so.
        </p>

        <div style={{ marginTop: 40, maxWidth: "var(--m-wide)" }}>
          {FAQ.map((f) => (
            <details className="disc" key={f.q}>
              <summary className="disc-q">
                <span style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{f.q}</span>
                <span className="disc-sign" aria-hidden="true" />
              </summary>
              <p className="disc-a">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="card" style={{ marginTop: 40 }}>
          <div className="card-b">
            <h2 className="h4" style={{ marginTop: 0 }}>Not answered here?</h2>
            <p className="body" style={{ marginBottom: 0 }}>
              <Link className="linkbtn" href="/contact">Email us</Link> and a person will reply. If
              you are a parent deciding whether to agree to this,{" "}
              <Link className="linkbtn" href="/for-guardians">what a guardian takes on</Link> is the
              page written for you.
            </p>
          </div>
        </div>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
