import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import { SiteFooter } from "@/app/_ui/SiteFooter";
import { RoleStack } from "@/app/_ui/RoleStack";
import { ScrollProgress } from "@/app/_ui/ScrollProgress";
import { ScrollTop } from "@/app/_ui/ScrollTop";
import { StickyCta } from "@/app/_ui/StickyCta";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { FlowDiagram } from "@/app/_ui/FlowDiagram";
import { GuardianPermissions } from "@/app/_ui/GuardianPermissions";
import { MoneyRail } from "@/app/_ui/MoneyRail";
import { ParentAccount } from "@/app/_ui/ParentAccount";
import { LiveWallet } from "@/app/_ui/LiveWallet";
import { AudienceSplit } from "@/app/_ui/AudienceSplit";
import { MarginNote } from "@/app/_ui/MarginNote";

export const metadata = buildMetadata("how");
export const viewport = buildViewport();

// A Server Component on purpose. The whole point of this page is that a
// crawler reads the argument without executing a line of JavaScript, so
// there is no "use client" here and no interactivity beyond links.

const UPDATED = "13 September 2026";
const REPLY_DATE = "8 September 2026";

const HELP_AGE = "https://support.stripe.com/questions/age-requirement-to-create-a-stripe-account";
const HELP_VERIFY =
  "https://support.stripe.com/questions/us-verification-requirements-for-platforms-with-custom-accounts-faq";

// Quoted material, kept in one place and verbatim, so it can be checked against
// the original at a glance rather than hunted through JSX.
const Q_CORE =
  "A user who is at least 13 years old can create a Connect account, and where the user is " +
  "under 18, the required parent or legal guardian involvement must be completed through " +
  "Stripe's onboarding process before the account can accept charges or receive payouts.";

const Q_TYPES =
  "The current guidance is that Standard, Express, and Custom Connect accounts can support " +
  "users aged 13–17 with legal guardian involvement, subject to country availability. If you " +
  "have come across older information indicating an 18+ minimum for Express or Custom accounts, " +
  "please follow the current Help Center guidance.";

const Q_COUNTRIES =
  "For your planned launch countries, the US is supported under this process. Country-specific " +
  "requirements may apply, and availability for certain minor onboarding flows can vary by " +
  "country. Brazil remains an exception where users must be at least 18 years old.";

const Q_ONBOARDING =
  "We recommend using Stripe-hosted onboarding or embedded onboarding components so that Stripe " +
  "can collect and verify the required information directly. These onboarding flows automatically " +
  "reflect current verification and compliance requirements.";

const Q_ARCHITECTURE =
  "From the architecture you've outlined, using Stripe-hosted onboarding for identity " +
  "verification while not handling identity documents, banking credentials, or funds directly is " +
  "the recommended approach.";

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "16px 0 0",
        padding: "2px 0 2px 20px",
        borderLeft: "2px solid var(--brand)",
        fontSize: "var(--fs-4)",
        lineHeight: 1.6,
        color: "var(--ink)",
        maxWidth: "var(--m-body)",
      }}
    >
      {children}
    </blockquote>
  );
}

