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
  let result = signal(0.)
  let title = signal(name)

  tilia({
    add: (a, b) => {
      result.value = a +. b
    },
    subtract: (a, b) => {
      result.value = a -. b
    },
    multiply: (a, b) => {
      result.value = a *. b
    },
    divide: (a, b) => {
      result.value = a /. b
    },
    result: computed(() => result.value),
    title: computed(() => title.value),
  })
}
