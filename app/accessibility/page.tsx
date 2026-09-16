import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { LegalShell, Clause, SUPPORT_EMAIL } from "@/app/_ui/LegalShell";

export const metadata = buildMetadata("accessibility");
export const viewport = buildViewport();

const UPDATED = "16 September 2026";

const SECTIONS = [
  { n: 1, title: "The target" },
  { n: 2, title: "What has been measured" },
  { n: 3, title: "What is built in by design" },
  { n: 4, title: "What has NOT been tested" },
  { n: 5, title: "Known gaps" },
  { n: 6, title: "Tell us" },
];

export default function Accessibility() {
  return (
    <LegalShell
      title="Accessibility Statement"
      lead="What Veyro aims for, what has actually been checked, and what has not."
      updated={UPDATED}
      sections={SECTIONS}
    >
      <Clause n={1} title="The target">
        <p className="body" style={{ marginTop: 0 }}>
          Veyro aims to meet <strong>WCAG 2.1 Level AA</strong>. That is the target, not a claim of
          conformance. The sections below separate what has been measured from what has only been
          designed for, because a statement that blurs the two is worse than none.
        </p>
      </Clause>

      <Clause n={2} title="What has been measured">
        <p className="body" style={{ marginTop: 0 }}>
          <strong>Colour contrast.</strong> Every text colour in the palette was calculated against
          every background it can appear on. All combinations now meet AA for normal text, worst
          case 4.55:1.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          That audit found a real failure and it has been fixed: the tertiary text colour measured
          4.21:1 against the hero band&rsquo;s background, below the 4.5:1 threshold. It was
          darkened until every pairing cleared AA.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          <strong>Structure.</strong> Every page has one <code className="mono">h1</code>, a single
          landmark <code className="mono">main</code>, and a skip link as the first focusable
          element. Tables use real table markup with header cells, not stacked divs.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          <strong>Layout at narrow widths.</strong> Every multi-column grid has a rule collapsing it
          to one column, tables scroll inside their own container rather than widening the page, and
          nothing carries a fixed minimum width above 360px.
        </p>
      </Clause>

      <Clause n={3} title="What is built in by design">
        <ul className="arrowlist" style={{ marginTop: 0 }}>
          <li>
            Form fields are real labelled inputs. Errors are announced with{" "}
            <code className="mono">role=&quot;alert&quot;</code> and tied to their field with{" "}
            <code className="mono">aria-describedby</code> and{" "}
            <code className="mono">aria-invalid</code>, so the message reaches a screen reader
            rather than only being a red outline.
          </li>
          <li>
            Interactive elements keep a visible focus indicator. Focus rings are never removed for
            appearance.
          </li>
          <li>
            Touch targets are sized to 44px at mobile widths, above the 24px WCAG 2.2 minimum,
            because 24px is not a size a thumb reliably hits.
          </li>
          <li>
            Motion is minimal, and the stylesheet honours{" "}
            <code className="mono">prefers-reduced-motion</code>. There are no animated decorations
            to disable.
          </li>
          <li>
            The eligibility checker and the FAQ work without JavaScript. The FAQ is built from
            native disclosure elements rather than scripted toggles.
          </li>
        </ul>
      </Clause>

      <Clause n={4} title="What has NOT been tested">
        <p className="body" style={{ marginTop: 0 }}>
          Being plain about this matters more than the list above.
        </p>
        <ul className="arrowlist" style={{ marginTop: 12 }}>
          <li>
            <strong>No screen reader testing.</strong> Veyro has not been used with VoiceOver, NVDA
            or JAWS by anyone. The markup is written to be readable by them; that is not the same as
            knowing it is.
          </li>
          <li>
            <strong>No testing with assistive technology users.</strong> Nobody who relies on one
            has tried this product.
          </li>
          <li>
            <strong>No automated accessibility scan</strong> has been run in a browser, and no
            manual keyboard walkthrough has been recorded.
          </li>
          <li>
            <strong>Stripe&rsquo;s hosted pages are outside our control.</strong> Identity
            onboarding and the card entry field are Stripe&rsquo;s, and their accessibility is
            theirs.
          </li>
        </ul>
      </Clause>

      <Clause n={5} title="Known gaps">
        <ul className="arrowlist" style={{ marginTop: 0 }}>
          <li>
            Wide tables scroll horizontally on a phone. Scrolling is better than a broken layout,
            but it is still a worse experience than a layout that reflows.
          </li>
          <li>
            Some status is carried by a coloured badge with a text label. The label is always
            present, so colour is not the only signal, but the badges have not been checked in a
            colour-blindness simulator.
          </li>
        </ul>
      </Clause>

      <Clause n={6} title="Tell us">
        <p className="body" style={{ marginTop: 0 }}>
          If something here is unusable for you, email{" "}
          <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and say what
          you were trying to do. A specific report is worth more than any audit, and it will be
          treated as a bug rather than a suggestion.
        </p>
        <p className="body" style={{ marginTop: 12 }}>
          If you cannot complete something because of an accessibility barrier, we will do it with
          you directly rather than leave you stuck. See also{" "}
          <Link className="linkbtn" href="/for-guardians">what a guardian takes on</Link>, which
          matters if you are helping someone use this.
        </p>
      </Clause>
    </LegalShell>
  );
}
