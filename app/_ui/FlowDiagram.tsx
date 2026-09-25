// A left-to-right sequence of stops with arrows between them.
//
// Extracted from /get-started, which has drawn the payment path this way since
// it was written. The homepage now needs the same shape twice — once for the
// integration, once for the guardian setup — and three copies of a flex row
// with arrows in it is three places for the arrows to stop matching.
//
// Deliberately NOT marked "use client". Imported by a server component it
// renders on the server and ships no JavaScript, which is what /get-started
// wants; imported by a client component it joins that bundle and the optional
// handlers below work. One component, both jobs, no directive to argue with.
//
// The <li> is display:contents so each stop and each arrow become siblings of
// the flex row and the columns lay out evenly. The visible box is the div
// inside it. That was true before this was extracted and is the only fiddly
// part of it.

export type FlowStop = {
  /** Short all-caps label above the stop, e.g. "YOUR APP". */
  n: string;
  /** What happens here. */
  t: string;
  /** One line of detail. */
  d: string;
  /** Outlined: the parts the founder actually touches. */
  you?: boolean;
  /** Stable key for the active state, when the diagram is interactive. */
  id?: string;
};

export function FlowDiagram({
  stops, label, activeId, onFocusStop, onLeave, style,
}: {
  stops: FlowStop[];
  /** Names the sequence for anyone not seeing the arrows. */
  label: string;
  /** Highlights one stop and quietens the rest. Omit for a static diagram. */
  activeId?: string | null;
  /**
   * Supplied only by a client parent. When present each stop becomes a button,
   * because something that responds to a pointer has to respond to a keyboard
   * too, and a div with an onMouseEnter does not.
   */
  onFocusStop?: (id: string) => void;
  onLeave?: () => void;
  style?: React.CSSProperties;
}) {
  const interactive = Boolean(onFocusStop);

  return (
    <ol
      className="flow"
      style={style}
      aria-label={label}
      data-dim={interactive && activeId ? "1" : undefined}
      onMouseLeave={onLeave}
    >
      {stops.map((s, i) => {
        const inner = (
          <>
            <span className="fs-n">{s.n}</span>
            <span className="fs-t">{s.t}</span>
            <span className="fs-d">{s.d}</span>
          </>
        );
        return (
          <li key={s.n} style={{ display: "contents" }}>
            {interactive ? (
              <button
                type="button"
                className="flow-step"
                data-you={s.you ? "1" : undefined}
                data-active={activeId === s.id ? "1" : undefined}
                onMouseEnter={() => onFocusStop!(s.id ?? s.n)}
                onFocus={() => onFocusStop!(s.id ?? s.n)}
                // Touch has no hover. A tap is the same disclosure.
                onClick={() => onFocusStop!(s.id ?? s.n)}
              >
                {inner}
              </button>
            ) : (
              <div className="flow-step" data-you={s.you ? "1" : undefined}>
                {inner}
              </div>
            )}
            {i < stops.length - 1 && (
              <span className="flow-arrow" aria-hidden="true">&rarr;</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
