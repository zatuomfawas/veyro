import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. No client JS on the marketing surface.

export default function Home() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="wrap-n">
        <div className="lp-nav">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <div className="lp-links">
            <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
            <Link className="btn btn-2 btn-sm" href="/check">Check eligibility</Link>
          </div>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <Wordmark hero />
        <h1 className="d2" style={{ marginTop: 22, maxWidth: "17ch" }}>
          Financial infrastructure for the next generation of founders.
        </h1>

        <p className="lead" style={{ marginTop: 16 }}>
          Veyro is the financial layer for people old enough to build a business and too young to
          open the account that takes its money.
        </p>

        <p className="body" style={{ marginTop: 18 }}>
          Almost every payment provider requires the person holding the account to be an adult,
          because that person passes the identity checks and carries the liability. That much is
          real. What is not real is the thing the internet repeats: that you have to be 18.
          Stripe&rsquo;s own terms put the floor at 13, provided a legal guardian is the adult named
          on the account. Veyro is the route through that — it gives your guardian what they need to
          make an informed decision, puts them on the account properly, and keeps a ledger and a
          permanent record that both of you can see.
        </p>

        <div className="row" style={{ marginTop: 26, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check if you&rsquo;re eligible</Link>
          <Link className="btn btn-2 btn-lg" href="/how-it-works">Learn how it works</Link>
        </div>
        <p className="tiny" style={{ marginTop: 12 }}>
          The check takes about twenty seconds. No account, no email address.
        </p>

        <hr className="rule" style={{ margin: "44px 0 28px" }} />

        <h2 className="h3">What Veyro is, and what it isn&rsquo;t</h2>
        <ul className="arrowlist" style={{ marginTop: 14 }}>
          <li>
            Veyro is software, not a bank. It never holds your customers&rsquo; money — the
            regulated payment provider does, until a payout reaches the connected bank account.
          </li>
          <li>
            Your guardian is the named adult on the payment account. They are not the owner of your
            business, and Veyro keeps a separate ledger so that stays obvious.
          </li>
          <li>
            Your guardian is notified of every payout and keeps a permanent record of it. They do
            not get a veto. On the account type this is built on, nobody can build them one, and we
            would rather say so here than discover it together later.
          </li>
          <li>
            Whether a minor may hold a payment account with a guardian as representative has not
            been confirmed by a lawyer in any country. Provider policy permitting it is not the same
            as it being settled where you live.
          </li>
        </ul>

        <div className="row" style={{ marginTop: 28, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" href="/check">Check what applies to you</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
