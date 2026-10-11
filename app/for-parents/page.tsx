import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { MobileNav } from "@/app/_ui/MobileNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";
import { ParentPanel } from "@/app/_ui/ParentPanel";
import { FlowDiagram } from "@/app/_ui/FlowDiagram";
import { TalkToAPerson } from "./TalkToAPerson";
import { supportMailto } from "@/lib/support";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "For parents: what you are agreeing to",
  description:
    "Is it legal, are you liable, what does it do to your taxes, and can you stop it. "
    + "Four questions answered plainly, including the parts that are not settled.",
  alternates: { canonical: SITE + "/for-parents" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "For parents: what you are agreeing to",
    description: "Four questions answered plainly, including the parts that are not settled.",
    url: SITE + "/for-parents",
  },
};

// The page a parent reads before they say yes, and the one that decides whether
// the account ever exists.
//
// Written in the third person and at a lower temperature than the rest of the
// site: a parent arriving here has been sent a link by their kid and is looking
// for reasons this is not a scam. Any sales voice reads as one. The four
// questions are in the order they are actually asked, and each answer leads
// with the unwelcome half.

type QA = {
  q: string;
  /** Two or three words. The answer, before the reasoning. */
  verdict: string;
  /** pine = yes, amber = qualified, slate = not ours to answer. */
  tone: "pine" | "amber" | "slate";
  /** One sentence a reader can stop at and still have the truth. */
  lead: string;
  a: React.ReactNode;
};

const QUESTIONS: QA[] = [
  {
    q: "Is this legal?",
    verdict: "Permitted, not settled",
    tone: "amber",
    lead:
      "The processor's own written policy allows it. No court has ruled on it, and we are not going to pretend one has.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          That policy is quoted in full &mdash; named, dated and unedited &mdash; on{" "}
          <Link className="linkbtn" href="/how-it-works">how it works</Link>, and it is what this
          product is built on.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What it is not is a court ruling. No judge anywhere has tested whether a minor can be
          bound by the contracts underneath, and no lawyer has confirmed it in any country. The
          arrangement is permitted by the processor and lawful on its face; it is not settled law.
          If that distinction matters to you, it should, and{" "}
          <Link className="linkbtn" href="/legal">the full list of what is unproven</Link> is a
          page rather than a footnote.
        </p>
      </>
    ),
  },
  {
    q: "Am I liable if it goes wrong?",
    verdict: "Yes \u2014 and that is the point",
    tone: "pine",
    lead:
      "You are the account owner, because an adult has to be the party anyone can actually hold to the agreement.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          A contract with a minor is voidable at the minor&rsquo;s election, which is why the enforceable party has to be an adult. It is you who gets identity-checked, not your child, and the account exists in your name.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          In practice that means refunds, chargebacks and disputes on this account are ultimately
          yours, the same as they would be if your child simply used your own account.
          What changes is that it is a separate account for a separate activity, rather than
          mixed into your personal payments, and that your child handles the day-to-day instead
          of you.
        </p>
      </>
    ),
  },
  {
    q: "Does this mess up my taxes?",
    verdict: "Possibly. Ask an accountant",
    tone: "slate",
    lead:
      "Tax documentation for the account is issued against you. What that means for your household is a question for somebody who knows it.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          That is a real consequence of the arrangement and not something to wave away. It follows from your being the account owner, which is the thing that makes the whole route lawful in the first place.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What Veyro does is keep the two things separable: the account is for your child&rsquo;s
          activity only, and the ledger records every payment and fee against it. Exports come
          from Stripe, which holds the payments. Whether their earnings are treated as yours or
          theirs depends on where you live and on facts about your household that we do not know.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          We will not tell you it has no effect on your taxes, because we do not know that and
          nobody selling you something should say it.
        </p>
      </>
    ),
  },
  {
    q: "Can I stop it if I need to?",
    verdict: "Yes, completely",
    tone: "pine",
    lead:
      "You can close or freeze the account at any time, directly with the processor. Nothing in Veyro can prevent that.",
    a: (
      <>
        <p className="body" style={{ marginTop: 0 }}>
          Nothing in Veyro is designed to prevent it either. The account is yours, and the route to closing it does not pass through us.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          You are not asked to approve individual sales, which is deliberate: a parent who has to
          approve every payment becomes a bottleneck, and a teenager who needs permission for
          every sale is not running anything. The provider may still come back to you for more
          information about the account after setup.
        </p>
      </>
    ),
  },
];

