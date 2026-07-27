import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { SourceMapGenerator } from "source-map";
import type { Plugin } from "vite";
import { parse, type SourceLocation } from "./parser";
import { resCompile, resCompiledResolver } from "./resCompile";
import { yamlCompile } from "./yamlCompile";

export { resCompiledResolver } from "./resCompile";
export { type Context, Given, type Step } from "./steps";
export { toNumbers, toRecords, toStrings } from "./utils";

/** Configuration accepted by {@link epureVitest}. */
export type EpureVitestOptions = {
  /** Print the translated Vitest suite. */
  debug?: boolean;
  /** Run scenarios concurrently. Defaults to `true`. */
  concurrent?: boolean;
  /** File extensions containing fenced Gherkin. */
  markdownExtensions?: string[];
  /** File extensions containing Gherkin features. */
  gherkinExtensions?: string[];
  /** ReScript files Vitest should translate with source maps. */
  rescriptExtensions?: string[];
  /** Resolve a feature or Markdown contract to its steps module. */
  stepsResolver?: (path: string) => string | null;
  /** Resolve a ReScript source file to its compiled JavaScript module. */
  resCompiledResolver?: (path: string) => string | null;
};

/** @deprecated Use {@link EpureVitestOptions} instead. */
export type VitestBddOptions = EpureVitestOptions;

/** Configuration accepted by {@link yamlBdd}. */
export type YamlBddOptions = {
  /** File suffix compiled into suites. Defaults to `.test.yaml`. */
  suffix?: string;
  /** Run scenarios concurrently. Defaults to `true`. */
  concurrent?: boolean;
  /** Resolve a fixture to its steps module. */
  stepsResolver?: (path: string) => string | null;
  /** Print each generated module. */
  debug?: boolean;
};

const defaultOptions: Required<EpureVitestOptions> = {
  debug: false,
  concurrent: true,
  markdownExtensions: [".md", ".mdx", ".markdown"],
  gherkinExtensions: [".feature"],
  rescriptExtensions: [".res"],
  stepsResolver,
  resCompiledResolver,
};

/** Create the Vite plugin that translates contracts into Vitest suites. */
export function epureVitest(opts: EpureVitestOptions = {}): Plugin {
  const options: Required<EpureVitestOptions> = { ...defaultOptions, ...opts };
  return {
    name: "@epure/vitest",
    enforce: "pre",
    load(id) {
      return compile(id, options);
    },
  };
}

let warned = false;

/** @deprecated Use {@link epureVitest} instead. */
export function vitestBdd(opts: VitestBddOptions = {}): Plugin {
  if (!warned) {
    console.warn("vitestBdd is deprecated. Use epureVitest instead.");
    warned = true;
  }
  return epureVitest(opts);
}

/** Create the Vite plugin that translates YAML examples into Vitest suites. */
export function yamlBdd(options: YamlBddOptions = {}): Plugin {
  const suffix = options.suffix ?? ".test.yaml";
  const resolveSteps = options.stepsResolver ?? yamlStepsResolver;
  return {
    name: "@epure/vitest/yaml",
    enforce: "pre",
    load(id) {
      const path = id.split("?")[0] ?? id;
      if (!path.endsWith(suffix)) {
        return;
      }
      return yamlCompile(path, {
        stepsPath: resolveSteps(path),
        concurrent: options.concurrent,
        debug: options.debug,
      });
    },
  };
}

function compile(path: string, opts: Required<EpureVitestOptions>) {
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
      original: { line: location.line, column },
      generated: { line: out.length, column: 0 },
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
    push(`import { load } from "@epure/vitest/runtime";`, base);
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
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".res.mjs", ".res.jsx", ".res.tsx"]) {
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
  return baseResolver(join(dirname(path), "steps"));
}

/** Resolve `name.test.yaml` to a fixture-specific or shared steps module. */
export function yamlStepsResolver(path: string): string | null {
  const stem = path.replace(/\.yaml$/, "");
  return (
    baseResolver(stem) ?? baseResolver(stem.replace(/\.test$/, ".steps")) ?? baseResolver(join(dirname(path), "steps"))
  );
}
