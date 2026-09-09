---
name: expect
label: expect(actual)
slug: expect
kind: function
since: "0.4"
sort: 100
summary: Vitest's expect, typed for ReScript — the assertion entry point.
signature.ts: "function expect<T>(actual: T): Assertion<T>"
signature.res: "let expect: 'a => assertions<'a>"
tags: []
---

`expect` binds Vitest's own function — with the same behavior, failure messages, and snapshot machinery — to a typed surface: the matcher must receive the same type as the asserted value. The available matchers are listed under [assertions](api.html#assertions-type); the `not`, `resolves`, and `rejects` modifiers chain as they do in Vitest.

`resolves` and `rejects` return promise-based assertions. Await them — ReScript's type system makes an unawaited assertion a compile error when anything follows it, eliminating this class of dangling-assertion bug. See the guide chapter [Vitest in ReScript](guide.html#vitest-in-rescript).

```typescript
import { expect } from "vitest";

expect(calculator.result).toBe(0.5);
await expect(fetchDeck("spanish")).resolves.toHaveLength(3);
```

```rescript
open EpureVitest

expect(calculator.result).toBe(0.5)
await expect(fetchDeck("spanish")).resolves.toHaveLength(3)
```
