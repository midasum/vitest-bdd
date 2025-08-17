import { existsSync } from "node:fs";
import tsconfigPaths from "vite-tsconfig-paths";
import { stepsResolver as originalStepsResolver, vitestBdd } from "vitest-bdd";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    vitestBdd({
      stepsResolver: testStepsResolver,
    }),
    tsconfigPaths(),
  ],
  test: {
    pool: "threads",
    include: ["**/*.feature", "**/*.md", "**/*.spec.ts"],
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
