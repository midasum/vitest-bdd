import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { yamlBdd, yamlStepsResolver } from "./index";
import { given, runScenario } from "./yaml";

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "epure-yaml-"));
  dirs.push(dir);
  await Promise.all(Object.entries(files).map(([name, content]) => writeFile(path.join(dir, name), content)));
  return dir;
}

describe("yamlBdd", () => {
  it("compiles YAML examples into concurrent Vitest scenarios", async () => {
    const dir = await fixture({
      "calculator.test.yaml": [
        "feature: Calculator",
        "background:",
        "  given: a calculator",
        "examples:",
        "  - scenario: adds two numbers",
        "    left: 1",
        "    right: 2",
      ].join("\n"),
      "calculator.test.ts": "",
    });
    const file = path.join(dir, "calculator.test.yaml");
    const load = yamlBdd().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('import { runScenario } from "@epure/vitest/yaml";');
    expect(result.code).toContain('describe.concurrent("Calculator"');
    expect(result.code).toContain('it("adds two numbers"');
    expect(result.code).toContain('await runScenario("a calculator", {');
    expect(result.code).toContain('"left": 1');
    expect(result.map.sources).toEqual([file]);
    expect(result.map.sourcesContent).toEqual([expect.stringContaining("scenario: adds two numbers")]);
  });

  it("generates a failing test when no steps module exists", async () => {
    const dir = await fixture({
      "missing.test.yaml": ["feature: Missing steps", "background:", "  given: nothing"].join("\n"),
    });
    const file = path.join(dir, "missing.test.yaml");
    const load = yamlBdd().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain("should have a steps module");
    expect(result.code).toContain("No steps module found");
  });

  it("validates the fixture shape", async () => {
    const dir = await fixture({
      "invalid.test.yaml": ["feature: Invalid", "background:", "  given: nothing", "unknown: value"].join("\n"),
      "invalid.test.ts": "",
    });
    const file = path.join(dir, "invalid.test.yaml");
    const load = yamlBdd().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    expect(() => load.call({} as never, file)).toThrow('unknown top-level key "unknown"');
  });

  it("can disable concurrent scenarios", async () => {
    const dir = await fixture({
      "serial.test.yaml": ["feature: Serial", "background:", "  given: one at a time"].join("\n"),
      "serial.test.ts": "",
    });
    const file = path.join(dir, "serial.test.yaml");
    const load = yamlBdd({ concurrent: false }).load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('describe("Serial"');
    expect(result.code).not.toContain("describe.concurrent");
  });
});

describe("yamlStepsResolver", () => {
  it("prefers a fixture-specific steps module", async () => {
    const dir = await fixture({
      "example.test.yaml": "",
      "example.test.ts": "",
      "steps.ts": "",
    });

    expect(yamlStepsResolver(path.join(dir, "example.test.yaml"))).toBe(path.join(dir, "example.test.ts"));
  });
});

describe("YAML steps", () => {
  it("runs the handler registered for the background", async () => {
    const key = `background-${randomUUID()}`;
    const values: Record<string, unknown>[] = [];
    given(key, (data) => {
      values.push(data);
    });

    await runScenario(key, { value: 42 });

    expect(values).toEqual([{ value: 42 }]);
  });

  it("rejects duplicate and missing steps", async () => {
    const key = `duplicate-${randomUUID()}`;
    given(key, () => {});

    expect(() => given(key, () => {})).toThrow(`Step "${key}" is already defined`);
    await expect(runScenario(`missing-${randomUUID()}`, {})).rejects.toThrow(
      'Missing step definition for given "missing-',
    );
  });
});
