import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { LegalShell, Clause, SUPPORT_EMAIL } from "@/app/_ui/LegalShell";

export const metadata = buildMetadata("privacy");
export const viewport = buildViewport();

const UPDATED = "16 September 2026";

const SECTIONS = [
  { n: 1, title: "What we collect" },
  { n: 2, title: "What we are built never to receive" },
  { n: 3, title: "Why we hold it" },
  { n: 4, title: "Who can see what" },
  { n: 5, title: "Who we share it with" },
  { n: 6, title: "Cookies" },
  { n: 7, title: "How long we keep it" },
  { n: 8, title: "Your rights" },
  { n: 9, title: "People under 18" },
  { n: 10, title: "Changes to this policy" },
];

export default function Privacy() {
  return (
    <LegalShell
      title="Privacy Policy"
      lead="What Veyro holds, what it is built never to receive, and how data about people under 18 is handled."
      updated={UPDATED}
      sections={SECTIONS}
    >
      <Clause n={1} title="What we collect">
        <p className="body" style={{ marginTop: 0 }}>
          When you create an account: your <strong>name</strong>, <strong>email address</strong>,{" "}
          <strong>date of birth</strong>, <strong>country</strong>, and a hash of your password. The
          password itself is never stored, only an argon2id hash of it, which cannot be reversed.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          When you use it: the products you list (name, description, price), payments recorded
          against your account, payout requests, guardian invitations and their outcome, and an
          audit log of significant actions with timestamps.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Date of birth is collected because the age rules turn on the exact date. A year alone
          cannot prove the 13 floor, and a guardian must be 18 or over. It is never shown publicly.
        </p>
      </Clause>

      <Clause n={2} title="What we are built never to receive">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro does <strong>not</strong> collect or store:
        </p>
        <ul className="arrowlist" style={{ marginTop: 12 }}>
          <li>
            <strong>Identity documents.</strong> Passports, driving licences, national ID numbers,
            Social Security numbers. These are entered on Stripe&rsquo;s own hosted form, which we
            link you to and do not sit in front of.
          </li>
          <li>
            <strong>Bank account or card details.</strong> Payout bank details go to Stripe. A
            customer&rsquo;s card details are entered into Stripe&rsquo;s payment element and never
            touch our servers.
          </li>
        </ul>
        <p className="body" style={{ marginTop: 12 }}>
          This is a deliberate architectural choice, not a promise about our intentions. We store a
          reference to the Stripe account and nothing that would let anyone impersonate you.
        </p>
      </Clause>

      <Clause n={3} title="Why we hold it">
        <p className="body" style={{ marginTop: 0 }}>
          To run the service you asked for: to sign you in, to decide which age and country rules
          apply to you, to link a founder to a consenting guardian, to show a wallet folded from
          your own records, and to keep an audit trail of who agreed to what and when. That last
          one matters most where a minor is involved, and it is the reason the log exists.
        </p>
      </Clause>

      <Clause n={4} title="Who can see what">
        <p className="body" style={{ marginTop: 0 }}>
          A <strong>guardian</strong> who has consented for a founder can see that founder&rsquo;s
          products, balances, transactions and payout requests. That visibility is the point of the
          arrangement, and the founder agrees to it by sending the invitation.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          A <strong>founder</strong> can see who their guardian is and when they consented. A
          guardian&rsquo;s identity documents are not visible to the founder, because Veyro does not
          have them.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Nobody else can see either. Access is checked against the database on every request, not
          taken from anything the browser claims.
        </p>
      </Clause>

      <Clause n={5} title="Who we share it with">
        <p className="body" style={{ marginTop: 0 }}>
          Three processors, each for one purpose:
        </p>
        <ul className="arrowlist" style={{ marginTop: 12 }}>
          <li>
            <strong>Stripe</strong>, to open and operate the payment account, and to process
            payments. Stripe is a separate data controller for what you give it directly, under its
            own privacy policy.
          </li>
          <li>
            <strong>Vercel</strong>, which hosts and serves the application, and which also
            provides the aggregate page-view analytics described in section 6.
          </li>
          <li>
            <strong>Neon</strong>, which hosts the PostgreSQL database, running on AWS
            infrastructure.
          </li>
        </ul>
        <p className="body" style={{ marginTop: 12 }}>
          We do not sell personal data, we do not share it with advertisers, and there is no
          advertising or tracking network embedded in this site.
        </p>
      </Clause>

      <Clause n={6} title="Cookies">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro sets <strong>one cookie</strong>: a session cookie that keeps you signed in. It is
          httpOnly, so page scripts cannot read it; Secure in production, so it is only sent over
          HTTPS; and SameSite=Lax, which blocks most cross-site request forgery. It holds a random
          token, not your identity, and only a hash of that token is stored on our side.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          That cookie is strictly necessary to provide a service you have asked for, so no consent
          banner is required for it and none is shown. There are still{" "}
          <strong>no analytics cookies, no advertising cookies and no third-party trackers</strong>.
          If that ever changes, a real consent banner will appear before the cookie is set, not
          after.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          We do measure how the site is used, with <strong>Vercel Web Analytics</strong>. It is
          cookieless and stores nothing in your browser, which we checked against the package
          itself rather than taking on trust. It records which page was viewed, the referring site,
          the country the request came from, and the general device type. Vercel derives the
          country from your IP address and does not keep the address itself, and the identifier it
          uses to count a visit is rotated daily, so it cannot follow you across days or onto other
          sites.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          What it is not: there is no session recording, no heatmap, no profile of you, and nothing
          is shared with an advertising network. We chose it over the tools that do those things
          because most of the people here are under 18, and behavioural tracking of children sits
          badly next to everything else on this page.
        </p>
      </Clause>

      <Clause n={7} title="How long we keep it">
        <p className="body" style={{ marginTop: 0 }}>
          Account data is kept while your account is open. Sessions expire on their own and are
          revoked when you sign out or change your password.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Transaction and audit records are kept after an account closes, because financial records
          and a record of guardian consent are exactly the things that need to survive a dispute.
          Where a retention period is set by law, that period governs.
        </p>
      </Clause>

      <Clause n={8} title="Your rights">
        <p className="body" style={{ marginTop: 0 }}>
          You can ask for a copy of what we hold about you, ask us to correct it, or ask us to
          delete your account. A guardian may make a request on behalf of a founder they consent
          for, and a founder may ask what their guardian can see.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Name and country can be changed yourself in{" "}
          <Link className="linkbtn" href="/dashboard/settings">settings</Link>. Email cannot be
          changed there yet, because Veyro cannot send mail and therefore cannot verify a new
          address, and an unverified email change is the easiest route to an account takeover.
          Email us and we will do it.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          Requests go to{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Depending on
          where you live you may also have the right to complain to a data protection regulator.
        </p>
      </Clause>

      <Clause n={9} title="People under 18">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro is used by people aged 13 and over by design. We collect the minimum needed to
          apply the age rules and to link a founder to a verified adult, and we deliberately do not
          receive the sensitive identity material that the payment provider requires, precisely so
          that it is not sitting in a startup&rsquo;s database.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          If you believe a child under 13 has created an account, tell us and we will remove it.
        </p>
      </Clause>

      <Clause n={10} title="Changes to this policy">
        <p className="body" style={{ marginTop: 0 }}>
          If this changes materially, the date at the top changes with it. We will not backdate it
          or describe it as recently updated when it has not been.
        </p>
      </Clause>
    </LegalShell>
  );
}