export default function ForParents() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/how-it-works">How it works</Link>
              <Link className="btn btn-q btn-sm hide-s" href="/legal">What is not settled</Link>
              <Link className="btn btn-sm" href="/check">Check eligibility</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/legal", label: "What is not settled" },
                  { href: "/check", label: "Check eligibility" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/faq", label: "Questions" },
                  { href: "/contact", label: "Contact" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      {/* Chaptered, in the order a guardian actually decides.
          ------------------------------------------------------------------
          It was one railed column: hero, panel, money diagram, four long
          answers, permissions, a closing paragraph. Everything was there and
          nothing had a shape, so a parent scanning for "what am I signing"
          had to read to find out.

          The order below is the order of the decision -- what this is, what
          the four steps are, where the money actually goes, what is yours,
          what happens when something goes wrong, what is not settled, and
          only then a choice. The CTA stays a consent CTA: the honest primary
          action for somebody who has not been invited yet is to read the
          uncomfortable page, not to sign up.

          FOUR CLAIMS WERE CORRECTED RATHER THAN RESTYLED. See the report in
          the commit; the short version is that "you approve once and you are
          done" is contradicted by REQUIREMENTS_DUE, and three of the controls
          shown are Stripe's rather than Veyro's. */}
      <main id="main" className="has-sticky">

        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  For parents and guardians
                </p>
                <h1 className="hero-h1" style={{ maxWidth: "19ch" }}>
                  Before your child takes a payment, here is what you are agreeing to.
                </h1>
                <p className="hero-lead">
                  You would be the adult on the payment account. This page is the whole of what
                  that means &mdash; the responsibilities, the limits, and the parts no lawyer
                  has confirmed &mdash; so the decision is an informed one. There is nothing to
                  buy and declining is a normal answer.
                </p>
              </div>
              <ParentPanel />
            </div>

            {/* Three facts, before any argument. Reuses the status board's
                cells rather than inventing a third card style. */}
            <ul className="statgrid" style={{ marginTop: "var(--sp-8)" }}>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your account</span></div>
                <p className="statcard-r">
                  The payment account is registered in your name. Your child uses it; you own it.
                </p>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your responsibility</span></div>
                <p className="statcard-r">
                  You complete the provider&rsquo;s identity check, and the obligations that come
                  with owning a payment account stay with you.
                </p>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your choice</span></div>
                <p className="statcard-r">
                  Nothing happens until you agree. You can read this, ask a person, and still
                  say no.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------------- 1. the four steps ---------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">What happens</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Four steps, and two of them are yours.
                </h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  The middle is the part that needs you. After it your child runs the day to day,
                  and the account stays yours.
                </p>
              </div>

              <ol className="numbered">
                <li>
                  <span>Invitation</span>
                  <span>
                    Your child sends you a link asking you to review the arrangement. Nothing is
                    created until you accept.
                  </span>
                </li>
                <li>
                  <span>Review and verification</span>
                  <span>
                    You read what you are agreeing to, then complete the payment
                    provider&rsquo;s own identity check on their hosted form. Veyro never
                    receives your documents or your bank details.
                  </span>
                </li>
                <li>
                  <span>Selling</span>
                  <span>
                    Your child lists what they sell, shares their checkout link and handles their
                    own customers. You are not asked to approve individual sales.
                  </span>
                </li>
                <li>
                  <span>Account oversight</span>
                  <span>
                    The account stays in your name, with the controls the provider gives an
                    account holder. The provider can also come back and ask you for more
                    information later &mdash; that is normal and the dashboard will say so.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------- 2. money vs information ---------------- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Where the money goes</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "22ch" }}>
              Veyro is software. It never holds the money.
            </h2>
            <p className="body" style={{ marginTop: "var(--sp-4)", maxWidth: "var(--m-body)" }}>
              These are two different things and they are easy to confuse, so they are drawn
              separately. The money never touches us. What reaches us is a record of it.
            </p>

            <h3 className="h4" style={{ marginTop: "var(--sp-8)" }}>The money</h3>
            <FlowDiagram
              label="Where a payment goes, in order"
              style={{ marginTop: "var(--sp-4)" }}
              stops={[
                { n: "Customer", t: "Pays by card", d: "On a checkout page, into the processor's own card form." },
                { n: "Stripe", t: "Processes it", d: "Takes the card, charges it, deducts its own fee." },
                { n: "Your account", t: "Holds the balance", d: "The connected account in your name.", you: true },
                { n: "Your bank", t: "Receives the payout", d: "On the provider's own payout schedule.", you: true },
              ]}
            />

            <h3 className="h4" style={{ marginTop: "var(--sp-8)" }}>The information</h3>
            <FlowDiagram
              label="What Veyro receives, in order"
              style={{ marginTop: "var(--sp-4)" }}
              stops={[
                { n: "Stripe", t: "Sends an event", d: "A payment succeeded, a refund landed, a dispute opened." },
                { n: "Veyro", t: "Records it", d: "Writes it to the ledger against your child's account." },
                { n: "The dashboard", t: "Shows the position", d: "Earned, fees, refunded, available. A view, not a balance." },
              ]}
            />
            <p className="small" style={{ marginTop: "var(--sp-5)", maxWidth: "var(--m-body)" }}>
              The wallet your child sees is folded from those records each time it is read. It is
              a picture of an account held elsewhere, not an account of ours, and Veyro only
              knows what the provider tells it.
            </p>
          </div>
        </section>

        {/* ---------------- 3. what is yours ---------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">Your part</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  What you do, and what you do not.
                </h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  The same list your child sees, so there is nothing you are being told that they
                  are not.
                </p>
              </div>
              <GuardianPermissions />
            </div>
          </div>
        </section>

        {/* ---------------- 4. disputes ----------------
            New section. A parent asking "what could go wrong" had nothing to
            read, and this is the scenario where their role is largest and
            least obvious -- Stripe writes to the ACCOUNT HOLDER, which is
            them, and a teenager can lose a chargeback by default because the
            deadline passed in a parent's inbox. What Veyro does here is
            exactly what lib/disputes.ts does and no more. */}
        <section className="lp ch">
          <div className="wrap-lp">
            <span className="lp-eyebrow">If a customer disputes a charge</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "24ch" }}>
              You respond, in Stripe. Veyro makes sure you know.
            </h2>

            <FlowDiagram
              label="What happens when a payment is disputed"
              style={{ marginTop: "var(--sp-7)" }}
              stops={[
                { n: "Customer", t: "Disputes it", d: "Through their bank. The amount is held straight away." },
                { n: "Stripe", t: "Tells the account holder", d: "That is you, because the account is yours.", you: true },
                { n: "Veyro", t: "Emails you both", d: "The amount, the reason, the deadline, and a link to it." },
                { n: "You", t: "Respond in Stripe", d: "Evidence is submitted from your own dashboard.", you: true },
              ]}
            />

            <div className="gfair">
              <div>
                <h3 className="h4" style={{ marginTop: 0 }}>What Veyro does</h3>
                <ul className="ticks" style={{ marginTop: "var(--sp-3)" }}>
                  <li>Emails you and your child the amount, the reason and the deadline</li>
                  <li>Links straight to the dispute in Stripe</li>
                  <li>Shows it on the dashboard, because an email is not proof of being read</li>
                  <li>Records the outcome against the payment</li>
                </ul>
              </div>
              <div>
                <h3 className="h4" style={{ marginTop: 0 }}>What Veyro does not do</h3>
                <ul className="ticks" data-no="1" style={{ marginTop: "var(--sp-3)" }}>
                  <li>Submit evidence for you. On this account type the platform cannot</li>
                  <li>Decide the outcome, or predict it</li>
                  <li>Cover the amount, or the fee the provider charges for a dispute</li>
                </ul>
              </div>
            </div>
            <p className="small" style={{ marginTop: "var(--sp-6)", maxWidth: "var(--m-body)" }}>
              Refunds work the same way: your child can ask for one, but it is issued from the
              Stripe account, which is yours. A refunded sale returns the customer&rsquo;s money
              and does not return the processor&rsquo;s fee.
            </p>
          </div>
        </section>

        {/* ---------------- 5. the four questions ---------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <span className="lp-eyebrow">The four questions</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "22ch" }}>
              Legal, liability, tax, and getting out.
            </h2>

            <ol className="qalist" style={{ marginTop: "var(--sp-8)" }}>
              {QUESTIONS.map((x, i) => (
                <li className="qa" key={x.q}>
                  <div className="qa-head">
                    <span className="fig-ref qa-n">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="qa-q">{x.q}</h3>
                  </div>
                  {/* A sibling of the flex row, not a member of it. Inside, the
                      only way to drop the badge onto its own line was
                      flex-basis:100%, which sets the flex base size -- so a
                      three-word verdict stretched the width of the column. */}
                  <span className="chip qa-verdict" data-tone={x.tone} data-on="1">{x.verdict}</span>
                  <p className="qa-lead">{x.lead}</p>
                  <div className="qa-body">{x.a}</div>
                </li>
              ))}
            </ol>

            {/* The processor is named here and nowhere else in the argument.
                This block is not an argument -- it is the disclosure of who
                the parent is about to contract with, and a counterparty you
                are asked to sign with has to be named. */}
            <div className="gbefore">
              <h3 className="h4" style={{ marginTop: 0 }}>What you will actually sign</h3>
              <p className="body" style={{ marginTop: "var(--sp-3)" }}>
                The identity check happens on Stripe&rsquo;s own hosted form. Veyro never receives
                your documents, your bank details or the money &mdash; read{" "}
                <a className="linkbtn" href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer">
                  Stripe&rsquo;s Connected Account Agreement
                </a>{" "}
                for what you are signing with them. Veyro&rsquo;s own{" "}
                <Link className="linkbtn" href="/terms">terms</Link> and{" "}
                <Link className="linkbtn" href="/privacy">privacy policy</Link> cover what we hold.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- 6. who does what ---------------- */}
        <section className="lp ch">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Three parties</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "22ch" }}>
              Who holds what.
            </h2>
            <ul className="statgrid" style={{ marginTop: "var(--sp-7)" }}>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Stripe</span></div>
                <p className="statcard-r">
                  Verifies you, processes the payments, holds the balance and runs the payouts.
                  The account controls are theirs.
                </p>
                <a className="linkbtn statcard-l" href="https://stripe.com/legal/connect-account"
                  target="_blank" rel="noopener noreferrer">The agreement you sign</a>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Veyro</span></div>
                <p className="statcard-r">
                  Records what the provider reports and shows it as a position. Software, not a
                  bank; it holds no customer funds.
                </p>
                <Link className="linkbtn statcard-l" href="/how-it-works">How it is built</Link>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">You</span></div>
                <p className="statcard-r">
                  Own the account and carry the obligations that come with it, including
                  responding to disputes.
                </p>
                <span className="statcard-l tiny">In Stripe, not here.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------------- 7. the decision ---------------- */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Read the uncomfortable version before you decide.</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              This page is written to be fair to Veyro. The other one is written to be fair to
              you: every part of this that is untested, unfinished, or weaker than it sounds.
              A parent who reads both and still says no was right to.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg btn-xl" href="/legal">What is not settled yet</Link>
              <Link className="btn btn-2 btn-lg" href="/contact">Ask a person</Link>
            </div>
            <p className="tiny" style={{ marginTop: 16 }}>
              You are not committing to anything by reading. A guardian invite needs your
              agreement, and declining is offered as plainly as accepting.
            </p>
          </div>
        </section>

      </main>

      {/* Was a sticky margin note. See TalkToAPerson.tsx for why it is a
          closeable panel now and why it is not a modal. The href is built
          here so the component stays presentational and the mailto tagging
          rules keep living in lib/support. */}
      <TalkToAPerson
        href={supportMailto({
          audience: "guardian", priority: false,
          subject: "A question before I agree",
        })}
      />
      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
