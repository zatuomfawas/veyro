import { permanentRedirect } from "next/navigation";

// /eligibility is the name people search for and type; /check is where the
// checker has always lived and what every canonical, OG card and sitemap entry
// points at. A second page with the same content would split the ranking and
// double the maintenance, so this is a permanent redirect rather than a copy.
export default function Eligibility() {
  permanentRedirect("/check");
}
