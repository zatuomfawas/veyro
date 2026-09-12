import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import Link from "next/link";

export const metadata = buildMetadata("how");
export const viewport = buildViewport();

// A Server Component on purpose. The whole point of this page is that a
// crawler reads the argument without executing a line of JavaScript, so
// there is no "use client" here and no interactivity beyond links.

const UPDATED = "13 September 2026";

export default function HowItWorks() {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />

      <div className="wrap-n">
        <div className="lp-nav">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <div className="lp-links">
            <Link className="btn btn-2 btn-sm" href="/check">Check what applies to you</Link>
          </div>
        </div>
      </div>

      <main id="main" className="wrap-n" style={{ paddingTop: 44, paddingBottom: 90 }}>
        <span className="lp-eyebrow">Research</span>
        <h1 className="d2" style={{ marginTop: 10, maxWidth: "20ch" }}>
          We asked Stripe whether under-18s can take payments. Here&rsquo;s their answer.
        </h1>
        <p className="lead" style={{ marginTop: 14 }}>
          The internet is confident and wrong about this. The provider&rsquo;s own terms are public,
          specific, and say something different. Here is what they say, what we asked, and what
          building on it actually involved.
        </p>
        <p className="tiny" style={{ marginTop: 14 }}>Last checked {UPDATED}. Not legal or tax advice.</p>

        <hr className="rule" style={{ margin: "32px 0" }} />

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3">What everyone else says</h2>
        <p className="body" style={{ marginTop: 10 }}>
          Search it and the answer comes back unanimous: you have to be 18 to accept online
          payments. Forums say it. Blog posts say it. Ask an AI assistant and it will tell you the
          same thing, confidently, without a source.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          It is wrong. Not wildly wrong — it is true of most routes you might try, and true of the
          ones people usually try first. But it is false in the one case that matters, and nobody
          writes about that case because it is unglamorous and involves asking a parent.
        </p>

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3" style={{ marginTop: 36 }}>What Stripe&rsquo;s agreement actually says</h2>
        <p className="body" style={{ marginTop: 10 }}>
          Two documents, both public, both checkable in about five minutes.
        </p>
        <dl className="ruled" style={{ marginTop: 20 }}>
          <div>
            <dt>Stripe Services Agreement</dt>
            <dd>
              Under Age Restrictions, the floor is 13, not 18. A user under 18 may hold an account
              provided an adult Representative is added to it — an adult who accepts liability for
              that account.
            </dd>
          </div>
          <div>
            <dt>
              Stripe support: &ldquo;Age requirement to create a Stripe account&rdquo;
            </dt>
            <dd>
              More specific about account types. A <strong>Standard</strong> account can be created
              from 13, with a legal guardian as the account owner, before the account takes charges
              or pays out. <strong>Express</strong> and <strong>Custom</strong> Connect accounts are
              18+ and block signup at the door.
            </dd>
          </div>
        </dl>
        <p className="body" style={{ marginTop: 20 }}>
          So the accurate short answer is: <strong>from 13, on a Standard account, with an adult who
          signs for it.</strong> Not on your own. Not impossible either.
        </p>

        <div className="panel" style={{ marginTop: 24, borderColor: "var(--amber-line)", background: "var(--amber-bg)", borderTop: "1px solid var(--amber-line)" }}>
          <div className="lbl" style={{ marginBottom: 4 }}>Three things people collapse into one</div>
          <p className="small">
            What the provider&rsquo;s terms permit is not the same as what the law where you live
            settles, and neither is the same as a specific platform&rsquo;s configuration having
            been approved by the provider. We keep them apart everywhere on this site. Conflating
            them is how someone ends up putting something untrue on a financial application.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3" style={{ marginTop: 36 }}>The question we asked</h2>

        <div className="statusblock sb-error" style={{ marginTop: 14 }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <span className="sb-mark sb-mark-clay" />
            <div>
              <div className="sb-head">Draft — source not yet supplied</div>
              <p className="sb-body">
                This section quotes the message sent to Stripe verbatim, and the section below
                quotes their reply. Neither is written yet, because the correspondence has not been
                handed over. It will not be paraphrased, reconstructed from memory, or filled in
                with something plausible. Publishing this page with these two sections invented
                would destroy the only thing it is for.
              </p>
            </div>
          </div>
        </div>

        <h2 className="h3" style={{ marginTop: 36 }}>Their answer</h2>
        <div className="statusblock sb-error" style={{ marginTop: 14 }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <span className="sb-mark sb-mark-clay" />
            <div>
              <div className="sb-head">Draft — source not yet supplied</div>
              <p className="sb-body">
                Stripe&rsquo;s reply goes here, quoted exactly, with the date, who sent it, and an
                honest note on what a support answer does and does not commit the company to.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3" style={{ marginTop: 36 }}>What we found building it</h2>
        <p className="body" style={{ marginTop: 10 }}>
          Reading the terms is one thing. Building on them is another. Four things we hit, in the
          order we hit them.
        </p>

        <ol className="numbered" style={{ marginTop: 20 }}>
          <li>
            <span>The platform&rsquo;s own country limits which account types it can offer</span>
            <span>
              Veyro&rsquo;s Stripe platform account is registered in the UAE, and Stripe does not
              let UAE-registered platforms self-serve Express or Custom connected accounts. That
              left Standard — which happens to be the only type the under-18 rule applies to. A
              lucky constraint, not a designed one.
            </span>
          </li>
          <li>
            <span>Standard hands the account holder the keys</span>
            <span>
              A Standard connected account comes with a full Stripe dashboard and its own payout
              schedule. The platform cannot hold the money, delay a payout, or approve one. That
              changed what we are able to promise a guardian: they are notified of every payout and
              get a permanent record of it. They do not get a veto, because on a Standard account
              nobody can build them one. If another product tells you otherwise, ask which account
              type it uses.
            </span>
          </li>
          <li>
            <span>The guardian has to be the verified adult, and that needs enforcing</span>
            <span>
              The first connected account we opened in testing had the founder&rsquo;s email on it,
              which made the founder — a minor — the individual Stripe had verified. Wrong person,
              and exactly the sort of thing that passes in test mode and fails in production. The
              flow was rebuilt: the founder starts payment setup, the guardian finishes it from
              their own signed-in session, and the account is created against the
              guardian&rsquo;s email. Afterwards we re-read the account from Stripe and compare the
              person it actually verified against the guardian we expected. Mismatch, and the
              account is held and both people are told. We cannot control who types into
              Stripe&rsquo;s form. We can refuse to call the result finished.
            </span>
          </li>
          <li>
            <span>Stripe is moving on from the API underneath this</span>
            <span>
              Accounts v1 is no longer what Stripe recommends for new Connect integrations, and on
              a fresh platform account it is switched off until you explicitly enable it. That is a
              migration sitting on our roadmap, and we would rather write it here than let you find
              out from a changelog.
            </span>
          </li>
        </ol>

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3" style={{ marginTop: 36 }}>What this means where you live</h2>
        <p className="body" style={{ marginTop: 10 }}>
          Two questions decide it, and most people only ask the first.
        </p>

        <h3 className="h4" style={{ marginTop: 22 }}>Can the provider reach your country at all?</h3>
        <p className="body" style={{ marginTop: 8 }}>
          44 countries can sign up directly. Two — India and Indonesia — are preview only, meaning
          you contact Stripe sales rather than signing up yourself, so there is no self-serve route
          for us to build on. Five run through Paystack, Stripe&rsquo;s extended network, which is a
          different company with different terms that we have not read and will not guess at.
        </p>

        <h3 className="h4" style={{ marginTop: 22 }}>At what age can you sign a binding contract where you live?</h3>
        <p className="body" style={{ marginTop: 8 }}>
          This is the one people miss. It is not 18 everywhere, and it is frequently not set
          nationally. Scotland is 16, under the Age of Legal Capacity (Scotland) Act 1991. Seven
          Canadian provinces and territories are 19. Mississippi is 21; Alabama and Nebraska are 19.
          Singapore separates contracting capacity from the age of majority altogether and lowered
          the first to 18 in 2009, expressly so that young people could do business.
        </p>

        <p className="body" style={{ marginTop: 16 }}>
          We grade every country by how well we have actually checked it, and the checker shows you
          the grade rather than hiding it:
        </p>

        <ul className="arrowlist" style={{ marginTop: 14 }}>
          <li>
            <strong>United States and United Kingdom</strong> — age confirmed against a named
            statute or an official body. The guardian route is open, and the checker says so
            plainly.
          </li>
          <li>
            <strong>Most of Europe</strong> — the age itself comes from a primary source, but
            whether a minor may hold the account locally with a guardian as representative has not
            been reviewed. The checker says unverified, and means it.
          </li>
          <li>
            <strong>Brazil</strong> — Stripe supports Brazil, so the payments half works. The age is
            from secondary summaries only and the rest is unchecked, so it reads as unverified too.
          </li>
          <li>
            <strong>Nigeria, Kenya, Ghana, South Africa, Côte d&rsquo;Ivoire</strong> — Paystack,
            not Stripe. Another company&rsquo;s rules, which we have not read.
          </li>
        </ul>

        <div className="panel" style={{ marginTop: 24 }}>
          <div className="lbl" style={{ marginBottom: 4 }}>The part that gates everything</div>
          <p className="small">
            Whether a minor may hold a payment account with a guardian as representative has not
            been confirmed by a lawyer in <em>any</em> country, including the two above. Provider
            policy permitting something is not the same as it being settled locally. We would rather
            put that in the middle of our own article than bury it in a terms page.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        <hr className="rule" style={{ margin: "36px 0 28px" }} />
        <h2 className="h3">Find out what applies to you</h2>
        <p className="body" style={{ marginTop: 10 }}>
          Two questions — where you live and what year you were born. It runs in your browser, takes
          about twenty seconds, and tells you when you don&rsquo;t need us at all.
        </p>
        <div className="row" style={{ marginTop: 18, gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check what applies to you</Link>
          <Link className="btn btn-2 btn-lg" href="/">Back to home</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
