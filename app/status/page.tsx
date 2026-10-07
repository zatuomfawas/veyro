import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { PageNext } from "@/app/_ui/PageNext";

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
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />
      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm" href="/contact">Contact</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* A board, not a list.
          ------------------------------------------------------------------
          Every other page on this site is something to read. This one is
          something to check, and a reader arrives at it mid-problem wanting
          one answer in one glance: is it them, or is it us. Prose in a 70ch
          column was the wrong instrument -- it made someone read four
          paragraphs to find out there is nothing to report.

          Four cards, each stating its own monitoring honestly. Veyro's own
          row says "not measured" rather than green, because a status page
          that reports green without measuring anything is a claim, and the
          first outage proves it was never checked. */}
      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 56 }}>
        <div className="stat-h">
          <div>
            <span className="lp-eyebrow">Status</span>
            <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "16ch" }}>
              What Veyro runs on.
            </h1>
          </div>
          <p className="stat-lead">
            Veyro has no uptime monitoring yet, so there is no health light for our own
            application and no uptime percentage here. The providers that do publish real
            monitoring are linked below. If something is not working,{" "}
            <a className="linkbtn" href={`mailto:${EMAIL}`}>email us</a> and you will get a real
            answer about what is happening.
          </p>
        </div>

        <ul className="statgrid">
          {DEPENDENCIES.map((d) => (
            <li className="statcard" data-monitored={d.monitored ? "1" : "0"} key={d.name}>
              <div className="statcard-h">
                <span className="statcard-n">{d.name}</span>
                <span className={"badge " + (d.monitored ? "b-slate" : "b-grey")}>
                  {d.monitored ? "Provider status" : "Not measured"}
                </span>
              </div>
              <p className="statcard-r">{d.role}</p>
              {d.href ? (
                <a className="linkbtn statcard-l" href={d.href} target="_blank" rel="noreferrer noopener">
                  Their status page
                </a>
              ) : (
                <span className="statcard-l tiny">Measured by nobody, including us.</span>
              )}
            </li>
          ))}
        </ul>

        <div className="statnote">
          <h2 className="h4" style={{ marginTop: 0 }}>If a payment looks wrong</h2>
          <p className="body" style={{ margin: "var(--sp-3) 0 0", maxWidth: "var(--m-body)" }}>
            Veyro never holds your money, so a missing payment or a delayed payout is almost
            always something happening at Stripe rather than here. Your wallet is folded from
            records Veyro keeps, so it can also be behind if a webhook was delayed. Either way,
            send the payment reference and we will tell you which it is.
          </p>
        </div>

        <PageNext
          head="Something looking wrong?"
          lead="This page lists what Veyro runs on, not whether your payment arrived. If a
            specific payment looks wrong, the fastest route is a person with the reference."
          primary={{ href: "/contact", label: "Tell us what you are seeing" }}
          secondary={{ href: "/how-it-works", label: "Where a payment sits" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
