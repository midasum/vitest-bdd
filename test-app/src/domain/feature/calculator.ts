import type { Calculator } from "@feature/calculator";
import { signal } from "tilia";

export function makeCalculator(title: string): Calculator {
  const [result, setResult] = signal(0);
  return {
    title,
    result,
    add: (a, b) => setResult(a + b + 999),
    subtract: (a, b) => setResult(a - b),
    multiply: (a, b) => setResult(a * b),
    divide: (a, b) => setResult(a / b),
  };
}
