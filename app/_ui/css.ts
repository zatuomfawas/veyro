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

  --paper:#f2f0ea; --surface:#ebe8df; --surface-2:#e4e0d5;
  --card:#faf9f5; --reverse:#f4f2ec;
  --line:#d3cec1; --line-soft:#e0dbcd;
  --brand:#1e4636; --brand-h:#2a5c48;
  /* --ink-3 was #726d61, which measured 4.21:1 on --surface: below WCAG AA's
     4.5:1 for normal text, and --surface is the hero band's background, where
     .tiny and .hf-l both use it. Darkened 9% to clear AA on every background
     in the palette, worst case 4.55:1 on --surface-2. See DESIGN.md. */
  --ink:#191814; --ink-2:#4c483f; --ink-3:#676358;
  --pine:#245040; --pine-bg:transparent; --pine-line:#a9bdb1;
  --amber:#7a4e10; --amber-bg:transparent; --amber-line:#cbb489;
  --slate:#2a4763; --slate-bg:transparent; --slate-line:#a6b6c6;
  --clay:#8a2e21; --clay-bg:transparent; --clay-line:#c9a49c;
  /* Display face, wordmark only. Never for interface text. */
  --display: var(--font-archivo), "Archivo", "Helvetica Neue", "Arial Black", Helvetica, Arial, sans-serif;
  --display-wdth: 118%; --display-wght: 800;
  /* Logotype scale. Deliberately separate from the UI type scale */
  --wm-lg:72px; --wm-md:52px; --wm-sm:38px; --wm-nav:20px;
  /* Kern pair for V + e. The V's box edge is 0.097em wider than its ink at
     x-height, so this pulls the following letter into that wedge. One number. */
  --wm-kern:-0.085em;
  /* Landing only. The application keeps the smaller dashboard scale. */
  --lp-1:64px; --lp-2:40px; --lp-3:26px; --lp-lead:19px;
  --lp-gut:32px; --lp-max:1440px;
  /* One gutter, fluid. 16px on a small phone, growing to 48px on a wide
     desktop. Replaces four hand-written padding values that each needed
     their own breakpoint. */
  --gut: clamp(16px, 4vw, 48px);
  --lp-pad-lg:104px; --lp-pad-md:72px; --lp-pad-sm:48px;
  /* Haffer (Displaay) is the intended primary. Its files are commercially
     licensed and unavailable here, so Onest is the implemented fallback, per the
     brief. Swapping Haffer in is a change to this one line. */
  --ui: var(--font-onest), "Onest", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
.fw button, .fw input, .fw select, .fw textarea { font: inherit; color: inherit; }
.fw a { color: inherit; text-decoration: none; }
.fw :focus-visible { outline:2px solid var(--brand); outline-offset:2px; border-radius:0; }
.fw .page-h { padding-bottom:2px; }
.fw .page-h .d2 + .small { margin-top:5px; }
.fw .rail-sec { padding:16px 8px 6px; font-size:var(--fs-1); color:var(--ink-3); }
/* The only motion in the product is scroll, and it is handled in JS via
   scrollBehavior(). This rule is the belt-and-braces version for the browser. */
@media (prefers-reduced-motion: reduce) { html { scroll-behavior:auto !important; } }

/* type */
.fw h1,.fw h2,.fw h3,.fw h4 { margin:0; font-weight:var(--fw-bold); letter-spacing:-0.016em; font-family:inherit; }

