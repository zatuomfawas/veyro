import Link from "next/link";

// The end of a page, and what to do from there.
//
// Measured across the fourteen pages the footer links to: nine of them ended
// with no action at all, and of the five that had one, four put it past 80% of
// the page -- "How it works" at 8,526px of 9,400, the SDK docs at 7,052 of
// 7,558. A reader who finished those pages convinced had nothing to click.
//
// That is a conversion problem, but it is a comprehension problem first. A
// page that ends mid-air reads as unfinished, and a reader who has to go back
// to the nav to continue has been handed the job of knowing what comes next --
// which is the page's job, not theirs.
//
// WHAT IT IS NOT: a repeated "Sign up now" strip. Each page states the next
// step that is actually true FOR THAT PAGE, which is why `lead`, `primary` and
// `secondary` are all required and none of them have defaults. A guardian
// finishing /for-parents should not be told to create a founder account; a
// developer finishing the SDK docs should not be sent to the pricing page.
// Getting the destination right is the whole value, so the API refuses to
// guess it.
//
// Deliberately quiet: a hairline, a question, and the links. The dark
// full-bleed band is reserved for the pages whose job is to convert, and if
// every page ended with one it would stop meaning anything.

export function PageNext({
  head, lead, primary, secondary, note,
}: {
  /** The question the reader is now holding. Never "Ready?". */
  head: string;
  /** One sentence. Why this is the next thing, not just what it is. */
  lead: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  /** A third option, or a caveat. Optional because not every page has one. */
  note?: React.ReactNode;
}) {
  return (
    <aside className="pnext" aria-label="What to do next">
      <div className="pnext-in">
        <div className="pnext-t">
          <h2 className="pnext-h">{head}</h2>
          <p className="pnext-l">{lead}</p>
        </div>
        <div className="pnext-a">
          <Link className="btn btn-lg" href={primary.href}>{primary.label}</Link>
          <Link className="btn btn-2 btn-lg" href={secondary.href}>{secondary.label}</Link>
        </div>
      </div>
      {note ? <p className="pnext-n">{note}</p> : null}
    </aside>
  );
}
