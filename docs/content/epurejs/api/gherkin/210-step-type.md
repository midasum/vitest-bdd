---
name: Step
label: Step
slug: step-type
kind: type
since: "0.1"
sort: 210
summary: A step binder — the functions the Given builder destructures to register When, Then, and friends.
signature.ts: "type Step = (pattern: string, op: Operation) => void"
signature.res: "type given = {step: 'a. (string, 'a) => unit}"
tags: []
---

The first argument of a [Given](api.html#given) builder is a `Context`: a record whose every field is a `Step`. In TypeScript the record is a proxy, so *any* name you destructure becomes a binder — `When`, `Then`, `And`, `But`, or `Quand` and `Alors` for a French contract. The names carry no semantics; matching is by pattern, so choose the words that read best next to the feature file. In ReScript the record has the single field `step`, used for every keyword.

Step patterns use the same Cucumber expressions and `(s)` shorthand as `Given`: `the queue has {number} card(s)` binds sentences ending in either `card` or `cards`. The feature file still says the concrete sentence; `(s)` belongs only to the binding pattern.

The operation receives the step's captured parameters — `{string}` as string, `{number}` as number, a trailing data table as `string[][]` — and may be `async`; the runner awaits it. Binding a pattern twice replaces the first operation. A step present in the feature file but never bound fails the scenario with `Step "…" not found`. In the feature file, `And` and `But` continue the previous kind of step and match by pattern like any other — one binding serves whichever keyword introduces the sentence.

```gherkin
Feature: Spaced repetition

  Scenario: Passed cards leave the queue
    Given a deck named "spanish"
    When I review "gato"
    And I review "perro"
    Then the queue has 0 cards
    But nothing is due tomorrow
```

```typescript
Given("a deck named {string}", ({ When, Then, But }, name: string) => {
  const deck = makeDeck(name);
  When("I review {string}", deck.review);
  Then("the queue has {number} cards", (n: number) => {
    expect(deck.queue.length).toBe(n);
  });
  But("nothing is due tomorrow", () => {
    expect(deck.dueTomorrow).toEqual([]);
  });
});
```

```rescript
given("a deck named {string}", ({step}, name: string) => {
  let deck = Deck.make(name)
  step("I review {string}", deck.review)
  step("the queue has {number} cards", (n: float) => {
    expect(deck.queue->Array.length->Int.toFloat).toBe(n)
  })
  step("nothing is due tomorrow", () => {
    expect(deck.dueTomorrow).toEqual([])
  })
})
```
