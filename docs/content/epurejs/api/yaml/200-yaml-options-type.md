---
name: YamlBddOptions
label: YamlBddOptions
slug: yaml-options-type
kind: type
since: "1.2"
sort: 200
summary: Configuration accepted by the yamlBdd plugin.
signature.ts: "type YamlBddOptions = { suffix?; concurrent?; stepsResolver?; debug? }"
signature.res: "// plugin options are written in vitest.config.ts (TypeScript)"
tags: []
---

All fields are optional:

- `suffix` (default `".test.yaml"`) — files compiled as YAML fixtures.
- `concurrent` (default `true`) — run examples concurrently.
- `stepsResolver` (default
  [yamlStepsResolver](api.html#yaml-steps-resolver)) — how a fixture finds its
  steps module.
- `debug` (default `false`) — log the generated suite during compilation.

```typescript
import { yamlBdd } from "@epure/vitest";

yamlBdd({ suffix: ".examples.yaml", concurrent: false });
```
