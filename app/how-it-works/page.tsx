import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import {
  REPLY_DATE, Q_CORE, Q_TYPES, Q_COUNTRIES, Q_ONBOARDING, Q_ARCHITECTURE, HELP_AGE, HELP_VERIFY,
} from "@/app/_ui/provider-reply";
import { SkipLink } from "@/app/_ui/marks";
import { SiteNav } from "@/app/_ui/SiteNav";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { RoleStack } from "@/app/_ui/RoleStack";
import { ScrollProgress } from "@/app/_ui/ScrollProgress";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";
import { LiveWallet } from "@/app/_ui/LiveWallet";

export const metadata = buildMetadata("how");
export const viewport = buildViewport();

const UPDATED = "13 September 2026";
const CHAPTERS = [
  ["setup", "Getting started"],
  ["roles", "Who does what"],
  ["provider-reply", "Stripe’s written reply"],
  ["countries", "Country and age limits"],
  ["account-limits", "Account limitations"],
  ["money", "Money and guardian controls"],
] as const;

/** Provider quotations remain verbatim from the single shared source. */
function Quote({ children }: { children: React.ReactNode }) {
  return <blockquote className="srcquote how-quote">{children}</blockquote>;
}

export default function HowItWorks() {
  return (
    <div className="fw public-page how-page">
      <ScrollProgress />
      <SkipLink />
      <SiteNav active="/how-it-works" />

      <main id="main" className="how-main">
        <header className="wrap-lp how-hero">
          <h1 className="hero-h1">How payments work with Veyro.</h1>
          <p className="hero-lead">
            You build the product. Your guardian completes the adult verification. Stripe
            processes payments, while Veyro brings setup, checkout and your payment records together.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-lg" href="/check">Check eligibility</Link>
            <Link className="linkbtn" href="/get-started">See the setup guide</Link>
          </div>
          <p className="small how-update">
            For founders aged 13 to 17, subject to country requirements. Provider guidance last
            checked {UPDATED}. Nothing here is legal or tax advice.
          </p>
        </header>

        <div className="wrap-lp how-layout">
          <aside className="how-index">
            <nav aria-label="On this page">
              <h2 className="h4">On this page</h2>
              <ol>{CHAPTERS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
            </nav>
            <p className="small">Stripe&rsquo;s reply: {REPLY_DATE}. The quotations are reproduced exactly.</p>
            <Link className="linkbtn" href="/legal">Read the open legal questions</Link>
          </aside>

          <div className="how-content">
            <section className="how-chapter" id="setup" aria-labelledby="setup-heading">
              <div className="how-chapter-head">
                <h2 id="setup-heading">Getting started</h2>
                <p>Four steps from checking your eligibility to a working checkout.</p>
              </div>
              <ol className="how-steps">
                <li>
                  <h3>Check your country and age</h3>
                  <p>The checker answers before you create an account. Country availability and
                    local contracting age both matter; an open result is not a legal guarantee.</p>
                </li>
                <li>
                  <h3>Invite your guardian</h3>
                  <p>They sign in to their own account, give consent and complete Stripe&rsquo;s
                    hosted verification using their own details. Identity documents and bank
                    information go directly to Stripe. Stripe can ask for further information later.</p>
                </li>
                <li>
                  <h3>Create a product and connect your checkout</h3>
                  <p>Share its payment link, use the React SDK, or integrate the checkout API.
                    Customers can pay only after the payment account is enabled and the product
                    is live. <Link className="linkbtn" href="/docs/sdk">Read the integration guide</Link>.</p>
                </li>
                <li>
                  <h3>Follow payments and payout requests</h3>
                  <p>The dashboard shows your real transaction, fee and payout records. Stripe
                    controls settlement and bank transfers. Veyro records payout requests and
                    notifies your guardian; a request is not confirmation that money has been sent.</p>
                </li>
              </ol>
            </section>

            <section className="how-chapter" id="roles" aria-labelledby="roles-heading">
              <div className="how-chapter-head">
                <h2 id="roles-heading">Who does what</h2>
                <p>Four distinct roles. Veyro is software, not a bank or payment processor.</p>
              </div>
              <RoleStack />
              <p>
                Stripe verifies the adult, processes the customer&rsquo;s payment, holds the payment
                balance, sets its processing fees and sends payouts. Veyro guides setup and keeps
                products, payments, guardian updates and annual earnings summaries in one place.
                Veyro never holds your money, card details or identity documents.
              </p>
            </section>

            <section className="how-chapter" id="provider-reply" aria-labelledby="reply-heading">
              <div className="how-chapter-head">
                <h2 id="reply-heading">Stripe&rsquo;s written reply</h2>
                <p>What the provider confirmed, and the limits of that confirmation.</p>
              </div>
              <p>
                We asked Stripe whether a platform could onboard founders aged 13 to 17 with a
                guardian, which Connect account types support it, where the route is available,
                and whether Stripe should collect verification documents directly. This is a
                summary of our question, not a quotation.
              </p>
              <p>Arthur at Stripe Support replied on {REPLY_DATE}. Everything attributed to Stripe below is quoted exactly.</p>

              <h3>The age and guardian requirement</h3>
              <Quote>&ldquo;{Q_CORE}&rdquo;</Quote>
              <p>
                The guardian&rsquo;s involvement must be completed through Stripe onboarding
                <em> before</em> the account accepts charges or receives payouts. Consent on its
                own is not completed payment setup.
              </p>

              <h3>The supported account types</h3>
              <Quote>&ldquo;{Q_TYPES}&rdquo;</Quote>
              <p>
                We had relied on older guidance that set an 18-plus minimum for Express and
                Custom. Stripe corrected that: all three account types can support users aged
                13 to 17 with guardian involvement, subject to availability. Veyro currently uses Standard.
              </p>

              <h3>Country availability</h3>
              <Quote>&ldquo;{Q_COUNTRIES}&rdquo;</Quote>
              <p>
                The United States is confirmed by name. Brazil is excluded for under-18 account
                holders, even with a guardian. Other countries were not individually confirmed:
                country-specific requirements still apply, and the checker makes that distinction visible.
              </p>

              <h3>Verification and architecture</h3>
              <Quote>&ldquo;{Q_ONBOARDING}&rdquo;</Quote>
              <Quote>&ldquo;{Q_ARCHITECTURE}&rdquo;</Quote>
              <p>
                Veyro uses Stripe-hosted onboarding. Stripe collects the verification details;
                Veyro stores the account reference, guardian relationship and payment records.
              </p>

              <aside className="how-evidence-note">
                <h3>Provider guidance is not legal approval</h3>
                <p>
                  This is a support reply, not a legal guarantee or approval of a specific
                  platform configuration. A provider permitting the route does not settle
                  local law. Check Stripe&rsquo;s current guidance on{" "}
                  <a href={HELP_AGE} className="linkbtn" target="_blank" rel="noopener noreferrer">account age requirements</a>{" "}
                  and{" "}
                  <a href={HELP_VERIFY} className="linkbtn" target="_blank" rel="noopener noreferrer">platform verification requirements</a>.
                </p>
              </aside>
            </section>

            <section className="how-chapter" id="countries" aria-labelledby="countries-heading">
              <div className="how-chapter-head">
                <h2 id="countries-heading">Country and age limits</h2>
                <p>Provider access and legal contracting age answer different questions.</p>
              </div>
              <p>
                Stripe&rsquo;s self-serve route is available in 43 countries. India and Indonesia
                require sales contact rather than self-serve signup. Five additional countries
                use Paystack, Stripe&rsquo;s extended network, whose different terms we have not
                assessed. Brazil requires account holders to be at least 18.
              </p>
              <dl className="how-country-list">
                <div>
                  <dt>United States</dt>
                  <dd>Confirmed by name in Stripe&rsquo;s reply. The checker also cites a source
                    for local contracting age; it is the strongest provider confirmation we have.</dd>
                </div>
                <div>
                  <dt>Brazil</dt>
                  <dd>Excluded for under-18 account holders. A guardian does not remove Stripe&rsquo;s stated age restriction.</dd>
                </div>
                <div>
                  <dt>United Kingdom, Europe and other self-serve countries</dt>
                  <dd>The checker treats these as open, with a clear qualification: Stripe
                    confirmed the mechanism, not every individual country. Local contracting
                    ages have named sources, and payment setup remains subject to Stripe&rsquo;s requirements.</dd>
                </div>
                <div>
                  <dt>Nigeria, Kenya, Ghana, South Africa and Côte d&rsquo;Ivoire</dt>
                  <dd>These use Paystack. We do not assume its rules are the same as Stripe&rsquo;s.</dd>
                </div>
              </dl>
              <h3>Age can depend on your region</h3>
              <p>
                Scotland is 16 under the Age of Legal Capacity (Scotland) Act 1991. Seven
                Canadian provinces and territories use 19. Mississippi is 21; Alabama and
                Nebraska are 19. Singapore separates contracting capacity from the age of
                majority and lowered contracting capacity to 18 in 2009.
              </p>
              <p>
                The checker distinguishes confirmed, primary, secondary and disputed sources
                rather than hiding uncertainty. It asks for a region where the local age differs.
                <Link className="linkbtn" href="/check"> Check what applies where you live</Link>.
              </p>
              <aside className="how-evidence-note">
                <h3>The legal question remains open</h3>
                <p>Whether a minor may hold a payment account with a guardian as representative
                  has not been confirmed by a lawyer in any country, including the United States.
                  <Link className="linkbtn" href="/legal"> Read the legal position and known gaps</Link>.</p>
              </aside>
            </section>

            <section className="how-chapter" id="account-limits" aria-labelledby="limits-heading">
              <div className="how-chapter-head">
                <h2 id="limits-heading">Account limitations</h2>
                <p>What the current integration supports, and what it cannot promise.</p>
              </div>
              <dl className="how-limit-list">
                <div>
                  <dt>Veyro uses Stripe Connect Standard</dt>
                  <dd>Veyro&rsquo;s platform is registered in the UAE, where Express and Custom
                    connected accounts are not available through the self-serve route. This
                    platform restriction is separate from the under-18 rules.</dd>
                </div>
                <div>
                  <dt>The account controls its payout schedule</dt>
                  <dd>Standard provides its own Stripe dashboard. Veyro cannot hold money,
                    delay a payout or add a guardian approval step to each payout. The guardian
                    receives notifications and records, while account controls remain in Stripe.</dd>
                </div>
                <div>
                  <dt>The verified person must be the guardian</dt>
                  <dd>The guardian completes setup from their own signed-in session. Veyro
                    re-reads the account from Stripe and checks the verified individual against
                    the expected guardian. A mismatch prevents the account from being treated as
                    ready. Veyro cannot control who enters details in Stripe&rsquo;s form.</dd>
                </div>
                <div>
                  <dt>The integration still uses Accounts v1</dt>
                  <dd>Stripe now recommends a newer API for new Connect integrations.
                    Migration remains in development; this page does not present it as complete.</dd>
                </div>
              </dl>
              <p>
                Annual earnings and payout summaries are records to share with an accountant,
                not tax returns or tax advice. Veyro does not promise to file your taxes.
              </p>
            </section>

            <section className="how-chapter" id="money" aria-labelledby="money-heading">
              <div className="how-chapter-head">
                <h2 id="money-heading">Money and guardian controls</h2>
                <p>Your product stays yours. The payment account has a verified adult behind it.</p>
              </div>
              <div className="how-guardian">
                <GuardianPermissions />
              </div>
              <p>
                Your guardian can change the payment account&rsquo;s settings, payout schedule or
                bank details in Stripe, and can close or freeze it. Veyro does not provide
                per-sale or per-payout approval controls. Stripe can ask the guardian to verify
                again after setup. <Link className="linkbtn" href="/for-parents">Read the guardian responsibilities</Link>.
              </p>

              <section className="how-wallet" aria-labelledby="wallet-example-heading">
                <h3 id="wallet-example-heading">From a payment to available funds</h3>
                <p>
                  A customer opens your checkout, Stripe processes the payment, and Veyro
                  records its status. A settling payment is not yet available. Stripe handles
                  the eventual bank transfer under the account&rsquo;s settings.
                </p>
                <p className="small">Illustrative wallet below. These are example amounts and payment states, not a real account or a new payment.</p>
                <LiveWallet />
              </section>

              <div className="how-payment-options">
                <h3>Choose how customers pay</h3>
                <p>Share a product&rsquo;s checkout link, or add checkout to your app with the
                  SDK or API. Both use the same payment account; payment details are handled by Stripe.</p>
                <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
                  <Link className="linkbtn" href="/get-started">See the checkout setup</Link>
                  <Link className="linkbtn" href="/docs/sdk">Read the integration guide</Link>
                </div>
              </div>
            </section>

            <section className="how-next" aria-labelledby="next-heading">
              <h2 id="next-heading">Find out what applies to you.</h2>
              <p>Check your country and age before making an account. The result shows the
                relevant requirements, the limits of the evidence, and when you do not need Veyro.</p>
              <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
                <Link className="btn btn-lg" href="/check">Check eligibility</Link>
                <a className="linkbtn" href={HELP_AGE} target="_blank" rel="noopener noreferrer">Read Stripe&rsquo;s Help Center</a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <ScrollTop />
      <SiteFooter />
    </div>
  );
}
