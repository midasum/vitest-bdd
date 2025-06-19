import { normalize, type Step as StepType } from "./parser";

export type Operation = (...params: any[]) => void;

export type Runner = {
  operation: (query: string) => Operation;
};

type Operations = Record<string, Operation>;

const builders: Record<string, (given: StepType) => Runner> = {};
let collect: Operations | null = null;

export function Given(key: string, build: Operation) {
  builders[normalize(key)] = (given: StepType) => {
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
    collect = ops;
    build(...given.params);
    collect = null;
    return runner;
  };
}

export function Step(key: string, op: Operation) {
  if (!collect) {
    throw new Error("Steps should start with a Given function");
  }
  collect[normalize(key)] = op;
}

export const When = Step;
export const Then = Step;
export const But = Step;
export const And = Step;

export function load(given: StepType): Runner {
  const build = builders[given.query];
  if (!build) {
    throw new Error(`Missing loader for "${given.text}"`);
  }
  return build(given);
}
