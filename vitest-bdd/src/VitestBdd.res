type given = {step: 'a. (string, 'a) => unit}

type pollOptions = {
  interval: float,
  timeout: float,
  message?: string,
}

type asymmetricMatcher<'a> = {
  asymmetricMatch: 'a => bool,
  toString: unit => string,
}

type serializer = {
  test: 'a. 'a => bool,
  print: 'a. 'a => string,
}

type matcherResult = {
  pass: bool,
  message: unit => string,
}

type rec passertions<'a> = {
  // Modifiers
  not: passertions<'a>,
  poll: (unit => 'a, pollOptions) => passertions<'a>,
  // Basic equality and identity
  toBe: 'a => promise<unit>,
  toEqual: 'a => promise<unit>,
  toStrictEqual: 'a => promise<unit>,
  // Truthiness
  toBeTruthy: unit => promise<unit>,
  toBeFalsy: unit => promise<unit>,
  toBeDefined: unit => promise<unit>,
  toBeUndefined: unit => promise<unit>,
  toBeNull: unit => promise<unit>,
  toBeNaN: unit => promise<unit>,
  toBeTypeOf: string => promise<unit>,
  // Numbers
  toBeCloseTo: (float, ~digits: int=?) => promise<unit>,
  toBeGreaterThan: float => promise<unit>,
  toBeGreaterThanOrEqual: float => promise<unit>,
  toBeLessThan: float => promise<unit>,
  toBeLessThanOrEqual: float => promise<unit>,
  // Strings
  toMatch: Js.Re.t => promise<unit>,
  toMatchInlineSnapshot: (~message: string=?, string) => promise<unit>,
  toMatchSnapshot: (~message: string=?) => promise<unit>,
  // Arrays and objects
  toContain: 'b. 'b => promise<unit>,
  toContainEqual: 'b. 'b => promise<unit>,
  toHaveLength: int => promise<unit>,
  toHaveProperty: 'b. (string, ~value: 'b=?) => promise<unit>,
  // Collections
  toBeOneOf: array<'a> => promise<unit>,
  // Functions
  toThrow: (~message: string=?) => promise<unit>,
  toThrowError: 'b. (~error: 'b=?, ~message: string=?) => promise<unit>,
  // Promises (async)
  resolves: 'b. passertions<'b>,
  rejects: 'b. passertions<'b>,
  // Custom matchers
  toSatisfy: ('a => bool) => promise<unit>,
  // Object/Array structure
  toMatchObject: 'b. 'b => promise<unit>,
  // File system (if using @vitest/utils)
  toMatchFileSnapshot: (string, ~message: string=?) => promise<unit>,
  // Error assertions
  toThrowErrorMatchingSnapshot: (~message: string=?) => promise<unit>,
  toThrowErrorMatchingInlineSnapshot: (~message: string=?, string) => promise<unit>,
}

type rec assertions<'a> = {
  // Modifiers
  not: assertions<'a>,
  poll: (unit => 'a, pollOptions) => assertions<'a>,
  // Basic equality and identity
  toBe: 'a => unit,
  toEqual: 'a => unit,
  toStrictEqual: 'a => unit,
  // Truthiness
  toBeTruthy: unit => unit,
  toBeFalsy: unit => unit,
  toBeDefined: unit => unit,
  toBeUndefined: unit => unit,
  toBeNull: unit => unit,
  toBeNaN: unit => unit,
  toBeTypeOf: string => unit,
  // Numbers
  toBeCloseTo: (float, ~digits: int=?) => unit,
  toBeGreaterThan: float => unit,
  toBeGreaterThanOrEqual: float => unit,
  toBeLessThan: float => unit,
  toBeLessThanOrEqual: float => unit,
  // Strings
  toMatch: Js.Re.t => unit,
  toMatchInlineSnapshot: (~message: string=?, string) => unit,
  toMatchSnapshot: (~message: string=?) => unit,
  // Arrays and objects
  toContain: 'b. 'b => unit,
  toContainEqual: 'b. 'b => unit,
  toHaveLength: int => unit,
  toHaveProperty: 'b. (string, ~value: 'b=?) => unit,
  // Collections
  toBeOneOf: array<'a> => unit,
  // Functions
  toThrow: (~message: string=?) => unit,
  toThrowError: 'b. (~error: 'b=?, ~message: string=?) => unit,
  // Promises (async)
  resolves: 'b. passertions<'b>,
  rejects: 'b. passertions<'b>,
  // Custom matchers
  toSatisfy: ('a => bool) => unit,
  // Object/Array structure
  toMatchObject: 'b. 'b => unit,
  // File system (if using @vitest/utils)
  toMatchFileSnapshot: (string, ~message: string=?) => promise<unit>,
  // Error assertions
  toThrowErrorMatchingSnapshot: (~message: string=?) => unit,
  toThrowErrorMatchingInlineSnapshot: (~message: string=?, string) => unit,
}

type expected = {
  soft: 'a. 'a => assertions<'a>,
  poll: 'a. (unit => 'a, pollOptions) => assertions<'a>,
  // Assertion counting
  assertions: int => unit,
  hasAssertions: unit => unit,
  // Unreachable
  unreachable: (~message: string=?) => unit,
  closeTo: 'a. (float, ~precision: int=?) => 'a,
  anything: 'a. unit => 'a,
  any: 'a 'b. 'a => 'b,
  arrayContaining: 'a 'b. array<'a> => 'b,
  objectContaining: 'a 'b. 'a => 'b,
  stringContaining: 'a. string => 'a,
  stringMatching: 'a. Js.Re.t => 'a,
  // Snapshot serializers
  addSnapshotSerializer: 'a. 'a => unit,
  // Custom matchers
  extend: 'a. 'a => unit,
  // Equality testers
  addEqualityTesters: 'a. array<'a> => unit,
}

module OfType = {
  external string: 'a = "String"
  external number: 'a = "Number"
  external boolean: 'a = "Boolean"
  external array: 'a = "Array"
}

// ========= Gherkin ==========

@module("vitest-bdd")
external given: (string, (given, 'a) => unit) => unit = "Given"

@module("vitest-bdd")
external toRecords: array<array<string>> => array<'a> = "toRecords"

@module("vitest-bdd")
external toStrings: array<array<string>> => array<string> = "toStrings"

@module("vitest-bdd")
external toNumbers: array<array<string>> => array<float> = "toNumbers"

// ========= Vitest ==========

type rec testContext = {
  onTestFailed: 'a. (testContext => 'a) => unit,
  onTestFinished: 'a. (testContext => 'a) => unit,
}

@module("vitest")
external expect: 'a => assertions<'a> = "expect"

@module("vitest")
external expected: expected = "expect"

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
