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

/**
 * Shared chrome for the three legal pages.
 *
 * `updated` is a real date passed by each page and changed by hand when the
 * text changes. It is not derived from the file's mtime or the build time:
 * both of those move when nothing about the policy has changed, which turns a
 * date people rely on into noise.
 */
export function LegalShell({
  title, lead, updated, children,
}: {
  title: string;
  lead: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <ScrollProgress />
      <SkipLink />

      <div className="navbar">
        <div className="wrap-n">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 40, paddingBottom: 72 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>{title}</h1>
        <p className="lead" style={{ marginTop: 12 }}>{lead}</p>
        <p className="tiny" style={{ marginTop: 12 }}>Last updated {updated}.</p>

        <div style={{ marginTop: 24 }}>
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

        <div style={{ marginTop: 32, maxWidth: "var(--m-body)" }}>{children}</div>

        <p className="tiny" style={{ marginTop: 40 }}>
          Questions about this page:{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}

/** A numbered section of a legal document. */
export function Clause({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="h3" style={{ marginTop: 0, marginBottom: 8 }}>
        <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
