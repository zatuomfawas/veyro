import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport, SITE } from "@/lib/seo";
import { SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { SiteNav } from "@/app/_ui/SiteNav";
import { ScrollTop } from "@/app/_ui/ScrollTop";
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
    + "questions parents actually ask, including the parts no lawyer has confirmed.",
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
        That policy is quoted in full (named, dated and unedited) on{" "}
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
    verdict: "Yes, and that is the point",
    tone: "pine",
    lead:
      "You are the account owner, because an adult has to be the party anyone can actually hold to the agreement.",
    a: (
      <p className="body" style={{ marginTop: 0 }}>
        A contract with a minor is voidable at the minor&rsquo;s election, so the enforceable
        party has to be an adult. You get identity-checked, not your child. Refunds, chargebacks
        and disputes are ultimately yours, as they would be if your child used your own
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
        Nothing in Veyro is designed to prevent it either: the account is yours and the
        route to closing it does not pass through us. You are not asked to approve individual
        sales, which is deliberate: a teenager who needs permission for every sale is not running
        anything.
      </p>
    ),
  },
];

export default function ForParents() {
  return (
    <div className="fw public-page parents-page">
      <SkipLink />
      <SiteNav active="/for-parents" cta={{ href: "/auth/signup", label: "Create account" }} />

      <main id="main">
        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <h1 className="hero-h1">Your child sells. You are the adult on the account.</h1>
                <p className="hero-lead">
                  Stripe verifies you for a separate payment account. Your child manages
                  their products and customers. You carry the account&rsquo;s responsibilities.
                  Here is what that means before you agree.
                </p>
                <div className="hero-cta">
                  <a className="btn btn-lg" href="#your-role">Understand your role</a>
                  <Link className="linkbtn" href="/legal">What is not settled</Link>
                </div>
              </div>
              <ParentPanel />
            </div>
          </div>
        </div>

        <section className="lp ch ch-surface" id="your-role">
          <div className="wrap-lp aside-grid">
            <div className="aside-head">
              <h2 className="lp-h2">A clear role, from the start.</h2>
              <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                Your child runs the day to day. The payment account and its obligations
                stay with you. Nothing happens until you agree, and declining is a normal answer.
              </p>
            </div>
            <ol className="numbered">
              <li>
                <span>Invitation</span>
                <span>Your child sends you a link to review. Nothing is created until you accept.</span>
              </li>
              <li>
                <span>Verification</span>
                <span>
                  You create your own login and complete Stripe&rsquo;s identity check on its
                  hosted form. Veyro never receives your documents or bank details.
                </span>
              </li>
              <li>
                <span>Selling</span>
                <span>Your child lists their products, shares checkout links and handles customers.</span>
              </li>
              <li>
                <span>Oversight</span>
                <span>
                  You keep the account controls Stripe provides. It may request more information
                  later; your dashboard shows when it does.
                </span>
              </li>
            </ol>
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <h2 className="lp-h2">The money stays with Stripe.</h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  Veyro is software, not a bank. It records the payments and shows the
                  account&rsquo;s position. It holds no customer funds.
                </p>
              </div>
              <dl className="ruled">
                <div>
                  <dt>Stripe</dt>
                  <dd>Verifies you, processes payments, holds the balance and runs payouts.</dd>
                </div>
                <div>
                  <dt>Veyro</dt>
                  <dd>
                    Records what Stripe reports. The wallet is calculated from those records
                    whenever it is viewed, so Veyro knows only what the provider tells it.
                  </dd>
                </div>
                <div>
                  <dt>You</dt>
                  <dd>Own the payment account and its controls, including responsibility for disputes.</dd>
                </div>
              </dl>
            </div>
            <FlowDiagram
              label="Where a payment goes, in order"
              style={{ marginTop: "var(--sp-8)" }}
              stops={[
                { n: "Customer", t: "Pays by card", d: "On a checkout page, into Stripe's own card form." },
                { n: "Stripe", t: "Processes it", d: "Charges the card and deducts its processing fee." },
                { n: "Your account", t: "Holds the balance", d: "The connected account in your name.", you: true },
                { n: "Your bank", t: "Receives the payout", d: "On Stripe's own payout schedule.", you: true },
              ]}
            />
            <div style={{ marginTop: "var(--sp-8)" }}>
              <GuardianPermissions audience="guardian" />
            </div>
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <div className="aside-grid">
              <div className="aside-head">
                <h2 className="lp-h2">If a payment is disputed.</h2>
                <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                  A customer can dispute a payment through their bank. The amount is held
                  immediately, and Stripe tells you as the account holder.
                  You submit evidence from your Stripe dashboard.
                </p>
                <p className="small" style={{ marginTop: "var(--sp-5)" }}>
                  Refunds are also issued from your Stripe account. The customer receives
                  their money back; the processor&rsquo;s original fee is not returned.
                </p>
              </div>
              <div>
                <h3 className="h4">What Veyro does</h3>
                <ul className="arrowlist" style={{ marginTop: "var(--sp-4)" }}>
                  <li>Emails you and your child the amount, reason and response deadline</li>
                  <li>Links directly to the dispute in Stripe</li>
                  <li>Shows the dispute on the dashboard and records its outcome</li>
                </ul>
                <h3 className="h4" style={{ marginTop: "var(--sp-7)" }}>Where our help ends</h3>
                <p className="body" style={{ marginTop: "var(--sp-3)" }}>
                  Veyro cannot submit evidence on this account type, decide or predict the
                  outcome, or cover the disputed amount and Stripe&rsquo;s dispute fee.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp aside-grid">
            <div className="aside-head">
              <h2 className="lp-h2">The questions to ask before agreeing.</h2>
              <p className="body" style={{ marginTop: "var(--sp-4)" }}>
                Understand the responsibilities and the open questions, including tax,
                liability and how you can close the account.
              </p>
            </div>
            <div>
              <div className="qalist">
                {QUESTIONS.map((question) => (
                  <article className="qa" key={question.q}>
                    <h3 className="qa-q">{question.q}</h3>
                    <p className="qa-verdict" data-tone={question.tone}>{question.verdict}</p>
                    <p className="qa-lead">{question.lead}</p>
                    <div className="qa-body">{question.a}</div>
                  </article>
                ))}
              </div>
              <div className="gbefore">
                <h3 className="h4">What you will sign</h3>
                <p className="body" style={{ marginTop: "var(--sp-3)" }}>
                  Stripe&rsquo;s hosted form handles verification. Read{" "}
                  <a className="linkbtn" href="https://stripe.com/legal/connect-account"
                    target="_blank" rel="noopener noreferrer">
                    Stripe&rsquo;s Connected Account Agreement
                  </a>{" "}
                  for the obligations you accept with them. Veyro&rsquo;s{" "}
                  <Link className="linkbtn" href="/terms">terms</Link> and{" "}
                  <Link className="linkbtn" href="/privacy">privacy policy</Link> cover what we hold.
                  Veyro never receives your identity documents, bank details or money.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp ch public-close">
          <div className="wrap-lp">
            <h2 className="lp-h2">Ready to be the adult on the account?</h2>
            <p className="body" style={{ marginTop: "var(--sp-4)" }}>
              Create your own account and complete verification on Stripe&rsquo;s form.
              Once it clears, your child can start selling. You can decline the invitation
              as plainly as you can accept it.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-lg" href="/auth/signup">Create your guardian account</Link>
              <Link className="linkbtn" href="/legal">Read the legal questions</Link>
            </div>
          </div>
        </section>
      </main>

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
