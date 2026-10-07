import { ListSkeleton } from "@/app/_ui/Skeleton";

export default function LoadingState() {
  return <ListSkeleton what="your products" rows={3} />;
}
