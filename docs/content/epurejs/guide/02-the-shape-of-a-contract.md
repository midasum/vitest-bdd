---
title: The shape of a contract
slug: the-shape-of-a-contract
sort: 2
chapter: "02"
refs: [steps-resolver]
---

A contract is a text file with the `.feature` extension, and its grammar is Gherkin — small enough to learn in the time it takes to read this chapter. Alice and Nadia write the first one together, Nadia dictating, Alice typing:

```gherkin
Feature: Review scheduling

  Scenario: A passed card waits longer each time
    Given a card "gato" with interval 2 days
    When I review "gato" and pass
    Then "gato" is scheduled 4 days out

  Scenario: A failed card returns the same day
    Given a card "gato" with interval 8 days
    When I review "gato" and fail
    Then "gato" is scheduled 0 days out
    And the interval of "gato" is 1 day
```

That second scenario is the one the shipped bug violated — now it is two lines of plain language with a pass/fail verdict attached.

### The grammar, entirely

A `Feature:` names the sheet. Each `Scenario:` is one test: it begins with `Given` (the situation), acts with `When`, and asserts with `Then`. `And` and `But` continue whichever kind of step came before — they are readability, not semantics. Values in quotes and bare numbers are parameters; the step definitions capture them. A `Background:` section holds steps shared by every scenario in the file, and data tables carry structured values — both wait until [chapter five](#tables-and-other-tongues).

That is the whole grammar. The point of the smallness is who it admits: Nadia reads this file with no training, catches the wrong rule *before* implementation, and what she approves is — verbatim — what runs.

::: story
Nadia reads the draft and stops at a line Alice thought was obvious: "No — failing a mature card resets the interval to one day, not zero. Zero means they see it twice in one session." One word changes in the contract. No code exists yet to fix.
:::

### Where contracts live

A feature file sits next to the code it governs, and its steps file sits next to it, found by naming convention: `scheduling.feature` looks for `scheduling.feature.ts`, then `scheduling.steps.ts`, then `schedulingSteps.ts` — the last form exists because ReScript module names cannot contain dots, so `Scheduling.feature` pairs with `SchedulingSteps.res`. A directory-wide `steps.ts` catches whatever remains, and the convention itself is [replaceable](api.html#steps-resolver).

In an épure project the features gather in the domain's test directory — `src/domain/test/*.feature` — one file per behavior, named after the need it answers. The contract is versioned with the code, reviewed in the same pull request, and signed in the tool where signatures mean something: the repository.

::: pro
Write the feature file as if the code did not exist — name what the business observes, never how the code achieves it. "The card is scheduled 4 days out", not "the scheduler returns 4". A contract that names internals has already started to drift.
:::

The sentences are signed. Making them executable is the job of the steps file — and that is where the design of @epure/vitest earns its keep.
