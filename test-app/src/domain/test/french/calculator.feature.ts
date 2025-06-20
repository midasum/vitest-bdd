import { expect } from "vitest";
import { Given, Step } from "vitest-bdd";
import { makeCalculator } from "../../feature/calculator";
const Soit = Given;
const Quand = Step;
const Alors = Step;

Soit("un calculator", () => {
  const calculator = makeCalculator("basic");
  Quand("j'ajoute {number} et {number}", calculator.add);
  Quand("je soustrais {number} à {number}", (a, b) =>
    calculator.subtract(b, a)
  );

  Alors("le résultat doit être {number}", (expected: string) => {
    expect(calculator.result.value).toBe(expected);
  });
});
