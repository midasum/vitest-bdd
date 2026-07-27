import { existsSync } from "node:fs";
import { epureVitest, stepsResolver as originalStepsResolver, yamlBdd } from "@epure/vitest";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    epureVitest({
      stepsResolver: testStepsResolver,
    }),
    yamlBdd(),
    tsconfigPaths(),
  ],

  test: {
    pool: "threads",
    include: ["src/**/*.feature", "src/**/*.md", "src/**/*.spec.ts", "src/**/*_test.res", "src/**/*.test.yaml"],
  },
});

function testStepsResolver(path: string): string | null {
  const p = originalStepsResolver(path);
  if (p) {
    return p;
  }
  const p2 = path.replace(/\.feature$/, ".foobar.ts");
  if (existsSync(p2)) {
    return p2;
  }
  return null;
}
