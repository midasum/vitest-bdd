---
name: test
label: test(name, fn)
slug: test
kind: function
since: "0.4"
sort: 130
summary: Declare one test — test and it are the same binding, sync or async.
signature.ts: "function test(name: string, fn: () => void | Promise<void>): void"
signature.res: "let test: (string, 'a) => unit"
tags: []
---

`test` and `it` bind Vitest's identical pair; pick the one that reads better in the sentence. The body may be synchronous or `async` — source maps carry through the ReScript compiler, so a failure points at the `.res` line, not the compiled `.mjs`. `bench` is bound alongside for benchmarks, and `Skip`, `Only` and `Todo` (see [describe](api.html#describe)) provide the mode variants.

```typescript
import { expect, it } from "vitest";

it("parses negative numbers", async () => {
  expect(await parse("-15")).toBe(-15);
});
```

```rescript
open EpureVitest

it("parses negative numbers", async () => {
  expect(await parse("-15")).toBe(-15.0)
})
```
