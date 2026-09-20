"use client";

// What happened while you were away.
//
// Three routes have been writing Notification rows since before this existed —
// "You got paid", "Payment setup needs redoing", "{name} is now your guardian" —
// and nothing ever read them back. The schema even carries an index on
// (userId, readAt) for an unread query no code was making. A founder could be
// paid and never be told inside the product.
//
// Rendered from rows the page already fetched on the server. This component is
// a client component only so that marking something read does not need a full
// page navigation.

import { useState } from "react";
import Link from "next/link";
import { Btn } from "@/app/_ui/form";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  routeName: string | null;
  createdAt: string;
  readAt: string | null;
};

/** Where a notification points, when it points anywhere this app can render. */
const DESTINATION: Record<string, { href: string; label: string }> = {
  "founder.transactions": { href: "#transactions", label: "See the payment" },
  "founder.payments": { href: "#payouts", label: "Payment setup" },
  "founder.payouts": { href: "#payouts", label: "See payouts" },
  "founder.guardian": { href: "#guardian", label: "Your guardian" },
};

function when(iso: string): string {
  const then = new Date(iso);
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Notifications({ rows }: { rows: NotificationRow[] }) {
  // Seeded from the server rows and updated locally, so dismissing one does not
  // reorder or re-render the list underneath the reader's finger.
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const isRead = (n: NotificationRow) => Boolean(n.readAt) || read[n.id];
  const unread = rows.filter((n) => !isRead(n));

  async function mark(payload: { id: string } | { all: true }) {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Marking something read is not worth an error message. The row is still
      // on screen and the next page load will show its true state.
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: "var(--sp-6)" }}>
      <div className="card-h">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>
          Recent activity
          {unread.length > 0 && (
            <span className="badge b-amber" style={{ marginLeft: 8 }}>
              {unread.length} new
            </span>
          )}
        </span>
        {unread.length > 0 && (
          <Btn
            type="button"
            variant="q"
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const next: Record<string, boolean> = {};
              for (const n of unread) next[n.id] = true;
              setRead((r) => ({ ...r, ...next }));
              await mark({ all: true });
              setBusy(false);
            }}
          >
            Mark all read
          </Btn>
        )}
      </div>

      <div className="card-b">
        <div className="reqlist">
          {rows.map((n) => {
            const seen = isRead(n);
            const dest = n.routeName ? DESTINATION[n.routeName] : undefined;
            return (
              <div className="reqrow" key={n.id}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  {/* Square, like the setup markers on the dashboard and like
                      everything else in a system whose first rule is
                      --radius:0. Read rows keep the same indent so the list
                      does not shift as things are read. */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: "var(--marker)", height: "var(--marker)",
                      flex: "0 0 var(--marker)", marginTop: 6,
                      background: seen ? "transparent" : "var(--amber)",
                      border: seen ? "1px solid var(--line)" : "none",
                    }}
                  />
                  <span style={{ minWidth: 0 }}>
                    <span className="req-t" style={{ fontWeight: seen ? 400 : 560 }}>
                      {n.title}
                      <span className="sr-only">{seen ? " (read)" : " (unread)"}</span>
                    </span>
                    <span className="req-d">
                      {n.body}{" "}
                      <span className="tiny" style={{ whiteSpace: "nowrap" }}>{when(n.createdAt)}</span>
                    </span>
                    {(dest || !seen) && (
                      <span className="row n-actions" style={{ gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        {dest && (
                          <Link
                            className="linkbtn"
                            href={dest.href}
                            onClick={() => {
                              if (seen) return;
                              setRead((r) => ({ ...r, [n.id]: true }));
                              void mark({ id: n.id });
                            }}
                          >
                            {dest.label}
                          </Link>
                        )}
                        {!seen && (
                          <button
                            type="button"
                            className="linkbtn"
                            onClick={() => {
                              setRead((r) => ({ ...r, [n.id]: true }));
                              void mark({ id: n.id });
                            }}
                          >
                            Mark read
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
