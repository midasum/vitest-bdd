type given = {step: 'a. (string, 'a) => unit}
type assertions<'a> = {toBe: 'a => unit, toEqual: 'a => unit}

// ========= Gherkin ==========

@module("vitest-bdd")
external given: (string, (given, 'args) => unit) => unit = "Given"

// ========= Vitest ==========

type rec testContext = {
  onTestFailed: 'a. (testContext => 'a) => unit,
  onTestFinished: 'a. (testContext => 'a) => unit,
}

@module("vitest")
external expect: 'a => assertions<'a> = "expect"

@module("vitest")
external concurrent: (string, unit => unit) => unit = "describe.concurrent"

@module("vitest")
external beforeAll: (string, 'a) => unit = "beforeAll"

@module("vitest")
external beforeEach: (string, 'a) => unit = "beforeEach"

@module("vitest")
external afterAll: (string, 'a) => unit = "afterAll"

@module("vitest")
external afterEach: (string, 'a) => unit = "afterEach"

@module("vitest")
external onTestFinished: (unit => unit) => unit = "onTestFinished"

@module("vitest")
external onTestFailed: (unit => unit) => unit = "onTestFinished"
// ========= Modes ==========

@module("vitest")
external describe: (string, unit => unit) => unit = "describe"

@module("vitest")
external bench: (string, unit => unit) => unit = "bench"

@module("vitest")
external test: (string, 'a) => unit = "test"

@module("vitest")
external it: (string, 'a) => unit = "it"

module Skip = {
  @module("vitest") @scope("describe")
  external describe: (string, unit => unit) => unit = "skip"

  @module("vitest") @scope("bench")
  external bench: (string, unit => unit) => unit = "skip"

  @module("vitest") @scope("test")
  external test: (string, 'a) => unit = "skip"

  @module("vitest") @scope("it")
  external it: (string, 'a) => unit = "skip"
}

module Only = {
  @module("vitest") @scope("describe")
  external describe: (string, unit => unit) => unit = "only"

  @module("vitest") @scope("bench")
  external bench: (string, unit => unit) => unit = "only"

  @module("vitest") @scope("test")
  external test: (string, 'a) => unit = "only"

  @module("vitest") @scope("it")
  external it: (string, 'a) => unit = "only"
}

module Todo = {
  @module("vitest") @scope("describe")
  external describe: string => unit = "todo"

  @module("vitest") @scope("bench")
  external bench: string => unit = "todo"

  @module("vitest") @scope("test")
  external test: string => unit = "todo"

  @module("vitest") @scope("it")
  external it: string => unit = "todo"
}
