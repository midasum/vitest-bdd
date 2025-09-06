import { defineConfig } from "vitest/config";
import { vitestBdd } from "./src/index";

export default defineConfig({
  plugins: [vitestBdd()],
  test: {
    include: ["**/*.spec.ts", "test/**/*_test.res"],
  },
});
