open VitestBdd

describe("ReScript tests and source maps", () => {
  it("should add two numbers", () => {
    expect(2 + 2).toBe(4)
  })

  it("should work with async", async () => {
    expect(11 - 2).toBe(9)
  })

  it("should have more tests", () => {
    expect(5 - 2).toBe(3)
  })

  it("should have more and more tests", () => {
    expect(5 - 2).toBe(3)
  })

  Todo.it("todo")
  Skip.it("skipped test", () => {
    expect(5 - 2).toBe(3)
  })
})
