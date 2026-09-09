---
title: Tables and other tongues
slug: tables-and-other-tongues
sort: 5
chapter: "05"
refs: [to-records, to-strings, to-numbers]
---

Some rules are not sentences. The school's interval ladder — how far a card jumps after each pass — is a table in Nadia's handbook, and forcing it into prose would make the contract *less* readable than the code. Gherkin has tables for exactly this, and `Background` to state a shared situation once:

```gherkin
Feature: The interval ladder

  Background:
    Given a deck with cards
      | name  | interval | dueIn |
      | gato  | 2        | 0     |
      | perro | 4        | 0     |
      | luz   | 16       | 3     |

  Scenario: Passing climbs the ladder
    When I review "gato" and pass
    Then the deck is
      | name  | interval | dueIn |
      | gato  | 4        | 4     |
      | perro | 4        | 0     |
      | luz   | 16       | 3     |
```

A table arrives in the step as raw rows of strings, passed as the last parameter. Three helpers shape it: [toRecords](api.html#to-records) reads the header row and returns one record per data row, while [toStrings](api.html#to-strings) and [toNumbers](api.html#to-numbers) flatten a single column into a list.

```typescript
import { Given, toRecords } from "@epure/vitest";

Given("a deck with cards", ({ When, Then }, rows) => {
  const deck = makeDeck(toRecords(rows));

  When("I review {string} and pass", (n: string) => deck.review(n, "pass"));
  Then("the deck is", (expected) => {
    expect(deck.snapshot()).toEqual(toRecords(expected));
  });
});
```

```rescript
open EpureVitest

given("a deck with cards", ({step}, rows) => {
  let deck = Deck.make(toRecords(rows))

  step("I review {string} and pass", n => deck.review(n, Pass))
  step("the deck is", expected => {
    expect(deck.snapshot()).toEqual(toRecords(expected))
  })
})
```

The `Then the deck is` assertion compares the *whole* table: the contract states not only that `gato` moved but that nothing else did. Tables make completeness easy to express.

### The contract speaks the owner's language

Nadia thinks about scheduling in French, and there is no reason her contract should not be in French too. Gherkin ships with some forty languages; a `# language:` header switches the keywords:

```gherkin
# language: fr
Fonctionnalité: Programmation des révisions

  Scénario: Une carte échouée revient le jour même
    Soit une carte "gato" avec un intervalle de 8 jours
    Quand je révise "gato" et j'échoue
    Alors "gato" est programmée dans 0 jours
```

The steps file works without any configuration because binder names were never keywords — the context proxy exposes whatever names you destructure:

```typescript
Soit("une carte {string} avec un intervalle de {number} jours", ({ Quand, Alors }, nom: string, jours: number) => {
  const scheduler = makeScheduler();
  scheduler.add(nom, { interval: jours });

  Quand("je révise {string} et j'échoue", (n: string) => scheduler.review(n, "fail"));
  Alors("{string} est programmée dans {number} jours", (n: string, j: number) => {
    expect(scheduler.dueIn(n)).toBe(j);
  });
});
```

```rescript
given("une carte {string} avec un intervalle de {number} jours", ({step}, nom: string) => {
  let scheduler = Scheduler.make()
  scheduler.add(nom, ~interval=8.0)

  step("je révise {string} et j'échoue", n => scheduler.review(n, Fail))
  step("{string} est programmée dans {number} jours", (n, j: float) => {
    expect(scheduler.dueIn(n)).toBe(j)
  })
})
```

::: story
Nadia writes the next contract herself, in French, in the pull request. Alice's review is one comment long: "le scénario trois contredit le deux — lequel gagne ?" The argument happens in the contract, before the code, in the language the rules were born in.
:::

::: pro
A contract's language is a signing decision, not a style choice. Pick the language of the person who owns the rules — translation is exactly the drift the tool exists to remove.
:::
