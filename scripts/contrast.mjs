// Measures the design tokens in app/_ui/css.ts against WCAG 2.2 AA.
//
// This exists because the token block tells you not to lighten those values
// without re-running the measurement, and a comment saying "we measured it"
// is worth nothing once the numbers stop being checked. Run `npm run contrast`
// after touching any colour. Non-zero exit means a pair regressed.
//
// Two thresholds, and they are different requirements:
//   4.5:1  SC 1.4.3  normal-size text against its background
//   3:1    SC 1.4.11 the boundary of a UI component you have to find, which
//                    is why inputs use --control-line and not --line. Plain
//                    dividers are decorative and exempt, so --line stays quiet.
import { readFileSync } from "node:fs";

const chan = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const css = readFileSync(new URL("../app/_ui/css.ts", import.meta.url), "utf8");
const tok = (name) => {
  const m = css.match(new RegExp(`--${name}:(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} is gone from css.ts`);
  return m[1];
};

// Every ground that body text actually lands on.
const GROUNDS = ["paper", "surface", "surface-2", "card"];
const TEXT = ["ink", "ink-2", "ink-3", "pine", "amber", "slate", "clay"];

let failed = 0;
const check = (label, fg, bg, min) => {
  const r = ratio(fg, bg);
  if (r < min) { failed++; console.log(`  FAIL  ${r.toFixed(2)}:1 < ${min}  ${label}`); }
};

for (const fg of TEXT) for (const bg of GROUNDS) check(`${fg} on ${bg}`, tok(fg), tok(bg), 4.5);

// Controls have to be findable, so their resting border is held to 1.4.11.
check("input border on paper", tok("control-line"), tok("paper"), 3);
check("input border on surface", tok("control-line"), tok("surface"), 3);
check("focused input border", tok("brand"), tok("paper"), 3);

// Anything reversed out of ink: buttons, the dark landing band, toasts.
check("button label on brand", tok("reverse"), tok("brand"), 4.5);
check("button label on brand hover", tok("reverse"), tok("brand-h"), 4.5);
for (const [what, hex] of [["dark-band body", "#bcbdbd"], ["dark-band note", "#9b9c9d"],
                           ["dark-band eyebrow", "#aeafaf"], ["dark-band link", "#e2e3e3"]])
  check(what, hex, tok("ink"), 4.5);

// Placeholders carry information, so they are text, not decoration.
check("input placeholder", "#6b7075", tok("card"), 4.5);

// Pine now carries identity as well as money: the wordmark, links and the
// focus ring. Links are text; a focus indicator is a non-text UI element, so
// 1.4.11's 3:1 applies to it rather than 4.5:1.
check("link on paper", tok("pine"), tok("paper"), 4.5);
check("link on surface", tok("pine"), tok("surface"), 4.5);
check("link hover on paper", tok("pine-h"), tok("paper"), 4.5);
check("focus ring on paper", tok("pine"), tok("paper"), 3);
check("focus ring on surface", tok("pine"), tok("surface"), 3);

// And the reason .lp-dark overrides both. Pine on ink is 2.01:1, so the dark
// band must keep using white for focus and for links. This asserts the
// override is still necessary rather than that it exists — if pine ever
// becomes light enough to pass here, the override can go.
const onInk = ratio(tok("pine"), tok("ink"));
if (onInk >= 3) {
  console.log(`  NOTE  pine on ink is now ${onInk.toFixed(2)}:1 — the .lp-dark focus override may no longer be needed`);
}
check("dark-band focus ring stays white", tok("reverse"), tok("ink"), 3);

if (failed) { console.error(`\n${failed} contrast failure(s).`); process.exit(1); }
console.log("contrast: all pairs pass WCAG AA");
