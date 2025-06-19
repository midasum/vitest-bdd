import { expect } from "vitest";
import { Given, Then, When } from "vitest-bdd";
import { makeTable } from "../feature/table";

Given("I have a table", (data) => {
  const table = makeTable(data);
  When("I sort by {string}", table.sort);
  Then("the table is", (data) => {
    expect([table.headers.map((h) => h.name), ...table.rows.value]).toEqual(
      data
    );
  });
});
