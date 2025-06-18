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
      if (id.endsWith(".feature") || id.endsWith(".md")) return id;
    },
    load(id) {
      if (id.endsWith(".feature") || id.endsWith(".md")) {
        const text = readFileSync(id, "utf8");
        const feature = parse(id, text);
        const out: string[] = [];
        out.push(`import { describe, it } from "vitest";`);
        out.push(`import { runScenario } from "vitest-bdd";`);
        out.push(
          `import ${JSON.stringify(id.replace(/\.[^.]+$/, ".steps.ts"))};`
        );
        out.push(`describe(${JSON.stringify(feature.title)}, () => {`);
        for (const scenario of feature.scenarios) {
          out.push(`  it(${JSON.stringify(scenario.title)}, () => {`);
          out.push(
            `    runScenario(${indent(
              JSON.stringify(scenario, null, 2),
              "    "
            )});`
          );
          out.push(`  });`);
          out.push("");
        }
        out.push(`});`);
        out.push("");
        // { code, map }
        return out.join("\n");
      }
    },
  };
}

type SourceMap = {
  version: 3;
  file: string;
  sourceRoot: "";
  sources: string[];
  names: [];
  mappings: "AAAA;EACC;;AACA;EACC";
  sourcesContent: ["ul { list-style: none; li { display: inline; } }"];
};

function indent(text: string, indent: string) {
  return text.replace(/^/gm, indent).trim();
}
