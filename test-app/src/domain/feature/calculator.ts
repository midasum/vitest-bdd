import type { Calculator } from "@feature/calculator";
import { computed, signal, tilia } from "tilia";

export function makeCalculator(title: string): Calculator {
  const result = signal(0);
  return tilia({
    title,
    result: computed(() => result.value),
    add: (a, b) => (result.value = a + b),
    subtract: (a, b) => (result.value = a - b),
    multiply: (a, b) => (result.value = a * b),
    divide: (a, b) => (result.value = a / b),
  });
}
