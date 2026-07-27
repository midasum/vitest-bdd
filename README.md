# @epure/vitest

Gherkin contracts and structured YAML fixtures run by Vitest, with typed steps
for TypeScript and ReScript.

> `@epure/vitest` is the new name of `vitest-bdd`. Existing APIs remain as
> deprecated aliases, but new code should use the names shown below.

- [Guide](https://epurejs.dev/guide.html)
- [API reference](https://epurejs.dev/api.html)
- [npm](https://www.npmjs.com/package/@epure/vitest)
- [épure method](https://epuremethod.com)

## Install

```sh
pnpm add --save-dev @epure/vitest vitest
```

## Configure Vitest

```ts
// vitest.config.ts
import { epureVitest } from "@epure/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [epureVitest()],
  test: {
    include: ["**/*.feature", "**/*.md", "**/*.test.yaml", "**/*.spec.ts"],
  },
});
```

`epureVitest` translates feature files, Gherkin code fences in Markdown, and
structured YAML fixtures into Vitest suites in memory. It does not write
generated test files to disk.

## YAML fixtures

Include `.yaml` files in Vitest when scenarios are structured examples rather
than prose. `epureVitest` compiles every `.yaml` file Vitest loads; the
`test.include` glob controls which fixtures are tests.

```yaml
feature: Calculator
examples:
  - scenario: adds two numbers
    given: a calculator
    left: 1
    right: 2
    result: 3
```

Register each `given` in `calculator.test.yaml.ts`, `calculator.test.steps.ts`,
or a shared `steps.ts` beside the fixture:

```ts
import { Given } from "@epure/vitest";
import { expect } from "vitest";

Given("a calculator", (_steps, { left, right, result }, context) => {
  expect(Number(left) + Number(right)).toBe(result);
  expect(context.task.name).toBeTypeOf("string");
});
```

Each example becomes a source-mapped Vitest test. A scenario's `given`
overrides `background.given`; one of them is required. The remaining fields
occupy the parameter position in the same `Given` API used by features:
step bindings first, scenario data second, and Vitest's `TestContext` last.

## Write a contract

```gherkin
# calculator.feature
Feature: Calculator

  Scenario: Add two numbers
    Given I have a calculator
    When I add 1 and 2
    Then the result is 3
```

Place its steps beside it:

```ts
// calculator.feature.ts
import { Given } from "@epure/vitest";
import { expect } from "vitest";

Given("I have a calculator", ({ When, Then }) => {
  let result = 0;

  When("I add {number} and {number}", (a: number, b: number) => {
    result = a + b;
  });

  Then("the result is {number}", (expected: number) => {
    expect(result).toBe(expected);
  });
});
```

Each `Given` builder creates private scenario state. Its `When`, `Then`, and
other named operations close over that state, so scenarios can run
concurrently without a shared World.

## ReScript

Open the canonical `EpureVitest` module:

```rescript
open EpureVitest

given("I have a calculator", ({step}, _params) => {
  let result = ref(0)

  step("I add {number} and {number}", (a, b) => {
    result.contents = a + b
  })

  step("the result is {number}", expected => {
    expect(result.contents).toBe(expected)
  })
})
```

The package also provides typed Vitest suites, hooks, modes, and assertions.
See the [ReScript guide](https://epurejs.dev/guide.html#vitest-in-rescript).

## Migration from vitest-bdd

| Former name | Canonical name |
| --- | --- |
| package `vitest-bdd` | package `@epure/vitest` |
| `vitestBdd()` | `epureVitest()` |
| `VitestBddOptions` | `EpureVitestOptions` |
| ReScript module `VitestBdd` | ReScript module `EpureVitest` |

The former TypeScript names emit deprecation guidance, and the former ReScript
module emits a compiler/editor deprecation warning.

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm --filter epure-vitest-docs check
```

See [CHANGELOG.md](./CHANGELOG.md) for release history and
[NEXT-STEPS.md](./NEXT-STEPS.md) for the deferred publication checklist.
