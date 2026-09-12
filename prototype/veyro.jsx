/**
 * Veyro, the financial operating layer for young founders.
 *
 * This file is the application prototype: landing, auth, founder onboarding,
 * business creation, guardian invitation + acceptance, guardian dashboard,
 * the Veyro ledger, payment-provider abstraction, payouts,
 * notifications and an audit log.
 *
 * Honest boundaries (see ARCHITECTURE.md):
 *  - Auth here is a prototype shell. No credentials are transmitted or stored.
 *  - Every amount is sandbox data. No real money moves anywhere in this build.
 *  - Balances are never stored. They are derived by folding the ledger.
 */

import React, { useMemo, useReducer, useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ *
 * Design system
 * ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@110..125,700..900&family=Onest:wght@400;500;600&display=swap');

.fw, .fw *, .fw *::before, .fw *::after { box-sizing: border-box; }
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
  --ink:#191814; --ink-2:#4c483f; --ink-3:#726d61;
  --pine:#245040; --pine-bg:transparent; --pine-line:#a9bdb1;
  --amber:#7a4e10; --amber-bg:transparent; --amber-line:#cbb489;
  --slate:#2a4763; --slate-bg:transparent; --slate-line:#a6b6c6;
  --clay:#8a2e21; --clay-bg:transparent; --clay-line:#c9a49c;
  /* Display face, wordmark only. Never for interface text. */
  --display: "Archivo", "Archivo Expanded", "Helvetica Neue", "Arial Black", Helvetica, Arial, sans-serif;
  --display-wdth: 118%; --display-wght: 800;
  /* Logotype scale. Deliberately separate from the UI type scale */
  --wm-lg:72px; --wm-md:52px; --wm-sm:38px; --wm-nav:20px;
  /* Kern pair for V + e. The V's box edge is 0.097em wider than its ink at
     x-height, so this pulls the following letter into that wedge. One number. */
  --wm-kern:-0.085em;
  /* Landing only. The application keeps the smaller dashboard scale. */
  --lp-1:64px; --lp-2:40px; --lp-3:26px; --lp-lead:19px;
  --lp-gut:32px; --lp-max:1200px;
  --lp-pad-lg:104px; --lp-pad-md:72px; --lp-pad-sm:48px;
  /* Haffer (Displaay) is the intended primary. Its files are commercially
     licensed and unavailable here, so Onest is the implemented fallback, per the
     brief. Swapping Haffer in is a change to this one line. */
  --ui: "Haffer", "Onest", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
.fw .wrap { max-width:1080px; margin:0 auto; padding:0 28px; }
.fw .wrap-lp { max-width:var(--lp-max); margin:0 auto; padding:0 var(--lp-gut); }
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
.fw .wrap-n { max-width:768px; margin:0 auto; padding:0 28px; }
.fw .wrap-s { max-width:560px; margin:0 auto; padding:0 28px; }
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
.fw .hero { padding:72px 0 68px; }
.fw .herofacts { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; }
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
  .fw .grid-2, .fw .grid-4 { grid-template-columns:1fr; }
  .fw .wrap, .fw .wrap-n { padding:0 18px; }
  .fw .page { padding:20px 16px 60px; }
  .fw .topbar { padding:0 16px; }
  .fw .d2 { font-size:var(--fs-7); }
  .fw .hero { padding:44px 0 36px; }
  .fw .tbl th, .fw .tbl td { padding:10px 12px; }
  .fw .hide-s { display:none; }
  .fw .grid-4 > * { border-right:0 !important; border-bottom:1px solid var(--line-soft); }
}
@media (pointer: coarse) {
  .fw .btn { min-height:var(--tap); }
  .fw .btn-sm { min-height:var(--h-md); }
  .fw .nav button:not(.btn), .fw .frame-rail button:not(.btn), .fw .mobpanel button { min-height:var(--tap); }
  .fw .input, .fw .select { min-height:var(--tap); }
  .fw .tbl td { padding-top:14px; padding-bottom:14px; }
}
@media (max-width: 420px) {
  .fw .d2 { font-size:var(--fs-7); }
  .fw .wordmark-hero { font-size:var(--wm-sm); font-stretch:110%; }
  .fw .tagline { font-size:var(--fs-5); }
  .fw .wrap, .fw .wrap-n { padding:0 14px; }
  .fw .page { padding:16px 12px 56px; }
  .fw .tbl th, .fw .tbl td { padding:9px 10px; font-size:var(--fs-2); }
  .fw .card-b, .fw .card-h, .fw .card-f { padding-left:13px; padding-right:13px; }
  .fw .band-key { gap:0 14px; }
}
`;

/* ------------------------------------------------------------------ *
 * Money + time. All amounts are integer minor units. Never floats.
 * ------------------------------------------------------------------ */

// Never render a user-supplied string as an href without this. javascript: and data:
// URLs are the vector; anything not http(s) is dropped rather than rewritten.
function safeUrl(raw) {
  if (!raw) return null;
  const v = String(raw).trim();
  const withScheme = /^https?:\/\//i.test(v) ? v : "https://" + v;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch { return null; }
}
const cap = (v, max) => String(v ?? "").slice(0, max);
const LIMITS = { name: 80, email: 254, business: 80, url: 200, description: 400, relation: 40 };

const TERMS_VERSION = "2026-09-05";

/* A snapshot of everything the guardian was shown. If any of it changes later,
   the consent no longer covers the business it is attached to. */
const consentSnapshot = (b) => ({
  name: b.name, description: b.description, model: b.model, priceMinor: b.priceMinor,
});

const CONSENT_FIELDS = [
  ["name", "the business name"],
  ["description", "what customers are paying for"],
  ["model", "how you charge"],
  ["priceMinor", "the price"],
];

const CURRENCY = "USD";
const nf = (min, max) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, minimumFractionDigits: min, maximumFractionDigits: max });
const nf2 = nf(2, 2);
const nf0 = nf(0, 0);

function money(minor, opts = {}) {
  const { signed = false, round = false } = opts;
  const abs = Math.abs(minor) / 100;
  const s = round && Math.abs(minor) % 100 === 0 ? nf0.format(abs) : nf2.format(abs);
  if (signed) return (minor < 0 ? "−" : "+") + s;
  return (minor < 0 ? "−" : "") + s;
}
const usd = (dollars) => Math.round(dollars * 100);

const DAY = 86400000;
const dfDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dfFull = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dfTime = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fDate = (t) => dfDate.format(new Date(t));
const fFull = (t) => dfFull.format(new Date(t));
const fTime = (t) => dfTime.format(new Date(t));

function ago(t, now) {
  const d = now - t;
  if (d < 60000) return "just now";
  if (d < 3600000) return Math.floor(d / 60000) + "m ago";
  if (d < DAY) return Math.floor(d / 3600000) + "h ago";
  if (d < 7 * DAY) return Math.floor(d / DAY) + "d ago";
  return fDate(t);
}
function untilDays(t, now) {
  const d = Math.ceil((t - now) / DAY);
  if (d <= 0) return "today";
  if (d === 1) return "tomorrow";
  return "in " + d + " days";
}

let seq = 0;
const uid = (p) => `${p}_${(++seq).toString().padStart(4, "0")}${Math.random().toString(36).slice(2, 7)}`;

/* ------------------------------------------------------------------ *
 * Ledger engine
 *
 * Balances are never stored. Every figure on screen is folded from the
 * entry list at render time, which means the wallet cannot silently drift
 * away from the transactions that produced it.
 *
 *   Entry buckets:  pending → available → (reserved by payout) → paid_out
 *                   held (dispute), reversed (chargeback lost)
 * ------------------------------------------------------------------ */

const KIND = {
  CHARGE: "charge",
  REFUND: "refund",
  DISPUTE_HOLD: "dispute_hold",
  DISPUTE_RELEASE: "dispute_release",
  DISPUTE_LOSS: "dispute_loss",
  ADJUSTMENT: "adjustment",
};

const KIND_LABEL = {
  charge: "Customer payment",
  refund: "Refund",
  dispute_hold: "Disputed payment",
  dispute_release: "Dispute resolved",
  dispute_loss: "Dispute lost",
  adjustment: "Adjustment",
};

/** A charge splits into gross, processor fee and net. Net is what can ever reach a payout. */
function makeCharge({ businessId, grossMinor, feeMinor, description, customer, at, availableOn, providerRef }) {
  return {
    id: uid("txn"),
    businessId,
    kind: KIND.CHARGE,
    grossMinor,
    feeMinor,
    netMinor: grossMinor - feeMinor,
    bucket: "pending",
    status: "succeeded",
    description,
    customer,
    createdAt: at,
    availableOn,
    providerRef: providerRef || "sim_" + Math.random().toString(36).slice(2, 12),
    refundedMinor: 0,
    sandbox: true,
  };
}

function makeEntry(kind, { businessId, netMinor, description, at, parentId, bucket = "available" }) {
  return {
    id: uid("ent"),
    businessId,
    kind,
    grossMinor: netMinor,
    feeMinor: 0,
    netMinor,
    bucket,
    status: "succeeded",
    description,
    customer: null,
    createdAt: at,
    availableOn: at,
    parentId,
    providerRef: "sim_" + Math.random().toString(36).slice(2, 12),
    sandbox: true,
  };
}

/** Move settled funds out of pending. Pure: returns a new entry list. */
function settleEntries(entries, now) {
  let changed = false;
  const next = entries.map((e) => {
    if (e.bucket === "pending" && e.availableOn <= now) {
      changed = true;
      return { ...e, bucket: "available" };
    }
    return e;
  });
  return changed ? next : entries;
}

const PAYOUT_OPEN = ["awaiting_approval", "approved", "in_transit"];

/** The single source of truth for every number the founder and guardian see. */
function foldWallet(entries, payouts, businessId) {
  const es = entries.filter((e) => e.businessId === businessId);
  const ps = payouts.filter((p) => p.businessId === businessId);
  const sum = (f) => es.reduce((a, e) => a + (f(e) || 0), 0);

  const revenue = sum((e) => (e.kind === KIND.CHARGE ? e.grossMinor : 0));
  const fees = sum((e) => (e.kind === KIND.CHARGE ? e.feeMinor : 0));
  const refunds = -sum((e) => (e.kind === KIND.REFUND ? e.netMinor : 0));
  const disputeLoss = -sum((e) => (e.kind === KIND.DISPUTE_LOSS ? e.netMinor : 0));

  const settledNet = sum((e) => (e.bucket === "available" ? e.netMinor : 0));
  const pending = sum((e) => (e.bucket === "pending" ? e.netMinor : 0));
  const held = sum((e) => (e.bucket === "held" ? e.netMinor : 0));

  const reserved = ps.filter((p) => PAYOUT_OPEN.includes(p.status)).reduce((a, p) => a + p.amountMinor, 0);
  const paidOut = ps.filter((p) => p.status === "paid").reduce((a, p) => a + p.amountMinor, 0);

  const available = settledNet - reserved - paidOut;
  const netEarnings = revenue - fees - refunds - disputeLoss;

  return {
    revenue, fees, refunds, disputeLoss, pending, held, reserved, paidOut, available, netEarnings,
    // Reconciliation. If this is ever false the ledger has a bug, and we say so on screen.
    balances: netEarnings === available + pending + held + reserved + paidOut,
  };
}

/* ------------------------------------------------------------------ *
 * Payment provider abstraction
 *
 * Nothing above this layer knows which processor is connected. Adding a
 * provider means implementing this interface, not editing screens.
 * ------------------------------------------------------------------ */

const PROVIDERS = [
  {
    id: "sandbox",
    name: "Veyro Sandbox",
    blurb: "A simulated processor for testing the full flow end to end. No real money moves.",
    implemented: true,
    capabilities: {
      currency: "USD",
      feeModel: { percent: 0.029, fixedMinor: 30 },
      settlementDays: 2,
      payoutSpeed: "1–2 business days",
      minPayoutMinor: usd(10),
      refunds: true,
      disputes: true,
      requiresAdultRepresentative: true,
      requiresIdentityVerification: true,
    },
  },
  {
    id: "stripe_connect",
    name: "Stripe Connect",
    blurb: "Connected accounts with an adult representative. Adapter interface is defined; live integration is not part of this build.",
    implemented: false,
    capabilities: {
      currency: "USD",
      feeModel: { percent: 0.029, fixedMinor: 30 },
      settlementDays: 2,
      payoutSpeed: "2 business days",
      minPayoutMinor: usd(10),
      refunds: true, disputes: true,
      requiresAdultRepresentative: true, requiresIdentityVerification: true,
    },
  },
  {
    id: "adyen_platforms",
    name: "Adyen for Platforms",
    blurb: "Alternative regulated processor for the same abstraction. Adapter not implemented in this build.",
    implemented: false,
    capabilities: {
      currency: "USD",
      feeModel: { percent: 0.031, fixedMinor: 25 },
      settlementDays: 3,
      payoutSpeed: "1–3 business days",
      minPayoutMinor: usd(25),
      refunds: true, disputes: true,
      requiresAdultRepresentative: true, requiresIdentityVerification: true,
    },
  },
];

/* [name, under-18 route, fee, settlement, notes, evidence] */
const PROVIDER_COMPARISON = [
  { name: "Stripe", route: "yes",
    kind: "psp",
    detail: "Standard account from 13, with a legal guardian added as account owner before it can take charges or pay out.",
    fee: "2.9% + 30\u00A2", settle: "2 business days",
    good: "The only route we have confirmed in the provider's own documentation. Hosted onboarding collects identity directly.",
    bad: "The guardian is the account owner, so payouts land in their bank account. Standard accounts keep their own login, which Veyro cannot lock.",
    evidence: "primary" },
  { name: "PayPal", route: "no", kind: "psp",
    detail: "User Agreement: an individual must be at least 18, or the age of majority in their state, whichever is higher. No teen account and no guardian-owned selling route.",
    fee: "Varies", settle: "Varies",
    good: "Familiar to customers, which lowers checkout friction.",
    bad: "Parental consent does not override it. Accounts found to belong to a minor are closed and the balance can be held for up to 180 days.",
    evidence: "primary" },
  { name: "Shopify Payments", route: "no",
    kind: "psp",
    detail: "18+. A minor's store must be transferred wholly to the guardian, who supplies identity, bank and tax details.",
    fee: "Plan dependent", settle: "Plan dependent",
    good: "Storefront and payments in one product.",
    bad: "The guardian owns the business outright and the founder becomes staff on their own store.",
    evidence: "reported" },
  { name: "Square", route: "unknown", kind: "psp",
    detail: "Understood to require 18+. We have not read their current seller terms, so we will not state it as fact.",
    fee: "Varies", settle: "Varies",
    good: "Strong for in-person sales, which is not this audience.",
    bad: "Unverified, so we will not route anyone through it.",
    evidence: "unverified" },
  { name: "Lemon Squeezy", route: "unknown", kind: "mor",
    detail: "Merchant of record: they are the legal seller, so they carry sales tax, VAT and chargebacks. Acquired by Stripe. We found nothing permitting an under-18 seller.",
    fee: "~10%", settle: "Semi-monthly",
    good: "No tax registration anywhere. They handle refunds, chargebacks and global VAT, which is genuinely hard.",
    bad: "Roughly three times a processor's fee. On a $10 sale that is $1.00 against Stripe's $0.59. Age rules unverified.",
    evidence: "unverified" },
  { name: "Polar", route: "unknown", kind: "mor",
    detail: "Merchant of record aimed at developers. Cheapest of the three at around 8 percent.",
    fee: "~8%", settle: "Varies",
    good: "Cheapest merchant of record, modern integration, strong for developer products.",
    bad: "Still far above a processor's rate, and we have not verified whether an under-18 seller is allowed.",
    evidence: "unverified" },
  { name: "Paddle", route: "unknown", kind: "mor",
    detail: "The longest-running merchant of record. Absorbs chargeback liability on the seller's behalf.",
    fee: "~10%", settle: "Net 15",
    good: "Longest track record and takes on chargeback liability entirely.",
    bad: "Slowest payouts of the three, enterprise-shaped onboarding, age rules unverified.",
    evidence: "unverified" },
  { name: "Adyen", route: "no", kind: "psp",
    detail: "Enterprise onboarding with no self-serve signup, and an adult representative required.",
    fee: "Interchange plus", settle: "Negotiated",
    good: "Cheapest at high volume.",
    bad: "No self-serve route. Irrelevant below serious volume.",
    evidence: "reported" },
];

const EVIDENCE_LABEL = {
  primary: ["pine", "Provider's own docs"],
  reported: ["amber", "Reported, not confirmed"],
  unverified: ["clay", "Unverified"],
};

const ARRANGEMENTS = [
  ["Whose account is it",
   "The founder's, opened from age 13.",
   "The parent's. The founder has no account of their own."],
  ["What the guardian is",
   "Account owner and responsible representative on the founder's account.",
   "Sole owner of the business."],
  ["How the founder gets in",
   "Their own login.",
   "Added as staff, or using the parent's password."],
  ["What happens at 18",
   "The guardian steps off. The account, history and customers continue.",
   "A full account transfer, or starting again."],
  ["Where payouts land",
   "The guardian's bank account.",
   "The guardian's bank account."],
  ["Who offers it",
   "Stripe. We have found no other provider that does.",
   "Shopify, Square, PayPal and the merchant-of-record platforms."],
  ["The catch",
   "One provider, and two countries we have verified.",
   "It is the parent's business, and shared logins breach most providers' terms."],
];

const getProvider = (id) => PROVIDERS.find((p) => p.id === id) || PROVIDERS[0];
const feeFor = (provider, grossMinor) =>
  Math.round(grossMinor * provider.capabilities.feeModel.percent) + provider.capabilities.feeModel.fixedMinor;

/* Account states the UI must handle. Every one of these has a real screen. */
const ACCOUNT_COPY = {
  not_started: { label: "Not connected", tone: "grey", head: "No payment account yet", body: "Connect a processor to start accepting customer payments." },
  awaiting_guardian: { label: "Waiting on guardian", tone: "amber", head: "Waiting for your guardian", body: "Your guardian needs to complete the provider's identity checks and confirm they will be the responsible adult on the account." },
  pending: { label: "Verifying", tone: "amber", head: "Verification in progress", body: "The processor is reviewing the information your guardian submitted. This usually finishes within a day." },
  requirements_due: { label: "Action needed", tone: "amber", head: "The processor needs more information", body: "Payments keep working for now, but payouts are paused until this is resolved." },
  active: { label: "Active", tone: "pine", head: "Payments are live", body: "Customer payments settle to your available balance on the processor's schedule." },
  restricted: { label: "Restricted", tone: "clay", head: "Payments are paused", body: "The processor has restricted this account. New payments are declined until it is resolved." },
  disconnected: { label: "Disconnected", tone: "grey", head: "Processor disconnected", body: "Existing funds still belong to the business, but no new payments can be taken." },
};

/* ------------------------------------------------------------------ *
 * Setup journey
 *
 * Verification is not the finish line. A founder with a verified account still
 * has no checkout in their app and no proof a customer receives what they buy.
 * These seven stages carry the founder all the way to a tested purchase.
 * ------------------------------------------------------------------ */

const ACTOR = {
  founder:  { label: "You",              acts: "You act next",              waiting: "Waiting on you",           tone: "pine"  },
  guardian: { label: "Your guardian",    acts: "Your guardian acts next",   waiting: "Waiting on your guardian", tone: "amber" },
  provider: { label: "Payment provider", acts: "The provider acts next",    waiting: "Waiting on the provider",  tone: "slate" },
  veyro:    { label: "Veyro",            acts: "Veyro acts next",           waiting: "Waiting on Veyro",         tone: "grey"  },
  none:     { label: "Done",             acts: "Nothing outstanding",       waiting: "Nothing outstanding",      tone: "grey"  },
};

const CHECKOUT_KINDS = [
  ["button",   "A one-off purchase",     "A button that charges once for a thing you already deliver."],
  ["download", "A paid download",        "Customer pays, then gets a file or a licence key."],
  ["access",   "Paid access to your app","Customer pays, then their account is unlocked."],
  ["subscription", "A recurring subscription", "Charged monthly, with renewals, failures and cancellation."],
];

/* The six things a launch check must actually answer. Anything less is a
   success screen that proves nothing. */
const LAUNCH_CHECKS = [
  ["start",    "Your checkout actually opens",            "Someone can click buy and get to a payment page."],
  ["confirm",  "Your app finds out about the payment",     "Stripe messages your server directly, so you know even if the customer's browser dies."],
  ["deliver",  "The person who paid gets what they bought","Their account unlocks, or the file reaches them."],
  ["duplicate","Nobody gets unlocked or charged twice",    "Stripe sends the same message more than once on purpose. Your app has to ignore repeats."],
  ["fail",     "A declined card unlocks nothing",          "The customer is told what happened and gets no access."],
  ["refund",   "Refunding someone removes their access",   "Otherwise you give the money back and they keep the product."],
];

const CAPABILITIES = [
  ["details", "Details submitted", "Everything the provider asked for has been given"],
  ["charges", "Can accept payments", "A customer's card can be charged"],
  ["delivery", "Delivers what was bought", "A paying customer receives the product"],
  ["payouts", "Can pay out to a bank", "Settled money can reach the bank account"],
];

function capabilities(state, b) {
  if (!b) return {};
  const acct = acctForBiz(state, b.id);
  const st = acct?.status || "not_started";
  const t = b.launchTest;
  const reqs = requirements(state, b);
  const blocking = reqs.some((r) => r.due === "now" || r.due === "past");
  return {
    details: !["not_started", "awaiting_guardian", "pending"].includes(st),
    charges: st === "active",
    delivery: !!(t && t.checks.every((c) => c.ok)),
    payouts: st === "active" && !!acct?.destination?.status && !blocking,
  };
}

/* Outstanding items, each owned by exactly one party. This is the answer to
   "what is holding up my launch", which is the question the product exists for. */
function requirements(state, b) {
  if (!b) return [];
  const rel = relForBiz(state, b.id);
  const acct = acctForBiz(state, b.id);
  const st = acct?.status || "not_started";
  const out = [];
  const add = (id, label, owner, due, detail) => out.push({ id, label, owner, due, detail });

  if (rel && rel.status === "pending")
    add("invite", "Accept the invitation", "guardian", "now",
      "Sent to " + rel.guardianEmail + ", expires " + untilDays(rel.expiresAt, now(state)) + ".");
  if (rel && ["declined", "expired", "revoked", "ended"].includes(rel.status))
    add("reinvite", "Invite a responsible adult", "founder", "past",
      "The account cannot take payments without one.");
  const stale = consentStale(state, b.id);
  if (stale)
    add("reconsent", "Confirm the change to the business", "guardian", "now",
      "You changed " + stale.join(" and ") + " after they agreed.");
  if (st === "not_started")
    add("provider", "Choose a payment provider", "founder", "now", "One decision, then your guardian takes over.");
  if (st === "awaiting_guardian")
    add("identity", "Complete identity verification", "guardian", "now",
      "On the provider's own form. Veyro never sees these documents.");
  if (st === "pending")
    add("review", "Provider review", "provider", "later", "Nothing for you to do. This is waiting time.");
  if (st === "requirements_due")
    (acct.requirements || ["additional identity documents"]).forEach((r, i) =>
      add("req" + i, "Provide " + r, "guardian", "past", "Payouts are paused until this is given."));
  if (st === "restricted")
    add("restricted", "Resolve the account restriction", "guardian", "past", "New payments are declined meanwhile.");
  if (st === "active" && !b.checkoutKind)
    add("kind", "Choose what kind of purchase you need", "founder", "now", "One supported path per type.");
  if (st === "active" && b.checkoutKind && b.integration !== "installed")
    add("install", "Install the checkout in your app", "founder", "now", "Then mark it installed here.");
  if (b.integration === "installed" && !b.launchTest)
    add("test", "Run the launch check", "founder", "now", "Six checks on payment and delivery.");
  if (b.launchTest && !b.launchTest.checks.every((c) => c.ok))
    b.launchTest.checks.filter((c) => !c.ok).forEach((c) =>
      add("fix" + c.id, "Fix: " + c.label.toLowerCase(), "founder", "past", c.why || c.detail));
  return out;
}

function journey(state, b) {
  if (!b) return [];
  const rel = relForBiz(state, b.id);
  const acct = acctForBiz(state, b.id);
  const w = foldWallet(state.entries, state.payouts, b.id);
  const S = (id, title, status, actor, next, detail) => ({ id, title, status, actor, next, detail });

  const out = [];
  out.push(S("eligibility", "Check eligibility", "done", "none", null,
    "You confirmed the route that applies where you live."));
  out.push(S("project", "Add the project", "done", "none", null,
    b.name + " ,  " + (b.description || "no description yet")));

  if (!rel) {
    out.push(S("guardian", "Invite a guardian", "skipped", "none", null,
      "Not required. You can hold the payment account yourself."));
  } else if (rel.status === "pending") {
    out.push(S("guardian", "Invite the guardian", "waiting", "guardian", { label: "See invitation status", route: "guardian" },
      "Sent to " + rel.guardianEmail + ". It expires " + untilDays(rel.expiresAt, now(state)) + ". Nothing happens to any account until they accept."));
  } else if (rel.status === "accepted") {
    out.push(S("guardian", "Invite the guardian", "done", "none", null,
      rel.guardianName + " accepted and is the responsible adult on the account."));
  } else {
    out.push(S("guardian", "Invite the guardian", "blocked", "founder", { label: "Invite someone else", route: "guardian" },
      rel.status === "declined" ? rel.guardianName + " declined. You can invite a different adult."
        : "The invitation " + rel.status + ". Send a new one and your project keeps its progress."));
  }

  const st = acct?.status || "not_started";
  if (st === "active") {
    out.push(S("verification", "Complete the required steps", "done", "none", null,
      getProvider(acct.providerId).name + " verified " + (userById(state, acct.representativeUserId)?.name || "the representative") + "."));
  } else if (st === "awaiting_guardian") {
    out.push(S("verification", "Complete the required steps", "waiting", "guardian", { label: "See what they need to do", route: "payments" },
      "Your guardian needs to complete the provider's identity check on their own device. We have saved your progress."));
  } else if (st === "requirements_due") {
    out.push(S("verification", "Complete the required steps", "blocked", "guardian", { label: "See what is missing", route: "payments" },
      "The provider asked for more information before payouts can run. Payments still work."));
  } else if (st === "pending") {
    out.push(S("verification", "Complete the required steps", "waiting", "provider", { label: "Check status", route: "payments" },
      "The provider is reviewing. This is waiting time, not work you need to do."));
  } else if (rel && rel.status !== "accepted") {
    out.push(S("verification", "Complete the required steps", "locked", "guardian", null,
      "Opens once your guardian accepts."));
  } else {
    out.push(S("verification", "Complete the required steps", "todo", "founder", { label: "Choose a provider", route: "payments" },
      "Pick the payment provider and send the request."));
  }

  const kind = b.checkoutKind;
  const inst = b.integration || "not_started";
  if (st !== "active") {
    out.push(S("checkout", "Connect payments to your app", "locked", "founder", null,
      "Opens once the payment account is live."));
  } else if (!kind) {
    out.push(S("checkout", "Connect payments to your app", "todo", "founder", { label: "Choose what you built", route: "checkout" },
      "Tell us what kind of purchase you need and we will give you one supported way to install it."));
  } else if (inst !== "installed") {
    out.push(S("checkout", "Connect payments to your app", "todo", "founder", { label: "Finish the integration", route: "checkout" },
      "You chose " + (CHECKOUT_KINDS.find((k) => k[0] === kind) || [,"an integration"])[1].toLowerCase() + ". Follow the steps and mark it installed."));
  } else {
    out.push(S("checkout", "Connect payments to your app", "done", "none", null, "Integration installed."));
  }

  const t = b.launchTest;
  const passed = t && t.checks.every((c) => c.ok);
  if (inst !== "installed") {
    out.push(S("test", "Test the purchase", "locked", "founder", null, "Opens once the integration is installed."));
  } else if (!t) {
    out.push(S("test", "Test the purchase", "todo", "founder", { label: "Run the launch check", route: "checkout" },
      "Six checks, including whether the customer actually receives what they bought."));
  } else if (!passed) {
    out.push(S("test", "Test the purchase", "blocked", "founder", { label: "See what failed", route: "checkout" },
      t.checks.filter((c) => !c.ok).length + " of 6 checks failed. A payment that succeeds without delivery is worse than one that fails."));
  } else {
    out.push(S("test", "Test the purchase", "done", "none", null, "All six checks passed on " + fFull(t.at) + "."));
  }

  if (!passed) {
    out.push(S("launch", "Launch", "locked", "founder", null, "Opens once the purchase test passes."));
  } else if (w.revenue === 0) {
    out.push(S("launch", "Launch", "todo", "founder", { label: "Open your wallet", route: "wallet" },
      "You are ready to sell. Your first real payment will appear in the wallet."));
  } else {
    out.push(S("launch", "Launch", "done", "none", null, money(w.revenue) + " in sales so far."));
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const NOW0 = Date.now();

function seedState() {
  const provider = getProvider("sandbox");
  const founder = { id: uid("usr"), role: "founder", name: "Noor Haddad", email: "noor@slatenotes.app", dobYear: NOW0 - 16.4 * 365 * DAY, createdAt: NOW0 - 41 * DAY };
  const guardian = { id: uid("usr"), role: "guardian", name: "Rania Haddad", email: "rania.haddad@gmail.com", createdAt: NOW0 - 39 * DAY };
  const biz = {
    id: uid("biz"), founderId: founder.id, name: "Slate Notes",
    type: "saas", url: "slatenotes.app",
    description: "A note-taking app for students that turns class notes into practice questions.",
    model: "subscription", priceMinor: usd(9), country: "US", createdAt: NOW0 - 40 * DAY,
  };
  const rel = {
    id: uid("rel"), businessId: biz.id, founderId: founder.id, guardianId: guardian.id,
    guardianName: "Rania Haddad", guardianEmail: "rania.haddad@gmail.com", relation: "Parent",
    status: "accepted", token: uid("inv"), sentAt: NOW0 - 40 * DAY, expiresAt: NOW0 + 60 * DAY,
    respondedAt: NOW0 - 39 * DAY,
    consent: { acceptedAt: NOW0 - 39 * DAY, termsVersion: TERMS_VERSION, guardianId: null,
      snapshot: { name: "Slate Notes", model: "subscription", priceMinor: usd(9),
        description: "A note-taking app for students that turns class notes into practice questions." } },
    policy: { approvePayouts: true, thresholdMinor: 0, approveProviderChanges: true },
  };
  const acct = {
    id: uid("acc"), businessId: biz.id, providerId: "sandbox", status: "active",
    representativeUserId: guardian.id, requirements: [],
    destination: { bankName: "First Community Bank", last4: "4417", holder: "Rania Haddad", status: "verified" },
    connectedAt: NOW0 - 38 * DAY,
  };

  // Deterministic-ish seeded revenue: a subscription business finding its footing.
  const entries = [];
  const NAMES = ["m.okafor", "j.tran", "s.patel", "d.rivera", "k.mensah", "a.dubois", "l.chen", "r.novak",
    "p.silva", "e.karlsen", "y.abbas", "t.moreau", "h.nakamura", "c.bianchi", "f.adeyemi", "i.kowalski"];
  for (let d = 38; d >= 0; d--) {
    const perDay = d % 3 === 0 ? 2 : 1;
    for (let k = 0; k < perDay; k++) {
      const amount = (d + k) % 13 === 0 ? 99 : (d + k) % 5 === 0 ? 29 : 9;
      const at = NOW0 - d * DAY + (k * 7 + (d % 9)) * 3600000;
      const gross = usd(amount);
      entries.push(makeCharge({
        businessId: biz.id, grossMinor: gross, feeMinor: feeFor(provider, gross),
        description: amount === 9 ? "Subscription payment" : amount === 29 ? "Annual plan" : "Team plan",
        customer: NAMES[(d + k) % NAMES.length] + "@\u2026", at,
        availableOn: at + provider.capabilities.settlementDays * DAY,
      }));
    }
  }
  const refunded = entries.find((e) => e.grossMinor === usd(29) && e.createdAt < NOW0 - 20 * DAY);
  if (refunded) {
    refunded.refundedMinor = refunded.grossMinor;
    refunded.status = "refunded";
    entries.push(makeEntry(KIND.REFUND, {
      businessId: biz.id, netMinor: -refunded.grossMinor, description: "Refund · " + refunded.customer,
      at: NOW0 - 19 * DAY, parentId: refunded.id,
    }));
  }

  const payouts = [
    { id: uid("po"), businessId: biz.id, amountMinor: usd(180), status: "paid", requestedAt: NOW0 - 17 * DAY,
      approvedAt: NOW0 - 17 * DAY + 4 * 3600000, sentAt: NOW0 - 16 * DAY, completedAt: NOW0 - 15 * DAY,
      destination: "First Community Bank ••4417", approvedBy: guardian.id, sandbox: true, events: [] },
    { id: uid("po"), businessId: biz.id, amountMinor: usd(60), status: "in_transit", requestedAt: NOW0 - 2 * DAY,
      approvedAt: NOW0 - 2 * DAY + 5 * 3600000, sentAt: NOW0 - 1 * DAY, completedAt: null,
      destination: "First Community Bank ••4417", approvedBy: guardian.id, sandbox: true, events: [] },
  ];

  const audit = [
    { id: uid("log"), at: NOW0 - 40 * DAY, actorId: founder.id, action: "business.created", target: biz.name, meta: "" },
    { id: uid("log"), at: NOW0 - 40 * DAY, actorId: founder.id, action: "guardian.invited", target: guardian.email, meta: "" },
    { id: uid("log"), at: NOW0 - 39 * DAY, actorId: guardian.id, action: "guardian.accepted", target: biz.name, meta: "" },
    { id: uid("log"), at: NOW0 - 38 * DAY, actorId: guardian.id, action: "payments.connected", target: "Veyro Sandbox", meta: "Representative: Rania Haddad" },
    { id: uid("log"), at: NOW0 - 17 * DAY, actorId: founder.id, action: "payout.requested", target: money(usd(180)), meta: "" },
    { id: uid("log"), at: NOW0 - 17 * DAY, actorId: guardian.id, action: "payout.approved", target: money(usd(180)), meta: "" },
    { id: uid("log"), at: NOW0 - 15 * DAY, actorId: null, action: "payout.paid", target: money(usd(180)), meta: "Processor confirmation" },
  ];

  const notes = [
    { id: uid("nt"), userId: founder.id, at: NOW0 - 1 * DAY, title: "Payout on the way", body: money(usd(60)) + " is in transit to First Community Bank ••4417.", read: false, route: { name: "payouts" } },
    { id: uid("nt"), userId: founder.id, at: NOW0 - 1 * DAY + 3600000, title: "You received " + money(usd(9)), body: "Subscription payment from t.moreau@…", read: false, route: { name: "wallet" } },
    { id: uid("nt"), userId: guardian.id, at: NOW0 - 2 * DAY, title: "Payout approved", body: "You approved a " + money(usd(60)) + " payout for Slate Notes.", read: true, route: { name: "g_overview" } },
  ];

  return {
    clockOffset: 0,
    session: null,
    route: { name: "landing" },
    users: [founder, guardian],
    businesses: [biz],
    relationships: [rel],
    accounts: [acct],
    entries: settleEntries(entries, NOW0),
    payouts,
    notifications: notes,
    audit,
    toasts: [],
    draft: null,
    seeded: true,
  };
}

function emptyState() {
  const s = seedState();
  return { ...s, session: null, route: { name: "landing" } };
}

/* ---- selectors ---- */
const now = (s) => Date.now() + s.clockOffset;
const userById = (s, id) => s.users.find((u) => u.id === id) || null;
const me = (s) => (s.session ? userById(s, s.session.userId) : null);
const bizById = (s, id) => s.businesses.find((b) => b.id === id) || null;
const relForBiz = (s, id) => s.relationships.find((r) => r.businessId === id) || null;
const acctForBiz = (s, id) => s.accounts.find((a) => a.businessId === id) || null;
const myBusiness = (s) => (s.session ? s.businesses.find((b) => b.founderId === s.session.userId) || null : null);
const guardedBusinesses = (s) =>
  s.relationships.filter((r) => r.guardianId === s.session?.userId && r.status === "accepted").map((r) => bizById(s, r.businessId)).filter(Boolean);
/* Returns the list of things that changed since the guardian agreed, or null. */
function consentStale(s, businessId) {
  const rel = s.relationships.find((r) => r.businessId === businessId);
  const b = s.businesses.find((x) => x.id === businessId);
  if (!rel || rel.status !== "accepted" || !rel.consent || !b) return null;
  const changed = CONSENT_FIELDS
    .filter(([k]) => rel.consent.snapshot[k] !== b[k])
    .map(([, label]) => label);
  return changed.length ? changed : null;
}

const myNotes = (s) => s.notifications.filter((n) => n.userId === s.session?.userId).sort((a, b) => b.at - a.at);

function pendingApprovals(s) {
  const out = [];
  guardedBusinesses(s).forEach((b) => {
    s.payouts.filter((p) => p.businessId === b.id && p.status === "awaiting_approval")
      .forEach((p) => out.push({ type: "payout", business: b, payout: p, id: p.id }));
    const a = acctForBiz(s, b.id);
    if (a && a.status === "awaiting_guardian") out.push({ type: "account", business: b, account: a, id: a.id });
  });
  s.relationships.filter((r) => r.status === "pending" && r.guardianEmail === me(s)?.email)
    .forEach((r) => out.push({ type: "invitation", business: bizById(s, r.businessId), rel: r, id: r.id }));
  return out;
}

/* ------------------------------------------------------------------ *
 * Reducer. Every state change that matters writes an audit record.
 * ------------------------------------------------------------------ */

function log(s, action, target, meta = "", actorId = s.session?.userId ?? null) {
  return [{ id: uid("log"), at: now(s), actorId, action, target, meta }, ...s.audit];
}
function notify(s, userId, title, body, route) {
  return [{ id: uid("nt"), userId, at: now(s), title, body, read: false, route }, ...s.notifications];
}
const toast = (s, text) => [...s.toasts, { id: uid("t"), text }];

function reducer(state, a) {
  const s = state;
  switch (a.type) {
    case "go":
      return { ...s, route: a.route };

    case "toast":
      return { ...s, toasts: toast(s, a.text) };
    case "toast/dismiss":
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };

    case "auth/signin": {
      const u = s.users.find((x) => x.email.toLowerCase() === a.email.toLowerCase());
      if (!u) return { ...s, toasts: toast(s, "No account found for that email address.") };
      return { ...s, session: { userId: u.id, role: u.role }, route: { name: u.role === "guardian" ? "g_overview" : "dashboard" } };
    }
    case "auth/signout":
      return { ...s, session: null, route: { name: "landing" } };
    case "auth/switch": {
      const u = userById(s, a.userId);
      return { ...s, session: { userId: u.id, role: u.role }, route: { name: u.role === "guardian" ? "g_overview" : "dashboard" } };
    }

    /* ---- onboarding ---- */
    case "draft/start":
      return { ...s, draft: { step: 0, name: "", email: "", birthYear: "", bizName: "", bizType: "saas", url: "", description: "", model: "subscription", price: "", country: "", region: "", guardianName: "", guardianEmail: "", relation: "Parent" } };
    case "draft/set":
      return { ...s, draft: { ...s.draft, ...a.patch } };
    case "draft/cancel":
      return { ...s, draft: null, route: { name: "landing" } };

    case "onboard/complete": {
      const d = s.draft;
      const founder = { id: uid("usr"), role: "founder", name: d.name, email: d.email, dobYear: d.birthYear, createdAt: now(s) };
      const biz = {
        id: uid("biz"), founderId: founder.id, name: d.bizName, type: d.bizType, url: d.url,
        description: d.description, model: d.model, priceMinor: d.price ? usd(parseFloat(d.price) || 0) : 0,
        country: d.country, createdAt: now(s),
      };
      const needsGuardian = a.needsGuardian;
      const rel = needsGuardian
        ? { id: uid("rel"), businessId: biz.id, founderId: founder.id, guardianId: null,
            guardianName: d.guardianName, guardianEmail: d.guardianEmail, relation: d.relation,
            status: "pending", token: uid("inv"), sentAt: now(s), expiresAt: now(s) + 14 * DAY, respondedAt: null,
            policy: { approvePayouts: true, thresholdMinor: 0, approveProviderChanges: true } }
        : null;
      const acct = { id: uid("acc"), businessId: biz.id, providerId: null, status: "not_started",
        representativeUserId: null, requirements: [], destination: null, connectedAt: null };
      const st = {
        ...s,
        users: [...s.users, founder],
        businesses: [...s.businesses, biz],
        relationships: rel ? [...s.relationships, rel] : s.relationships,
        accounts: [...s.accounts, acct],
        session: { userId: founder.id, role: "founder" },
        draft: null,
        route: { name: rel ? "thanks" : "dashboard" },
      };
      st.audit = log(st, "business.created", biz.name, "", founder.id);
      if (rel) st.audit = [{ id: uid("log"), at: now(s), actorId: founder.id, action: "guardian.invited", target: rel.guardianEmail, meta: "" }, ...st.audit];
      st.toasts = toast(st, rel ? "Business created and invitation sent." : "Business created.");
      return st;
    }

    /* ---- guardian relationship ---- */
    case "guardian/invite": {
      const b = bizById(s, a.businessId);
      const existing = relForBiz(s, a.businessId);
      const rel = {
        id: existing?.id || uid("rel"), businessId: a.businessId, founderId: b.founderId, guardianId: null,
        guardianName: a.name, guardianEmail: a.email, relation: a.relation, status: "pending",
        token: uid("inv"), sentAt: now(s), expiresAt: now(s) + 14 * DAY, respondedAt: null,
        policy: existing?.policy || { approvePayouts: true, thresholdMinor: 0, approveProviderChanges: true },
      };
      const st = { ...s, relationships: existing ? s.relationships.map((r) => (r.id === existing.id ? rel : r)) : [...s.relationships, rel] };
      st.audit = log(st, "guardian.invited", a.email);
      st.toasts = toast(st, "Invitation sent to " + a.email + ".");
      return st;
    }
    case "guardian/expire": {
      const st = { ...s, relationships: s.relationships.map((r) => (r.id === a.relId ? { ...r, status: "expired" } : r)) };
      st.audit = log(st, "invitation.expired", "", "", null);
      return st;
    }
    case "guardian/respond": {
      const rel = s.relationships.find((r) => r.id === a.relId);
      const b = bizById(s, rel.businessId);
      // The founder answering their own invitation would make the consent record
      // meaningless, which is the one thing this product sells.
      if (s.session && s.session.userId === rel.founderId) {
        return { ...s, toasts: toast(s, "You can't answer your own invitation. Your guardian opens it themselves.") };
      }
      let guardian = s.users.find((u) => u.email.toLowerCase() === rel.guardianEmail.toLowerCase() && u.role === "guardian");
      let users = s.users;
      if (a.accept && !guardian) {
        guardian = { id: uid("usr"), role: "guardian", name: rel.guardianName || "Guardian", email: rel.guardianEmail, createdAt: now(s) };
        users = [...s.users, guardian];
      }
      const next = {
        ...rel,
        status: a.accept ? "accepted" : "declined",
        respondedAt: now(s),
        guardianId: a.accept ? guardian.id : null,
        consent: a.accept
          ? { acceptedAt: now(s), termsVersion: TERMS_VERSION, snapshot: consentSnapshot(b), by: guardian.id }
          : null,
      };
      const st = {
        ...s, users,
        relationships: s.relationships.map((r) => (r.id === rel.id ? next : r)),
        session: a.accept ? { userId: guardian.id, role: "guardian" } : s.session,
        route: a.accept ? { name: "g_overview" } : { name: "landing" },
      };
      st.audit = log(st, a.accept ? "guardian.accepted" : "guardian.declined", b.name, "", a.accept ? guardian.id : null);
      st.notifications = notify(st, b.founderId,
        a.accept ? "Your guardian accepted" : "Your guardian declined",
        a.accept ? (next.guardianName || "Your guardian") + " is now supervising " + b.name + ". You can connect payments."
                 : (next.guardianName || "Your guardian") + " declined the invitation for " + b.name + ".",
        { name: a.accept ? "payments" : "guardian" });
      st.toasts = toast(st, a.accept ? "Supervision accepted." : "Invitation declined.");
      return st;
    }
    case "guardian/revoke": {
      const rel = s.relationships.find((r) => r.id === a.relId);
      const st = { ...s, relationships: s.relationships.map((r) => (r.id === a.relId
        ? { ...r, status: "revoked", respondedAt: now(s), tokenHash: null } : r)) };
      st.audit = log(st, "invitation.revoked", rel.guardianEmail);
      st.toasts = toast(st, "Invitation revoked. That link no longer works.");
      return st;
    }
    case "guardian/reconfirm": {
      const rel = s.relationships.find((r) => r.id === a.relId);
      const b = bizById(s, rel.businessId);
      const st = { ...s, relationships: s.relationships.map((r) => (r.id === a.relId ? {
        ...r, consent: { acceptedAt: now(s), termsVersion: TERMS_VERSION, snapshot: consentSnapshot(b), by: s.session.userId },
      } : r)) };
      st.audit = log(st, "consent.reconfirmed", b.name, "Re-reviewed after a change");
      st.notifications = notify(st, b.founderId, "Your guardian re-confirmed",
        rel.guardianName + " has reviewed the changes to " + b.name + " and agreed to continue.", { name: "guardian" });
      st.toasts = toast(st, "Thank you. The record is up to date.");
      return st;
    }
    case "guardian/policy": {
      const st = { ...s, relationships: s.relationships.map((r) => (r.id === a.relId ? { ...r, policy: { ...r.policy, ...a.patch } } : r)) };
      st.audit = log(st, "guardian.policy_updated", "", JSON.stringify(a.patch));
      st.toasts = toast(st, "Approval settings saved.");
      return st;
    }
    case "guardian/end": {
      const rel = s.relationships.find((r) => r.id === a.relId);
      const b = bizById(s, rel.businessId);
      const st = {
        ...s,
        relationships: s.relationships.map((r) => (r.id === a.relId ? { ...r, status: "ended", respondedAt: now(s) } : r)),
        accounts: s.accounts.map((x) => (x.businessId === rel.businessId ? { ...x, status: "restricted" } : x)),
      };
      st.audit = log(st, "guardian.ended", b.name);
      st.notifications = notify(st, b.founderId, "Supervision ended",
        (rel.guardianName || "Your guardian") + " has stopped supervising " + b.name + ". New payments are paused until another guardian accepts.",
        { name: "guardian" });
      st.toasts = toast(st, "Supervision ended.");
      return st;
    }

    /* ---- payment account ---- */
    case "account/request": {
      const st = {
        ...s,
        accounts: s.accounts.map((x) => (x.businessId === a.businessId
          ? { ...x, providerId: a.providerId, status: relForBiz(s, a.businessId) ? "awaiting_guardian" : "pending", requestedAt: now(s) } : x)),
      };
      const rel = relForBiz(s, a.businessId);
      const b = bizById(s, a.businessId);
      st.audit = log(st, "payments.requested", getProvider(a.providerId).name);
      if (rel?.guardianId) {
        st.notifications = notify(st, rel.guardianId, "Approval needed",
          (userById(s, b.founderId)?.name || "Your founder") + " wants to connect a payment account for " + b.name + ".",
          { name: "g_approvals" });
      }
      st.toasts = toast(st, rel ? "Sent to your guardian for approval." : "Verification started.");
      return st;
    }
    case "account/approve": {
      const acct = s.accounts.find((x) => x.id === a.accountId);
      const b = bizById(s, acct.businessId);
      const g = me(s);
      const st = {
        ...s,
        accounts: s.accounts.map((x) => (x.id === a.accountId ? {
          ...x, status: "active", representativeUserId: g.id, connectedAt: now(s), requirements: [],
          destination: { bankName: a.bankName || "Community Savings Bank", last4: a.last4 || "8290", holder: g.name, status: "verified" },
        } : x)),
      };
      st.audit = log(st, "payments.connected", getProvider(acct.providerId).name, "Representative: " + g.name);
      st.notifications = notify(st, b.founderId, "Payments are live",
        "Your payment account is connected. You can start selling.", { name: "payments" });
      st.toasts = toast(st, "Payment account connected.");
      return st;
    }
    case "account/decline": {
      const acct = s.accounts.find((x) => x.id === a.accountId);
      const b = bizById(s, acct.businessId);
      const st = { ...s, accounts: s.accounts.map((x) => (x.id === a.accountId ? { ...x, status: "not_started", providerId: null } : x)) };
      st.audit = log(st, "payments.declined", b.name);
      st.notifications = notify(st, b.founderId, "Payment account not approved",
        "Your guardian did not approve the payment account. Talk to them, then send the request again.", { name: "payments" });
      return st;
    }
    case "account/set": {
      const acct = s.accounts.find((x) => x.businessId === a.businessId);
      const b = bizById(s, a.businessId);
      const st = { ...s, accounts: s.accounts.map((x) => (x.id === acct.id ? { ...x, ...a.patch } : x)) };
      st.audit = log(st, "payments.status_changed", a.patch.status || "", "", null);
      if (a.notifyFounder) st.notifications = notify(st, b.founderId, a.notifyFounder.title, a.notifyFounder.body, { name: "payments" });
      return st;
    }

    /* ---- payouts ---- */
    case "payout/request": {
      const rel = relForBiz(s, a.businessId);
      const b = bizById(s, a.businessId);
      const needs = rel && rel.status === "accepted" && rel.policy.approvePayouts && a.amountMinor > rel.policy.thresholdMinor;
      const p = {
        id: uid("po"), businessId: a.businessId, amountMinor: a.amountMinor,
        status: needs ? "awaiting_approval" : "in_transit",
        requestedAt: now(s), approvedAt: needs ? null : now(s), sentAt: needs ? null : now(s),
        completedAt: null, failure: null, destination: a.destination, approvedBy: null, sandbox: true, events: [],
      };
      const st = { ...s, payouts: [p, ...s.payouts] };
      st.audit = log(st, "payout.requested", money(a.amountMinor));
      if (needs && rel.guardianId) {
        st.notifications = notify(st, rel.guardianId, "Payout needs your approval",
          (userById(s, b.founderId)?.name || "Your founder") + " requested " + money(a.amountMinor) + " from " + b.name + ".",
          { name: "g_approvals" });
      }
      st.toasts = toast(st, needs ? "Payout sent to your guardian for approval." : "Payout requested.");
      return st;
    }
    case "payout/approve": {
      const p = s.payouts.find((x) => x.id === a.payoutId);
      const b = bizById(s, p.businessId);
      const st = { ...s, payouts: s.payouts.map((x) => (x.id === p.id ? { ...x, status: "in_transit", approvedAt: now(s), sentAt: now(s), approvedBy: s.session.userId } : x)) };
      st.audit = log(st, "payout.approved", money(p.amountMinor));
      st.notifications = notify(st, b.founderId, "Payout approved", money(p.amountMinor) + " is on its way to " + p.destination + ".", { name: "payouts" });
      st.toasts = toast(st, "Payout approved.");
      return st;
    }
    case "payout/decline": {
      const p = s.payouts.find((x) => x.id === a.payoutId);
      const b = bizById(s, p.businessId);
      const st = { ...s, payouts: s.payouts.map((x) => (x.id === p.id ? { ...x, status: "declined", completedAt: now(s), failure: a.reason || "Your guardian declined this payout." } : x)) };
      st.audit = log(st, "payout.declined", money(p.amountMinor), a.reason || "");
      st.notifications = notify(st, b.founderId, "Payout declined",
        (a.reason || "Your guardian declined this payout.") + " The money stays in your available balance.", { name: "payouts" });
      return st;
    }
    case "payout/settle": {
      const p = s.payouts.find((x) => x.id === a.payoutId);
      const b = bizById(s, p.businessId);
      const st = {
        ...s,
        payouts: s.payouts.map((x) => (x.id === p.id
          ? a.fail
            ? { ...x, status: "failed", completedAt: now(s), failure: a.reason || "The bank rejected the transfer." }
            : { ...x, status: "paid", completedAt: now(s) }
          : x)),
      };
      st.audit = log(st, a.fail ? "payout.failed" : "payout.paid", money(p.amountMinor), a.reason || "", null);
      st.notifications = notify(st, b.founderId,
        a.fail ? "Payout failed" : "Payout completed",
        a.fail ? (a.reason || "The bank rejected the transfer.") + " The money is back in your available balance."
               : money(p.amountMinor) + " arrived at " + p.destination + ".",
        { name: "payouts" });
      return st;
    }
    case "payout/cancel":
      return { ...s, payouts: s.payouts.map((x) => (x.id === a.payoutId ? { ...x, status: "canceled", completedAt: now(s) } : x)), audit: log(s, "payout.canceled", "") };

    /* ---- sandbox simulation ---- */
    case "sim/charge": {
      const acct = acctForBiz(s, a.businessId);
      const provider = getProvider(acct?.providerId || "sandbox");
      const t = now(s);
      const e = makeCharge({
        businessId: a.businessId, grossMinor: a.amountMinor, feeMinor: feeFor(provider, a.amountMinor),
        description: a.description || "Customer payment", customer: a.customer || "customer@example.com",
        at: t, availableOn: t + provider.capabilities.settlementDays * DAY,
      });
      const b = bizById(s, a.businessId);
      const st = { ...s, entries: [...s.entries, e] };
      st.notifications = notify(st, b.founderId, "You received " + money(a.amountMinor),
        (a.description || "Customer payment") + ". Available " + untilDays(e.availableOn, t) + ".", { name: "transaction", id: e.id });
      st.toasts = toast(st, "Simulated payment of " + money(a.amountMinor) + ".");
      return st;
    }
    case "sim/refund": {
      const src = s.entries.find((e) => e.id === a.entryId);
      const amt = a.amountMinor || src.grossMinor - src.refundedMinor;
      const b = bizById(s, src.businessId);
      const st = {
        ...s,
        entries: [
          ...s.entries.map((e) => (e.id === src.id
            ? { ...e, refundedMinor: e.refundedMinor + amt, status: e.refundedMinor + amt >= e.grossMinor ? "refunded" : "partially_refunded" } : e)),
          makeEntry(KIND.REFUND, { businessId: src.businessId, netMinor: -amt, description: "Refund · " + (src.customer || ""), at: now(s), parentId: src.id }),
        ],
      };
      st.audit = log(st, "refund.created", money(amt), src.id);
      st.notifications = notify(st, b.founderId, "Refund issued",
        money(amt) + " was returned to " + (src.customer || "the customer") + ". The processor fee is not returned.", { name: "transaction", id: src.id });
      st.toasts = toast(st, "Refund issued.");
      return st;
    }
    case "sim/dispute": {
      const src = s.entries.find((e) => e.id === a.entryId);
      const b = bizById(s, src.businessId);
      const st = { ...s, entries: s.entries.map((e) => (e.id === src.id ? { ...e, status: "disputed", bucket: "held" } : e)) };
      st.audit = log(st, "dispute.opened", money(src.grossMinor), src.id, null);
      st.notifications = notify(st, b.founderId, "A payment was disputed",
        (src.customer || "A customer") + " disputed " + money(src.grossMinor) + ". The amount is on hold while the processor reviews it.", { name: "transaction", id: src.id });
      return st;
    }
    case "sim/settle":
      return { ...s, clockOffset: s.clockOffset + a.ms, entries: settleEntries(s.entries, now(s) + a.ms), toasts: toast(s, "Sandbox clock advanced.") };
    case "sim/reset": {
      const fresh = seedState();
      const role = s.session?.role;
      const u = role ? fresh.users.find((x) => x.role === role) : null;
      return {
        ...fresh,
        session: u ? { userId: u.id, role: u.role } : null,
        route: u ? { name: role === "guardian" ? "g_overview" : "dashboard" } : { name: "landing" },
      };
    }

    /* ---- notifications ---- */
    case "note/read":
      return { ...s, notifications: s.notifications.map((n) => (n.id === a.id ? { ...n, read: true } : n)) };
    case "note/readall":
      return { ...s, notifications: s.notifications.map((n) => (n.userId === s.session?.userId ? { ...n, read: true } : n)) };

    /* ---- checkout integration and launch check ---- */
    case "checkout/kind": {
      const st = { ...s, businesses: s.businesses.map((b) => (b.id === a.businessId
        ? { ...b, checkoutKind: a.kind, integration: "selected", launchTest: null } : b)) };
      st.audit = log(st, "checkout.kind_selected", a.kind);
      return st;
    }
    case "checkout/installed": {
      const st = { ...s, businesses: s.businesses.map((b) => (b.id === a.businessId
        ? { ...b, integration: "installed" } : b)) };
      st.audit = log(st, "checkout.installed", bizById(s, a.businessId)?.name || "");
      st.toasts = toast(st, "Integration marked installed. Run the launch check next.");
      return st;
    }
    case "checkout/test": {
      const b = bizById(s, a.businessId);
      // The delivery and duplicate checks fail unless fulfilment is wired server-side.
      // A browser landing on a success page proves the browser landed, nothing more.
      const server = !!a.serverFulfilment;
      const checks = LAUNCH_CHECKS.map(([id, label, detail]) => ({
        id, label, detail,
        ok: (id === "deliver" || id === "duplicate" || id === "refund") ? server : true,
        why: (id === "deliver" && !server) ? "Payment succeeded but nothing was delivered. Your app confirms on the browser redirect, which does not fire if the customer closes the tab."
           : (id === "duplicate" && !server) ? "The same event twice would grant access twice. Store the event id and ignore repeats."
           : (id === "refund" && !server) ? "No path to remove access after a refund."
           : null,
      }));
      const st = { ...s, businesses: s.businesses.map((x) => (x.id === a.businessId
        ? { ...x, launchTest: { at: now(s), checks } } : x)) };
      st.audit = log(st, "checkout.launch_check", checks.filter((c) => c.ok).length + "/6 passed");
      st.notifications = notify(st, b.founderId,
        checks.every((c) => c.ok) ? "Launch check passed" : "Launch check found problems",
        checks.every((c) => c.ok) ? "All six checks passed. You are ready to sell."
          : checks.filter((c) => !c.ok).length + " checks failed, including delivery. Fix these before selling.",
        { name: "checkout" });
      return st;
    }

    /* ---- business ---- */
    case "biz/update": {
      const st = { ...s, businesses: s.businesses.map((b) => (b.id === a.businessId ? { ...b, ...a.patch } : b)) };
      st.audit = log(st, "business.updated", Object.keys(a.patch).join(", "));
      const stale = consentStale(st, a.businessId);
      const rel = relForBiz(st, a.businessId);
      if (stale && rel?.guardianId) {
        st.notifications = notify(st, rel.guardianId, "Something changed, please take a look",
          bizById(st, a.businessId).name + " changed " + stale.join(" and ") + ". Have a look and confirm you are still happy.",
          { name: "g_overview" });
        st.toasts = toast(st, "Saved. Your guardian has been asked to review the change.");
      } else {
        st.toasts = toast(st, "Changes saved.");
      }
      return st;
    }
    case "tick": {
      const next = settleEntries(s.entries, now(s));
      return next === s.entries ? s : { ...s, entries: next };
    }
    default:
      return s;
  }
}

/* ------------------------------------------------------------------ *
 * SEO
 *
 * A client-rendered prototype can only do so much: this sets the title,
 * description, canonical, social cards and JSON-LD per route so the
 * marketing surface is correct today, and so the eventual static build
 * has the exact metadata contract to render server-side.
 * ------------------------------------------------------------------ */

const SITE = "https://veyro.com";

// The mark, as a data URI. Shipping a real icon rather than leaving a framework default.
const FAVICON = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<rect width="100" height="100" fill="#1e4636"/>' +
  '<path d="M18 26 L32 26 L48 60 L64 26 L86 26 L59 80 L46 80 Z" fill="#f4f2ec"/></svg>');

/* Analytics. Two rules, both enforced here rather than promised in the privacy policy.
   1. Nothing is sent before consent is granted.
   2. Only allowlisted properties are ever attached. Identity, money and business
      details cannot reach a marketing tool because this function drops them. */
const ALLOWED_PROPS = ["route", "tier", "step", "result", "outcome", "plan",
  "utm_source", "utm_medium", "utm_campaign"];
const analytics = {
  endpoint: null,        // set to a first-party collector before launch
  consent: false,
  queue: [],
  setConsent(granted) {
    this.consent = granted;
    if (!granted) { this.queue = []; return; }
    this.queue.splice(0).forEach((e) => this.send(e));
  },
  track(name, props = {}) {
    const clean = {};
    Object.keys(props).forEach((k) => { if (ALLOWED_PROPS.includes(k)) clean[k] = props[k]; });
    const event = { name, props: clean, at: Date.now() };
    if (!this.consent) { if (this.queue.length < 40) this.queue.push(event); return; }
    this.send(event);
  },
  campaign() {
    try {
      const q = new URLSearchParams(window.location.search);
      const out = {};
      ["utm_source", "utm_medium", "utm_campaign"].forEach((k) => {
        const v = q.get(k); if (v) out[k] = cap(v, 60);
      });
      return out;
    } catch { return {}; }
  },
  send(event) {
    if (!this.endpoint) return;                        // no collector wired in this build
    try { navigator.sendBeacon(this.endpoint, JSON.stringify(event)); } catch (e) { /* never block the UI */ }
  },
};

const SEO_ROUTES = {
  landing: {
    path: "/",
    title: "Can you take payments under 18? Yes, from 13, with a guardian | Veyro",
    desc: "Most answers online say you must be 18. You can create a Stripe Standard account from 13 with a legal guardian as account owner. Veyro helps you get a parent to yes, then checks your checkout actually delivers.",
    h1: "Financial infrastructure for the next generation of founders.",
  },
  how: {
    path: "/how-it-works",
    title: "How Veyro works, payments for young founders, with guardian approval",
    desc: "Create your business, invite a guardian, connect a payment provider, and track pending, available and paid-out funds in one ledger.",
  },
  guardians: {
    path: "/for-guardians",
    title: "For guardians, what you are approving on Veyro",
    desc: "What a guardian is responsible for, what they can see, and how approvals and payouts work when supervising a young founder's business.",
  },
  checkout: { path: "/connect", title: "Connect payments to your app | Veyro",
    desc: "One supported way to add checkout to your project, and a six-point check that payment and delivery both work.", noindex: true },
  check: { path: "/check", title: "Can you take payments under 18? Check in 20 seconds, Veyro",
    desc: "Answer two questions and find out which payment route applies to you, including when you don't need Veyro at all." },
  notfound: { path: "/404", title: "Page not found | Veyro", desc: "That page does not exist.", noindex: true },
  thanks: { path: "/invitation-sent", title: "Invitation sent | Veyro", desc: "Your guardian invitation is on its way.", noindex: true },
  accessibility: { path: "/accessibility", title: "Accessibility Statement | Veyro",
    desc: "How Veyro is built for accessibility, what has been tested, and what has not." },
  terms: { path: "/terms", title: "Terms of Service | Veyro", desc: "The terms covering the Veyro software, what the guardian agrees to, and what Veyro can and cannot enforce." },
  privacy: { path: "/privacy", title: "Privacy Policy | Veyro", desc: "What Veyro holds, what it is built never to receive, and how data about people under 18 is handled." },
  pricing: { path: "/pricing", title: "Veyro pricing, free to start", desc: "Veyro is free for your first business. Pro adds multiple businesses, analytics and exportable financial records." },
  signin: { path: "/sign-in", title: "Sign in, Veyro", desc: "Sign in to your Veyro founder or guardian account.", noindex: true },
  signup: { path: "/start", title: "Start building, Veyro", desc: "Create your Veyro account and set up the financial side of your business in a few minutes.", noindex: true },
  invite: { path: "/invitation", title: "Guardian invitation, Veyro", desc: "Review and respond to a guardian invitation.", noindex: true },
};

const APP_ROUTE_SEO = { title: "Veyro", desc: "Veyro app.", noindex: true };

function upsertMeta(sel, attrs) {
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement(attrs.rel ? "link" : "meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function useSEO(routeName) {
  useEffect(() => {
    const r = SEO_ROUTES[routeName] || APP_ROUTE_SEO;
    const url = SITE + (r.path || "/app");
    document.title = r.title;
    upsertMeta('meta[name="description"]', { name: "description", content: r.desc });
    upsertMeta('meta[name="robots"]', { name: "robots", content: r.noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large" });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Veyro" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: r.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: r.desc });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: r.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: r.desc });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: SITE + "/og.svg" });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt",
      content: "Veyro. Financial infrastructure for the next generation of founders." });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: SITE + "/og.svg" });
    upsertMeta('meta[name="theme-color"]', { name: "theme-color", content: "#1e4636" });
    upsertMeta('link[rel="icon"]', { rel: "icon", type: "image/svg+xml", href: FAVICON });
    upsertMeta('link[rel="apple-touch-icon"]', { rel: "apple-touch-icon", href: FAVICON });
    analytics.track("page_view", { route: routeName, ...analytics.campaign() });
  }, [routeName]);
}

const FAQ = [
  { q: "Can someone under 18 accept online payments?",
    a: "Yes, and most sources get this wrong. Stripe's support documentation states you can create a Standard account from age 13, provided a legal guardian adds themselves as the account owner before the account accepts charges or pays out. Not on your own, but not impossible either. Most payment providers require the person who holds the account to be an adult, because that person is legally responsible for the money and passes identity checks. Veyro does not change that. It gives your guardian a clear way to hold the account while you run the business day to day." },
  { q: "Does my guardian own my business?",
    a: "No. Your guardian is the responsible representative on the payment account, which is what the provider requires. Veyro keeps a separate ledger for the business so it stays obvious which money came from your customers and where it went." },
  { q: "Who actually holds the money?",
    a: "The regulated payment provider does, until a payout is sent to the connected bank account. Veyro is software: it handles onboarding, the guardian relationship, the ledger and the payout workflow. It is not a bank and does not hold customer funds." },
  { q: "What happens when I turn 18?",
    a: "You become eligible to be the representative on your own payment account. Veyro is designed for that handover, so supervision ends without the business or its records starting over." },
  { q: "Why is some of my money not available yet?",
    a: "Card payments settle on a schedule set by the payment provider, usually a couple of business days, partly so refunds and disputes can be handled. Veyro shows you the exact date each payment becomes available instead of hiding it in one balance number." },
  { q: "What does Veyro cost?",
    a: "Your first business is free. Processor fees are set by the payment provider and shown on every transaction, so you always see gross, fee and net." },
];

function StructuredData() {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": SITE + "/#org", name: "Veyro", url: SITE,
        description: "Financial infrastructure for the next generation of founders." },
      { "@type": "SoftwareApplication", name: "Veyro", applicationCategory: "BusinessApplication",
        operatingSystem: "Web", url: SITE, publisher: { "@id": SITE + "/#org" },
        description: SEO_ROUTES.landing.desc,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free for your first business" } },
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  // Escaping "<" prevents a "</script>" sequence in any future dynamic value from
  // breaking out of the tag. The data is static today; the guard is for when it is not.
  const safe = JSON.stringify(json).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />;
}

/* ------------------------------------------------------------------ *
 * Extra styles for the marketing surface
 * ------------------------------------------------------------------ */

const CSS2 = `
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
.fw .lp-links { display:flex; align-items:center; gap:4px; }
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
.fw .pwtoggle { position:absolute; right:1px; top:1px; bottom:1px; padding:0 11px; background:transparent; border:0;
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

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

/* Two strokes of different weight, 16 and 26 units, converging on a flat-cut
   apex. The uneven weights are the characteristic; the cut is what survives 16px,
   where a sharp vertex fills in and reads as a blob. */
const V_PATH = "M10 18 L26 18 L45 57 L64 18 L90 18 L58 84 L43 84 Z";
const Mark = ({ size = 22, reversed }) => (
  <svg className="mark" width={size} height={size} viewBox="0 0 100 100"
    aria-hidden="true" focusable="false">
    <path d={V_PATH} fill={reversed ? "var(--reverse)" : "var(--brand)"} />
  </svg>
);
const ICONS = {
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
const Icon = ({ name, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none" }}>
    <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Daily gross sales. Bars rather than an area fill, sales are discrete events, and a
   smoothed curve would imply a continuity the data does not have. */
function SalesChart({ entries, nowMs, days = 30, height = 92 }) {
  const start = nowMs - days * DAY;
  const buckets = new Array(days).fill(0);
  entries.forEach((e) => {
    if (e.kind !== KIND.CHARGE || e.createdAt < start) return;
    const i = Math.min(days - 1, Math.floor((e.createdAt - start) / DAY));
    buckets[i] += e.grossMinor;
  });
  const max = Math.max(...buckets, 1);
  const total = buckets.reduce((a, b) => a + b, 0);
  const avg = total / days;
  const W = 600, gap = 2, bw = (W - gap * (days - 1)) / days;
  const avgY = height - (avg / max) * height;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height + 1}`} width="100%" height={height + 1} preserveAspectRatio="none"
        role="img" aria-label={`Daily gross sales for the last ${days} days`} style={{ display: "block" }}>
        <line x1="0" y1={height + 0.5} x2={W} y2={height + 0.5} stroke="var(--line)" strokeWidth="1" />
        {avg > 0 && <line x1="0" y1={avgY} x2={W} y2={avgY} stroke="var(--ink-3)" strokeWidth="1"
          strokeDasharray="3 3" opacity="0.5" />}
        {buckets.map((v, i) => {
          const h = v === 0 ? 1.5 : Math.max(2.5, (v / max) * height);
          return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx="1"
            fill={v === 0 ? "var(--line)" : "var(--pine)"} opacity={v === 0 ? 1 : 0.88} />;
        })}
      </svg>
      <div className="row-b" style={{ marginTop: 7 }}>
        <span className="tiny">{fDate(start)}</span>
        <span className="tiny">Daily average <span className="num">{money(avg)}</span></span>
        <span className="tiny">{fDate(nowMs)}</span>
      </div>
    </div>
  );
}

/* Archivo's cap height is ~0.72 of its em. The V is drawn to exactly that, so its
   flat apex sits on the baseline and its top aligns with the cap line of "eyro". */
const Wordmark = ({ size, hero, reversed }) => (
  <span className={"wordmark" + (hero ? " wordmark-hero" : "")}
    style={size ? { fontSize: size } : undefined}>
    <svg className="wm-v" viewBox="10 18 80 66" aria-hidden="true" focusable="false">
      <path d={V_PATH} fill={reversed ? "var(--reverse)" : "var(--brand)"} />
    </svg><span className="wm-rest" style={{ color: reversed ? "var(--reverse)" : "var(--ink)" }}>eyro</span>
  </span>
);

const Brand = ({ onClick, size = 20 }) => (
  <button className="brand" onClick={onClick} aria-label="Veyro, home"
    style={{ background: "none", border: 0, cursor: onClick ? "pointer" : "default", padding: 0 }}>
    <Wordmark size={size} />
  </button>
);

const Btn = ({ variant = "1", size, className = "", ...p }) => {
  const v = { 1: "", 2: " btn-2", q: " btn-q", d: " btn-d" }[variant] || "";
  const z = size === "lg" ? " btn-lg" : size === "sm" ? " btn-sm" : "";
  return <button {...p} className={"btn" + v + z + (className ? " " + className : "")} />;
};
// The dot prop is accepted and ignored. Every badge already carries a text label,
// so the dot was decoration that looked like data.
const Badge = ({ tone = "grey", children }) => <span className={"badge b-" + tone}>{children}</span>;
const Amt = ({ v, signed, round, className = "" }) => <span className={"num " + className}>{money(v, { signed, round })}</span>;

const reducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch { return false; }
};
const scrollBehavior = () => (reducedMotion() ? "auto" : "smooth");

let fieldSeq = 0;
const Field = ({ label, hint, error, children }) => {
  const id = useMemo(() => "f" + ++fieldSeq, []);
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": error ? id + "-e" : hint ? id + "-h" : undefined,
      })
    : children;
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      {child}
      {error ? <span className="err" id={id + "-e"} role="alert">{error}</span>
        : hint ? <span className="hint" id={id + "-h"}>{hint}</span> : null}
    </label>
  );
};
const Choice = ({ on, onClick, title, sub }) => (
  <button type="button" className="choice" data-on={on ? "1" : "0"} onClick={onClick}>
    <span className="tick" />
    <span>
      <span style={{ display: "block", fontSize: "var(--fs-3)", fontWeight: 500 }}>{title}</span>
      {sub && <span className="tiny" style={{ display: "block", marginTop: 2 }}>{sub}</span>}
    </span>
  </button>
);

const Card = ({ title, action, children, footer, pad = true }) => (
  <div className="card">
    {(title || action) && <div className="card-h"><h3 className="h4">{title}</h3>{action}</div>}
    {pad ? <div className="card-b">{children}</div> : children}
    {footer && <div className="card-f">{footer}</div>}
  </div>
);

/** Failure and blocked states. Never a code, always: what happened, why, what next. */
const Notice = ({ tone = "amber", head, children, action }) => {
  const bg = { amber: "var(--amber-bg)", clay: "var(--clay-bg)", pine: "var(--pine-bg)", slate: "var(--slate-bg)", grey: "var(--surface)" }[tone];
  const bd = { amber: "var(--amber-line)", clay: "var(--clay-line)", pine: "var(--pine-line)", slate: "var(--slate-line)", grey: "var(--line)" }[tone];
  return (
    <div style={{ background: bg, border: "1px solid " + bd, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: "var(--fs-3)", fontWeight: 560, marginBottom: 4 }}>{head}</div>
      <div className="small" style={{ maxWidth: "var(--m-body)" }}>{children}</div>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
};

/* Actions that would hit the payment provider get a pending state with a text
   label and aria-busy, rather than a skeleton. The delay stands in for the
   round trip that a real adapter would make. */
function useAction(fn, ms = 700) {
  const [busy, setBusy] = useState(false);
  const run = (...args) => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); fn(...args); }, ms);
  };
  return [busy, run];
}

function Disclosure({ q, a, open, onToggle, id }) {
  return (
    <div className="disc" data-open={open ? "1" : "0"}>
      <h3 style={{ margin: 0 }}>
        <button className="disc-q" aria-expanded={open} aria-controls={id + "-panel"} id={id + "-btn"}
          onClick={onToggle}>
          <span>{q}</span>
          <span className="disc-sign" aria-hidden="true" />
        </button>
      </h3>
      <div className="disc-panel" id={id + "-panel"} role="region" aria-labelledby={id + "-btn"}>
        <div><p className="disc-a">{a}</p></div>
      </div>
    </div>
  );
}

function SkipLink() {
  return <a href="#main" className="skiplink">Skip to content</a>;
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="progress" aria-hidden="true"><i style={{ width: pct + "%" }} /></div>;
}

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <button className="totop" onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })} aria-label="Back to top">
      <span className="totop-mark" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
          <path d="M2 9.6 L6 2.4 L10 9.6" stroke="var(--reverse)" strokeWidth="1.9"
            strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      </span>
      <span>Top</span>
    </button>
  );
}

function CopyButton({ value, label = "Copy" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = value; ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button className="linkbtn" onClick={copy} aria-live="polite">{done ? "Copied" : label}</button>
  );
}

/* loading | empty | success | error. Every screen that can be in one of these
   uses this, so the language and layout stay identical across the product. */
const STATE_TONE = { loading: "grey", empty: "grey", success: "pine", error: "clay" };
function StatusBlock({ state = "empty", head, children, action, ref: refId }) {
  const tone = STATE_TONE[state];
  return (
    <div className={"statusblock sb-" + state} role={state === "error" ? "alert" : "status"}
      aria-busy={state === "loading" ? "true" : undefined}>
      <div className="row" style={{ gap: 9, alignItems: "baseline" }}>
        <span className={"sb-mark sb-mark-" + tone} aria-hidden="true" />
        <span className="sb-head">{head}</span>
      </div>
      <div className="sb-body">{children}</div>
      {refId && <div className="mono ink3" style={{ marginTop: 10 }}>Reference {refId}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

/* Field-level validation feedback with a live character budget. */
function CharCount({ value, max }) {
  const n = (value || "").length;
  const near = n > max * 0.85 && n <= max;
  return <span className="charcount" data-near={near ? "1" : "0"} data-over={n > max ? "1" : "0"}>{n}/{max}</span>;
}

const Empty = ({ head, children, action }) => (
  <div className="empty">
    <Mark size={22} />
    <div style={{ fontSize: "var(--fs-4)", fontWeight: 560, marginBottom: 5 }}>{head}</div>
    <div className="small" style={{ maxWidth: "var(--m-lead)", margin: "0 auto" }}>{children}</div>
    {action && <div style={{ marginTop: 16 }}>{action}</div>}
  </div>
);

const Modal = ({ title, onClose, children, footer, wide }) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 560 } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="card-h"><h3 className="h4">{title}</h3><Btn variant="q" size="sm" onClick={onClose} aria-label="Close">Close</Btn></div>
        <div className="card-b">{children}</div>
        {footer && <div className="card-f" style={{ borderRadius: "0 0 10px 10px" }}>{footer}</div>}
      </div>
    </div>
  );
};

const Toasts = ({ items, onDone }) => {
  useEffect(() => {
    if (!items.length) return;
    const t = setTimeout(() => onDone(items[0].id), 3600);
    return () => clearTimeout(t);
  }, [items.length ? items[0].id : null]);
  if (!items.length) return null;
  return <div className="toasts">{items.slice(-3).map((t) => <div key={t.id} className="toast">{t.text}</div>)}</div>;
};

/* Money position band, the one place the product spends its boldness. */
const COLORS = { paidOut: "#5b6167", available: "var(--pine)", pending: "var(--amber)", reserved: "var(--slate)", held: "var(--clay)" };
const BAND_KEYS = [
  ["available", "Available", "Ready to pay out now"],
  ["pending", "Pending", "Still settling at the processor"],
  ["reserved", "In transit", "Payout on the way to the bank"],
  ["held", "On hold", "Held while a dispute is reviewed"],
  ["paidOut", "Paid out", "Already in the bank account"],
];

function PositionBand({ w, compact }) {
  const parts = BAND_KEYS.map(([k]) => Math.max(0, w[k]));
  const total = parts.reduce((a, b) => a + b, 0) || 1;
  return (
    <div>
      <div className="band" role="img" aria-label="Where the money is right now">
        {BAND_KEYS.map(([k], i) => parts[i] > 0 && (
          <i key={k} style={{ width: (parts[i] / total) * 100 + "%", background: COLORS[k] }} />
        ))}
      </div>
      {!compact && (
        <div className="band-key">
          {BAND_KEYS.map(([k, label, sub], i) => (
            <div className="keyitem" key={k}>
              <span className="keysw" style={{ background: COLORS[k] }} />
              <span>
                <span style={{ fontSize: "var(--fs-3)" }}>{label} </span>
                <Amt v={w[k]} className="" />
                {sub && <span className="tiny" style={{ display: "block" }}>{sub}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Eligibility
 *
 * Sources (checked 5 Sep 2026):
 *   Stripe Services Agreement, Age Restrictions, 13+ may open an account; a
 *   user under 18 must add an adult Representative who accepts liability.
 *   Stripe support, "Age requirement to create a Stripe account", Standard
 *   accounts 13+ with a legal guardian as account owner before charges or
 *   payouts; Express and Custom Connect are 18+ and block signup.
 * These are provider policies, not confirmation that Veyro's specific platform
 * configuration has been approved. See ARCHITECTURE.md.
 * ------------------------------------------------------------------ */

const COUNTRIES = [
  // [code, name, age of contractual capacity, tier, note, access, evidence, source]
  // Contractual capacity, not the general age of majority. They coincide almost
  // everywhere, and where they do not the note says so.
  // status: "self" self-serve signup · "preview" contact-sales only · "extended" Paystack, not Stripe
  ["AU","Australia",18,2,"","self","primary","OECD Family Database PF1.8"],["AT","Austria",18,3,"","self","primary","EU Agency for Fundamental Rights"],["BE","Belgium",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["BR","Brazil",18,3,"","self","secondary","Secondary summaries only"],["BG","Bulgaria",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["CA","Canada",18,2,"18 in AB, MB, ON, QC, SK and PE. 19 in BC, NB, NL, NS, NT, NU and YT.","self","secondary","OECD confirms 19 in certain territories; the province split is secondary"],
  ["CI","Côte d'Ivoire",21,4,"","extended","secondary","Secondary summaries only"],
  ["HR","Croatia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["CY","Cyprus",18,3,"","self","primary","EU Agency for Fundamental Rights"],["CZ","Czech Republic",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["DK","Denmark",18,3,"","self","primary","EU Agency for Fundamental Rights"],["EE","Estonia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["FI","Finland",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["FR","France",18,3,"","self","primary","EU Agency for Fundamental Rights"],["DE","Germany",18,3,"","self","primary","EU Agency for Fundamental Rights"],["GH","Ghana",18,4,"","extended","secondary","Secondary summaries only"],
  ["GI","Gibraltar",18,3,"Sources disagree between 17 and 18. We use 18, the more cautious figure, until it is checked properly.","self","disputed","Cited as both 17 and 18"],["GR","Greece",18,3,"","self","primary","EU Agency for Fundamental Rights"],["HK","Hong Kong",18,3,"","self","primary","Singapore Parliament, Civil Law Amendment 2nd Reading"],
  ["HU","Hungary",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["IN","India",18,5,"Stripe lists India as Preview, sales contact only, no self-serve signup.","preview","secondary","Secondary summaries only"],
  ["ID","Indonesia",21,5,"Preview only. Age of majority is disputed between the Civil Code and later statutes.","preview","disputed","Civil Code and later statutes disagree"],
  ["IE","Ireland",18,2,"","self","primary","EU Agency for Fundamental Rights"],["IT","Italy",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["JP","Japan",18,3,"Lowered from 20 to 18 in April 2022. Older sources still say 20.","self","disputed","OECD still lists 20; the Civil Code reform took effect April 2022"],
  ["KE","Kenya",18,4,"","extended","secondary","Secondary summaries only"],["LV","Latvia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["LI","Liechtenstein",18,3,"","self","secondary","Secondary summaries only"],
  ["LT","Lithuania",18,3,"","self","primary","EU Agency for Fundamental Rights"],["LU","Luxembourg",18,3,"","self","primary","EU Agency for Fundamental Rights"],["MY","Malaysia",18,3,"","self","primary","Singapore Parliament, Civil Law Amendment 2nd Reading"],
  ["MT","Malta",18,3,"","self","primary","EU Agency for Fundamental Rights"],["MX","Mexico",18,3,"","self","primary","OECD Family Database PF1.8"],
  ["NL","Netherlands",18,3,"18, though most adult rights attach at 16.","self","primary","EU Agency for Fundamental Rights"],
  ["NZ","New Zealand",20,2,"20 for full capacity, though many contracts bind from 18.","self","primary","OECD Family Database PF1.8"],
  ["NG","Nigeria",18,4,"","extended","secondary","Secondary summaries only"],["NO","Norway",18,3,"","self","primary","OECD Family Database PF1.8"],["PL","Poland",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["PT","Portugal",18,3,"","self","primary","EU Agency for Fundamental Rights"],["RO","Romania",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["SG","Singapore",18,3,"The age of majority is 21, but contractual capacity was separated from it and lowered to 18 on 1 March 2009, expressly so that young people could do business. 18 is the number that matters here.","self","primary","Singapore MinLaw, MOF and MAS"],
  ["SK","Slovakia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["SI","Slovenia",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["ZA","South Africa",18,4,"","extended","secondary","Secondary summaries only"],["ES","Spain",18,3,"","self","primary","EU Agency for Fundamental Rights"],["SE","Sweden",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["CH","Switzerland",18,3,"","self","primary","OECD Family Database PF1.8"],
  ["TH","Thailand",20,3,"20 under the Civil and Commercial Code.","self","secondary","Civil and Commercial Code, via secondary summary"],
  ["AE","United Arab Emirates",21,3,"21. A 2026 announcement to lower it to 18 is unconfirmed.","self","disputed","21, with an unconfirmed 2026 announcement to lower it"],
  ["GB","United Kingdom",18,1,"Scotland is 16 under the Age of Legal Capacity (Scotland) Act 1991. A 16-year-old in Scotland needs no guardian on the account.","self","primary","Age of Legal Capacity (Scotland) Act 1991, FRA"],
  ["US","United States",18,1,"18 in most states. 19 in Alabama and Nebraska, 21 in Mississippi.","self","primary","Cornell LII summary, four concordant sources"],
  ["--","My country isn't listed",0,9,"","none"],
];

const REGIONS = [["GB",["England","Scotland","Wales","Northern Ireland"]],
  ["CA",["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
         "Nova Scotia","Ontario","Quebec","Saskatchewan","Other territory"]],
  ["US",["Alabama","Mississippi","Nebraska","Any other state"]]];
const REGION_AGE = { Scotland:16, "British Columbia":19, "New Brunswick":19,
  "Newfoundland and Labrador":19, "Nova Scotia":19, "Other territory":19,
  Alabama:19, Nebraska:19, Mississippi:21 };

function eligibility(code, age, region) {
  const c = COUNTRIES.find(([k]) => k === code);
  if (!c) return { route: "no_country", country: null, majority: 18 };
  const [, name, baseAge, tier, note, status, evidence, source] = c;
  const majority = (region && REGION_AGE[region]) || baseAge;
  const ctx = { country: c, majority, region, note, tier, status, evidence, source };
  if (tier === 9) return { ...ctx, route: "no_country" };
  if (status === "extended") return { ...ctx, route: "extended" };
  if (status === "preview") return { ...ctx, route: "preview" };
  if (age !== null && age < 13) return { ...ctx, route: "too_young" };
  if (age !== null && age >= majority) return { ...ctx, route: "adult" };
  if (tier === 1) return { ...ctx, route: "guardian" };
  if (tier === 2) return { ...ctx, route: "review" };
  return { ...ctx, route: "unverified" };
}

function EligibilityCheck({ go }) {
  const [code, setCode] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
  const [R, setR] = useState(null);
  const age = /^\d{4}$/.test(year) ? new Date().getFullYear() - parseInt(year, 10) : null;
  const regions = (REGIONS.find(([k]) => k === code) || [])[1];
  const ready = code && age !== null && age > 4 && age < 100 && (!regions || region);
  const reset = () => setR(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div className="wrap-s"><div className="lp-nav" style={{ borderBottom: 0 }}>
        <Brand onClick={() => go("landing")} />
        <Btn variant="2" size="sm" onClick={() => go("landing")}>
          <Icon name="back" size={13} />Back to home
        </Btn>
      </div></div>
      <div className="wrap-s" style={{ marginTop: 10, marginBottom: 90 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>Check what applies to you</h1>
        <p className="body" style={{ marginTop: 10, fontSize: "var(--fs-4)" }}>
          Where you live and how old you are decide which route is open, and whether you need us at all.
          No account, no email address.
        </p>

        <div className="card" style={{ marginTop: 22 }}><div className="card-b">
          <Field label="Where do you live?">
            <select className="select" value={code} onChange={(e) => { setCode(e.target.value); setRegion(""); reset(); }}>
              <option value="">Choose a country</option>
              {COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          {regions && (
            <Field label={code === "US" ? "Which state?" : code === "CA" ? "Which province?" : "Which nation?"}
              hint="The legal age of adulthood is set locally, not nationally.">
              <select className="select" value={region} onChange={(e) => { setRegion(e.target.value); reset(); }}>
                <option value="">Choose</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          )}
          <Field label="Year you were born">
            <input className="input" inputMode="numeric" maxLength={4} value={year}
              onChange={(e) => { setYear(e.target.value.replace(/\D/g, "")); reset(); }} placeholder="2009" />
          </Field>
          <Btn className="btn-w" disabled={!ready} onClick={() => setR(eligibility(code, age, region))}>Check</Btn>
        </div></div>

        {R && (
          <div style={{ marginTop: 16 }}>
            {R.route === "guardian" && (
              <Notice tone="pine" head="This route is open to you"
                action={<Btn size="sm" onClick={() => go("signup")}>Start setup</Btn>}>
                In {R.region || R.country[1]} you can sign a binding contract in your own name from {R.majority}.
                You're {age}, so the payment provider needs a parent or legal guardian added as the account owner
                before the account can take charges or pay out. That adult accepts responsibility for the account. We walk both of you through it
                and keep the records afterwards.
              </Notice>
            )}
            {R.route === "adult" && (
              <Notice tone="grey" head="You don't need us for this"
                action={<Btn size="sm" variant="2" onClick={() => go("landing")}>Understood</Btn>}>
                You're {age}, and you can contract in your own name in {R.region || R.country[1]} from {R.majority}.
                You can open a payment account in your own name directly with a provider. We exist for
                founders who are blocked by the age rule. If you run a programme for founders who are, that's a
                different conversation.
              </Notice>
            )}
            {R.route === "review" && (
              <Notice tone="amber" head={"Not open in " + R.country[1] + " yet"}>
                The provider supports businesses in {R.country[1]} and the age rules look workable, but we haven't had
                minors' contracting rules reviewed locally. We won't take you through setup on a guess. This is on our
                list, and it's the honest position today.
              </Notice>
            )}
            {R.route === "unverified" && (
              <Notice tone="amber" head={"Unverified in " + R.country[1]}>
                The provider supports businesses in {R.country[1]}, so the payments half works. What we have not
                checked is whether a minor can be the account holder there with a guardian representative, and what
                that means for tax. Two of the 45 supported countries we've looked at have a different age of
                adulthood than you'd expect, so guessing is not good enough.
              </Notice>
            )}
            {R.route === "extended" && (
              <Notice tone="amber" head={"Different provider in " + R.country[1]}>
                Stripe reaches {R.country[1]} through Paystack, its extended network, rather than through a Stripe
                account. Everything we have verified about minors and guardian representatives is Stripe's policy,
                not Paystack's, and we have not read Paystack's rules. We are not going to apply one company's
                terms to another company's product and call it verified.
              </Notice>
            )}
            {R.route === "preview" && (
              <Notice tone="amber" head={R.country[1] + " is in preview"}>
                Stripe lists {R.country[1]} as preview: businesses there contact Stripe sales rather than signing up
                themselves. There is no self-serve route for us to build on, so we cannot take you through setup.
              </Notice>
            )}
            {R.route === "too_young" && (
              <Notice tone="clay" head="Not yet, and we won't pretend otherwise">
                The provider's minimum age is 13, whoever is helping you. There is no version of this that works at
                {" " + age}, and anyone offering you one is asking you to put false information on a financial
                application. Keep building. Come back.
              </Notice>
            )}
            {R.route === "no_country" && (
              <Notice tone="clay" head="Not available where you are">
                The payment provider we use supports self-serve signup in 44 countries, and yours isn't among them. That's a
                provider restriction we can't work around, and we're not going to suggest registering a company
                somewhere else to get past it.
              </Notice>
            )}
            {["no_country", "review", "unverified", "preview", "extended"].includes(R.route) && (
              <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
                <div className="lbl" style={{ marginBottom: "var(--sp-1)" }}>What you can still do</div>
                <p className="small">
                  The route where the account is yours is not open to you, but the other one is, on
                  almost every provider. A parent or guardian opens the account in their own name and
                  you run the business day to day. It is worse in three specific ways and you should
                  know all three before you start.
                </p>
                <ul className="arrowlist" style={{ marginTop: "var(--sp-3)" }}>
                  <li>The business is legally theirs, not yours.</li>
                  <li>At 18 you transfer the account rather than simply taking it over.</li>
                  <li>If you sign in with their password you are breaching the provider's terms, and it
                    is your account that gets closed.</li>
                </ul>
                <p className="tiny" style={{ marginTop: "var(--sp-3)" }}>
                  Ask to be added as staff on their account rather than sharing a login. Veyro does not
                  set this up for you, and we would rather say so than pretend.
                </p>
              </div>
            )}

            {["guardian", "adult", "review", "unverified", "preview", "extended"].includes(R.route) && (
              <div className="panel" style={{ marginTop: 12 }}>
                {R.note && <>
                  <div className="lbl" style={{ marginBottom: 4 }}>Worth knowing about {R.country[1]}</div>
                  <p className="small" style={{ marginBottom: 12 }}>{R.note}</p>
                </>}
                <div className="lbl" style={{ marginBottom: 4 }}>Where the age of {R.majority} comes from</div>
                <p className="small">
                  {R.source}.{" "}
                  {R.evidence === "primary" ? "Stated by an official body or a named statute."
                   : R.evidence === "disputed" ? "Sources disagree, so we use the higher figure. Being told you need a guardian when you do not costs a step; the reverse produces an invalid application."
                   : "From secondary summaries, not yet confirmed against the statute."}
                </p>
                <p className="tiny" style={{ marginTop: 10 }}>
                  Separately, and this is the part that gates everything: whether a minor may hold the account
                  in {R.country[1]} with a guardian as representative has not been confirmed by a lawyer in any
                  country. Provider policy permitting it is not the same as it being settled locally.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <div className="lbl" style={{ marginBottom: 8 }}>How we work this out</div>
          <p className="tiny" style={{ maxWidth: "var(--m-body)" }}>
            Two filters. First, how the payment provider reaches your country: 44 countries can sign up directly,
            2 are sales-contact only, and 5 run on a different company's platform whose rules we have not read.
            Second, the age at which you can enter a binding contract where you live, because the provider's terms
            defer to local law rather than assuming 18. Scotland is 16, seven Canadian provinces and territories
            are 19, Mississippi is 21, and Singapore separates contracting age from adulthood entirely.
            Verified against the provider's own availability page on 5 September 2026. Terms change, and none of
            this is legal or tax advice.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero preview, the real product, driven by the real seeded ledger.
 * Nothing here is a picture of a screen; every figure is folded from the
 * same entries the signed-in app uses.
 * ------------------------------------------------------------------ */

const HERO_TABS = [["wallet", "Wallet", "wallet"], ["payouts", "Payouts", "payout"],
  ["payments", "Payments", "card"], ["guardian", "Guardian", "person"], ["activity", "Activity", "list"]];

function HeroPreview({ state }) {
  const [tab, setTab] = useState("wallet");
  const b = state.businesses[0];
  if (!b) return null;
  const t = now(state);
  const w = foldWallet(state.entries, state.payouts, b.id);
  const entries = state.entries.filter((e) => e.businessId === b.id);
  const payouts = state.payouts.filter((p) => p.businessId === b.id).sort((a, c) => c.requestedAt - a.requestedAt);
  const rel = relForBiz(state, b.id);
  const acct = acctForBiz(state, b.id);
  const provider = getProvider(acct?.providerId || "sandbox");
  const copy = ACCOUNT_COPY[acct?.status || "not_started"];

  const Row = ({ left, sub, right, badge }) => (
    <div className="hrow">
      <span className="grow" style={{ minWidth: 0 }}>
        <span className="hrow-t">{left}</span>
        {sub && <span className="hrow-s">{sub}</span>}
      </span>
      {badge}
      {right && <span className="num" style={{ fontSize: "var(--fs-3)" }}>{right}</span>}
    </div>
  );

  return (
    <div>
      <div className="frame">
        <div className="frame-bar">
          <span style={{ fontWeight: 600, fontSize: "var(--fs-2)" }}>{b.name}</span>
          <span className="grow" />
          <span className="tiny">Sandbox data</span>
        </div>
        <div className="frame-body">
          <div className="frame-rail" role="tablist" aria-label="Preview sections">
            {HERO_TABS.map(([k, label, icon]) => (
              <button key={k} role="tab" aria-selected={tab === k} data-on={tab === k ? "1" : "0"} onClick={() => setTab(k)}>
                <Icon name={icon} size={13} />{label}
              </button>
            ))}
          </div>
          <div className="frame-main" key={tab}>

            {tab === "wallet" && (<>
              <div className="row-b" style={{ alignItems: "flex-start" }}>
                <div><div className="lbl">Available to pay out</div>
                  <div className="num" style={{ fontSize: "var(--fs-8)", letterSpacing: "-0.028em", marginTop: 1 }}>{money(w.available)}</div></div>
                <Badge tone="pine" dot>Payments live</Badge>
              </div>
              <div style={{ marginTop: 13 }}><PositionBand w={w} compact /></div>
              <div style={{ marginTop: 15 }}>
                <div className="lbl" style={{ marginBottom: 6 }}>Gross sales, last 30 days</div>
                <SalesChart entries={entries} nowMs={t} height={54} />
              </div>
            </>)}

            {tab === "payouts" && (<>
              <div className="row-b"><div className="lbl">To First Community Bank ••4417</div>
                <span className="tiny">{provider.capabilities.payoutSpeed}</span></div>
              <div style={{ marginTop: 8 }}>
                {payouts.slice(0, 3).map((po) => {
                  const [tone, label] = PAYOUT_STATUS[po.status] || ["grey", po.status];
                  return <Row key={po.id} left={money(po.amountMinor)} sub={fFull(po.requestedAt)}
                    badge={<Badge tone={tone} dot={tone !== "grey"}>{label}</Badge>} />;
                })}
              </div>
              <p className="tiny" style={{ marginTop: 12 }}>
                Only settled money can be paid out. <span className="num">{money(w.pending)}</span> is still with the
                processor and each payment shows the exact date it clears.
              </p>
            </>)}

            {tab === "payments" && (<>
              <div className="row-b"><span className="h4" style={{ fontSize: "var(--fs-3)" }}>{copy.head}</span>
                <Badge tone={copy.tone} dot={copy.tone !== "grey"}>{copy.label}</Badge></div>
              <p className="small" style={{ marginTop: 6 }}>{copy.body}</p>
              <div style={{ marginTop: 12 }}>
                <Row left={provider.name} sub={"Settles in " + provider.capabilities.settlementDays + " business days"} />
                <Row left={userById(state, acct?.representativeUserId)?.name || ", "} sub="Responsible adult, verified by the provider" />
              </div>
            </>)}

            {tab === "guardian" && (<>
              <div className="row-b"><span className="h4" style={{ fontSize: "var(--fs-3)" }}>{rel?.guardianName}</span>
                <Badge tone="pine" dot>Supervising</Badge></div>
              <p className="small" style={{ marginTop: 6 }}>{rel?.relation} · {rel?.guardianEmail}</p>
              <div style={{ marginTop: 12 }}>
                <Row left="Approves every payout" sub="Recorded, with a timestamp" />
                <Row left="Named on the payment account" sub="Passed the provider's identity checks" />
                <Row left="Does not run the business" sub="Pricing, product and customers stay yours" />
              </div>
            </>)}

            {tab === "activity" && (<>
              <div className="lbl">Every action that moved money or changed permissions</div>
              <div style={{ marginTop: 8 }}>
                {state.audit.slice(0, 4).map((l) => (
                  <Row key={l.id} left={ACTION_LABEL[l.action] || l.action}
                    sub={(l.actorId ? userById(state, l.actorId)?.name : "Payment provider") + " · " + fDate(l.at)}
                    right={l.target && l.target.startsWith("$") ? l.target : null} />
                ))}
              </div>
            </>)}
          </div>
        </div>
      </div>
      <p className="tiny" style={{ marginTop: 11 }}>
        Click through it, this is the real product running on sandbox data, not a screenshot.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The handoff demonstration
 *
 * One example business, Slate Notes, shown from both sides at once. The active
 * side gets visual priority; the other explains the relationship. Selecting a
 * stage moves both panels and says who acts next. Deterministic, no live data.
 * ------------------------------------------------------------------ */

const HANDOFF = [
  { id: "create", label: "Create the business", actor: "founder",
    lead: "The founder describes what they built. This becomes the summary their guardian reads, so it is written once and reused.",
    f: { badge: ["pine", "Yours"], title: "Slate Notes",
         rows: [["What it sells", "A study app that turns class notes into practice questions"],
                ["Price", "$9 a month"], ["Website", "slatenotes.app"]] },
    g: { badge: ["grey", "Not involved yet"], title: "No guardian yet",
         rows: [["Status", "Nothing has been sent"], ["They will see", "The summary on the left, in plain English"]] } },
  { id: "invite", label: "Invite the guardian", actor: "guardian",
    lead: "The guardian gets one email and decides on their own device. The founder cannot answer it for them, which is the only reason the record is worth anything.",
    f: { badge: ["amber", "Waiting"], title: "Invitation sent",
         rows: [["To", "rania.haddad@gmail.com"], ["Expires", "in 14 days"],
                ["You can still", "Build, and prepare the integration"]] },
    g: { badge: ["amber", "Decide"], title: "Rania is asked to review",
         rows: [["What she takes on", "Named adult on the payment account, passes identity checks"],
                ["What she does not", "Ownership of the business, or running it"],
                ["She can", "Accept, decline, or ask a question"]] } },
  { id: "connect", label: "Connect payments", actor: "guardian",
    lead: "Verification happens on the provider's own form. Veyro never sees an identity document or a bank credential, and says so on the page where she agrees.",
    f: { badge: ["amber", "Waiting"], title: "Provider is verifying",
         rows: [["Who acts", "Your guardian, then the provider"], ["Nothing needed", "From you right now"]] },
    g: { badge: ["pine", "Accepted"], title: "Rania accepted on 12 August",
         rows: [["Recorded against", "This exact version of the business"],
                ["Next", "Identity check, on the provider's form"],
                ["Payouts land", "In her bank account"]] } },
  { id: "app", label: "Connect the app", actor: "founder",
    lead: "A verified account is not a working business. Something in the app has to start the purchase, and something has to deliver what was bought.",
    f: { badge: ["pine", "Your turn"], title: "Add checkout to Slate Notes",
         rows: [["You chose", "Paid access to your app"], ["You need", "A webhook endpoint on your server"],
                ["Never", "A secret key in your app bundle"]] },
    g: { badge: ["pine", "Supervising"], title: "Rania can see progress",
         rows: [["She sees", "That setup is moving, and every payout request"],
                ["She does not see", "Your code, or your customers' details"]] } },
  { id: "test", label: "Test the purchase", actor: "founder",
    lead: "Six checks on payment and delivery, before a real customer finds the gap for you.",
    f: { badge: ["clay", "3 of 6 failed"], title: "Launch check",
         rows: [["Payment confirmed", "Pass"], ["Customer received access", "Fail"],
                ["Refund removes access", "Fail"]] },
    g: { badge: ["pine", "Supervising"], title: "Nothing to do",
         rows: [["Rania is told", "Only when a payout needs her"], ["Right now", "Nothing is waiting on her"]] } },
];

function HandoffPanel({ side, data, active }) {
  const [tone, label] = data.badge;
  return (
    <div className={"hpanel" + (active ? " hpanel-on" : "")}>
      <div className="hpanel-h">
        <span className="hpanel-who">{side}</span>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <div className="hpanel-b">
        <div className="lp-h3" style={{ fontSize: "var(--fs-5)" }}>{data.title}</div>
        <dl className="hpanel-rows">
          {data.rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function HandoffDemo() {
  const [i, setI] = useState(1);
  const st = HANDOFF[i];
  return (
    <div>
      <div className="stagebar" role="tablist" aria-label="Setup stages">
        {HANDOFF.map((h, k) => (
          <button key={h.id} role="tab" aria-selected={k === i} id={"stg-" + h.id}
            aria-controls="stage-panel" data-on={k === i ? "1" : "0"} onClick={() => setI(k)}>
            <span className="stage-n">{String(k + 1).padStart(2, "0")}</span>
            <span>{h.label}</span>
          </button>
        ))}
      </div>

      <div id="stage-panel" key={st.id} role="tabpanel" aria-labelledby={"stg-" + st.id} className="stage-body">
        <p className="lp-lead" style={{ marginBottom: "var(--sp-6)" }}>{st.lead}</p>
        <div className="hstage">
          <HandoffPanel side="The founder" data={st.f} active={st.actor === "founder"} />
          <div className="hlink" aria-hidden="true"><span /></div>
          <HandoffPanel side="The guardian" data={st.g} active={st.actor === "guardian"} />
        </div>
        <div className="hactor">
          <Badge tone={ACTOR[st.actor].tone}>{ACTOR[st.actor].acts}</Badge>
          <span className="lp-note">Same business, both views, one shared record. Example data.</span>
        </div>
      </div>
    </div>
  );
}

/* Runnable sample check. Deterministic, uses the same six checks the product
   runs, and never implies it has looked at the visitor's actual app. */
function DeliveryDemo() {
  const [server, setServer] = useState(false);
  const [run, setRun] = useState(0);
  const [busy, go] = useAction(() => setRun((r) => r + 1), 550);
  const results = LAUNCH_CHECKS.map(([id, label, detail]) => ({
    id, label, detail,
    ok: ["deliver", "duplicate", "refund"].includes(id) ? server : true,
    why: !server && id === "deliver" ? "They paid you and got nothing. Your app only unlocks when their browser reaches your thank-you page, and they closed the tab before it loaded."
       : !server && id === "duplicate" ? "Stripe sent the message twice, which it does on purpose, and your app unlocked them twice."
       : !server && id === "refund" ? "You gave the money back in Stripe. Your app never heard about it, so they still have the product for free."
       : null,
  }));
  const failed = results.filter((r) => !r.ok).length;
  return (
    <div className="ddemo">
      <div className="ddemo-ctl">
        <button className="dtoggle" data-on={server ? "1" : "0"} onClick={() => { setServer(!server); setRun(0); }}
          aria-pressed={server}>
          <span className="dtoggle-box" aria-hidden="true" />
          <span>
            <span className="dtoggle-t">My app has a backend that Stripe can message</span>
            <span className="dtoggle-d">Not just a page the customer lands on after paying. If you are not sure, you probably do not.</span>
          </span>
        </button>
        <Btn onClick={go} disabled={busy} aria-busy={busy}>
          {busy ? "Checking" : run ? "Try it the other way" : "See what happens"}
        </Btn>
      </div>

      {run > 0 && (
        <div className="ddemo-out" role="status">
          <div className="ddemo-sum">
            <span className={"vd " + (failed ? "vd-no" : "vd-ok")} style={{ fontSize: "var(--fs-5)" }}>
              {failed ? failed + " of 6 failed" : "All 6 passed"}
            </span>
            <span className="lp-note">
              {failed ? "None of these show up as errors. The money still lands, so your app looks fine until a customer emails you."
                      : "Money arrived and the customer got what they paid for."}
            </span>
          </div>
          <ol className="dlist">
            {results.map((r) => (
              <li key={r.id} data-ok={r.ok ? "1" : "0"}>
                <span className="dmark" aria-hidden="true" />
                <span>
                  <span className="dlabel">{r.label}</span>
                  <span className="ddetail">{r.why || r.detail}</span>
                </span>
                <span className={"vd " + (r.ok ? "vd-ok" : "vd-no")}>{r.ok ? "Pass" : "Fail"}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="lp-note" style={{ marginTop: "var(--sp-4)" }}>
        A simulated example, not an inspection of your app. Veyro has no live connection to a payment
        provider in this build.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Landing
 * ------------------------------------------------------------------ */

function Landing({ go, state, signedInAs, home }) {
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showRoutes, setShowRoutes] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const scrollTo = (id) => {
    setMenu(false);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    // Move keyboard focus to the destination as well, so a keyboard user lands
    // where a mouse user just scrolled to instead of staying at the top.
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  return (
    <div>
      <StructuredData />
      <div className="navbar">
        <div className="wrap">
        <nav className="lp-nav sticky" data-scrolled={scrolled ? "1" : "0"} aria-label="Main">
          <Brand onClick={() => go("landing")} />
          <div className="lp-links">
            <button className="hide-s" onClick={() => scrollTo("truth")}>Can I do this?</button>
            <button className="hide-s" onClick={() => scrollTo("handoff")}>How it works</button>
            <button className="hide-s" onClick={() => scrollTo("delivery")}>What it checks</button>
            <button className="hide-s" onClick={() => scrollTo("reality")}>Before you start</button>
            <button className="hide-s" onClick={() => scrollTo("pricing")}>Pricing</button>
            <button className="mobmenu" aria-expanded={menu} aria-controls="mobnav"
              onClick={() => setMenu(!menu)}>{menu ? "Close" : "Menu"}</button>
            {signedInAs
              ? <Btn size="sm" onClick={() => go(home)} style={{ marginLeft: 6 }}>Back to your dashboard</Btn>
              : <><button className="hide-s" onClick={() => go("signin")}>Sign in</button>
                  <Btn size="sm" onClick={() => go("signup")} style={{ marginLeft: 6 }}>Set up payments</Btn></>}
          </div>
        </nav>
        {menu && (
          <div className="mobpanel" id="mobnav">
            {[["truth", "Can I do this?"], ["handoff", "How it works"], ["delivery", "What it checks"],
              ["reality", "Before you start"], ["pricing", "Pricing"], ["trust", "What Veyro is not"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <button onClick={() => { setMenu(false); go("check"); }}>Check what applies to you</button>
          </div>
        )}
        </div>
      </div>

      <main id="main">
        <div className="hero-band"><div className="wrap hero">
          <div className="split-lead hero-grid">
            <div>
              <h1 className="hero-h">
                <Wordmark hero />
                <span className="tagline">Financial infrastructure for the next generation of founders.</span>
              </h1>
              <p className="foldwho">For founders under 18 who have built something worth charging for</p>
              <p className="lead" style={{ marginTop: "var(--sp-4)", maxWidth: "var(--m-lead)" }}>
                <strong>Get your app taking payments, with the account in your name.</strong> There is a
                route where the payment account is yours from 13, not your parent's. Almost nobody knows
                it exists. Veyro finds it, explains it to your guardian in language they will follow, and
                checks that a paying customer really receives what they bought.
              </p>
              <ul className="foldwhy">
                <li><strong>Free to find out.</strong> Two questions. If you do not need us, it says so.</li>
                <li><strong>Your parent gets a real explanation</strong>, not a link and a shrug.</li>
                <li><strong>We check delivery, not just payment</strong>, before a customer finds the gap.</li>
              </ul>
              <div className="row" style={{ marginTop: 26, flexWrap: "wrap" }}>
                <Btn size="lg" onClick={() => go("signup")}>Get your app taking payments</Btn>
                <Btn size="lg" variant="2" onClick={() => scrollTo("handoff")}>See it work</Btn>
              </div>
              <p className="tiny" style={{ marginTop: 14 }}>
                Free to start. We tell you whether it is even possible for you before anyone emails a
                parent. Only want the answer?{" "}
                <button className="linkbtn" onClick={() => go("check")}>Check eligibility on its own</button>.
              </p>
              <div style={{ marginTop: 30, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
                <div className="herofacts">
                  <div><span className="hf-n">13</span><span className="hf-l">The real minimum age with a guardian on the account, not 18</span></div>
                  <div><span className="hf-n">4</span><span className="hf-l">Separate statuses: details, charges, delivery, payouts</span></div>
                  <div><span className="hf-n">6</span><span className="hf-l">Checks that a paying customer actually receives what they bought</span></div>
                </div>
              </div>
            </div>

            <HeroPreview state={state} />
          </div>
        </div></div>

        <section className="lp lp-pad-md" id="truth">
          <div className="wrap-lp">
            <div className="truthgrid">
              <div>
                <Mark size={14} />
                <span className="lp-eyebrow">Can I do this?</span>
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Most answers online are wrong.</h2>
              </div>
              <div>
                <p className="lp-lead">
                  Search whether you can take payments under 18 and you will be told no. Legal explainer
                  sites say the account holder must be 18. People have been told to shut down accounts
                  they had already taken money through.
                </p>
                <p className="lp-lead" style={{ marginTop: "var(--sp-4)" }}>
                  Stripe's own documentation describes a Standard account from <strong>age 13</strong>,
                  where a legal guardian is added as the account owner before it can take charges or pay
                  out. Whether that is open to you depends on your country and the provider's own rules,
                  which is what the check is for.
                </p>
                <p className="lp-note" style={{ marginTop: "var(--sp-4)" }}>
                  Not a loophole, and not universal. We have verified the country rules for the United
                  States and the United Kingdom and we say so plainly everywhere else.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp lp-pad-lg" id="handoff">
          <div className="wrap-lp">
            <div className="sec-lead">
              <h2 className="lp-h2">One business. Two people. Everyone knows whose turn it is.</h2>
              <p className="lp-lead" style={{ marginTop: "var(--sp-3)" }}>
                The hard part was never the paperwork. It is that a teenager cannot explain a payment
                account to a parent well enough for them to agree. Here is the same example business
                from both sides, at every stage.
              </p>
            </div>
            <div style={{ marginTop: "var(--sp-7)" }}><HandoffDemo /></div>

            <div className="ownership">
              <div>
                <h3 className="lp-h3">The distinction that matters</h3>
                <p className="body" style={{ marginTop: "var(--sp-2)" }}>
                  The business stays the founder's. The guardian is the responsible adult on the payment
                  account, which is what the provider requires, and payouts land in their bank account.
                  They do not own the business and they cannot move money on their own.
                </p>
              </div>
              <Disclosure id="routes" q="How this compares to a parent-owned account"
                open={showRoutes} onToggle={() => setShowRoutes(!showRoutes)}
                a={"On every provider except Stripe, the parent must own the account outright and the founder becomes staff on their own business, with a full transfer at 18. We will explain that route if it is the only one open to you, but we will not build tooling for it: a minor signing in with an adult's credentials breaches almost every provider's terms, and it is the founder's account that gets closed."} />
            </div>
          </div>
        </section>

        <section className="lp lp-dark lp-pad-lg" id="delivery">
          <div className="wrap-lp">
            <div className="sec-lead">
              <span className="lp-eyebrow">Does my checkout actually work?</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-3)" }}>Your app can take money and still be broken.</h2>
              <p className="lp-lead" style={{ marginTop: "var(--sp-3)" }}>
                If your app unlocks the product when the customer's browser reaches your thank-you page,
                then anyone who closes the tab has paid you and got nothing. Their card is charged. Your
                app thinks nothing happened. This is the single most common mistake in checkout code
                written by an AI, and nothing anywhere tells you it went wrong.
              </p>
            </div>
            <div style={{ marginTop: "var(--sp-7)" }}><DeliveryDemo /></div>
          </div>
        </section>

        <section className="lp lp-pad-md" id="reality">
          <div className="wrap-lp">
            <div className="sec-lead">
              <span className="lp-eyebrow">Before you start</span>
              <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>Six things nobody tells you.</h2>
              <p className="lp-lead" style={{ marginTop: "var(--sp-3)" }}>
                None of these are reasons not to do it. They are just things worth knowing now rather
                than three weeks in, and none of them appear on a payment provider's homepage.
              </p>
            </div>
            <ol className="reality">
              {[["The money lands in your parent's bank account",
                 "Not yours. Their name is on the account, so their bank details are what gets verified. How it gets from them to you is a conversation you two have. We keep the record of every payout so it is never a guess."],
                ["The provider keeps a cut of every sale",
                 "Around 2.9% plus 30 cents. On a $9 subscription that is about 56 cents, so you keep roughly $8.44. It comes off automatically and you never see the full amount."],
                ["Money does not arrive instantly",
                 "A card payment sits with the provider for about two business days before you can move it. That is normal and it is so refunds and disputes can be sorted out first."],
                ["If your app has no backend, some of this will not work",
                 "A simple buy button is fine without one. Unlocking an account, delivering a file, or running a subscription needs something of yours that Stripe can message. If your app is only a frontend, that is the first thing to fix."],
                ["A customer can take their money back",
                 "Weeks later, through their bank, and you usually lose the fee too. It is rare on small digital products, but it exists and it is not a bug."],
                ["Your parent is genuinely responsible for the account",
                 "Not as a formality. If the provider has a question, they ask your parent. That is exactly why the review they get is written properly instead of being a checkbox."]].map(([t, d], i) => (
                <li key={t}>
                  <span className="reality-n">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="reality-t">{t}</span>
                    <span className="reality-d">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp lp-pad-lg" id="pricing">
          <div className="wrap-lp">
            <div className="pricegrid">
              <div>
                <Mark size={14} />
                <h2 className="lp-h2" style={{ marginTop: "var(--sp-3)" }}>Free to find out. Paid once, by the adult.</h2>
                <p className="lp-lead" style={{ marginTop: "var(--sp-3)" }}>
                  Charging a blocked fifteen-year-old to learn they are blocked would be indefensible,
                  so the check and the guardian review are always free. Setup is paid once, by the
                  guardian, after they have reviewed everything and agreed.
                </p>
                <div className="row" style={{ marginTop: "var(--sp-5)", flexWrap: "wrap" }}>
                  <Btn size="lg" onClick={() => go("signup")}>Get your app taking payments</Btn>
                </div>
                <p className="lp-note" style={{ marginTop: "var(--sp-4)" }}>
                  The payment provider charges its own fee on each sale, around 2.9% plus 30 cents. That
                  is theirs and it is shown on every transaction. Veyro never takes a percentage.
                </p>
              </div>
              <div className="pricecard">
                <div className="pricecard-h">
                  <span className="lp-note">Proposed, untested</span>
                  <Badge tone="amber">Nobody has paid this yet</Badge>
                </div>
                <div className="pricecard-b">
                  <div className="priceamt"><span className="num">$49</span><span className="priceunit">once, per app</span></div>
                  <ul className="arrowlist" style={{ marginTop: "var(--sp-4)" }}>
                    {["Guided setup with the payment provider",
                      "The checkout integration for what you built",
                      "The six-point payment and delivery check",
                      "14 days of help while you get it working"].map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
                <div className="pricecard-f">
                  <p className="lp-note">
                    Paid after the review, never before. If the provider rejects the account, or we
                    cannot deliver the setup we described, the fee is returned. If half an hour of help
                    costs more than the fee, the price is wrong and it changes before anyone is charged.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp lp-pad-md" id="trust">
          <div className="wrap-lp">
            <div className="trustgrid">
              <div>
                <h2 className="lp-h2">What Veyro is, and is not.</h2>
                <dl className="ruled" style={{ marginTop: "var(--sp-5)" }}>
                  <div><dt>Not a bank</dt><dd>A licensed provider holds the money and pays it out. Veyro never touches it.</dd></div>
                  <div><dt>Not a way around the rules</dt><dd>Providers require an adult. Veyro makes that relationship legible instead of pretending it is absent.</dd></div>
                  <div><dt>Not live yet</dt><dd>No real account is created and no real money moves in this build. Nobody has paid for it, and no pilot has run.</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="lp-h3" style={{ marginBottom: "var(--sp-3)" }}>Questions</h3>
                <div style={{ borderTop: "1px solid var(--ink)" }}>
                  {FAQ.map((f, i) => (
                    <Disclosure key={f.q} id={"faq" + i} q={f.q} a={f.a}
                      open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp lp-center lp-pad-lg" id="close">
          <div className="wrap-n">
            <Mark size={44} />
            <h2 className="lp-h1" style={{ marginTop: "var(--sp-5)", maxWidth: "14ch",
              marginLeft: "auto", marginRight: "auto" }}>Find out where you stand.</h2>
            <p className="lp-lead" style={{ marginTop: "var(--sp-4)", marginLeft: "auto", marginRight: "auto" }}>
              Name your project, tell us where you live, and we will say which route is open before you
              ask anyone for anything.
            </p>
            <div style={{ marginTop: "var(--sp-6)" }}>
              <Btn size="lg" onClick={() => go("signup")}>Get your app taking payments</Btn>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="footgrid">
            <div>
              <Brand onClick={() => go("landing")} />
              <p className="tiny" style={{ marginTop: 10, maxWidth: "var(--m-tight)" }}>
                Financial infrastructure for the next generation of founders.
              </p>
            </div>
            <div>
              <h3>Product</h3>
              <button onClick={() => scrollTo("truth")}>Can I do this?</button>
              <button onClick={() => go("check")}>Check eligibility</button>
            </div>
            <div>
              <h3>Who it is for</h3>
              <button onClick={() => scrollTo("trust")}>Questions</button>
            </div>
            <div>
              <h3>Legal</h3>
              <button onClick={() => go("terms")}>Terms of Service</button>
              <button onClick={() => go("privacy")}>Privacy Policy</button>
              <button onClick={() => go("accessibility")}>Accessibility</button>
              <button onClick={() => go("signin")}>Sign in</button>
            </div>
          </div>
          <div className="footbase">
            <p className="tiny" style={{ maxWidth: "var(--m-body)" }}>
              Veyro is a software product and is not a bank, an e-money institution or a payment services
              provider. Money is held and moved by a licensed payment provider under its own agreement.
              Availability depends on your country and the provider's own eligibility rules. Nothing here is
              legal or tax advice.
            </p>
            <p className="tiny">© {new Date().getFullYear()} Veyro</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Terms and privacy
 *
 * Written against what this product actually does. The strongest section is the
 * list of things Veyro deliberately does not collect, because that is a design
 * constraint enforced in the code, not a promise made in prose.
 * ------------------------------------------------------------------ */

const LEGAL = {
  terms: {
    title: "Terms of Service",
    updated: "5 September 2026",
    lede: "These terms cover the Veyro software. They do not cover the payment provider that actually holds and moves money, which has its own agreement that you accept separately and directly.",
    sections: [
      ["What Veyro is", [
        "Veyro is software. It is not a bank, an e-money institution, or a payment services provider, and it is not licensed as any of those things.",
        "Veyro never holds your customers' money. A regulated payment provider takes the payment, holds the funds, deducts its own fee and pays out to a connected bank account. Veyro records what happened and shows it to you and your guardian.",
        "Where these terms and the payment provider's agreement disagree about money, the provider's agreement governs the money.",
      ]],
      ["Who may use it", [
        "You must be at least 13. This is the payment provider's floor, not ours, and there is no version of the service that works below it.",
        "If you are below the age of legal adulthood where you live, an adult must be named as the responsible representative on the payment account before it can accept charges or pay out. That age is set locally. It is 16 in Scotland, 19 in seven Canadian provinces and territories, and 21 in Mississippi.",
        "Veyro is currently offered only in the United States and the United Kingdom. Signing up from elsewhere does not create an account.",
        "You agree that everything you tell us and the provider about your age, your location and your business is true. Giving false information on a financial application is not something we can protect you from.",
      ]],
      ["What the guardian agrees to, and what they do not", [
        "A guardian who accepts an invitation agrees to be named as the responsible adult on the payment account, to complete the provider's identity checks, and to respond when the provider asks for information.",
        "A guardian does not acquire ownership of the business, and is not agreeing to fund it.",
        "Read this next part properly. Veyro asks for the guardian's approval before a payout and records the decision permanently. Veyro cannot stop someone holding the payment account credentials from acting directly with the provider. What a guardian is guaranteed here is visibility and a record. It is not a technical lock, and no software layer can make it one.",
      ]],
      ["Fees", [
        "Founders and guardians are not charged. Where a programme, school or organisation sponsors a cohort, that organisation is billed and the terms of that arrangement are set out in its order form.",
        "Veyro takes no percentage of your sales. The payment provider's fee is the provider's, and it is shown on every transaction.",
      ]],
      ["Sandbox", [
        "Anything labelled sandbox is simulated. No money moves, no real customer is charged, and no figure in it represents an actual balance. Do not rely on sandbox output for any decision involving real money.",
      ]],
      ["Acceptable use", [
        "Do not use Veyro to sell anything the payment provider prohibits, to misrepresent who you or your guardian are, to obscure who controls a business, or to work around a restriction the provider has placed on an account.",
        "We may suspend an account where we reasonably believe any of the above is happening. Where we do, money already settled still belongs to the business and we will tell you how to reach it.",
      ]],
      ["Records", [
        "Veyro keeps an append only record of actions that changed money, permissions or account status. Neither you nor we can edit it. That is the point of it.",
        "If you stop using Veyro, or a sponsoring organisation stops paying, your records stay readable. We do not hold records hostage.",
      ]],
      ["What we do not promise", [
        "We do not promise that the payment provider will approve you. That decision is theirs and we have no influence over it.",
        "We do not give legal, tax or accounting advice. Whether income is taxable, and on whose return it lands, depends on the arrangement and is a question for a qualified adviser.",
        "The service is provided as it is. To the extent the law allows, our liability is limited to the fees paid for the service in the twelve months before a claim, and we are not liable for lost profits or lost business.",
      ]],
      ["Ending it", [
        "You can close your account at any time. Doing so does not close the payment account, which is held with the provider and must be closed with them.",
        "We can end these terms with thirty days notice, or immediately where the law or the provider requires it.",
      ]],
      ["Open items", [
        "The operating entity, its registered address, the governing law and the dispute forum are not yet settled and must be completed before these terms are used with a real customer. This document is a drafting basis reviewed by no lawyer.",
      ]],
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    updated: "5 September 2026",
    lede: "Veyro is used by teenagers, parents and school staff on whatever device they happen to have. This page says what has been built for accessibility and, more usefully, what has not yet been tested.",
    sections: [
      ["The standard we are working to", [
        "WCAG 2.2 Level AA. We are not claiming to have met it. We are claiming it is the target and that we will say where we fall short.",
      ]],
      ["What is built in", [
        "Every interactive control is a real button or a real form control, so it is reachable and operable by keyboard without any custom key handling.",
        "Focus is always visible. The focus ring is a solid two pixel outline with an offset, not a faint glow, and it is never removed.",
        "Colour is never the only carrier of meaning. Every payment state has a text label beside it, which is why the coloured status dots were removed.",
        "Money is set in tabular figures so columns align, and amounts are readable by a screen reader as ordinary text rather than as an image.",
        "Charts carry a text alternative describing what they show. The wallet position bar is labelled, and the same figures appear as text beneath it.",
        "Form errors are announced, tied to their field, and written as instructions rather than as codes.",
        "The interface respects the reduced motion setting. There is very little motion to reduce, because animation was removed rather than made optional.",
        "Text contrast targets 4.5 to 1 for body copy against the paper background.",
      ]],
      ["What has not been tested", [
        "This build has not been through a screen reader pass with NVDA, JAWS or VoiceOver.",
        "It has not been tested with voice control, with a switch device, or at 400 percent zoom.",
        "It has had no audit by anyone with lived experience of the barriers it might contain.",
        "Nobody should treat the list above as a conformance claim. It is a list of intentions that a real audit will partly contradict.",
      ]],
      ["Known gaps", [
        "The transaction table is a wide data table and has not been checked for row and column header association on small screens.",
        "The sandbox drawer is a panel that has not yet been given a focus trap or a documented return focus target.",
        "Colour contrast has been designed for but not measured with a tool.",
      ]],
      ["Telling us", [
        "If something here blocks you, we want the specific thing rather than a general report. Tell us the page, what you were using, and what happened.",
        "We aim to reply within five working days and to say plainly whether we can fix it, when, or why not.",
      ]],
      ["Open items", [
        "The contact address for accessibility reports, and the enforcement body for your region, still need to be filled in before this page is used with real customers.",
      ]],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "5 September 2026",
    lede: "Veyro is used by people under 18, so the useful part of this policy is the list of things it is built not to collect.",
    sections: [
      ["What Veyro deliberately never receives", [
        "Identity documents. Passports, driving licences and proof of address go to the payment provider on its own form. They do not pass through Veyro and are not stored by us.",
        "Bank account and routing numbers. We store a bank name and the last four digits for display, so you can tell one account from another. Nothing that could move money.",
        "Card numbers. Your customers pay the provider directly. No card data reaches our servers.",
        "Government identifiers such as a national insurance or social security number.",
        "This is enforced in the architecture, not by policy. The code has nowhere to put these values.",
      ]],
      ["What we do hold", [
        "For a founder: name, email, year of birth, country and region, and the business details you enter.",
        "For a guardian: name, email, relationship to the founder, and the record of what they approved and when.",
        "From the payment provider: transaction amounts, fees, refunds, disputes, payout status and account status. We mirror these so we can explain them.",
        "Ordinary technical logs, and a hashed record of session activity used to detect unusual access.",
      ]],
      ["People under 18", [
        "We collect the minimum needed to determine eligibility and to run the guardian relationship. Year of birth, not full date, because the year is enough to decide the route.",
        "We do not profile under 18s, do not sell or share their data for advertising, and do not use their data to train models.",
        "Settings that affect a young person's privacy default to the more private option.",
        "Where the UK Age Appropriate Design Code or the child provisions of the GDPR apply, we treat those standards as the floor rather than the target.",
      ]],
      ["Guardian consent records", [
        "When a guardian accepts, we record what they were shown, what they agreed to, and when. This is kept for the life of the relationship and for six years afterwards.",
        "That retention is deliberate. A consent record that vanishes when someone closes an account is worth nothing to the guardian, the founder or a school that has to account for what happened.",
      ]],
      ["Who else sees it", [
        "The payment provider, because it operates the account and is legally responsible for it.",
        "Infrastructure suppliers that host and back up the service, under contract, with no right to use the data for anything else.",
        "A sponsoring programme sees the students in its own cohort: whether they activated, and their business details. It does not see guardian identity documents, because we do not have them.",
        "We do not sell personal data. We do not put identity, bank or invitation data into analytics or marketing tools.",
      ]],
      ["Your choices", [
        "You can ask for a copy of your data, ask us to correct it, or ask us to delete it. A guardian can make the same requests for a founder they supervise.",
        "Deletion has one limit worth stating plainly. Records the payment provider or the law requires us to keep, including consent and transaction history, survive the deletion of your login. We will tell you exactly what was kept and why.",
        "You can export your ledger and your records at any time, in a format you can open elsewhere.",
      ]],
      ["Security", [
        "Passwords are hashed with a memory hard algorithm. Session tokens are stored only as hashes. Two factor secrets are encrypted at rest and are never returned by any interface.",
        "Access is checked per resource on every request. A guardian can read a business only through an accepted relationship, and can write only their own approval decisions.",
        "Every change to money, permissions or account status writes an entry that cannot be edited or deleted.",
      ]],
      ["Open items", [
        "The data controller entity, its address, the supervisory authority for complaints, and the representative for the region you are in are not yet settled. This policy is a drafting basis and has been reviewed by no lawyer or data protection officer.",
      ]],
    ],
  },
};

function NotFound({ go }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="wrap-n"><nav className="lp-nav sticky" aria-label="Main"><Brand onClick={() => go("landing")} /></nav></div>
      <main id="main" className="wrap-n" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <p className="mono" style={{ color: "var(--ink-3)" }}>404</p>
        <h1 className="d2" style={{ marginTop: 10 }}>That page is not here.</h1>
        <p className="body" style={{ marginTop: 14 }}>
          Either the address is wrong or we moved something and did not redirect it. The second one is our fault.
        </p>
        <div style={{ marginTop: 26, borderTop: "1px solid var(--ink)" }}>
          {[["check", "Check what applies to you", "Two questions. Tells you which route is open, or that you do not need us."],
            ["landing", "Home", "What Veyro does and who it is for."],
            ["signin", "Sign in", "For founders and guardians with an account."],
            ["terms", "Terms and privacy", "What we hold, and what we are built never to receive."]].map(([r, t, d]) => (
            <button key={r} onClick={() => go(r)} className="linkrow">
              <span><span className="linkrow-t">{t}</span><span className="linkrow-d">{d}</span></span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function ThankYou({ state, go }) {
  const b = myBusiness(state);
  const rel = b ? relForBiz(state, b.id) : null;
  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="wrap-n"><nav className="lp-nav sticky" aria-label="Main"><Brand onClick={() => go("landing")} /></nav></div>
      <main id="main" className="wrap-n" style={{ paddingTop: 64, paddingBottom: 100 }}>
        <h1 className="d2">The invitation is on its way.</h1>
        <p className="body" style={{ marginTop: 14 }}>
          We sent it to <strong>{rel?.guardianEmail}</strong>. It explains what Veyro is, what you are building,
          and exactly what they would be agreeing to. It is valid for 14 days.
        </p>
        <ol className="numbered" style={{ marginTop: 30 }}>
          <li><span>They read it and accept.</span><span>Nothing happens to any account until they do.</span></li>
          <li><span>They complete the provider's identity checks.</span><span>On the provider's own form. We never see those documents.</span></li>
          <li><span>Payments go live.</span><span>You will be told, and you can start selling.</span></li>
        </ol>
        <div className="row" style={{ marginTop: 30, flexWrap: "wrap" }}>
          <Btn onClick={() => go("dashboard")}>Go to your dashboard</Btn>
          <Btn variant="2" onClick={() => go("guardian")}>Check invitation status</Btn>
        </div>
        <p className="tiny" style={{ marginTop: 22 }}>
          If it does not arrive, check the address you entered and resend it from the Guardian page. We do not
          chase people on your behalf.
        </p>
      </main>
    </div>
  );
}

function CookieBanner({ onChoose, go }) {
  return (
    <div className="cookiebar" role="region" aria-label="Cookie choices">
      <div className="wrap" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", padding: "13px 28px" }}>
        <p className="small grow" style={{ minWidth: 260, maxWidth: "var(--m-body)" }}>
          We use one essential cookie to keep you signed in. We would also like to count anonymous page views to
          see which pages help. No third party trackers, and nothing about your identity, your business or your
          money ever reaches an analytics tool. <button className="linkbtn" onClick={() => go("privacy")}>Read the policy</button>
        </p>
        <div className="row" style={{ gap: 8 }}>
          <Btn size="sm" variant="2" onClick={() => onChoose(false)}>Essential only</Btn>
          <Btn size="sm" onClick={() => onChoose(true)}>Allow page counts</Btn>
        </div>
      </div>
    </div>
  );
}

function StickyCTA({ go }) {
  return (
    <div className="stickycta">
      <Btn className="btn-w" onClick={() => go("check")}>Check what applies to you</Btn>
      <p className="tiny" style={{ textAlign: "center", marginTop: 6 }}>Two questions, no account.</p>
    </div>
  );
}

function LegalPage({ go, which }) {
  const d = LEGAL[which];
  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="wrap-n"><nav className="lp-nav sticky" aria-label="Main"><Brand onClick={() => go("landing")} />
        <div className="lp-links">
          {[["terms", "Terms"], ["privacy", "Privacy"], ["accessibility", "Accessibility"]]
            .filter(([k]) => k !== which).map(([k, l]) => <button key={k} onClick={() => go(k)}>{l}</button>)}
          <button onClick={() => go("landing")}>Back to site</button>
        </div></nav></div>
      <main id="main" className="wrap-n" style={{ paddingTop: 44, paddingBottom: 90 }}>
        <h1 className="d2">{d.title}</h1>
        <p className="tiny" style={{ marginTop: 8 }}>Last updated {d.updated}</p>
        <p className="body" style={{ marginTop: 18, fontSize: "var(--fs-4)" }}>{d.lede}</p>
        <div style={{ marginTop: 34 }}>
          {d.sections.map(([h, ps], i) => (
            <section key={h} style={{ borderTop: "1px solid var(--line)", padding: "22px 0" }}>
              <h2 style={{ fontSize: "var(--fs-5)", fontWeight: 600, letterSpacing: "-0.006em" }}>
                <span className="mono" style={{ color: "var(--ink-3)", marginRight: 10 }}>{String(i + 1).padStart(2, "0")}</span>{h}
              </h2>
              {ps.map((t, j) => <p key={j} className="body" style={{ marginTop: 10, fontSize: "var(--fs-3)" }}>{t}</p>)}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Auth + onboarding
 * ------------------------------------------------------------------ */

function AuthShell({ title, sub, children, go, foot }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div className="wrap-s"><div className="lp-nav" style={{ borderBottom: 0 }}>
        <Brand onClick={() => go("landing")} />
        <Btn variant="2" size="sm" onClick={() => go("landing")}>
          <Icon name="back" size={13} />Back to home
        </Btn>
      </div></div>
      <div className="wrap-s" style={{ marginTop: 18, marginBottom: 80 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>{title}</h1>
        {sub && <p className="small" style={{ marginTop: 8 }}>{sub}</p>}
        <div className="card" style={{ marginTop: 20 }}><div className="card-b">{children}</div></div>
        {foot && <div className="tiny" style={{ marginTop: 14, textAlign: "center" }}>{foot}</div>}
      </div>
    </div>
  );
}

function SignIn({ go, dispatch, users }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const submit = () => {
    if (!email.includes("@")) return setErr("Enter the email address you signed up with.");
    if (!users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return setErr("No Veyro account uses that email address.");
    dispatch({ type: "auth/signin", email });
  };
  return (
    <AuthShell go={go} title="Sign in" sub="Founders and guardians use the same sign-in."
      foot={<>New here? <button className="linkbtn" onClick={() => go("signup")}>Create an account</button></>}>
      <Field label="Email" error={err}>
        <input className={"input" + (err ? " bad" : "")} value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@example.com" type="email" />
      </Field>
      <Field label="Password" hint="This prototype does not transmit or store credentials.">
        <span className="pwwrap">
          <input className="input" value={pw} onChange={(e) => setPw(cap(e.target.value, 128))}
            type={showPw ? "text" : "password"} placeholder="Your password" autoComplete="current-password" />
          <button type="button" className="pwtoggle" onClick={() => setShowPw(!showPw)}
            aria-pressed={showPw}>{showPw ? "Hide" : "Show"}</button>
        </span>
      </Field>
      <Btn className="btn-w" onClick={submit}>Sign in</Btn>
      <hr className="rule" style={{ margin: "18px 0" }} />
      <div className="tiny" style={{ marginBottom: 8 }}>Sandbox accounts</div>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {users.slice(0, 2).map((u) => (
          <Btn key={u.id} variant="2" size="sm" onClick={() => dispatch({ type: "auth/switch", userId: u.id })}>
            {u.name} · {u.role}
          </Btn>
        ))}
      </div>
    </AuthShell>
  );
}

const BIZ_TYPES = [["saas", "SaaS or web app"], ["digital", "Digital product"], ["service", "Freelance or service work"], ["content", "Content or community"], ["other", "Something else"]];
const MODELS = [["subscription", "Recurring subscription"], ["onetime", "One-time purchase"], ["usage", "Usage based"], ["mixed", "A mix"]];

function Onboarding({ state, dispatch, go }) {
  const d = state.draft;
  const [err, setErr] = useState({});
  if (!d) return null;
  const set = (patch) => dispatch({ type: "draft/set", patch });
  const yearNow = new Date().getFullYear();
  const age = d.birthYear && /^\d{4}$/.test(d.birthYear) ? yearNow - parseInt(d.birthYear, 10) : null;
  const regions = (REGIONS.find(([k]) => k === d.country) || [])[1];
  // The verdict is computed here, in the flow, rather than behind a separate gate
  const verdict = d.country && age !== null ? eligibility(d.country, age, d.region) : null;
  const minor = verdict ? verdict.route === "guardian" : (age !== null && age < 18);
  const blocked = verdict && ["too_young", "no_country", "preview", "extended", "review", "unverified"].includes(verdict.route);

  const steps = ["You", "Business", "Eligibility", "Guardian", "Done"];
  const guard = (n) => {
    const e = {};
    if (n === 0) {
      if (d.name.trim().length < 2) e.name = "Enter the name your guardian will recognise.";
      if (!d.email.includes("@")) e.email = "Enter a working email address.";
      if (!/^\d{4}$/.test(d.birthYear) || age < 8 || age > 90) e.birthYear = "Enter the year you were born, like 2009.";
      if (!d.country) e.country = "We need this to know which rules apply to you.";
      if (regions && !d.region) e.region = "The legal age of adulthood is set locally, not nationally.";
    }
    if (n === 1) {
      if (d.bizName.trim().length < 2) e.bizName = "Give the business a name. You can change it later.";
      if (d.description.trim().length < 10) e.description = "One sentence on what a customer is paying for.";
    }
    if (n === 3 && minor) {
      if (d.guardianName.trim().length < 2) e.guardianName = "Who are you inviting?";
      if (!d.guardianEmail.includes("@")) e.guardianEmail = "Enter an email address they check.";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };
  const next = () => { if (guard(d.step)) set({ step: d.step + 1 }); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div className="wrap-s"><div className="lp-nav" style={{ borderBottom: 0 }}>
        <Brand onClick={() => go("landing")} />
        <Btn variant="q" size="sm" onClick={() => dispatch({ type: "draft/cancel" })}>Cancel</Btn>
      </div></div>
      <div className="wrap-s" style={{ marginTop: 8, marginBottom: 80 }}>
        <div className="row" style={{ gap: 6, marginBottom: 18 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= d.step ? "var(--ink)" : "var(--line)" }} title={s} />
          ))}
        </div>

        {d.step === 0 && (<div className="card"><div className="card-b">
          <h1 className="h3">What are you building?</h1>
          <p className="small" style={{ margin: "6px 0 18px" }}>Start with you. This takes about two minutes.</p>
          <Field label="Your name" error={err.name}><input className={"input" + (err.name ? " bad" : "")} value={d.name} onChange={(e) => set({ name: cap(e.target.value, LIMITS.name) })} placeholder="Noor Haddad" /></Field>
          <Field label="Your email" error={err.email}><input className={"input" + (err.email ? " bad" : "")} type="email" value={d.email} onChange={(e) => set({ email: cap(e.target.value, LIMITS.email) })} placeholder="you@example.com" /></Field>
          <Field label="Year you were born" error={err.birthYear} hint="Providers set their own age rules. This decides what your setup looks like.">
            <input className={"input" + (err.birthYear ? " bad" : "")} inputMode="numeric" maxLength={4} value={d.birthYear} onChange={(e) => set({ birthYear: e.target.value.replace(/\D/g, "") })} placeholder="2009" />
          </Field>
          <Field label="Where you live" error={err.country}>
            <select className={"select" + (err.country ? " bad" : "")} value={d.country}
              onChange={(e) => set({ country: e.target.value, region: "" })}>
              <option value="">Choose a country</option>
              {COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          {regions && (
            <Field label={d.country === "US" ? "Which state?" : d.country === "CA" ? "Which province?" : "Which nation?"}
              error={err.region} hint="The legal age of adulthood is set locally, not nationally.">
              <select className={"select" + (err.region ? " bad" : "")} value={d.region} onChange={(e) => set({ region: e.target.value })}>
                <option value="">Choose</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          )}
          <Btn className="btn-w" onClick={next}>Continue</Btn>
        </div></div>)}

        {d.step === 1 && (<div className="card"><div className="card-b">
          <h1 className="h3">What do you sell?</h1>
          <p className="small" style={{ margin: "6px 0 18px" }}>Payment providers ask for this too. Answer it once here.</p>
          <Field label={<>Business name<CharCount value={d.bizName} max={LIMITS.business} /></>} error={err.bizName}><input className={"input" + (err.bizName ? " bad" : "")} value={d.bizName} onChange={(e) => set({ bizName: cap(e.target.value, LIMITS.business) })} placeholder="Slate Notes" /></Field>
          <Field label="Website" hint="Optional while you are still building."><input className="input" value={d.url} onChange={(e) => set({ url: cap(e.target.value, LIMITS.url) })} placeholder="slatenotes.app" /></Field>
          <Field label={<>What is the customer paying for?<CharCount value={d.description} max={LIMITS.description} /></>} error={err.description}>
            <textarea className={"ta" + (err.description ? " bad" : "")} rows={3} value={d.description} onChange={(e) => set({ description: cap(e.target.value, LIMITS.description) })} placeholder="A note-taking app for students that turns class notes into practice questions." />
          </Field>
          <Field label="Type"><select className="select" value={d.bizType} onChange={(e) => set({ bizType: e.target.value })}>{BIZ_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <div className="grid-2">
            <Field label="How you charge"><select className="select" value={d.model} onChange={(e) => set({ model: e.target.value })}>{MODELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Price" hint="Per month, or per sale."><input className="input" inputMode="decimal" value={d.price} onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, "") })} placeholder="9" /></Field>
          </div>
          <div className="row" style={{ marginTop: 4 }}><Btn variant="2" onClick={() => set({ step: 0 })}>Back</Btn><Btn className="grow" onClick={next}>Continue</Btn></div>
        </div></div>)}

        {d.step === 2 && verdict && (<div className="card"><div className="card-b">
          {blocked ? (<>
            <h1 className="h3">
              {verdict.route === "too_young" ? "Not yet, and we will not pretend otherwise"
                : verdict.route === "no_country" ? "Not available where you are"
                : verdict.route === "preview" ? verdict.country[1] + " is sales-contact only"
                : verdict.route === "extended" ? "Different provider in " + verdict.country[1]
                : "We have not verified " + verdict.country[1] + " yet"}
            </h1>
            <p className="body" style={{ margin: "10px 0 16px", fontSize: "var(--fs-3)" }}>
              {verdict.route === "too_young"
                ? "The provider's minimum age is 13, whoever is helping you. There is no version of this that works yet, and anyone offering you one is asking you to put false information on a financial application."
                : verdict.route === "extended"
                ? "The provider reaches " + verdict.country[1] + " through a different company's platform. Everything we have verified about minors and guardians is Stripe's policy, not theirs, and we will not apply one company's terms to another."
                : "We have only confirmed the guardian route in the United States and the United Kingdom. Elsewhere the provider rules, the age of adulthood and the tax treatment all differ, and we are not going to guess with your money."}
            </p>
            <Notice tone="grey" head="What you can still do">
              On almost every provider a parent can open the account in their own name and you run the
              business day to day. It is worse in three ways: the business is legally theirs, at 18 you
              transfer rather than take over, and signing in with their password breaches the provider's
              terms. Ask to be added as staff instead of sharing a login. We do not set this up for you.
            </Notice>
            <p className="tiny" style={{ marginTop: "var(--sp-4)" }}>
              We have stopped here rather than let you invite your guardian to something that will not work.
            </p>
            <div className="row" style={{ marginTop: "var(--sp-4)" }}>
              <Btn variant="2" onClick={() => set({ step: 0 })}>Change my answers</Btn>
              <Btn variant="q" onClick={() => dispatch({ type: "draft/cancel" })}>Leave it for now</Btn>
            </div>
          </>) : (<>
            <h1 className="h3">{minor ? "You will need an adult on the account" : "You can hold the account yourself"}</h1>
            <p className="body" style={{ margin: "10px 0 16px", fontSize: "var(--fs-3)" }}>
              {minor
                ? `In ${verdict.region || verdict.country[1]} you can sign a binding contract in your own name from ${verdict.majority}. You are ${age}, so the provider needs a parent or legal guardian added as owner of your account before it can take charges or pay out. The account stays yours.`
                : `You are ${age}, and you can contract in your own name in ${verdict.region || verdict.country[1]} from ${verdict.majority}. You can complete the provider's checks yourself. You may still invite someone to supervise.`}
            </p>
            <Notice tone="grey" head="What your guardian will and will not do">
              They pass the provider's identity checks, are named as the responsible adult, and approve
              payouts. They do not own the business, cannot move money on their own, and see the same
              ledger you do.
            </Notice>
            <p className="tiny" style={{ marginTop: "var(--sp-3)" }}>
              Based on {verdict.source}. {verdict.evidence === "primary"
                ? "Stated by an official body or a named statute."
                : "From secondary summaries, not yet confirmed against the statute."}
            </p>
            <div className="row" style={{ marginTop: 18 }}>
              <Btn variant="2" onClick={() => set({ step: 1 })}>Back</Btn>
              <Btn className="grow" onClick={() => set({ step: 3 })}>{minor ? "Invite a guardian" : "Continue"}</Btn>
            </div>
          </>)}
        </div></div>)}

        {d.step === 3 && (<div className="card"><div className="card-b">
          <h1 className="h3">{minor ? "Who will supervise the account?" : "Invite someone to supervise (optional)"}</h1>
          <p className="small" style={{ margin: "6px 0 18px" }}>They get one email explaining what Veyro is, what you are building and what they are agreeing to.</p>
          <Field label="Their name" error={err.guardianName}><input className={"input" + (err.guardianName ? " bad" : "")} value={d.guardianName} onChange={(e) => set({ guardianName: cap(e.target.value, LIMITS.name) })} placeholder="Rania Haddad" /></Field>
          <Field label="Their email" error={err.guardianEmail}><input className={"input" + (err.guardianEmail ? " bad" : "")} type="email" value={d.guardianEmail} onChange={(e) => set({ guardianEmail: cap(e.target.value, LIMITS.email) })} placeholder="parent@example.com" /></Field>
          <Field label="Relationship"><select className="select" value={d.relation} onChange={(e) => set({ relation: e.target.value })}>{["Parent", "Legal guardian", "Other relative", "Other trusted adult"].map((r) => <option key={r}>{r}</option>)}</select></Field>
          <div className="row" style={{ marginTop: 4 }}>
            <Btn variant="2" onClick={() => set({ step: 2 })}>Back</Btn>
            <Btn className="grow" onClick={() => { if (guard(3)) dispatch({ type: "onboard/complete", needsGuardian: minor || !!d.guardianEmail }); }}>
              {minor || d.guardianEmail ? "Send invitation" : "Finish"}
            </Btn>
          </div>
          {!minor && <button className="btn btn-q btn-w" style={{ marginTop: 8 }} onClick={() => dispatch({ type: "onboard/complete", needsGuardian: false })}>Skip, I'll do this myself</button>}
        </div></div>)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Guardian invitation, what the guardian opens from their email
 * ------------------------------------------------------------------ */

function InvitePage({ state, dispatch, go, relId }) {
  const rel = state.relationships.find((r) => r.id === relId);
  const [declining, setDeclining] = useState(false);
  if (!rel) return <AuthShell go={go} title="Invitation not found" sub="This link is no longer valid."><Btn className="btn-w" onClick={() => go("landing")}>Go to Veyro</Btn></AuthShell>;
  const b = bizById(state, rel.businessId);
  const founder = userById(state, rel.founderId);
  const expired = rel.status === "expired" || now(state) > rel.expiresAt;
  const isFounder = state.session?.userId === rel.founderId;

  if (rel.status === "accepted") return <AuthShell go={go} title="Already accepted" sub={`You are supervising ${b.name}.`}><Btn className="btn-w" onClick={() => go("g_overview")}>Open your dashboard</Btn></AuthShell>;
  if (rel.status === "declined") return <AuthShell go={go} title="Invitation declined" sub={`You declined the invitation for ${b.name}. ${founder?.name || "The founder"} can send a new one.`}><Btn variant="2" className="btn-w" onClick={() => go("landing")}>Close</Btn></AuthShell>;
  if (expired) return (
    <AuthShell go={go} title="This invitation expired" sub="Invitations are valid for 14 days.">
      <Notice tone="amber" head="Ask for a new link">
        {founder?.name || "The founder"} can resend the invitation from their Veyro account. Nothing is lost.
      </Notice>
    </AuthShell>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div className="wrap-s"><div className="lp-nav" style={{ borderBottom: 0 }}>
        <Brand onClick={() => go("landing")} />
        <Btn variant="2" size="sm" onClick={() => go("landing")}>
          <Icon name="back" size={13} />What is Veyro?
        </Btn>
      </div></div>
      <div className="wrap-s" style={{ marginTop: 8, marginBottom: 80 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-7)" }}>{founder?.name || "A founder"} asked you to supervise their business.</h1>
        <p className="body" style={{ marginTop: 10 }}>
          Veyro is where {founder?.name?.split(" ")[0] || "they"} runs the financial side of {b.name}. Because they are under 18,
          the payment account needs an adult who is legally responsible for it. That would be you.
        </p>

        <div className="card" style={{ marginTop: 22 }}>
          <div className="card-h"><h2 className="h4">{b.name}</h2><Badge tone="grey">{BIZ_TYPES.find(([v]) => v === b.type)?.[1]}</Badge></div>
          <div className="card-b">
            <p className="small">{b.description}</p>
            <div className="grid-2" style={{ marginTop: 14 }}>
              <div><div className="lbl">Charges customers</div><div style={{ fontSize: "var(--fs-3)", marginTop: 2 }}>{b.priceMinor ? money(b.priceMinor, { round: true }) : "Not set"} {b.model === "subscription" ? "per month" : "per sale"}</div></div>
              <div><div className="lbl">Website</div><div style={{ fontSize: "var(--fs-3)", marginTop: 2 }}>{b.url || "Not live yet"}</div></div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="panel"><div className="h4">What you take on</div>
            <ul className="arrowlist" style={{ marginTop: 8 }}>
              {["Pass the payment provider's identity checks", "Be the named adult on the payment account", "Approve payouts to your bank account", "Respond if the provider asks for more information"].map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="panel"><div className="h4">What you do not take on</div>
            <ul className="arrowlist" style={{ marginTop: 8 }}>
              {["Ownership of the business", "Running it day to day", "Any obligation to keep supervising"].map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16, borderColor: "var(--amber-line)", background: "var(--amber-bg)" }}>
          <div className="h4">What Veyro can and cannot enforce</div>
          <p className="small" style={{ marginTop: 7 }}>
            Read this part properly. The payment account is a Stripe account with you as the responsible adult, and it
            keeps its own login at stripe.com. Veyro asks for your approval before a payout and records your decision,
            but Veyro cannot stop someone with the account password from paying out directly in Stripe. What you are
            guaranteed here is visibility and a record, not a lock. Anyone who tells you a parental control app can
            override a payment provider is selling you something that isn't real.
          </p>
        </div>



        <div className="panel" style={{ marginTop: 16 }}>
          <div className="h4">How the money moves</div>
          <p className="small" style={{ marginTop: 7 }}>
            Customers pay the payment provider, not Veyro. The provider holds the funds, takes its fee, and releases them
            after a settling period. When {founder?.name?.split(" ")[0] || "the founder"} requests a payout, you approve it and the
            money lands in your bank account. Veyro records every step so both of you can see the same history.
          </p>
        </div>

        {isFounder ? (
          <div style={{ marginTop: "var(--sp-6)" }}>
            <StatusBlock state="error" head="This is a preview. You cannot answer it yourself.">
              You are signed in as the founder. Your guardian has to open this on their own device and
              decide for themselves, otherwise the record of their agreement means nothing. Use this
              view to check the explanation reads well before you send it.
            </StatusBlock>
          </div>
        ) : !declining ? (
          <div className="row" style={{ marginTop: 22, flexWrap: "wrap" }}>
            <Btn size="lg" onClick={() => dispatch({ type: "guardian/respond", relId: rel.id, accept: true })}>Accept and supervise</Btn>
            <Btn size="lg" variant="2" onClick={() => setDeclining(true)}>Decline</Btn>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 22 }}><div className="card-b">
            <div className="h4">Decline this invitation?</div>
            <p className="small" style={{ marginTop: 6 }}>
              {b.name} will not be able to take payments. {founder?.name?.split(" ")[0] || "The founder"} will be told, and can invite someone else.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <Btn variant="d" onClick={() => dispatch({ type: "guardian/respond", relId: rel.id, accept: false })}>Yes, decline</Btn>
              <Btn variant="2" onClick={() => setDeclining(false)}>Go back</Btn>
            </div>
          </div></div>
        )}
        <p className="tiny" style={{ marginTop: 18 }}>Veyro is software, not a bank. Money is held and moved by a licensed payment provider under its own terms.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * App shell
 * ------------------------------------------------------------------ */

const FOUNDER_NAV = [
  ["dashboard", "Home", "home", null],
  ["wallet", "Wallet", "wallet", "Money"],
  ["payouts", "Payouts", "payout", null],
  ["payments", "Payments", "card", "Setup"],
  ["checkout", "Connect app", "card", null],
  ["guardian", "Guardian", "person", null],
  ["business", "Business", "building", null],
  ["activity", "Activity", "list", "Records"],
];
const GUARDIAN_NAV = [
  ["g_overview", "Home", "home", null],
  ["g_approvals", "Approvals", "check", null],
  ["g_activity", "Activity", "list", "Records"],
];

function NotificationBell({ state, dispatch, go }) {
  const [open, setOpen] = useState(false);
  const notes = myNotes(state);
  const unread = notes.filter((n) => !n.read).length;
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <Btn variant="2" size="sm" onClick={() => setOpen(!open)} aria-label={`Notifications, ${unread} unread`}>
        Notifications{unread > 0 && <span className="num" style={{ color: "var(--clay)", fontWeight: 600 }}>{unread}</span>}
      </Btn>
      {open && (
        <div className="pop">
          <div className="card-h"><span className="h4">Notifications</span>
            {unread > 0 && <Btn variant="q" size="sm" onClick={() => dispatch({ type: "note/readall" })}>Mark all read</Btn>}</div>
          <div style={{ maxHeight: 340, overflow: "auto" }}>
            {notes.length === 0 && <div className="empty"><div className="small">Nothing yet. Activity on your business shows up here.</div></div>}
            {notes.slice(0, 12).map((n) => (
              <button key={n.id} onClick={() => { dispatch({ type: "note/read", id: n.id }); setOpen(false); if (n.route) dispatch({ type: "go", route: n.route }); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: n.read ? "transparent" : "var(--surface)", border: 0, borderBottom: "1px solid var(--line-soft)", padding: "11px 16px", cursor: "pointer" }}>
                <div className="row-b" style={{ alignItems: "baseline" }}>
                  <span style={{ fontSize: "var(--fs-3)", fontWeight: n.read ? 400 : 500 }}>{n.title}</span>
                  <span className="tiny">{ago(n.at, now(state))}</span>
                </div>
                <div className="tiny" style={{ marginTop: 3, color: "var(--ink-2)" }}>{n.body}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMenu({ state, dispatch }) {
  const [open, setOpen] = useState(false);
  const u = me(state);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <Btn variant="q" size="sm" onClick={() => setOpen(!open)}>{u.name}</Btn>
      {open && (
        <div className="pop" style={{ width: 260 }}>
          <div className="card-b" style={{ paddingBottom: 12 }}>
            <div style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{u.name}</div>
            <div className="tiny">{u.email}</div>
            <div style={{ marginTop: 8 }}><Badge tone="grey">{u.role === "guardian" ? "Guardian" : "Founder"}</Badge></div>
          </div>
          <div style={{ borderTop: "1px solid var(--line-soft)", padding: 8 }}>
            <div className="tiny" style={{ padding: "4px 8px 6px" }}>Switch account (sandbox only)</div>
            {state.users.map((x) => (
              <button key={x.id} onClick={() => { setOpen(false); dispatch({ type: "auth/switch", userId: x.id }); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 8px", border: 0, background: x.id === u.id ? "var(--surface)" : "transparent", borderRadius: 6, cursor: "pointer", fontSize: "var(--fs-3)" }}>
                {x.name} · {x.role}
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line-soft)", padding: 8 }}>
            <button onClick={() => dispatch({ type: "auth/signout" })} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 8px", border: 0, background: "transparent", borderRadius: 6, cursor: "pointer", fontSize: "var(--fs-3)" }}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppShell({ state, dispatch, go, children, sandbox, setSandbox }) {
  const u = me(state);
  const hasBiz = u.role === "guardian" || !!myBusiness(state);
  const nav = (u.role === "guardian" ? GUARDIAN_NAV : FOUNDER_NAV)
    .filter(([r]) => hasBiz || !["wallet", "payouts", "payments", "guardian", "business", "checkout"].includes(r));
  const approvals = u.role === "guardian" ? pendingApprovals(state).length : 0;
  return (
    <div>
      <div className="env">
        <b>Sandbox</b><span className="hide-s">Simulated data. No real money moves.</span>
        <span className="sep" /><button onClick={() => setSandbox(!sandbox)}>{sandbox ? "Hide controls" : "Open controls"}</button>
      </div>
      <div className="shell">
        <aside className="rail">
          <div className="rail-top"><Brand onClick={() => go(u.role === "guardian" ? "g_overview" : "dashboard")} /></div>
          {(() => {
            const b = u.role === "guardian" ? guardedBusinesses(state)[0] : myBusiness(state);
            if (!b) return null;
            const a = acctForBiz(state, b.id);
            const c = ACCOUNT_COPY[a?.status || "not_started"];
            return (
              <div className="ctx">
                <span className="initials">{b.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>
                <span className="grow" style={{ minWidth: 0 }}>
                  <span className="ctx-n">{b.name}</span>
                  <span className="ctx-s">{c.label}</span>
                </span>
              </div>
            );
          })()}
          <nav className="nav" aria-label="Sections">
            {nav.map(([r, label, icon, section]) => (
              <React.Fragment key={r}>
                {section && <div className="rail-sec">{section}</div>}
                <button data-on={state.route.name === r ? "1" : "0"} onClick={() => go(r)}>
                  <span className="row" style={{ gap: 9 }}><Icon name={icon} />{label}</span>
                  {r === "g_approvals" && approvals > 0 && <span className="badge b-amber num">{approvals}</span>}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </aside>
        <div className="main">
          <header className="topbar">
            <div className="row" style={{ gap: 10 }}>
              <span className="h4">{(nav.find(([r]) => r === state.route.name) || [, "Veyro"])[1]}</span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <NotificationBell state={state} dispatch={dispatch} go={go} />
              <AccountMenu state={state} dispatch={dispatch} />
            </div>
          </header>
          <div className="page" id="main"><div className="page-in">{children}</div></div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shared pieces
 * ------------------------------------------------------------------ */

const Stat = ({ label, value, sub, tone }) => (
  <div style={{ padding: "14px 18px", borderRight: "1px solid var(--line-soft)" }}>
    <div className="lbl">{label}</div>
    <div className="num" style={{ fontSize: "var(--fs-6)", marginTop: 3, color: tone ? `var(--${tone})` : "inherit", letterSpacing: "-0.02em" }}>{value}</div>
    {sub && <div className="tiny" style={{ marginTop: 3 }}>{sub}</div>}
  </div>
);

const TXN_STATUS = {
  succeeded: ["pine", "Succeeded"], refunded: ["grey", "Refunded"], partially_refunded: ["grey", "Partly refunded"], disputed: ["clay", "Disputed"],
};
const BUCKET_STATUS = { pending: ["amber", "Pending"], available: ["pine", "Available"], held: ["clay", "On hold"] };

function EntryRow({ e, state, onClick }) {
  const t = now(state);
  const isCharge = e.kind === KIND.CHARGE;
  const [tone, label] = isCharge
    ? (e.status !== "succeeded" ? TXN_STATUS[e.status] : BUCKET_STATUS[e.bucket] || ["grey", e.bucket])
    : e.kind === KIND.REFUND ? ["grey", "Refunded"] : e.kind === KIND.DISPUTE_HOLD ? ["clay", "On hold"] : ["grey", "Posted"];
  return (
    <tr onClick={onClick}>
      <td>
        <div style={{ fontWeight: 500 }}>{KIND_LABEL[e.kind]}</div>
        <div className="tiny">{e.customer || e.description}</div>
      </td>
      <td className="hide-s"><span className="mono ink3">{e.providerRef.slice(0, 14)}</span> <span className="mono ink3">SIM</span></td>
      <td className="hide-s"><Badge tone={tone} dot={tone !== "grey"}>{label}</Badge>
        {isCharge && e.bucket === "pending" && <div className="tiny" style={{ marginTop: 3 }}>Available {untilDays(e.availableOn, t)}</div>}
      </td>
      <td className="tiny hide-s">{fDate(e.createdAt)}</td>
      <td className="r"><Amt v={isCharge ? e.grossMinor : e.netMinor} signed={!isCharge} /></td>
    </tr>
  );
}

function LedgerTable({ entries, state, go, limit, query }) {
  const q = (query || "").trim().toLowerCase();
  const matched = q
    ? entries.filter((e) => [KIND_LABEL[e.kind], e.customer, e.description, e.providerRef,
        money(e.kind === KIND.CHARGE ? e.grossMinor : e.netMinor)]
        .filter(Boolean).some((f) => String(f).toLowerCase().includes(q)))
    : entries;
  const rows = [...matched].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit || matched.length);
  if (q && !rows.length) return (
    <div style={{ padding: "var(--sp-6) var(--sp-5)" }}>
      <StatusBlock state="empty" head={"Nothing matches " + '"' + query + '"'}>
        Search looks at the customer, the amount, the description and the provider reference.
        Try a shorter term, or clear the search to see everything again.
      </StatusBlock>
    </div>
  );
  if (!rows.length) return <Empty head="No activity yet">Once a customer pays, every payment, fee and refund appears here with its own history.</Empty>;
  return (
    <div className="tblwrap"><table className="tbl tbl-c">
      <thead><tr><th>Activity</th><th className="hide-s">Reference</th><th className="hide-s">State</th><th className="hide-s">Date</th><th className="r">Amount</th></tr></thead>
      <tbody>{rows.map((e) => <EntryRow key={e.id} e={e} state={state} onClick={() => go("transaction", { id: e.id })} />)}</tbody>
    </table></div>
  );
}

/* ------------------------------------------------------------------ *
 * Founder screens
 * ------------------------------------------------------------------ */

const STAGE_TONE = { done: "pine", todo: "pine", waiting: "amber", blocked: "clay", locked: "grey", skipped: "grey" };
const STAGE_WORD = { done: "Done", todo: "Your turn", waiting: "Waiting", blocked: "Needs attention",
  locked: "Not open yet", skipped: "Not needed" };

function CapabilityGrid({ state, b }) {
  const caps = capabilities(state, b);
  return (
    <div className="tblwrap"><table className="tbl captbl">
      <thead><tr><th>Status</th><th className="hide-s">What it means</th><th className="r">State</th></tr></thead>
      <tbody>
        {CAPABILITIES.map(([k, label, detail]) => (
          <tr key={k}>
            <td style={{ fontWeight: "var(--fw-med)" }}>{label}</td>
            <td className="hide-s tiny">{detail}</td>
            <td className="r"><span className={"vd " + (caps[k] ? "vd-ok" : "vd-off")}>
              {caps[k] ? "Enabled" : "Not yet"}</span></td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}

const DUE = { past: ["clay", "Overdue"], now: ["amber", "Needed now"], later: ["grey", "Later"] };

function Requirements({ state, b, go, forRole = "founder" }) {
  const reqs = requirements(state, b);
  if (!reqs.length) return (
    <StatusBlock state="success" head="Nothing is outstanding">
      Every step either belongs to you and is done, or belongs to the provider and is not waiting on anyone.
    </StatusBlock>
  );
  const mine = reqs.filter((r) => r.owner === forRole);
  const others = reqs.filter((r) => r.owner !== forRole);
  const Row = ({ r }) => {
    const [tone, word] = DUE[r.due];
    return (
      <div className="reqrow">
        <span className="grow">
          <span className="req-t">{r.label}</span>
          <span className="req-d">{r.detail}</span>
        </span>
        <Badge tone={ACTOR[r.owner].tone}>{ACTOR[r.owner].label}</Badge>
        <span className={"vd vd-" + (tone === "clay" ? "no" : tone === "amber" ? "no" : "off")}>{word}</span>
      </div>
    );
  };
  return (
    <div>
      {mine.length > 0 && <>
        <div className="lbl" style={{ marginBottom: "var(--sp-2)" }}>Waiting on you</div>
        <div className="reqlist">{mine.map((r) => <Row key={r.id} r={r} />)}</div>
      </>}
      {others.length > 0 && <>
        <div className="lbl" style={{ margin: "var(--sp-5) 0 var(--sp-2)" }}>Waiting on someone else</div>
        <div className="reqlist">{others.map((r) => <Row key={r.id} r={r} />)}</div>
      </>}
    </div>
  );
}

function SetupJourney({ state, go, compact }) {
  const b = myBusiness(state);
  const stages = journey(state, b);
  const active = stages.find((x) => ["todo", "blocked"].includes(x.status))
    || stages.find((x) => x.status === "waiting");
  return (
    <div className="card">
      <div className="card-h">
        <h2 className="h4">Setting up {b.name}</h2>
        <span className="tiny">{stages.filter((x) => x.status === "done").length} of {stages.length} complete</span>
      </div>
      {active && (
        <div className="card-b" style={{ borderBottom: "1px solid var(--line-soft)" }}>
          <div className="lbl">Your next step</div>
          <div style={{ fontSize: "var(--fs-5)", fontWeight: "var(--fw-bold)", marginTop: 3 }}>{active.title}</div>
          <p className="small" style={{ marginTop: "var(--sp-2)", maxWidth: "var(--m-body)" }}>{active.detail}</p>
          <div className="row" style={{ marginTop: "var(--sp-4)", gap: "var(--sp-3)", flexWrap: "wrap" }}>
            {active.next && <Btn size="sm" onClick={() => go(active.next.route)}>{active.next.label}</Btn>}
            <Badge tone={ACTOR[active.actor].tone}>{ACTOR[active.actor].waiting}</Badge>
            <span className="tiny">Progress is saved. Nothing is lost if you close this.</span>
          </div>
        </div>
      )}
      {!compact && (
        <div className="card-b">
          <ol className="journey">
            {stages.map((st, i) => (
              <li key={st.id} data-status={st.status}>
                <span className="j-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="grow">
                  <span className="j-t">{st.title}</span>
                  <span className="j-d">{st.detail}</span>
                </span>
                <span className="j-s"><Badge tone={STAGE_TONE[st.status]}>{STAGE_WORD[st.status]}</Badge></span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function NoBusiness({ go }) {
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">You have not set up a business yet</h1>
        <p className="small" style={{ marginTop: 5 }}>The wallet, payouts and guardian pages all belong to a business, so there is nothing to show until you create one.</p></div>
      <div className="card"><div className="card-b">
        <p className="body" style={{ fontSize: "var(--fs-3)" }}>
          It takes about two minutes. You will need a name, one sentence on what a customer is paying for,
          and how you charge. Everything else can change later.
        </p>
        <div className="row" style={{ marginTop: 16 }}><Btn onClick={() => go("signup")}>Create a business</Btn></div>
      </div></div>
    </div>
  );
}

function Dashboard({ state, dispatch, go }) {
  const b = myBusiness(state);
  const rel = relForBiz(state, b.id);
  const acct = acctForBiz(state, b.id);
  const w = foldWallet(state.entries, state.payouts, b.id);
  const entries = state.entries.filter((e) => e.businessId === b.id);
  const t = now(state);

  const guardianDone = !rel || rel.status === "accepted";
  const paymentsDone = acct?.status === "active";
  const hasRevenue = w.revenue > 0;
  const steps = [
    { done: true, label: "Create your business", detail: b.name },
    { done: guardianDone, label: rel ? "Invite your guardian" : "Guardian not required", detail: rel ? (rel.status === "pending" ? "Waiting on " + rel.guardianEmail : rel.status === "accepted" ? rel.guardianName + " is supervising" : rel.status) : "You are the representative", route: "guardian" },
    { done: paymentsDone, label: "Connect payments", detail: ACCOUNT_COPY[acct?.status || "not_started"]?.label, route: "payments" },
    { done: hasRevenue, label: "Take your first payment", detail: hasRevenue ? money(w.revenue) + " earned" : "Nothing yet", route: "wallet" },
  ];
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="stack">
      <div className="page-h">
        <h1 className="d2">{b.name}</h1>
        <p className="small" style={{ marginTop: 4 }}>{b.description}</p>
      </div>

      <div className="card">
        <div className="card-h"><h2 className="h4">What is holding up your launch</h2>
          <span className="tiny">{requirements(state, b).length || "Nothing"} outstanding</span></div>
        <div className="card-b"><Requirements state={state} b={b} go={go} forRole="founder" /></div>
      </div>

      <div className="card">
        <div className="card-h"><h2 className="h4">Where you stand</h2>
          <span className="tiny">Four separate things, not one</span></div>
        <CapabilityGrid state={state} b={b} />
        <div className="card-f"><p className="tiny" style={{ maxWidth: "var(--m-wide)" }}>
          These do not move together. An account can take payments while payouts are still blocked, and
          it can have every detail submitted while charges are off. The provider treats them separately,
          so we do too.
        </p></div>
      </div>

      <SetupJourney state={state} go={go} />

      {false && nextStep && (
        <Notice tone={rel?.status === "declined" || acct?.status === "restricted" ? "clay" : "amber"}
          head={rel?.status === "pending" ? "Waiting on your guardian" : rel?.status === "declined" ? "Your guardian declined" : "Next: " + nextStep.label}
          action={nextStep.route && <Btn size="sm" onClick={() => go(nextStep.route)}>
            {rel?.status === "pending" ? "See invitation status" : rel?.status === "declined" ? "Invite someone else" : "Continue"}
          </Btn>}>
          {rel?.status === "pending"
            ? <>The invitation went to {rel.guardianEmail} {ago(rel.sentAt, t)}. It expires {untilDays(rel.expiresAt, t)}. You can keep building while you wait, you just can't take payments yet.</>
            : rel?.status === "declined"
            ? <>{rel.guardianName} declined the invitation, so {b.name} can't take payments. You can invite a different adult.</>
            : <>{nextStep.detail}</>}
        </Notice>
      )}

      {w.revenue > 0 && <div className="card">
        <div className="card-h"><h2 className="h4">Wallet</h2><Btn variant="q" size="sm" onClick={() => go("wallet")}>Open wallet</Btn></div>
        <div className="card-b">
          <div className="lbl">Available to pay out</div>
          <div className="d2 num" style={{ marginTop: 2 }}>{money(w.available)}</div>
          <div className="tiny" style={{ marginTop: 4 }}>{money(w.revenue)} in gross sales since you started</div>
          <div style={{ marginTop: 16 }}><PositionBand w={w} compact /></div>
          {w.revenue > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="lbl" style={{ marginBottom: 8 }}>Gross sales, last 30 days</div>
              <SalesChart entries={entries} nowMs={t} height={80} />
            </div>
          )}
          <div className="grid-4" style={{ marginTop: 18, border: "1px solid var(--line)", borderRadius: 7, overflow: "hidden" }}>
            <Stat label="Available" value={money(w.available)} tone="pine" />
            <Stat label="Pending" value={money(w.pending)} tone="amber" />
            <Stat label="Fees" value={money(-w.fees)} />
            <Stat label="Refunds" value={money(-w.refunds)} />
          </div>
        </div>
      </div>}

      {w.revenue > 0 && <div className="card">
        <div className="card-h"><h2 className="h4">Recent activity</h2><Btn variant="q" size="sm" onClick={() => go("wallet")}>See all</Btn></div>
        <LedgerTable entries={entries} state={state} go={go} limit={6} />
      </div>}

    </div>
  );
}

function WalletPage({ state, go }) {
  const [q, setQ] = useState("");
  const b = myBusiness(state);
  const w = foldWallet(state.entries, state.payouts, b.id);
  const entries = state.entries.filter((e) => e.businessId === b.id);
  const t = now(state);
  // Period performance is a different question from current balances, so it is
  // computed and displayed separately rather than folded into one number.
  const since = t - 30 * DAY;
  const period = entries.filter((e) => e.createdAt >= since).reduce((a, e) => ({
    gross: a.gross + (e.kind === KIND.CHARGE ? e.grossMinor : 0),
    fees: a.fees + (e.kind === KIND.CHARGE ? e.feeMinor : 0),
    refunds: a.refunds - (e.kind === KIND.REFUND ? e.netMinor : 0),
  }), { gross: 0, fees: 0, refunds: 0 });
  const periodNet = period.gross - period.fees - period.refunds;
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Wallet</h1>
        <p className="small" style={{ marginTop: 4 }}>What {b.name} sold, and where that money is right now. Two different questions.</p></div>

      <div className="card">
        <div className="card-h">
          <h2 className="h4">Money right now</h2>
          <span className="tiny">Mirrored from the payment provider · {fTime(t)}</span>
        </div>
        <div className="card-b">
          <div className="lbl">Available to pay out</div>
          <div className="num" style={{ fontSize: "var(--fs-9)", letterSpacing: "-0.032em", marginTop: 2 }}>{money(w.available)}</div>
          <div style={{ marginTop: 20 }}><PositionBand w={w} /></div>
        </div>
        <div className="card-f">
          <div className="row-b" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="tiny">The provider's figures are the real ones. Veyro mirrors them and shows the working.</span>
            <Badge tone={w.balances ? "pine" : "clay"} dot>{w.balances ? "Matches the ledger" : "Does not match"}</Badge>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h2 className="h4">Last 30 days</h2><span className="tiny">{fDate(since)} to {fDate(t)}</span></div>
        {period.gross > 0 && <div className="card-b" style={{ paddingBottom: 8 }}><SalesChart entries={entries} nowMs={t} height={100} /></div>}
        <div className="grid-4" style={{ borderTop: "1px solid var(--line-soft)" }}>
          <Stat label="Gross sales" value={money(period.gross)} sub="What customers paid" />
          <Stat label="Provider fees" value={money(-period.fees)} sub="Kept by the processor" />
          <Stat label="Refunds" value={money(-period.refunds)} sub="Returned to customers" />
          <Stat label="Net after fees" value={money(periodNet)} sub="Not profit, see below" />
        </div>
        <div className="card-f">
          <p className="tiny" style={{ maxWidth: "var(--m-wide)" }}>
            Net after fees is not profit and it is not what you can spend. It does not include hosting, tools, anything
            you bought for the business, or tax. Whether any of this is taxable, and on whose return, depends on the
            account arrangement, that is a question for whoever does your household's taxes.
          </p>
        </div>
      </div>

      {!w.balances && (
        <StatusBlock state="error" head="We have paused payout requests while we check these figures"
          refId={b.id.slice(0, 12)}>
          Your balances and your transaction history disagree. That usually means an update from the payment
          provider arrived out of order or applied only partly. Nothing is lost, no money has moved, and your
          history is unchanged. We have paused payout requests in Veyro only. This does not freeze anything at
          the payment provider. We are notified automatically and you do not need to do anything.
        </StatusBlock>
      )}

      {w.held > 0 && (
        <Notice tone="clay" head={money(w.held) + " is on hold"}>
          A customer disputed a payment, so the payment provider is holding that amount while it reviews the case.
          You can't pay it out until the dispute closes. If it's resolved in your favour the money returns to your available balance.
        </Notice>
      )}

      <div className="card">
        <div className="card-h">
          <h2 className="h4">All activity</h2>
          <div className="searchbar">
            <label htmlFor="ledger-q" className="tiny">Search</label>
            <input id="ledger-q" className="input" value={q} onChange={(e) => setQ(cap(e.target.value, 60))}
              placeholder="Customer, amount or reference" type="search" />
            <span className="tiny">{entries.length}</span>
          </div>
        </div>
        <LedgerTable entries={entries} state={state} go={go} query={q} />
      </div>
    </div>
  );
}

function TransactionPage({ state, dispatch, go, id }) {
  const e = state.entries.find((x) => x.id === id);
  if (!e) return <Empty head="Transaction not found" action={<Btn variant="2" onClick={() => go("wallet")}>Back to wallet</Btn>}>It may have been part of a sandbox reset.</Empty>;
  const b = bizById(state, e.businessId);
  const t = now(state);
  const isCharge = e.kind === KIND.CHARGE;
  const children = state.entries.filter((x) => x.parentId === e.id);
  const refundable = isCharge && e.status !== "refunded" && e.status !== "disputed" && e.grossMinor - e.refundedMinor > 0;

  const stages = isCharge ? [
    { on: true, label: "Payment received", at: e.createdAt, note: money(e.grossMinor) + " charged to the customer" },
    { on: true, label: "Processor fee taken", at: e.createdAt, note: money(e.feeMinor) + " kept by the payment provider" },
    { on: e.bucket === "available", label: e.bucket === "pending" ? "Settling" : e.bucket === "held" ? "Held by the provider" : "Available", at: e.availableOn,
      note: e.bucket === "pending" ? "Becomes available " + untilDays(e.availableOn, t) + " (" + fFull(e.availableOn) + ")"
        : e.bucket === "held" ? "Frozen until the dispute is decided" : "Released on " + fFull(e.availableOn) },
  ] : [{ on: true, label: KIND_LABEL[e.kind], at: e.createdAt, note: e.description }];

  return (
    <div className="stack">
      <Btn variant="q" size="sm" onClick={() => go("wallet")}>Back to wallet</Btn>
      <div className="page-h">
        <div className="row-b" style={{ alignItems: "flex-start" }}>
          <div>
            <h1 className="d2">{money(isCharge ? e.grossMinor : Math.abs(e.netMinor))}</h1>
            <p className="small" style={{ marginTop: 4 }}>{KIND_LABEL[e.kind]}{e.customer ? " from " + e.customer : ""} · {fTime(e.createdAt)}</p>
          </div>
          {refundable && <Btn variant="2" size="sm" onClick={() => dispatch({ type: "sim/refund", entryId: e.id })}>Refund this payment</Btn>}
        </div>
      </div>

      {e.status === "disputed" && (
        <Notice tone="clay" head="This payment is being disputed">
          The customer asked their bank to reverse it. The payment provider is holding {money(e.netMinor)} while it reviews the case,
          which usually takes a few weeks. Nothing is required from you yet.
        </Notice>
      )}

      <div className="card">
        <div className="card-h"><h2 className="h4">Breakdown</h2><Badge tone="grey">Sandbox</Badge></div>
        <div className="card-b">
          {isCharge ? (
            <div>
              <div className="row-b" style={{ padding: "7px 0" }}><span className="small">Customer paid</span><Amt v={e.grossMinor} /></div>
              <div className="row-b" style={{ padding: "7px 0", borderTop: "1px solid var(--line-soft)" }}><span className="small">Processor fee</span><Amt v={-e.feeMinor} /></div>
              {e.refundedMinor > 0 && <div className="row-b" style={{ padding: "7px 0", borderTop: "1px solid var(--line-soft)" }}><span className="small">Refunded</span><Amt v={-e.refundedMinor} /></div>}
              <div className="row-b" style={{ padding: "10px 0 0", borderTop: "1px solid var(--line)", marginTop: 4 }}>
                <span style={{ fontWeight: 500 }}>Your net</span><Amt v={e.netMinor - e.refundedMinor} className="" />
              </div>
              {e.refundedMinor > 0 && <p className="tiny" style={{ marginTop: 10 }}>Processor fees are not returned when you refund a customer, so a refunded payment costs the business the fee.</p>}
            </div>
          ) : (
            <div className="row-b"><span className="small">{e.description}</span><Amt v={e.netMinor} signed /></div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h2 className="h4">History</h2></div>
        <div className="card-b">
          <ul className="tl">
            {stages.map((s, i) => (
              <li key={i}><span className="pt" data-on={s.on ? "1" : "0"} />
                <div><div style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>{s.label}</div><div className="tiny" style={{ marginTop: 2 }}>{s.note}</div></div>
              </li>
            ))}
          </ul>
          {children.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
              <div className="lbl" style={{ marginBottom: 6 }}>Related entries</div>
              {children.map((c) => (
                <button key={c.id} onClick={() => go("transaction", { id: c.id })} className="row-b" style={{ width: "100%", background: "none", border: 0, padding: "6px 0", cursor: "pointer" }}>
                  <span className="small">{KIND_LABEL[c.kind]} · {fDate(c.createdAt)}</span><Amt v={c.netMinor} signed />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="card-f">
          <div className="row-b" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="mono ink3">{e.providerRef} · business {b.id} · simulated</span>
            <CopyButton value={e.providerRef} label="Copy reference" />
          </div>
        </div>
      </div>
    </div>
  );
}

const PAYOUT_STATUS = {
  awaiting_approval: ["amber", "Waiting for approval"], in_transit: ["slate", "In transit"], paid: ["pine", "Paid"],
  failed: ["clay", "Failed"], declined: ["clay", "Declined"], canceled: ["grey", "Canceled"],
};

function PayoutsPage({ state, dispatch, go }) {
  const b = myBusiness(state);
  const acct = acctForBiz(state, b.id);
  const rel = relForBiz(state, b.id);
  const w = foldWallet(state.entries, state.payouts, b.id);
  const provider = getProvider(acct?.providerId || "sandbox");
  const list = state.payouts.filter((p) => p.businessId === b.id).sort((a, c) => c.requestedAt - a.requestedAt);
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState("");
  const [err, setErr] = useState("");
  const min = provider.capabilities.minPayoutMinor;
  const ready = acct?.status === "active" && w.balances;

  const [busy, send] = useAction(() => {
    const minor = Math.round((parseFloat(amt) || 0) * 100);
    dispatch({ type: "payout/request", businessId: b.id, amountMinor: minor, destination: acct.destination.bankName + " ••" + acct.destination.last4 });
    setOpen(false); setAmt(""); setErr("");
  });
  const submit = () => {
    const minor = Math.round((parseFloat(amt) || 0) * 100);
    if (!minor) return setErr("Enter how much you want to pay out.");
    if (minor < min) return setErr("The smallest payout this provider allows is " + money(min, { round: true }) + ".");
    if (minor > w.available) return setErr("You only have " + money(w.available) + " available. Pending money can't be paid out yet.");
    send();
  };

  return (
    <div className="stack">
      <div className="page-h"><div className="row-b" style={{ alignItems: "flex-start" }}>
        <div><h1 className="d2">Payouts</h1><p className="small" style={{ marginTop: 4 }}>Moving available money from the payment provider to a bank account.</p></div>
        <Btn onClick={() => setOpen(true)} disabled={!ready || w.available < min}>Request a payout</Btn>
      </div></div>

      {acct?.status === "active" && !w.balances && (
        <Notice tone="clay" head="Payouts are paused while we check your figures">
          Your balances and your transaction history disagree, so we won't move money until that's resolved. Nothing
          is lost. We're already notified. Your wallet and history stay visible in the meantime.
        </Notice>
      )}

      {!ready && acct?.status !== "active" && <Notice tone="amber" head="Payouts aren't available yet"
        action={<Btn size="sm" onClick={() => go("payments")}>Go to payments</Btn>}>
        {ACCOUNT_COPY[acct?.status || "not_started"].body}
      </Notice>}

      {ready && w.available < min && w.pending > 0 && (
        <Notice tone="grey" head={"You have " + money(w.available) + " available"}>
          {money(w.pending)} is still settling with {provider.name}. Card payments become available after {provider.capabilities.settlementDays} business
          days so refunds and disputes can be handled first. The smallest payout allowed is {money(min, { round: true })}.
        </Notice>
      )}

      <div className="card">
        <div className="card-h"><h2 className="h4">Destination</h2>{acct?.destination && <Badge tone="pine" dot>Verified</Badge>}</div>
        <div className="card-b">
          {acct?.destination ? (
            <div className="row-b">
              <div><div style={{ fontSize: "var(--fs-3)" }}>{acct.destination.bankName} ••{acct.destination.last4}</div>
                <div className="tiny" style={{ marginTop: 2 }}>Held by {acct.destination.holder}{rel?.guardianId ? " (your guardian)" : ""} · arrives in {provider.capabilities.payoutSpeed}</div></div>
            </div>
          ) : <div className="small">No bank account is connected yet. Your guardian adds this when they connect the payment account.</div>}
        </div>
      </div>

      {list[0] && list[0].status === "paid" && (
        <StatusBlock state="success" head={money(list[0].amountMinor) + " arrived at " + list[0].destination}>
          Completed {fFull(list[0].completedAt)}. It can take a further working day to appear on a bank statement.
        </StatusBlock>
      )}

      <div className="card">
        <div className="card-h"><h2 className="h4">History</h2></div>
        {list.length === 0 ? (
          <div style={{ padding: "var(--sp-6) var(--sp-5)" }}>
            <StatusBlock state="empty" head="No payouts yet">
              Once money has settled with the payment provider it becomes available, and you can request a payout.
              Every request and every approval will be listed here with its full status.
            </StatusBlock>
          </div>
        ) : (
          <div className="tblwrap"><table className="tbl"><thead><tr><th>Requested</th><th className="hide-s">Destination</th><th>Status</th><th className="r">Amount</th></tr></thead>
            <tbody>{list.map((p) => {
              const [tone, label] = PAYOUT_STATUS[p.status] || ["grey", p.status];
              return (
                <tr key={p.id}>
                  <td><div style={{ fontWeight: 500 }}>{fFull(p.requestedAt)}</div><div className="tiny">{p.completedAt ? (p.status === "paid" ? "Arrived " + fDate(p.completedAt) : fDate(p.completedAt)) : "In progress"}</div></td>
                  <td className="hide-s tiny">{p.destination}</td>
                  <td><Badge tone={tone} dot={tone !== "grey"}>{label}</Badge>
                    {p.failure && <div className="tiny" style={{ marginTop: 4, maxWidth: "var(--m-tight)" }}>{p.failure} The money is back in your available balance.</div>}
                    {p.status === "awaiting_approval" && <div className="tiny" style={{ marginTop: 4 }}>Sent to {rel?.guardianName || "your guardian"}</div>}
                  </td>
                  <td className="r"><Amt v={p.amountMinor} /></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </div>

      {open && (
        <Modal title="Request a payout" onClose={() => setOpen(false)}
          footer={<div className="row"><Btn onClick={submit} disabled={busy} aria-busy={busy}>
            {busy ? "Contacting the provider" : "Request payout"}</Btn>
            <Btn variant="2" onClick={() => setOpen(false)} disabled={busy}>Cancel</Btn></div>}>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="row-b"><span className="small">Available now</span><Amt v={w.available} /></div>
            <div className="row-b" style={{ marginTop: 6 }}><span className="small">Still settling</span><span className="num ink3">{money(w.pending)}</span></div>
          </div>
          <Field label="Amount" error={err} hint={"Between " + money(min, { round: true }) + " and " + money(w.available) + "."}>
            <input className={"input" + (err ? " bad" : "")} inputMode="decimal" value={amt} placeholder="0.00"
              onChange={(e) => { setAmt(e.target.value.replace(/[^\d.]/g, "")); setErr(""); }} />
          </Field>
          <div className="row" style={{ gap: 6, marginBottom: 14 }}>
            <Btn variant="2" size="sm" onClick={() => setAmt((w.available / 100).toFixed(2))}>All available</Btn>
            {[50, 100].filter((v) => usd(v) <= w.available).map((v) => <Btn key={v} variant="2" size="sm" onClick={() => setAmt(String(v))}>${v}</Btn>)}
          </div>
          <div className="small">
            Going to {acct?.destination?.bankName} ••{acct?.destination?.last4}, arriving in {provider.capabilities.payoutSpeed}.
            {rel?.status === "accepted" && rel.policy.approvePayouts && <> {rel.guardianName} approves it first, and the request and their decision are both recorded.</>}
          </div>
        </Modal>
      )}
    </div>
  );
}

function PaymentsPage({ state, dispatch, go }) {
  const b = myBusiness(state);
  const acct = acctForBiz(state, b.id);
  const rel = relForBiz(state, b.id);
  const [choice, setChoice] = useState(acct?.providerId || "sandbox");
  const copy = ACCOUNT_COPY[acct?.status] || ACCOUNT_COPY.not_started;
  const guardianReady = !rel || rel.status === "accepted";

  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Payments</h1>
        <p className="small" style={{ marginTop: 4 }}>The regulated provider that takes customer money and holds it until payout.</p></div>

      {acct?.status === "awaiting_guardian" ? (
        <Notice tone="amber" head="Waiting for your guardian">
          {rel?.guardianName} needs to complete the provider's identity checks and confirm they'll be the responsible adult on the account.
          They have a task waiting in their Veyro account.
        </Notice>
      ) : acct?.status === "pending" ? (
        <Notice tone="amber" head="Verification in progress"
          action={<Btn size="sm" onClick={() => dispatch({ type: "account/set", businessId: b.id, patch: { status: "active", representativeUserId: state.session.userId, destination: { bankName: "Community Savings Bank", last4: "8290", holder: me(state).name, status: "verified" } }, notifyFounder: { title: "Payments are live", body: "Your payment account is connected. You can start selling." } })}>Simulate approval</Btn>}>
          {getProvider(acct.providerId).name} is checking your identity and business details. This usually finishes within a day, and you'll be told either way.
        </Notice>
      ) : acct?.status === "requirements_due" ? (
        <Notice tone="amber" head="The provider needs more information"
          action={<Btn size="sm" onClick={() => dispatch({ type: "account/set", businessId: b.id, patch: { status: "active", requirements: [] }, notifyFounder: { title: "Verification complete", body: "Payouts are enabled again." } })}>Mark as resolved</Btn>}>
          Payments still work, but payouts are paused until it's resolved. The provider asked for: {(acct.requirements || []).join(", ") || "additional identity documents"}.
          Your guardian can upload this from the provider's secure form.
        </Notice>
      ) : acct?.status === "restricted" ? (
        <Notice tone="clay" head="Payments are paused">
          The provider restricted this account, usually after a change in the business or an unresolved verification request.
          New payments are declined. Money already settled is unaffected and can still be paid out once the restriction is lifted.
        </Notice>
      ) : !guardianReady ? (
        <Notice tone="amber" head="Invite a guardian first" action={<Btn size="sm" onClick={() => go("guardian")}>Go to guardian</Btn>}>
          Because you're under 18, an adult has to be the representative on the payment account. Payment setup opens once they accept.
        </Notice>
      ) : null}

      <div className="card">
        <div className="card-h"><h2 className="h4">Payment account</h2>
          <Badge tone={copy.tone} dot={copy.tone !== "grey"}>{copy.label}</Badge></div>
        <div className="card-b">
          <div style={{ fontSize: "var(--fs-4)", fontWeight: 500 }}>{copy.head}</div>
          <p className="small" style={{ marginTop: 5 }}>{copy.body}</p>
          {acct?.status === "active" && (
            <div className="grid-2" style={{ marginTop: 16 }}>
              <div className="panel"><div className="lbl">Provider</div><div style={{ fontSize: "var(--fs-3)", marginTop: 3 }}>{getProvider(acct.providerId).name}</div>
                <div className="tiny" style={{ marginTop: 4 }}>Settles in {getProvider(acct.providerId).capabilities.settlementDays} business days</div></div>
              <div className="panel"><div className="lbl">Responsible adult</div><div style={{ fontSize: "var(--fs-3)", marginTop: 3 }}>{userById(state, acct.representativeUserId)?.name || ", "}</div>
                <div className="tiny" style={{ marginTop: 4 }}>Verified by the provider, not by Veyro</div></div>
            </div>
          )}
        </div>
        {acct?.status === "active" && (
          <div className="card-f"><div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <Btn variant="2" size="sm" onClick={() => dispatch({ type: "account/set", businessId: b.id, patch: { status: "requirements_due", requirements: ["proof of address for the representative"] }, notifyFounder: { title: "Action needed on your payment account", body: "The provider asked for proof of address. Payouts are paused until it's provided." } })}>Simulate a verification request</Btn>
            <Btn variant="2" size="sm" onClick={() => dispatch({ type: "account/set", businessId: b.id, patch: { status: "disconnected" }, notifyFounder: { title: "Processor disconnected", body: "No new payments can be taken until you reconnect." } })}>Simulate a disconnect</Btn>
          </div></div>
        )}
      </div>

      <div className="card">
        <div className="card-h"><h2 className="h4">Why this provider and not another</h2>
          <span className="tiny">Checked 5 September 2026</span></div>
        <div className="tblwrap"><table className="tbl provtbl">
          <thead><tr>
            <th>Provider</th><th>Route under 18</th><th className="hide-s">Fee</th>
            <th className="hide-s">How we know</th>
          </tr></thead>
          <tbody>
            {PROVIDER_COMPARISON.map((pv) => {
              const [tone, label] = EVIDENCE_LABEL[pv.evidence];
              return (
                <tr key={pv.name}>
                  <td>
                    <div style={{ fontWeight: "var(--fw-med)" }}>{pv.name}</div>
                    <div className="tiny" style={{ marginTop: 2, maxWidth: "var(--m-lead)" }}>{pv.detail}</div>
                  </td>
                  <td>
                    <span className={"vd " + (pv.route === "yes" ? "vd-ok" : pv.route === "no" ? "vd-no" : "vd-off")}>
                      {pv.route === "yes" ? "Yes" : pv.route === "no" ? "No" : "Unknown"}
                    </span>
                  </td>
                  <td className="hide-s num tiny">{pv.fee}</td>
                  <td className="hide-s"><Badge tone={tone}>{label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        <div className="card-f">
          <p className="small" style={{ maxWidth: "var(--m-wide)", marginBottom: "var(--sp-3)" }}>
            <strong>Two different models above.</strong> A processor moves your money and you are the
            seller. A merchant of record becomes the seller, so they carry sales tax, VAT and
            chargebacks for you. That is genuinely valuable and it costs roughly three times as much:
            on a $10 sale, about $1.00 against a processor's $0.59. We have found no evidence that any
            merchant of record permits a seller under 18, so none is marked as a route.
          </p>
          <p className="tiny" style={{ maxWidth: "var(--m-wide)" }}>
            We support one route properly rather than five badly. Every provider above sits behind the
            same interface in our code, so adding another is a day's work, but only once the first has
            real users. Fees change; if a figure here looks wrong, check the provider's own pricing page
            and tell us.
          </p>
        </div>
      </div>

      {(!acct || ["not_started", "disconnected"].includes(acct.status)) && guardianReady && (
        <div className="card">
          <div className="card-h"><h2 className="h4">Choose a provider</h2></div>
          <div className="card-b">
            <div className="stack">
              {PROVIDERS.map((p) => (
                <div key={p.id}>
                  <Choice on={choice === p.id} onClick={() => p.implemented && setChoice(p.id)}
                    title={p.name + (p.implemented ? "" : " \u00B7 not available in this build")} sub={p.blurb} />
                  {choice === p.id && p.implemented && (() => {
                    const c = PROVIDER_COMPARISON.find((x) => p.name.indexOf(x.name) === 0);
                    return c ? (
                      <div className="panel" style={{ marginTop: "var(--sp-3)" }}>
                        <div className="lbl">What is good about it</div>
                        <p className="small" style={{ marginTop: 2 }}>{c.good}</p>
                        <div className="lbl" style={{ marginTop: "var(--sp-3)" }}>What you are accepting</div>
                        <p className="small" style={{ marginTop: 2 }}>{c.bad}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="h4">What happens next</div>
              <p className="small" style={{ marginTop: 6 }}>
                {rel ? `${rel.guardianName} gets a request in their Veyro account. They complete the provider's identity checks and add the bank account payouts go to. Veyro never sees their documents.` : "You complete the provider's identity checks and add a bank account for payouts."}
              </p>
            </div>
          </div>
          <div className="card-f"><Btn onClick={() => dispatch({ type: "account/request", businessId: b.id, providerId: choice })}>
            {rel ? "Send to " + (rel.guardianName || "your guardian") : "Start verification"}</Btn></div>
        </div>
      )}
    </div>
  );
}

function GuardianPage({ state, dispatch, go }) {
  const b = myBusiness(state);
  const rel = relForBiz(state, b.id);
  const [invite, setInvite] = useState(false);
  const [f, setF] = useState({ name: "", email: "", relation: "Parent" });
  const t = now(state);
  const tones = { pending: "amber", accepted: "pine", declined: "clay", expired: "grey", ended: "clay", revoked: "grey" };
  const labels = { pending: "Invitation sent", accepted: "Supervising", declined: "Declined",
    expired: "Expired", ended: "Ended", revoked: "Revoked" };
  const stale = consentStale(state, b.id);

  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Guardian</h1>
        <p className="small" style={{ marginTop: 4 }}>The adult who is the responsible representative on your payment account.</p></div>

      {!rel ? (
        <Card title="No guardian on this business"><div className="small" style={{ marginBottom: 14 }}>You're old enough to hold the payment account yourself. You can still invite someone to supervise.</div>
          <Btn onClick={() => setInvite(true)}>Invite a guardian</Btn></Card>
      ) : (
        <>
          <div className="card">
            <div className="card-h"><h2 className="h4">{rel.guardianName}</h2><Badge tone={tones[rel.status]} dot>{labels[rel.status]}</Badge></div>
            <div className="card-b">
              <div className="grid-2">
                <div><div className="lbl">Email</div><div style={{ fontSize: "var(--fs-3)", marginTop: 2 }}>{rel.guardianEmail}</div></div>
                <div><div className="lbl">Relationship</div><div style={{ fontSize: "var(--fs-3)", marginTop: 2 }}>{rel.relation}</div></div>
              </div>
              {rel.status === "pending" && (
                <div style={{ marginTop: 18 }}>
                  <Notice tone="amber" head={"Invitation sent " + ago(rel.sentAt, t)}>
                    It expires {untilDays(rel.expiresAt, t)}. If they can't find it, resend it or check the address is right.
                  </Notice>
                  <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                    <Btn size="sm" onClick={() => go("invite", { id: rel.id })}>Open the invitation they received</Btn>
                    <Btn variant="2" size="sm" onClick={() => dispatch({ type: "guardian/invite", businessId: b.id, name: rel.guardianName, email: rel.guardianEmail, relation: rel.relation })}>Resend</Btn>
                    <Btn variant="2" size="sm" onClick={() => setInvite(true)}>Invite someone else</Btn>
                    <Btn variant="d" size="sm" onClick={() => dispatch({ type: "guardian/revoke", relId: rel.id })}>Revoke the link</Btn>
                    <Btn variant="q" size="sm" onClick={() => dispatch({ type: "guardian/expire", relId: rel.id })}>Simulate expiry</Btn>
                  </div>
                </div>
              )}
              {(rel.status === "declined" || rel.status === "expired" || rel.status === "ended") && (
                <div style={{ marginTop: 18 }}>
                  <Notice tone="clay" head={rel.status === "ended" ? "Supervision ended" : rel.status === "expired" ? "The invitation expired" : rel.guardianName + " declined"}>
                    {b.name} can't take new payments without a responsible adult on the account. Money already earned is unaffected.
                    Invite another adult to continue.
                  </Notice>
                  <div className="row" style={{ marginTop: 12 }}><Btn size="sm" onClick={() => setInvite(true)}>Invite someone else</Btn></div>
                </div>
              )}
            </div>
          </div>

          {stale && (
            <StatusBlock state="error" head="Your guardian agreed to a different version of this business">
              You changed {stale.join(" and ")} after {rel.guardianName} agreed. Their consent record
              covers what they were shown on {fFull(rel.consent.acceptedAt)}, not what the business is
              now. We have asked them to look again. Nothing is blocked, but the record is out of date
              until they confirm.
            </StatusBlock>
          )}

          {rel.status === "accepted" && (
            <Card title="What they approve">
              <ul className="tl">
                <li><span className="pt" data-on="1" /><div><div style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>Payouts</div>
                  <div className="tiny">{rel.policy.approvePayouts ? (rel.policy.thresholdMinor > 0 ? "Anything above " + money(rel.policy.thresholdMinor, { round: true }) : "Every payout") : "No approval needed"}</div></div></li>
                <li><span className="pt" data-on="1" /><div><div style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>Changing payment provider</div>
                  <div className="tiny">{rel.policy.approveProviderChanges ? "Needs their approval" : "You can change it yourself"}</div></div></li>
                <li><span className="pt" data-on="0" /><div><div style={{ fontSize: "var(--fs-3)", fontWeight: 500 }}>Day-to-day business decisions</div>
                  <div className="tiny">Yours alone. Pricing, product, customers.</div></div></li>
              </ul>
              <p className="tiny" style={{ marginTop: 14 }}>
                Only your guardian can change these settings, from their own account. Approvals here are an agreement
                between you and them plus a permanent record, they are not a technical lock on the Stripe account,
                and Veyro doesn't pretend otherwise.
              </p>
            </Card>
          )}
        </>
      )}

      {invite && (
        <Modal title="Invite a guardian" onClose={() => setInvite(false)}
          footer={<div className="row">
            <Btn disabled={!f.email.includes("@") || f.name.trim().length < 2}
              onClick={() => { dispatch({ type: "guardian/invite", businessId: b.id, ...f }); setInvite(false); setF({ name: "", email: "", relation: "Parent" }); }}>Send invitation</Btn>
            <Btn variant="2" onClick={() => setInvite(false)}>Cancel</Btn></div>}>
          <p className="small" style={{ marginBottom: 16 }}>They'll get one email explaining what Veyro is, what you're building, and exactly what they're agreeing to.</p>
          <Field label="Their name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Rania Haddad" /></Field>
          <Field label="Their email"><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="parent@example.com" /></Field>
          <Field label="Relationship"><select className="select" value={f.relation} onChange={(e) => setF({ ...f, relation: e.target.value })}>
            {["Parent", "Legal guardian", "Other relative", "Other trusted adult"].map((r) => <option key={r}>{r}</option>)}</select></Field>
        </Modal>
      )}
    </div>
  );
}

function CheckoutPage({ state, dispatch, go }) {
  const b = myBusiness(state);
  const acct = acctForBiz(state, b.id);
  const kind = b.checkoutKind;
  const inst = b.integration || "not_started";
  const t = b.launchTest;
  const passed = t && t.checks.every((c) => c.ok);
  const [server, setServer] = useState(false);
  const [busy, run] = useAction(() => dispatch({ type: "checkout/test", businessId: b.id, serverFulfilment: server }));

  if (acct?.status !== "active") return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Connect payments to your app</h1></div>
      <StatusBlock state="empty" head="Not open yet"
        action={<Btn size="sm" onClick={() => go("payments")}>Go to payments</Btn>}>
        This opens once the payment account is live. Your progress is saved.
      </StatusBlock>
    </div>
  );

  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Connect payments to your app</h1>
        <p className="small" style={{ marginTop: 5 }}>
          A verified account does not take money on its own. Something in your app has to start the
          purchase, and something has to deliver what was bought.
        </p></div>

      <div className="card">
        <div className="card-h"><h2 className="h4">1. What did you build?</h2>
          {kind && <Badge tone="pine">Chosen</Badge>}</div>
        <div className="card-b"><div className="stack">
          {CHECKOUT_KINDS.map(([k, title, sub]) => (
            <Choice key={k} on={kind === k} title={title} sub={sub}
              onClick={() => dispatch({ type: "checkout/kind", businessId: b.id, kind: k })} />
          ))}
        </div></div>
      </div>

      {kind && (
        <div className="card">
          <div className="card-h"><h2 className="h4">2. Install it</h2>
            {inst === "installed" && <Badge tone="pine">Installed</Badge>}</div>
          <div className="card-b">
            <p className="small">
              One supported path, not ten. {kind === "button" || kind === "download"
                ? "A hosted payment link covers this. You paste one URL into your app and the provider hosts the checkout page."
                : "This needs your own server. You must identify who paid, confirm it server-side, and unlock the right account."}
            </p>
            <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
              <div className="lbl" style={{ marginBottom: "var(--sp-2)" }}>What you will need</div>
              <ul className="arrowlist">
                <li>A checkout that opens from your app</li>
                <li>A webhook endpoint on your server that listens for the payment</li>
                {kind !== "button" && <li>A way to match the payment to a customer account</li>}
                {kind === "subscription" && <li>Handling for renewal, failed payment and cancellation</li>}
                <li>An idempotency key so a repeated event is ignored</li>
              </ul>
              <p className="tiny" style={{ marginTop: "var(--sp-3)" }}>
                Never put a secret key in a prompt, a client bundle, or a repository. Only the publishable
                key belongs in your app.
              </p>
            </div>
          </div>
          {inst !== "installed" && (
            <div className="card-f">
              <Btn size="sm" onClick={() => dispatch({ type: "checkout/installed", businessId: b.id })}>
                I have installed it
              </Btn>
            </div>
          )}
        </div>
      )}

      {inst === "installed" && (
        <div className="card">
          <div className="card-h"><h2 className="h4">3. Test the purchase</h2>
            {t && <Badge tone={passed ? "pine" : "clay"}>{t.checks.filter((c) => c.ok).length} of 6 passed</Badge>}</div>
          <div className="card-b">
            <p className="small">
              A success screen proves the browser reached a page. It does not prove the customer received
              anything. These six checks are the difference.
            </p>
            <div style={{ marginTop: "var(--sp-4)" }}>
              <Choice on={server} onClick={() => setServer(!server)}
                title="My app confirms payments on the server"
                sub="A webhook endpoint, not just the browser returning to a success URL." />
            </div>
            {t && (
              <div style={{ marginTop: "var(--sp-5)", borderTop: "1px solid var(--ink)" }}>
                {t.checks.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: "var(--sp-3)", padding: "var(--sp-3) 0",
                    borderBottom: "1px solid var(--line)" }}>
                    <span className={"sb-mark sb-mark-" + (c.ok ? "pine" : "clay")} style={{ marginTop: 5 }} aria-hidden="true" />
                    <span className="grow">
                      <span style={{ display: "block", fontSize: "var(--fs-3)", fontWeight: "var(--fw-med)" }}>{c.label}</span>
                      <span className="tiny" style={{ display: "block", marginTop: 2 }}>{c.why || c.detail}</span>
                    </span>
                    <span className="tiny" style={{ color: c.ok ? "var(--pine)" : "var(--clay)", fontWeight: "var(--fw-med)" }}>
                      {c.ok ? "Pass" : "Fail"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-f">
            <Btn size="sm" onClick={run} disabled={busy} aria-busy={busy}>
              {busy ? "Running the checks" : t ? "Run the checks again" : "Run the launch check"}
            </Btn>
          </div>
        </div>
      )}

      {passed && (
        <StatusBlock state="success" head="Ready to sell"
          action={<Btn size="sm" onClick={() => go("wallet")}>Open your wallet</Btn>}>
          Payment and delivery both verified. Real sales will appear in your wallet with the provider's
          fee shown on every one.
        </StatusBlock>
      )}
    </div>
  );
}

function BusinessPage({ state, dispatch }) {
  const b = myBusiness(state);
  const [f, setF] = useState({ name: b.name, url: b.url, description: b.description, price: (b.priceMinor / 100).toString(), model: b.model, type: b.type });
  const dirty = f.name !== b.name || f.url !== b.url || f.description !== b.description || f.model !== b.model || f.type !== b.type || Math.round(parseFloat(f.price || 0) * 100) !== b.priceMinor;
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Business</h1>
        <p className="small" style={{ marginTop: 4 }}>What you sell, and how you charge for it.</p></div>
      <Card title="Details" action={dirty && <Btn size="sm" onClick={() => dispatch({ type: "biz/update", businessId: b.id, patch: { ...f, priceMinor: Math.round(parseFloat(f.price || 0) * 100) } })}>Save changes</Btn>}>
        <Field label="Business name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Website"><input className="input" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></Field>
        <Field label="What the customer is paying for"><textarea className="ta" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid-2">
          <Field label="Type"><select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{BIZ_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Price"><input className="input" inputMode="decimal" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/[^\d.]/g, "") })} /></Field>
        </div>
        <p className="tiny">Changing what you sell can trigger a fresh review by the payment provider, because they verified the original description.</p>
      </Card>
    </div>
  );
}

const ACTION_LABEL = {
  "business.created": "Business created", "business.updated": "Business details changed", "guardian.invited": "Guardian invited",
  "guardian.accepted": "Guardian accepted", "guardian.declined": "Guardian declined", "guardian.ended": "Supervision ended",
  "guardian.policy_updated": "Approval settings changed", "invitation.expired": "Invitation expired",
  "payments.requested": "Payment account requested", "payments.connected": "Payment account connected", "payments.declined": "Payment account declined",
  "payments.status_changed": "Payment account status changed", "payout.requested": "Payout requested", "payout.approved": "Payout approved",
  "payout.declined": "Payout declined", "payout.paid": "Payout paid", "payout.failed": "Payout failed", "payout.canceled": "Payout canceled",
  "refund.created": "Refund issued", "dispute.opened": "Dispute opened",
};

function ActivityPage({ state }) {
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Activity</h1>
        <p className="small" style={{ marginTop: 4 }}>Every action that changed money, permissions or account status. Founder and guardian see the same record.</p></div>
      <div className="card">
        <div className="tblwrap"><table className="tbl"><thead><tr><th>Action</th><th className="hide-s">Detail</th><th>Who</th><th className="r">When</th></tr></thead>
          <tbody>{state.audit.slice(0, 40).map((l) => {
            const u = l.actorId ? userById(state, l.actorId) : null;
            return (<tr key={l.id}>
              <td><div style={{ fontWeight: 500 }}>{ACTION_LABEL[l.action] || l.action}</div><div className="tiny">{l.target}</div></td>
              <td className="hide-s tiny">{l.meta || ", "}</td>
              <td className="small">{u ? u.name : "Payment provider"}</td>
              <td className="r tiny">{fTime(l.at)}</td>
            </tr>);
          })}</tbody>
        </table></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Guardian screens
 * ------------------------------------------------------------------ */

function ApprovalCard({ item, state, dispatch }) {
  const b = item.business;
  const founder = userById(state, b.founderId);
  const [bank, setBank] = useState({ bankName: "Community Savings Bank", last4: "8290" });
  if (item.type === "payout") {
    const w = foldWallet(state.entries, state.payouts, b.id);
    return (
      <div className="card">
        <div className="card-h"><h3 className="h4">{founder?.name} wants to pay out {money(item.payout.amountMinor)}</h3><Badge tone="amber" dot>Waiting</Badge></div>
        <div className="card-b">
          <p className="small">This moves money that has already settled with the payment provider into your bank account. It does not take money from you.</p>
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="row-b" style={{ fontSize: "var(--fs-3)" }}><span className="ink3">Business</span><span>{b.name}</span></div>
            <div className="row-b" style={{ fontSize: "var(--fs-3)", marginTop: 6 }}><span className="ink3">Available before this</span><span className="num">{money(w.available + item.payout.amountMinor)}</span></div>
            <div className="row-b" style={{ fontSize: "var(--fs-3)", marginTop: 6 }}><span className="ink3">To</span><span>{item.payout.destination}</span></div>
            <div className="row-b" style={{ fontSize: "var(--fs-3)", marginTop: 6 }}><span className="ink3">Requested</span><span>{fTime(item.payout.requestedAt)}</span></div>
          </div>
        </div>
        <div className="card-f"><div className="row">
          <Btn size="sm" onClick={() => dispatch({ type: "payout/approve", payoutId: item.payout.id })}>Approve payout</Btn>
          <Btn size="sm" variant="2" onClick={() => dispatch({ type: "payout/decline", payoutId: item.payout.id })}>Decline</Btn>
        </div></div>
      </div>
    );
  }
  if (item.type === "account") {
    const p = getProvider(item.account.providerId);
    return (
      <div className="card">
        <div className="card-h"><h3 className="h4">{founder?.name} wants to connect a payment account</h3><Badge tone="amber" dot>Waiting</Badge></div>
        <div className="card-b">
          <p className="small">You would be the named adult on this account with {p.name}. That means passing their identity checks and being the person they contact about the account.</p>
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="row-b" style={{ fontSize: "var(--fs-3)" }}><span className="ink3">Business</span><span>{b.name}</span></div>
            <div className="row-b" style={{ fontSize: "var(--fs-3)", marginTop: 6 }}><span className="ink3">Sells</span><span style={{ textAlign: "right", maxWidth: "var(--m-tight)" }}>{b.description}</span></div>
            <div className="row-b" style={{ fontSize: "var(--fs-3)", marginTop: 6 }}><span className="ink3">Charges</span><span>{money(b.priceMinor, { round: true })} {b.model === "subscription" ? "per month" : "per sale"}</span></div>
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <Field label="Bank for payouts"><input className="input" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} /></Field>
            <Field label="Last 4 digits"><input className="input" maxLength={4} value={bank.last4} onChange={(e) => setBank({ ...bank, last4: e.target.value.replace(/\D/g, "") })} /></Field>
          </div>
          <p className="tiny">In production the provider collects these details on its own secure form. Veyro never sees or stores bank credentials or identity documents.</p>
        </div>
        <div className="card-f"><div className="row">
          <Btn size="sm" onClick={() => dispatch({ type: "account/approve", accountId: item.account.id, ...bank })}>Approve and connect</Btn>
          <Btn size="sm" variant="2" onClick={() => dispatch({ type: "account/decline", accountId: item.account.id })}>Not now</Btn>
        </div></div>
      </div>
    );
  }
  if (item.type === "invitation") {
    return (
      <div className="card">
        <div className="card-h"><h3 className="h4">Supervise {item.business?.name}?</h3><Badge tone="amber" dot>Invitation</Badge></div>
        <div className="card-b"><p className="small">{userById(state, item.rel.founderId)?.name} invited you to be the responsible adult on this business's payment account.</p></div>
        <div className="card-f"><div className="row">
          <Btn size="sm" onClick={() => dispatch({ type: "guardian/respond", relId: item.rel.id, accept: true })}>Accept</Btn>
          <Btn size="sm" variant="2" onClick={() => dispatch({ type: "guardian/respond", relId: item.rel.id, accept: false })}>Decline</Btn>
        </div></div>
      </div>
    );
  }
  return null;
}

function GuardianOverview({ state, dispatch, go }) {
  const list = guardedBusinesses(state);
  const approvals = pendingApprovals(state);
  const u = me(state);
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Hello, {u.name.split(" ")[0]}</h1>
        <p className="small" style={{ marginTop: 4 }}>You're supervising {list.length === 1 ? "one business" : list.length + " businesses"}. Here's what's happening with the money.</p></div>

      {list.map((b) => {
        const reqs = requirements(state, b).filter((r) => r.owner === "guardian");
        if (!reqs.length) return null;
        return (
          <div className="card" key={"req" + b.id}>
            <div className="card-h"><h2 className="h4">{b.name} is waiting on you</h2>
              <Badge tone="amber">{reqs.length}</Badge></div>
            <div className="card-b"><Requirements state={state} b={b} go={go} forRole="guardian" /></div>
          </div>
        );
      })}

      {approvals.length > 0 && (
        <Notice tone="amber" head={approvals.length === 1 ? "One thing needs your approval" : approvals.length + " things need your approval"}
          action={<Btn size="sm" onClick={() => go("g_approvals")}>Review them</Btn>}>
          Nothing moves until you say so.
        </Notice>
      )}

      {list.length === 0 && <Empty head="You aren't supervising anything yet">When a founder invites you, their business appears here.</Empty>}

      {list.map((b) => {
        const stale = consentStale(state, b.id);
        const rel = relForBiz(state, b.id);
        if (!stale) return null;
        return (
          <StatusBlock key={b.id} state="error" head={b.name + " has changed since you agreed"}
            action={<div className="row">
              <Btn size="sm" onClick={() => dispatch({ type: "guardian/reconfirm", relId: rel.id })}>
                I have read it and I am happy
              </Btn>
              <Btn variant="2" size="sm" onClick={() => dispatch({ type: "guardian/end", relId: rel.id })}>Stop supervising</Btn>
            </div>}>
            {userById(state, b.founderId)?.name} changed {stale.join(" and ")}. You agreed to a
            different version on {fFull(rel.consent.acceptedAt)}. Have a look at what it is now, and
            confirm only if you are still comfortable being the responsible adult on the account.
          </StatusBlock>
        );
      })}

      {list.map((b) => {
        const w = foldWallet(state.entries, state.payouts, b.id);
        const acct = acctForBiz(state, b.id);
        const founder = userById(state, b.founderId);
        const recent = state.entries.filter((e) => e.businessId === b.id).sort((a, c) => c.createdAt - a.createdAt).slice(0, 4);
        return (
          <div className="card" key={b.id}>
            <div className="card-h">
              <div><h2 className="h4">{b.name}</h2><div className="tiny" style={{ marginTop: 2 }}>Run by {founder?.name}</div></div>
              <Badge tone={ACCOUNT_COPY[acct?.status || "not_started"].tone} dot>{ACCOUNT_COPY[acct?.status || "not_started"].label}</Badge>
            </div>
            <div className="card-b">
              <div className="lbl">Earned in total</div>
              <div className="d2 num" style={{ marginTop: 2 }}>{money(w.revenue)}</div>
              <div style={{ marginTop: 16 }}><PositionBand w={w} /></div>
              {w.revenue > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>Gross sales, last 30 days</div>
                  <SalesChart entries={state.entries.filter((e) => e.businessId === b.id)} nowMs={now(state)} height={70} />
                </div>
              )}
              <p className="small" style={{ marginTop: 16 }}>
                {money(w.available)} could be paid out today. {money(w.pending)} is still settling with the payment provider and can't be moved yet.
                {w.paidOut > 0 && <> {money(w.paidOut)} has already reached your bank account.</>}
              </p>
            </div>
            {recent.length > 0 && (
              <>
                <div style={{ borderTop: "1px solid var(--line-soft)", padding: "10px 18px 0" }}><div className="lbl">Recent</div></div>
                <div className="tblwrap"><table className="tbl"><tbody>{recent.map((e) => (
                  <tr key={e.id}><td><div style={{ fontWeight: 500 }}>{KIND_LABEL[e.kind]}</div><div className="tiny">{e.customer || e.description} · {fDate(e.createdAt)}</div></td>
                    <td className="r"><Amt v={e.kind === KIND.CHARGE ? e.grossMinor : e.netMinor} signed={e.kind !== KIND.CHARGE} /></td></tr>
                ))}</tbody></table></div>
              </>
            )}
          </div>
        );
      })}

      {list.length > 0 && <GuardianSettings state={state} dispatch={dispatch} />}
    </div>
  );
}

function GuardianSettings({ state, dispatch }) {
  const rels = state.relationships.filter((r) => r.guardianId === state.session.userId && r.status === "accepted");
  const [ending, setEnding] = useState(null);
  return (
    <>
      {rels.map((r) => {
        const b = bizById(state, r.businessId);
        return (
          <Card key={r.id} title={"Your settings for " + b.name}>
            {r.consent && (
              <div className="panel" style={{ marginBottom: "var(--sp-5)", marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <div className="lbl">Your agreement</div>
                <p className="small" style={{ marginTop: "var(--sp-1)" }}>
                  Recorded {fFull(r.consent.acceptedAt)} against terms version {r.consent.termsVersion},
                  for a business selling: {r.consent.snapshot.description}
                </p>
              </div>
            )}
            <div className="stack">
              <Choice on={r.policy.approvePayouts && r.policy.thresholdMinor === 0} onClick={() => dispatch({ type: "guardian/policy", relId: r.id, patch: { approvePayouts: true, thresholdMinor: 0 } })}
                title="Approve every payout" sub="Nothing reaches your bank account without you saying yes." />
              <Choice on={r.policy.approvePayouts && r.policy.thresholdMinor > 0} onClick={() => dispatch({ type: "guardian/policy", relId: r.id, patch: { approvePayouts: true, thresholdMinor: usd(100) } })}
                title="Approve payouts over $100" sub="Smaller payouts go straight through. You still see all of them." />
              <Choice on={!r.policy.approvePayouts} onClick={() => dispatch({ type: "guardian/policy", relId: r.id, patch: { approvePayouts: false } })}
                title="No approval needed" sub="You keep full visibility but stop being asked each time." />
            </div>
            <hr className="rule" style={{ margin: "18px 0" }} />
            {ending === r.id ? (
              <Notice tone="clay" head="Stop supervising this business?"
                action={<div className="row"><Btn variant="d" size="sm" onClick={() => { dispatch({ type: "guardian/end", relId: r.id }); setEnding(null); }}>Yes, stop supervising</Btn>
                  <Btn variant="2" size="sm" onClick={() => setEnding(null)}>Keep supervising</Btn></div>}>
                {b.name} will stop being able to take new payments. Money already earned stays with the payment provider and is unaffected.
                {userById(state, b.founderId)?.name} will be told and can invite a different adult.
              </Notice>
            ) : (
              <div className="row-b"><span className="small">Don't want to supervise this any more?</span>
                <Btn variant="2" size="sm" onClick={() => setEnding(r.id)}>Stop supervising</Btn></div>
            )}
          </Card>
        );
      })}
    </>
  );
}

function GuardianApprovals({ state, dispatch }) {
  const items = pendingApprovals(state);
  return (
    <div className="stack">
      <div className="page-h"><h1 className="d2">Approvals</h1>
        <p className="small" style={{ marginTop: 4 }}>Plain-English requests. Read what it does, then decide.</p></div>
      {items.length === 0
        ? <Empty head="Nothing to approve">When a payout or a payment account needs your decision, it shows up here.</Empty>
        : items.map((i) => <ApprovalCard key={i.id} item={i} state={state} dispatch={dispatch} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sandbox controls
 * ------------------------------------------------------------------ */

function SandboxDrawer({ state, dispatch, onClose }) {
  const u = me(state);
  const b = u?.role === "guardian" ? guardedBusinesses(state)[0] : myBusiness(state);
  const entries = b ? state.entries.filter((e) => e.businessId === b.id && e.kind === KIND.CHARGE) : [];
  const last = entries.filter((e) => e.status === "succeeded").sort((a, c) => c.createdAt - a.createdAt)[0];
  const openPayout = state.payouts.find((p) => p.status === "in_transit" && p.businessId === b?.id);
  const [amt, setAmt] = useState("19");
  return (
    <div className="drawer" role="complementary" aria-label="Sandbox controls">
      <div className="card-h" style={{ position: "sticky", top: 0, background: "var(--paper)", zIndex: 2 }}>
        <h2 className="h4">Sandbox controls</h2><Btn variant="q" size="sm" onClick={onClose}>Close</Btn>
      </div>
      <div className="card-b">
        <p className="small">These exist only in sandbox. They drive the same code paths as production so you can see every real state, including the ones nobody demos.</p>

        {b && (<>
          <hr className="rule" style={{ margin: "18px 0" }} />
          <div className="lbl" style={{ marginBottom: 8 }}>Money in</div>
          <div className="row" style={{ marginBottom: 8 }}>
            <input className="input" style={{ width: 90 }} inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} />
            <Btn size="sm" className="grow" onClick={() => dispatch({ type: "sim/charge", businessId: b.id, amountMinor: usd(parseFloat(amt) || 0), description: b.model === "subscription" ? "Subscription payment" : "Product purchase", customer: "sim" + Math.floor(Math.random() * 900 + 100) + "@example.com" })}>Simulate a payment</Btn>
          </div>
          <Btn variant="2" size="sm" className="btn-w" onClick={() => dispatch({ type: "sim/settle", ms: 3 * DAY })}>Advance the clock 3 days</Btn>
          <p className="tiny" style={{ marginTop: 6 }}>Moves pending payments past their settlement date so they become available.</p>

          <hr className="rule" style={{ margin: "18px 0" }} />
          <div className="lbl" style={{ marginBottom: 8 }}>Things going wrong</div>
          <div className="stack">
            <Btn variant="2" size="sm" className="btn-w" disabled={!last} onClick={() => dispatch({ type: "sim/refund", entryId: last.id })}>Refund the most recent payment</Btn>
            <Btn variant="2" size="sm" className="btn-w" disabled={!last} onClick={() => dispatch({ type: "sim/dispute", entryId: last.id })}>Open a dispute on it</Btn>
            <Btn variant="2" size="sm" className="btn-w" disabled={!openPayout} onClick={() => dispatch({ type: "payout/settle", payoutId: openPayout.id, fail: true, reason: "The bank rejected the transfer because the account name didn't match." })}>Fail the payout in transit</Btn>
            <Btn variant="2" size="sm" className="btn-w" disabled={!openPayout} onClick={() => dispatch({ type: "payout/settle", payoutId: openPayout.id })}>Complete the payout in transit</Btn>
          </div>
        </>)}

        <hr className="rule" style={{ margin: "18px 0" }} />
        <div className="lbl" style={{ marginBottom: 8 }}>Pages</div>
        <Btn variant="2" size="sm" className="btn-w" onClick={() => { onClose(); dispatch({ type: "go", route: { name: "does-not-exist" } }); }}>Preview the 404 page</Btn>
        <hr className="rule" style={{ margin: "18px 0" }} />
        <Btn variant="d" size="sm" className="btn-w" onClick={() => dispatch({ type: "sim/reset" })}>Reset sandbox data</Btn>
        <p className="tiny" style={{ marginTop: 10 }}>No real payment provider is connected. Nothing here touches real money, real banks or real people.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Root
 * ------------------------------------------------------------------ */

export default function Veyro() {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [sandbox, setSandbox] = useState(false);
  const [consent, setConsent] = useState(null);   // production stores this in a first-party cookie
  const chooseConsent = (granted) => { analytics.setConsent(granted); setConsent(granted); };
  const go = (name, params = {}) => {
    if (name === "signup") { dispatch({ type: "draft/start" }); dispatch({ type: "go", route: { name: "signup" } }); return; }
    dispatch({ type: "go", route: { name, ...params } });
  };
  useSEO(state.route.name);

  // Settle anything that has passed its availability date whenever the app renders a new route.
  useEffect(() => {
    dispatch({ type: "tick" });
  }, [state.route.name]);

  const PUBLIC = ["landing", "check", "signin", "signup", "invite", "terms", "privacy", "accessibility", "notfound"];
  const FOUNDER_ONLY = ["dashboard", "wallet", "transaction", "payouts", "payments", "guardian", "business", "checkout"];
  const GUARDIAN_ONLY = ["g_overview", "g_approvals", "g_business"];
  const APP = [...FOUNDER_ONLY, ...GUARDIAN_ONLY, "activity", "g_activity", "thanks"];
  const r = state.route;
  const known = PUBLIC.includes(r.name) || APP.includes(r.name);

  // A session whose user no longer exists is not a session. Without this, the shell
  // reads .role off null and takes the whole app down.
  const user = me(state);
  const signedIn = !!state.session && !!user;
  const home = user?.role === "guardian" ? "g_overview" : "dashboard";

  // Screens are owned by one role. A guardian holds no business, so the founder
  // screens have nothing to render and must not be reached rather than be guarded
  // individually in nine places.
  let appRoute = r.name === "g_business" ? "g_overview" : r.name;
  if (signedIn) {
    if (user.role === "guardian" && FOUNDER_ONLY.includes(appRoute)) appRoute = home;
    if (user.role === "founder" && GUARDIAN_ONLY.includes(appRoute)) appRoute = home;
    const APP_VIEWS = [...APP, "activity", "g_activity"];
    if (!APP_VIEWS.includes(appRoute)) appRoute = home;
    if (user.role === "founder" && !myBusiness(state) && FOUNDER_ONLY.includes(appRoute)) appRoute = "nobusiness";
  }

  let body;
  if (!known) body = <NotFound go={go} />;
  else if (LEGAL[r.name]) body = <LegalPage go={go} which={r.name} />;
  else if (r.name === "check") body = <EligibilityCheck go={go} />;
  else if (r.name === "invite") body = <InvitePage state={state} dispatch={dispatch} go={go} relId={r.id} />;
  else if (state.draft) body = <Onboarding state={state} dispatch={dispatch} go={go} />;
  else if (r.name === "signin") body = <SignIn go={go} dispatch={dispatch} users={state.users} />;
  else if (r.name === "thanks" && signedIn) body = <ThankYou state={state} go={go} />;
  // The marketing site stays reachable while signed in. It is a public page, and a
  // signed-in visitor should get it rather than be silently dropped into the app.
  else if (r.name === "landing") body = <Landing go={go} state={state} signedInAs={user} home={home} />;
  else if (!signedIn) body = APP.includes(r.name) ? <SignIn go={go} dispatch={dispatch} users={state.users} /> : <Landing go={go} state={state} />;
  else {
    const inner =
      appRoute === "wallet" ? <WalletPage state={state} go={go} /> :
      appRoute === "transaction" ? <TransactionPage state={state} dispatch={dispatch} go={go} id={r.id} /> :
      appRoute === "payouts" ? <PayoutsPage state={state} dispatch={dispatch} go={go} /> :
      appRoute === "payments" ? <PaymentsPage state={state} dispatch={dispatch} go={go} /> :
      appRoute === "guardian" ? <GuardianPage state={state} dispatch={dispatch} go={go} /> :
      appRoute === "checkout" ? <CheckoutPage state={state} dispatch={dispatch} go={go} /> :
      appRoute === "business" ? <BusinessPage state={state} dispatch={dispatch} /> :
      appRoute === "activity" || appRoute === "g_activity" ? <ActivityPage state={state} /> :
      appRoute === "g_overview" ? <GuardianOverview state={state} dispatch={dispatch} go={go} /> :
      appRoute === "g_approvals" ? <GuardianApprovals state={state} dispatch={dispatch} /> :
      appRoute === "nobusiness" ? <NoBusiness go={go} /> :
      <Dashboard state={state} dispatch={dispatch} go={go} />;
    body = <AppShell state={state} dispatch={dispatch} go={go} sandbox={sandbox} setSandbox={setSandbox}>{inner}</AppShell>;
  }

  const onLanding = !signedIn && r.name === "landing";
  const longform = ["terms", "privacy", "accessibility"].includes(r.name);
  return (
    <div className={"fw" + (onLanding ? " has-sticky" : "")}>
      <style>{CSS + CSS2}</style>
      <SkipLink />
      {longform && <ScrollProgress />}
      {body}
      {(longform || onLanding) && <ScrollTop />}
      {onLanding && consent !== null && <StickyCTA go={go} />}
      {consent === null && <CookieBanner go={go} onChoose={chooseConsent} />}
      {sandbox && signedIn && <SandboxDrawer state={state} dispatch={dispatch} onClose={() => setSandbox(false)} />}
      <Toasts items={state.toasts} onDone={(id) => dispatch({ type: "toast/dismiss", id })} />
    </div>
  );
}
