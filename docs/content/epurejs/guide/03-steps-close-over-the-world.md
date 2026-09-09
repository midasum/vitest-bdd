---
title: Steps close over the world
slug: steps-close-over-the-world
sort: 3
chapter: "03"
refs: [given, step-type]
---

Classic BDD runners share one design: steps are registered globally, matched by regular expression, and communicate through a mutable "World" object passed to every function. It works, and it scales badly in a familiar way — any step can touch any state, so tracing what a scenario depends on means reading every step it might match.

@epure/vitest replaces the World with the oldest tool in the language: a closure.

### Given builds, the rest remembers

Each scenario's `Given` runs a **builder**. The builder creates whatever the scenario needs — a domain object, a fake clock, an in-memory store — and registers the scenario's remaining steps as functions that close over it:

```typescript
// scheduling.feature.ts
import { expect } from "vitest";
import { Given } from "@epure/vitest";
import { makeScheduler } from "../feature/scheduler";

Given("a card {string} with interval {number} day(s)", ({ When, Then, And }, name: string, days: number) => {
  const scheduler = makeScheduler();
  const card = scheduler.add(name, { interval: days });

  When("I review {string} and pass", (n: string) => scheduler.review(n, "pass"));
  When("I review {string} and fail", (n: string) => scheduler.review(n, "fail"));

  Then("{string} is scheduled {number} day(s) out", (n: string, d: number) => {
    expect(scheduler.dueIn(n)).toBe(d);
  });
  And("the interval of {string} is {number} day(s)", (n: string, d: number) => {
    expect(scheduler.get(n).interval).toBe(d);
  });
});
```

```rescript
// SchedulingSteps.res
open EpureVitest

given("a card {string} with interval {number} day(s)", ({step}, name: string) => {
  let scheduler = Scheduler.make()
  let _card = scheduler.add(name, ~interval=2.0)

  step("I review {string} and pass", n => scheduler.review(n, Pass))
  step("I review {string} and fail", n => scheduler.review(n, Fail))

  step("{string} is scheduled {number} day(s) out", (n, d: float) => {
    expect(scheduler.dueIn(n)).toBe(d)
  })
  step("the interval of {string} is {number} day(s)", (n, d: float) => {
    expect(scheduler.get(n).interval).toBe(d)
  })
})
```

Nadia keeps `days` and `day` in the contract; Alice writes `day(s)` only in the binding patterns. The shorthand registers both spellings, so one definition follows the contract's singular and plural sentences without leaking implementation notation into the prose.

`scheduler` is not global, not injected, not looked up: it is a local variable, and the steps see it because functions remember where they were born. Every dependency of the scenario is visible in one screenful, and "find usages" on `makeScheduler` answers the question a World never could.

### What falls out of the closure

**Concurrency for free.** Each scenario calls the builder again and gets a fresh world; nothing is shared, so Vitest runs scenarios concurrently by default. No one has to serialize access to global state.

**Names are yours.** The context the builder destructures is a proxy: `When`, `Then`, `And`, `But` — or `Quand` and `Alors` — any name becomes a [step binder](api.html#step-type). Matching is by pattern text, so the binder names exist only to read well next to the feature file. ReScript keeps a single `step` field for all of them.

**Async is ordinary.** Builders and steps may be `async`; the runner awaits each in turn. The last builder parameter is Vitest's `TestContext` for the rare step that wants `onTestFailed` or a custom abort.

**Reuse is function composition.** A step set shared by several contracts — form assertions, say — is a function taking a binder and a subject. No registry, no inheritance: call it from any builder whose subject fits.

::: pro
In ReScript, `given` captures at most one `{string}` or `{number}` parameter — a type-system limit. Need more? Put the extra values in a step or a table. In practice a `Given` with three parameters is usually a scenario trying to hide its setup.
:::

::: story
Alice deletes the fix she had started writing. The failed-card scenario runs red — `expected 1, received 0` — and points to the exact clause Nadia corrected. Now the fix has a definition of done that Nadia wrote.
:::

The steps exist. What remains is to make Vitest treat a `.feature` file as one of its own.
