import { expect } from "vitest";
import { Given } from "vitest-bdd";
import { makeCalculator } from "../../feature/calculator";

Given("I have a {string} calculator", ({ When, Then, And }, name: string) => {
  const calculator = makeCalculator(name);

  When("I add {number} and {number}", calculator.add);
  When("I subtract {number} and {number}", calculator.subtract);
  When("I multiply {number} and {number}", calculator.multiply);
  When("I divide {number} by {number}", calculator.divide);

  Then("the result is {number}", (n: number) => {
    expect(calculator.result).toBe(n);
  });
  And("the title is {string}", (s: string) => {
    expect(calculator.title).toBe(s);
  });
});
