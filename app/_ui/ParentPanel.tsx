"use client";

// What a parent is actually agreeing to, drawn as the thing itself.
//
// The page around this answers four questions in prose and answers them well.
// What prose cannot do is show someone the controls they will hold, and the
// single most common fear -- "I will be signing up for something I cannot get
// out of" -- is answered better by a visible Close account button than by a
// sentence promising one exists.
//
// Two halves, in the order a parent meets them:
//
//   the approval      four steps, which advance once on view. Step three is
//                     theirs and the other three are not, which is the whole
//                     shape of their involvement and is hard to say in words.
//   the controls      what stays available afterwards, forever.
//
// Everything here mirrors the real guardian dashboard rather than inventing a
// nicer one. It is labelled Example and the controls are inert: a parent who
// clicks Close account on a marketing page has been lied to about what a
// button is, and this product cannot afford that with this reader.

import { useEffect, useReducer, useRef } from "react";

const STEPS = [
  ["Invited", "Your child sends you a link.", false],
  ["You agree", "You read what it is and accept.", true],
  ["You verify", "Your ID, on the processor's form. Ten minutes, once.", true],
  ["Payouts on", "They can be paid. You are done.", false],
] as const;

const CONTROLS = [
  ["Pause payouts", "Stops money leaving, keeps the account open."],
  ["Close the account", "Ends it. Nothing here can stop you."],
  ["Export every record", "Every payment and fee, as a file, whenever you want it."],
] as const;

export function ParentPanel() {
  // Renders complete. The animation only ever walks it back and forwards
  // again, so with no JavaScript a parent sees the finished, true state.
  const [step, setStep] = useReducer((_: number, n: number) => n, STEPS.length);
  const node = useRef<HTMLDivElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const el = node.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || ran.current) return;
      ran.current = true;
      io.disconnect();
      setStep(0);
      STEPS.forEach((_, i) => timers.push(setTimeout(() => setStep(i + 1), 500 + i * 750)));
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); for (const t of timers) clearTimeout(t); };
  }, []);

  return (
    <div className="dp pp" ref={node}>
      <div className="dp-bar" aria-hidden="true">
        <span className="dp-dots"><i /><i /><i /></span>
        <span className="dp-title">Your guardian account</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="dp-body">
        <div className="pp-seq">
        <h3 className="fig-k" style={{ marginBottom: "var(--sp-4)" }}>Setting it up</h3>
        <ol className="pp-steps">
          {STEPS.map(([t, d, yours], i) => (
            <li
              key={t}
              className="pp-step"
              data-done={i < step ? "1" : undefined}
              data-yours={yours ? "1" : undefined}
            >
              <span className="pp-tick" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="11" height="11">
                  <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="pp-step-b">
                <span className="pp-step-t">
                  {t}
                  {yours && <span className="pp-you">Yours</span>}
                </span>
                <span className="pp-step-d">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        </div>

        <div className="pp-ctl">
          <h3 className="fig-k">And afterwards, always</h3>
          <div className="pp-btns">
            {CONTROLS.map(([t, d]) => (
              <div className="pp-btn" key={t}>
                <span className="pp-btn-t">{t}</span>
                <span className="pp-btn-d">{d}</span>
              </div>
            ))}
          </div>
          <p className="tiny" style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}>
            Shown as an example. The real ones are in your account, and none of them needs
            us to agree.
          </p>
        </div>
      </div>
    </div>
  );
}
