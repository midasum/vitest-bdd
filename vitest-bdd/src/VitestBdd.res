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

type rec assertions<'a> = {
  // Modifiers
  not: assertions<'a>,
  poll: (unit => 'a, pollOptions) => assertions<'a>,
  // Basic equality and identity
  toBe: 'never. 'a => 'never,
  toEqual: 'never. 'a => 'never,
  toStrictEqual: 'never. 'a => 'never,
  // Truthiness
  toBeTruthy: 'never. unit => 'never,
  toBeFalsy: 'never. unit => 'never,
  toBeDefined: 'never. unit => 'never,
  toBeUndefined: 'never. unit => 'never,
  toBeNull: 'never. unit => 'never,
  toBeNaN: 'never. unit => 'never,
  toBeTypeOf: 'never. string => 'never,
  // Numbers
  toBeCloseTo: 'never. (float, ~numDigits: int=?) => 'never,
  toBeGreaterThan: 'never. float => 'never,
  toBeGreaterThanOrEqual: 'never. float => 'never,
  toBeLessThan: 'never. float => 'never,
  toBeLessThanOrEqual: 'never. float => 'never,
  // Strings
  toMatch: 'never. Js.Re.t => 'never,
  toMatchInlineSnapshot: 'never. (~message: string=?, string) => 'never,
  toMatchSnapshot: 'never. (~message: string=?) => 'never,
  // Arrays and objects
  toContain: 'b 'never. 'b => 'never,
  toContainEqual: 'b 'never. 'b => 'never,
  toHaveLength: 'never. int => 'never,
  toHaveProperty: 'b 'never. (string, ~value: 'b=?) => 'never,
  // Collections
  toBeOneOf: 'never. array<'a> => 'never,
  // Functions
  toThrow: 'never. (~message: string=?) => 'never,
  toThrowError: 'b 'never. (~error: 'b=?, ~message: string=?) => 'never,
  // Promises (async)
  resolves: 'b. assertions<'b>,
  rejects: 'b. assertions<'b>,
  // Custom matchers
  toSatisfy: 'never. ('a => bool) => 'never,
  // Object/Array structure
  toMatchObject: 'b 'never. 'b => 'never,
  // File system (if using @vitest/utils)
  toMatchFileSnapshot: 'never. (string, ~message: string=?) => 'never,
  // Error assertions
  toThrowErrorMatchingSnapshot: 'never. (~message: string=?) => 'never,
  toThrowErrorMatchingInlineSnapshot: 'never. (~message: string=?, string) => 'never,
}

type expected = {
  soft: 'a. 'a => assertions<'a>,
  poll: 'a. (unit => 'a, pollOptions) => assertions<'a>,
  // Assertion counting
  assertions: int => unit,
  hasAssertions: unit => unit,
  // Unreachable
  unreachable: 'never. (~message: string=?) => 'never,
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
external given: (string, (given, 'args) => unit) => unit = "Given"

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
