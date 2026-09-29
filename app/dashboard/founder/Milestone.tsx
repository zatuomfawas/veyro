// The line that says how it is going.
//
// Every number it reacts to is the founder's own: the count comes from their
// payment records, so there is nothing to invent and nothing to inflate. It
// congratulates a real first sale and says nothing at all before there is a
// product to sell, because cheering an empty account is how a dashboard starts
// sounding like an advert for itself.
//
// The closing clause is the only "community" claim on the page, and it is true
// by construction rather than by counting: every founder account on Veyro
// belongs to someone under 18. It does not imply a forum, a Discord or a
// member count, because there is not one.

export function Milestone({
  purchases, hasLiveProduct,
}: { purchases: number; hasLiveProduct: boolean }) {
  // Nothing to say yet. The setup checklist below is already telling them
  // what to do, and a second voice saying it louder does not help.
  if (!hasLiveProduct) return null;

  let head: string;
  let sub: string;

  if (purchases === 0) {
    head = "Your checkout is live.";
    sub = "The build is done. Getting it in front of people is the whole job now.";
  } else if (purchases === 1) {
    head = "First sale.";
    sub = "That is the one most people never get to. It works — now do it again.";
  } else if (purchases < 10) {
    head = `${purchases} sales.`;
    sub = "Not a fluke any more. Whatever brought those people, do more of it.";
  } else if (purchases < 50) {
    head = `${purchases} sales.`;
    sub = "This is a real thing now. Worth asking what the buyers have in common.";
  } else if (purchases < 100) {
    head = `${purchases} sales.`;
    sub = "Most people building at your age never ship. You shipped and it sells.";
  } else {
    head = `${purchases} sales.`;
    sub = "Three figures. Whatever you are doing, it is working — keep going.";
  }

  return (
    <div className="milestone">
      <p className="ms-h">{head}</p>
      <p className="ms-s">{sub}</p>
      <p className="ms-c">Every founder account on Veyro belongs to someone under 18.</p>
    </div>
  );
}
