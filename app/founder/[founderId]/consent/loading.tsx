import { NarrowSkeleton } from "@/app/_ui/Skeleton";

// The page a parent lands on from an email, and the one with the most
// database work behind it on the public side -- the consent row, the founder,
// the guardian, the payment account. On a suspended database that is a wait,
// and a blank screen on a link from an email reads as a broken link rather
// than a slow one. This is the step the funnel already loses half its
// guardians at; it does not need help.
export default function LoadingState() {
  return <NarrowSkeleton what="this invitation" />;
}
