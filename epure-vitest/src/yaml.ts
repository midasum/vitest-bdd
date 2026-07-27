/** A YAML background step receives the scenario's remaining fields. */
export type YamlStep = (data: Record<string, unknown>) => void | Promise<void>;

const steps: Record<string, YamlStep> = {};

/** Register the handler named by a YAML fixture's `background.given`. */
export function given(key: string, fn: YamlStep): void {
  if (steps[key] !== undefined) {
    throw new Error(`Step "${key}" is already defined`);
  }
  steps[key] = fn;
}

/** @internal Used by suites generated with `yamlBdd`. */
export async function runScenario(key: string, data: Record<string, unknown>): Promise<void> {
  const fn = steps[key];
  if (fn === undefined) {
    throw new Error(`Missing step definition for given "${key}"`);
  }
  await fn(data);
}
