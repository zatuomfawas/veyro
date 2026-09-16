"use client";

// The navigation items that vanish at narrow widths, given somewhere to go.
//
// The design system hides secondary links with .hide-s below 760px. Hidden is
// fine; unreachable is not, and until now "How it works" and "For parents"
// simply disappeared on a phone with no other route to them. This is the
// hamburger the stylesheet was already written for: .mobmenu and .mobpanel
// were both styled and used nowhere.
//
// The button and the panel only exist below 760px, enforced by the CSS rather
// than by JavaScript, so nothing here renders twice on a desktop.

import { useState } from "react";
import Link from "next/link";

export type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mobmenu"
        aria-expanded={open}
        aria-controls="mobnav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <div className="mobpanel" id="mobnav">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              // .mobpanel styles `button`, and these are links. The class keeps
              // the panel's row appearance without pretending a link is a
              // button, which would lose middle-click and open-in-new-tab.
              style={{
                display: "block", width: "100%", textAlign: "left",
                borderBottom: "1px solid var(--line-soft)", padding: "14px 2px",
                fontSize: "var(--fs-4)", fontWeight: "var(--fw-med)",
                color: "var(--ink)", textDecoration: "none", minHeight: "var(--tap)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
