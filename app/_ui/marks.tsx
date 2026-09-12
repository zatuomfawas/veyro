// Wordmark and icon set, verbatim from prototype/veyro.jsx.
//
// No hooks and no event handlers, so these render from Server Components as
// well as Client ones — which matters for the article and home pages, where
// the whole point is that a crawler sees real HTML without running any JS.

export const V_PATH = "M10 18 L26 18 L45 57 L64 18 L90 18 L58 84 L43 84 Z";

export const ICONS: Record<string, string> = {
  home: "M2.5 6.8 8 2.5l5.5 4.3v6.2a.5.5 0 0 1-.5.5h-3v-4h-4v4H3a.5.5 0 0 1-.5-.5z",
  wallet: "M2 4.5h10.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2 4.5A1.5 1.5 0 0 1 3.5 3h7M10.5 8.5h1.5",
  payout: "M8 12.5V3.5M8 3.5 4.8 6.7M8 3.5l3.2 3.2M2.5 13.5h11",
  card: "M1.8 5.5h12.4M1.8 4.2a.9.9 0 0 1 .9-.9h10.6a.9.9 0 0 1 .9.9v7.6a.9.9 0 0 1-.9.9H2.7a.9.9 0 0 1-.9-.9zM4.2 9.4h2.6",
  person: "M8 8.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM2.8 13.6c0-2.5 2.3-4.1 5.2-4.1s5.2 1.6 5.2 4.1",
  building: "M3 13.5V3.2a.7.7 0 0 1 .7-.7h5.6a.7.7 0 0 1 .7.7v10.3M10 6.6h2.3a.7.7 0 0 1 .7.7v6.2M2 13.5h12M5.3 5.4h2M5.3 8h2M5.3 10.6h2",
  list: "M5.5 4.2h8M5.5 8h8M5.5 11.8h8M2.5 4.2h.01M2.5 8h.01M2.5 11.8h.01",
  check: "M2.8 8.4 6.2 11.8l7-7.6",
  back: "M9.5 3.5 L5 8 L9.5 12.5",
};

export function Icon({ name, size = 15 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Archivo's cap height is ~0.72 of its em. The V is drawn to exactly that, so its
   flat apex sits on the baseline and its top aligns with the cap line of "eyro". */
export function Wordmark({ size, hero, reversed }: { size?: number; hero?: boolean; reversed?: boolean }) {
  return (
    <span className={"wordmark" + (hero ? " wordmark-hero" : "")} style={size ? { fontSize: size } : undefined}>
      <svg className="wm-v" viewBox="10 18 80 66" aria-hidden="true" focusable="false">
        <path d={V_PATH} fill={reversed ? "var(--reverse)" : "var(--brand)"} />
      </svg>
      <span className="wm-rest" style={{ color: reversed ? "var(--reverse)" : "var(--ink)" }}>eyro</span>
    </span>
  );
}

export function SkipLink() {
  return <a href="#main" className="skiplink">Skip to content</a>;
}
