import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { defaultLandingFor } from "@/lib/next-path";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink, Icon } from "@/app/_ui/marks";
import { HeroPreview } from "@/app/_ui/HeroPreview";
import { SiteFooter } from "@/app/_ui/SiteFooter";

export const metadata = buildMetadata("landing");
export const viewport = buildViewport();

// Server Component. No client JS on the marketing surface — the section links
// are plain anchors and the FAQ is <details>, so everything below works with
// JavaScript switched off.
//
// currentUser() reads the session cookie, which opts this route out of static
// rendering. For anonymous traffic, which is nearly all of it, that costs a
// cookie read and no database query: currentUser() returns null before it
// touches the db.

const REPLY_DATE = "8 September 2026";

const Q_CORE =
  "A user who is at least 13 years old can create a Connect account, and where the user is "
  + "under 18, the required parent or legal guardian involvement must be completed through "
  + "Stripe's onboarding process before the account can accept charges or receive payouts.";

/** One step of the four-step explanation. */
function Step({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <li>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Icon name={icon} size={14} />
        <strong style={{ fontSize: "var(--fs-3)" }}>{title}</strong>
      </span>
      <span className="small">{children}</span>
    </li>
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
  // A revoked or expired session must still show "Sign in" — hiding it because
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
              <Link className="btn btn-q btn-sm hide-s" href="#how">How it works</Link>
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
            </div>
          </nav>
        </div>
      </div>

      <main id="main">
        {/* ---------------- hero ---------------- */}
        <div className="hero-band">
          <div className="wrap-lp hero">
            <div className="split-lead hero-grid">
              <div>
                <h1 className="hero-h">
                  <Wordmark hero />
                  <span className="tagline">
                    Financial infrastructure for the next generation of founders.
                  </span>
                </h1>

                <p className="foldwho">
                  For founders aged 13 to 17 who have built something worth charging for
                </p>

                <p className="lead" style={{ marginTop: "var(--sp-4)" }}>
                  <strong>Everyone says you have to be 18. You don&rsquo;t.</strong> We asked Stripe
                  directly, and they told us a 13-year-old can hold a payment account, provided a
                  parent or guardian completes the provider&rsquo;s own checks first. Veyro is the
                  route through that: it works out whether it applies where you live, gets your
                  guardian to yes, and keeps the record of who agreed to what.
                </p>

                <ul className="foldwhy">
                  <li><strong>Free to find out.</strong> Two questions, no account, no email.</li>
                  <li><strong>Your parent gets a real explanation</strong>, not a link and a shrug.</li>
                  <li><strong>Veyro never holds your money.</strong> It settles to your own account.</li>
                </ul>

                <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                  <Link className="btn btn-2 btn-lg" href="#how">Learn how it works</Link>
                </div>

                <p className="tiny" style={{ marginTop: 12 }}>
                  About twenty seconds. If the answer is no, it says so plainly. If you
                  don&rsquo;t need us at all, it says that too.
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
                        Countries the provider supports for self-serve signup
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

        {/* ---------------- the claim ---------------- */}
        <section className="lp" id="truth">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <span className="lp-eyebrow">Can I actually do this?</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Most answers online are wrong.
                </h2>
              </div>
              <div>
                <p className="lp-lead">
                  Search whether you can take payments under 18 and you will be told no, repeatedly,
                  by people who have not checked. So we asked the payment provider directly and got
                  it in writing.
                </p>
                <p className="body" style={{ marginTop: 12 }}>
                  The answer is more specific than a yes or a no, and the specifics are the whole
                  product: an age floor of 13 rather than 18, a guardian who is verified rather than
                  merely asked, one country carved out entirely, and everywhere else sitting under
                  &ldquo;requirements may vary&rdquo;. That is what the checker encodes.
                </p>
                <div className="row" style={{ marginTop: 16, gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn" href="/check">Check what applies to you</Link>
                  <Link className="btn btn-2" href="/how-it-works">Read what Stripe told us</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- the process ---------------- */}
        <section className="lp" id="how">
          <div className="wrap-lp">
            <span className="lp-eyebrow">The process</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Four steps, in order.</h2>
            <p className="sec-lead body" style={{ marginTop: 12, marginBottom: 24 }}>
              Nothing can take a payment until every one of them is done. That is the provider&rsquo;s
              rule, not ours, and it is the part most guides skip.
            </p>

            <ol className="numbered">
              <Step icon="person" title="Create your account">
                Thirteen or over, with your real date of birth. The age rules turn on the exact
                date, so a year on its own is not enough.
              </Step>
              <Step icon="home" title="Invite your guardian">
                You send them a link. They sign in as themselves, read what they are taking on, and
                accept or decline. Nothing is assumed on their behalf.
              </Step>
              <Step icon="check" title="Your guardian is verified">
                They complete the provider&rsquo;s own identity form, as the adult on the account.
                Veyro never sees identity documents or bank details. They go straight to Stripe.
              </Step>
              <Step icon="wallet" title="Take payments">
                Your products get a checkout link. Money settles to the connected account, and your
                guardian is notified of every payout request.
              </Step>
            </ol>

            <p className="lp-note" style={{ marginTop: 20 }}>
              Your guardian is <strong>notified</strong> of payout requests and keeps a permanent
              record of them. They do not get a veto. On this account type nobody can build them
              one, and we would rather say so here than have either of you discover it later.
            </p>
          </div>
        </section>

        {/* ---------------- what Stripe said ---------------- */}
        <section className="lp lp-dark">
          <div className="wrap-lp">
            <span className="lp-eyebrow">In their own words</span>
            {/* Flush left, like the eyebrow, attribution and button around it. It
                previously carried a 2px left border and 20px of padding, which made
                it the only element in the section indented from the section edge.
                The border also referenced var(--accent), a token that does not
                exist, so an invalid value fell back to currentColor and drew a
                near-white bar on the dark band. The quotation marks and the larger
                size mark this as a quote; it does not need a rule as well. */}
            <blockquote
              style={{
                margin: "var(--sp-4) 0 0",
                padding: 0,
                color: "var(--reverse)",
                fontSize: "var(--fs-5)",
                lineHeight: 1.5,
                maxWidth: "var(--m-wide)",
              }}
            >
              &ldquo;{Q_CORE}&rdquo;
            </blockquote>
            <p className="tiny" style={{ color: "var(--reverse)", opacity: 0.72, marginTop: 12 }}>
              Stripe Support, {REPLY_DATE}, in reply to our question. The full exchange, including
              what they would not confirm, is on the next page.
            </p>
            <div className="row" style={{ marginTop: 20, gap: 8, flexWrap: "wrap" }}>
              <Link className="btn btn-2" href="/how-it-works">Read the full reply</Link>
            </div>
          </div>
        </section>

        {/* ---------------- what Veyro is ---------------- */}
        <section className="lp">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Why Veyro</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 24 }}>
              Three things worth knowing before you start.
            </h2>

            <div className="cardgrid">
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>Your guardian consents once</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    They become the verified adult on the payment account and accept the
                    provider&rsquo;s terms. They do not own your business, and Veyro keeps a separate
                    ledger so that stays obvious.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>The money is never ours</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    Veyro is software, not a bank. Payments go directly to the connected account at
                    the regulated provider. We never hold a customer&rsquo;s money, and we take no
                    percentage of it.
                  </p>
                </div>
              </div>
              <div className="card">
                <div className="card-b">
                  <h3 className="h4" style={{ marginTop: 0 }}>You find out before anyone asks</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    The checker is free and needs no account. If your country is closed to this, or
                    you are old enough not to need us, it tells you instead of signing you up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- questions ---------------- */}
        <section className="lp" id="faq">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Questions</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", marginBottom: 20 }}>
              The ones people actually ask.
            </h2>

            <div style={{ maxWidth: "var(--m-wide)" }}>
              <Faq q="Does my parent own my business?">
                No. They are the verified adult on the payment account, which is what the provider
                requires. Ownership of what you build is not something Veyro assigns to anyone, and
                the ledger is kept against you, not them.
              </Faq>
              <Faq q="Can my guardian stop a payout?">
                No, and we will not pretend otherwise. On the account type this is built on, the
                guardian is notified of every payout request and keeps a permanent record, but the
                provider gives nobody a veto, so neither can we.
              </Faq>
              <Faq q="Does Veyro see my identity documents?">
                Never. Identity checks happen on the provider&rsquo;s own hosted form. Veyro stores a
                reference to the account, not the documents, and not your bank details.
              </Faq>
              <Faq q="What does it cost?">
                Veyro takes no percentage of what you earn. The payment provider charges its own
                fees on each transaction, which are theirs and are set by them.
              </Faq>
              <Faq q="Is this settled law?">
                No. Provider policy permitting a minor to hold an account with a guardian as the
                verified adult is not the same as it being tested in court where you live. No lawyer
                has confirmed it in any country, and we would rather write that here than let you
                assume otherwise.
              </Faq>
            </div>
          </div>
        </section>

        {/* ---------------- closing ---------------- */}
        <section className="lp">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Find out in twenty seconds.</h2>
            <p className="body" style={{ marginTop: 12, marginLeft: "auto", marginRight: "auto" }}>
              Two questions, no account, no email address. You will get a straight answer, including
              the ones you may not want.
            </p>
            <div className="row" style={{ marginTop: 20, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg" href="/check">Check eligibility</Link>
              {!user && <Link className="btn btn-2 btn-lg" href="/auth/signup">Create your account</Link>}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
