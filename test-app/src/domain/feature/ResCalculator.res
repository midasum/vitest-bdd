open Tilia
type t = {
  add: (float, float) => unit,
  subtract: (float, float) => unit,
  multiply: (float, float) => unit,
  divide: (float, float) => unit,
  result: float,
  title: string,
}

let make = (name: string) => {
  let (result, setResult) = signal(0.)

  tilia({
    add: (a, b) => setResult(a +. b),
    subtract: (a, b) => setResult(a -. b),
    multiply: (a, b) => setResult(a *. b),
    divide: (a, b) => setResult(a /. b),
    result: computed(() => result.value),
    title: name,
  })
}
