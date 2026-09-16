import Link from "next/link";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";

// The frame both auth pages sit in. A Server Component, so the wordmark, the
// heading and the links are in the HTML before any JavaScript runs; only the
// form itself is a Client Component.
export function AuthShell({
  title, lead, children, footer,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-s">
          <nav className="lp-nav" aria-label="Main" style={{ borderBottom: 0 }}>
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <Link className="btn btn-q btn-sm" href="/check">Check eligibility</Link>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>{title}</h1>
        <p className="body" style={{ marginTop: 8, fontSize: "var(--fs-4)" }}>{lead}</p>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-b">{children}</div>
        </div>

        <p className="small" style={{ marginTop: 16 }}>{footer}</p>
      </main>
    </div>
  );
}