.fw p { margin:0; }
.fw .d2 { font-size:var(--fs-8); line-height:1.21; letter-spacing:-0.022em; font-weight:var(--fw-bold); }
.fw .h3 { font-size:var(--fs-6); line-height:1.32; letter-spacing:-0.016em; font-weight:var(--fw-bold); }
.fw .h4 { font-size:var(--fs-4); line-height:1.4; letter-spacing:-0.008em; font-weight:var(--fw-bold); }
.fw .lead { font-size:var(--fs-5); line-height:1.58; color:var(--ink-2); max-width:var(--m-lead); }
.fw .body { font-size:var(--fs-4); line-height:1.6; color:var(--ink-2); max-width:70ch; }
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
.fw .lp-h2 { font-size:var(--lp-2); line-height:1.1; letter-spacing:-0.028em; font-weight:var(--fw-bold); max-width:18ch; }
.fw .lp-h3 { font-size:var(--lp-3); line-height:1.2; letter-spacing:-0.02em; font-weight:var(--fw-bold); }
.fw .lp-lead { font-size:var(--lp-lead); line-height:1.55; color:var(--ink-2); max-width:56ch; }
.fw .lp-note { font-size:var(--fs-2); line-height:1.5; color:var(--ink-3); max-width:var(--m-wide); }
.fw section.lp-pad-lg { padding:var(--lp-pad-lg) 0; }
.fw section.lp-pad-md { padding:var(--lp-pad-md) 0; }
.fw section.lp-pad-sm { padding:var(--lp-pad-sm) 0; }
@media (max-width:900px) {
  .fw { --lp-1:40px; --lp-2:30px; --lp-3:21px; --lp-lead:17px; --lp-gut:20px;
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
.fw .btn:active { background:#0c3527; border-color:#0c3527; }
.fw .btn[aria-busy="true"] { background:var(--brand-h); border-color:var(--brand-h); opacity:.85; cursor:progress; }
.fw .btn[aria-busy="true"]::before { content:""; width:var(--marker); height:var(--marker); background:var(--reverse); flex:none; }
.fw .btn-2:active { background:var(--surface-2); border-color:var(--ink-3); }
.fw .btn-q:active { background:var(--surface-2); }
.fw .btn-d:active { background:#f0d9d5; }
.fw .btn:disabled, .fw .btn:disabled:hover { opacity:.38; cursor:not-allowed; background:var(--brand); border-color:var(--brand); }
.fw .btn-2:disabled, .fw .btn-2:disabled:hover { background:var(--card); border-color:var(--line); color:var(--ink-3); }

.fw .nav button:not(.btn)[data-on="1"] { font-weight:var(--fw-med); }
.fw .btn:disabled { opacity:.4; cursor:not-allowed; }
.fw .btn-2 { background:var(--paper); color:var(--ink); border-color:var(--line); }
.fw .btn-2:hover { background:var(--surface); border-color:#d5d5d1; }
.fw .btn-q { background:transparent; border-color:transparent; color:var(--ink-2); }
.fw .btn-q:hover { background:var(--surface-2); border-color:transparent; color:var(--ink); }
.fw .btn-d { background:var(--paper); color:var(--clay); border-color:var(--clay-line); }
.fw .btn-d:hover { background:var(--clay-bg); border-color:var(--clay-line); }
.fw .linkbtn { background:none; border:0; padding:0; font:inherit; color:var(--brand); cursor:pointer;
  text-decoration:underline; text-underline-offset:2px; }
.fw .linkbtn:hover { color:var(--brand-h); }
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
  width:100%; height:var(--h-md); padding:0 var(--sp-3); border:1px solid var(--line); border-radius:0;
  background:var(--card); font-size:var(--fs-3);
}
.fw .ta { height:auto; padding:9px 11px; resize:vertical; line-height:1.5; }
.fw .input:focus, .fw .select:focus, .fw .ta:focus { outline:none; border-color:var(--brand); box-shadow:inset 0 0 0 1px var(--brand); }
.fw .input::placeholder, .fw .ta::placeholder { color:#a8adb1; }
.fw .input:hover:not(:focus):not(:disabled), .fw .select:hover:not(:focus):not(:disabled) { border-color:var(--ink-3); }
.fw .input:disabled, .fw .select:disabled, .fw .ta:disabled {
  background:var(--surface); color:var(--ink-3); cursor:not-allowed; border-color:var(--line-soft); }
.fw .input.bad, .fw .select.bad, .fw .ta.bad { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.bad:focus, .fw .ta.bad:focus { border-color:var(--clay); box-shadow:inset 0 0 0 1px var(--clay); }
.fw .input.good { border-color:var(--pine); }
.fw .charcount { float:right; font-size:var(--fs-1); color:var(--ink-3); font-variant-numeric:tabular-nums; }
.fw .charcount[data-near="1"] { color:var(--amber); }
.fw .charcount[data-over="1"] { color:var(--clay); font-weight:var(--fw-med); }
.fw .hint { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--ink-3); }
.fw .err { display:block; margin-top:5px; font-size:var(--fs-2); color:var(--clay); }
.fw .choice { display:flex; gap:10px; align-items:flex-start; padding:12px 13px; border:1px solid var(--line); cursor:pointer; background:var(--card); text-align:left; width:100%; }
.fw .choice:hover { border-color:var(--ink-3); }
.fw .choice[data-on="1"] { border-color:var(--ink); background:var(--card); box-shadow:inset 0 0 0 1px var(--ink); }
.fw .tick { width:15px; height:15px; border-radius:50%; border:1.5px solid var(--line); flex:none; margin-top:3px; position:relative; }
.fw .choice[data-on="1"] .tick { border-color:var(--ink); }
.fw .choice[data-on="1"] .tick::after { content:""; position:absolute; inset:3px; border-radius:50%; background:var(--ink); }

/* table */
.fw .tbl { width:100%; border-collapse:collapse; }
.fw .tbl th { text-align:left; font-size:var(--fs-2); font-weight:var(--fw-med); color:var(--ink-3); padding:var(--sp-2) var(--sp-5); border-bottom:1px solid var(--line); background:var(--surface); }
.fw .tbl td { padding:var(--sp-3) var(--sp-5); border-bottom:1px solid var(--line-soft); font-size:var(--fs-3); vertical-align:middle; }
.fw .tbl tr:last-child td { border-bottom:0; }
.fw .tbl .r { text-align:right; }
.fw .tbl-c tbody tr { cursor:pointer; }
.fw .tbl-c tbody tr:hover { background:var(--surface); }
.fw .tbl-c tbody tr:active { background:var(--surface-2); }
.fw .nav button:not(.btn):active { background:var(--surface-2); }
.fw .frame-rail button:not(.btn):active { background:var(--surface-2); }
.fw .linkrow:active { background:var(--surface-2); }
.fw .footgrid button:active { color:var(--brand-h); }
.fw .choice:active { background:var(--surface); }
.fw .linkbtn:active { color:var(--brand-h); }

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
.fw .env { height:30px; background:var(--ink); color:#e8e8e6; display:flex; align-items:center; justify-content:center; gap:10px; font-size:var(--fs-2); padding:0 16px; }
.fw .env b { font-weight:560; color:var(--reverse); }
.fw .env .sep { width:1px; height:12px; background:#3d4145; }
.fw .env button:not(.btn) { background:transparent; border:0; color:#b9bec2; cursor:pointer; font-size:var(--fs-2);
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
.fw .hero { padding-block:72px 68px; }
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
.fw .footbase { display:flex; justify-content:space-between; align-items:flex-end; gap:28px; flex-wrap:wrap;
  margin-top:40px; padding-top:20px; border-top:1px solid var(--line); }
@media (max-width:760px) {
  .fw .footgrid { grid-template-columns:1fr 1fr; gap:28px; }
  .fw .footbase { margin-top:28px; }
}

.fw .empty { padding:var(--sp-8) var(--sp-5); text-align:center; }
.fw .empty .mark { margin:0 auto var(--sp-4); opacity:.4; }
.fw .vd { font-size:var(--fs-2); font-weight:var(--fw-med); white-space:nowrap; }
.fw .vd-ok { color:var(--pine); } .fw .vd-no { color:var(--clay); } .fw .vd-off { color:var(--ink-3); }
.fw .reqlist { border-top:1px solid var(--ink); }
.fw .reqrow { display:flex; align-items:center; gap:var(--sp-4); padding:var(--sp-3) 0;
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
.fw .lp-dark .lp-eyebrow { color:#8fc4ac; }
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
  border:1px solid rgba(244,242,236,.28); cursor:pointer; text-align:left; flex:1 1 300px; font-family:inherit; }
.fw .dtoggle:hover { border-color:rgba(244,242,236,.5); }
.fw .dtoggle[data-on="1"] { border-color:var(--reverse); }
.fw .dtoggle-box { width:15px; height:15px; border:1.5px solid rgba(244,242,236,.5); flex:none; margin-top:2px; position:relative; }
.fw .dtoggle[data-on="1"] .dtoggle-box { border-color:var(--reverse); }
.fw .dtoggle[data-on="1"] .dtoggle-box::after { content:""; position:absolute; inset:3px; background:var(--reverse); }
.fw .dtoggle-t { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .dtoggle-d { display:block; font-size:var(--fs-2); color:#b4b0a4; margin-top:2px; }
.fw .ddemo-out { margin-top:var(--sp-6); border-top:1px solid rgba(244,242,236,.2); padding-top:var(--sp-5); }
.fw .ddemo-sum { display:flex; gap:14px; align-items:baseline; flex-wrap:wrap; margin-bottom:var(--sp-4); }
.fw .dlist { list-style:none; margin:0; padding:0; }
.fw .dlist li { display:flex; gap:14px; align-items:flex-start; padding:12px 0;
  border-top:1px solid rgba(244,242,236,.16); }
.fw .dmark { width:9px; height:9px; flex:none; margin-top:5px;
  clip-path:polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%); }
.fw .dlist li[data-ok="1"] .dmark { background:#7fb79c; }
.fw .dlist li[data-ok="0"] .dmark { background:#d98b7f; }
.fw .dlabel { display:block; font-size:var(--fs-3); font-weight:var(--fw-med); color:var(--reverse); }
.fw .ddetail { display:block; font-size:var(--fs-2); color:#b4b0a4; margin-top:3px; max-width:56ch; }
.fw .lp-dark .vd-ok { color:#7fb79c; } .fw .lp-dark .vd-no { color:#d98b7f; }
.fw .lp-dark .lp-note { color:#8b877c; }
.fw .lp-dark .btn { background:var(--reverse); border-color:var(--reverse); color:var(--ink); }
.fw .lp-dark .btn:hover { background:#fff; border-color:#fff; }
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
.fw .stagebar button { transition:background 140ms ease, color 140ms ease; }
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
@media (max-width: 760px) {
  .fw .stickycta { display:block; position:fixed; left:0; right:0; bottom:0; z-index:75;
    background:var(--card); border-top:1px solid var(--ink); padding:11px 16px 13px; }
  .fw .has-sticky { padding-bottom:86px; }
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
.fw .tagline { display:block; font-size:var(--fs-6); line-height:1.36; letter-spacing:-0.014em;
  font-weight:var(--fw-reg); color:var(--ink-2); margin-top:var(--sp-5); max-width:26ch; }
.fw h1.hero-h { margin:0; }
.fw .mark { display:block; flex:none; }
.fw .brand { display:inline-block; line-height:1; }
.fw .lp-links { display:flex; align-items:center; gap:4px; flex-wrap:wrap; justify-content:flex-end; }
.fw .lp-links button:not(.btn) { background:none; border:0; padding:7px 11px; border-radius:0; font-size:var(--fs-3);
  color:var(--ink-2); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; text-align:center; }
.fw .lp-links button:not(.btn):hover { background:var(--surface-2); color:var(--ink); }
.fw section.lp { padding:72px 0; border-top:1px solid var(--line);
  scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw [id]:focus { outline:none; }
.fw #main { scroll-margin-top:calc(var(--nav-h) + var(--sp-4)); }
.fw section.lp:nth-of-type(even) { background:var(--card); }
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
  transition:transform 180ms cubic-bezier(.4,0,.2,1), opacity 180ms cubic-bezier(.4,0,.2,1); }
.fw .disc[data-open="1"] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-sign::after { transform:scaleY(0); opacity:0; }
.fw details.disc[open] .disc-q { color:var(--brand); }
.fw .disc-q::-webkit-details-marker { display:none; }
.fw summary.disc-q { list-style:none; }
.fw .disc[data-open="1"] .disc-q { color:var(--brand); }
/* 0fr to 1fr animates to the content's real height with no JS measurement */
.fw .disc-panel { display:grid; grid-template-rows:0fr;
  transition:grid-template-rows 180ms cubic-bezier(.4,0,.2,1); }
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
.fw .numbered li { counter-increment:s; display:grid; grid-template-columns:2.2rem minmax(0,26ch) minmax(0,1fr); gap:20px; padding:15px 0; border-bottom:1px solid var(--line); align-items:baseline; }
.fw .numbered li::before { content:counter(s,decimal-leading-zero); font-size:var(--fs-2); letter-spacing:0.03em; color:var(--ink-3); }
.fw .numbered li > span:first-of-type { font-size:var(--fs-4); font-weight:var(--fw-bold); }
.fw .numbered li > span:last-of-type { font-size:var(--fs-3); color:var(--ink-2); line-height:1.55; }
@media (max-width:760px) { .fw .numbered li { grid-template-columns:2.2rem minmax(0,1fr); gap:6px 16px; }
  .fw .numbered li > span:last-of-type { grid-column:2; } }
.fw .ruled { margin:0; border-top:1px solid var(--ink); }
.fw .ruled > div { display:grid; grid-template-columns:minmax(0,22ch) minmax(0,1fr); gap:28px; padding:16px 0; border-bottom:1px solid var(--line); }
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
.fw .lp-dark .d1, .fw .lp-dark .d2, .fw .lp-dark h2, .fw .lp-dark .statement { color:var(--reverse); }
.fw .lp-dark .body, .fw .lp-dark .small, .fw .lp-dark .lead { color:#b4b0a4; }
.fw .lp-dark .tiny { color:#8b877c; }
.fw .lp-center { text-align:center; }
.fw .lp-center .mark { margin-left:auto; margin-right:auto; }
.fw .lp-center .statement, .fw .lp-center .statement-sub, .fw .lp-center .d2 { margin-left:auto; margin-right:auto; }
.fw .lp-center .sec-h { margin-left:auto; margin-right:auto; }
.fw .lp-center .lp-h2, .fw .lp-center .lp-h1, .fw .lp-center .body,
.fw .lp-center .lead, .fw .lp-center .sec-lead { margin-left:auto; margin-right:auto; }
.fw .lp-tall { padding:var(--sp-10) 0; }
.fw .lp-dark .statement-sub { color:#b4b0a4; }
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
.fw .hero-grid { align-items:start; }
@media (max-width:940px) { .fw .hero-grid { grid-template-columns:1fr !important; gap:32px !important; } }
@media (max-width:760px) {
  .fw .wordmark-hero { font-size:var(--wm-md); font-stretch:114%; }
  .fw .tagline { font-size:var(--fs-6); }
  .fw .lp-links button.hide-s { display:none; }
  .fw section.lp { padding:42px 0; }
}
`;
