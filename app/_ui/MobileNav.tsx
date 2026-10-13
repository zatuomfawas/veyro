"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";

export type NavItem = { href: string; label: string };

export function MobileNav({ items, active }: { items: NavItem[]; active?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `mobile-nav-${id}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const isInside = (target: EventTarget | null) => target instanceof Node
      && (buttonRef.current?.contains(target) || panelRef.current?.contains(target));
    const dismissOutside = (event: Event) => {
      if (!isInside(event.target)) setOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 761px)");
    const dismissOnDesktop = () => { if (desktop.matches) setOpen(false); };

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissEscape);
    desktop.addEventListener("change", dismissOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissEscape);
      desktop.removeEventListener("change", dismissOnDesktop);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="mobmenu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <div ref={panelRef} className="mobpanel" id={panelId}>
          <ul className="mobpanel-links">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  className="mobpanel-link"
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobpanel-set mob-nav-footer">
            <span>Dark mode</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}
