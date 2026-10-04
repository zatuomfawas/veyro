// Money entering at one end and arriving at the other, with Veyro as the thing
// it passes through.
//
// This is the only diagram on the site that is allowed to appear more than
// once. The product is one sentence -- a customer pays, the money lands in an
// account the founder controls -- and a reader who meets that sentence drawn
// four different ways on four pages has met four products. Drawn identically
// every time, it becomes the thing they already know by the time they reach
// the page that needs them to know it.
//
// A server component with no JavaScript: the spark is a CSS animation on one
// element, so this costs nothing to put on a page and cannot fall out of sync
// with itself. Under reduced motion the spark stops and the line stays.
//
// The default stops are the real path. Veyro owns the second and the fourth;
// the money itself is only ever at the third, which is the claim the filled
// dots are making and the reason the fill is not decoration.

export type RailStop = {
  /** The all-caps kicker: whose step this is. */
  k: string;
  /** What happens here, in two or three words. */
  t: string;
  /** Ours, and drawn as such. */
  ours?: boolean;
};

const DEFAULT_STOPS: RailStop[] = [
  { k: "Customer", t: "Pays by card" },
  { k: "Veyro", t: "Hosted checkout", ours: true },
  { k: "Processor", t: "Takes the payment" },
  { k: "Veyro", t: "Your wallet", ours: true },
  { k: "You", t: "Your bank account" },
];

export function MoneyRail({
  stops = DEFAULT_STOPS,
  label = "How a payment travels: customer, Veyro checkout, payment processor, your wallet, your bank account",
}: {
  stops?: RailStop[];
  label?: string;
}) {
  return (
    <div className="mrail" style={{ ["--mrail-n" as string]: String(stops.length) }}>
      {/* The line sits outside the list. It carries no meaning the labels do
          not already carry, and a decorative element inside an <ol> is a list
          item whether or not it is hidden. */}
      <span className="mrail-line" aria-hidden="true">
        <span className="mrail-spark" />
      </span>
      <ol className="mrail-track" aria-label={label}>
        {stops.map((s, i) => (
          <li className="mrail-node" key={`${s.k}-${i}`} data-ours={s.ours ? "1" : undefined}>
            <span className="mrail-dot" aria-hidden="true" />
            <span className="mrail-k">{s.k}</span>
            <span className="mrail-t">{s.t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
