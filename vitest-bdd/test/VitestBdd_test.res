open VitestBdd

type nameAge = {
  name: string,
  age: int,
}

type ab = {
  a?: int,
  b?: int,
}

type foo = {foo: string}

type user = {
  firstName: string,
  middleName: nullable<string>,
  lastName: string,
}

type titleSum = {
  title: string,
  sum: float,
}

type list = {list: array<int>}

exception MyException(string)

type matcher<'a> = {toBeFoo: 'a => matcherResult}

describe("VitestBdd", () => {
  it("should match snapshot", () => {
    expect({name: "John", age: 31}).toMatchSnapshot()
  })
  it("should match object", () => {
    expect({name: "John", age: 31}).toMatchObject({name: "John", age: 31})
  })
  it("should support .not modifier", () => {
    expect(1).not.toBe(2)
  })
  it("should support .soft modifier", () => {
    expected.soft(1).toBe(1)
  })
  it("should support .poll modifier", async () => {
    expected.poll(() => 42, {interval: 10., timeout: 50.}).toBe(42)
  })
  it("should support toBe", () => {
    expect(1).toBe(1)
  })
  it("should compile with multiple assertions", () => {
    // This checks we have a sane return type
    expected.assertions(2)
    expect(1).toBe(1)
    expect(2).toBe(2)
  })
  it("should support toEqual", () => {
    expect([1, 2, 3]).toEqual([1, 2, 3])
  })
  it("should support toStrictEqual", () => {
    expect({a: 1, b: 2}).toStrictEqual({a: 1, b: 2})
  })
  it("should support toBeTruthy", () => {
    expect(true).toBeTruthy()
  })
  it("should support toBeFalsy", () => {
    expect(false).toBeFalsy()
  })
  it("should support toBeDefined", () => {
    expect(1).toBeDefined()
  })
  it("should support toBeUndefined", () => {
    expect(undefined).toBeUndefined()
  })
  it("should support toBeNull", () => {
    expect(null).toBeNull()
  })
  it("should support toBeNaN", () => {
    expect(Float.Constants.nan).toBeNaN()
  })
  it("should support toBeTypeOf", () => {
    expect("hello").toBeTypeOf("string")
  })
  it("should support toBeCloseTo", () => {
    expect(3.14159).toBeCloseTo(3.14, ~numDigits=2)
  })
  it("should support toBeGreaterThan", () => {
    expect(5.0).toBeGreaterThan(4.0)
  })
  it("should support toBeGreaterThanOrEqual", () => {
    expect(5.0).toBeGreaterThanOrEqual(5.0)
  })
  it("should support toBeLessThan", () => {
    expect(3.0).toBeLessThan(4.0)
  })
  it("should support toBeLessThanOrEqual", () => {
    expect(4.0).toBeLessThanOrEqual(4.0)
  })
  it("should support toMatch", () => {
    expect("hello world").toMatch(%re("/world/"))
  })
  it("should support toMatchInlineSnapshot", () => {
    expect({foo: "bar"}).toMatchInlineSnapshot(`{
  "foo": "bar",
}`)
  })
  it("should support toMatchSnapshot", () => {
    expect({name: "John", age: 30}).toMatchSnapshot()
  })
  it("should support toContain", () => {
    expect([1, 2, 3]).toContain(2)
  })
  it("should support toContainEqual", () => {
    expect([{a: 1}, {a: 2}]).toContainEqual({a: 2})
  })
  it("should support toHaveLength", () => {
    expect([1, 2, 3]).toHaveLength(3)
  })
  it("should support toHaveProperty", () => {
    expect({"foo": 42, "bar": 7}).toHaveProperty("foo", ~value=42)
  })
  it("should support toBeOneOf", () => {
    expect(2).toBeOneOf([1, 2, 3])
  })
  it("should support toThrow", () => {
    let f = () => {raise(Failure("fail"))}
    expect(f).toThrow()
  })
  it("should support toThrowError", () => {
    let f = () => {raise(Failure("fail"))}
    expect(f).toThrowError(~message="fail")
  })
  it("should support resolves", async () => {
    let promise = Js.Promise.resolve(42)
    // Await not required as return value of async
    expect(promise).resolves.toBe(42)
  })
  it("should force await on resolves", async () => {
    let promise = Js.Promise.resolve(42)
    // Await required here or ReScript will not compile
    await expect(promise).resolves.toBe(42)
    expect(1).toBe(1)
  })
  it("should support rejects", async () => {
    let promise = Js.Promise.reject(MyException("fail"))
    await expect(promise).rejects.toMatchObject(MyException("fail"))
  })
  it("should support toSatisfy", () => {
    expect(10).toSatisfy(x => x > 5)
  })
  it("should support toMatchObject", () => {
    expect({"a": 1, "b": 2}).toMatchObject({a: 1})
  })
  it("should support toMatchFileSnapshot", async () => {
    await expect("blah blah").toMatchFileSnapshot("blah-blah.txt")
  })
  it("should support toThrowErrorMatchingSnapshot", () => {
    let f = () => {raise(Failure("fail"))}
    expect(f).toThrowErrorMatchingSnapshot()
  })
  it("should support toThrowErrorMatchingInlineSnapshot", () => {
    let f = () => {raise(Failure("fail"))}
    expect(f).toThrowErrorMatchingInlineSnapshot(`{ 
      "Failure": "fail"
    }`)
  })
  it("should support .not modifier", () => {
    expected.assertions(1)
    expect(1).toBe(1)
  })
  it("compare float in object properties", () => {
    expect({
      title: "0.1 + 0.2",
      sum: 0.1 +. 0.20002,
    }).toEqual({
      title: "0.1 + 0.2",
      sum: expected.closeTo(0.3, ~precision=2),
    })
  })
  it("should support expected.anything in toEqual", () => {
    expect({a: 1, b: 2}).toEqual({
      a: expected.anything(),
      b: expected.anything(),
    })
  })
  it("should support expected.any in toEqual", () => {
    expect({name: "John", age: 30}).toEqual({
      name: expected.any(OfType.string),
      age: expected.any(OfType.number),
    })
  })
  it("should support expected.arrayContaining in toEqual", () => {
    expect({list: [1, 2, 3]}).toEqual({
      list: expected.arrayContaining([2]),
    })
  })
  it("should support expected.objectContaining in toEqual", () => {
    expect({a: 1, b: 2}).toEqual(expected.objectContaining({a: 1}))
  })
  it("should support expected.stringContaining in toEqual", () => {
    expect({name: "hello world", age: 30}).toEqual({
      name: expected.stringContaining("world"),
      age: expected.any(OfType.number),
    })
  })
  it("should support expected.stringMatching in toEqual", () => {
    expect({name: "abc123", age: 30}).toEqual({
      name: expected.stringMatching(%re("/\d+/")),
      age: expected.any(OfType.number),
    })
  })

  // Snapshot serializers
  it("should support addSnapshotSerializer", () => {
    let called = ref(false)
    let serializer = {
      test: _value => {
        called := true
        true
      },
      print: _value => "serialized",
    }
    expected.addSnapshotSerializer(serializer)
    expect(called.contents).toBe(false)
  })

  // Custom matchers
  it("should support extend for custom matchers", () => {
    let matcher = {
      toBeFoo: value => {
        if value === "foo" {
          {pass: true, message: () => "ok"}
        } else {
          {pass: false, message: () => "not foo"}
        }
      },
    }
    expected.extend(matcher)
    // We can't directly test the matcher here, but we can check that extend is callable
    expect(true).toBeTruthy()
  })

  // Equality testers
  it("should support addEqualityTesters", () => {
    let tester = (a, b) => a == b
    expected.addEqualityTesters([tester])
    // We can't directly test the effect, but we can check that the function is callable
    expect(true).toBeTruthy()
  })

  // object defined matchers not working for now..
})
