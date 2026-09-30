// The last seven days of takings, as buckets.
//
// Lives here rather than in the page for two reasons. It is data logic, not
// view logic — the page should ask for a week and be handed one. And reading
// the clock inside a component body is impure even in a server component, so
// the lint rule that guards render purity is right to object; the clock is
// read here instead, once, on the way in.

const DAY = 24 * 60 * 60 * 1000;

/** Midnight at the start of the day six days before today, in server-local time. */
export function weekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - 6 * DAY);
}

export type DayPoint = { label: string; minor: number };

/**
 * Seven buckets, oldest first, one per day including today.
 *
 * Built from the day boundaries rather than by grouping in SQL, so a day with
 * no payments is still a day on the chart. Grouping would return six rows for
 * a week with one quiet day and the chart would silently close the gap up,
 * which makes a patchy week look like a steady one.
 */
export function foldWeek(
  rows: { createdAt: Date; amountMinor: number }[],
  locale = "en-GB",
): DayPoint[] {
  const from0 = weekStart().getTime();
  return Array.from({ length: 7 }, (_, i) => {
    const from = from0 + i * DAY;
    const to = from + DAY;
    const minor = rows.reduce((n, r) => {
      const t = r.createdAt.getTime();
      return t >= from && t < to ? n + r.amountMinor : n;
    }, 0);
    return {
      label: new Date(from).toLocaleDateString(locale, { weekday: "narrow" }),
      minor,
    };
  });
}
