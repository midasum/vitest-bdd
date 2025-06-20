# vitest-bdd

Gherkin test runner for vitest.

The goal is to provide a simple and intuitive way to write tests for your
application. Use with [vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) and [Gherkin](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) extensions for VS-Code.

![vitest-bdd banner](https://raw.githubusercontent.com/midasum/vitest-bdd/refs/heads/main/misc/vitest-bdd.jpg)

Tests can run in parallel (no shared state) and are fast and hot reloadable.

**Features**

- **write with Gherkin, execute with vitest !**
- async tests
- concurrent testing
- failed tests in steps definitions and Gherkin
- supports number, string and table parameters
- steps are explicitly linked to your context (easy to trace usage)
- supports "Background"
- experimental "Gherkin in markdown"
- ESM and CJS projects support
- Gherkin parsing with [@cucumber/gherkin](https://github.com/cucumber/gherkin).

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
  plugins: [vitestBdd()],
  test: {
    include: ["**/*.feature", "**/*.spec.ts"],
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
import { Given, type Step } from "vitest-bdd";
import { makeCalculator } from "../feature/calculator";

// You can reuse steps in multiple contexts
// Here anything that has a result value.
function resultAssertions(Then: Step, calculator: { result: Signal<number> }) {
  // We define an async step, just to look cool 😎.
  Then("the result is {number}", async (n: number) => {
    await calculator.proccessBigComputation();
    expect(calculator.result.value).toBe(n);
  });
}

// You can use any variable name instead of When, And, and Then to match the
// language of the Gherkin messages, such as { Quand, Alors, Et }, etc. We show
// the code in an async situation (because it's the most difficult to handle).
Given("I have a {string} calculator", async ({ When, And, Then }, type) => {
  switch (type) {
    case "basic": {
      const calculator = basicCalculator();
      When("I add {number} and {number}", calculator.add);
      And("I subtract {number} and {number}", calculator.subtract);
      And("I multiply {number} by {number}", calculator.multiply);
      And("I divide {number} by {number}", calculator.divide);
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

Given("I have a preference manager", ({ Step }) => {
  const preferenceManager = makePreferenceManager();
  formSteps(Step, preferenceManager);
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

Given("I have a table", ({ When, Then }, data) => {
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

## Non-english support

You can write your tests in any language supported by Cucumber (around 40).

```gherkin
# language: fr
# /some/feature/calculator.feature
# language: fr
Fonctionnalité: Calculatrice

  Scénario: Addition de deux nombres
    Soit une calculatrice
    Quand j'ajoute 15 et 10
    Alors le résultat doit être 25

  Scénario: Addition de nombres négatifs
    Soit une calculatrice
    Quand j'ajoute -15 et -10
    Alors le résultat doit être -25

  Scénario: Soustraction de deux nombres
    Soit une calculatrice
    Quand je soustrais 5 à 12
    Alors le résultat doit être 7
```

And the steps file:

```ts
// /some/feature/calculator.feature.ts
import { expect } from "vitest";
import { Given } from "vitest-bdd";
import { makeCalculator } from "../feature/calculator";

Soit("un calculator", ({ Quand, Alors }) => {
  const calculator = makeCalculator();
  Quand("j'ajoute {number} et {number}", calculator.add);
  Quand("je soustrais {number} à {number}", calculator.subtract);

  Alors("le résultat doit être {number}", (expected: string) => {
    expect(calculator.result.value).toBe(expected);
  });
});
```

Don't forget to update some vscode settings (if you use cucumber autocomplete VS Code Extension):

```json
// .vscode/settings.json
{
  "workbench.iconTheme": "diagonal-architecture-light-icon-theme",
  "cucumberautocomplete.steps": ["src/domain/test/**/*.feature.ts"],
  "cucumberautocomplete.formatConfOverride": {
    "Fonctionnalité": 0,
    "Scénario": 1,
    "Soit": 2,
    "Quand": 2,
    "Alors": 2
  },
  "cucumberautocomplete.strictGherkinCompletion": true,
  "cucumberautocomplete.smartSnippets": true,
  "cucumberautocomplete.syncfeatures": "src/domain/test/**/*.feature"
}
```

And finally, here are some nice extensions for VS Code that can support your BDD journey:

- The [Cucumber auto-complete](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) extension adds syntax support and auto-complete for Gherkin.
- The [diagonal architecture](https://marketplace.visualstudio.com/items?itemName=midasum.diagonal-architecture) extension helps structure projects and has icons for `.feature` and `.feature.ts`.

```json
{
  "recommendations": [
    "midasum.diagonal-architecture",
    "alexkrechik.cucumberautocomplete"
  ]
}
```

# Changelog

Complete changelog is available [here](https://github.com/midasum/vitest-bdd/blob/main/CHANGELOG.md). Changelog is in reverse time order (latest at the top).

- **0.1.0**: Canary version

- Add async support
- Add concurrency support
- Fixed negative number parsing
- Added support for scientific number notation
- Create basic plugin
