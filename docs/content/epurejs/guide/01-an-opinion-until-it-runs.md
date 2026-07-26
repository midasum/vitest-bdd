---
title: An opinion until it runs
slug: an-opinion-until-it-runs
sort: 1
chapter: "01"
refs: []
---

This chapter is for the person deciding whether @epure/vitest belongs in their stack. There is no code in it.

A specification nobody executes is an opinion. It starts true, drifts quietly, and is discovered to be fiction at the worst possible moment — usually by the person who signed it. Every team owns a document like this: the requirements page, the acceptance checklist, the PDF with the rules in it. The code moved; the document did not; nobody can say when they parted.

@epure/vitest exists to remove the gap by removing the second artifact. A `.feature` file — plain Given/When/Then that the people who own the rules can read — is handed to Vitest as a test suite, directly. Not generated into one, not mirrored by one: the file business reads is the file the runner executes. When reality drifts from the contract, the build fails and the failure names the clause.

### Two things, deliberately small

The library does exactly two jobs.

**It runs Gherkin under Vitest, with steps as closures.** A Vite plugin parses feature files (and Gherkin blocks inside Markdown) and compiles them, in memory, into ordinary Vitest suites — watch mode, concurrency, and failure reporting included. The steps that give each sentence meaning are plain functions: a `Given` builds the scenario's world, and every `When` and `Then` closes over it. There is no World object, no step registry shared across files, no regular-expression soup. If you have written a function that returns functions, you have written @epure/vitest steps.

**It ports Vitest to ReScript.** Complete typed bindings — `expect`, the full matcher surface, suites, hooks, modes — so a ReScript codebase writes its unit tests and its step definitions in its own language, with source maps pointing failures at the `.res` line.

The landing page borrows a word for the first job: *compas* — the divider, the tool that steps a drawing off against the work. Each test run is that gesture: the contract measured against the build, clause by clause.

### The proof sheet of épure

In the [épure](https://epuremethod.com) method, feature files are written *before* the code, by a domain expert and a method expert together, and signed by the people who own the need. From that moment the contract governs the whole structure: the AI implements against it, the senior reviews against it, and @epure/vitest is what makes the governing literal — every scenario runs green or the window does not close. [tilia](https://tiliajs.dev) is the foundation sheet, [@tilia/query](https://tiliajs.dev/query/) the data sheet; this is the proof sheet, and this guide is the last panel of the drawing.

### How this guide works

Readers of the [tilia](https://tiliajs.dev) and [@tilia/query](https://tiliajs.dev/query/) guides know Alice and her spaced-repetition flashcards. Her app has grown up: a language school uses it now, and the scheduling rules — when a failed card returns, how intervals stretch — are no longer hers to decide.

::: story
Nadia teaches Spanish and owns the review rules. Last month Alice shipped a change that rescheduled failed cards to the next day. Nadia had signed off — on a PDF. The PDF still says *same day*.
:::

Each chapter is one part of the tool: the shape of a contract, steps as closures, the wiring into Vitest, tables and languages, contracts inside prose, and the ReScript port. If you decide for your team, this chapter and the [last](#onward) may be all you need. The chapters between are for whoever writes the contracts — and whoever, human or machine, is held to them.
