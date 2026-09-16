import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { LegalShell, Clause, SUPPORT_EMAIL } from "@/app/_ui/LegalShell";

export const metadata = buildMetadata("terms");
export const viewport = buildViewport();

const UPDATED = "16 September 2026";

export default function Terms() {
  return (
    <LegalShell
      title="Terms of Service"
      lead="What Veyro is, what it is not, and what you and your guardian are agreeing to."
      updated={UPDATED}
    >
      <Clause n={1} title="What Veyro is">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro is software. It helps a founder aged 13 to 17 open a payment account with Stripe,
          with a parent or legal guardian as the verified adult on that account, and it keeps a
          record of products, payments and payout requests.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          <strong>Veyro is not a bank, a payment processor, a money transmitter, or a party to any
          sale.</strong> It never holds your customers&rsquo; money. Payments are made directly to a
          Stripe connected account belonging to the founder, and Stripe holds those funds until
          they are paid out to the bank account registered on that account. Veyro also never
          receives identity documents or bank credentials: those are entered on Stripe&rsquo;s own
          hosted forms, which Veyro does not sit in front of.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Your use of Stripe is governed by Stripe&rsquo;s own agreements, which you accept
          directly with Stripe. Nothing in these terms changes them, and where the two conflict on
          anything to do with the payment account, Stripe&rsquo;s terms govern.
        </p>
      </Clause>

      <Clause n={2} title="Who may use Veyro">
        <p className="body" style={{ marginTop: 0 }}>
          You must be at least 13 years old to create a Veyro account. This floor is set by the
          payment provider and Veyro cannot waive it.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          If you are under 18, you cannot take payments until a parent or legal guardian has
          accepted an invitation from you, has been verified by Stripe as the adult on the account,
          and that account has been enabled by Stripe. A guardian must be at least 18.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Availability varies by country, and in some countries this route is not open at all.
          The <Link className="linkbtn" href="/check">eligibility checker</Link> gives the current
          answer for where you live. Brazil is excluded entirely: Stripe requires account holders
          there to be 18 or over regardless of guardian involvement.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          You must give accurate information, including your real date of birth. Providing false
          information on a financial application is a serious matter, and it is the fastest way to
          have the account closed by the provider.
        </p>
      </Clause>

      <Clause n={3} title="The guardian's role">
        <p className="body" style={{ marginTop: 0 }}>
          A guardian who accepts an invitation becomes the verified individual on the founder&rsquo;s
          Stripe account. They accept Stripe&rsquo;s terms, pass Stripe&rsquo;s identity checks, and
          are the person Stripe holds accountable for the account, including for refunds and
          chargebacks.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          A guardian is <strong>notified of every payout request</strong> and keeps a permanent
          record of it. A guardian <strong>cannot block a payout</strong>. On the Stripe account
          type Veyro uses, no such control exists for anyone to grant, and Veyro will not imply
          otherwise. If that is unacceptable to you as a guardian, decline the invitation.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Accepting does not make the guardian the owner of the founder&rsquo;s business. Veyro keeps
          its records against the founder. Consent can be withdrawn by contacting us.
        </p>
      </Clause>

      <Clause n={4} title="Your responsibilities">
        <p className="body" style={{ marginTop: 0 }}>
          You are responsible for what you sell and for delivering it. You are responsible for
          keeping your password to yourself, and for everything done through your account while
          signed in. Tell us immediately if you think someone else has access.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          You must not use Veyro to sell anything unlawful where you or your customer are, to take
          payments for goods or services you do not intend to provide, or in a way that breaches
          Stripe&rsquo;s restricted business list.
        </p>
      </Clause>

      <Clause n={5} title="What Veyro costs">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro takes <strong>no percentage of your transactions</strong> and charges no fee for
          the features described on this site as of the date above.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Stripe charges its own processing fees, which are set by Stripe, deducted by Stripe, and
          are not passed through Veyro. If Veyro ever introduces a charge, existing users will be
          told before it applies to them.
        </p>
      </Clause>

      <Clause n={6} title="Availability, and changes">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro is provided as-is and as-available. It is early software, it may be interrupted,
          and features may change. What the payment provider permits can also change, including
          which countries are open and what verification they require, and those decisions are not
          ours.
        </p>
      </Clause>

      <Clause n={7} title="Limitation of liability">
        <p className="body" style={{ marginTop: 0 }}>
          To the fullest extent the law where you live allows, Veyro is not liable for indirect or
          consequential loss, for lost profits or lost business, for the acts or decisions of
          Stripe or any bank, or for a payment that is delayed, reversed, held or refused by the
          payment provider.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Nothing here limits liability for death or personal injury caused by negligence, for
          fraud, or for anything else that cannot lawfully be limited. Several of the consumer
          protections that apply to people under 18 cannot be signed away, and this clause does not
          attempt to.
        </p>
      </Clause>

      <Clause n={8} title="Ending your use of Veyro">
        <p className="body" style={{ marginTop: 0 }}>
          You may stop using Veyro at any time and ask us to delete your account by emailing{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. A guardian
          may withdraw consent the same way, which stops the founder taking new payments.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          We may suspend or close an account that breaches these terms, that the payment provider
          requires us to act on, or where we are required to by law. Where we can tell you why, we
          will. Closing a Veyro account does not close the Stripe account, which belongs to the
          account holder and is closed with Stripe directly.
        </p>
      </Clause>

      <Clause n={9} title="Governing law and disputes">
        <p className="body" style={{ marginTop: 0 }}>
          <strong>Placeholder.</strong> Veyro is not yet incorporated, so the governing jurisdiction
          is not settled. Until it is, we will not name one, because naming a country we have not
          registered in would be misleading. This clause will be replaced, and the change noted in
          the last-updated date above, once incorporation is complete.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          In the meantime: if something goes wrong, email{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will try
          to sort it out directly. Your statutory rights where you live are unaffected by anything
          on this page, and a guardian acting for a minor keeps every right the law gives them.
        </p>
      </Clause>

      <Clause n={10} title="Nothing here is legal advice">
        <p className="body" style={{ marginTop: 0 }}>
          Whether a minor may hold a payment account with a guardian as the verified adult has not
          been confirmed by a lawyer in any country. Stripe&rsquo;s written policy permits it, and{" "}
          <Link className="linkbtn" href="/how-it-works">we publish their exact words</Link>, but
          provider policy permitting something is not the same as it being settled law where you
          live. Weigh that before you rely on it.
        </p>
      </Clause>
    </LegalShell>
  );
}
