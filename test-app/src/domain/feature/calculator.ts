import type { Calculator } from "@feature/calculator";
import { computed, signal, tilia } from "tilia";

export function makeCalculator(title: string): Calculator {
  const [result, setResult] = signal(0);
  return tilia({
    title,
    result: computed(() => result.value),
    add: (a, b) => setResult(a + b),
    subtract: (a, b) => setResult(a - b),
    multiply: (a, b) => setResult(a * b),
    divide: (a, b) => setResult(a / b),
  });
}