export default function HowItWorks() {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <ScrollProgress />
      <SkipLink />

      <div className="navbar">
        <div className="wrap-lp">
          <nav className="lp-nav" aria-label="Main">
            <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
            <div className="lp-links">
              <Link className="btn btn-q btn-sm hide-s" href="/for-parents">For parents</Link>
              <Link className="btn btn-2 btn-sm" href="/check">Check what applies to you</Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* paddingBottom is inline, so it overrides .has-sticky's 86px on mobile.
          It must stay at or above 86 or the sticky CTA will cover the last
          paragraph. The class is kept because it states the intent. */}
      {/* Chaptered, not railed.
          ------------------------------------------------------------------
          Measured before the change: 9,400px, 2,986 words, thirteen <h2>s at
          one weight in a single 52ch column, and the only call to action at
          8,526px -- 91% of the way down. The page had the right content and
          the shape of a transcript.

          It is full-width chapters now, with the ground alternating at each
          boundary so a reader can see where one argument ends. .longform
          stays INSIDE each chapter, which is what keeps the reading measure
          and the margin notes working; the chapters only change what happens
          outside the text column.

          The rail went with it. A sticky index of thirteen flat headings was
          a symptom of the problem rather than a fix for it, and chapters that
          look different do the job it was doing. */}
      <main id="main" className="has-sticky">

        <div className="hero-band">
          <div className="wrap-lp gs-hero">
            <div className="gs-hero-grid">
              <div>
                <p className="hero-kicker">
                  <span className="hero-kicker-dot" aria-hidden="true" />
                  How it works
                </p>
                <h1 className="hero-h1">What Veyro does, and what Stripe does.</h1>
                <p className="hero-lead">
                  Stripe moves the money, and has let a 13-year-old hold an account with an adult
                  behind it for years. Veyro is everything around that: proving the arrangement is
                  lawful, getting your parent through it in one sitting, and keeping the account
                  straight after.
                </p>
                <div className="hero-cta">
                  <Link className="btn btn-lg" href="/check">Check what applies to you</Link>
                  <Link className="btn btn-2 btn-lg" href="/get-started">See the whole path</Link>
                </div>
                <p className="tiny" style={{ marginTop: "var(--sp-6)", maxWidth: "46ch" }}>
                  Last checked {UPDATED}. The rules underneath this change, and when they do this
                  page changes with them. Nothing here is legal or tax advice.
                </p>
              </div>

              {/* The shape of it in one picture, before any of the argument.
                  A reader who has this reads the rest as detail rather than
                  as persuasion. The detailed version of the same path is in
                  "How the money moves" near the end; this is the short one. */}
              <MoneyRail />
            </div>
          </div>
        </div>

        <section className="lp ch ch-surface">
          <div className="wrap-lp longform">
        <h2 className="h3" style={{ marginTop: 0 }}>In order</h2>
        <ol className="numbered" style={{ marginTop: 16 }}>
          <li>
            <span>You sign up</span>
            <span>
              Two questions that matter: where you live and when you were born. Those decide
              whether this is open to you at all, and the checker answers it before you make an
              account.
            </span>
          </li>
          <li>
            <span>Your parent verifies and approves, once</span>
            <span>
              They go through Stripe&rsquo;s own hosted form with their own ID. Veyro never sees
              the documents. This is the only thing they have to do, and they do not do it again.
            </span>
          </li>
          <li>
            <span>The Stripe account is created, and you control the payouts</span>
            <span>
              Your parent is the account owner on paper &mdash; an adult has to be the enforceable
              party, which is what makes the whole thing lawful. You decide where the money goes
              and when you take it out, without asking them each time.
            </span>
          </li>
          <li>
            <span>You paste a snippet, or send a link</span>
            <span>
              Two calls and no package to install, or skip the code entirely and send the checkout
              link to whoever is buying.{" "}
              <Link className="linkbtn" href="/docs/sdk">The integration guide</Link>.
            </span>
          </li>
          <li>
            <span>You get paid</span>
            <span>
              Money lands in the Stripe account. The dashboard folds every payment, fee and refund
              into one position so the number you see is the number you can take.
            </span>
          </li>
          <li>
            <span>Veyro keeps the account straight</span>
            <span>
              Watching what Stripe still needs from the account, surfacing it before it becomes a
              problem, and handling the tax paperwork. This is the part that does not exist
              anywhere else, and it is the part you are actually paying for if you ever pay.
            </span>
          </li>
        </ol>

        <h2 className="h3" style={{ marginTop: 36 }}>Who does what</h2>
        <div className="paths" style={{ marginTop: 20 }}>
          <div className="path">
            <span className="path-k">Stripe</span>
            <h3 className="path-t">The money</h3>
            <p className="path-d">
              Takes the card, holds the balance, pays it out, verifies your parent, sets and
              deducts its own fees. Veyro is never in the path of the money and never holds it.
            </p>
          </div>
          <div className="path" data-on="1">
            <span className="path-k">Veyro</span>
            <h3 className="path-t">Everything around it</h3>
            <p className="path-d">
              Proving the route is lawful, getting your parent through setup once, the dashboard,
              the integration, and watching the account&rsquo;s standing as you earn.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp longform">
        <div className="truthgrid" style={{ marginBottom: 40, alignItems: "start" }}>
          <div>
            <h2 className="h3" style={{ marginTop: 0 }}>Four parties, in order</h2>
            <p className="small" style={{ marginTop: 12 }}>
              The most common misunderstanding is that Veyro is the payment provider. It is not.
              Money moves between a customer and the founder&rsquo;s own Stripe account, and Veyro
              is never in that path.
            </p>
          </div>
          <RoleStack />
        </div>

        <h2 className="h3">What everyone else gets wrong</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Search it and the answer comes back unanimous: you have to be 18 to accept online
          payments. Forums say it. Blog posts say it. Ask an AI assistant and it will tell you the
          same thing, confidently, without a source.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          It is wrong. Not wildly wrong: it is true of most routes you might try, and true of the
          ones people usually try first. But it is false in the one case that matters, and nobody
          writes about that case because it is unglamorous and involves asking a parent.
        </p>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        {/* Moved from the homepage, and this is where the argument was
            always going. The chapter above ends on "nobody writes about
            that case because it is unglamorous and involves asking a
            parent" -- and then changed the subject. This is that case,
            answered in the reader's own words. */}
        <section className="lp ch ch-surface">
          <div className="wrap-lp">
            <ParentAccount />
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp longform">
        <h2 className="h3" style={{ marginTop: 32 }}>What we established</h2>
        <p className="body" style={{ marginTop: 8 }}>
          We wrote to Stripe support describing the model in plain terms. A platform onboarding
          founders aged 13 to 17, with a parent or legal guardian as the adult on the account, and
          asked four things: whether a platform may facilitate that at all, which Connect account
          types support it, whether it is available in the countries we planned to launch in, and
          whether our architecture, in which Stripe collects the identity documents and we never
          touch them, was the right shape.
        </p>
        <p className="tiny" style={{ marginTop: 8 }}>
          That is a summary of our message, not a quotation of it. Everything attributed to Stripe
          below is quoted exactly.
        </p>

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3" style={{ marginTop: 32 }}>The rules, in writing</h2>
        <p className="body" style={{ marginTop: 8 }}>
          The reply came from Arthur at Stripe Support on {REPLY_DATE}. The core of it:
        </p>
        <Quote>&ldquo;{Q_CORE}&rdquo;</Quote>
        <p className="body" style={{ marginTop: 16 }}>
          That sentence is what the rest of this site is built on. Thirteen, not eighteen. And the
          guardian&rsquo;s involvement is not a formality bolted on afterwards. It has to be
          completed through Stripe&rsquo;s own onboarding <em>before</em> the account can take a
          single payment or send a single payout.
        </p>

        <h3 className="h4" style={{ marginTop: 24 }}>On account types, where they corrected us</h3>
        <Quote>&ldquo;{Q_TYPES}&rdquo;</Quote>
        <p className="body" style={{ marginTop: 16 }}>
          We had been working from the older guidance. Every note in our own source files said
          Express and Custom were 18+ and blocked signup at the door. Stripe says that is
          superseded: all three account types support 13 to 17 with guardian involvement. We were
          wrong, it came from a stale page, and we have corrected it here and in the checker rather
          than quietly editing it out.
        </p>

        <h3 className="h4" style={{ marginTop: 24 }}>On countries</h3>
        <Quote>&ldquo;{Q_COUNTRIES}&rdquo;</Quote>
        <p className="body" style={{ marginTop: 16 }}>
          Three separate facts in one paragraph, and we treat them separately. The US is{" "}
          <strong>confirmed by name</strong>. Brazil is <strong>excluded</strong>: 18 or over,
          guardian or no guardian, and the checker says exactly that to anyone in Brazil who is
          younger. Everywhere else sits under &ldquo;country-specific requirements may apply&rdquo;:
          not refused, not individually confirmed either. The checker treats those as open, because
          Stripe confirmed the mechanism and no country&rsquo;s law we have found prohibits it, but
          it says plainly, in the result, that Stripe named only the US and that you would find out
          for certain at the Stripe step.
        </p>

        <h3 className="h4" style={{ marginTop: 24 }}>On how it should be built</h3>
        <Quote>&ldquo;{Q_ONBOARDING}&rdquo;</Quote>
        <Quote>&ldquo;{Q_ARCHITECTURE}&rdquo;</Quote>
        <p className="body" style={{ marginTop: 16 }}>
          This was the part we were most relieved by, because it was already the design. Identity
          documents go to Stripe&rsquo;s hosted form, not to us. We never see a passport, a banking
          credential, or the money. What we hold is the business, the guardian relationship, the
          ledger and the record.
        </p>

        <div
          className="panel"
          style={{
            marginTop: 24,
            borderTop: "1px solid var(--amber-line)",
            background: "var(--amber-bg)",
          }}
        >
          <div className="lbl" style={{ marginBottom: 4 }}>What this reply is, and isn&rsquo;t</div>
          <p className="small">
            This is a support reply, not a legal guarantee. It reflects Stripe&rsquo;s current
            guidance. Always check their Help Center for updates:{" "}
            <a href={HELP_AGE} className="linkbtn" target="_blank" rel="noopener noreferrer">
              age requirement to create a Stripe account
            </a>{" "}
            and{" "}
            <a href={HELP_VERIFY} className="linkbtn" target="_blank" rel="noopener noreferrer">
              verification requirements for platforms
            </a>
            . It also tells us what the provider permits, which is a different question from what
            the law where you live settles, and neither is the same as a specific
            platform&rsquo;s configuration having been approved.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp longform">
        <h2 className="h3" style={{ marginTop: 32 }}>What we hit building it</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Getting an answer is one thing. Building on it is another. Four things we hit, in the
          order we hit them.
        </p>

        <ol className="numbered" style={{ marginTop: 20 }}>
          <li>
            <span>Our own country decides which account types we can offer</span>
            <span>
              Stripe&rsquo;s reply says Standard, Express and Custom all support 13 to 17. We can
              only use Standard, not because of the age rules, but because Veyro&rsquo;s platform
              account is registered in the UAE, and Stripe does not let UAE-registered platforms
              self-serve Express or Custom connected accounts. Two unrelated rules. The second one
              is ours to live with.
            </span>
          </li>
          <li>
            <span>Standard hands the account holder the keys, and that costs you a promise</span>
            <span>
              A Standard connected account comes with a full Stripe dashboard and its own payout
              schedule. The platform cannot hold the money, delay a payout, or approve one, so
              Veyro has no per-payout approval to offer: your guardian is notified of every
              request and keeps a permanent record, and that is all we give them. What Standard
              does give them is the account &mdash; the dashboard, the bank details, the payout
              schedule, the ability to close it. So the accurate sentence is that Veyro gives
              them no veto, not that nobody has one. On Express or Custom we could build an
              approval step, which means our platform&rsquo;s registration rather than the
              under-18 rules is why that feature does not exist. If another product promises a
              per-payout guardian veto, ask which account type it uses.
            </span>
          </li>
          <li>
            <span>The guardian has to be the verified adult, and that needs enforcing</span>
            <span>
              The first connected account we opened in testing had the founder&rsquo;s email on it,
              which made the founder, a minor, the individual Stripe had verified. Wrong person,
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
              migration currently in development. It is written here rather than left for you to find
              out from a changelog.
            </span>
          </li>
        </ol>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp longform">
        <MarginNote head="Where it reaches">
          <span className="fig fig-md">43</span>
          countries can sign up directly. Two are sales-contact only, five run on an extended
          network whose rules we have not read, and Brazil is 18 and over.{" "}
          <Link className="linkbtn" href="/check">Check yours</Link>.
        </MarginNote>

        <h2 className="h3" style={{ marginTop: 32 }}>What this means where you live</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Two questions decide it, and most people only ask the first.
        </p>

        <h3 className="h4" style={{ marginTop: 20 }}>Can the provider reach your country at all?</h3>
        <p className="body" style={{ marginTop: 8 }}>
          43 countries can sign up directly. Two of them, India and Indonesia, are preview only, meaning
          you contact Stripe sales rather than signing up yourself, so there is no self-serve route
          for us to build on. Five run through Paystack, Stripe&rsquo;s extended network, a
          different company with different terms that we have not read and will not guess at. And
          Brazil is supported, but only for account holders of 18 or over.
        </p>

        <h3 className="h4" style={{ marginTop: 20 }}>
          At what age can you sign a binding contract where you live?
        </h3>
        <p className="body" style={{ marginTop: 8 }}>
          This is the one people miss. It is not 18 everywhere, and it is frequently not set
          nationally. Scotland is 16, under the Age of Legal Capacity (Scotland) Act 1991. Seven
          Canadian provinces and territories are 19. Mississippi is 21; Alabama and Nebraska are 19.
          Singapore separates contracting capacity from the age of majority altogether and lowered
          the first to 18 in 2009, expressly so that young people could do business.
        </p>

        <p className="body" style={{ marginTop: 16 }}>
          The checker grades every country by how well it has actually been checked: the guidance
          in the reply above for the provider half, a statute or official source for the local
          contracting age. It shows you the grade rather than hiding it:
        </p>

        <ul className="arrowlist" style={{ marginTop: 12 }}>
          <li>
            <strong>United States</strong>: confirmed by Stripe in the reply above, and the
            contracting age confirmed against a named source. The strongest case we have.
          </li>
          <li>
            <strong>Brazil</strong>: excluded. Stripe named it as the exception: 18 or over, full
            stop. The checker says so rather than walking you into a rejection.
          </li>
          <li>
            <strong>The United Kingdom, Europe and the rest of the self-serve list</strong>: open.
            Stripe confirmed the mechanism, the local contracting age comes from a named source, and
            we have found no law that prohibits a guardian being the adult on the account. What
            Stripe would not confirm is availability country by country, so the checker says that in
            the result rather than either hiding it or treating the whole country as unknown.
          </li>
          <li>
            <strong>Nigeria, Kenya, Ghana, South Africa, Côte d&rsquo;Ivoire</strong>: Paystack,
            not Stripe. Another company&rsquo;s rules, which we have not read.
          </li>
        </ul>

        <div className="panel" style={{ marginTop: 24 }}>
          <div className="lbl" style={{ marginBottom: 4 }}>The part that gates everything</div>
          <p className="small">
            Whether a minor may hold a payment account with a guardian as representative has not
            been confirmed by a lawyer in <em>any</em> country, including the US. Provider policy
            permitting something is not the same as it being settled locally. That belongs here, in the
            middle of the article, rather than buried in a terms page.
          </p>
        </div>

        {/* ----------------------------------------------------------------
            The three things the homepage used to explain in three chapters.
            They moved here when the homepage stopped explaining and started
            showing: this is the page for someone who wants the mechanics, and
            keeping them on a page nobody had scrolled to was the reason the
            homepage was so long. */}
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp longform">
        <h2 className="h3">An adult on the account, not on your business</h2>
        <p className="body" style={{ marginTop: 8 }}>
          This is the part people get wrong, so it is worth being exact. Stripe needs a verified
          adult behind every account. Your guardian is that adult. They are not a partner, not an
          owner and not an approver: they do not own what you build, they cannot take your
          products off you, and Veyro gives them no button to approve or refuse a payout. What
          they do is one identity check, once, on Stripe&rsquo;s own form &mdash; and then they
          get told every time you request money, and keep a permanent record of it. They do own
          the Stripe account, though, so closing it or changing where the money lands is theirs
          to do; it happens in Stripe rather than here, and it is a conversation rather than a
          control panel. <Link className="linkbtn" href="/for-parents">What a guardian is
          agreeing to</Link>.
        </p>

        {/* The same checklist the homepage shows, directly under the paragraph
            it is summarising. Two statements of one sensitive claim beats one
            statement someone can skim past. */}
        <div style={{ marginTop: "var(--sp-6)" }}>
          <GuardianPermissions />
        </div>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        <section className="lp ch ch-surface">
          <div className="wrap-lp longform">
        <MarginNote head="Veyro never holds it">
          The money goes from the customer to an account in your guardian&rsquo;s name. We are the
          checkout at one end and the record at the other, and never in the path between.
        </MarginNote>

        <h2 className="h3">How the money moves</h2>
        <p className="body" style={{ marginTop: 8, marginBottom: 24 }}>
          Five stops, one direction. Veyro is the first stop and the last; the money itself only
          ever touches Stripe.
        </p>
        <FlowDiagram
          label="Where a payment goes, in order"
          stops={[
            { n: "Customer", t: "Pays", d: "On a page with your name and price on it." },
            { n: "Checkout", t: "Veyro's page", d: "You send a link. Nothing to build.", you: true },
            { n: "Stripe", t: "Takes the card", d: "Processes it. Veyro never sees the number." },
            { n: "Your account", t: "Holds the money", d: "In your name, with your guardian verified on it." },
            { n: "Veyro", t: "Records it", d: "Folds it into your ledger. Never in the path of the money.", you: true },
          ]}
        />
        <p className="small" style={{ marginTop: 20 }}>
          Your customer pays by card on Stripe&rsquo;s own hosted page, so the card number never
          reaches your app or ours.{" "}
          <Link className="linkbtn" href="/get-started">What your customer sees at the middle stop</Link>.
        </p>

        {/* The diagram above says where the money goes; this is what the last
            stop actually looks like once it gets there. A page that explains
            a path for four hundred words and never shows the destination is
            asking the reader to take the destination on trust. */}
        <p className="body" style={{ marginTop: "var(--sp-7)" }}>
          And this is the last stop, as you would see it: a sale arriving, settling, and becoming
          money you can ask for.
        </p>
        <LiveWallet />

        {/* ---------------------------------------------------------------- */}
        <h2 className="h3">Two ways to take the payment</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Both take the same money into the same account. Pick whichever matches what you have
          built so far.
        </p>
        <div className="paths" style={{ marginTop: 20 }}>
          <div className="path">
            <span className="path-k">No code</span>
            <h3 className="path-t">Send a link</h3>
            <p className="path-d">
              Make a product, copy its checkout link, and put it wherever your buyers already
              are &mdash; a bio, a DM, a post. Nothing to build.
            </p>
          </div>
          <div className="path" data-on="1">
            <span className="path-k">In your app</span>
            <h3 className="path-t">Paste code</h3>
            <p className="path-d">
              Two calls, no package to install, no rebuild. Your buy button opens a checkout and
              you unlock what you sold when it comes back paid.{" "}
              <Link className="linkbtn" href="/docs/sdk">The integration guide</Link>.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
          </div>
        </section>

        <section className="lp ch">
          <div className="wrap-lp longform">
        <h2 className="h3">Whichever of the two you are</h2>
        <p className="body" style={{ marginTop: 8 }}>
          This page is written for both of you, which means half of it is addressed to someone
          else whichever one you are. The short version, split:
        </p>
        <AudienceSplit />


        <h2 className="h3">Find out what applies to you</h2>
        <p className="body" style={{ marginTop: 8 }}>
          Two questions: where you live and what year you were born. It runs in your browser, takes
          about twenty seconds, and tells you when you don&rsquo;t need us at all. Its country data
          comes from the guidance quoted above, plus a named source for the contracting age in each
          country. A country is treated as open unless its own law sets a higher age or the provider
          carves it out.
        </p>
        <div className="row" style={{ marginTop: 16, gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-lg" href="/check">Check what applies to you</Link>
          <a className="btn btn-2 btn-lg" href={HELP_AGE} target="_blank" rel="noopener noreferrer">
            Read Stripe&rsquo;s Help Center
          </a>
        </div>
          </div>
        </section>
      </main>

      <ScrollTop />
      <StickyCta label="Check what applies to you" />
      <SiteFooter />
    </div>
  );
}
