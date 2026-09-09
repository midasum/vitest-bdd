---
title: Onward
slug: onward
sort: 8
chapter: "08"
refs: []
---

Step back and look at what Alice and Nadia have now. The rules of review scheduling exist once, in a file both of them can read, and Vite compiles that file into a test suite in memory. There is no second authored or generated test file that can drift from it silently. When the rules change, the contract changes first, in review, in Nadia's language — and the code follows because the build will not go green until it does.

The mental model compresses well:

- **One artifact.** The feature file the business signs is the file Vitest runs. The contract and the suite cannot drift apart because they are not two things.
- **Steps are closures.** `Given` builds a private world; `When` and `Then` remember it. No World object, no registry — and concurrency for free, because nothing is shared.
- **The runner is Vitest.** Watch mode, filtering, reporting, CI: contracts inherit all of it through one plugin line.
- **Tables and tongues.** Structured rules stay tables; the contract speaks the language of whoever owns the rules.
- **Prose can be a contract.** Gherkin fences make a design document part of the test run — the handbook that cannot lie.
- **ReScript is first-class.** Steps, unit tests, and the full Vitest surface in one typed language, with the unawaited-promise bug demoted to a compile error.

### The sheet set, complete

This guide closes a trilogy. [tilia](https://tiliajs.dev) is the foundation sheet: application state in the domain's shape, observed directly. [@tilia/query](https://tiliajs.dev/query/) is the data sheet: the sap — remote collections held through winter, flowing again at thaw. @epure/vitest is the proof sheet: the compas that steps the drawing off against the work. Foundation, data, proof — the toolset of [épure](https://epuremethod.com), the method that opens a window on a validated need and refuses to close it until every signed scenario runs green.

The three tools also vouch for each other. The offline behaviors the @tilia/query guide narrated — the tunnel edits, the restart replay — are pinned by a Gherkin specification that runs under @epure/vitest. The tools are built the way the method says software should be built; their own structure was governed by the drawing first.

### Where to go from here

The [API reference](api.html) is the flat, complete surface — the plugin, the step definitions, the table helpers, and the Vitest bindings, each with signatures in both languages. This guide chose the readable path; the reference has the precise one.

If you arrived here first, the [tilia guide](https://tiliajs.dev) explains the reactivity that carries application state to the screen, and the [@tilia/query guide](https://tiliajs.dev/query/) explains how remote data joins it. The guides can be read in any order because the tools work together.

::: story
Friday. Nadia opens the window's closing review with the handbook page — every fence green. The auditor asks how she knows the app does what the document says. She reruns the suite instead of answering. What was drawn is what was built; the compas agrees, clause by clause.
:::
