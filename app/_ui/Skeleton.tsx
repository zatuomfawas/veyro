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
      style={{ width: w, maxWidth: "100%", height: h, marginTop: mt }}
    />
  );
}

export function DashboardSkeleton({ what = "your money" }: { what?: string }) {
  return (
    <div className="fw founder-dashboard">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <div className="navbar dashboard-nav" data-role="founder" aria-hidden="true">
        <div className="wrap-w">
          <div className="lp-nav dashboard-nav-inner"><Bar w="104px" h={20} /><Bar w="190px" h={16} /></div>
        </div>
      </div>
      <main className="wrap-w dashboard-main">
        <p className="sr-only" role="status" aria-live="polite">Loading {what}…</p>
        <div aria-hidden="true">
          <div className="dashboard-heading"><Bar w="220px" h={30} /><Bar w="340px" h={13} mt={12} /></div>
          <div className="dashboard-subnav"><Bar w="100%" h={16} /></div>
          <div className="dashboard-top">
            <div className="account-balance">
              <Bar w="150px" h={16} /><Bar w="260px" h={54} mt={18} />
              <Bar w="100%" h={13} mt={18} />
              <div className="money-states">
                {[0, 1, 2].map((i) => (
                  <div className="money-state" key={i}><Bar w="100%" h={12} /><Bar w="100%" h={24} mt={12} /><Bar w="90%" h={12} mt={8} /></div>
                ))}
              </div>
              <Bar w="160px" h={38} mt={24} />
            </div>
            <div className="payout-overview">
              <Bar w="130px" h={16} /><Bar w="180px" h={28} mt={20} />
              <Bar w="100%" h={13} mt={18} /><Bar w="86%" h={13} mt={9} />
              <div className="payout-latest"><Bar w="120px" h={12} /><Bar w="180px" h={20} mt={12} /><Bar w="100%" h={13} mt={12} /></div>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-primary">
              <div className="card dashboard-section">
                <div className="card-h dashboard-section-head"><Bar w="190px" h={18} /></div>
                <div className="card-b dashboard-section-body">
                  {[0, 1, 2].map((i) => <div className="skel-row" key={i}><Bar w="42%" h={13} /><Bar w="30%" h={13} /></div>)}
                </div>
              </div>
            </div>
            <div className="dashboard-aside">
              <div className="card dashboard-section">
                <div className="card-h dashboard-section-head"><Bar w="170px" h={18} /></div>
                <div className="card-b dashboard-section-body"><Bar w="100%" h={13} /><Bar w="100%" h={38} mt={18} /><Bar w="150px" h={38} mt={16} /></div>
              </div>
            </div>
          </div>
          <div className="dashboard-disclosures">
            {[0, 1, 2, 3, 4].map((i) => <div className="dashboard-disclosure" key={i}><div className="disclosure-summary"><Bar w="240px" h={15} /></div></div>)}
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
/**
 * The dashboard chrome every signed-in page draws before its own content.
 *
 * Shared rather than repeated, because the point of these placeholders is
 * that they match, and three copies of a nav bar is three chances for one of
 * them to stop matching.
 */
function DashChrome() {
  return (
    <div className="navbar dashboard-nav" aria-hidden="true">
      <div className="wrap-w">
        <div className="lp-nav dashboard-nav-inner">
          <Bar w="104px" h={20} />
          <Bar w="190px" h={16} />
        </div>
      </div>
    </div>
  );
}

/**
 * Two columns of titled cards under a page heading: Settings, and the
 * guardian's overview.
 *
 * IT USES THE REAL CLASSES. The cards here are .card.dashboard-section with a
 * .card-h and a .card-b inside, which is exactly what dash.tsx's Section
 * renders, and the page is .wrap-w under the same .navbar.dashboard-nav that
 * DashNav draws. That is deliberate: a placeholder built out of its own
 * private .skel-card has its own padding and its own border, so it is only
 * ever approximately the size of the thing it stands in for, and it drifts
 * every time Section changes. Borrowing the real classes means it cannot.
 *
 * WHAT WAS WRONG BEFORE. It drew no navigation at all, and both pages it
 * covers are mounted under a sticky dashboard nav. The placeholder was a
 * whole nav bar shorter than the page, so the heading jumped up the screen
 * the moment the real content arrived -- which is the one fault a skeleton
 * exists to prevent.
 */
export function PageSkeleton({
  what, left = 3, right = 2,
}: { what: string; left?: number; right?: number }) {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <DashChrome />
      <main className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}&hellip;
        </p>

        <div aria-hidden="true">
          <div className="page-h" style={{ marginBottom: 24 }}>
            <Bar w="220px" h={30} />
            <Bar w="340px" h={13} mt={10} />
          </div>

          <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
            <div>
              {Array.from({ length: left }, (_, i) => (
                <section className="card dashboard-section" style={{ marginBottom: 24 }} key={i}>
                  <div className="card-h dashboard-section-head"><Bar w="130px" h={16} /></div>
                  <div className="card-b dashboard-section-body">
                    <Bar w="100%" h={12} />
                    <Bar w="84%" h={12} mt={10} />
                  </div>
                </section>
              ))}
            </div>
            <div>
              {Array.from({ length: right }, (_, i) => (
                <section className="card dashboard-section" style={{ marginBottom: 24 }} key={i}>
                  <div className="card-h dashboard-section-head"><Bar w="150px" h={16} /></div>
                  <div className="card-b dashboard-section-body">
                    <Bar w="100%" h={12} />
                    <Bar w="90%" h={12} mt={10} />
                    <Bar w="66%" h={12} mt={10} />
                  </div>
                </section>
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
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      {/* .task-nav, as /pay and the consent page both render it. Without the
          class the bar was a plain .lp-nav and sat at a different height. */}
      <div className="wrap-s" aria-hidden="true">
        <div className="lp-nav task-nav">
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

          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-b">
              <Bar w="55%" h={14} />
              <Bar w="100%" h={11} mt={14} />
              <Bar w="78%" h={11} mt={8} />
              <Bar w="120px" h={30} mt={20} />
            </div>
          </div>

          <Bar w="100%" h={44} mt={20} />
          <Bar w="60%" h={11} mt={14} />
        </div>
      </main>
    </div>
  );
}

/**
 * One column of rows under a page heading: the founder's products.
 *
 * Not PageSkeleton, which draws two columns. That page is a single Section
 * holding a list and a form, and a two-column placeholder would rearrange
 * itself into one the moment the real thing arrived.
 *
 * It was missing the dashboard nav, same as PageSkeleton was, and it drew its
 * card with the placeholder's own border rather than the Section's. Both are
 * the real classes now.
 */
export function ListSkeleton({
  what, rows = 3,
}: { what: string; rows?: number }) {
  return (
    <div className="fw">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <DashChrome />
      <main className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}&hellip;
        </p>

        <div aria-hidden="true">
          <div className="page-h" style={{ marginBottom: 24 }}>
            <Bar w="220px" h={30} />
            <Bar w="340px" h={13} mt={10} />
          </div>

          <section className="card dashboard-section" style={{ marginBottom: 24 }}>
            <div className="card-h dashboard-section-head"><Bar w="140px" h={16} /></div>
            <div className="card-b dashboard-section-body">
              {Array.from({ length: rows }, (_, i) => (
                <div className="skel-row" key={i}>
                  <Bar w="46%" h={12} />
                  <Bar w="92px" h={12} />
                </div>
              ))}
            </div>
          </section>

          {/* The add-a-product form is its own Section on the real page,
              always present whether or not the list above it has anything
              in it. It was drawn inside the list's card here, which put a
              border where the page has a gap. */}
          <section className="card dashboard-section">
            <div className="card-h dashboard-section-head"><Bar w="180px" h={16} /></div>
            <div className="card-b dashboard-section-body">
              <Bar w="100%" h={38} />
              <Bar w="100%" h={38} mt={10} />
              <Bar w="150px" h={40} mt={16} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * The auth shell's shape: a nav line, then text beside a card.
 *
 * Used where an auth page waits on the database rather than only on the
 * person -- /auth/verify looks a token up before it can say anything, and
 * that is a page somebody reaches by clicking a link in an email, so a blank
 * screen reads as a dead link rather than as a slow one.
 *
 * IT BORROWS AuthShell'S OWN CLASSES, and this one was the furthest off. The
 * real shell is .auth-main, which sets min-height to the viewport less the
 * nav and lays its two halves out with .auth-layout. The placeholder used a
 * bare .wrap-lp with inline padding and a plain .truthgrid, so it was both
 * shorter than the page and spaced differently from it: the card arrived in
 * a different place than the grey box that had been standing in for it, on
 * the one kind of page where a reader is already wondering whether their
 * link worked.
 */
export function AuthSkeleton({ what }: { what: string }) {
  return (
    <div className="fw auth-page">
      <style href="veyro-css" precedence="default">{CSS + CSS2}</style>
      <div className="navbar">
        <div className="wrap-lp">
          <div className="lp-nav">
            <Bar w="86px" h={21} />
            <Bar w="120px" h={14} />
          </div>
        </div>
      </div>
      <main className="wrap-lp auth-main">
        <p className="sr-only" role="status" aria-live="polite">
          Loading {what}&hellip;
        </p>

        <div className="truthgrid auth-layout" aria-hidden="true">
          <div className="auth-intro">
            <Bar w="70%" h={30} />
            <Bar w="100%" h={12} mt={16} />
            <Bar w="86%" h={12} mt={8} />
          </div>
          <div className="card">
            <div className="card-b">
              <Bar w="55%" h={14} />
              <Bar w="100%" h={11} mt={14} />
              <Bar w="78%" h={11} mt={8} />
              <Bar w="100%" h={40} mt={20} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
