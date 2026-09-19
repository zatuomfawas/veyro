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
      {/* The auth pages vary enormously in height: signup is six fields, sign-in
          is two, and the resend page is one. At a fixed top margin the short
          ones clung to the header with most of a tall window empty underneath.
          
          The main now fills the space the header leaves and the content centres
          within it. `margin-block: auto` rather than justify-content:center,
          because auto margins collapse on the overflow side, so a form taller
          than the window still starts at the top instead of having its heading
          clipped above the fold.
          
          100dvh, not 100vh: on a phone, vh ignores the browser chrome and would
          push the content below the fold by the height of the address bar. */}
      <main
        id="main"
        className="wrap-lp"
        style={{
          minHeight: "calc(100dvh - var(--nav-h))",
          display: "flex",
          flexDirection: "column",
          paddingBlock: "var(--sp-7)",
        }}
      >
        <div className="truthgrid" style={{ alignItems: "start", marginBlock: "auto", width: "100%" }}>
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
