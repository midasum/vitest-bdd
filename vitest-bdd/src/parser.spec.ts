import { describe, expect, it } from "vitest";
import { mdToGherkin, parse, parseStep } from "./parser";

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
    expect(feature).not.toBeNull();
    if (!feature) return;

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
    const step = parseStep("Given ", "I have a calculator");
    expect(step.text).toBe("Given I have a calculator");
    expect(step.query).toBe("i have a calculator");
    expect(step.params).toEqual([]);
  });

  it("Should parse a step with a number", () => {
    const step = parseStep("When ", "I add 1 and 2");
    expect(step.text).toBe("When I add 1 and 2");
    expect(step.query).toBe("i add {number} and {number}");
    expect(step.params).toEqual([1, 2]);
  });

  it("Should parse a step with a negative number", () => {
    const step = parseStep("When ", "I add -1 and 2");
    expect(step.query).toBe("i add {number} and {number}");
    expect(step.params).toEqual([-1, 2]);
  });

  it("Should parse a step numbers without word boundaries", () => {
    const step = parseStep("When ", "I compute -123/245");
    expect(step.query).toBe("i compute {number}/{number}");
    expect(step.params).toEqual([-123, 245]);
  });

  it("Should parse complex numbers", () => {
    const step = parseStep("When ", "I use -123.43E-2");
    expect(step.query).toBe("i use {number}");
    expect(step.params).toEqual([-1.2343]);
  });

  it("Should parse a step with a string", () => {
    const step = parseStep("When ", 'I add "hello" and "world"');
    expect(step.text).toBe('When I add "hello" and "world"');
    expect(step.query).toBe("i add {string} and {string}");
    expect(step.params).toEqual(["hello", "world"]);
  });

  it("Should parse a step with many strings and numbers", () => {
    const step = parseStep(
      "When ",
      'I say 12 and "Hello" and "World!" and 7.12'
    );
    expect(step.text).toBe('When I say 12 and "Hello" and "World!" and 7.12');
    expect(step.query).toBe(
      "i say {number} and {string} and {string} and {number}"
    );
    expect(step.params).toEqual([12, "Hello", "World!", 7.12]);
  });
});

describe("mdToGherkin", () => {
  it("Should convert markdown to gherkin", () => {
    const text = `# Title
Some text.

## Sub-title

\`\`\`gherkin
Feature: Calculator
\`\`\`

Some text

\`\`\`gherkin
Scenario: Add two numbers
  Given I have a calculator
  When I add 1 and 2
  Then the result is 3
\`\`\`

Some other text

\`\`\`gherkin
Scenario: Subtract two numbers
  Given I have a calculator
  When I subtract 1 from 2
  Then the result is 1
\`\`\`
`;
    const linemapper: Record<number, number> = {};
    const gherkin = mdToGherkin(text, linemapper);
    expect(gherkin).toBe(`Feature: Calculator
Scenario: Add two numbers
  Given I have a calculator
  When I add 1 and 2
  Then the result is 3
Scenario: Subtract two numbers
  Given I have a calculator
  When I subtract 1 from 2
  Then the result is 1`);
    expect(
      Object.entries(linemapper)
        .map(
          ([line, i]) =>
            `${line.padStart(2, "0")}: ${String(i).padStart(2, "0")}`
        )
        .sort()
        .join("\n")
    ).toBe(`01: 07
02: 13
03: 14
04: 15
05: 16
06: 22
07: 23
08: 24
09: 25`);
  });
});
