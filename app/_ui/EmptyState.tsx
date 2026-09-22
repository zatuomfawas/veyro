// The "nothing here yet" state, for every empty list on a signed-in page.
//
// This replaces an earlier EmptyState that took only `children` and centred
// them under a faded mark. Centring a short paragraph in a wide column puts it
// nowhere the eye already is, and the faded mark decorated a moment when the
// person needs instruction rather than decoration. Everything here is
// left-aligned on the same axis as the content that will eventually replace it,
// so the page does not reflow its optical centre once one item exists.
//
// The rule at the top is the only chrome. No card, no background, no icon: an
// empty state is a gap in a list, not an object in its own right.
//
// Every one of these names the next action and links to it. An empty state that
// only explains why it is empty leaves someone exactly where they were.

import Link from "next/link";
import { isValidElement, type ReactNode } from "react";

/** A plain navigation action: the common case. */
export type LinkAction = { label: string; href: string };

/**
 * `action` is either a link or a rendered control.
 *
 * Two of these states act on the page instead of navigating — copying a payment
 * link to the clipboard, focusing the create-product form already sitting above
 * the list — and one hands over a whole form (the guardian invite). None of
 * those is an href, so the prop admits a node and this file stays a server
 * component: the interactive parts arrive already built by their own client
 * components rather than forcing this one across the boundary.
 */
function isLinkAction(a: ReactNode | LinkAction | undefined): a is LinkAction {
  return typeof a === "object" && a !== null && !isValidElement(a) && "href" in a;
}

export function EmptyState({
  heading, children, action, secondary,
}: {
  heading: string;
  /** One plain paragraph. If it needs two, the state is doing too much. */
  children: ReactNode;
  action?: LinkAction | ReactNode;
  secondary?: LinkAction;
}) {
  return (
    <div className="estate">
      <h3 className="estate-h">{heading}</h3>
      <p className="estate-b">{children}</p>
      {(action || secondary) && (
        <div className="estate-a">
          {isLinkAction(action)
            ? <Link className="btn" href={action.href}>{action.label}</Link>
            : action}
          {secondary && (
            <Link className="linkbtn" href={secondary.href}>{secondary.label}</Link>
          )}
        </div>
      )}
    </div>
  );
}
