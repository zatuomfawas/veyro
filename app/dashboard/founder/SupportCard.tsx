import { supportMailto, PRIORITY_TARGET } from "@/lib/support";

// Where to get a person, and what to expect from them.
//
// Two routes, because the two people need different things: a founder with a
// question about their own money, and a parent who wants to talk to a human
// about something they have put their name to. Both are tagged so they arrive
// sorted; neither is a form, a bot or a queue.

export function SupportCard({
  founderId, eligible, guardianName,
}: {
  founderId: string;
  eligible: boolean;
  guardianName: string;
}) {
  return (
    <div className="stack">
      <p className="body" style={{ margin: 0 }}>
        {eligible
          ? <>You are over $100 this month, so your messages are answered first. {PRIORITY_TARGET}</>
          : <>Email us and a person replies. We aim to be quick; we do not put a number on it
             unless you are over $100 in a month, when the target is 24 hours.</>}
      </p>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <a className="btn btn-2 btn-sm"
           href={supportMailto({ audience: "founder", priority: eligible, founderId })}>
          {eligible ? "Email support (priority)" : "Email support"}
        </a>
        <a className="btn btn-2 btn-sm"
           href={supportMailto({
             audience: "guardian", priority: eligible, founderId,
             subject: "A question from a parent or guardian",
           })}>
          A route for {guardianName}
        </a>
      </div>
      <p className="tiny" style={{ margin: 0 }}>
        The second one is for {guardianName} to use directly. It reaches a person, not a form.
      </p>
    </div>
  );
}
