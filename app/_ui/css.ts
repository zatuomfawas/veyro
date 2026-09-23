// The Veyro design system, verbatim from prototype/veyro.jsx (its CSS + CSS2
// blocks). Shared by every page so the stylesheet exists once, not once per
// route.
//
// The custom properties are scoped to `.fw`, not `:root`, so that class has to
// wrap any page using them or every token resolves to nothing. Zero border
// radius (--radius:0) is deliberate; don't "fix" it.
//
// Typefaces are NOT loaded here. Archivo and Onest come from next/font in
// app/layout.tsx, which self-hosts them at build time; --display and --ui read
// the variables it sets. An @import of fonts.googleapis.com used to sit at the
// top of this string, which was both unreliable (an @import in an injected
// <style> block may be ignored) and a silent third-party dependency on first
// paint. See DESIGN.md.

export const CSS = `

.fw, .fw *, .fw *::before, .fw *::after { box-sizing: border-box; }
/* Safety net: no single long word, email or URL may widen the page. Acts only
   when a word would overflow its box, so ordinary prose is unaffected. */
.fw { overflow-wrap: break-word; }
/* Visible to a screen reader, not to the eye. The clip-path/1px pattern is
   used rather than display:none, which removes the text from the
   accessibility tree entirely, or a negative text-indent, which some
   screen readers skip. */
.fw .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.fw {
  /* ---- Type scale: 10 steps, nothing between them ---- */
  --fs-1:11.5px; --fs-2:12.5px; --fs-3:14px;  --fs-4:15.5px; --fs-5:17px;
  --fs-6:20px;   --fs-7:24px;   --fs-8:30px;  --fs-9:44px;   --fs-10:56px;
  /* ---- Weight: three only. 400 reads, 500 labels, 600 headings ---- */
  --fw-reg:400; --fw-med:500; --fw-bold:600;
  /* ---- Line height ---- */
  --lh-tight:1.14; --lh-snug:1.35; --lh-body:1.6;
  /* ---- Spacing: 4px base, 10 steps ---- */
  --sp-1:4px;  --sp-2:8px;  --sp-3:12px; --sp-4:16px; --sp-5:20px;
  --sp-6:24px; --sp-7:32px; --sp-8:40px; --sp-9:56px; --sp-10:72px;
  /* ---- Control heights ---- */
  --h-sm:30px; --h-md:38px; --h-lg:46px;
  /* ---- Borders and focus. No radius anywhere by decision ---- */
  --bw:1px; --radius:0; --focus-w:2px; --focus-offset:2px;
  /* ---- Touch target floor. WCAG 2.2 AA minimum is 24px; 44px is the usable target ---- */
  --tap:44px; --marker:7px;
  --nav-h:62px;
  /* Line length. Four measures, chosen once */
  --m-tight:34ch; --m-lead:52ch; --m-body:66ch; --m-wide:76ch;
  /* Layout: one asymmetric split, used everywhere a section has two parts */
  --split-a:minmax(0,5fr); --split-b:minmax(0,7fr);

  --paper:#ffffff; --surface:#f7f7f6; --surface-2:#eeeeec;
  /* --card is the raised content surface. On a white page it cannot be lighter
     than --paper, so it matches it and every .card earns its edge from --line
     instead. The alternating landing sections that used to rely on card being
     lighter than paper now use --surface. */
  --card:#ffffff; --reverse:#ffffff;
  --line:#e3e3e0; --line-soft:#eeeeec;
  /* Dividers are decorative, so --line may stay quiet. An input border is a UI
     component boundary and WCAG 1.4.11 wants 3:1 for it; --line measured
     1.29:1 on white, so controls get their own token. #878d92 is 3.36:1 on
     --paper and 3.13:1 on --surface, the two grounds inputs sit on. */
  --control-line:#878d92;
  /* Black, not green. Green now means settled money and nothing else, so it
     never appears on a button, a focus ring or the wordmark. */
  --brand:#111315; --brand-h:#2b2f33;
  /* --ink-3 is the quietest text in the system and --surface-2 the darkest
     ground it lands on, so that pair sets the floor. It measures 4.99:1 there,
     clearing WCAG AA's 4.5:1 with room; every other text pair is higher. Do
     not lighten these without re-running the measurement. See DESIGN.md. */
  --ink:#111315; --ink-2:#4a4f54; --ink-3:#61666b;
  --pine:#12513a; --pine-h:#0b3a29; --pine-bg:transparent; --pine-line:#acc2ba;
  --amber:#8a5a12; --amber-bg:transparent; --amber-line:#cdb899;
  --slate:#22456b; --slate-bg:transparent; --slate-line:#adbac8;
  --clay:#9c2b22; --clay-bg:transparent; --clay-line:#d5a6a2;
  /* Display face, wordmark only. Never for interface text. */
  --display: var(--font-archivo), "Archivo", "Helvetica Neue", "Arial Black", Helvetica, Arial, sans-serif;
  --display-wdth: 118%; --display-wght: 800;
  /* Logotype scale. Deliberately separate from the UI type scale */
  --wm-lg:72px; --wm-md:52px; --wm-sm:38px; --wm-nav:20px;
  /* Kern pair for V + e. The V's box edge is 0.097em wider than its ink at
     x-height, so this pulls the following letter into that wedge. One number. */
  --wm-kern:-0.085em;
  /* Landing only. The application keeps the smaller dashboard scale. */
  --lp-1:64px; --lp-2:44px; --lp-3:26px; --lp-lead:19px;
  --lp-gut:32px; --lp-max:1600px;
  /* Section rhythm and the tail a page leaves under itself, as tokens so a
     full-bleed closing band can cancel the tail exactly rather than
     guessing at it.
     72px, not the 48px it was: eleven sections at 48 read as one continuous
     column of text, and the hairline between them did all the separating. */
  --lp-pad:72px; --tail:56px;
  /* One gutter, fluid. 16px on a small phone, growing to 48px on a wide
     desktop. Replaces four hand-written padding values that each needed
     their own breakpoint. */
  --gut: clamp(16px, 4vw, 48px);
  --lp-pad-lg:104px; --lp-pad-md:72px; --lp-pad-sm:48px;
  /* Haffer (Displaay) is the intended primary. Its files are commercially
     licensed and unavailable here, so Onest is the implemented fallback, per the
     brief. Swapping Haffer in is a change to this one line. */
  --ui: var(--font-onest), "Onest", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  /* Code only. Not loaded over the network: every face here ships with an OS,
     so a snippet costs no request and cannot flash an unstyled fallback. */
  --code: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  /* One family. Everything below is the same typeface at a different size or weight. */
  font-family: var(--ui);
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
  font-size:var(--fs-3);
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  text-rendering: optimizeLegibility;
}
/* Selected text was the browser's default blue, the one colour on the page
   from outside this palette — and it shows up constantly here, because people
   select amounts, account ids and invite links to copy them. */
.fw ::selection { background:#e2e3e3; color:var(--ink); }
.fw button, .fw input, .fw select, .fw textarea { font: inherit; color: inherit; }
.fw a { color: inherit; text-decoration: none; }
/* Focus is pine. On the dark band .lp-dark overrides it back to white a few
   hundred lines below, and must keep doing so: pine on --ink measures 2.01:1,
   under the 3:1 a focus indicator has to clear, so a green ring there would be
   a ring only sighted users in good light could find. */
.fw :focus-visible { outline:2px solid var(--pine); outline-offset:2px; border-radius:0; }
.fw .page-h { padding-bottom:2px; }
.fw .page-h .d2 + .small { margin-top:5px; }
.fw .rail-sec { padding:16px 8px 6px; font-size:var(--fs-1); color:var(--ink-3); }
/* Motion.
   One curve and two durations, so everything moves as though one hand drew it.
   The curve is a standard decelerate: quick to start, easing into place, which
   is what makes a change read as settling rather than stopping.

   --t-1 is for a control answering you — a hover, a focus ring, a pressed
   segment. 110ms is under the threshold where a transition starts to feel like
   a delay, which is the point: it should read as the control responding, not
   as an animation playing.

   --t-2 is for something arriving or leaving: a panel opening, a message
   appearing. A larger change needs longer or it snaps, but past about 200ms it
   starts to feel like waiting.

   Nothing animates on page load, and nothing moves that was not asked to move.
   This is an interface for looking at money, and motion nobody triggered reads
   as instability. Motion that answers a click is the opposite: it says the
   click landed. --t stays as the shorthand the controls already use. */
.fw {
  --ease: cubic-bezier(.4, 0, .2, 1);
  --t-1: 110ms;
  --t-2: 170ms;
  --t: var(--t-1) var(--ease);
}
.fw .btn, .fw .linkbtn, .fw .input, .fw .select, .fw .ta,
.fw .choice, .fw .tick, .fw .tick::after, .fw a.card, .fw .mobmenu {
  transition: background-color var(--t), border-color var(--t), color var(--t), box-shadow var(--t);
}
/* The only motion in the product otherwise is scroll, handled in JS via
   scrollBehavior(). This is the belt-and-braces version for the browser. */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto !important; }
  .fw *, .fw *::before, .fw *::after { transition-duration:0ms !important; animation-duration:0ms !important; }
}

/* type */
.fw h1,.fw h2,.fw h3,.fw h4 { margin:0; font-weight:var(--fw-bold); letter-spacing:-0.016em; font-family:inherit; }

.fw p { margin:0; }
.fw .d2 { font-size:var(--fs-8); line-height:1.21; letter-spacing:-0.022em; font-weight:var(--fw-bold); }
.fw .h3 { font-size:var(--fs-6); line-height:1.32; letter-spacing:-0.016em; font-weight:var(--fw-bold); }
.fw .h4 { font-size:var(--fs-4); line-height:1.4; letter-spacing:-0.008em; font-weight:var(--fw-bold); }
.fw .lead { font-size:var(--fs-5); line-height:1.58; color:var(--ink-2); max-width:var(--m-lead); }
.fw .body { font-size:var(--fs-4); line-height:1.5; color:var(--ink-2); max-width:70ch; }
.fw .small { font-size:var(--fs-3); line-height:1.5; color:var(--ink-2); }
.fw .tiny { font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); }
.fw .lbl { font-size:var(--fs-2); color:var(--ink-3); letter-spacing:0.004em; }
.fw .num { font-variant-numeric: tabular-nums lining-nums; font-feature-settings:"tnum" 1; }
.fw .mono { font-size:var(--fs-2); letter-spacing:0.03em; font-variant-numeric:tabular-nums lining-nums; }
.fw .ink3 { color:var(--ink-3); }

/* layout */
.fw .wrap { max-width:1280px; margin:0 auto; padding:0 var(--gut); }
.fw .wrap-lp { max-width:var(--lp-max); margin:0 auto; padding:0 var(--gut); }
.fw .lp-h1 { font-size:var(--lp-1); line-height:1.02; letter-spacing:-0.035em; font-weight:var(--fw-bold); }
/* text-wrap:balance for the same reason the hero tagline has it: at 44px an
   18ch measure drops the last word onto a line of its own — "is.", "made." —
   which reads as a mistake rather than as a line break. Browsers without it
   wrap exactly as before. */
.fw .lp-h2 { font-size:var(--lp-2); line-height:1.1; letter-spacing:-0.028em;
  font-weight:var(--fw-bold); max-width:18ch; text-wrap:balance; }
.fw .lp-h3 { font-size:var(--lp-3); line-height:1.2; letter-spacing:-0.02em; font-weight:var(--fw-bold); }
.fw .lp-lead { font-size:var(--lp-lead); line-height:1.55; color:var(--ink-2); max-width:56ch; }
.fw .lp-note { font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); max-width:var(--m-wide); }
.fw section.lp-pad-lg { padding:var(--lp-pad-lg) 0; }
.fw section.lp-pad-md { padding:var(--lp-pad-md) 0; }
.fw section.lp.lp-pad-sm { padding:var(--lp-pad-sm) 0; }
.fw section.lp-pad-sm { padding:var(--lp-pad-sm) 0; }
@media (max-width:900px) {
  .fw { --lp-1:40px; --lp-2:32px; --lp-3:21px; --lp-lead:17px; --lp-gut:20px;
        --lp-pad:48px;
        --lp-pad-lg:64px; --lp-pad-md:48px; --lp-pad-sm:36px; }
  .fw .lp-h2 { max-width:24ch; }
}
.fw .wrap-n { max-width:880px; margin:0 auto; padding:0 var(--gut); }
  .fw .wrap-w { max-width:1600px; margin:0 auto; padding:0 var(--gut); }
.fw .wrap-s { max-width:720px; margin:0 auto; padding:0 var(--gut); }
.fw .row { display:flex; align-items:center; gap:10px; }
.fw .row-b { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.fw .grow { flex:1 1 auto; min-width:0; }
.fw .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.fw .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
/* A grid item's automatic minimum size is its min-content, so one unshrinkable
   descendant (a table, a long number) widens the whole TRACK and every sibling
   with it. The item then renders wider than the grid box, and because body has
   overflow-x:clip the page does not scroll: the overflow is silently cut off
   instead. That failure is invisible to a scrollWidth check, which is why it
   survived earlier passes.

   Tracks written as minmax(0,1fr) are already immune; a bare 1fr is not. Rather
   than depend on every future track being written the careful way, every layout
   grid's children get min-width:0 here. Items can then shrink, and the scroll
   containers inside them (.tblwrap) do the scrolling they were put there to do. */
.fw .grid-2 > *, .fw .grid-4 > *, .fw .cardgrid > *,
.fw .herofacts > *, .fw .footgrid > *, .fw .reality > *, .fw .stagebar > *,
.fw .ruled > div > *, .fw .split > *, .fw .split-lead > *, .fw .truthgrid > *,
.fw .ownership > *, .fw .pricegrid > *, .fw .trustgrid > *, .fw .hstage > *,
.fw .hpanel-rows > div > *, .fw .numbered li > * { min-width:0; }
.fw .rule { height:1px; background:var(--line); border:0; margin:0; }
.fw .stack > * + * { margin-top:14px; }

/* buttons */
.fw .btn {
  display:inline-flex; align-items:center; justify-content:center; text-align:center; gap:7px;
  height:var(--h-md); padding:0 var(--sp-4); border-radius:0; border:1px solid var(--brand);
  background:var(--brand); color:var(--reverse); font-size:var(--fs-3); font-weight:var(--fw-med); letter-spacing:-0.006em;
  cursor:pointer;
  white-space:nowrap;
}
.fw .btn:hover { background:var(--brand-h); border-color:var(--brand-h); }
.fw .btn:active { background:#000000; border-color:#000000; }
.fw .btn[aria-busy="true"] { background:var(--brand-h); border-color:var(--brand-h); opacity:.85; cursor:progress; }
.fw .btn[aria-busy="true"]::before { content:""; width:var(--marker); height:var(--marker); background:var(--reverse); flex:none; }
.fw .btn-2:active { background:var(--surface-2); border-color:var(--ink-3); }
.fw .btn-q:active { background:var(--surface-2); }
.fw .btn-d:active { background:#f3e6e4; }
/* Disabled is a state, not a faded version of the enabled one.
   This was opacity .38 over the brand, green at the time, which rendered
   white text on a washed-out green at roughly 2:1 — the label was the least readable thing on
   the page at the moment someone is trying to work out why they cannot submit.
   A neutral surface with muted text reads as "not yet" and clears AA. */
.fw .btn:disabled, .fw .btn:disabled:hover {
  opacity:1; cursor:not-allowed;
  background:var(--surface-2); border-color:var(--line); color:var(--ink-3); }
.fw .btn-2:disabled, .fw .btn-2:disabled:hover { background:var(--card); border-color:var(--line); color:var(--ink-3); }

.fw .nav button:not(.btn)[data-on="1"] { font-weight:var(--fw-med); }
/* (the disabled rule lives above; a second one here used to override it) */
.fw .btn-2 { background:var(--paper); color:var(--ink); border-color:var(--line); }
.fw .btn-2:hover { background:var(--surface); border-color:#d4d4d1; }
.fw .btn-q { background:transparent; border-color:transparent; color:var(--ink-2); }
.fw .btn-q:hover { background:var(--surface-2); border-color:transparent; color:var(--ink); }
.fw .btn-d { background:var(--paper); color:var(--clay); border-color:var(--clay-line); }
.fw .btn-d:hover { background:var(--clay-bg); border-color:var(--clay-line); }
.fw .linkbtn { background:none; border:0; padding:0; font:inherit; color:var(--pine); cursor:pointer;
  text-decoration:underline; text-underline-offset:2px; }
.fw .linkbtn:hover { color:var(--pine-h); }
.fw .btn-lg { height:var(--h-lg); padding:0 var(--sp-5); font-size:var(--fs-4); }
.fw .btn-sm { height:var(--h-sm); padding:0 var(--sp-3); font-size:var(--fs-2); border-radius:0; }
.fw .btn-w { width:100%; }

/* surfaces */
.fw .card { background:var(--card); border:1px solid var(--line); }
.fw .card-h { padding:var(--sp-3) var(--sp-5); min-height:45px; border-bottom:1px solid var(--line-soft); display:flex; align-items:center; justify-content:space-between; gap:12px; }
.fw .card-b { padding:var(--sp-5); }
.fw .card-f { padding:var(--sp-3) var(--sp-5); border-top:1px solid var(--line-soft); background:transparent; }
.fw .panel { background:transparent; border-top:1px solid var(--line); padding:14px 0 0; }

/* badges */
.fw .badge { display:inline-flex; align-items:center; height:20px; padding:0 7px; font-size:var(--fs-1); font-weight:var(--fw-bold);
  border:1px solid; letter-spacing:0.02em; text-transform:none; background:transparent; }
.fw .b-pine { color:var(--pine); background:var(--pine-bg); border-color:var(--pine-line); }
.fw .b-amber { color:var(--amber); background:var(--amber-bg); border-color:var(--amber-line); }
.fw .b-slate { color:var(--slate); background:var(--slate-bg); border-color:var(--slate-line); }
.fw .b-clay { color:var(--clay); background:var(--clay-bg); border-color:var(--clay-line); }
.fw .b-grey { color:var(--ink-2); background:var(--surface-2); border-color:var(--line); }

/* forms */
.fw .field { display:block; margin-bottom:14px; }
.fw .field > .lbl { display:block; margin-bottom:6px; color:var(--ink); font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .input, .fw .select, .fw .ta {
  width:100%; height:var(--h-md); padding:0 var(--sp-3); border:1px solid var(--control-line); border-radius:0;
  background:var(--card); font-size:var(--fs-3);
}
.fw .ta { height:auto; padding:9px 11px; resize:vertical; line-height:1.5; }
.fw .input:focus, .fw .select:focus, .fw .ta:focus { outline:none; border-color:var(--brand); box-shadow:inset 0 0 0 1px var(--brand); }
.fw .input::placeholder, .fw .ta::placeholder { color:#6b7075; }
.fw .input:hover:not(:focus):not(:disabled), .fw .select:hover:not(:focus):not(:disabled) { border-color:var(--ink-3); }
.fw .input:disabled, .fw .select:disabled, .fw .ta:disabled {
  background:var(--surface); color:var(--ink-3); cursor:not-allowed; border-color:var(--line-soft); }
.fw .input.bad, .fw .select.bad, .fw .ta.bad { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.bad:focus, .fw .ta.bad:focus { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.good { border-color:var(--pine); }
/* The eligibility form sits in a wide column on both the landing page and
   /check, and its fields were inheriting that width: a 742px input for a
   four-digit year, and a country select wider than most sentences on the page.
   A field should be about as wide as what goes in it — long ones are harder to
   scan and make a short answer look like a mistake. The card keeps its width;
   only the controls are capped. */
.fw .checkform .field { max-width:var(--m-tight); }
.fw .checkform .field > .hint, .fw .checkform .field > .err { max-width:var(--m-lead); }
/* The submit stays full width: it is the one thing on the card that should be
   impossible to miss, and it closes the form rather than collecting anything. */
.fw .charcount { float:right; font-size:var(--fs-1); color:var(--ink-3); font-variant-numeric:tabular-nums; }
.fw .charcount[data-near="1"] { color:var(--amber); }
.fw .charcount[data-over="1"] { color:var(--clay); font-weight:var(--fw-med); }
.fw .hint { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .err { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--clay); }
/* Something arriving because you asked for it.
   A confirmation, an error, a panel that just opened. It rises 4px and fades,
   which is about the smallest movement that still reads as "this is new"
   rather than "this was always here and you missed it". Entrance only: there
   is no exit, because an element that has already gone is not worth waiting
   for. The global reduced-motion rule zeroes the duration, so it still
   appears, instantly. */
@keyframes veyro-reveal {
  from { opacity:0; transform:translateY(-4px); }
  to   { opacity:1; transform:none; }
}
.fw .reveal { animation:veyro-reveal var(--t-2) var(--ease) both; }

/* A panel that opens and closes in place, height and all.
   grid-template-rows 0fr -> 1fr is the one way to transition to an unknown
   height without measuring it in JavaScript, and it is already how the FAQ
   accordion works, so this is that pattern and not a second one. */
.fw .expand { display:grid; grid-template-rows:0fr; opacity:0;
  transition:grid-template-rows var(--t-2) var(--ease), opacity var(--t-2) var(--ease); }
.fw .expand[data-open="1"] { grid-template-rows:1fr; opacity:1; }
.fw .expand > * { overflow:hidden; min-height:0; }

/* Rows answer the cursor. Only where a cursor exists — on a touch screen
   :hover sticks to whatever was tapped last, which leaves a row looking
   selected for no reason. The panel row is excluded: it is a container for a
   form, not a row of data to point at. */
@media (hover: hover) {
  .fw .tbl tbody tr:not([data-panel]) { transition:background-color var(--t); }
  .fw .tbl tbody tr:not([data-panel]):hover { background:var(--surface); }
}

/* Code.
   .mono is the UI face with tabular figures, which is right for an account id
   inside a sentence and wrong for a block of markup: it has no real monospace
   metrics, so indentation does not line up. This is the one place a second
   family is justified, and it is a stack of faces already on the machine. */
.fw .code { font-family:var(--code); font-size:var(--fs-2); line-height:1.7;
  background:var(--surface); border:1px solid var(--line); padding:14px 16px;
  overflow-x:auto; white-space:pre; tab-size:2; color:var(--ink); margin:0; }
.fw .code .c { color:var(--ink-3); }
.fw .code b { font-weight:var(--fw-bold); color:var(--brand); }
.fw .codecap { display:flex; align-items:center; justify-content:space-between; gap:12px;
  border:1px solid var(--line); border-bottom:0; background:var(--card);
  padding:8px 14px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .codecap + .code { border-top:0; }

/* Flow diagram.
   Four stages and the arrows between them. A row on a wide screen, a column on
   a narrow one, with the arrows turning a quarter turn rather than being
   swapped for different glyphs. The arrows are decorative: the list itself
   carries the order for anyone not looking at it. */
.fw .flow { display:flex; align-items:stretch; flex-wrap:wrap; list-style:none; margin:0; padding:0; }
.fw .flow-step { flex:1 1 170px; min-width:0; border:1px solid var(--ink);
  background:var(--card); padding:13px 15px; }
.fw .flow-step .fs-n { display:block; font-size:var(--fs-1); letter-spacing:0.06em;
  text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; }
.fw .flow-step .fs-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold);
  letter-spacing:-0.01em; }
.fw .flow-step .fs-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:4px; }
.fw .flow-step[data-you="1"] { border-color:var(--brand); box-shadow:inset 0 0 0 1px var(--brand); }
.fw .flow-arrow { flex:0 0 34px; display:flex; align-items:center; justify-content:center;
  color:var(--ink-3); font-size:var(--fs-5); }
@media (max-width:760px) {
  .fw .flow { flex-direction:column; }
  .fw .flow-step { flex:1 1 auto; }
  .fw .flow-arrow { flex:0 0 26px; transform:rotate(90deg); }
}

/* Segmented control.
   Two mutually exclusive views of the same figure, so they belong inside one
   border rather than sitting as a button next to a word. Built from the same
   1px edge and brand fill as everything else; the selected segment is filled,
   the other is quiet, and a single hairline divides them. */
.fw .seg { display:inline-flex; border:1px solid var(--line); background:var(--card); }
.fw .seg > button {
  appearance:none; border:0; background:transparent; cursor:pointer;
  font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-2);
  padding:0 var(--sp-3); height:26px; white-space:nowrap;
  transition: background-color var(--t), color var(--t); }
.fw .seg > button + button { border-left:1px solid var(--line); }
.fw .seg > button:hover:not([aria-pressed="true"]):not([aria-selected="true"]) { background:var(--surface); color:var(--ink); }
/* Two attributes for one look: a segmented picker uses aria-pressed, a
   tablist uses aria-selected, and aria-pressed is invalid on role="tab". */
.fw .seg > button[aria-pressed="true"],
.fw .seg > button[aria-selected="true"] { background:var(--brand); color:var(--reverse); }
@media (pointer: coarse) { .fw .seg > button { height:var(--tap); } }

/* A segmented control with six options cannot stay on one line on a phone, and
   a horizontal scroller hides the options nobody scrolled to. It wraps, and the
   left border that separates buttons is reset per row so a wrapped row does not
   start with a doubled edge. */
.fw .segwrap { display:flex; flex-wrap:wrap; border-width:1px 0 0 1px; }
.fw .segwrap > button { border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
.fw .segwrap > button + button { border-left:0; }

/* A long generated prompt. Scrolls in its own box rather than setting the width
   of the page, and is focusable so it can be reached and read by keyboard. */
.fw .codescroll { max-height:280px; overflow:auto; white-space:pre-wrap; word-break:break-word;
  margin:0; -webkit-overflow-scrolling:touch; }

/* Integration checks. The mark is decorative: every row states its condition in
   words, so none of this depends on seeing a colour. */
.fw .cklist { display:grid; gap:12px; }
.fw .ck { display:flex; gap:10px; align-items:flex-start; }
.fw .ck-m { width:9px; height:9px; flex:none; margin-top:6px; border:1px solid var(--line); }
.fw .ck-y { background:var(--pine); border-color:var(--pine); }
.fw .ck-n { background:transparent; border-color:var(--ink-3); }
.fw .ck-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .ck-s { font-size:var(--fs-2); font-weight:var(--fw-reg); color:var(--ink-3); margin-left:8px; }
.fw .ck-d { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:2px;
  max-width:60ch; }

/* The five-step story. A numbered progression with a hairline connector, not
   five cards: cards would give equal visual weight to five things that are one
   sequence. */
/* The column count follows the item count rather than being declared.
   It was repeat(5,...) from when there were five steps; dropping to four left
   a 261px column standing empty at the right end with the top rule running
   across it, which read as a missing step. auto-flow cannot go stale that
   way. */
.fw .steps { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:0;
  border-top:1px solid var(--ink);
  /* An <ol> brings padding-inline-start:40px and a 1em block margin of its
     own. Without this reset the whole row sat 40px right of the heading above
     it at every width — the numbers are rendered as text here, so the marker
     box it was reserving was space for nothing. */
  margin:0; padding:0; }
.fw .steps > li { list-style:none; padding:16px 18px 18px 0; border-right:1px solid var(--line); }
/* Every cell had padding-left:0, which is right for the first — it lines up
   with the page's own left edge — and wrong for the rest, whose text sat hard
   against the divider belonging to the cell before it. */
.fw .steps > li + li { padding-left:var(--sp-5); }
.fw .steps > li:last-child { border-right:0; }
.fw .steps > li > * { min-width:0; }
.fw .steps .st-n { display:block; font-size:var(--fs-1); letter-spacing:0.08em; text-transform:uppercase;
  color:var(--ink-3); font-variant-numeric:tabular-nums; }
.fw .steps .st-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); margin-top:8px; }
.fw .steps .st-d { display:block; font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); margin-top:4px; }
@media (max-width:900px) {
  .fw .steps { grid-auto-flow:row; grid-template-columns:1fr; border-top:0; }
  .fw .steps > li { border-right:0; border-top:1px solid var(--line); padding:14px 0; }
  /* Stacked, there is no divider to clear, and the indent would just push the
     text off the page's left margin. Same specificity as the rule above and
     later in the file, so it wins. */
  .fw .steps > li + li { padding-left:0; }
  .fw .steps > li:first-child { border-top:1px solid var(--ink); }
}

.fw .choice { display:flex; gap:10px; align-items:flex-start; padding:12px 13px; border:1px solid var(--line); cursor:pointer; background:var(--card); text-align:left; width:100%; }
.fw .choice:hover { border-color:var(--ink-3); }
/* Selected borrows --brand, which is now near-black itself: green was retired
   from interface colour and means settled money and nothing else. One control
   still answers in one colour, and the edge stays 1px rather than doubling to
   2px, which was the heaviest line on the page for a checkbox being ticked. */
.fw .choice[data-on="1"] { border-color:var(--brand); background:var(--card); box-shadow:inset 0 0 0 1px var(--brand); }
/* A square box with a tick, not a filled circle.
   Two reasons. A circle is the established shape for "one of several", and this
   is a single on/off answer, so the shape was promising a choice that is not
   there. And --radius:0 is the first rule of this system: a 50% radius was the
   one curve in the whole interface.
   The mark is a real tick rather than a filled square, which reads as "yes" at
   15px in a way a dot does not. The dashboard's setup markers already use this
   square, so the two now agree. */
.fw .tick { width:15px; height:15px; border-radius:0; border:1.5px solid var(--control-line);
  flex:none; margin-top:3px; position:relative; background:var(--card); }
.fw .choice:hover .tick { border-color:var(--ink-3); }
.fw .choice[data-on="1"] .tick { border-color:var(--brand); background:var(--brand); }
.fw .choice[data-on="1"] .tick::after {
  content:""; position:absolute; left:4px; top:1px; width:4px; height:8px;
  border:solid var(--reverse); border-width:0 1.5px 1.5px 0; transform:rotate(45deg); }

/* table */
.fw .tbl { width:100%; border-collapse:collapse; }
.fw .tbl th { text-align:left; font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-3); padding:var(--sp-2) var(--sp-5); border-bottom:1px solid var(--line); }
/* The tinted ground belongs to a COLUMN header, where it spans the row. A
   row-scoped th (scope="row") is one cell, so the same rule painted a grey
   block across half the row and read as a half-filled bar. The warm palette
   hid it because --surface sat a hair off --card; on white it is plain. */
.fw .tbl thead th { background:var(--surface); }
/* A row header is a label cell, so it takes the body divider (--line-soft),
   not the heavier --line a column header draws. Mismatched, one row was
   divided by two different greys across its width. */
.fw .tbl tbody th { color:var(--ink-2); border-bottom-color:var(--line-soft); }
.fw .tbl td { padding:var(--sp-3) var(--sp-5); border-bottom:1px solid var(--line-soft); font-size:var(--fs-3); vertical-align:middle; }
.fw .tbl tr:last-child td, .fw .tbl tr:last-child th { border-bottom:0; }
.fw .tbl .r { text-align:right; }
.fw .tbl-c tbody tr { cursor:pointer; }
.fw .tbl-c tbody tr:hover { background:var(--surface); }
.fw .tbl-c tbody tr:active { background:var(--surface-2); }
.fw .nav button:not(.btn):active { background:var(--surface-2); }
.fw .frame-rail button:not(.btn):active { background:var(--surface-2); }
.fw .linkrow:active { background:var(--surface-2); }
.fw .footgrid button:active { color:var(--brand-h); }
.fw .choice:active { background:var(--surface); }
.fw .linkbtn:active { color:var(--pine-h); }

/* app shell */
.fw .shell { display:flex; min-height:100vh; align-items:stretch; }
.fw .rail { width:205px; flex:none; border-right:1px solid var(--line); background:var(--surface); display:flex; flex-direction:column; }
.fw .rail-top { padding:16px 16px 12px; }
.fw .nav { padding:6px 8px; display:flex; flex-direction:column; gap:1px; }
.fw .nav a, .fw .nav button:not(.btn) {
  display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;
  padding:7px 10px; border-radius:0; font-size:var(--fs-3); color:var(--ink-2); cursor:pointer;
  background:transparent; border:0; text-align:left;
}
.fw .nav button:not(.btn):hover { background:var(--surface-2); color:var(--ink); }
.fw .nav button:not(.btn)[data-on="1"] { background:var(--card); color:var(--ink); font-weight:var(--fw-bold); box-shadow:inset 0 0 0 1px var(--line); }
.fw .main { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
.fw .topbar { height:53px; flex:none; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 24px; gap:16px; background:var(--card); }
.fw .page { padding:26px 24px 72px; flex:1 1 auto; }
.fw .page-in { max-width:940px; }
.fw .page-h { margin-bottom:20px; }

/* env bar */
.fw .env { height:30px; background:var(--ink); color:#e2e3e3; display:flex; align-items:center; justify-content:center; gap:10px; font-size:var(--fs-2); padding:0 16px; }
.fw .env b { font-weight:560; color:var(--reverse); }
.fw .env .sep { width:1px; height:12px; background:#454748; }
.fw .env button:not(.btn) { background:transparent; border:0; color:#b8b8b9; cursor:pointer; font-size:var(--fs-2);
  text-decoration:underline; text-underline-offset:2px; padding:0; }
.fw .env button:not(.btn):hover { color:var(--reverse); }

/* money position band */
.fw .band { display:flex; height:12px; border-radius:0; overflow:hidden; background:var(--surface-2); border:1px solid var(--line); }
.fw .band i { display:block; height:100%; }
.fw .band-key { display:flex; flex-wrap:wrap; gap:0 22px; margin-top:12px; }
.fw .keyitem { display:flex; align-items:baseline; gap:7px; padding:6px 0; }
.fw .keysw { width:8px; height:8px; border-radius:0; align-self:center; flex:none; }

/* timeline */
.fw .tl { list-style:none; margin:0; padding:0; }
.fw .tl li { display:flex; gap:12px; padding-bottom:16px; position:relative; }
.fw .tl li:last-child { padding-bottom:0; }
.fw .tl li::before { content:""; position:absolute; left:5px; top:14px; bottom:-2px; width:1px; background:var(--line); }
.fw .tl li:last-child::before { display:none; }
.fw .tl .pt { width:11px; height:11px; border-radius:50%; border:2px solid var(--line); background:var(--paper); flex:none; margin-top:4px; z-index:1; }
.fw .tl .pt[data-on="1"] { border-color:var(--ink); background:var(--ink); }
.fw .tl .pt[data-on="bad"] { border-color:var(--clay); background:var(--clay); }

/* modal / drawer */
.fw .scrim { position:fixed; inset:0; background:rgba(17,19,21,.32); z-index:60; display:flex; align-items:center; justify-content:center; padding:20px; }
.fw .modal { background:var(--card); border-radius:0; width:100%; max-width:460px;  max-height:90vh; overflow:auto; }
.fw .drawer { position:fixed; top:0 ; right:0; bottom:0; width:352px; max-width:92vw; background:var(--card); border-left:1px solid var(--line); z-index:70; overflow:auto;  }
.fw .pop { position:absolute; top:46px; right:0; width:360px; max-width:calc(100vw - 32px); background:var(--card); border:1px solid var(--line); border-radius:0;  z-index:50; overflow:hidden; }

/* toasts */
.fw .toasts { position:fixed; bottom:18px; right:18px; z-index:90; display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
.fw .toast { background:var(--ink); color:var(--reverse); padding:10px 14px; border-radius:0; font-size:var(--fs-3); max-width:330px;  }

/* landing */
.fw .lp-nav { height:62px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
.fw .hero { padding-block:76px 60px; }

/* The one accent on the page.
   Pine is reserved for money — see DESIGN.md — and this is the single
   deliberate exception, documented there rather than left to rot the rule. It
   sits on the hero's text column, not on the full-bleed band: a 4px stripe at
   the very edge of the viewport reads as a rendering artifact rather than as a
   decision. */
.fw .hero-accent { border-left:6px solid var(--pine); padding-left:var(--sp-6); }
@media (max-width:760px) { .fw .hero-accent { padding-left:var(--sp-5); } }

/* Three value props. A plain row of hairline-separated columns, not cards:
   cards would put a box around three sentences and call it a feature grid. */
.fw .props { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:0;
  border-top:1px solid var(--ink); }
.fw .props > div { padding:18px 20px 4px 0; border-right:1px solid var(--line); }
.fw .props > div + div { padding-left:var(--sp-5); }
.fw .props > div:last-child { border-right:0; }
.fw .props > div > * { min-width:0; }
.fw .props .pr-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .props .pr-d { display:block; font-size:var(--fs-3); line-height:1.5; color:var(--ink-2);
  margin-top:6px; max-width:38ch; }
@media (max-width:900px) {
  .fw .props { grid-auto-flow:row; grid-template-columns:1fr; border-top:0; }
  .fw .props > div { border-right:0; border-top:1px solid var(--line); padding:16px 0 4px; }
  .fw .props > div + div { padding-left:0; }
  .fw .props > div:first-child { border-top:1px solid var(--ink); }
}
/* Dashboard figures. Wraps rather than fixing a column count, because the
   revenue cell disappears when nothing has sold and a fixed grid would leave a
   hole where it was. minmax(0,...) so a long currency line shrinks instead of
   pushing the row wider than the card. */
.fw .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(148px,100%),1fr));
  gap:var(--sp-5) var(--sp-6); }
.fw .metrics .m-n { display:block; font-size:var(--fs-7); font-weight:var(--fw-bold);
  letter-spacing:-0.022em; font-variant-numeric:tabular-nums; }
/* Unknown is not zero, and must not look like a number. */
.fw .metrics .m-n[data-unknown="1"] { color:var(--ink-3); font-weight:var(--fw-med); }
.fw .metrics .m-l { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:5px; }
.fw .metrics .m-s { display:block; font-size:var(--fs-2); line-height:1.4; color:var(--ink-3); margin-top:3px; }
.fw .herofacts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:var(--sp-6); }
.fw .herofacts .hf-n { display:block; font-size:var(--fs-7); font-weight:var(--fw-bold); letter-spacing:-0.022em; }
.fw .herofacts .hf-l { display:block; font-size:var(--fs-2); line-height:1.45; color:var(--ink-3); margin-top:5px; }
@media (max-width:760px) { .fw .herofacts { grid-template-columns:1fr; gap:14px; }
  .fw .herofacts > div { display:flex; gap:12px; align-items:baseline; }
  .fw .herofacts .hf-n { font-size:var(--fs-6); }
  .fw .herofacts .hf-l { margin-top:0; } }
.fw .foot { border-top:1px solid var(--ink); padding:44px 0 40px; margin-top:0; background:var(--paper); }
.fw .footgrid { display:grid; grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr)); gap:36px; }
.fw .footgrid h3 { font-size:var(--fs-2); font-weight:var(--fw-bold); letter-spacing:0.03em; color:var(--ink-3); margin-bottom:11px; }
.fw .footgrid button { display:block; background:none; border:0; padding:0 0 9px; font-size:var(--fs-3);
  color:var(--ink-2); cursor:pointer; text-align:left; }
.fw .footgrid button:hover { color:var(--brand); }
/* Footer navigation. Was an inline style on each link, which meant the
   coarse-pointer tap-target rule below could not reach it. */
.fw .footlink { display:block; padding:0 0 9px; font-size:var(--fs-3); }
.fw .footbase { display:flex; justify-content:space-between; align-items:flex-end; gap:28px; flex-wrap:wrap;
  margin-top:40px; padding-top:20px; border-top:1px solid var(--line); }
@media (max-width:760px) {
  .fw .footgrid { grid-template-columns:1fr 1fr; gap:28px; }
  .fw .footbase { margin-top:28px; }
}

/* Empty states. Left-aligned on the same axis as the content that will
   replace them, so the column does not shift its optical centre the moment one
   item exists. The top rule is the only chrome: no card, no fill, no faded
   mark. The heading is a real heading rather than bold body text, because on
   an empty dashboard it is the only thing in the section and screen-reader
   users navigating by heading would otherwise skip past an empty region with
   no idea what it was. */
.fw .estate { border-top:1px solid var(--line); padding-top:var(--sp-5); }
.fw .estate-h { font-size:var(--fs-5); font-weight:var(--fw-bold); color:var(--ink);
  letter-spacing:-0.012em; margin:0; }
.fw .estate-b { font-size:var(--fs-3); line-height:1.55; color:var(--ink-3);
  margin:6px 0 0; max-width:var(--m-lead); }
.fw .estate-a { margin-top:var(--sp-4); display:flex; flex-wrap:wrap; align-items:center;
  gap:var(--sp-3) var(--sp-4); }
/* A notice raised by the action (a copied link) belongs under the row, not
   beside the button, so it never squeezes the control that produced it. */
.fw .estate-a > [role="status"] { flex:1 0 100%; }
.fw .vd { font-size:var(--fs-2); font-weight:var(--fw-med); white-space:nowrap; }
.fw .vd-ok { color:var(--pine); } .fw .vd-no { color:var(--clay); } .fw .vd-off { color:var(--ink-3); }
.fw .reqlist { border-top:1px solid var(--ink); }
/* One boundary, one line. A .reqlist opening a card drew its own dark rule a
   padding-gap below the header's rule, so every such card showed two
   separators for the same edge. The header already closes itself. */
.fw .card-b > .reqlist:first-child,
.fw .card-b > .tblwrap:first-child > .tbl { border-top:0; }
.fw .reqrow { display:flex; align-items:center; gap:var(--sp-4); padding:var(--sp-2) 0;
  border-bottom:1px solid var(--line); }
.fw .req-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .req-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:2px; max-width:var(--m-lead); }
.fw .captbl th:first-child { width:32%; }
.fw .provtbl th:first-child { width:44%; }
.fw .foldwho { font-size:var(--fs-2); letter-spacing:0.02em; color:var(--brand); font-weight:var(--fw-med);
  margin-top:var(--sp-5); padding-top:var(--sp-4); border-top:1px solid var(--line); }
.fw .foldwhy { list-style:none; margin:var(--sp-5) 0 0; padding:0; }
.fw .foldwhy li { position:relative; padding:7px 0 7px 20px; font-size:var(--fs-3); color:var(--ink-2);
  line-height:1.5; max-width:52ch; }
.fw .foldwhy li::before { content:""; position:absolute; left:0; top:14px; width:9px; height:9px;
  background:var(--brand);
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .foldwhy strong { color:var(--ink); font-weight:var(--fw-med); }
.fw .reality { list-style:none; margin:var(--sp-7) 0 0; padding:0;
  display:grid; grid-template-columns:1fr 1fr; gap:0 var(--sp-8); border-top:1px solid var(--ink); }
.fw .reality li { display:flex; gap:var(--sp-4); padding:var(--sp-4) 0; border-bottom:1px solid var(--line); }
.fw .reality-n { font-size:var(--fs-2); letter-spacing:0.04em; color:var(--brand); flex:none; padding-top:2px; }
.fw .reality-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.008em; }
.fw .reality-d { display:block; font-size:var(--fs-3); line-height:var(--lh-body); color:var(--ink-2); margin-top:5px; }
@media (max-width:900px) { .fw .reality { grid-template-columns:1fr; gap:0; } }
.fw .lp-eyebrow { display:block; font-size:var(--fs-2); font-weight:var(--fw-med); letter-spacing:0.02em;
  color:var(--brand); }
.fw .lp-dark .lp-eyebrow { color:#aeafaf; }
.fw .sec-lead { max-width:62ch; }
.fw .cardgrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:var(--sp-6); align-items:stretch; }
.fw .cardgrid > * { min-width:0; }
.fw .truthgrid { display:grid; grid-template-columns:minmax(0,5fr) minmax(0,7fr); gap:var(--sp-8); align-items:start; }
.fw .ownership { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--sp-8);
  margin-top:var(--sp-8); padding-top:var(--sp-6); border-top:1px solid var(--line); align-items:start; }
.fw .pricegrid { display:grid; grid-template-columns:minmax(0,6fr) minmax(0,5fr); gap:var(--sp-9); align-items:start; }
.fw .pricecard { border:1px solid var(--ink); background:var(--card); }
.fw .pricecard-h { display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding:12px 20px; border-bottom:1px solid var(--line); }
.fw .pricecard-b { padding:20px; }
.fw .pricecard-f { padding:16px 20px; border-top:1px solid var(--line); background:var(--surface); }
.fw .priceamt { display:flex; align-items:baseline; gap:10px; }
.fw .priceamt .num { font-size:var(--lp-1); line-height:1; letter-spacing:-0.04em; font-weight:var(--fw-bold); }
.fw .priceunit { font-size:var(--fs-3); color:var(--ink-3); }
.fw .trustgrid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:var(--sp-9); align-items:start; }
@media (max-width:900px) {
  .fw .truthgrid, .fw .ownership, .fw .pricegrid, .fw .trustgrid { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
}
.fw .ddemo-ctl { display:flex; gap:var(--sp-4); align-items:stretch; flex-wrap:wrap; }
.fw .dtoggle { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; background:transparent;
  border:1px solid rgba(255,255,255,.28); cursor:pointer; text-align:left; flex:1 1 300px; font-family:inherit; }
.fw .dtoggle:hover { border-color:rgba(255,255,255,.5); }
.fw .dtoggle[data-on="1"] { border-color:var(--reverse); }
.fw .dtoggle-box { width:15px; height:15px; border:1.5px solid rgba(255,255,255,.5); flex:none; margin-top:2px; position:relative; }
.fw .dtoggle[data-on="1"] .dtoggle-box { border-color:var(--reverse); }
.fw .dtoggle[data-on="1"] .dtoggle-box::after { content:""; position:absolute; inset:3px; background:var(--reverse); }
.fw .dtoggle-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .dtoggle-d { display:block; font-size:var(--fs-2); color:#bcbdbd; margin-top:2px; }
.fw .ddemo-out { margin-top:var(--sp-6); border-top:1px solid rgba(255,255,255,.2); padding-top:var(--sp-5); }
.fw .ddemo-sum { display:flex; gap:14px; align-items:baseline; flex-wrap:wrap; margin-bottom:var(--sp-4); }
.fw .dlist { list-style:none; margin:0; padding:0; }
.fw .dlist li { display:flex; gap:14px; align-items:flex-start; padding:12px 0;
  border-top:1px solid rgba(255,255,255,.16); }
.fw .dmark { width:9px; height:9px; flex:none; margin-top:5px;
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .dlist li[data-ok="1"] .dmark { background:#a5bdb4; }
.fw .dlist li[data-ok="0"] .dmark { background:#d9aeab; }
.fw .dlabel { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .ddetail { display:block; font-size:var(--fs-2); color:#bcbdbd; margin-top:3px; max-width:56ch; }
.fw .lp-dark .vd-ok { color:#a5bdb4; } .fw .lp-dark .vd-no { color:#d9aeab; }
.fw .lp-dark .lp-note { color:#9b9c9d; }
.fw .lp-dark .btn { background:var(--reverse); border-color:var(--reverse); color:var(--ink); }
.fw .lp-dark .btn:hover { background:#fff; border-color:#fff; }
/* On paper the secondary button is a lighter fill; on ink that reads as the
   same button twice, because both end up pale on dark. It becomes an outline
   here so the hierarchy survives the inversion — one filled, one drawn. */
.fw .lp-dark .btn-2 { background:transparent; border-color:#676869; color:var(--reverse); }
.fw .lp-dark .btn-2:hover { background:rgba(255,255,255,.09); border-color:var(--reverse); color:var(--reverse); }
.fw .lp-dark .btn-2:active { background:rgba(255,255,255,.15); border-color:var(--reverse); }
.fw .lp-dark .linkbtn { color:#e2e3e3; }
.fw .lp-dark .linkbtn:hover { color:#ffffff; }
.fw .lp-dark :focus-visible { outline-color:var(--reverse); }
.fw .dlist li > span:last-child { margin-left:auto; }
@media (max-width:900px) { .fw .ddemo-ctl { flex-direction:column; } }
.fw .stagebar { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); border:1px solid var(--line);
  border-bottom:0; }
.fw .stagebar button { display:flex; flex-direction:column; gap:6px; align-items:flex-start; padding:14px 16px;
  background:var(--surface); border:0; border-right:1px solid var(--line); cursor:pointer; text-align:left;
  font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--ink-3); font-family:inherit; }
.fw .stagebar button:last-child { border-right:0; }
.fw .stagebar button:hover { color:var(--ink-2); }
.fw .stagebar button[data-on="1"] { background:var(--card); color:var(--ink); box-shadow:inset 0 3px 0 var(--brand); }
.fw .stage-n { font-size:var(--fs-1); letter-spacing:0.04em; color:var(--ink-3); }
.fw .stagebar button[data-on="1"] .stage-n { color:var(--brand); }
.fw .stage-body { border:1px solid var(--line); background:var(--card); padding:var(--sp-6);
  min-height:430px; animation:stagein 170ms cubic-bezier(.4,0,.2,1) both; }
@keyframes stagein { from { opacity:0; } to { opacity:1; } }
.fw .stagebar button { transition:background-color var(--t), color var(--t); }
@media (prefers-reduced-motion: reduce) {
  .fw .stage-body { animation:none; }
  .fw .stagebar button { transition:none; }
}
.fw .hstage { display:grid; grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr); align-items:stretch; }
.fw .hlink { display:flex; align-items:center; justify-content:center; }
.fw .hlink span { display:block; width:100%; height:1px; background:var(--line); }
.fw .hpanel { border:1px solid var(--line); background:var(--paper); }
.fw .hpanel-on { border-color:var(--ink); background:var(--card); box-shadow:inset 0 0 0 1px var(--ink); }
.fw .hpanel-h { display:flex; justify-content:space-between; align-items:center; gap:12px;
  padding:10px 16px; border-bottom:1px solid var(--line-soft); }
.fw .hpanel-who { font-size:var(--fs-1); letter-spacing:0.04em; color:var(--ink-3); }
.fw .hpanel-b { padding:16px; }
.fw .hpanel-rows { margin:14px 0 0; }
.fw .hpanel-rows > div { display:grid; grid-template-columns:minmax(0,11ch) minmax(0,1fr); gap:14px;
  padding:8px 0; border-top:1px solid var(--line-soft); }
.fw .hpanel-rows dt { font-size:var(--fs-2); color:var(--ink-3); }
.fw .hpanel-rows dd { margin:0; font-size:var(--fs-2); color:var(--ink); }
.fw .hactor { display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:var(--sp-5);
  padding-top:var(--sp-4); border-top:1px solid var(--line); }
@media (max-width:900px) {
  .fw .stagebar { grid-template-columns:1fr 1fr; }
  .fw .stagebar button { border-bottom:1px solid var(--line); }
  .fw .hstage { grid-template-columns:minmax(0,1fr); gap:var(--sp-3); }
  .fw .hlink { height:20px; }
  .fw .hlink span { width:1px; height:100%; margin:0 auto; }
  .fw .stage-body { padding:var(--sp-4); }
}
@media (max-width:560px) { .fw .reqrow { flex-wrap:wrap; gap:var(--sp-2); } }
.fw .journey { list-style:none; margin:0; padding:0; border-top:1px solid var(--ink); }
.fw .journey li { display:flex; gap:var(--sp-4); align-items:baseline; padding:var(--sp-3) 0;
  border-bottom:1px solid var(--line); }
.fw .journey li[data-status="locked"] .j-t, .fw .journey li[data-status="locked"] .j-d { color:var(--ink-3); }
.fw .journey .j-n { font-size:var(--fs-2); letter-spacing:0.03em; color:var(--ink-3); width:22px; flex:none; }
.fw .journey .j-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .journey .j-d { display:block; font-size:var(--fs-2); color:var(--ink-2); margin-top:2px; max-width:var(--m-lead); }
.fw .journey .j-s { flex:none; }
@media (max-width:560px) { .fw .journey li { flex-wrap:wrap; } .fw .journey .j-s { margin-left:38px; } }
.fw .statusblock { border:var(--bw) solid var(--line); padding:var(--sp-4) var(--sp-5); background:var(--card); }
.fw .statusblock.sb-error { border-color:var(--clay-line); }
.fw .statusblock.sb-success { border-color:var(--pine-line); }
.fw .statusblock.sb-loading { background:var(--surface); }
.fw .sb-mark { width:9px; height:9px; flex:none; align-self:center;
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .sb-mark-grey { background:var(--ink-3); }
.fw .sb-mark-pine { background:var(--pine); }
.fw .sb-mark-clay { background:var(--clay); }
/* Section opener: the mark at 13px, above the heading, on the page's major turns */
.fw .sb-head { font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .sb-body { font-size:var(--fs-3); line-height:var(--lh-body); color:var(--ink-2); max-width:var(--m-body); margin-top:var(--sp-1); }
.fw .sb-loading .sb-head::after { content:"…"; }



@media (max-width: 940px) {
}
/* Default off. The 760px query below turns it on, and nothing later overrides it. */
.fw .stickycta { display:none; }
/* Tail padding for pages that carry the sticky bar, declared here rather than
   inline on each page. It used to be an inline paddingBottom, which beat the
   86px rule below on mobile and so had to stay larger than the bar whether or
   not that suited the page. With both values in the stylesheet, desktop can be
   tight and mobile still reserves room for the bar. */
.fw .has-sticky { padding-bottom:var(--tail); }
@media (max-width: 760px) {
  .fw .stickycta { display:block; position:fixed; left:0; right:0; bottom:0; z-index:75;
    background:var(--card); border-top:1px solid var(--ink); padding:11px 16px 13px; }
  .fw { --tail:86px; }
  .fw .has-sticky { padding-bottom:var(--tail); }
  .fw .shell { flex-direction:column; }
  .fw .rail { width:100%; border-right:0; border-bottom:1px solid var(--line); }
  .fw .nav { flex-direction:row; overflow-x:auto; padding:6px 10px; gap:4px; }
  .fw .nav button:not(.btn) { width:auto; white-space:nowrap; justify-content:center; }
  .fw .grid-2, .fw .grid-4, .fw .cardgrid { grid-template-columns:1fr; }
  
  .fw .page { padding:20px 16px 60px; }
  .fw .topbar { padding:0 16px; }
  .fw .d2 { font-size:var(--fs-7); }
  .fw .hero { padding-block:44px 36px; }
  .fw .tbl th, .fw .tbl td { padding:10px 12px; }
  .fw .hide-s { display:none; }
  .fw .grid-4 > * { border-right:0 !important; border-bottom:1px solid var(--line-soft); }
}
@media (pointer: coarse) {
  .fw .btn { min-height:var(--tap); }
  .fw .btn-sm { min-height:var(--tap); }
  .fw .nav button:not(.btn), .fw .frame-rail button:not(.btn), .fw .mobpanel button { min-height:var(--tap); }
  .fw .input, .fw .select { min-height:var(--tap); }
  .fw .tbl td { padding-top:14px; padding-bottom:14px; }
  /* A .linkbtn in a table cell is the row's action ("Open checkout"). As inline
     text only its glyph box is tappable, about 16px tall, so the cell padding
     around it is dead space that looks tappable and is not. */
  .fw .tbl .linkbtn { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* Footer navigation sat at 30px on every page. These are ordinary navigation
     links, not prose, so they get the same target as any other control. */
  .fw .footlink { display:flex; align-items:center; min-height:var(--tap); padding:0; }
  .fw .mobmenu, .fw .skiplink { min-height:var(--tap); }
  /* The wordmark is the "go home" control and wraps a 20px mark, so its link box
     was 23px tall. Targeted by its label rather than by adding a class to all
     fifteen places that render it. */
  .fw [aria-label="Veyro, home"] { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* A .linkbtn alone in its paragraph is a standalone control ("Every question,
     with the longer answers", the support address in the footer), not a link
     inside a sentence, so it gets a real target. Links WITH text around them are
     deliberately untouched: WCAG exempts them, and padding one out would break
     the line it sits in. */
  .fw p > .linkbtn:only-child { display:inline-flex; align-items:center; min-height:var(--tap); }
  /* "See the payment" / "Mark read" on a notification are standalone controls
     sitting in a row, not links inside a sentence. */
  .fw .n-actions .linkbtn { display:inline-flex; align-items:center; min-height:var(--tap); }
}
@media (max-width: 420px) {
  .fw .d2 { font-size:var(--fs-7); }
  .fw .wordmark-hero { font-size:var(--wm-sm); font-stretch:110%; }
  .fw .tagline { font-size:var(--fs-5); }
  
  .fw .page { padding:16px 12px 56px; }
  .fw .tbl th, .fw .tbl td { padding:9px 10px; font-size:var(--fs-2); }
  .fw .card-b, .fw .card-h, .fw .card-f { padding-left:13px; padding-right:13px; }
  .fw .band-key { gap:0 14px; }
}
`;

