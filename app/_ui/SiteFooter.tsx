import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";

const SUPPORT_EMAIL = "hello@withveyro.com";

// One footer, shared. Server Component — no client JS on the marketing pages.
//
// There are no Terms or Privacy links here. Those pages do not exist yet, and a
// footer link to a 404 is worse than an absent one — particularly on a product
// that handles money for minors, where those are exactly the pages a cautious
// parent goes looking for. They need writing properly, by someone qualified,
// before they are linked.
export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap-lp">
        <div className="row-b" style={{ flexWrap: "wrap", gap: 20 }}>
          <Wordmark size={18} />
          <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
            <Link className="linkbtn" href="/check">Check eligibility</Link>
            <Link className="linkbtn" href="/how-it-works">How it works</Link>
            <Link className="linkbtn" href="/for-guardians">For parents</Link>
            <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
          </div>
        </div>
        <p className="tiny" style={{ marginTop: 20, maxWidth: "var(--m-body)" }}>
          Veyro is software, not a bank, and does not hold customer funds. Nothing here is legal or
          tax advice. Terms and availability are set by the payment provider and can change.
          Questions: <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </footer>
  );
}
