import Link from "next/link";

// One tap to the checker, from anywhere on a long marketing page.
//
// Phone only. The CSS hides it above 760px, so there is no duplicate button on
// a desktop and no JavaScript deciding when to show it. .stickycta and
// .has-sticky were both already in the design system and unused, and .totop is
// already positioned at bottom:152px on a phone precisely to sit above this
// bar, so the two do not overlap.
//
// A Server Component: it is a link, and a link needs no client runtime.
//
// The page that uses this must add `has-sticky` to its <main>, which reserves
// the space the fixed bar occupies. Without it the last paragraph sits behind
// the bar and cannot be read.
export function StickyCta({
  href = "/check",
  label = "Check eligibility",
  note,
}: { href?: string; label?: string; note?: string }) {
  return (
    <div className="stickycta">
      <Link className="btn btn-w" href={href}>{label}</Link>
      {note && (
        <p className="tiny" style={{ margin: "8px 0 0", textAlign: "center" }}>{note}</p>
      )}
    </div>
  );
}
