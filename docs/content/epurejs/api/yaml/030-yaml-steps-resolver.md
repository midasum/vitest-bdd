---
name: yamlStepsResolver
label: yamlStepsResolver(path)
slug: yaml-steps-resolver
kind: function
since: "1.2"
sort: 30
summary: Resolve a YAML fixture to its fixture-specific or shared steps module.
signature.ts: "function yamlStepsResolver(path: string): string | null"
signature.res: "// YAML fixture resolution is a TypeScript API"
tags: []
---

For `calculator.test.yaml`, the default resolver checks these stems in order:

1. `calculator.test`
2. `calculator.steps`
3. `steps` in the fixture's directory

Each stem is tried with `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, and the
compiled ReScript suffixes `.res.mjs`, `.res.jsx`, and `.res.tsx`. The first
existing module wins. Return `null` when no steps module exists; `yamlBdd` then
generates one failing test that explains what is missing.

Pass a custom resolver through
[YamlBddOptions](api.html#yaml-options-type) when a project uses another
layout.
