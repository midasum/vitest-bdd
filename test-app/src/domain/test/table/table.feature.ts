import { expect } from "vitest";
import { Given } from "vitest-bdd";
import { makeTable } from "../../feature/table";

Given("I have a table", ({ When, Then }, data) => {
  const table = makeTable(data);
  When("I sort by {string}", table.sort);
  Then("the table is", (data: string[][]) => {
    expect([table.headers.map((h) => h.name), ...table.rows.value]).toEqual(
      data
    );
  });
});
