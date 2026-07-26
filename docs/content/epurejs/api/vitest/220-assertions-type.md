---
name: assertions
label: assertions
slug: assertions-type
kind: type
since: "0.6"
sort: 220
summary: The typed matcher surface returned by expect.
signature.ts: "type Assertion<T> // vitest's own — @epure/vitest adds nothing on the TS side"
signature.res: "type rec assertions<'a> = {not: assertions<'a>, toBe: 'a => unit, toEqual: 'a => unit, resolves: passertions<'b>, ...}"
tags: []
---

The record behind [expect](api.html#expect): equality (`toBe`, `toEqual`, `toStrictEqual`, `toMatchObject`), truthiness (`toBeTruthy`, `toBeNull`, `toBeDefined`, …), numeric comparisons (`toBeCloseTo`, `toBeGreaterThan`, …), strings (`toMatch`), collections (`toContain`, `toContainEqual`, `toHaveLength`, `toHaveProperty`, `toBeOneOf`), functions (`toThrow`, `toThrowError`), predicates (`toSatisfy`), and the snapshot family (`toMatchSnapshot`, `toMatchInlineSnapshot`, `toMatchFileSnapshot`, and the throwing variants).

Matchers are typed against the asserted value: `expect(5.0)` offers `float` comparisons, `expect([1, 2])` offers `array` matchers. The `not` modifier returns the same record negated. `resolves` and `rejects` switch to `passertions`, the promise-returning twin of this record — every matcher there must be awaited.

```rescript
expect([1, 2, 3]).toContain(2)
expect("hello world").toMatch(/world/)
expect(5.0).toBeGreaterThanOrEqual(5.0)

let boom = () => throw(Failure("fail"))
expect(boom).toThrowError(~message="fail")
```
