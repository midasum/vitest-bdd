---
name: toStrings
label: toStrings(table)
slug: to-strings
kind: function
since: "0.6"
sort: 40
summary: Flatten a one-column Gherkin table into a list of strings.
signature.ts: "function toStrings(table: string[][]): string[]"
signature.res: "let toStrings: array<array<string>> => array<string>"
tags: []
---

`toStrings` takes the first column of a data table and returns it as a plain list — for tables that are really just an enumeration, with no header row semantics. Its numeric sibling is [toNumbers](api.html#to-numbers); for header-driven tables use [toRecords](api.html#to-records). One column, no header row — the whole table is the list:

```gherkin
Then the decks are
  | spanish |
  | physics |
```

```typescript
Then("the decks are", (table) => {
  expect(store.deckNames).toEqual(toStrings(table));
});
```

```rescript
step("the decks are", table => {
  expect(store.deckNames).toEqual(toStrings(table))
})
```
