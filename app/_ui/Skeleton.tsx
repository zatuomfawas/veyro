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
