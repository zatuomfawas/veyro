import { buildMetadata, buildViewport } from "@/lib/seo";
import CheckClient from "./CheckClient";

// Real Next.js metadata — server-rendered into the first byte of HTML, unlike
// prototype/veyro.jsx's useSEO() hook, which patches document.head from a
// useEffect after hydration and so is invisible to a crawler that doesn't run
// (or doesn't wait for) client JavaScript. See lib/seo.ts.
export const metadata = buildMetadata("check");
export const viewport = buildViewport();

// A public, standalone page: no auth, no database, no API calls. Everything the
// checker needs — country data, region overrides, the eligibility() routing
// logic — runs client-side in CheckClient, ported verbatim from the prototype.
export default function CheckPage() {
  return <CheckClient />;
}
