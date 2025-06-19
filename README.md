# vitest-bdd

Gherkin test runner for vitest.

The goal is to provide a simple and intuitive way to write tests for your
application. Use with [vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) and [Gherkin](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) extensions for VS-Code.

![vitest-bdd banner](https://raw.githubusercontent.com/midasum/vitest-bdd/refs/heads/main/misc/vitest-bdd.jpg)

Tests can run in parallel (no shared state) and are fast and hot reloadable.

**Features**

* Write with Gherkin, execute with vitest !
* View failed tests in steps definitions and Gherkin
* Supports number, string and table parameters
* Steps are easy to write, and explicitly linked to your context
* Support "Background"
* Supports experimental "Gherkin in markdown"
* Parsing of Gherkin is done with [@cucumber/gherkin](https://github.com/cucumber/gherkin).

## Usage

### Install

```
pnpm i --save-dev vitest-bdd
```

### Setup

Create a vitest config file

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { vitestBdd } from "vitest-bdd";

export default defineConfig({
  test: {
    plugins: [vitestBdd()],
    include: ["src/**/*.feature", "src/**/*.spec.ts"],
  },
});
```

### Describe your features

Define your feature in a file with the `.feature` extension:

```gherkin
# src/domain/test/calculator.feature
Feature: Calculator

  Scenario: Add two numbers
    Given I have a "basic" calculator
    When I add 1 and 2
    Then the result is 3

  Scenario: Advanced calculator
    Given I have an "rpn" calculator
    When I enter 1
    And I enter 2
    And I divide
    Then the result is 0.5
```

Create a steps file with `.feature.ts` extension (and exact same name as
the feature file):

```ts
// src/domain/test/calculator.feature.ts
import { type Signal } from "tilia";
import { expect } from "vitest";
import { And, Given, Or, Then, When } from "vitest-bdd";
import { makeCalculator } from "../feature/calculator";

// You can reuse steps in multiple contexts
// Here anything that has a result value.
function resultAssertions(calculator: { result: Signal<number> }) {
  Then("the result is {number}", (n: number) => {
    expect(calculator.result.value).toBe(n);
  });
}

Given("I have a {string} calculator", (type) => {
  switch (type) {
    case "basic": {
      const calculator = basicCalculator();
      When("I add {number} and {number}", calculator.add);
      Or("I subtract {number} and {number}", calculator.subtract);
      Or("I multiply {number} by {number}", calculator.multiply);
      Or("I divide {number} by {number}", calculator.divide);
      resultAssertions(calculator);
      break;
    }
    case "rpn": {
      const calculator = rpnCalculator();
      When("I enter {number}", calculator.enter);
      And("I enter {number}", calculator.enter);
      And("I divide", calculator.divide);
      resultAssertions(calculator);
      break;
    }
    default:
      throw new Error(`Unknown calculator type "${type}"`);
  }
});
```

### Reuse steps

You can reuse steps in multiple contexts. For example, a preference manager
could implement the interface `Form` (to access and set values) and you can
reuse the form steps:

```ts
// src/domain/test/preference-manager.feature.ts
import { formSteps } from "@steps/form";

Given("I have a preference manager", () => {
  const preferenceManager = makePreferenceManager();
  formSteps(preferenceManager);
});
```

### Gherkin Markdown

`src/domain/test/some.md`

```md
# Feature: Calculator in md

## Background:

- Given I have a "basic" calculator
- Then the title is "basic"

## Scenario: Add two numbers

- When I add 1 and 2
- Then the result is 3

## Scenario: Advanced calculator

- When I divide 1 by 2
- Then the result is 0.5

And this is some more markdown that does nothing.
```

Define steps in `src/domain/test/some.md.ts`

### Gherkin Table

`src/domain/test/tabular.feature`

```gherkin
Feature: Table

  Background:
    Given I have a table
      | firstName | lastName | isActive |
      | Charlie   | Smith    | true     |
      | Bob       | Johnson  | false    |
      | Alice     | Williams | true     |

  Scenario: Sort by name
    When I sort by "lastName"
    Then the table is
      | firstName | lastName | isActive |
      | Bob       | Johnson  | false    |
      | Charlie   | Smith    | true     |
      | Alice     | Williams | true     |
# etc
```

```ts
// src/domain/test/tabular.feature.ts
import { Given, Then, When } from "vitest-bdd";
import { makeTable } from "../feature/table";

Given("I have a table", (data) => {
  // data : string[][]
  const table = makeTable(data);

  When("I sort by {string}", table.sort);
  Then("the table is", (data) => {
    expect([table.headers.map((h) => h.name), ...table.rows.value]).toEqual(
      data
    );
  });
});
```
