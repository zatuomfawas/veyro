import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";

// noindex, per SEO_ROUTES.notfound — a 404 should never be indexed.
export const metadata = buildMetadata("notfound");
export const viewport = buildViewport();

// Next's not-found convention. Anything that does not resolve lands here,
// including a mistyped URL and an expired link, so it offers the two places
// someone is most likely to have been heading: home, and the checker.
//
// (This previously noted that /terms and /privacy were unbuilt and landed
// here. They exist now.)
export default function NotFound() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="wrap-n">
        <div className="lp-nav">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <div className="lp-links">
            <Link className="btn btn-2 btn-sm" href="/check">Check eligibility</Link>
          </div>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <span className="lp-eyebrow">404</span>
        <h1 className="d2" style={{ marginTop: 8, maxWidth: "18ch" }}>
          That page isn&rsquo;t here.
        </h1>
        <p className="body" style={{ marginTop: 12 }}>
          Either the link is wrong, or it&rsquo;s a page we haven&rsquo;t written yet. Veyro is
          early, and we would rather leave a gap than fill it with something we haven&rsquo;t
          checked.
        </p>
        <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href="/check">Check what applies to you</Link>
          <Link className="btn btn-2" href="/how-it-works">Read how it works</Link>
          <Link className="btn btn-q" href="/">Back to home</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
