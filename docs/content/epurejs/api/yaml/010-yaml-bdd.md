---
name: yamlBdd
label: yamlBdd(options)
slug: yaml-bdd
kind: function
since: "1.2"
sort: 10
summary: Compile structured YAML examples into source-mapped Vitest suites.
signature.ts: "function yamlBdd(options?: YamlBddOptions): Plugin"
signature.res: "// configured in vitest.config.ts — YAML fixtures are a TypeScript API"
tags: []
---

`yamlBdd` returns a Vite plugin for `*.test.yaml` fixtures. A fixture names one
background handler and lists examples; every example becomes a Vitest test, and
all fields except `scenario` are passed to that handler as data.

The plugin resolves a steps module beside the fixture, compiles the suite in
memory, and preserves YAML line numbers through source maps. Scenarios run
concurrently by default.

```typescript
// vitest.config.ts
import { yamlBdd } from "@epure/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [yamlBdd()],
  test: { include: ["**/*.test.yaml"] },
});
```

```yaml
feature: Calculator
background:
  given: a calculator
examples:
  - scenario: adds two numbers
    left: 1
    right: 2
    result: 3
```
