open VitestBdd

given("I have a {string} calculator", ({step}, name: string) => {
  let calculator = ResCalculator.make(name)

  step("I add {number} and {number}", calculator.add)
  step("I subtract {number} and {number}", calculator.subtract)
  step("I multiply {number} and {number}", calculator.multiply)
  step("I divide {number} by {number}", calculator.divide)

  step("the result is {number}", (n: float) => {
    expect(calculator.result).toBe(n)
  })

  step("the title is {string}", (s: string) => {
    expect(calculator.title).toBe(s)
  })
})
