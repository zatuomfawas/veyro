import { Loading } from "@/app/_ui/Loading";

// The checkout page resolves the product and the seller's account status before
// it can say whether anything is purchasable, so a blank flash here lands on a
// customer who is about to be asked for card details.
export default function LoadingState() {
  return <Loading what="this payment page" wide={false} />;
}
