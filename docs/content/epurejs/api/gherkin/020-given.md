---
name: Given
label: Given(pattern, build)
slug: given
kind: function
since: "0.1"
sort: 20
summary: Bind a Given pattern to a builder that creates the scenario's context and its steps.
signature.ts: "function Given(pattern: string, build: (steps: Context, ...params: Param[]) => void | Promise<void>): void"
signature.res: "let given: (string, (given, 'a) => unit) => unit"
tags: []
---

`Given` is the single entry point of a steps file. The pattern uses Cucumber expressions — `{string}` and `{number}` capture parameters — and the builder runs once per scenario, receiving the step-binding context first, then the captured parameters, then the Vitest `TestContext` last. Everything the scenario needs is created inside the builder, and every `When`/`Then` the builder registers closes over it — no world object, no shared state between scenarios. See [Step](api.html#step-type) for the context's shape, and guide chapter [Steps close over the world](guide.html#steps-close-over-the-world).

YAML fixtures use the same registration. For YAML, the handler receives the
step-binding context first, the scenario's structured data in the parameter
position, and Vitest's `TestContext` last; see [Given for
YAML](api.html#yaml-given).

`(s)` at the end of a word expands one pattern into its singular and plural forms: `I count {number} time(s)` binds both `I count 1 time` and `I count 2 times`. It is matching shorthand, not agreement validation — either form accepts any captured number. Keep `(s)` in the steps file; the feature file remains ordinary prose.

The builder may be `async`: the runner awaits it before executing steps. In ReScript, `given` captures at most one parameter — capture further values in a step or pass a table.

A `Background:` section states the shared situation once: its steps are prepended to every scenario's steps, and it must start with a `Given` — that is the step that opens the context everything else closes over.

```gherkin
Feature: Calculator

  Background:
    Given I have a "basic" calculator

  Scenario: Add two numbers
    When I add 1 and 2
    Then the result is 3

  Scenario: Order does not matter
    When I add 2 and 1
    Then the result is 3
```

```typescript
import { expect } from "vitest";
import { Given } from "@epure/vitest";
import { makeCalculator } from "../feature/calculator";

Given("I have a {string} calculator", ({ When, Then }, name: string) => {
  const calculator = makeCalculator(name);

  When("I add {number} and {number}", calculator.add);
  Then("the result is {number}", (n: number) => {
    expect(calculator.result).toBe(n);
  });
});
```

```rescript
open EpureVitest

given("I have a {string} calculator", ({step}, name: string) => {
  let calculator = Calculator.make(name)

  step("I add {number} and {number}", calculator.add)
  step("the result is {number}", (n: float) => {
    expect(calculator.result).toBe(n)
  })
})
```
