import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { LegalShell, Clause, Sub, SUPPORT_EMAIL } from "@/app/_ui/LegalShell";

export const metadata = buildMetadata("terms");
export const viewport = buildViewport();

const UPDATED = "5 October 2026";
/**
 * When these Terms begin to govern, and the instant fees may first be taken.
 * Until then the version dated 16 September 2026 applies, and is served at
 * /terms/2026-09-16.
 *
 * This date and FEES_EFFECTIVE_AT in lib/pricing.ts are the same moment and
 * must stay that way.
 *
 * AFTER 15 OCTOBER 2026: delete EFFECTIVE and the <notice> below. The archive
 * route stays live permanently -- it is what somebody checks when they want
 * to know what they actually agreed to.
 */
const EFFECTIVE = "15 October 2026";

const SECTIONS = [
  { n: 1, title: "What Veyro is" },
  { n: 2, title: "Who may use Veyro" },
  { n: 3, title: "Guardian, account ownership and founder access" },
  { n: 4, title: "Your responsibilities" },
  { n: 5, title: "Pricing and fees" },
  { n: 6, title: "Availability, and changes" },
  { n: 7, title: "Limitation of liability" },
  { n: 8, title: "Ending your use of Veyro" },
  { n: 9, title: "Governing law and disputes" },
  { n: 10, title: "Nothing here is legal advice" },
];

