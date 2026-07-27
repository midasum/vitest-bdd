import { given } from "@epure/vitest/yaml";
import { expect } from "vitest";

given("a calculator", ({ left, right, result }) => {
  expect(Number(left) + Number(right)).toBe(result);
});
