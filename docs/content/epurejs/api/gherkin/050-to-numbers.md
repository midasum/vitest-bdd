---
name: toNumbers
label: toNumbers(table)
slug: to-numbers
kind: function
since: "0.6"
sort: 50
summary: Flatten a one-column Gherkin table into a list of numbers.
signature.ts: "function toNumbers(table: string[][]): number[]"
signature.res: "let toNumbers: array<array<string>> => array<float>"
tags: []
---

`toNumbers` takes the first column of a data table and parses each cell as a number. Use it when a scenario enumerates values — intervals, amounts, or thresholds — and the step needs them ready for arithmetic. Its sibling helpers are [toStrings](api.html#to-strings) and [toRecords](api.html#to-records). One column, no header row — each cell represents one number:

```gherkin
Then the review intervals are
  | 2 |
  | 4 |
  | 8 |
```

```typescript
Then("the review intervals are", (table) => {
  expect(scheduler.intervals).toEqual(toNumbers(table));
});
```

```rescript
step("the review intervals are", table => {
  expect(scheduler.intervals).toEqual(toNumbers(table))
})
```
