import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { SkipLink } from "@/app/_ui/marks";
import { SiteNav } from "@/app/_ui/SiteNav";
import { SiteFooter } from "@/app/_ui/SiteFooter";

// noindex, per SEO_ROUTES.notfound — a 404 should never be indexed.
export const metadata = buildMetadata("notfound");
export const viewport = buildViewport();

// Next's not-found convention, and the only thing that reaches it is a route
// that genuinely does not resolve: a mistyped URL, an expired link, or the one
// explicit notFound() in app/dashboard/founder/preview/[productId], which fires
// when a product id is not this founder's. It is not a catch-all. A thrown
// error does not land here, and nothing is routed through it to save writing a
// real state somewhere else.
//
// THE REASSURANCE IS THE POINT, and it is the one line on this page that is
// specific to what Veyro is. A dead link on a blog costs a reader five
// seconds. A dead link on something holding a teenager's earnings makes them
// wonder whether a payment failed, whether the link they sent a customer is
// broken, or whether an account has been closed. Saying plainly that nothing
// changed is worth more here than anything clever, and it is free to say
// because it is true: a 404 is a routing miss and touches nothing.
//
// WHAT CAME OUT. The old copy said the page might be "a page we haven't
// written yet. Veyro is early, and a gap is better than something we have not
// checked." That was written when /terms and /privacy genuinely did not exist.
// They do, and a site asking a parent to attach their legal identity should
// not greet them with an admission that bits of it are missing. Being early is
// not a reason to sound unfinished at the one moment a visitor is already
// unsure whether the thing works.
//
// Two actions, not three. It offered a primary, a secondary and a quiet third,
// which is a menu rather than a recovery. The list underneath is the menu, and
// it is there because the most useful thing on a 404 is somewhere to go.

const PLACES = [
  { href: "/how-it-works", label: "How it works", note: "What Veyro does, and what it sits on" },
  { href: "/for-parents", label: "For parents", note: "What an adult takes on" },
  { href: "/pricing", label: "Pricing", note: "The fee in full, with worked examples" },
  { href: "/faq", label: "Questions", note: "Cost, countries, and what happens at 18" },
];

export default function NotFound() {
  return (
    <div className="fw public-page">
      <SkipLink />

      <SiteNav />

      <main id="main" className="wrap-n nf">
        <h1 className="d2 nf-h">That page isn&rsquo;t here.</h1>
        <p className="lead nf-l">
          The link is wrong, or the page has moved. Nothing on your account has changed, no
          payment was affected, and any checkout link you have already sent still works.
        </p>

        <div className="nf-cta">
          <Link className="btn btn-lg" href="/">Back to home</Link>
          <Link className="hero-alt" href="/check">Check eligibility</Link>
        </div>

        <div className="nf-places">
          <p className="nf-k">If you were looking for one of these</p>
          <ul className="nf-list">
            {PLACES.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>
                  <span className="nf-t">{p.label}</span>
                  <span className="nf-n">{p.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
