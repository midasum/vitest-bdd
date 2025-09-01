open VitestBdd
open Tilia

type user = {
  name: string,
  age: string,
}

given("I have a table", ({step}, data) => {
  let (records, setRecords) = signal([])
  let (record, setRecord) = signal({name: "", age: ""})

  step("I convert the table to records", () => {
    setRecords(toRecords(data))
  })

  step("I select record {number}", index => {
    setRecord(records.value[index]->Option.getExn)
  })

  step("selected name should be {string}", value => {
    expect(record.value.name).toBe(value)
  })

  step("selected age should be {number}", value => {
    expect(record.value.age->Int.fromString).toBe(value)
  })
})
