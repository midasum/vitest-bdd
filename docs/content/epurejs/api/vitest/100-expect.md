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

`expect` binds Vitest's own function — same behavior, same failure messages, same snapshot machinery — with a typed surface: the matcher must receive the same type as the asserted value. The available matchers are listed under [assertions](api.html#assertions-type); modifiers `not`, `resolves` and `rejects` chain as in Vitest.

`resolves` and `rejects` return promise-based assertions. Await them — ReScript's type system makes an unawaited one a compile error when anything follows it, which is a small gift: the dangling-assertion bug class does not compile. See guide chapter [Vitest in ReScript](guide.html#vitest-in-rescript).

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
