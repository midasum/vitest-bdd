import { And, Given, Or, Then, When } from "vitest-bdd";
import { expect } from "vitest";
import { makeCalculator } from "../feature/calculator";

Given("I have a {string} calculator", (name) => {
  const calculator = makeCalculator(name);
  When("I add {number} and {number}", calculator.add);
  Or("I subtract {number} and {number}", calculator.subtract);
  Or("I multiply {number} and {number}", calculator.multiply);
  Or("I divide {number} by {number}", calculator.divide);
  Then("the result is {number}", (n: number) => {
    expect(calculator.result.value).toBe(n);
  });
  And("the title is {string}", (s: string) => {
    expect(calculator.title).toBe(s);
  });
});
