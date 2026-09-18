import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { HeroPreview } from "@/app/_ui/HeroPreview";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { FAQ } from "@/app/_ui/faq";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. No client JS on the marketing surface: the section links
// are plain anchors and the FAQ is <details>, so everything below works with
// JavaScript switched off.
//
// currentUser() reads the session cookie, which opts this route out of static
// rendering. For anonymous traffic, which is nearly all of it, that costs a
// cookie read and no database query: currentUser() returns null before it
// touches the db.
//
// This page sells what Veyro does. It used to open by explaining Stripe's age
// policy, which is the answer to a question nobody has yet asked. The evidence
// still matters and still exists in full on /how-it-works: the verbatim Stripe
// reply, the country grading, and what they would not confirm. It is linked
// from here rather than argued here.

/** One row of the who-does-what list. */
function Role({ icon, who, children }: { icon: string; who: string; children: React.ReactNode }) {
  return (
    <li>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={14} />
        <strong style={{ fontSize: "var(--fs-3)" }}>{who}</strong>
      </span>
      <span className="small">{children}</span>
    </li>
  );
}

/**
 * One line of the wallet.
 *
 * These are the six fields CurrencyFold actually has. There is deliberately no
 * "Stripe fees" row: Stripe deducts its fee on its own side before the money
 * reaches the connected account's balance, and Veyro never sees the figure. A
 * fee line here would promise a number the ledger does not hold.
 */
function Flow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="reqrow">
      <div>
        <span className="req-t">{label}</span>
        <span className="req-d">{children}</span>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="disc">
      <summary className="disc-q">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{q}</span>
        <span className="disc-sign" aria-hidden="true" />
      </summary>
      <p className="disc-a">{children}</p>
    </details>
  );
}

