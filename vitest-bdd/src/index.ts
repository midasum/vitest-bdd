import { readFileSync } from "node:fs";
import { SourceMapGenerator } from "source-map";
import type { Plugin } from "vitest/config";
import { parse, type SourceLocation } from "./parser";
export * from "./steps";

export function vitestBdd(
  { debug }: { debug: boolean } = { debug: false }
): Plugin {
  return {
    name: "vitest-bdd",
    enforce: "pre",
    resolveId(id) {
      if (id.endsWith(".feature") || id.endsWith(".md")) return id;
    },
    load(id) {
      if (id.endsWith(".feature") || id.endsWith(".md")) {
        return compile(id, debug);
      }
    },
  };
}

function compile(path: string, debug = false) {
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const feature = parse(text, path.endsWith(".md") ? "markdown" : "classic");
  const out: string[] = [];
  const map = new SourceMapGenerator({ file: path });
  function push(text: string, location: SourceLocation) {
    const line = lines[location.line];
    const column = line
      ? line.length - line.replace(/^(-|\*) /, "").trimStart().length
      : 0;
    out.push(text);
    map.addMapping({
      source: path,
      generated: { line: out.length, column: 0 },
      original: { line: location.line, column },
    });
  }
  const base = { line: 1, column: 0 };
  push(`import { describe, it } from "vitest";`, base);
  push(`import { load } from "vitest-bdd";`, base);
  push(`import ${JSON.stringify(path + ".ts")};`, base);
  push(`describe(${JSON.stringify(feature.title)}, () => {`, feature.location);
  for (const scenario of feature.scenarios) {
    push(`  it(${JSON.stringify(scenario.title)}, () => {`, scenario.location);
    const given = scenario.steps[0];
    if (!given) {
      throw new Error("Scenario has no Given step");
    }
    push(`    const runner = load(${JSON.stringify(given)});`, given.location);
    for (const step of scenario.steps.slice(1)) {
      push(
        `    runner.operation(${JSON.stringify(
          step.query
        )})(...${JSON.stringify(step.params)});`,
        step.location
      );
    }
    push(`  });`, given.location);
    push("", given.location);
  }
  push(`});`, feature.location);
  push("", feature.location);
  if (debug) {
    console.log(out.join("\n"));
  }
  return { code: out.join("\n"), map: map.toJSON() };
}
