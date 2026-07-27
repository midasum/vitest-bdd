import { Given } from "@epure/vitest";
import { expect } from "vitest";

Given("a calculator", (_steps, { left, right, result }, context) => {
  expect(Number(left) + Number(right)).toBe(result);
  expect(context.task.name).toBeTypeOf("string");
});
