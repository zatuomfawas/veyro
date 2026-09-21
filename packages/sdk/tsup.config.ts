import { defineConfig } from "tsup";

// Two entries, so a project that never touches React never pulls it in. The
// core is plain DOM and works anywhere; ./react is a thin wrapper over it.
export default defineConfig({
  entry: { index: "src/index.ts", react: "src/react.tsx" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  external: ["react"],
});
