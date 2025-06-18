import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { parse } from "./parser";
export { runScenario } from "./parser";
export * from "./steps";

export function vitestBdd(): Plugin {
  return {
    name: "vitest-bdd",
    enforce: "pre",
    // Handle .foobar files as virtual modules
    resolveId(id) {
      if (id.endsWith(".feature")) return id;
    },
    load(id) {
      if (id.endsWith(".feature")) {
        const text = readFileSync(id, "utf8");
        const features = parse(text);
        const out: string[] = [];
        out.push(`import { describe, it } from "vitest";`);
        out.push(`import { runScenario } from "vitest-bdd";`);
        out.push(
          `import ${JSON.stringify(id.replace(".feature", ".steps.ts"))};`
        );
        for (const feature of features) {
          out.push(`describe(${JSON.stringify(feature.title)}, () => {`);
          for (const scenario of feature.scenarios) {
            out.push(`  it(${JSON.stringify(scenario.title)}, () => {`);
            out.push(`     runScenario(${JSON.stringify(scenario, null, 2)});`);
            out.push(`  });`);
            out.push("");
          }
          out.push(`});`);
          out.push("");
        }
        return out.join("\n");
      }
    },
  };
}
