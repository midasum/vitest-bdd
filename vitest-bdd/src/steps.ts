import { normalize, type Step } from "./parser";

export type Operation = (...params: any[]) => void;

export type Runner = {
  execute: (step: Step) => void;
};

type Operations = Record<string, Operation>;

const builders: Record<string, (given: Step) => Runner> = {};
let collect: Operations | null = null;

export function Given(key: string, build: Operation) {
  builders[normalize(key)] = (given: Step) => {
    const ops: Operations = {};
    const runner = {
      execute: (step: Step) => {
        const operation = ops[step.query];
        if (!operation) {
          throw new Error(`Step "${step.query}" not found`);
        }
        operation(...step.params);
      },
    };
    collect = ops;
    build(...given.params);
    collect = null;
    return runner;
  };
}

export function step(key: string, op: Operation) {
  if (!collect) {
    throw new Error("Steps should start with a Given function");
  }
  collect[normalize(key)] = op;
}

export const When = step;
export const Then = step;
export const But = step;
export const And = step;
export const Or = step;

export function load(given: Step): Runner {
  const build = builders[given.query];
  if (!build) {
    throw new Error(`Missing loader for "${given.text}"`);
  }
  return build(given);
}
