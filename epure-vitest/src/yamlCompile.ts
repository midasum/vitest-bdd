import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { type RawSourceMap, SourceMapGenerator } from "source-map";
import { isMap, isScalar, isSeq, LineCounter, type Node, type Pair, parseDocument } from "yaml";

export type YamlCompileOptions = {
  stepsPath: string | null;
  concurrent?: boolean;
  debug?: boolean;
};

type Position = { line: number; column: number };

export function yamlCompile(path: string, options: YamlCompileOptions): { code: string; map: RawSourceMap } {
  const name = relative(process.cwd(), path);
  const text = readFileSync(path, "utf8");
  const lineCounter = new LineCounter();
  const doc = parseDocument(text, { lineCounter });
  if (doc.errors.length > 0) {
    throw new Error(`${path}: ${doc.errors[0]?.message}`);
  }

  const top: Position = { line: 1, column: 0 };
  const posOf = (node: unknown, fallback: Position): Position => {
    if (typeof node === "object" && node !== null && "range" in node && Array.isArray(node.range)) {
      const { line, col } = lineCounter.linePos(node.range[0] as number);
      return { line, column: col - 1 };
    }
    return fallback;
  };

  const out: string[] = [];
  const map = new SourceMapGenerator({ file: path });
  map.setSourceContent(path, text);
  const push = (code: string, position: Position) => {
    out.push(code);
    map.addMapping({
      source: path,
      original: { line: position.line, column: position.column },
      generated: { line: out.length, column: 0 },
    });
  };
  const done = () => {
    const code = out.join("\n");
    if (options.debug) {
      console.log(code);
    }
    return { code, map: map.toJSON() };
  };

  if (options.stepsPath === null) {
    push(`import { assert, describe, it } from "vitest";`, top);
    push(`describe(${JSON.stringify(name)}, () => {`, top);
    push(`  it("should have a steps module", () => {`, top);
    push(`    assert.fail(${JSON.stringify(`No steps module found for ${name}`)});`, top);
    push(`  });`, top);
    push(`});`, top);
    return done();
  }

  const { feature, featurePos, given, examples } = readTop();
  const concurrent = options.concurrent === false ? "" : ".concurrent";
  push(`import { describe, it } from "vitest";`, top);
  push(`import ${JSON.stringify(options.stepsPath)};`, top);
  push(`import { loadYaml } from "@epure/vitest/runtime";`, top);
  push(`describe${concurrent}(${JSON.stringify(feature)}, () => {`, featurePos);
  if (examples !== undefined) {
    if (!isSeq(examples)) {
      throw new Error(`${path}: "examples" must be a sequence of scenarios`);
    }
    for (const item of examples.items as Node[]) {
      compileScenario(item);
    }
  }
  push(`});`, top);
  return done();

  function readTop(): { feature: string; featurePos: Position; given: string | undefined; examples: Node | undefined } {
    const contents = doc.contents;
    if (!isMap(contents)) {
      throw new Error(`${path}: document must be a mapping with "feature", "background", "examples"`);
    }
    let feature: string | undefined;
    let featurePos: Position = top;
    let given: string | undefined;
    let examples: Node | undefined;
    for (const pair of contents.items as Pair<Node, Node | null>[]) {
      const key = isScalar(pair.key) ? String(pair.key.value) : "?";
      if (key === "feature") {
        if (!isScalar(pair.value) || typeof pair.value.value !== "string") {
          throw new Error(`${path}: "feature" must be a string title`);
        }
        feature = pair.value.value;
        featurePos = posOf(pair.key, top);
      } else if (key === "background") {
        if (!isMap(pair.value)) {
          throw new Error(`${path}: background must be a mapping`);
        }
        for (const step of pair.value.items as Pair<Node, Node | null>[]) {
          const stepKey = isScalar(step.key) ? String(step.key.value) : "?";
          if (stepKey !== "given") {
            throw new Error(`${path}: unknown background step "${stepKey}" (expected "given")`);
          }
          if (!isScalar(step.value) || typeof step.value.value !== "string") {
            throw new Error(`${path}: background.given must be a string step name`);
          }
          given = step.value.value;
        }
      } else if (key === "examples") {
        if (pair.value !== null) {
          examples = pair.value;
        }
      } else {
        throw new Error(`${path}: unknown top-level key "${key}" (expected "feature", "background", "examples")`);
      }
    }
    if (feature === undefined) {
      throw new Error(`${path}: missing "feature" title`);
    }
    return { feature, featurePos, given, examples };
  }

  function compileScenario(item: Node): void {
    const itemPos = posOf(item, top);
    const fail = (message: string): never => {
      throw new Error(`${path}:${itemPos.line}: ${message}`);
    };
    if (!isMap(item)) {
      return fail("scenario must be a mapping");
    }
    let title: string | undefined;
    let titlePos = itemPos;
    let scenarioGiven: string | undefined;
    const data: Pair<Node, Node | null>[] = [];
    for (const pair of item.items as Pair<Node, Node | null>[]) {
      const key = isScalar(pair.key) ? String(pair.key.value) : fail("scenario keys must be scalars");
      if (key === "scenario") {
        if (!isScalar(pair.value) || typeof pair.value.value !== "string") {
          return fail(`"scenario" must be a string description`);
        }
        title = pair.value.value;
        titlePos = posOf(pair.key, itemPos);
      } else if (key === "given") {
        if (!isScalar(pair.value) || typeof pair.value.value !== "string") {
          return fail(`"given" must be a string step name`);
        }
        scenarioGiven = pair.value.value;
      } else {
        data.push(pair);
      }
    }
    if (title === undefined) {
      return fail(`missing "scenario" description`);
    }
    const setup = scenarioGiven ?? given;
    if (setup === undefined) {
      return fail(`scenario needs a "given" step`);
    }
    push(`  it(${JSON.stringify(title)}, async (ctx) => {`, titlePos);
    push(`    await loadYaml(${JSON.stringify(setup)}, {`, titlePos);
    for (const pair of data) {
      const key = isScalar(pair.key) ? String(pair.key.value) : "?";
      const value: unknown = pair.value?.toJSON() ?? null;
      push(`      ${JSON.stringify(key)}: ${JSON.stringify(value)},`, posOf(pair.key, titlePos));
    }
    push(`    }, ctx);`, titlePos);
    push(`  });`, titlePos);
  }
}
