import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";

export const metadata = buildMetadata("guardians");
export const viewport = buildViewport();

// The page a parent reads before they agree to anything. It is deliberately
// blunt about the parts that are inconvenient for us — the liability they take
// on, the veto they do not get, and the fact that no lawyer has tested this —
// because a guardian who finds those out afterwards is a guardian who was
// talked into something.

const SUPPORT_EMAIL = "hello@withveyro.com";

export default function ForGuardians() {
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
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "What Stripe told us" },
                  { href: "/check", label: "Check eligibility" },
                  { href: "/", label: "Home" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="wrap-lp" style={{ paddingTop: 40, paddingBottom: 90 }}>
        <span className="lp-eyebrow">For parents and guardians</span>
        <h1 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
          What you are being asked to agree to.
        </h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Someone under 18 has asked you to be the adult on their payment account. This page is what
          that means, written before you decide rather than after.
        </p>

        <div className="truthgrid" style={{ marginTop: 32 }}>
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>The short version</h2>
          </div>
          <div>
            <ul className="arrowlist" style={{ marginTop: 0 }}>
              <li>
                <strong>You are the verified person on the account.</strong> Stripe checks your
                identity, not theirs, and you accept Stripe&rsquo;s terms. The account cannot take a
                single payment until that is done.
              </li>
              <li>
                <strong>You do not own their business.</strong> Veyro keeps the ledger against the
                founder, and nothing here transfers what they build to you.
              </li>
              <li>
                <strong>You are notified of every payout request, and you cannot veto one.</strong>{" "}
                On this account type the provider gives nobody that power, so neither can we. You
                get visibility and a permanent record instead.
              </li>
              <li>
                <strong>Veyro never sees your documents.</strong> Identity and bank details go
                directly to Stripe&rsquo;s own form. We store a reference to the account, nothing more.
              </li>
            </ul>
          </div>
        </div>

        <hr className="rule" style={{ margin: "40px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What you take on</h2>
          </div>
          <div>
            <p className="body" style={{ marginTop: 0 }}>
              Being the named adult on a payment account is a real responsibility. Stripe holds the
              account holder accountable for what is sold through it, for refunds and chargebacks,
              and for the accuracy of what was told to them during verification. If the young
              person you are signing for sells something they do not deliver, it is your name on the
              account that the provider comes back to.
            </p>
            <p className="body" style={{ marginTop: 12 }}>
              That is not a reason to say no. It is the reason to say yes deliberately, having
              looked at what they are selling and agreed it is something you are comfortable being
              associated with.
            </p>
          </div>
        </div>

        <hr className="rule" style={{ margin: "40px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What is not settled</h2>
          </div>
          <div>
            <p className="body" style={{ marginTop: 0 }}>
              Stripe&rsquo;s written policy permits a 13-year-old to hold a Connect account where a
              parent or legal guardian completes their onboarding. That is provider policy, and we
              have it in writing. You can{" "}
              <Link className="linkbtn" href="/how-it-works">read their exact words</Link>.
            </p>
            <p className="body" style={{ marginTop: 12 }}>
              Whether a minor may hold such an account with a guardian as representative has{" "}
              <strong>not been confirmed by a lawyer in any country</strong>, including yours.
              Provider policy allowing something is not the same as it being settled where you live.
              We would rather you weighed that now than found it in a footnote later.
            </p>
          </div>
        </div>

        <hr className="rule" style={{ margin: "40px 0" }} />

        <div className="truthgrid">
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>What happens next</h2>
          </div>
          <div>
            <ol className="numbered">
              <li>
                <strong style={{ fontSize: "var(--fs-3)" }}>You get a link</strong>
                <span className="small">
                  Sent to you by the founder. It opens a page explaining the same things as this one,
                  with Accept and Decline.
                </span>
              </li>
              <li>
                <strong style={{ fontSize: "var(--fs-3)" }}>You sign in as yourself</strong>
                <span className="small">
                  With your own account, using your own email. This is what ties the consent to a
                  real adult rather than to whoever opened the link.
                </span>
              </li>
              <li>
                <strong style={{ fontSize: "var(--fs-3)" }}>You complete Stripe&rsquo;s form</strong>
                <span className="small">
                  Identity details and a bank account for payouts, entered on Stripe&rsquo;s site.
                  Veyro is not in the middle of it.
                </span>
              </li>
              <li>
                <strong style={{ fontSize: "var(--fs-3)" }}>They can sell</strong>
                <span className="small">
                  You keep a dashboard showing their products, their balance, and every payout they
                  ask for.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="card" style={{ marginTop: 40 }}>
          <div className="card-b">
            <h2 className="h4" style={{ marginTop: 0 }}>If you would rather not</h2>
            <p className="body">
              Declining is a normal answer and the page offers it as plainly as accepting. Nothing
              happens to the founder&rsquo;s account except that it cannot take payments, and they can
              ask you again later.
            </p>
            <p className="small" style={{ marginBottom: 0 }}>
              Questions first? Email{" "}
              <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and a person
              will answer.
            </p>
          </div>
        </div>

        <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn" href="/how-it-works">Read what Stripe told us</Link>
          <Link className="btn btn-2" href="/check">Check if this applies where you live</Link>
        </div>
      </main>

      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
