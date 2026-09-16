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
      <div className="wrap-w">
        <div className="lp-nav">
          <Link href="/" aria-label="Veyro, home"><Wordmark size={20} /></Link>
          <div className="lp-links">
            {home && (
              <Link
                className="btn btn-q btn-sm"
                href={home}
                aria-current={current === "dashboard" ? "page" : undefined}
              >
                Dashboard
              </Link>
            )}
            <Link
              className="btn btn-q btn-sm"
              href="/dashboard/settings"
              aria-current={current === "settings" ? "page" : undefined}
            >
              Settings
            </Link>
            <SignOut />
          </div>
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

/** The "nothing here yet" state, centred, for empty tables and lists. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
