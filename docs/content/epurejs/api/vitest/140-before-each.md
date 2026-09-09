---
name: beforeEach
label: beforeEach(fn)
slug: before-each
kind: function
since: "0.6"
sort: 140
summary: Lifecycle hooks — beforeAll, beforeEach, afterEach, afterAll, onTestFinished.
signature.ts: "function beforeEach(fn: () => void | Promise<void>): void"
signature.res: "let beforeEach: (string, 'a) => unit"
tags: []
---

The four suite hooks are bound as in Vitest: `beforeAll`/`afterAll` bracket a suite, while `beforeEach`/`afterEach` bracket every test. `onTestFinished` registers per-test cleanup from inside the test itself — a better place for teardown that belongs to one test's setup rather than the whole suite.

Contracts rarely need any of these: a [Given](api.html#given) builder runs once per scenario and *is* the setup, with cleanup available through its closure. Use hooks in unit suites that manage an external resource.

```rescript
open EpureVitest

describe("Store", () => {
  beforeEach("open db", () => Db.openInMemory())
  afterEach("close db", () => Db.close())

  it("persists a card", () => { /* … */ })
})
```
