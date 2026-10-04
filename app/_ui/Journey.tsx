// How it works, in three steps.
//
// Three, not four: the old version split "build" and "connect" into separate
// cards, which made the parent step the third of four and buried it. The parent
// step is the one a builder is nervous about and the one a parent is deciding
// on, so it gets the middle of three where it cannot be skimmed past.

type Step = { n: string; t: string; d: string; who?: string; icon: React.ReactNode };

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const STEPS: Step[] = [
  {
    n: "01", t: "Sign up",
    d: "Two minutes, no card. You tell us where you live and when you were born, because those two things decide what is open to you.",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M9 7 4 12l5 5M15 7l5 5-5 5" /></svg>),
  },
  {
    n: "02", t: "Your parent approves, once",
    d: "They verify themselves once, on a secure form Veyro never sees. That is their whole job. After it, they are not in the loop on your payouts.",
    who: "Them, not you",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M12 3 4 6v6c0 4.4 3.4 8.2 8 9 4.6-.8 8-4.6 8-9V6l-8-3Z" /><path {...S} d="m9 12 2 2 4-4" /></svg>),
  },
  {
    n: "03", t: "Get paid",
    d: "Paste a snippet into what you built, or just send the link. The money goes where you tell it, and Veyro keeps the account straight behind you.",
    icon: (<svg viewBox="0 0 24 24" aria-hidden="true"><path {...S} d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" /><path {...S} d="M3 8V6a2 2 0 0 1 2-2h11l2 4" /><circle {...S} cx="16.5" cy="13.5" r="1.5" /></svg>),
  },
];

export function Journey() {
  return (
    <ol className="jn" data-steps="3" aria-label="How it works, in three steps">
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
