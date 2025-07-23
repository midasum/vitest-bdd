type match = {
  when_: (string, (int, int) => unit) => unit,
  then_: (string, int => unit) => unit,
  and_: (string, string => unit) => unit,
}
type givenUtils = {
  @as("When") when_: 'a. (string, 'a) => unit,
  @as("Then") then_: 'a. (string, 'a) => unit,
  @as("And") and_: 'a. (string, 'a) => unit,
  @as("Quand") quand: 'a. (string, 'a) => unit,
}
type assertions<'a> = {toBe: 'a => unit}
@module("vitest-bdd")
external given: (string, (givenUtils, 'args) => unit) => unit = "Given"
@module("vitest")
external expect: 'a => assertions<'a> = "expect"

given("I have a {string} calculator", ({when_, then_, and_}, name: string) => {
  let calculator = ResCalculator.make(name)

  when_("I add {number} and {number}", calculator.add)
  when_("I subtract {number} and {number}", calculator.subtract)
  when_("I multiply {number} and {number}", calculator.multiply)
  when_("I divide {number} by {number}", calculator.divide)

  then_("the result is {number}", (n: float) => {
    expect(calculator.result).toBe(n)
  })
  and_("the title is {string}", (s: string) => {
    expect(calculator.title).toBe(s)
  })
})
