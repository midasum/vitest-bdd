import { signal } from "tilia";
import { expect } from "vitest";
import { Given } from "vitest-bdd";

Given("I have a {string} step", ({ When, Then }, str: string) => {
  const [title, setName] = signal(str);
  When("I run it", () => {
    setName(`${title.value}-steps`);
  });
  Then("it compiles using {string}", (str: string) => {
    console.log(title.value, JSON.stringify([str, title.value]));
    expect(title.value).toBe(str);
  });
});
