import { describe, expect, it } from "vitest";
import { parse, parseStep } from "./parser";

describe("parse", () => {
  it("Should parse a simple feature", () => {
    const text = `Feature: Calculator

  Scenario: Add two numbers
    Given I have a "basic" calculator
    When I add 1 and 2
    Then the result is 3
    And the title is "basic"
`;
    const feature = parse(text);
    expect(feature.title).toBe("Calculator");
    expect(feature.scenarios.length).toBe(1);
    const scenario = feature.scenarios[0];

    expect(scenario.title).toBe("Add two numbers");
    expect(scenario.steps.length).toBe(4);

    expect(scenario.steps[0].text).toBe('Given I have a "basic" calculator');
    expect(scenario.steps[0].query).toBe("i have a {string} calculator");

    expect(scenario.steps[1].text).toBe("When I add 1 and 2");
    expect(scenario.steps[1].query).toBe("i add {number} and {number}");

    expect(scenario.steps[2].text).toBe("Then the result is 3");
    expect(scenario.steps[2].query).toBe("the result is {number}");

    expect(scenario.steps[3].text).toBe('And the title is "basic"');
    expect(scenario.steps[3].query).toBe("the title is {string}");
  });
});

describe("parseStep", () => {
  it("Should parse a step", () => {
    const step = parseStep("Given I have a calculator");
    expect(step.text).toBe("Given I have a calculator");
    expect(step.query).toBe("i have a calculator");
    expect(step.params).toEqual([]);
  });

  it("Should parse a step with a number", () => {
    const step = parseStep("When I add 1 and 2");
    expect(step.text).toBe("When I add 1 and 2");
    expect(step.query).toBe("i add {number} and {number}");
    expect(step.params).toEqual([1, 2]);
  });

  it("Should parse a step with a string", () => {
    const step = parseStep('When I add "hello" and "world"');
    expect(step.text).toBe('When I add "hello" and "world"');
    expect(step.query).toBe("i add {string} and {string}");
    expect(step.params).toEqual(["hello", "world"]);
  });

  it("Should parse a step with many strings and numbers", () => {
    const step = parseStep('When I say 12 and "hello" and "world" and 7.12');
    expect(step.text).toBe('When I say 12 and "hello" and "world" and 7.12');
    expect(step.query).toBe(
      "i say {number} and {string} and {string} and {number}"
    );
    expect(step.params).toEqual([12, "hello", "world", 7.12]);
  });
});
