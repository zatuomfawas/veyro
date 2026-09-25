// A short fade between pages.
//
// A template, not a layout: Next re-mounts this on every navigation, which is
// exactly the hook a route transition needs, and it stays a server component so
// it costs no JavaScript.
//
// The wrapper is a plain block box with no styles of its own beyond the
// animation. Every page already renders its own .fw root and the ground colour
// lives on body, so nothing about layout, width or background changes by having
// one more div in between.
//
// Deliberately short and opacity-only. A page that slides or scales on every
// link makes the site feel slower than it is, and this one is carrying a
// checkout: nobody paying for something wants choreography between them and the
// card form. 160ms of fade is enough to read as one application rather than a
// series of documents.
//
// animation, not transition, with no starting opacity in the stylesheet — so if
// the animation never runs, for any reason, the page is simply visible. Content
// is never hidden waiting for motion.

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-in">{children}</div>;
}
