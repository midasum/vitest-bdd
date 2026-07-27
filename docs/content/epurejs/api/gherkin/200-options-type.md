---
name: EpureVitestOptions
label: EpureVitestOptions
slug: options-type
kind: type
since: "0.1"
sort: 200
summary: Configuration accepted by the epureVitest plugin.
signature.ts: "type EpureVitestOptions = { debug?; concurrent?; markdownExtensions?; gherkinExtensions?; rescriptExtensions?; stepsResolver?; resCompiledResolver? }"
signature.res: "// plugin options are written in vitest.config.ts (TypeScript)"
tags: []
---

All fields are optional; the defaults are the convention this documentation assumes.
The former `VitestBddOptions` name remains as a deprecated TypeScript alias.

- `concurrent` (default `true`) — run scenarios concurrently. Safe because each scenario builds its own context; disable only for suites that share external state.
- `gherkinExtensions` (default `[".feature"]`) — files parsed as pure Gherkin.
- `markdownExtensions` (default `[".md", ".mdx", ".markdown"]`) — files scanned for `gherkin` code fences; see guide chapter [Contracts in the prose](guide.html#contracts-in-the-prose).
- `.yaml` files are always compiled as structured fixtures; use Vitest's
  `test.include` to select them.
- `rescriptExtensions` (default `[".res"]`) — ReScript sources translated with source maps.
- `stepsResolver` (default [stepsResolver](api.html#steps-resolver)) — how a
  feature, Markdown, or YAML file finds its steps.
- `resCompiledResolver` — how a ReScript source finds its compiled JavaScript module.
- `debug` (default `false`) — log the generated suite during compilation.

```typescript
import { defineConfig } from "vitest/config";
import { epureVitest } from "@epure/vitest";

export default defineConfig({
  plugins: [epureVitest({ markdownExtensions: [".mdx"], concurrent: true })],
  test: { include: ["**/*.feature", "**/*.mdx"] },
});
```