export const CSS2 = `
.fw .wordmark { display:inline-block; line-height:1; white-space:nowrap;
  font-family:var(--display); font-weight:var(--display-wght); font-stretch:var(--display-wdth);
  letter-spacing:-0.035em; }
.fw .wordmark-hero { font-size:var(--wm-lg); }
/* The cropped viewBox makes the SVG's bottom edge the baseline, so no vertical
   nudge is needed and the alignment holds at every size. */
/* 0.72em is Archivo's cap height. Expressed in em so the V tracks the type at
   every size, including inside a media query. */
.fw .wm-v { display:inline-block; vertical-align:baseline; height:0.72em; width:auto;
  margin-right:var(--wm-kern); letter-spacing:normal; }
.fw .wm-rest { display:inline; }
/* text-wrap:balance evens the two lines instead of letting the last word fall
   alone. The headline changed from four words to eight and a 26ch measure left
   "for." orphaned on its own line, which reads as a mistake at hero size.
   Browsers without it simply wrap as before. */
.fw .tagline { display:block; font-size:var(--fs-6); line-height:1.36; letter-spacing:-0.014em;
  font-weight:var(--fw-reg); color:var(--ink-2); margin-top:var(--sp-5); max-width:30ch;
  text-wrap:balance; }
.fw h1.hero-h { margin:0; }
.fw .mark { display:block; flex:none; }
.fw .brand { display:inline-block; line-height:1; }
.fw .lp-links { display:flex; align-items:center; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
.fw .lp-links button:not(.btn) { background:none; border:0; padding:7px 11px; border-radius:0; font-size:var(--fs-3);
  color:var(--ink-2); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-align:center; }
.fw .lp-links button:not(.btn):hover { background:var(--surface-2); color:var(--ink); }
/* Section rhythm.
   72px top and bottom meant 144px of nothing between every two sections, which
   measured as the largest empty runs on the site and read as the page having
   been padded out. 48 is still an unmistakable break — there is a rule line at
   every boundary doing that work — while putting the next section's first line
   most of a screen earlier on a long page. */
.fw section.lp { padding:var(--lp-pad) 0; border-top:1px solid var(--line);
  scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw [id]:focus { outline:none; }
.fw #main { scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw section.lp:nth-of-type(even) { background:var(--surface); }
.fw section.lp.lp-dark { background:var(--ink); }
.fw section.lp:first-of-type { border-top:0; }
.fw .skiplink { position:absolute; left:-9999px; top:0; z-index:200; background:var(--brand); color:var(--reverse);
  padding:10px 16px; font-size:var(--fs-3); font-weight:var(--fw-bold); }
.fw .skiplink:focus { left:0; }
.fw .progress { position:fixed; top:0; left:0; right:0; height:2px; background:transparent; z-index:90; }
.fw .progress i { display:block; height:100%; background:var(--brand); }
.fw .totop { position:fixed; right:24px; bottom:96px; z-index:70; display:flex; align-items:center; gap:9px;
  background:var(--card); border:1px solid var(--ink); color:var(--ink); font-size:var(--fs-2); font-weight:var(--fw-bold);
  letter-spacing:0.02em; padding:6px 13px 6px 6px; cursor:pointer; }
.fw .totop:hover { background:var(--surface); }
@media (pointer: coarse) { .fw .totop { min-height:var(--tap); } }
.fw .totop-mark { width:23px; height:23px; background:var(--brand); display:flex; align-items:center;
  justify-content:center; flex:none; }
.fw .lp-nav { border-bottom:1px solid transparent; }
.fw .navbar { position:sticky; top:0; z-index:60; background:var(--paper); }
.fw .lp-nav.sticky { background:transparent; }
.fw .lp-nav.sticky[data-scrolled="1"] { border-bottom-color:var(--line); }
.fw .tblwrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
.fw .tblwrap .tbl { min-width:520px; }
.fw .disc { border-bottom:1px solid var(--line); }
.fw .disc-q { display:flex; width:100%; justify-content:space-between; align-items:baseline;
  gap:var(--sp-5); padding:var(--sp-4) 0; background:transparent; border:0; cursor:pointer;
  text-align:left; font-size:var(--fs-4); font-weight:var(--fw-bold); color:var(--ink);
  font-family:inherit; letter-spacing:-0.008em; }
.fw .disc-q:hover { color:var(--brand); }
.fw .disc-sign { position:relative; width:11px; height:11px; flex:none; align-self:center; }
.fw .disc-sign::before, .fw .disc-sign::after { content:""; position:absolute; background:var(--ink-3); }
.fw .disc-sign::before { left:0; right:0; top:5px; height:1.5px; }
.fw .disc-sign::after { top:0; bottom:0; left:5px; width:1.5px;
  transition:transform var(--t-2) var(--ease), opacity var(--t-2) var(--ease); }
.fw .disc[data-open="1"] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-q { color:var(--brand); }
.fw .disc-q::-webkit-details-marker { display:none; }
.fw summary.disc-q { list-style:none; }
.fw .disc[data-open="1"] .disc-q { color:var(--brand); }
/* 0fr to 1fr animates to the content's real height with no JS measurement */
.fw .disc-panel { display:grid; grid-template-rows:0fr;
  transition:grid-template-rows var(--t-2) var(--ease); }
.fw .disc[data-open="1"] .disc-panel { grid-template-rows:1fr; }
.fw .disc-panel > div { overflow:hidden; }
.fw .disc-a { margin:0; padding:0 0 var(--sp-4); font-size:var(--fs-3); line-height:var(--lh-body);
  color:var(--ink-2); max-width:var(--m-wide); }
@media (prefers-reduced-motion: reduce) {
  .fw .disc-panel, .fw .disc-sign::after { transition:none; }
}
.fw .pwwrap { position:relative; }
.fw .pwwrap .input { padding-right:66px; }
.fw .pwtoggle { position:absolute; right:1px; top:0; bottom:0; min-height:var(--tap); padding:0 11px; background:transparent; border:0;
  font-size:var(--fs-2); font-weight:var(--fw-bold); color:var(--ink-2); cursor:pointer; }
.fw .pwtoggle:hover { color:var(--ink); }
.fw .lp-links button.mobmenu { display:none; }
.fw .mobpanel { display:none; }
.fw .mobpanel button { display:block; width:100%; text-align:left; background:transparent; border:0;
  border-bottom:1px solid var(--line-soft); padding:14px 2px; font-size:var(--fs-4); font-weight:var(--fw-med);
  color:var(--ink); cursor:pointer; }
.fw .mobpanel button:last-child { border-bottom:0; color:var(--brand); font-weight:var(--fw-bold); }
.fw .mobpanel button:hover { color:var(--brand); }
.fw .searchbar { display:flex; gap:8px; align-items:center; }
.fw .searchbar .input { height:32px; font-size:var(--fs-3); max-width:260px; }
@media (max-width:760px) {
  .fw .lp-links button.mobmenu { display:inline-flex; }
  .fw .mobpanel { display:block; border-top:1px solid var(--line); padding:4px 0 18px; }
  .fw .totop { bottom:152px; right:14px; }
}
@media print {
  .fw .rail, .fw .topbar, .fw .env, .fw .cookiebar, .fw .stickycta, .fw .totop, .fw .progress,
  .fw .drawer, .fw .scrim, .fw .toasts, .fw .lp-nav, .fw .foot, .fw .btn, .fw .skiplink { display:none !important; }
  .fw { background:#fff; color:#000; font-size:11pt; }
  .fw .card, .fw .panel { border:1px solid #999; break-inside:avoid; }
  .fw .page, .fw .page-in { padding:0; max-width:none; }
  .fw .tblwrap { overflow:visible; }
  .fw .tbl { min-width:0; }
  .fw .tbl tr { break-inside:avoid; }
  .fw .hide-s { display:table-cell !important; }
  .fw a[href]::after { content:" (" attr(href) ")"; font-size:9pt; color:#555; }

  /* Same-page anchors print their own href, so every contents entry came out as
     "What Veyro is (#clause-1)". The target is on the same sheet of paper. */
  .fw a[href^="#"]::after { content:none; }

  /* .navbar is the sticky wrapper. Its contents (.lp-nav) were already hidden,
     which left an empty bar at the top of the first page. */
  .fw .navbar, .fw .mobpanel, .fw .mobmenu { display:none !important; }

  /* body paints the page ivory on screen. Paper should be paper. */
  body { background:#fff !important; }

  /* A sticky contents column means nothing on paper, and a clause split across
     two sheets mid-sentence is the one thing a printed policy must not do. */
  .fw [style*="position: sticky"], .fw [style*="position:sticky"] { position:static !important; }
  .fw section[id^="clause-"] { break-inside:avoid; }
  .fw .truthgrid { display:block; }
}
.fw .cookiebar { position:fixed; left:0; right:0; bottom:0; z-index:80; background:var(--card); border-top:1px solid var(--ink); }

.fw .linkrow { display:block; width:100%; text-align:left; background:transparent; border:0; border-bottom:1px solid var(--line); padding:15px 0; cursor:pointer; }
.fw .linkrow:hover { background:var(--surface); }
.fw .linkrow-t { display:block; font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .linkrow-d { display:block; font-size:var(--fs-3); color:var(--ink-2); margin-top:3px; }
.fw .numbered { list-style:none; margin:0; padding:0; counter-reset:s; border-top:1px solid var(--ink); }
.fw .numbered li { counter-increment:s; display:grid; grid-template-columns:2.2rem minmax(0,15ch) minmax(0,1fr); gap:18px; padding:12px 0; border-bottom:1px solid var(--line); align-items:baseline; }
.fw .numbered li::before { content:counter(s,decimal-leading-zero); font-size:var(--fs-2); letter-spacing:0.03em; color:var(--ink-3); }
.fw .numbered li > span:first-of-type { font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .numbered li > span:last-of-type { font-size:var(--fs-3); color:var(--ink-2); line-height:1.55; }
@media (max-width:760px) { .fw .numbered li { grid-template-columns:2.2rem minmax(0,1fr); gap:6px 16px; }
  .fw .numbered li > span:last-of-type { grid-column:2; } }
.fw .ruled { margin:0; border-top:1px solid var(--ink); }
.fw .ruled > div { display:grid; grid-template-columns:minmax(0,16ch) minmax(0,1fr); gap:24px; padding:13px 0; border-bottom:1px solid var(--line); }
.fw .ruled dt { font-size:var(--fs-4); font-weight:var(--fw-bold); letter-spacing:-0.006em; }
.fw .ruled dd { margin:0; font-size:var(--fs-3); line-height:1.6; color:var(--ink-2); }
@media (max-width:760px) { .fw .ruled > div { grid-template-columns:1fr; gap:5px; } }
.fw .arrowlist { list-style:none; margin:0; padding:0; }
.fw .arrowlist li { padding:5px 0 5px 0; font-size:var(--fs-3); color:var(--ink-2); position:relative; }
.fw .arrowlist li + li { border-top:1px solid var(--line-soft); }
.fw .ctx { display:flex; align-items:center; gap:9px; margin:0 16px 10px; padding:0 0 12px; border-bottom:1px solid var(--line); }
.fw .initials { width:26px; height:26px; background:var(--brand); color:var(--reverse); font-size:var(--fs-1); font-weight:var(--fw-bold); letter-spacing:0.02em; display:flex; align-items:center; justify-content:center; flex:none; }
.fw .ctx-n { display:block; font-size:var(--fs-2); font-weight:var(--fw-med); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fw .ctx-s { display:flex; align-items:center; gap:5px; font-size:var(--fs-1); color:var(--ink-3); margin-top:1px; }
.fw .nav button { color:var(--ink-2); }
.fw .nav button svg { color:var(--ink-3); }
.fw .nav button[data-on="1"] svg { color:var(--ink); }
.fw .frame { border:1px solid var(--line); overflow:hidden; background:var(--card); }
.fw .frame-bar { height:34px; background:var(--surface); border-bottom:1px solid var(--line); display:flex; align-items:center; padding:0 16px; gap:6px; }
.fw .frame-body { display:flex; min-height:250px; }
.fw .frame-rail { width:122px; flex:none; border-right:1px solid var(--line); background:var(--surface); padding:8px; }
.fw .frame-rail button:not(.btn) { width:100%; font-size:var(--fs-1); color:var(--ink-3); padding:6px 8px; border-radius:0;
  display:flex; align-items:center; gap:7px; background:transparent; border:0; cursor:pointer; text-align:left; }
.fw .frame-rail button:hover { background:var(--surface-2); color:var(--ink-2); }
.fw .frame-rail button[data-on="1"] { background:var(--card); color:var(--ink); box-shadow:inset 0 0 0 1px var(--line); font-weight:var(--fw-bold); }
.fw .frame-rail button[data-on="1"] svg { color:var(--brand); }
.fw .frame-main { flex:1 1 auto; padding:16px; min-width:0; min-height:196px; }

.fw .hrow { display:flex; align-items:center; gap:10px; padding:8px 0; border-top:1px solid var(--line-soft); }
.fw .hrow:first-child { border-top:0; padding-top:2px; }
.fw .hrow-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); }
.fw .hrow-s { display:block; font-size:var(--fs-1); color:var(--ink-3); margin-top:1px; }
.fw .lp-dark { background:var(--ink); border-top:0; }
/* When the dark band is the last thing on the page, main's tail padding would
   show a strip of paper beneath it and make the band look misplaced rather
   than like the floor of the page. It absorbs that padding instead, so the
   colour runs to the footer while the space the sticky bar needs is kept. */
.fw main > section.lp-dark:last-child {
  margin-bottom:calc(-1 * var(--tail));
  padding-bottom:calc(var(--lp-pad) + var(--tail)); }
.fw .lp-dark .d1, .fw .lp-dark .d2, .fw .lp-dark h2, .fw .lp-dark .statement { color:var(--reverse); }
.fw .lp-dark .body, .fw .lp-dark .small, .fw .lp-dark .lead { color:#bcbdbd; }
.fw .lp-dark .tiny { color:#9b9c9d; }
.fw .lp-center { text-align:center; }
.fw .lp-center .mark { margin-left:auto; margin-right:auto; }
.fw .lp-center .statement, .fw .lp-center .statement-sub, .fw .lp-center .d2 { margin-left:auto; margin-right:auto; }
.fw .lp-center .sec-h { margin-left:auto; margin-right:auto; }
.fw .lp-center .lp-h2, .fw .lp-center .lp-h1, .fw .lp-center .body,
.fw .lp-center .lead, .fw .lp-center .sec-lead { margin-left:auto; margin-right:auto; }
.fw .lp-tall { padding:var(--sp-10) 0; }
.fw .lp-dark .statement-sub { color:#bcbdbd; }
/* The mark's own stroke angle, reused as a section divider */
@media (max-width:760px) {
  .fw .lp-tall { padding:var(--sp-9) 0; }
}
.fw .split { display:grid; grid-template-columns:var(--split-a) var(--split-b); gap:var(--sp-9); align-items:start; }
.fw .split-lead { display:grid; grid-template-columns:minmax(0,1.02fr) minmax(0,1fr); gap:var(--sp-9); align-items:start; }
@media (max-width:940px) {
  .fw .split, .fw .split-lead { grid-template-columns:minmax(0,1fr); gap:var(--sp-6); }
}
.fw .hero-band { background:var(--surface); border-bottom:1px solid var(--line); }
.fw .hero-band .frame { background:var(--card); }
@media (max-width:760px) {
  .fw .ctx { display:none; }
  .fw .frame-body { flex-direction:column; }
  .fw .frame-rail { width:100%; border-right:0; border-bottom:1px solid var(--line); display:flex; gap:3px; overflow-x:auto; padding:7px 8px; }
  .fw .frame-rail button:not(.btn) { width:auto; white-space:nowrap; justify-content:center; }
  .fw .frame-main { min-height:0; }
}
.fw .grid-4 > :last-child { border-right:0 !important; }
/* Centred, not top-aligned.
   The left column lost its three figures to their own band below, and against
   a preview card that runs the full height of the band that left roughly 240px
   of empty ground under the buttons — a hole rather than breathing room. With
   the columns centred the same whitespace is split above and below, which
   reads as air. Only from 940px up, where the two are side by side; below that
   they stack and there is nothing to centre against. */
.fw .hero-grid { align-items:start; }
@media (min-width:941px) { .fw .hero-grid { align-items:center; } }
/* minmax(0,1fr), not 1fr: a bare 1fr track is floored at its item's min-content,
   so one long unbreakable line in the hero widened the track past the viewport
   and body's overflow-x:clip cut the hero off instead of scrolling. The !important
   here was overriding the minmax(0,...) that .split-lead sets for exactly this. */
@media (max-width:940px) { .fw .hero-grid { grid-template-columns:minmax(0,1fr) !important; gap:32px !important; } }
@media (max-width:760px) {
  .fw .wordmark-hero { font-size:var(--wm-md); font-stretch:114%; }
  .fw .tagline { font-size:var(--fs-6); }
  .fw .lp-links button.hide-s { display:none; }
  .fw { --lp-pad:32px; }
  .fw section.lp { padding:var(--lp-pad) 0; }
}
`;
