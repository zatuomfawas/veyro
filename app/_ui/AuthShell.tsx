import Link from "next/link";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";

// The frame both auth pages sit in. A Server Component, so the wordmark, the
// heading and the links are in the HTML before any JavaScript runs; only the
// form itself is a Client Component.
export function AuthShell({
  title, lead, children, footer, aside,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Optional extra context for the left column. */
  aside?: React.ReactNode;
}) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main" style={{ borderBottom: 0 }}>
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <Link className="btn btn-q btn-sm" href="/check">Check eligibility</Link>
          </nav>
        </div>
      </div>

      {/* Two columns on a desktop, like every other page here. A 720px column
          centred in a 1440px window left most of the screen empty beside a form
          that is already long. The heading, the lead and the footer move into
          the left column, which gives the width something to hold and keeps the
          form itself at a sensible measure rather than stretching the inputs.
          truthgrid collapses to one column at 900px. */}
      <main id="main" className="wrap-lp" style={{ marginTop: 8, marginBottom: 90 }}>
        <div className="truthgrid" style={{ alignItems: "start" }}>
          <div>
            <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>{title}</h1>
            <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>{lead}</p>
            <p className="small" style={{ marginTop: 16 }}>{footer}</p>
            {aside && <div style={{ marginTop: 24 }}>{aside}</div>}
          </div>

          <div className="card">
            <div className="card-b">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
