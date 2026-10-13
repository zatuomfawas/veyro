"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

type AccordionProps = Omit<ComponentPropsWithoutRef<"details">, "children" | "open" | "onToggle"> & {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  summaryClassName?: string;
};

/** Native disclosure semantics, enhanced with interruptible measured height. */
export function Accordion({
  summary, children, defaultOpen = false, className = "", summaryClassName = "", ...props
}: AccordionProps) {
  const node = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const details = node.current;
    const panel = body.current;
    const inner = content.current;
    const trigger = details?.querySelector<HTMLElement>(":scope > summary");
    if (!details || !panel || !inner || !trigger) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let expanded = details.open;
    let animation: Animation | null = null;
    let targetHeight = 0;

    const mark = (open: boolean) => {
      expanded = open;
      details.dataset.expanded = String(open);
      trigger.setAttribute("aria-expanded", String(open));
      // Closing content stops receiving focus immediately, before its visual exit.
      panel.inert = !open && details.open;
      if (!open && details.open) panel.setAttribute("aria-hidden", "true");
      else panel.removeAttribute("aria-hidden");
    };

    const settle = (open: boolean) => {
      const previous = animation;
      animation = null;
      previous?.cancel();
      details.open = open;
      panel.style.removeProperty("height");
      panel.style.removeProperty("overflow");
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
      mark(open);
    };

    const move = (open: boolean) => {
      // Read the currently presented height before cancelling an interrupted run.
      // Closed native details can retain descendant layout rectangles in Chromium.
      const start = details.open ? panel.getBoundingClientRect().height : 0;
      animation?.cancel();
      animation = null;
      if (!open && panel.contains(document.activeElement)) trigger.focus();
      mark(open);

      if (motion.matches || typeof panel.animate !== "function") {
        settle(open);
        return;
      }

      details.open = true;
      mark(open);
      targetHeight = open ? inner.getBoundingClientRect().height : 0;
      if (Math.abs(targetHeight - start) < 1) {
        settle(open);
        return;
      }

      panel.style.height = `${start}px`;
      panel.style.overflow = "hidden";
      const style = getComputedStyle(details);
      const token = style.getPropertyValue("--motion-disclosure-duration").trim();
      const duration = token.endsWith("ms") ? parseFloat(token)
        : token.endsWith("s") ? parseFloat(token) * 1000 : 240;
      const easing = style.getPropertyValue("--motion-disclosure-ease").trim()
        || "cubic-bezier(.2,.8,.2,1)";
      const distance = Math.abs(targetHeight - start);
      const whole = Math.max(inner.getBoundingClientRect().height, start, 1);
      const run = panel.animate([
        { height: `${start}px` }, { height: `${targetHeight}px` },
      ], {
        duration: Math.max(80, (Number.isFinite(duration) ? duration : 240) * Math.min(1, distance / whole)),
        easing,
        fill: "forwards",
      });
      animation = run;
      run.onfinish = () => { if (animation === run) settle(open); };
    };

    const onClick = (event: MouseEvent) => {
      // Links or controls intentionally placed in a summary keep their own action.
      const target = event.target as Element;
      if (target.closest("a, button, input, select, textarea")) return;
      event.preventDefault();
      move(!expanded);
    };
    const onToggle = () => {
      // Setting `open` from an anchor or browser search remains fully supported.
      if (animation && details.open) return;
      if (details.open !== expanded) settle(details.open);
    };
    const onMotion = () => { if (motion.matches) settle(expanded); };
    const onReveal = () => settle(true);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      if (animation && expanded && Math.abs(inner.getBoundingClientRect().height - targetHeight) > 1) {
        move(true);
      }
    });

    mark(expanded);
    resize?.observe(inner);
    trigger.addEventListener("click", onClick);
    details.addEventListener("toggle", onToggle);
    details.addEventListener("veyro:disclosure-open", onReveal);
    motion.addEventListener("change", onMotion);

    return () => {
      trigger.removeEventListener("click", onClick);
      details.removeEventListener("toggle", onToggle);
      details.removeEventListener("veyro:disclosure-open", onReveal);
      motion.removeEventListener("change", onMotion);
      resize?.disconnect();
      settle(expanded);
    };
  }, []);

  return (
    <details {...props} ref={node} className={`disclosure ${className}`.trim()} open={defaultOpen}>
      <summary className={`disclosure-summary ${summaryClassName}`.trim()}>
        {summary}
      </summary>
      <div className="disclosure-body" ref={body}>
        <div className="disclosure-content" ref={content}>{children}</div>
      </div>
    </details>
  );
}
