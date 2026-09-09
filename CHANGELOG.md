# Changelog

## Unreleased

- Mapped a ReScript test whose name `rescript format` moved to the line after
  `it(`; such tests printed `No source mapping` and reported failures against
  the wrong line.
- Added source-mapped YAML example fixtures to `epureVitest`.
- Extended `Given` to YAML scenario and background handlers with Vitest's test
  context.

## 1.1.0 — 2026-07-22

- Renamed the package from `vitest-bdd` to `@epure/vitest`.
- Renamed the canonical plugin API to `epureVitest` and
  `EpureVitestOptions`.
- Renamed the canonical ReScript module to `EpureVitest`.
- Kept deprecated TypeScript and ReScript aliases for migration.
- Moved the repository to
  [epuremethod/vitest](https://github.com/epuremethod/vitest).
- Added the [epurejs.dev](https://epurejs.dev) documentation build.
- Added support for plural idioms: `I tap 10 times` matches
  `I tap {number} time(s)`.

## 1.0.1 — 2026-04-29

- Fixed a rare `resolveId` bug when loaded from CommonJS.

## 1.0.0 — 2026-04-05

- Upgraded tests to ReScript 12.
- Released the first stable version.

## 0.6.2 — 2025-12-18

- Added default `tsx` and `jsx` step-file discovery.

## 0.6.1 — 2025-12-18

- Removed package exports to support ReScript projects with different suffix
  settings.

## 0.6.0 — 2025-09-01

- Added `toRecords`, `toNumbers`, and `toStrings`.
- Added concurrent scenarios, enabled by default.
- Added the Vitest test context to `Given` builders.
- Added complete ReScript bindings for Vitest assertions.
- Kept Vitest external to the bundle to preserve concurrency and test context.

## 0.5.1 — 2025-08-28

- Removed accidental array-step support.

## 0.5.0 — 2025-08-27

- Added array-step support.

## 0.4.0 — 2025-08-17

- Added ReScript unit tests with source maps.

## 0.3.0 — 2025-07-26

- Added configurable Markdown extensions and `.mdx` support.

## 0.2.0 — 2025-07-23

- Added Gherkin code blocks in Markdown.
- Added basic ReScript step definitions.

## 0.1.0 — 2025-07-04

- Added async and concurrent scenarios.
- Fixed negative and scientific number parsing.
- Added the initial Vite plugin.
