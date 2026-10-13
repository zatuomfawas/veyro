import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { SkipLink } from "@/app/_ui/marks";
import { SiteNav } from "@/app/_ui/SiteNav";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SiteReveal } from "@/app/_ui/SiteReveal";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ScrollProgress } from "@/app/_ui/ScrollProgress";
import { FAQ, AUDIENCE_GROUPS } from "@/app/_ui/faq";
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { PageNext } from "@/app/_ui/PageNext";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Questions about taking payments under 18",
  description:
    "What control a guardian keeps, what happens at 18, how age is checked, what it costs, "
    + "and which countries are open. Answers in full, including the unwelcome ones.",
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

// Shared answers stay fully visible here for reading and indexed navigation.
export default function FaqPage() {
  return (
    <div className="fw public-page">
      <ScrollProgress />
      <SkipLink />

      <SiteNav active="/faq" />

      {/* An index, then the answers in full.
          ------------------------------------------------------------------
          It was nine <details>, all shut. 1,651px of page showing 228 words,
          and every answer one click away -- so you could see the questions
          and not one of the answers, which is the wrong half to hide on a
          page whose job is resolving an objection before somebody leaves.

          Open by default now, which costs length and buys scanning, and the
          length is paid back by the index: nine questions in one block at the
          top, so the one you came for is a click away instead of a scroll.

          Grouped by who is asking. Half of these are a parent's questions and
          half a founder's, and interleaved they meant every other answer was
          addressed to somebody else. */}
      <main id="main" className="has-sticky">

        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <h1 className="hero-h1">The ones people actually ask.</h1>
                <p className="hero-lead">
                  Including the ones with answers you might not want. Where something is not
                  built yet, or not settled, it says so rather than going quiet.
                </p>
              </div>

              {/* The index. Nine links, so the question you arrived with is a
                  click rather than a scroll through the other eight. */}
              <nav className="qindex" aria-label="All questions">
                <span className="qindex-k">All nine</span>
                <ol className="qindex-l">
                  {FAQ.map((f, i) => (
                    <li key={f.q}>
                      <a className="qindex-a" href={`#q${i + 1}`}>
                        <span className="qindex-n">{String(i + 1).padStart(2, "0")}</span>
                        <span>{f.q}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Half the answers here are about where money goes and who holds it,
            and each re-describes the same path in its own words. Drawn once,
            before any of them, the answers can point at a picture the reader
            already has. */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <h2 className="lp-h2" style={{ maxWidth: "20ch" }}>
              Most of these are the same question about money.
            </h2>
            <div style={{ marginTop: "var(--sp-7)" }}>
              <MoneyRail />
            </div>
          </div>
        </section>

        {AUDIENCE_GROUPS.map((g, gi) => {
          const items = FAQ.map((f, i) => ({ ...f, n: i + 1 })).filter((f) => f.audience === g.key);
          if (!items.length) return null;
          return (
            <section className={"lp ch" + (gi % 2 ? " ch-surface" : "")} key={g.key}>
              <div className="wrap-lp">
                <div className="aside-grid">
                  <div className="aside-head">
                    <span className="lp-eyebrow">{String(gi + 1).padStart(2, "0")}</span>
                    <h2 className="lp-h2">{g.title}</h2>
                    <p className="body" style={{ marginTop: "var(--sp-4)" }}>{g.lead}</p>
                  </div>

                  <dl className="qa-open">
                    {items.map((f) => (
                      <div className="qa-item" id={`q${f.n}`} key={f.q}>
                        <dt className="qa-q">
                          <span className="qa-n" aria-hidden="true">{String(f.n).padStart(2, "0")}</span>
                          {f.q}
                        </dt>
                        <dd className="qa-a">{f.a}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          );
        })}

        <section className="lp ch">
          <div className="wrap-lp">
        <PageNext
          head="Not the question you had?"
          lead="These are the ten that come up most. Anything else goes to a person, and a person
            answers it — there is no ticket queue to disappear into."
          primary={{ href: "/contact", label: "Ask us directly" }}
          secondary={{ href: "/get-started", label: "Get started" }}
        />
          </div>
        </section>
      </main>

      <ScrollTop />
      <SiteReveal />
      <SiteFooter />
    </div>
  );
}
