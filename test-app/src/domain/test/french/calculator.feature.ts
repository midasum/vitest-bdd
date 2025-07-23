import { expect } from "vitest";
import { Given as Soit } from "vitest-bdd";
import { makeCalculator } from "../../feature/calculator";

Soit("une calculatrice", ({ Quand, Alors }) => {
  const calculator = makeCalculator("basic");
  Quand("j'ajoute {number} et {number}", calculator.add);
  Quand("je soustrais {number} à {number}", (a: number, b: number) =>
    calculator.subtract(b, a)
  );

  Alors("le résultat doit être {number}", (expected: string) => {
    expect(calculator.result).toBe(expected);
  });
});
