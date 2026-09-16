import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";

const SUPPORT_EMAIL = "hello@withveyro.com";

// One footer, shared. Server Component — no client JS on the marketing pages.
//
// The legal links are live now that the pages exist. They are drafted, not
// lawyer-reviewed, and each page says so at the top rather than implying more
// assurance than there is.
//
// The year is computed, never hardcoded: a stale copyright line is a small
// thing that tells a visitor nobody is looking after the site.
export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap-lp">
        <div className="row-b" style={{ flexWrap: "wrap", gap: 20 }}>
          <Wordmark size={18} />
          <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
            <Link className="linkbtn" href="/check">Check eligibility</Link>
            <Link className="linkbtn" href="/how-it-works">How it works</Link>
            <Link className="linkbtn" href="/for-guardians">For parents</Link>
            <Link className="linkbtn" href="/terms">Terms</Link>
            <Link className="linkbtn" href="/privacy">Privacy</Link>
            <Link className="linkbtn" href="/accessibility">Accessibility</Link>
            <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
          </div>
        </div>
        <p className="tiny" style={{ marginTop: 20, maxWidth: "var(--m-body)" }}>
          &copy; {new Date().getFullYear()} Veyro. Veyro is software, not a bank, and does not hold customer funds. Nothing here is legal or
          tax advice. Terms and availability are set by the payment provider and can change.
          Questions: <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </footer>
  );
}
