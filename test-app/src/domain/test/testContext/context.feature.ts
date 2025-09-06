import { expect, type TestContext } from "vitest";
import { Given } from "vitest-bdd";

Given("I have a test using vitest context", ({ Then }, { task }: TestContext) => {
  Then("test task name should be {string}", (name: string) => {
    expect(task.name).toBe(name);
  });
});
