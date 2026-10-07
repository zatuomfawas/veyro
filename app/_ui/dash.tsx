// Shared furniture for the signed-in pages.
//
// The founder dashboard, the guardian dashboard and settings are three views of
// one product, and before this they each grew their own nav, their own card
// heading and their own date format. Anyone moving between them noticed. The
// pieces below are the parts that should look identical everywhere, so they are
// written once.

import Link from "next/link";
import { Wordmark, SkipLink } from "@/app/_ui/marks";
import SignOut from "@/app/_ui/SignOut";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { MobileNav } from "@/app/_ui/MobileNav";

export const SUPPORT_EMAIL = "hello@withveyro.com";

/** One date format across every signed-in surface. */
export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export type DashRole = "FOUNDER" | "GUARDIAN" | "ADMIN";

const HOME_FOR: Record<string, string> = {
  FOUNDER: "/dashboard/founder",
  GUARDIAN: "/dashboard/guardian",
};

/**
 * The signed-in header. `current` dims the link to the page you are already on
 * rather than hiding it, so the set of places you can go does not change shape
 * as you move between them.
 */
export function DashNav({
  role, current,
}: { role?: DashRole; current?: "dashboard" | "settings" } = {}) {
  const home = role ? HOME_FOR[role] : undefined;

  return (
    <>
      <SkipLink />
      {/* .navbar makes it sticky. A dashboard scrolls a long way, and Settings
          and Sign out were both gone by the second screen. */}
      <div className="navbar">
        <div className="wrap-w">
          <nav className="lp-nav" aria-label="Dashboard">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={21} tile /></Link>
          {/* Four controls did not fit a phone.
              ------------------------------------------------------------
              Measured at 375: the links row needs about 306px of buttons
              and has 245px to put them in, because at pointer:coarse every
              one of them is a 44px target. It wrapped to two rows, which
              made .lp-links 92px tall inside a 62px bar -- so it sat at
              top:-15 and spilled above and below it. That is the
              misalignment: not the wordmark drifting, the links overflowing
              a fixed-height row.

              Same answer the marketing nav already uses: the two
              navigation LINKS go behind the Menu button below 760px, and
              the two things that are not navigation -- the theme switch
              and Sign out -- stay where they are. Nothing is lost; the menu
              carries both links. .hide-s and .mobmenu are exact
              complements at that breakpoint, so neither duplicates. */}
          <div className="lp-links">
            {home && (
              <Link
                className="btn btn-q btn-sm hide-s"
                href={home}
                aria-current={current === "dashboard" ? "page" : undefined}
              >
                Dashboard
              </Link>
            )}
            <Link
              className="btn btn-q btn-sm hide-s"
              href="/dashboard/settings"
              aria-current={current === "settings" ? "page" : undefined}
            >
              Settings
            </Link>
            {/* Before Sign out, so the destructive control stays last. */}
            <ThemeToggle />
            <SignOut />
            <MobileNav
              items={[
                ...(home ? [{ href: home, label: "Dashboard" }] : []),
                { href: "/dashboard/settings", label: "Settings" },
              ]}
            />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

/** Page title, one line of context, and a status chip. */
export function DashHeader({
  title, subtitle, badge,
}: { title: string; subtitle?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="page-h" style={{ marginBottom: 24 }}>
      <div className="row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)", margin: 0 }}>{title}</h1>
        {badge}
      </div>
      {subtitle && <p className="body" style={{ marginTop: 8 }}>{subtitle}</p>}
    </div>
  );
}

/** A titled card. */
export function Section({
  title, aside, children,
}: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <div className="card-h">
        <h2 className="h4" style={{ margin: 0 }}>{title}</h2>
        {aside}
      </div>
      <div className="card-b">{children}</div>
    </section>
  );
}

/* EmptyState used to live here as a centred box taking only `children`. It is
   now app/_ui/EmptyState.tsx: left-aligned, and it requires a heading and an
   action, because the old one let a caller ship a dead end by passing a
   sentence and nothing else. Re-exported so the import sites that treat
   dash.tsx as the one furniture module keep working. */
export { EmptyState } from "@/app/_ui/EmptyState";
