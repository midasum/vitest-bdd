import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, type TestContext } from "vitest";
import { epureVitest, Given } from "./index";
import { loadYaml } from "./steps";

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

describe("epureVitest YAML", () => {
  it("compiles .yaml examples into concurrent Vitest scenarios", async () => {
    const dir = await fixture({
      "calculator.yaml": [
        "feature: Calculator",
        "background:",
        "  given: a calculator",
        "examples:",
        "  - scenario: adds two numbers",
        "    left: 1",
        "    right: 2",
      ].join("\n"),
      "calculator.yaml.ts": "",
    });
    const file = path.join(dir, "calculator.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('import { loadYaml } from "@epure/vitest/runtime";');
    expect(result.code).toContain('describe.concurrent("Calculator"');
    expect(result.code).toContain('it("adds two numbers", async (ctx) => {');
    expect(result.code).toContain('await loadYaml("a calculator", {');
    expect(result.code).toContain("    }, ctx);");
    expect(result.code).toContain('"left": 1');
    expect(result.map.sources).toEqual([file]);
    expect(result.map.sourcesContent).toEqual([expect.stringContaining("scenario: adds two numbers")]);
  });

  it("generates a failing test when no steps module exists", async () => {
    const dir = await fixture({
      "missing.yaml": ["feature: Missing steps", "background:", "  given: nothing"].join("\n"),
    });
    const file = path.join(dir, "missing.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain("should have a steps module");
    expect(result.code).toContain("No steps module found");
  });

  it("uses the plugin steps resolver", async () => {
    const dir = await fixture({
      "calculator.yaml": ["feature: Calculator", "background:", "  given: a calculator"].join("\n"),
    });
    const file = path.join(dir, "calculator.yaml");
    const steps = path.join(dir, "custom.ts");
    const load = epureVitest({ stepsResolver: () => steps }).load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain(`import ${JSON.stringify(steps)};`);
  });

  it("validates the fixture shape", async () => {
    const dir = await fixture({
      "invalid.yaml": ["feature: Invalid", "background:", "  given: nothing", "unknown: value"].join("\n"),
      "invalid.yaml.ts": "",
    });
    const file = path.join(dir, "invalid.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    expect(() => load.call({} as never, file)).toThrow('unknown top-level key "unknown"');
  });

  it("can disable concurrent scenarios", async () => {
    const dir = await fixture({
      "serial.yaml": ["feature: Serial", "background:", "  given: one at a time"].join("\n"),
      "serial.yaml.ts": "",
    });
    const file = path.join(dir, "serial.yaml");
    const load = epureVitest({ concurrent: false }).load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('describe("Serial"');
    expect(result.code).not.toContain("describe.concurrent");
  });

  it("uses a scenario given instead of the background", async () => {
    const dir = await fixture({
      "calculator.yaml": [
        "feature: Calculator",
        "background:",
        "  given: a calculator",
        "examples:",
        "  - scenario: uses another calculator",
        "    given: another calculator",
        "    value: 42",
      ].join("\n"),
      "calculator.yaml.ts": "",
    });
    const file = path.join(dir, "calculator.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('await loadYaml("another calculator", {');
    expect(result.code).not.toContain('"given":');
  });

  it("accepts a scenario given without a background", async () => {
    const dir = await fixture({
      "calculator.yaml": [
        "feature: Calculator",
        "examples:",
        "  - scenario: uses a calculator",
        "    given: a calculator",
      ].join("\n"),
      "calculator.yaml.ts": "",
    });
    const file = path.join(dir, "calculator.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    const result = await load.call({} as never, file);
    if (!result || typeof result === "string") throw new Error("Expected compiled code");

    expect(result.code).toContain('await loadYaml("a calculator", {');
  });

  it("requires a given from the scenario or background", async () => {
    const dir = await fixture({
      "calculator.yaml": ["feature: Calculator", "examples:", "  - scenario: has no setup"].join("\n"),
      "calculator.yaml.ts": "",
    });
    const file = path.join(dir, "calculator.yaml");
    const load = epureVitest().load;
    if (typeof load !== "function") throw new Error("Expected a Vite load hook");

    expect(() => load.call({} as never, file)).toThrow('scenario needs a "given" step');
  });
});

describe("YAML Given", () => {
  it("runs the shared Given with data and the test context", async () => {
    const key = `background-${randomUUID()}`;
    const calls: unknown[][] = [];
    const context = { task: { name: "scenario" } } as TestContext;
    Given(key, ({ When, Then }, data, testContext) => {
      When("an unused operation", () => {});
      Then("another unused operation", () => {});
      calls.push([data, testContext]);
    });

    await loadYaml(key, { value: 42 }, context);

    expect(calls).toEqual([[{ value: 42 }, context]]);
  });

  it("rejects a missing Given", async () => {
    await expect(loadYaml(`missing-${randomUUID()}`, {}, {} as TestContext)).rejects.toThrow(
      'Missing Given for "missing-',
    );
  });
});
