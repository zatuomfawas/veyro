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
  title: "For parents: your child runs it, you own the account",
  description:
    "Your role in four steps, who holds the money, what happens in a dispute, and the four "
    + "questions parents actually ask — including the parts no lawyer has confirmed.",
  alternates: { canonical: SITE + "/for-parents" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Veyro",
    title: "For parents: your child runs it, you own the account",
    description: "Your role in four steps, including the parts that are not settled.",
    url: SITE + "/for-parents",
  },
};

// The page a parent reads before they say yes, and the one that decides whether
// the account ever exists.
//
// SHAPE: hero -> your role in four steps -> trust and safety -> disputes ->
// the four questions -> one commanding choice. That is the order of the
// decision rather than the order of our argument, and each chapter answers one
// question so a parent scanning can stop at any heading and still be oriented.
//
// VOICE: third person, low temperature. A parent arriving here was sent a link
// by their kid and is looking for reasons this is a scam; a sales voice reads
// as one. Each of the four answers leads with the unwelcome half.
//
// FOUR CLAIMS ARE DELIBERATELY NOT MADE HERE, because the code contradicts
// them: that approval happens exactly once (Stripe can set REQUIREMENTS_DUE
// again at any time), that a guardian approves or declines payouts in Veyro
// (there is no such control -- it is Stripe's), that a guardian sees
// everything (Veyro only knows what the provider reports), and that setup
// takes five minutes (no connected account has completed onboarding, so there
// is no measured figure to quote). Each is phrased to its nearest true form.

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
      <p className="body" style={{ marginTop: 0 }}>
        That policy is quoted in full &mdash; named, dated and unedited &mdash; on{" "}
        <Link className="linkbtn" href="/how-it-works">how it works</Link>. What it is not is a
        court ruling: no judge has tested whether a minor can be bound by the contracts
        underneath, and no lawyer has confirmed it in any country.{" "}
        <Link className="linkbtn" href="/legal">The full list of what is unproven</Link> is a page
        rather than a footnote.
      </p>
    ),
  },
  {
    q: "Am I liable if it goes wrong?",
    verdict: "Yes — and that is the point",
    tone: "pine",
    lead:
      "You are the account owner, because an adult has to be the party anyone can actually hold to the agreement.",
    a: (
      <p className="body" style={{ marginTop: 0 }}>
        A contract with a minor is voidable at the minor&rsquo;s election, so the enforceable
        party has to be an adult. You get identity-checked, not your child. Refunds, chargebacks
        and disputes are ultimately yours &mdash; as they would be if your child used your own
        account. What changes is that this is a separate account for a separate activity.
      </p>
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
          That follows from your being the account owner, which is what makes the route lawful
          at all. Veyro keeps the two separable: the account covers your child&rsquo;s activity
          only, and the ledger records every payment and fee against it. Exports come from
          Stripe, which holds the payments.
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
      <p className="body" style={{ marginTop: 0 }}>
        Nothing in Veyro is designed to prevent it either &mdash; the account is yours and the
        route to closing it does not pass through us. You are not asked to approve individual
        sales, which is deliberate: a teenager who needs permission for every sale is not running
        anything.
      </p>
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
              <Link className="btn btn-sm" href="/auth/signup">Create account</Link>
              <ThemeToggle />
              <MobileNav
                items={[
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/legal", label: "What is not settled" },
                  { href: "/auth/signup", label: "Create your guardian account" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/faq", label: "Questions" },
                  { href: "/contact", label: "Contact" },
                ]}
              />
            </div>
          </nav>
        </div>
      </div>

      <main id="main" className="has-sticky">

        {/* ---------------- hero: the division of labour, in one line ----------
            The old headline was "Before your child takes a payment, here is
            what you are agreeing to" -- accurate, and it made the reader's
            first job reading a disclaimer. This one states the arrangement,
            which is the thing they came to understand, and the disclaimer is
            one click away in the second button. */}
        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  For parents and guardians
                </p>
                <h1 className="hero-h1" style={{ maxWidth: "17ch" }}>
                  Your child runs the business. You are the adult on the account.
                </h1>
                <p className="hero-lead">
                  Your part is the verification: the account opens in your name, through the
                  provider&rsquo;s own identity check. Your child does the selling. This page is
                  what that means, including the parts no lawyer has confirmed.
                </p>
                <div className="row" style={{ marginTop: "var(--sp-6)", gap: 8, flexWrap: "wrap" }}>
                  <Link className="btn btn-lg" href="/auth/signup">Create your guardian account</Link>
                  <Link className="btn btn-2 btn-lg" href="/legal">What is not settled</Link>
                </div>
              </div>
              <ParentPanel />
            </div>

            {/* Three facts, before any argument. Reuses the status board's
                cells rather than inventing a third card style. */}
            <ul className="statgrid" style={{ marginTop: "var(--sp-8)" }}>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your account</span></div>
                <p className="statcard-r">
                  Registered in your name. Your child uses it; you own it.
                </p>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your responsibility</span></div>
                <p className="statcard-r">
                  You pass the provider&rsquo;s identity check, and the obligations of account
                  ownership stay with you.
                </p>
              </li>
              <li className="statcard">
                <div className="statcard-h"><span className="statcard-n">Your choice</span></div>
                <p className="statcard-r">
                  Nothing happens until you agree, and declining is a normal answer.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------------- 1. your role, in four steps ---------------- */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <span className="lp-eyebrow">Your role</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
                  Four steps, and the middle one is yours.
                </h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  After it your child runs the day to day, and the account stays yours.
                </p>
              </div>

              <ol className="numbered">
                <li>
                  <span>Invitation</span>
                  <span>
                    Your child sends you a link to review. Nothing is created until you
                    accept.
                  </span>
                </li>
                <li>
                  <span>Review and verification</span>
                  <span>
                    You complete the provider&rsquo;s identity check on their own hosted form;
                    Veyro never receives your documents or bank details.
                  </span>
                </li>
                <li>
                  <span>Selling</span>
                  <span>
                    Your child lists what they sell, shares their checkout link and handles
                    their own customers.
                  </span>
                </li>
                <li>
                  <span>Account oversight</span>
                  <span>
                    The account stays in your name with the controls the provider gives an
                    account holder. The provider can ask for more information later; the
                    dashboard says when it has.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------- 2. trust and safety ----------------
            Statement, then the visual, then the detail. The statement is the
            one sentence a parent repeats to their partner, so it has to be
            three things that are each literally true: Stripe holds it, we
            record it, the account is yours. */}
        <section className="lp ch">
          <div className="wrap-lp">
            <span className="lp-eyebrow">Trust and safety</span>
            <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)", maxWidth: "26ch" }}>
              Stripe holds the money. Veyro keeps the record. You own the account.
            </h2>
            <p className="body" style={{ marginTop: "var(--sp-4)", maxWidth: "var(--m-body)" }}>
              Three parties, and only one of them ever touches the money.
            </p>

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
                  Own the account and its controls, and carry the obligations that come with it
                  &mdash; including disputes.
                </p>
                <span className="statcard-l tiny">In Stripe, not here.</span>
              </li>
            </ul>

            <h3 className="h4" style={{ marginTop: "var(--sp-9)" }}>The money</h3>
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

            <h3 className="h4" style={{ marginTop: "var(--sp-8)" }}>The record</h3>
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
              The wallet your child sees is folded from those records on each read: a picture of
              an account held elsewhere. Veyro knows only what the provider tells it.
            </p>

            {/* Same six facts the founder is shown on /how-it-works, in the
                second person, because here the reader is the guardian. */}
            <h3 className="h4" style={{ marginTop: "var(--sp-9)" }}>Your part</h3>
            <div style={{ marginTop: "var(--sp-4)" }}>
              <GuardianPermissions audience="guardian" />
            </div>
          </div>
        </section>

        {/* ---------------- 3. disputes ----------------
            The scenario where a guardian's role is largest and least obvious:
            Stripe writes to the ACCOUNT HOLDER, which is them, and a teenager
            can lose a chargeback by default because the deadline passed in a
            parent's inbox. What Veyro does here is exactly what
            lib/disputes.ts does and no more. */}
        <section className="lp ch ch-surface">
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
                  <li>Cover the amount, or the provider&rsquo;s dispute fee</li>
                </ul>
              </div>
            </div>
            <p className="small" style={{ marginTop: "var(--sp-6)", maxWidth: "var(--m-body)" }}>
              Refunds work the same way: your child can ask, but it is issued from the Stripe
              account, which is yours. A refund returns the customer&rsquo;s money, not the
              processor&rsquo;s fee.
            </p>
          </div>
        </section>

        {/* ---------------- 4. the four questions ---------------- */}
        <section className="lp ch">
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
                for what you sign with them. Veyro&rsquo;s{" "}
                <Link className="linkbtn" href="/terms">terms</Link> and{" "}
                <Link className="linkbtn" href="/privacy">privacy policy</Link> cover what we hold.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- 5. the decision ----------------
            One dominant action, and the uncomfortable page kept beside it
            rather than hidden: a parent who reads both and still says no was
            right to, and a consent page that buries its own disclaimer is
            not a consent page. */}
        <section className="lp ch ch-9 lp-dark">
          <div className="wrap-lp lp-center">
            <h2 className="lp-h2">Ready to be the adult on the account?</h2>
            <p className="body" style={{ marginTop: 14, marginLeft: "auto", marginRight: "auto" }}>
              You create your own account, verify yourself with the payment provider, and your
              child takes it from there.
            </p>
            <div className="row" style={{ marginTop: 24, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="btn btn-lg btn-xl" href="/auth/signup">Create your guardian account</Link>
              <Link className="btn btn-2 btn-lg" href="/legal">What is not settled yet</Link>
            </div>
            <p className="small" style={{ marginTop: 16 }}>
              Verification happens on Stripe&rsquo;s own form. Once it clears, your child can
              start selling.
            </p>
            <p className="tiny" style={{ marginTop: 10 }}>
              You are not committing to anything by reading, and declining is offered as plainly
              as accepting.
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
