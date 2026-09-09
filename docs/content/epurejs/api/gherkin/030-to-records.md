---
name: toRecords
label: toRecords(table)
slug: to-records
kind: function
since: "0.6"
sort: 30
summary: Convert a Gherkin data table into records keyed by its header row.
signature.ts: "function toRecords(table: string[][]): Record<string, string>[]"
signature.res: "let toRecords: array<array<string>> => array<'a>"
tags: []
---

A data table reaches a step as raw rows of strings. `toRecords` reads the first row as field names and returns one record per remaining row — the shape that assertions expect when comparing against a list of domain objects. Values remain strings; parse them wherever the domain requires numbers or booleans. See also [toStrings](api.html#to-strings), [toNumbers](api.html#to-numbers), and the guide chapter [Tables and other tongues](guide.html#tables-and-other-tongues).

In the feature file, the table sits under its step, header row first, and arrives as that step's last parameter — here both `Given` and `Then` receive the table as their last parameter.

```gherkin
Feature: The card table

  Scenario: Sorting by name
    Given I have a table
      | name  | interval |
      | perro | 4        |
      | gato  | 2        |
    When I sort by "name"
    Then the table is
      | name  | interval |
      | gato  | 2        |
      | perro | 4        |
```

```typescript
import { Given, toRecords } from "@epure/vitest";

Given("I have a table", ({ When, Then }, data) => {
  const table = makeTable(toRecords(data));

  When("I sort by {string}", table.sort);
  Then("the table is", (expected) => {
    expect(table.list).toEqual(toRecords(expected));
  });
});
```

```rescript
open EpureVitest

given("I have a table", ({step}, data) => {
  let table = Table.make(toRecords(data))

  step("I sort by {string}", table.sort)
  step("the table is", expected => {
    expect(table.list).toEqual(toRecords(expected))
  })
})
```
