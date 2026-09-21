import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";

const SUPPORT_EMAIL = "hello@withveyro.com";

// Three columns, and nothing in them that is not a real page.
//
// The legal links are live because the pages exist; each says at the top that
// it is drafted rather than lawyer-reviewed. The year is computed, never
// hardcoded: a stale copyright line is a small thing that tells a visitor
// nobody is looking after the site.
const COLUMNS: { head: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    head: "Product",
    links: [
      { href: "/get-started", label: "Get started" },
      { href: "/docs/sdk", label: "Add Veyro to your app" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/wallet", label: "The Founder Wallet" },
      { href: "/check", label: "Check eligibility" },
      { href: "/for-founders", label: "For founders" },
      { href: "/for-guardians", label: "For parents" },
    ],
  },
  {
    head: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "Questions" },
      { href: "/contact", label: "Contact" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    head: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap-lp">
        <div className="footgrid">
          <div>
            <Wordmark size={18} />
            <p className="tiny" style={{ marginTop: 12, maxWidth: "32ch" }}>
              Financial infrastructure for young founders. Software, not a bank.
            </p>
            <p className="tiny" style={{ marginTop: 12 }}>
              <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.head}>
              <h3>{col.head}</h3>
              {col.links.map((l) => (
                <Link key={l.href} className="linkbtn footlink" href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <p className="tiny" style={{ marginTop: 32, maxWidth: "var(--m-body)" }}>
          &copy; {new Date().getFullYear()} Veyro. Veyro is software and does not hold customer
          funds. Payments are processed and settled by Stripe, and money moves between a customer
          and the founder&rsquo;s own connected account. Nothing here is legal or tax advice, and
          availability is set by the payment provider and can change.
        </p>
      </div>
    </footer>
  );
}
