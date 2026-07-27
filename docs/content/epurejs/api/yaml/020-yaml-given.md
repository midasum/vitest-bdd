---
name: given
label: given(key, handler)
slug: yaml-given
kind: function
since: "1.2"
sort: 20
summary: Register the handler named by a YAML fixture's background.
signature.ts: "function given(key: string, handler: (data: Record<string, unknown>) => void | Promise<void>): void"
signature.res: "// YAML fixture steps are a TypeScript API"
tags: []
---

Import lowercase `given` from `@epure/vitest/yaml` in the fixture's steps
module. Its key matches `background.given`; its handler receives every field in
an example except `scenario`.

Handlers may be asynchronous. Each key can be registered once per test process.

```typescript
// calculator.test.ts
import { given } from "@epure/vitest/yaml";
import { expect } from "vitest";

given("a calculator", ({ left, right, result }) => {
  expect(Number(left) + Number(right)).toBe(result);
});
```

This API is separate from Gherkin's uppercase
[Given](api.html#given): YAML dispatches one structured object to one
background handler rather than matching prose steps.
