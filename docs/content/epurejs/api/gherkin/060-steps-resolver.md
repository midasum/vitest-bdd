---
name: stepsResolver
label: stepsResolver(path)
slug: steps-resolver
kind: function
since: "0.6"
sort: 60
summary: The default mapping from a feature file to its steps file.
signature.ts: "function stepsResolver(path: string): string | null"
signature.res: "// resolution happens in the plugin — override it from vitest.config.ts"
tags: []
---

Given `test/cards.feature`, the default resolver tries `test/cards.feature.ts`, then `test/cards.steps.ts`, then `test/cardsSteps.ts` — each across the extensions `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.res.mjs`, `.res.jsx`, `.res.tsx` — and finally a shared `steps.*` in the same directory. The `Steps` suffix exists for ReScript, whose module names forbid dots: `test/Cards.feature` finds `test/CardsSteps.res`.

Pass your own function as the `stepsResolver` option of [epureVitest](api.html#epure-vitest) to change the convention; return `null` to let the default error surface. The resolver is exported so a custom one can fall back on it.

```typescript
import { defineConfig } from "vitest/config";
import { stepsResolver, epureVitest } from "@epure/vitest";

export default defineConfig({
  plugins: [
    epureVitest({
      stepsResolver: (path) =>
        stepsResolver(path) ?? path.replace(/\.feature$/, ".bindings.ts"),
    }),
  ],
});
```
