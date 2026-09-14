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

      <main id="main" className="wrap-n" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <h1 className="d2" style={{ maxWidth: "17ch" }}>
          Financial infrastructure for the next generation of founders.
        </h1>

        <p className="lead" style={{ marginTop: 16 }}>
          Veyro is the eligibility checker for teenage founders — two questions that tell you
          whether you can legally take payments where you live, and what it takes.
        </p>

        <p className="body" style={{ marginTop: 18 }}>
          Everyone says you have to be 18. We asked Stripe directly, and on 8 September 2026 they
          told us otherwise: a user who is at least 13 can create a Connect account, provided the
          parent or legal guardian involvement is completed through Stripe&rsquo;s own onboarding
          before the account takes charges or receives payouts. They confirmed the US, named Brazil
          as the one exception at 18+, and said requirements vary elsewhere. The checker is that
          answer, turned into something you can actually use.
        </p>

        <div className="row" style={{ marginTop: 26, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check what applies to you</Link>
          <Link className="btn btn-2 btn-lg" href="/how-it-works">How it works</Link>
          <Link className="btn btn-q btn-lg" href="/for-guardians">For parents</Link>
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
            Your guardian is notified of every payout request and keeps a permanent record of it.
            They do not get a veto. On the account type this is built on, nobody can build them
            one, and we would rather say so here than have you discover it later.
          </li>
          <li>
            Whether a minor may hold a payment account with a guardian as representative has not
            been confirmed by a lawyer in any country. Provider policy permitting it is not the same
            as it being settled where you live.
          </li>
        </ul>

        <div className="row" style={{ marginTop: 28, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" href="/check">Check what applies to you</Link>
          <Link className="btn btn-2" href="/how-it-works">Read what Stripe told us</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
