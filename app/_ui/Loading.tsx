import { CSS, CSS2 } from "@/app/_ui/css";

// The loading state, shared.
//
// Deliberately not a skeleton shimmer. A shimmer draws fake content in the
// shape of real content, which tells someone the page is nearly ready even when
// it is stuck, and animates a placeholder that carries no information. A line of
// text saying what is being fetched is honest and costs nothing to read.
//
// It renders inside the same .fw wrapper and container as the page it stands in
// for, so the header does not jump sideways when the real page arrives.
export function Loading({ what, wide = true }: { what: string; wide?: boolean }) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <main className={wide ? "wrap-w" : "wrap-s"} style={{ paddingTop: 56, paddingBottom: 80 }}>
        <p className="body" role="status" aria-live="polite" style={{ margin: 0 }}>
          Loading {what}…
        </p>
      </main>
    </div>
  );
}
