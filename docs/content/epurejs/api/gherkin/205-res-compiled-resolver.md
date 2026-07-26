---
name: resCompiledResolver
label: resCompiledResolver(path)
slug: res-compiled-resolver
kind: function
since: "0.4"
sort: 205
summary: Resolve a ReScript source file to its compiled JavaScript module.
signature.ts: "function resCompiledResolver(path: string): string | null"
signature.res: "// used by the TypeScript plugin configuration"
tags: []
---

The default resolver checks the compiled forms emitted beside a `.res` source.
Pass a custom `resCompiledResolver` to [epureVitest](api.html#epure-vitest) when
the ReScript output uses another location or suffix.

```typescript
import {
  epureVitest,
  resCompiledResolver,
} from "@epure/vitest";

epureVitest({
  resCompiledResolver(path) {
    return resCompiledResolver(path);
  },
});
```