export default async function Home() {
  // A revoked or expired session must still show "Sign in". Hiding it because
  // a stale cookie exists would strand someone who is, in fact, logged out.
  const user = await currentUser();

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="#roles">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/for-guardians">For parents</Link>
              {user ? (
                <Link className="btn btn-sm" href={defaultLandingFor(user.role)}>
                  Back to your dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-q btn-sm" href="/auth/signin">Sign in</Link>
                  <Link className="btn btn-sm" href="/check">Check eligibility</Link>
                </>
              )}
              <MobileNav
                items={[
                  { href: "#roles", label: "How it works" },
                  { href: "#wallet", label: "Where your money goes" },
                  { href: "/for-guardians", label: "For parents" },
                  { href: "/how-it-works", label: "What Stripe told us" },
                  { href: "#faq", label: "Questions" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">
        {/* ---------------- hero ---------------- */}
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="split-lead hero-grid">
              <div>
                <h1 className="hero-h">
                  <Wordmark hero />
                  <span className="tagline">You built the business. Now get paid.</span>
                </h1>

                <p className="lead" style={{ marginTop: "var(--sp-5)" }}>
                  Veyro helps young founders reach the financial infrastructure they need: a real
                  payment account, a clear ledger, and money that lands where it should.
                </p>

                <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/check">Check my eligibility</Link>
                  <Link className="btn btn-2 btn-lg" href="#roles">See how it works</Link>
                </div>

                <p className="tiny" style={{ marginTop: 12 }}>
                  Two questions. No account, no email address.
                </p>

                <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                  <div className="herofacts">
                    <div>
                      <span className="hf-n">13</span>
                      <span className="hf-l">
                        The real minimum age with a guardian on the account, not 18
                      </span>
                    </div>
                    <div>
                      <span className="hf-n">43</span>
                      <span className="hf-l">
                        Countries the payment provider supports for self-serve signup
                      </span>
                    </div>
                    <div>
                      <span className="hf-n">0%</span>
                      <span className="hf-l">
                        Veyro&rsquo;s cut of what you earn. Stripe&rsquo;s own fees still apply
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <HeroPreview />
            </div>
          </div>
        </div>

        {/* ---------------- why it exists ---------------- */}
        <section className="lp" id="why">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <span className="lp-eyebrow">Why this exists</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Building it was never the hard part.
                </h2>
              </div>
              <div>
                <p className="lp-lead">
                  I built Veyro after watching my brother hit the same wall over and over. Building
                  the business was the easy part. Getting the financial infrastructure to run it
                  wasn&rsquo;t.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  A capable fifteen-year-old can ship a product months before anyone will let them
                  charge for it. Veyro closes that gap.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  Mike Daniels &middot;{" "}
                  <Link className="linkbtn" href="/about">Read the full story</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- the roles ---------------- */}
        <section className="lp" id="roles">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Who does what</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Four parts, one order.</h2>
            <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 24 }}>
              Nothing can take a payment until each one is done. That sequence is the payment
              provider&rsquo;s, not ours.
            </p>

            <ol className="numbered">
              <Role icon="person" who="You">
                Own and build the business. It is yours, and nothing here transfers it to anyone.
              </Role>
              <Role icon="home" who="Your guardian">
                Completes the identity verification the provider requires, as the adult on the
                account. Needed while you are under 18.
              </Role>
              <Role icon="list" who="Veyro">
                Coordinates the steps, keeps your ledger, and records who agreed to what and when.
              </Role>
              <Role icon="card" who="Stripe">
                Processes the payments and settles the money into the account in your name.
              </Role>
            </ol>

            <p className="lp-note" style={{ marginTop: 20 }}>
              Availability and the exact requirements vary by country.{" "}
              <Link className="linkbtn" href="/check">The checker</Link> gives the answer for where
              you live, and{" "}
              <Link className="linkbtn" href="/how-it-works">/how-it-works</Link> quotes the
              provider&rsquo;s written policy in full.
            </p>
          </div>
        </section>

        {/* ---------------- the wallet ---------------- */}
        <section className="lp" id="wallet">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <span className="lp-eyebrow">Your money</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Where your money goes.
                </h2>
                <p className="body" style={{ marginTop: 16 }}>
                  Every figure is folded from your own records each time you look. No balance is
                  stored anywhere, so it cannot drift from the payments behind it.
                </p>
                <p className="small" style={{ marginTop: 16 }}>
                  Stripe takes its processing fee on its own side, before the money reaches your
                  balance. Veyro takes nothing.
                </p>
              </div>

              <div className="reqlist">
                <Flow label="Earned">A customer paid, and it cleared.</Flow>
                <Flow label="Still settling">Paid, not yet cleared by the provider.</Flow>
                <Flow label="Refunded">Sent back to a customer.</Flow>
                <Flow label="Committed">You have asked for it, so it cannot be spent twice.</Flow>
                <Flow label="Available">What you can request today.</Flow>
                <Flow label="Paid out">Already in the bank account on the payment account.</Flow>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- commitments ---------------- */}
        <section className="lp">
          <div className="wrap-lp">
            <span className="lp-eyebrow">What Veyro commits to</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 24 }}>
              Six things, all checkable.
            </h2>

            <div className="cardgrid">
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>Stripe verifies your guardian</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    They are notified of every payout request. They cannot block one, and neither
                    can anyone else on this account type.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>The money is never ours</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Customers pay your Stripe account directly. Veyro is not in the path of the
                    money and never holds a customer&rsquo;s funds.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>We never see your documents</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Identity and bank details go straight to Stripe&rsquo;s own form. Veyro stores a
                    reference to the account, nothing more.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>We take no percentage</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    No cut, no platform fee. Stripe charges its own processing fees, which Stripe
                    sets and deducts.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>The checker is free</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    No account, no email address. It tells you when the answer is no, and when you
                    do not need us at all.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>Software, not a bank</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Provider policy permits this route. No court has tested it, and we say so rather
                    than let you assume otherwise.
                  </p>
                </div>
              </div>
            </div>

            <p className="body" style={{ marginTop: 24 }}>
              <Link className="linkbtn" href="/about">
                All six in full, and what is not finished yet
              </Link>
            </p>
          </div>
        </section>

        <section className="lp" id="faq">
          <div className="wrap-lp">
            {/* truthgrid, like every other section on this page. Stacking the
                heading above a 76ch column left roughly half the width empty
                beside nine collapsed one-line questions, which read as a void
                rather than as breathing room. */}
            <div className="truthgrid" style={{ alignItems: "start" }}>
              <div>
                <span className="lp-eyebrow">Questions</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  The ones people actually ask.
                </h2>
                <p className="body" style={{ marginTop: 16 }}>
                  Short answers here. Where something is not built yet, it says so rather than
                  going quiet.
                </p>
                <p className="body" style={{ marginTop: 16 }}>
                  <Link className="linkbtn" href="/faq">
                    Every question, with the longer answers
                  </Link>
                </p>
              </div>

              <div>
                {FAQ.filter((f) => f.homepage).map((f) => (
                  <Faq key={f.q} q={f.q}>{f.a}</Faq>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- closing ---------------- */}
        <section className="lp">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Find out in twenty seconds.</h2>
            <p className="body" style={{ marginTop: 12, marginLeft: "auto", marginRight: "auto" }}>
              Two questions. No account, no email address. A straight answer, including the ones you
              might not want.
            </p>
            <div className="row" style={{ marginTop: 20, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/check">Check my eligibility</Link>
              {!user && <Link className="btn btn-2 btn-lg" href="/auth/signup">Create your account</Link>}
            </div>
          </div>
        </section>
      </main>

      <ScrollTop />
      <StickyCta label="Check my eligibility" note="Two questions. No account." />
      <SiteFooter />
    </div>
  );
}
