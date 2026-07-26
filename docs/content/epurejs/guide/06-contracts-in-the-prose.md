---
title: Contracts in the prose
slug: contracts-in-the-prose
sort: 6
chapter: "06"
refs: []
---

A feature file states rules; it does not explain them. The *why* — the pedagogy behind the interval ladder, the history of the same-day rule — lives in prose, and prose drifts for the same reason specs do: nothing fails when it goes stale.

So @epure/vitest reads Markdown. Any `.md` or `.mdx` file in `test.include` is scanned for `gherkin` code fences, and the fences are compiled into one suite exactly as a `.feature` file would be — same steps resolution (`handbook.md` pairs with `handbook.md.ts`), same reporting, same watch mode. The prose between the fences is ignored by the runner and precious to the reader:

```gherkin
Feature: Review scheduling

  Background:
    Given a card "gato" with interval 8 days
```

Further down the same document, after two paragraphs explaining why a lapse must not punish the learner:

```gherkin
Scenario: A failed card returns the same day
  When I review "gato" and fail
  Then "gato" is scheduled 0 days out
  And the interval of "gato" is 1 day
```

Fences accumulate into a single feature: a `Background` in the first block governs scenarios in later ones, so the document reads as one argument and runs as one suite.

### The handbook that cannot lie

This inverts the usual relationship between documentation and tests. The scheduling page of the school's handbook is no longer *about* the system — it is part of the system's test run. If a rewrite of the scheduler breaks a promise made in the handbook, CI fails on the handbook. The document Nadia shows new teachers is guaranteed current, not by discipline, but by the same mechanism that guards the code.

The épure world has a name for this: spec-driven development. Draft the change as prose with embedded scenarios — the reasoning and the rules in one reviewable document — and hand it to the machine. The prose anchors the implementation prompts; the fences grade the result. When the window closes, the design document did not go stale in a wiki: it became the regression suite.

::: story
Alice moves the scheduling rules into `scheduling.md`: Nadia's reasoning as prose, each rule as a fence beneath the paragraph that justifies it. The old PDF goes in the bin. When a teacher asks "what happens when a student fails a mature card?", Nadia sends a link to a page that ran green twenty minutes ago.
:::

::: pro
Keep one concern per document, exactly as you would for a feature file. A `handbook.md` that accumulates every rule of the school becomes the same unreviewable blob the PDF was — the fences make prose testable, not infinite.
:::

One audience remains: the ReScript codebase underneath the contracts. It gets the whole of Vitest in its own language — next chapter.
