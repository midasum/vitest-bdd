---
name: epureVitest
label: epureVitest(options)
slug: epure-vitest
kind: function
since: "0.1"
sort: 10
summary: The Vite plugin — compiles feature files and Gherkin-in-Markdown into Vitest suites.
signature.ts: "function epureVitest(options?: EpureVitestOptions): Plugin"
signature.res: "// configured in vitest.config.ts — the plugin side stays in TypeScript"
tags: []
---

`epureVitest` returns a Vite plugin. Registered in the Vitest config, it intercepts every file matching [gherkinExtensions](api.html#options-type) (and `gherkin` code fences in files matching `markdownExtensions`), parses it with the official Cucumber parser, finds the matching steps file through [stepsResolver](api.html#steps-resolver), and hands Vitest an ordinary suite. There is no separate runner and no generated code on disk: the feature file *is* the test file, listed in `test.include` like any other.

Scenarios run concurrently by default — each `Given` builds its own context, so there is no shared world to serialize on. Set `concurrent: false` if a suite genuinely needs order. See guide chapter [Wired into Vitest](guide.html#wired-into-vitest).

The former `vitestBdd` export remains as a deprecated alias and warns once per
process when called.

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
