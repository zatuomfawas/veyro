import { CSS, CSS2 } from "@/app/_ui/css";

// The dashboard's shape, while the dashboard is being fetched.
//
// This replaces a line of text that said "Loading your business…". That text
// was honest and cost nothing to read, and its own comment argued against
// skeletons: a shimmer draws fake content in the shape of real content and
// keeps insisting the page is nearly ready even when it is stuck.
//
// Half of that argument survives, so both halves are answered here. The
// shimmer runs a bounded six times and then rests, rather than pulsing forever
// at someone whose connection has died. And the live region is still present
// and still says in words what is loading, so nothing is lost for anyone using
// a screen reader — the blocks are aria-hidden, because a row of empty divs
// announced one by one is worse than silence.
//
// What the text could not do is hold the page's shape. The header used to jump
// when the real content arrived; now the band, the rail and the columns are
// already the right size.

/** One grey block. `w` and `h` are any CSS length. */
function Bar({ w, h = 14, mt = 0 }: { w: string; h?: number; mt?: number }) {
  return (
    <div
      className="skel"
      data-shimmer="1"
      style={{ width: w, height: h, marginTop: mt }}
    />
  );
}

export function DashboardSkeleton({ what = "your business" }: { what?: string }) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <main className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        {/* The words, for anyone who cannot see the shape. */}
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}…
        </p>

        <div aria-hidden="true">
          <Bar w="220px" h={26} />
          <Bar w="340px" h={12} mt={10} />

          {/* The wallet band, already the right height and already dark, so
              the page does not flash white and then invert. */}
          <div className="skel-hero" style={{ marginTop: 24 }}>
            <Bar w="150px" h={12} />
            <Bar w="260px" h={52} mt={12} />
            <Bar w="420px" h={12} mt={16} />
            <Bar w="180px" h={12} mt={22} />
            <Bar w="150px" h={40} mt={20} />
          </div>

          <div className="skel-rail">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <Bar w="64px" h={24} />
                <Bar w="110px" h={11} mt={8} />
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
            <div>
              {[0, 1, 2].map((i) => (
                <div className="skel-card" key={i}>
                  <Bar w="120px" h={14} />
                  <Bar w="100%" h={11} mt={14} />
                  <Bar w="82%" h={11} mt={8} />
                </div>
              ))}
            </div>
            <div>
              {[0, 1].map((i) => (
                <div className="skel-card" key={i}>
                  <Bar w="140px" h={14} />
                  <Bar w="100%" h={11} mt={14} />
                  <Bar w="90%" h={11} mt={8} />
                  <Bar w="70%" h={11} mt={8} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * The shape shared by Settings and the guardian dashboard: a page heading, a
 * line of context under it, then two columns of cards. Both pages are built
 * from DashHeader and Section, so the skeleton is built from the same
 * measurements rather than from a guess at what they look like.
 */
export function PageSkeleton({
  what, left = 3, right = 2,
}: { what: string; left?: number; right?: number }) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <main className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}…
        </p>

        <div aria-hidden="true">
          <Bar w="220px" h={26} />
          <Bar w="340px" h={12} mt={10} />

          <div className="grid-2" style={{ gap: 32, alignItems: "start", marginTop: 24 }}>
            <div>
              {Array.from({ length: left }, (_, i) => (
                <div className="skel-card" key={i}>
                  <Bar w="130px" h={14} />
                  <Bar w="100%" h={11} mt={14} />
                  <Bar w="84%" h={11} mt={8} />
                </div>
              ))}
            </div>
            <div>
              {Array.from({ length: right }, (_, i) => (
                <div className="skel-card" key={i}>
                  <Bar w="150px" h={14} />
                  <Bar w="100%" h={11} mt={14} />
                  <Bar w="90%" h={11} mt={8} />
                  <Bar w="66%" h={11} mt={8} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * The checkout and the founder's preview of it are the same narrow shell: a
 * wordmark line, then one column. This stands in for both, so the page does
 * not reflow between the placeholder and the real thing.
 *
 * The customer-facing one matters more than the rest. Someone about to be
 * asked for card details should never meet a blank screen, and should never
 * see the price land in a different place than the placeholder implied.
 */
export function NarrowSkeleton({ what }: { what: string }) {
  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <div className="wrap-s">
        <div className="lp-nav" style={{ borderBottom: 0 }}>
          <Bar w="74px" h={18} />
          <Bar w="150px" h={11} />
        </div>
      </div>
      <main className="wrap-s" style={{ marginTop: 8, marginBottom: 90 }}>
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}…
        </p>

        <div aria-hidden="true">
          <Bar w="70%" h={26} />
          <Bar w="45%" h={12} mt={12} />

          <div className="skel-card" style={{ marginTop: 24 }}>
            <Bar w="55%" h={14} />
            <Bar w="100%" h={11} mt={14} />
            <Bar w="78%" h={11} mt={8} />
            <Bar w="120px" h={30} mt={20} />
          </div>

          <Bar w="100%" h={44} mt={20} />
          <Bar w="60%" h={11} mt={14} />
        </div>
      </main>
    </div>
  );
}
