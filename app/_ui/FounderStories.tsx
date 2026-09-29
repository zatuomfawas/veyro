import Image from "next/image";
import { FOUNDER_STORIES, type FounderStory } from "@/lib/stories";

// Real founders, or nothing at all.
//
// The section returns null while lib/stories.ts is empty, so an unfilled slot
// is invisible rather than a row of placeholder faces that read as customers.
// See that file for what has to be true before a story goes in it.

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Story({ s }: { s: FounderStory }) {
  return (
    <figure className="story">
      <blockquote className="story-q">{s.quote}</blockquote>
      <figcaption className="story-by">
        {s.avatar
          ? <Image className="story-av" src={s.avatar} alt="" width={36} height={36} />
          : <span className="story-av story-ini" aria-hidden="true">{initials(s.name)}</span>}
        <span>
          <b>{s.name}</b>
          <span className="story-m">{s.building}</span>
        </span>
        {s.amount && <span className="story-amt">{s.amount}</span>}
      </figcaption>
    </figure>
  );
}

export function FounderStories() {
  if (FOUNDER_STORIES.length === 0) return null;

  return (
    <section className="lp ch ch-surface" id="founders">
      <div className="wrap-lp">
        <div className="headc">
          <span className="lp-eyebrow">Who is doing this</span>
          <h2 className="lp-h2" style={{ marginTop: "var(--sp-2)" }}>
            Founders who shipped it and got paid.
          </h2>
        </div>
        <div className="stories">
          {FOUNDER_STORIES.map((s) => <Story key={s.name + s.building} s={s} />)}
        </div>
      </div>
    </section>
  );
}
