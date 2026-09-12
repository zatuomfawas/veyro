import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";

// One footer, shared. Server Component — no client JS on the marketing pages.
export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap-n">
        <div className="row-b" style={{ flexWrap: "wrap", gap: 20 }}>
          <Wordmark size={18} />
          <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
            <Link className="linkbtn" href="/check">Check eligibility</Link>
            <Link className="linkbtn" href="/how-it-works">How it works</Link>
            <Link className="linkbtn" href="/terms">Terms</Link>
            <Link className="linkbtn" href="/privacy">Privacy</Link>
          </div>
        </div>
        <p className="tiny" style={{ marginTop: 20, maxWidth: "var(--m-body)" }}>
          Veyro is software, not a bank, and does not hold customer funds. Nothing here is legal or
          tax advice. Terms and availability are set by the payment provider and can change.
        </p>
      </div>
    </footer>
  );
}
