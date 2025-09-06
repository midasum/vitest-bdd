import { existsSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { SourceMapGenerator } from "source-map";
import type { Plugin } from "vite";
import { parse, type SourceLocation } from "./parser";
import { resCompile, resCompiledResolver } from "./resCompile";
export * from "./steps";
export * from "./utils";

export type VitestBddOptions = {
  debug?: boolean;
  concurrent?: boolean;
  markdownExtensions?: string[];
  gherkinExtensions?: string[];
  rescriptExtensions?: string[];
  stepsResolver?: (path: string) => string | null;
  resCompiledResolver?: (path: string) => string | null;
};

const defaultOptions: Required<VitestBddOptions> = {
  debug: false,
  concurrent: true,
  markdownExtensions: [".md", ".mdx", ".markdown"],
  gherkinExtensions: [".feature"],
  rescriptExtensions: [".res"],
  stepsResolver,
  resCompiledResolver,
};

export function vitestBdd(opts: VitestBddOptions = {}): Plugin {
  const options: Required<VitestBddOptions> = { ...defaultOptions, ...opts };
  return {
    name: "vitest-bdd",
    enforce: "pre",
    resolveId(id) {
      const ext = extname(id);
      if (options.markdownExtensions.includes(ext) || options.gherkinExtensions.includes(ext)) return id;
    },
    load(id) {
      return compile(id, options);
    },
  };
}

function compile(path: string, opts: Required<VitestBddOptions>) {
  const { debug, rescriptExtensions, markdownExtensions, gherkinExtensions } = opts;
  const concurrent = opts.concurrent ? ".concurrent" : "";
  const ext = extname(path);
  if (rescriptExtensions.includes(ext)) {
    return resCompile(path, opts);
  }
  const isMarkdown = markdownExtensions.includes(ext);
  if (!gherkinExtensions.includes(ext) && !isMarkdown) {
    return;
  }
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const feature = parse(text, isMarkdown);
  if (!feature) {
    return `
    import { describe} from "vitest";
    describe.skip("Markdown without feature", () => {});
  `;
  }
  const out: string[] = [];
  const map = new SourceMapGenerator({ file: path });
  function push(text: string, location: SourceLocation) {
    const line = lines[location.line];
    const column = line ? line.length - line.replace(/^(-|\*) /, "").trimStart().length : 0;
    out.push(text);
    map.addMapping({
      source: path,
      generated: { line: out.length, column: 0 },
      original: { line: location.line, column },
    });
  }
  const base = { line: 1, column: 0 };
  const stepsPath = opts.stepsResolver(path);
  if (!stepsPath) {
    const shortpath = path.split("/").slice(-4).join("/");
    push(`import { describe, it, assert } from "vitest";`, base);
    push(`describe${concurrent}(${JSON.stringify(feature.title)}, () => {`, feature.location);
    push(`  it(${JSON.stringify("Should have step definitions")}, () => {`, feature.location);
    push(
      `    assert.fail(${JSON.stringify(`Steps file for feature ${JSON.stringify(shortpath)} not found.`)});`,
      feature.location,
    );
    push(`  });`, feature.location);
    push(`});`, feature.location);
  } else {
    push(`import { describe, test } from "vitest";`, base);
    push(`import { load } from "vitest-bdd";`, base);
    push(`import ${JSON.stringify(stepsPath)};`, base);
    push(`describe${concurrent}(${JSON.stringify(feature.title)}, () => {`, feature.location);
    for (const scenario of feature.scenarios) {
      push(`  test(${JSON.stringify(scenario.title)}, async (ctx) => {`, scenario.location);
      const given = scenario.steps[0];
      if (!given) {
        throw new Error("Scenario has no Given step");
      }
      push(`    const runner = await load(${JSON.stringify(given)}, ctx);`, given.location);
      for (const step of scenario.steps.slice(1)) {
        push(
          `    await runner.operation(${JSON.stringify(step.query)})(...${JSON.stringify(step.params)});`,
          step.location,
        );
      }
      push(`  });`, given.location);
      push("", given.location);
    }
    push(`});`, feature.location);
  }
  push("", feature.location);
  if (debug) {
    console.log(out.join("\n"));
  }
  return { code: out.join("\n"), map: map.toJSON() };
}

function baseResolver(path: string): string | null {
  for (const ext of [".ts", ".js", ".mjs", ".cjs", ".res.mjs"]) {
    const p = `${path}${ext}`;
    if (existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function stepsResolver(path: string): string | null {
  for (const r of [".feature", ".steps", "Steps"]) {
    const p = baseResolver(path.replace(/\.feature$/, r));
    if (p) {
      return p;
    }
  }
  return baseResolver(join(basename(path), "steps"));
}
