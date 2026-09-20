import Link from "next/link";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { Notice } from "@/app/_ui/form";
import { ScrollProgress } from "@/app/_ui/ScrollProgress";
import { ScrollTop } from "@/app/_ui/ScrollTop";

export const SUPPORT_EMAIL = "hello@withveyro.com";

// The jurisdiction these documents are governed by is not settled, because the
// company is not incorporated yet. Naming a country we have not registered in
// would be worse than admitting the gap, so it is named once here and the
// placeholder is visible on the page rather than buried.
export const JURISDICTION_PLACEHOLDER = true;

/** One clause, for the contents list. `n` must match the <Clause n=…> below it. */
export type Section = { n: number; title: string };

/**
 * Shared chrome for the three legal pages.
 *
 * The container is 1200px, but the prose is not. A 1200px line of body text
 * runs to roughly 160 characters, which is hard to read: the eye loses its
 * place on the return sweep. So the width goes to a contents column instead,
 * and the text keeps a 76ch measure. On a narrow screen the contents list
 * drops above the text and everything is one column.
 *
 * `updated` is a real date passed by each page and changed by hand when the
 * text changes. It is not derived from the file's mtime or the build time:
 * both move when nothing about the policy has changed, which turns a date
 * people rely on into noise.
 */
export function LegalShell({
  title, lead, updated, sections, children,
}: {
  title: string;
  lead: string;
  updated: string;
  sections: Section[];
  children: React.ReactNode;
}) {
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
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 56 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>{title}</h1>
        <p className="lead" style={{ marginTop: 12 }}>{lead}</p>
        <p className="tiny" style={{ marginTop: 12 }}>Last updated {updated}.</p>

        <div style={{ marginTop: 24, maxWidth: "var(--m-wide)" }}>
          <Notice tone="amber" head="Read this first: these are not lawyer-reviewed">
            <p style={{ margin: "0 0 8px" }}>
              This document was drafted with an AI assistant and has not been reviewed by a
              qualified lawyer. It describes how Veyro actually works, accurately and in good faith,
              but it is not a substitute for legal advice and should not be relied on as one.
            </p>
            <p style={{ margin: 0 }}>
              Veyro is not yet incorporated, so the governing jurisdiction below is a placeholder
              and will be replaced once that is settled. If you are relying on any of this for a
              decision that matters, say so at{" "}
              <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
          </Notice>
        </div>

        <div className="truthgrid" style={{ marginTop: 40, alignItems: "start" }}>
          {/* Contents. Sticky below the header on desktop; at ≤900px truthgrid
              collapses and this simply sits above the text. */}
          <nav aria-label="On this page" style={{ position: "sticky", top: "calc(var(--nav-h) + 16px)" }}>
            <h2 className="lp-eyebrow" style={{ marginBottom: 12 }}>On this page</h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {sections.map((s) => (
                <li key={s.n} style={{ marginBottom: 8 }}>
                  <a
                    className="linkbtn"
                    href={`#clause-${s.n}`}
                    style={{ fontSize: "var(--fs-3)", lineHeight: 1.4, display: "inline-block" }}
                  >
                    <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>
                      {s.n}.
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div style={{ maxWidth: "var(--m-wide)" }}>
            {children}

            <p className="tiny" style={{ marginTop: 40 }}>
              Questions about this page:{" "}
              <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
          </div>
        </div>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

/**
 * A numbered section of a legal document.
 *
 * scroll-margin-top keeps the sticky header off the heading when someone jumps
 * here from the contents list. Without it the header lands on top of the title
 * and you arrive mid-paragraph with no idea which clause you are in.
 */
export function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section
      id={`clause-${n}`}
      style={{ marginBottom: 32, scrollMarginTop: "calc(var(--nav-h) + 16px)" }}
    >
      <h2 className="h3" style={{ marginTop: 0, marginBottom: 8 }}>
        <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
