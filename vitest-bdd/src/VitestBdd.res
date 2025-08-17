type given = {step: 'a. (string, 'a) => unit}
type assertions<'a> = {toBe: 'a => unit, toEqual: 'a => unit}

@module("vitest-bdd")
external given: (string, (given, 'args) => unit) => unit = "Given"

@module("vitest")
external expect: 'a => assertions<'a> = "expect"
