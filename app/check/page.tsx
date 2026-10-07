import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { PageNext } from "@/app/_ui/PageNext";
import CheckClient from "./CheckClient";

// Real Next.js metadata — server-rendered into the first byte of HTML, unlike
// prototype/veyro.jsx's useSEO() hook, which patches document.head from a
// useEffect after hydration and so is invisible to a crawler that doesn't run
// (or doesn't wait for) client JavaScript. See lib/seo.ts.
export const metadata = buildMetadata("check");
export const viewport = buildViewport();

// A public, standalone page: no auth, no database, no API calls. Everything the
// checker needs — country data, region overrides, the eligibility() routing
// logic — runs client-side in CheckClient, ported verbatim from the prototype.
//
// The page chrome lives here rather than inside CheckClient. It used to be a
// bespoke strip -- a centred wordmark with a "Back to home" button floating
// off to the right -- which made the one page a visitor is most likely to
// arrive on cold look like a different website: no nav, no theme toggle, no
// footer, nothing to click but back. The tool is the same; the frame around
// it is now the frame around everything else.
//
// CheckClient still renders standalone chrome when embedded={false} is never
// passed, so the landing page's inline copy is untouched.
export default function CheckPage() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-parents">For parents</Link>
              <Link className="btn btn-sm" href="/get-started">Start</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/for-parents", label: "For parents" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/faq", label: "Questions" },
                  { href: "/get-started", label: "Start" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main">
        <CheckClient />

        {/* The checker answers one question and then stopped dead. Whichever
            answer somebody got, there is a next move: a yes goes to signup,
            and a no is still owed the reason and a person to argue with. */}
        <div className="wrap-lp" style={{ paddingBottom: "var(--sp-9)" }}>
          <PageNext
            head="Got your answer?"
            lead="If it works where you live, the next step is about five minutes of your own
              and ten of a parent's. If it does not, the limit is the payment provider's rather
              than ours, and it is worth telling us where you are."
            primary={{ href: "/get-started", label: "See the whole path" }}
            secondary={{ href: "/for-parents", label: "The page for your parent" }}
            note="The checker reads published sources and no account is involved, so nothing you
              typed was stored."
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
