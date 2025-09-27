import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  splitting: false,
  external: [
    "vitest",
    "vite",
    // Add any other external dependencies that should not be bundled
  ],
  // This ensures external dependencies are not bundled
  noExternal: [],
});
