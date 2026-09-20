import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { Notice } from "@/app/_ui/form";

export const viewport = buildViewport();
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veyro system status",
  description: "What Veyro depends on, what is monitored, and what is not.",
  alternates: { canonical: SITE + "/status" },
  robots: { index: true, follow: true },
};

const EMAIL = "hello@withveyro.com";

// A status page that reports green without measuring anything is worse than no
// status page: it is a claim, and the first outage proves it was never checked.
//
// There is no uptime monitoring on this project. So this page does not show a
// health indicator per component and does not print an uptime percentage. It
// lists what the product depends on, links to the status pages of the providers
// that DO publish real monitoring, and says plainly that Veyro's own is not
// measured yet. When monitoring exists, this page can start making claims.
const DEPENDENCIES = [
  {
    name: "Veyro application",
    role: "The website, the dashboards and the API.",
    monitored: false,
    href: null,
  },
  {
    name: "Stripe",
    role: "Identity verification, payments, balances and payouts. All money movement.",
    monitored: true,
    href: "https://status.stripe.com",
  },
  {
    name: "Vercel",
    role: "Hosting and delivery for everything above.",
    monitored: true,
    href: "https://www.vercel-status.com",
  },
  {
    name: "Neon",
    role: "The PostgreSQL database holding accounts, products and the ledger.",
    monitored: true,
    href: "https://neonstatus.com",
  },
];

export default function Status() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />
      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm" href="/contact">Contact</Link>
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 40, paddingBottom: 56 }}>
        <span className="lp-eyebrow">Status</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>What Veyro runs on.</h1>

        <div style={{ marginTop: 24 }}>
          <Notice tone="amber" head="Veyro does not have uptime monitoring yet">
            <p style={{ margin: "0 0 8px" }}>
              So this page shows no health lights for our own application and no uptime percentage.
              A status page that reports green without measuring anything is a claim, not a status,
              and the first outage would prove it was never checked.
            </p>
            <p style={{ margin: 0 }}>
              If something is not working, email{" "}
              <a className="linkbtn" href={`mailto:${EMAIL}`}>{EMAIL}</a> and you will get a real
              answer about what is happening.
            </p>
          </Notice>
        </div>

        <h2 className="h3" style={{ marginTop: 40 }}>Dependencies</h2>
        <div className="reqlist" style={{ marginTop: 16 }}>
          {DEPENDENCIES.map((d) => (
            <div className="reqrow" key={d.name}>
              <div>
                <span className="req-t">
                  {d.name}{" "}
                  {d.monitored
                    ? <span className="badge b-slate" style={{ marginLeft: 8 }}>Provider status</span>
                    : <span className="badge b-grey" style={{ marginLeft: 8 }}>Not monitored</span>}
                </span>
                <span className="req-d">
                  {d.role}
                  {d.href && (
                    <>
                      {" "}
                      <a className="linkbtn" href={d.href} target="_blank" rel="noreferrer noopener">
                        Their status page
                      </a>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="h3" style={{ marginTop: 40 }}>If a payment looks wrong</h2>
        <p className="body" style={{ marginTop: 12 }}>
          Veyro never holds your money, so a missing payment or a delayed payout is almost always
          something happening at Stripe rather than here. Your wallet is folded from records Veyro
          keeps, so it can also be behind if a webhook was delayed. Either way, email us with the
          payment reference and we will tell you which it is.
        </p>

        <p className="tiny" style={{ marginTop: 32 }}>
          <Link className="linkbtn" href="/contact">Contact</Link> &middot;{" "}
          <Link className="linkbtn" href="/about">What is not finished yet</Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
