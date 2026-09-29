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
// The light palette is everything before the first dark token block. Scoping
// matters: a token light defines as a keyword (--pine-bg: transparent) has no
// hex to match, and an unscoped search happily returns the DARK value from
// further down the file -- which reads as light text failing on a dark tint.
const lightCss = css.slice(0, (() => {
  const i = css.indexOf("--paper:#0f1113");
  return i < 0 ? css.length : i;
})());
const pick = (where, name) => {
  const m = where.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6}|transparent)`));
  return m ? m[1] : null;
};
const tok = (name) => {
  const v = pick(lightCss, name);
  if (!v) throw new Error(`token --${name} is gone from css.ts`);
  return v;
};

// The same battery runs twice, once per theme. Dark is not a filter over light:
// it is a second set of token values, and a pair that passes in one can fail in
// the other -- the placeholder grey did, at 3.60:1 on the dark card, which is
// what this half of the file was added to catch.
const darkBlock = (() => {
  const i = css.indexOf('.fw[data-theme="dark"] {');
  if (i < 0) throw new Error("the dark token block is gone from css.ts");
  const end = css.indexOf("\n}", i);
  return css.slice(i, end);
})();
const darkTok = (name) =>
  // Not every token is restated in dark; those inherit the light value.
  pick(darkBlock, name) ?? tok(name);

// Every ground that body text actually lands on.
const GROUNDS = ["paper", "surface", "surface-2", "card"];
const TEXT = ["ink", "ink-2", "ink-3", "pine", "amber", "slate", "clay"];

let failed = 0;
let theme = "light";
const check = (label, fg, bg, min) => {
  const r = ratio(fg, bg);
  if (r < min) { failed++; console.log(`  FAIL  ${theme}  ${r.toFixed(2)}:1 < ${min}  ${label}`); }
};

// `panel` is the ground of the two surfaces that are dark in BOTH themes: the
// wallet hero and the .lp-dark band. In light they sit on --ink; in dark the
// page came down to meet them, so they drop to #080a0b to keep an edge.
const suite = (name, t, panel, panelInk) => {
  theme = name;

  for (const fg of TEXT) for (const bg of GROUNDS) check(`${fg} on ${bg}`, t(fg), t(bg), 4.5);

  // Controls have to be findable, so their resting border is held to 1.4.11.
  check("input border on paper", t("control-line"), t("paper"), 3);
  check("input border on surface", t("control-line"), t("surface"), 3);
  check("input border on card", t("control-line"), t("card"), 3);
  check("focused input border", t("brand"), t("paper"), 3);

  // Anything reversed out of --brand: buttons, toasts.
  check("button label on brand", t("reverse"), t("brand"), 4.5);
  check("button label on brand hover", t("reverse"), t("brand-h"), 4.5);

  // Placeholders carry information, so they are text, not decoration.
  check("input placeholder", t("placeholder"), t("card"), 4.5);
  check("input placeholder on paper", t("placeholder"), t("paper"), 4.5);

  // Pine carries identity as well as money: the wordmark, links and the focus
  // ring. Links are text; a focus indicator is a non-text UI element, so
  // 1.4.11's 3:1 applies to it rather than 4.5:1.
  check("link on paper", t("pine"), t("paper"), 4.5);
  check("link on surface", t("pine"), t("surface"), 4.5);
  check("link hover on paper", t("pine-h"), t("paper"), 4.5);
  check("focus ring on paper", t("pine"), t("paper"), 3);
  check("focus ring on surface", t("pine"), t("surface"), 3);

  // Text on the tinted status grounds, which only exist in dark (light leaves
  // them transparent, so there the pair against --paper already covers it).
  // The chips' borders are not checked: a status badge is not a control you
  // have to find and operate, so 1.4.11 does not reach it.
  for (const hue of ["pine", "amber", "slate", "clay"]) {
    const bg = t(`${hue}-bg`);
    if (bg === "transparent" || !/^#/.test(bg)) continue;
    check(`${hue} on ${hue}-bg`, t(hue), bg, 4.5);
  }

  // The two always-dark panels.
  check("panel ink", panelInk, panel, 4.5);
  for (const [what, hex] of [["panel body", "#bcbdbd"], ["panel note", "#9b9c9d"],
                             ["panel eyebrow", "#aeafaf"], ["panel link", "#e2e3e3"]])
    check(what, hex, panel, 4.5);
  check("panel focus ring stays light", panelInk, panel, 3);
};

suite("light", tok, tok("ink"), tok("reverse"));
// In dark the panels state their own ink rather than inheriting --reverse,
// whose meaning flipped underneath them; these two literals are those rules.
suite("dark ", darkTok, "#080a0b", "#e8eaec");

// And the reason .lp-dark overrides both in the light theme. Pine on ink is
// 2.01:1, so the band must keep using white for focus and for links. This
// asserts the override is still necessary rather than that it exists -- if
// pine ever becomes light enough to pass here, the override can go.
const onInk = ratio(tok("pine"), tok("ink"));
if (onInk >= 3) {
  console.log(`  NOTE  pine on ink is now ${onInk.toFixed(2)}:1 -- the .lp-dark focus override may no longer be needed`);
}

if (failed) { console.error(`\n${failed} contrast failure(s).`); process.exit(1); }
console.log("contrast: all pairs pass WCAG AA in both themes");
