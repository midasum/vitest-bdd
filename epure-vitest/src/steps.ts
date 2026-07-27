import type { TestContext } from "vitest";
import { normalize, type Step as StepType } from "./parser";

type Operation = (...params: any[]) => void;

type Runner = {
  operation: (query: string) => Operation;
};

type Operations = Record<string, Operation>;
type Build = (...params: any[]) => void | Promise<void>;
type Builder = (params: any[], testContext: TestContext) => Promise<Runner>;
/** Register a scenario operation such as `When` or `Then`. */
export type Step = (key: string, op: Operation) => void;
/** Named scenario operations supplied to a `Given` builder. */
export type Context = Record<string, Step>;

const builders: Record<string, Builder> = {};

/**
 * Register a feature builder or YAML handler for a scenario's `Given`.
 *
 * Operations registered by the builder close over private scenario state.
 * YAML places scenario data where a feature places captured parameters.
 */
export function Given(key: string, build: Build) {
  const builder = async (params: any[], testContext: TestContext) => {
    const ops: Operations = {};
    const runner = {
      operation: (query: string) => {
        const operation = ops[query];
        if (!operation) {
          throw new Error(`Step "${query}" not found`);
        }
        return operation;
      },
    };
    const ctx: Context = new Proxy(
      {},
      {
        get: () => (key: string, op: Operation) => {
          for (const query of normalize(key)) {
            ops[query] = op;
          }
        },
      },
    );
    await build(ctx, ...params, testContext);
    return runner;
  };
  for (const query of normalize(key)) {
    builders[query] = builder;
  }
}

/** @internal Used by translated suites through `@epure/vitest/runtime`. */
export function load(given: StepType, testContext: TestContext): Promise<Runner> {
  const builder = builders[given.query];
  if (!builder) {
    throw new Error(`Missing loader for "${given.text}"`);
  }
  return builder(given.params, testContext);
}

/** @internal Used by generated YAML suites. */
export async function loadYaml(key: string, data: Record<string, unknown>, testContext: TestContext): Promise<void> {
  const builder = builders[key];
  if (!builder) {
    throw new Error(`Missing Given for ${JSON.stringify(key)}`);
  }
  await builder([data], testContext);
}
