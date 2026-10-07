import { AuthSkeleton } from "@/app/_ui/Skeleton";

// Also reached by clicking a link in an email, and it looks a token up before
// it can say anything at all.
export default function LoadingState() {
  return <AuthSkeleton what="your verification link" />;
}