export default function Terms() {
  return (
    <LegalShell
      title="Terms of Service"
      lead="What Veyro is, what it is not, and what you and your guardian are agreeing to."
      updated={UPDATED}
      effective={EFFECTIVE}
      sections={SECTIONS}
      notice={
        <div className="archive-note" data-tone="pending">
          <strong>These Terms take effect on {EFFECTIVE}.</strong>
          <p style={{ margin: "6px 0 0" }}>
            Until then, the{" "}
            <Link className="linkbtn" href="/terms/2026-09-16">
              Terms dated 16 September 2026
            </Link>{" "}
            apply.
          </p>
        </div>
      }
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

        <Sub title="Account status monitoring">
          <p className="body">
            Veyro may monitor information made available through its payment-provider integrations
            for account-status, verification or operational issues and may notify you where we
            identify an issue requiring your attention.
          </p>
        </Sub>

        <Sub title="Dispute notifications and assistance">
          <p className="body">
            Veyro provides users with notifications regarding eligible payment disputes and
            chargebacks and may provide links or other tools to help the relevant account holder
            access and respond to the dispute through Stripe. Paid-tier users may additionally
            receive enhanced dispute and chargeback assistance from Veyro.
          </p>
          <p className="body" style={{ marginTop: 12 }}>
            Veyro does not determine the outcome of any dispute or chargeback and does not
            guarantee that a dispute will be resolved or a payment recovered.
          </p>
        </Sub>

        <Sub title="Payment funds">
          <p className="body">
            Veyro does not hold, custody or take possession of payment funds. Payment processing,
            settlement and payouts are provided through Stripe and remain subject to
            Stripe&rsquo;s applicable terms and requirements.
          </p>
        </Sub>
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

      {/* One guardian section. The six-subsection version deployed on
          4 October is superseded by counsel's consolidated wording; nothing
          else in the Terms governs guardians. */}
      <Clause n={3} title="Guardian, account ownership and founder access">
        <p className="body" style={{ marginTop: 0 }}>
          Where a Founder is under 18, a parent or legal guardian must complete any onboarding,
          consent and verification requirements required by Veyro or Stripe.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Where the connected business is owned by the parent or legal guardian, that person
          remains the legal owner and applicable Stripe account representative. Following
          completion of the required onboarding and verification, Veyro may permit the Founder to
          use Veyro&rsquo;s platform for ordinary day-to-day business activities, subject to
          applicable permissions, Stripe requirements and any actions for which guardian approval
          is required.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Access granted to the Founder through Veyro does not transfer ownership of the connected
          business, Stripe account or payment funds to the Founder.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          The parent or legal guardian remains responsible for the obligations applicable to their
          role under Stripe&rsquo;s terms and applicable law.
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

      <Clause n={5} title="Pricing and fees">
        <Sub title="Free tier">
          <p className="body">
            Veyro does not charge a platform fee on the first US$100 of Qualifying Monthly
            Earnings during a calendar month.
          </p>
        </Sub>

        <Sub title="Paid tier">
          <p className="body">
            Where Qualifying Monthly Earnings exceed US$100 during a calendar month, Veyro will
            charge a platform fee equal to 3% of the amount exceeding US$100.
          </p>
          <p className="body" style={{ marginTop: 12 }}>
            For example, where Qualifying Monthly Earnings are US$300, the Veyro platform fee is
            3% of US$200, equal to US$6.
          </p>
          <p className="body" style={{ marginTop: 12 }}>
            Fees are calculated prospectively and are not applied retroactively to prior periods.
          </p>
        </Sub>

        <Sub title="Qualifying Monthly Earnings">
          <p className="body">
            &ldquo;Qualifying Monthly Earnings&rdquo; means qualifying payments successfully
            processed through the applicable Stripe-connected business during a calendar month,
            calculated in accordance with the adjustments for refunds, reversals, chargebacks and
            other excluded transactions specified in these Terms.
          </p>
        </Sub>

        <Sub title="Paid-tier services">
          <p className="body">
            Subject to eligibility and availability, paid-tier users may receive:
          </p>
          <ul className="arrowlist" style={{ marginTop: 12 }}>
            <li>
              <strong>Weekly Payout Scheduling &amp; Visibility.</strong> Eligible paid-tier users
              may configure or use Stripe&rsquo;s available weekly payout schedule, subject to
              Stripe&rsquo;s requirements and availability. Veyro provides visibility into payout
              information, including the next scheduled payout date, but does not guarantee the
              timing or availability of any payout.
            </li>
            <li>
              <strong>Enhanced Dispute &amp; Chargeback Assistance.</strong> Veyro guidance,
              templates and administrative assistance; final response/action remains with the
              Stripe account holder where required.
            </li>
            <li>
              <strong>Priority Support.</strong> Target response time of 24 hours.
            </li>
            <li>
              <strong>Direct Guardian Support.</strong> Human support for the parent/legal
              guardian.
            </li>
            <li>
              <strong>Annual Earnings &amp; Payout Summary.</strong> Informational annual
              transaction/payout record, not tax advice.
            </li>
          </ul>
        </Sub>

        <Sub title="Fee timing and refunds">
          <p className="body">
            Veyro platform fees are separate from Stripe processing fees.
          </p>
          <p className="body" style={{ marginTop: 12 }}>
            A Veyro fee is incurred when a payment on which a Veyro fee is applicable succeeds.
            The fee is calculated using Qualifying Monthly Earnings for that calendar month
            accumulated through and including that payment. Refunds, reversals and chargebacks do
            not reduce or refund a Veyro fee already incurred. However, they reduce Qualifying
            Monthly Earnings used to determine whether any additional Veyro fee becomes payable on
            subsequent payments during the same calendar month. No refund or credit will be issued
            solely because subsequent refunds, reversals or chargebacks reduce Qualifying Monthly
            Earnings below the amount previously used to calculate a Veyro fee.
          </p>
        </Sub>

        <Sub title="Calendar month">
          <p className="body">
            For purposes of calculating Qualifying Monthly Earnings, a calendar month is
            determined according to Coordinated Universal Time (UTC), beginning at 00:00 UTC on
            the first day of the month and ending at 23:59:59 UTC on the last day of the month.
            The timestamp recorded by Stripe for the applicable successful payment will determine
            the calendar month in which the payment falls.
          </p>
        </Sub>

        <Sub title="Currency">
          <p className="body">
            Payments processed in currencies other than US dollars will be converted to US dollars
            using the objective exchange-rate methodology specified by Veyro and consistently
            applied by the Veyro fee-calculation system.
          </p>
        </Sub>

        <Sub title="Inactive accounts">
          <p className="body">
            Veyro does not charge a platform fee solely because an account exists where no
            Qualifying Monthly Earnings have been generated.
          </p>
        </Sub>

        <Sub title="Transition">
          <p className="body">
            The initial fee schedule set out in these Terms applies to users who first enter into
            a Veyro agreement on or after the Effective Date. For users who entered into an
            agreement with Veyro before the Effective Date, any new or increased Veyro fees will
            become effective only after at least 30 days&rsquo; prior notice. Fees validly
            incurred before the effective date of any change will not be altered retroactively.
          </p>
        </Sub>

        <Sub title="Changes to fees">
          <p className="body">
            Veyro may amend its fees by providing at least 30 days&rsquo; prior notice. Amendments
            apply prospectively and will not retroactively change fees validly incurred before the
            effective date.
          </p>
        </Sub>
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
        <Sub title="Payment processing">
          <p className="body">
            Payment processing services, including payment authorization, settlement, disputes,
            chargebacks, reserves, holds and payout decisions, are provided or controlled by
            Stripe or the applicable payment processor. Veyro does not guarantee that any payment
            will be authorized, settled or paid out at any particular time and is not responsible
            for decisions or failures attributable to Stripe or another payment processor, except
            to the extent caused by Veyro&rsquo;s own breach, misconduct or other liability that
            cannot lawfully be excluded.
          </p>
        </Sub>

        <Sub title="Account monitoring and reviews">
          <p className="body">
            Account Status Monitoring and Account Health Reviews are provided as informational and
            support services based on information available to Veyro. They do not constitute
            legal, tax, accounting or regulatory advice, and do not constitute a certification or
            guarantee that an account, business or activity complies with applicable law, Stripe
            requirements or other third-party obligations. Veyro does not guarantee that every
            issue will be identified or identified before it affects an account.
          </p>
        </Sub>

        {/* A5: the universal saving provision, as the final paragraph of the
            section rather than inside a subsection -- it qualifies the whole
            of clause 7, not one part of it. */}
        <p className="body" style={{ marginTop: "var(--sp-6)" }}>
          Nothing in these Terms excludes, limits, or waives any right or protection that cannot
          lawfully be excluded, limited, or waived under applicable law, including any mandatory
          protections applicable to minors.
        </p>
      </Clause>

      <Clause n={8} title="Ending your use of Veyro">
        <Sub title="Guardian-initiated closure">
          <p className="body">
            A guardian/account holder may request closure at any time, subject to outstanding
            transactions and obligations.
          </p>
        </Sub>

        <Sub title="Veyro-initiated suspension">
          <p className="body">
            Veyro may suspend or terminate access where reasonably necessary to address fraud,
            misuse, legal or regulatory requirements, Stripe requirements, security issues, or
            material breach of these Terms.
          </p>
        </Sub>

        <Sub title="Settlement of obligations">
          <p className="body">
            Termination does not extinguish fees, refunds, disputes, chargebacks, reserves,
            payment obligations or other amounts that arose before termination. Any remaining
            funds or payouts remain subject to Stripe&rsquo;s applicable terms, including
            applicable holds, reserves, disputes, refunds or reversals.
          </p>
        </Sub>
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
