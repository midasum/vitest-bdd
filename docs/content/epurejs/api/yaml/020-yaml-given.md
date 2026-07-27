---
name: Given
label: Given(name, handle)
slug: yaml-given
kind: function
since: "1.2"
sort: 20
summary: Bind a YAML given name to a handler receiving steps, data, and test context.
signature.ts: "function Given(name: string, handle: (steps: Context, data: Record<string, unknown>, context: TestContext) => void | Promise<void>): void"
signature.res: "// YAML fixture steps are a TypeScript API"
tags: []
---

Import `Given` from `@epure/vitest` in the fixture's steps module, just as for
a feature file. Its name matches the scenario's `given`, or
`background.given` when the scenario does not provide one. Its handler receives
step bindings first, every field except `scenario` and `given` second, and
Vitest's `TestContext` last. Step bindings can register operations, though YAML
fixtures do not execute those operations yet.

Handlers may be asynchronous. Each key can be registered once per test process.

```yaml
feature: YAML calculator
background:
  given: a calculator
examples:
  - scenario: adds two numbers
    given: a calculator
    left: 1
    right: 2
    result: 3
  - scenario: adds negative numbers
    left: -4
    right: 2
    result: -2
```
```typescript
// calculator.test.yaml.ts
import { Given } from "@epure/vitest";
import { expect } from "vitest";

Given("a calculator", (_steps, { left, right, result }, context) => {
  expect(Number(left) + Number(right)).toBe(result);
  expect(context.task.name).toBeTypeOf("string");
});
```

This is the same [Given](api.html#given) registration used by Gherkin. Its
arguments occupy the same positions: step bindings first, contract data or
captures in the middle, and the test context last.
