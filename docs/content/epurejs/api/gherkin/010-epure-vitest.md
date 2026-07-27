---
name: epureVitest
label: epureVitest(options)
slug: epure-vitest
kind: function
since: "0.1"
sort: 10
summary: Compile Gherkin, Markdown, YAML, and ReScript files for Vitest.
signature.ts: "function epureVitest(options?: EpureVitestOptions): Plugin"
signature.res: "// configured in vitest.config.ts — the plugin side stays in TypeScript"
tags: []
---

`epureVitest` returns one Vite plugin for every supported contract format. It
compiles `.yaml` fixtures, files matching
[gherkinExtensions](api.html#options-type), `gherkin` code fences in files
matching `markdownExtensions`, and configured ReScript files. Vitest's
`test.include` controls which files are tests. There is no separate runner and
no generated code on disk.

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
    include: ["**/*.feature", "**/*.test.yaml", "**/*.spec.ts", "**/*.mdx"],
  },
});
```
