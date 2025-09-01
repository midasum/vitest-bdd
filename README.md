# vitest-bdd

Gherkin test runner for vitest.

The goal is to provide a simple and intuitive way to write tests for your
application. Use with [vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) and [Gherkin](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) extensions for VS-Code.

![vitest-bdd banner](https://raw.githubusercontent.com/midasum/vitest-bdd/refs/heads/main/misc/vitest-bdd.jpg)

You can also write tests in Markdown with Gherkin code blocks for Spec Driven Development:

<img width="514" height="241" alt="image" src="https://github.com/user-attachments/assets/eb0372f2-fa09-439b-add1-bff5bed200d5" />

Tests can run in parallel (no shared state) and are fast and hot reloadable.

**Features**

- **write with Gherkin, execute with vitest !**
- Gherkin block inside markdown
- ReScript step definitions and bindings for vitest
- async tests
- concurrent testing
- failed tests in steps definitions and Gherkin
- supports number, string and table parameters
- steps are explicitly linked to your context (easy to trace usage)
- supports "Background"
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
    include: ["**/*.feature", "**/*.spec.ts", "**/*.mdx"],
  },
});
```

### Options

Options are passed as an object to the vitestBdd function. The default options are:

```ts
{
  debug: false,
  concurrent: true,
  markdownExtensions: [".md", ".mdx", ".markdown"],
  gherkinExtensions: [".feature"],
  stepsResolver: stepsResolver,
}
```

And the default stepsResolver function is below. This resulver would find the following files for a "./test/foobar.feature" file:

- `./test/foobar.feature.ts`
- `./test/foobar.feature.js`
- ... etc
- `./test/foobar.steps.ts`
- `./test/foobar.steps.js`
- ... etc
- `./test/foobarSteps.ts`
- `./test/foobarSteps.js`
- ... etc

The last setting helps for ReScript users to mach `./test/Foobar.feature` with `./test/FoobarSteps.res` steps files.

```ts
function baseResolver(path: string): string | null {
  for (const ext of [".ts", ".js", ".mjs", ".cjs", ".res.mjs"]) {
    const p = `${path}${ext}`;
    if (existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function stepsResolver(path: string): string | null {
  for (const r of [".feature", ".steps", "Steps"]) {
    const p = baseResolver(path.replace(/\.feature$/, r));
    if (p) {
      return p;
    }
  }
  return null;
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { vitestBdd } from "vitest-bdd";

export default defineConfig({
  plugins: [vitestBdd({ markdownExtensions: [".mdx", ".text"] })],
  test: {
    include: ["**/*.feature", "**/*.spec.ts", "**/*.mdx", "**/*.text"],
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
      resultAssertions(Then, calculator);
      break;
    }
    case "rpn": {
      const calculator = rpnCalculator();
      When("I enter {number}", calculator.enter);
      And("I enter {number}", calculator.enter);
      And("I divide", calculator.divide);
      resultAssertions(Then, calculator);
      break;
    }
    default:
      throw new Error(`Unknown calculator type "${type}"`);
  }
});
```

For ReScript, the bindings are a little bit simpler for now:

```rescript
// src/domain/test/CalculatorSteps.res
open VitestBdd

// To show assertion reuse (could be just added in the given block).
let resultAssertions = (step, calculator) => {
  // We define an async step, just to look cool 😎 (again).
  step("the result is {number}", async (n: number) => {
    await calculator.proccessBigComputation()
    expect(calculator.result.value).toBe(n)
  })
}

given("I have a {string} calculator", async ({step}, ctype) => {
  switch ctype {
  | "basic" => {
    let calculator = basicCalculator()
    step("I add {number} and {number}", calculator.add)
    step("I subtract {number} and {number}", calculator.subtract)
    step("I multiply {number} by {number}", calculator.multiply)
    step("I divide {number} by {number}", calculator.divide)
    resultAssertions(step, calculator)
  }
  | "rpn": {
    let calculator = rpnCalculator()
    step("I enter {number}", calculator.enter)
    step("I enter {number}", calculator.enter)
    step("I divide", calculator.divide)
    resultAssertions(step, calculator)
  }
})
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

### Gherkin in Markdown

**vitest-bdd** parses the `gherkin` code fences and compiles them into a test suite.

Example: `src/domain/test/some.md`

````markdown
### Basic calculator

```gherkin
Feature: Calculator in md

Background:
  Given I have a "basic" calculator
  Then the title is "basic"
```

Some other markdown that does nothing.

## Basic operations

```gherkin
Scenario: Add two numbers
  When I add 1 and 2
  Then the result is 4

Scenario: Advanced calculator
  When I divide 1 by 2
  Then the result is 0.5
```

And this is some more markdown.
````

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
import { Given, Then, When, toRecords } from "vitest-bdd";
import { makeTable } from "../feature/table";

Given("I have a table", ({ When, Then }, data) => {
  // data : User[]
  const table = makeTable(data);

  When("I sort by {string}", table.sort);
  Then("the table is", (data) => {
    expect(table.list).toEqual(toRecords(data));
  });
});
```

You can also use `toNumbers` or `toStrings` to convert the first column of a
table to a list of numbers or strings.

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

Don't forget to update some vscode settings (if you use the cucumber autocomplete extension for VS Code):

```json
// .vscode/settings.json
{
  "workbench.iconTheme": "diagonal-architecture-light-icon-theme",
  "cucumberautocomplete.steps": [
    "*/src/domain/test/**/*.feature.ts",
    "*/src/domain/test/**/*Steps.res" // This is for ReScript
  ],
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

- **0.6.0** (2025-09-01)
  - Add support for table parsing (toRecords, toNumbers, toStrings)
  - Add `concurrent` option (true by default)
- **0.5.1** (2025-08-28)
  - Remove support for arrays in tests (accidental breaking change)
- **0.5.0** (2025-08-27)
  - Add support for arrays in tests
- **0.4.0** (2025-08-17)
  - Add support for ReScript unit tests (with source maps!)
- **0.3.0** (2025-07-26)
  - Add options for markdown extension (and default support for .mdx)
- **0.2.0** (2025-07-23)
  - Add support for Gherkin code blocks in markdown
  - Add basic support for ReScript step definitions
  - (remove experimental Gherkin in markdown support)
- **0.1.0** (2025-07-04)
  - Add async support
  - Add concurrency support
  - Fixed negative number parsing
  - Added support for scientific number notation
  - Create basic plugin
