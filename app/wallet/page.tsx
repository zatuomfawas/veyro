import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import type { CurrencyFold } from "@/lib/ledger";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { MoneyPosition } from "@/app/_ui/MoneyPosition";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "The Founder Wallet: see exactly where your money is",
  description:
    "What you collected, what Stripe took, what was refunded, and where the rest of it sits. "
    + "Every figure folded from your own payment records.",
  alternates: { canonical: SITE + "/wallet" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "The Founder Wallet",
    description: "See exactly where your money is, and what happened to it on the way.",
    url: SITE + "/wallet",
  },
};

// Example figures, internally consistent and labelled as examples everywhere
// they appear. They are NOT a screenshot of anyone's account and not a claim
// about typical earnings.
//
// The arithmetic is real, and is the same arithmetic foldWallet performs. Note
// that `earned` is gross: it includes the 10000 that was later refunded, which
// is why refunding it again below is not double-counting.
//   net       = 150000 - 10000 - 5000          = 135000
//   available = 150000 - 10000 - 25000 - 42000 = 73000
const EXAMPLE: CurrencyFold = {
  currency: "USD",
  earned: 150_000,
  refunded: 10_000,
  fees: 5_000,
  feesPending: 0,
  net: 135_000,
  pending: 10_000,
  reserved: 25_000,
  paidOut: 42_000,
  available: 73_000,
};

export default function WalletPage() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/for-founders", label: "For founders" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/faq", label: "Questions" },
                  { href: "/check", label: "Check eligibility" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp has-sticky" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <span className="lp-eyebrow">The Founder Wallet</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          See exactly where your money is.
        </h1>
        <p className="lead" style={{ marginTop: 16 }}>
          A customer pays you $120. Not all of it is yours, not all of what is yours is available
          yet, and most tools show you one number and leave you to guess which. The wallet shows the
          whole path.
        </p>

        <div className="truthgrid" style={{ marginTop: 40, alignItems: "start" }}>
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>The whole path</h2>
            <p className="body" style={{ marginTop: 12 }}>
              Every figure is folded from your own transaction records each time you open the page.
              No balance is stored anywhere, so what you see cannot drift away from the payments
              behind it.
            </p>
            <p className="small" style={{ marginTop: 16 }}>
              The fee comes from Stripe, read off the charge rather than calculated from a
              percentage. A percentage would be wrong the moment a card is international.
            </p>
            <p className="small" style={{ marginTop: 16 }}>
              When Stripe has not settled a fee yet, the wallet says the total is a floor instead of
              showing an incomplete number as if it were final.
            </p>
          </div>

          <MoneyPosition fold={EXAMPLE} example />
        </div>

        <hr className="rule" style={{ margin: "48px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>Net is not the same as available</h2>
          </div>
          <div style={{ maxWidth: "var(--m-wide)" }}>
            <p className="body" style={{ marginTop: 0 }}>
              These answer different questions, and treating them as one number is how a founder
              ends up expecting money that was never there.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              <strong>Net revenue</strong> is what you keep: collected, minus Stripe&rsquo;s fee,
              minus anything refunded. It is the figure that matters when you are working out
              whether the business makes money.
            </p>
            <p className="body" style={{ marginTop: 16 }}>
              <strong>Available</strong> is what you can request today. It excludes money still
              settling, and money already committed to a payout you asked for. Stripe takes its fee
              before the money reaches your account, so the fee was never in a balance you could
              withdraw.
            </p>
          </div>
        </div>

        <hr className="rule" style={{ margin: "48px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What each state means</h2>
          </div>
          <div className="reqlist" style={{ maxWidth: "var(--m-wide)" }}>
            {[
              ["Collected", "A customer paid and the payment cleared. This is the gross amount, before anything is deducted."],
              ["Stripe fees", "What the payment provider charged to process it. Read from Stripe, not estimated."],
              ["Refunded", "Money sent back to a customer. Subtracted from what you keep."],
              ["Still settling", "Paid, but not yet cleared by the provider. It is coming; it is not spendable."],
              ["Committed", "You have requested a payout of this amount, so it is held aside and cannot be requested twice."],
              ["Available", "What you can ask to be paid out right now."],
              ["Paid out", "Already sent to the bank account on the payment account."],
            ].map(([label, meaning]) => (
              <div className="reqrow" key={label}>
                <div>
                  <span className="req-t">{label}</span>
                  <span className="req-d">{meaning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 48 }}>
          <div className="card-b">
            <h2 className="h4" style={{ marginTop: 0 }}>Where the money actually sits</h2>
            <p className="body">
              Veyro never holds it. A customer pays your Stripe account directly, Stripe holds the
              balance, and Stripe pays it out to the bank account registered on that account. Veyro
              keeps the record and shows you the position; it is not in the path of the money.
            </p>
            <p className="small" style={{ marginBottom: 0 }}>
              That is a deliberate architectural choice, and it is why Veyro is software rather than
              a financial institution. <Link className="linkbtn" href="/about">More on that</Link>.
            </p>
          </div>
        </div>

        <div className="row" style={{ marginTop: 40, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check my eligibility</Link>
          <Link className="btn btn-2 btn-lg" href="/how-it-works">How the setup works</Link>
        </div>
      </main>

      <ScrollTop />
      <StickyCta label="Check my eligibility" note="Two questions. No account." />
      <SiteFooter />
    </div>
  );
}
