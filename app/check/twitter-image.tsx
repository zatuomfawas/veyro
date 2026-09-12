// Same artwork for Twitter/X Cards as Open Graph — kept as a separate file
// because opengraph-image and twitter-image are distinct Next.js file
// conventions and neither is documented to fall back to the other.
export { default, alt, size, contentType } from "./opengraph-image";
