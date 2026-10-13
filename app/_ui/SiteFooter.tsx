import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";
import { SUPPORT_EMAIL } from "@/lib/support";


const COLUMNS: { head: string; links: { href: string; label: string }[] }[] = [
  {
    head: "Product",
    links: [
      { href: "/get-started", label: "Get started" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-parents", label: "For parents" },
      { href: "/docs/sdk", label: "Add Veyro to your app" },
      { href: "/check", label: "Check eligibility" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    head: "Help & company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "Questions" },
      { href: "/legal", label: "What is not settled" },
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
    <footer className="foot contrast-surface">
      <div className="wrap-lp">
        <div className="footgrid">
          <div className="ftr-brand">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={19} tile /></Link>
            <p className="small ftr-brand-note">
              Payments for young founders, with a guardian involved.
            </p>
            <p className="small ftr-contact">
              <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.head} aria-label={col.head}>
              <h2 className="ftr-col-title">{col.head}</h2>
              <ul className="ftr-links">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link className="linkbtn footlink" href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="foot-bottom">
          <p className="tiny ftr-copyright">&copy; {new Date().getFullYear()} Veyro.</p>
          <p className="tiny ftr-disclosure">
            Veyro is software and does not hold customer funds. Payments are processed and
            settled by Stripe, and money moves between a customer and the founder&rsquo;s own
            connected account. Nothing here is legal or tax advice, and availability is set
            by the payment provider and can change.
          </p>
        </div>
      </div>
    </footer>
  );
}
