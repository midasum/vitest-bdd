open VitestBdd

given("I have a {string} calculator", ({step}, name: string) => {
  let calculator = ResCalculator.make(name)

  step("I add {number} to {number}", calculator.add)
  step("I subtract {number} to {number}", calculator.subtract)
  step("I multiply {number} with {number}", calculator.multiply)
  step("I divide {number} by {number}", calculator.divide)
  step("I sum {number[]}", (numbers: array<float>) => calculator.sum(numbers))

  step("the result is {number}", (n: float) => {
    expect(calculator.result).toBe(n)
  })

  step("the title is {string}", (s: string) => {
    expect(calculator.title).toBe(s)
  })
})
