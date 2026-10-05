// An aside, in the margin, where it stops interrupting.
//
// Long pages collect small true things that are not part of the argument: the
// date something was last checked, a caveat, a figure worth knowing. Inline,
// each one is a speed bump in the middle of a paragraph the reader is trying
// to follow. In the margin they are available without being in the way, and
// they give the right-hand track something to hold other than air.
//
// Below 1040px the track is gone and the note falls back into the flow as an
// indented aside, so nothing here depends on the window being wide. That is
// handled entirely in CSS -- there is no second rendering path to keep in
// step with this one.
export function MarginNote({
  head, children, sticky,
}: {
  /** Two or three words. Omit when the note is a single sentence. */
  head?: string;
  children: React.ReactNode;
  /** Stays with the reader. For the one note a page wants available throughout. */
  sticky?: boolean;
}) {
  return (
    <aside className="lfnote" data-sticky={sticky ? "1" : undefined}>
      {head ? <strong>{head}</strong> : null}
      {children}
    </aside>
  );
}
