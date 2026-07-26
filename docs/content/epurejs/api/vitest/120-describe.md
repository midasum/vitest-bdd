---
name: describe
label: describe(name, fn)
slug: describe
kind: function
since: "0.4"
sort: 120
summary: Group tests under a name — with concurrent, skip, only and todo variants.
signature.ts: "function describe(name: string, fn: () => void): void"
signature.res: "let describe: (string, unit => unit) => unit"
tags: []
---

The standard Vitest grouping, bound for ReScript. `concurrent` binds `describe.concurrent` for suites whose tests may interleave. The mode variants live in nested modules so call sites read like the JavaScript they compile to: `Skip.describe` parks a suite without deleting it, `Only.describe` narrows a run while debugging, `Todo.describe` records a name with no body yet. The same three modules wrap [test](api.html#test), `it` and `bench`.

Feature files never call `describe` — the plugin generates the suite from the Gherkin structure. This binding is for the unit tests you write alongside contracts: the pure business floor, tested function by function. See guide chapter [Vitest in ReScript](guide.html#vitest-in-rescript).

```typescript
import { describe, it } from "vitest";

describe("Scheduler", () => {
  it("reschedules a passed card", () => { /* … */ });
});
```

```rescript
open EpureVitest

describe("Scheduler", () => {
  it("reschedules a passed card", () => { /* … */ })
})
```
