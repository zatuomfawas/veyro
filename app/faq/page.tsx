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
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { SectionRail } from "@/app/_ui/SectionRail";
import { MarginNote } from "@/app/_ui/MarginNote";
import { PageNext } from "@/app/_ui/PageNext";

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
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <ScrollProgress />
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                                                      { href: "/for-parents", label: "For parents" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp longform has-rail" style={{ paddingTop: 40, paddingBottom: 56 }}>
        {/* The sections of an FAQ are its questions, not its one heading. */}
        <SectionRail label="Questions" selector=".disc-q" />
        <span className="lp-eyebrow">Questions</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          The ones people actually ask.
        </h1>
        <p className="lead" style={{ marginTop: 16 }}>
          Including the ones with answers you might not want. Where something is not built yet, it
          says so.
        </p>

        {/* Half of these answers are about where money goes and who holds it,
            and each one re-describes the same path in its own words. The path
            drawn once, before any of them, means the answers can refer to a
            picture the reader already has. */}
        <div style={{ marginTop: "var(--sp-8)", maxWidth: "var(--m-wide)" }}>
          <MoneyRail />
        </div>

        <div style={{ marginTop: "var(--sp-8)", maxWidth: "var(--m-wide)" }}>
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

        <MarginNote head="Not answered here?" sticky>
          <Link className="linkbtn" href="/contact">Email us</Link> and a person will reply. If
          you are a parent deciding whether to agree to this,{" "}
          <Link className="linkbtn" href="/for-parents">what a guardian takes on</Link> is the
          page written for you.
        </MarginNote>
        <PageNext
          head="Not the question you had?"
          lead="These are the ten that come up most. Anything else goes to a person, and a person
            answers it — there is no ticket queue to disappear into."
          primary={{ href: "/contact", label: "Ask us directly" }}
          secondary={{ href: "/get-started", label: "See the whole path" }}
        />
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
