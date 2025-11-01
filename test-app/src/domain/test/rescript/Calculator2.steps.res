open VitestBdd

given("a calculator", ({step}, ()) => {
  let calculator = ResCalculator.make("basic")
  let numbers = ref([])
  step("I have {number} and {number} and {number}", (a: float, b: float, c: float) => {
    numbers := [a, b, c]
  })

  step("I add them all", () => {
    calculator.add(0., 0.)
    Array.forEach(
      numbers.contents,
      number => {
        calculator.add(calculator.result, number)
      },
    )
  })
  step("the result is {number}", (n: float) => {
    expect(calculator.result).toBe(n)
  })
})
