---
name: expected
label: expected
slug: expected
kind: function
since: "0.6"
sort: 110
summary: The static properties of Vitest's expect — soft, poll, asymmetric matchers, and extension points.
signature.ts: "expect.soft(...) / expect.poll(...) / expect.closeTo(...) — static properties on expect itself"
signature.res: "let expected: expected"
tags: []
---

In JavaScript, `expect` is both a function and an object with static properties. ReScript types cannot express that duality, so the static properties live under a second binding to the same object: `expected`. It provides `soft` (record the failure and keep running), `poll` (retry an assertion until it passes or times out), `assertions`/`hasAssertions` (count guards for async tests), `unreachable`, and the asymmetric matchers used *inside* [expect](api.html#expect) comparisons: `closeTo`, `anything`, `any`, `arrayContaining`, `objectContaining`, `stringContaining`, and `stringMatching`. The extension points `extend`, `addSnapshotSerializer`, and `addEqualityTesters` are bound as well.

`expected.any` takes a constructor; the `OfType` module provides `string`, `number`, `boolean` and `array` for the common cases.

```typescript
expect({ title: "0.1 + 0.2", sum: 0.1 + 0.20002 }).toEqual({
  title: expect.any(String),
  sum: expect.closeTo(0.3, 2),
});
```

```rescript
expect({title: "0.1 + 0.2", sum: 0.1 +. 0.20002}).toEqual({
  title: expected.any(OfType.string),
  sum: expected.closeTo(0.3, ~precision=2),
})
```
