// The whole product as four steps, once.
//
// The homepage used to explain each of these in its own chapter. Someone
// deciding whether this is for them does not need the chapters; they need to
// know how many steps there are and which one involves a parent. Four cards,
// numbered, with the one that surprises people marked.

type Step = {
  n: string;
  t: string;
  d: string;
  /** The step that is not done by the founder. Worth saying out loud. */
  who?: string;
  icon: React.ReactNode;
};

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const STEPS: Step[] = [
  {
    n: "01", t: "Build", d: "Ship the thing. A site, an app, a bot, a Discord server. Veyro does not care what it is.",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M9 7 4 12l5 5M15 7l5 5-5 5" /></svg>),
  },
  {
    n: "02", t: "Connect", d: "Paste two lines into it, or skip the code and copy a checkout link. Five minutes either way.",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7l-1 1" /><path {...S} d="M14 10a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 5.7 5.7l1-1" /></svg>),
  },
  {
    n: "03", t: "Guardian", d: "A parent does one identity check on Stripe's own form. Once, then never again.",
    who: "Your parent, not you",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M12 3 4 6v6c0 4.4 3.4 8.2 8 9 4.6-.8 8-4.6 8-9V6l-8-3Z" /><path {...S} d="m9 12 2 2 4-4" /></svg>),
  },
  {
    n: "04", t: "Get paid", d: "Money lands in a Stripe account in your name. Request a payout whenever you want it.",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" /><path {...S} d="M3 8V6a2 2 0 0 1 2-2h11l2 4" /><circle {...S} cx="16.5" cy="13.5" r="1.5" /></svg>),
  },
];

export function Journey() {
  return (
    <ol className="jn" aria-label="How it works, in four steps">
      {STEPS.map((s) => (
        <li className="jn-s" key={s.n}>
          <span className="jn-ic" aria-hidden="true">{s.icon}</span>
          <span className="jn-n" aria-hidden="true">{s.n}</span>
          <h3 className="jn-t">{s.t}</h3>
          <p className="jn-d">{s.d}</p>
          {s.who && <span className="jn-who">{s.who}</span>}
        </li>
      ))}
    </ol>
  );
}
