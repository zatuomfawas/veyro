import { NarrowSkeleton } from "@/app/_ui/Skeleton";

// The preview reads the product and the founder's payment account before it can
// show what a customer would see. It had no loading state at all, so the founder
// met a blank screen between pressing Preview and the page arriving.
export default function LoadingState() {
  return <NarrowSkeleton what="your checkout preview" />;
}
