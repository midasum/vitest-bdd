---
title: Wired into Vitest
slug: wired-into-vitest
sort: 4
chapter: "04"
refs: [epure-vitest, options-type]
---

@epure/vitest is not a test framework. Vitest is the framework; @epure/vitest is a Vite plugin that teaches it to read Gherkin. The whole installation is one import and one line in `test.include`:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { epureVitest } from "@epure/vitest";

export default defineConfig({
  plugins: [epureVitest()],
  test: {
    include: ["**/*.feature", "**/*.spec.ts", "**/*.mdx"],
  },
});
```

When Vitest loads a `.feature` file, the plugin parses it with the official Cucumber parser, resolves the steps file by [convention](api.html#steps-resolver), and emits a suite *in memory* — nothing is generated on disk, nothing to regenerate or gitignore. The feature file appears in the test tree under its own name, each scenario a test, each step a line in the report.

### Everything Vitest gives, contracts get

Because the contract is a first-class suite, every Vitest capability applies with no ceremony. **Watch mode**: save the feature file or the steps file and the affected scenarios re-run — Alice keeps the contract open in one split and the scheduler in the other, and the feedback loop is the same hot loop she has for unit tests. **Filtering**: `vitest scheduling` runs one contract. **Reporting**: a failed step names the feature file, the scenario, and the sentence, then shows the assertion diff.

Scenarios run **concurrently** by default. The closure design is what makes this safe — each scenario builds a private world, so there is nothing to race on. If a contract drives something genuinely shared (one database, one port), set `concurrent: false` in the [options](api.html#options-type) rather than hoping.

::: pro
Feature files and unit specs coexist in one config and one run. The contracts pin behavior at the domain boundary; the `.spec.ts` files pin the functions beneath it. One `vitest run` in CI reports both — the window's "every scenario green" and the engineer's regression net are the same command.
:::

### Editors

Gherkin is plain text, so tooling is optional — but the Cucumber autocomplete extension for VS Code adds completion from your own step patterns, and the Vitest extension shows scenarios in the test explorer with run buttons, like any other test. The README lists the settings; the one that matters is pointing `cucumberautocomplete.steps` at your steps files so the editor learns the vocabulary of your contracts.

::: story
Alice fixes the scheduler with the contract running in watch mode. Red, red, green — the failed-card scenario passes, the passed-card scenario still passes. She commits the feature file and the fix in one change; the reviewer reads Nadia's sentence, then the diff that honors it.
:::

The machinery is in place. The next two chapters widen what a contract can say: structured data, other languages, and prose.
