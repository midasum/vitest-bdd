import { normalize, type Step as StepType } from "./parser";

export type Operation = (...params: any[]) => void;

export type Runner = {
  operation: (query: string) => Operation;
};

type Operations = Record<string, Operation>;
export type Step = (key: string, op: Operation) => void;
export type Context = Record<string, Step>;

const builders: Record<string, (given: StepType) => Promise<Runner>> = {};

export function Given(key: string, build: (...params: any[]) => void) {
  builders[normalize(key)] = async (given: StepType) => {
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
        get: () => (key: string, op: Operation) => (ops[normalize(key)] = op),
      }
    );
    await build(ctx, ...given.params);
    return runner;
  };
}

export function load(given: StepType): Promise<Runner> {
  const build = builders[given.query];
  if (!build) {
    throw new Error(`Missing loader for "${given.text}"`);
  }
  return build(given);
}
