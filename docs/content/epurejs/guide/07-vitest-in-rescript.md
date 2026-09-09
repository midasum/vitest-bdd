---
title: Vitest in ReScript
slug: vitest-in-rescript
sort: 7
chapter: "07"
refs: [expect, expected, assertions-type, describe, test, before-each]
---

The second thing @epure/vitest does may seem unrelated until you build an épure application: it provides complete ReScript bindings for Vitest. The business floor of such an application consists of pure ReScript functions; the contracts sit above them, but the functions themselves deserve unit tests in the language in which they are written. Without bindings, a ReScript team writes its tests in TypeScript — a translation layer at exactly the boundary the method tries to keep clean.

With `open EpureVitest`, the whole runner is available. The former `VitestBdd`
module remains available as a deprecated alias and produces warnings in the
compiler and editor:

```rescript
// Scheduler_test.res
open EpureVitest

describe("Scheduler", () => {
  it("doubles the interval on pass", () => {
    let s = Scheduler.make()
    s.add("gato", ~interval=2.0)
    s.review("gato", Pass)
    expect(s.get("gato").interval).toBe(4.0)
  })

  it("loads the deck", async () => {
    await expect(Deck.fetch("spanish")).resolves.toHaveLength(3)
  })
})
```

Failures point to the `.res` line — source maps survive the compiler — and `describe`, [test](api.html#test), `it`, and `bench` come with `Skip`, `Only`, and `Todo` modules for the modes, plus [hooks](api.html#before-each) for suites that manage a resource.

### Assertions that know their type

[expect](api.html#expect) returns a typed [record of matchers](api.html#assertions-type): `expect(5.0)` offers float comparisons, `expect([1, 2])` offers array matchers, and `toBe` demands the same type it was given. A matcher misuse that would fail at runtime in JavaScript does not compile here.

The static properties of JavaScript's `expect` — a function that is also an object — cannot share one binding in ReScript, so they live under [expected](api.html#expected): `soft`, `poll`, assertion counting, and the asymmetric matchers used inside comparisons:

```rescript
expect({title: "0.1 + 0.2", sum: 0.1 +. 0.20002}).toEqual({
  title: expected.any(OfType.string),
  sum: expected.closeTo(0.3, ~precision=2),
})
```

One binding is quietly better than the original. `resolves` and `rejects` return promise-based assertions, and in JavaScript forgetting to `await` one is a classic silent bug — the test passes while the assertion floats away. In ReScript, an unawaited promise followed by more code is a *type error*. The language enforces what Vitest's lint rule only suggests.

::: pro
Steps files are ReScript too — `SchedulingSteps.res` next to `Scheduling.feature`, resolved by the `Steps` suffix convention. Contract steps and unit tests share the same `open EpureVitest`, the same matchers, the same watch loop.
:::

::: story
Alice's scheduler is four pure functions in `Scheduler.res`. The contract holds the behavior Nadia signed off on; the unit tests hold the edge cases Nadia never thought to ask about — leap days, an empty deck, an interval already at the ceiling. Two nets, one runner, zero translation.
:::
