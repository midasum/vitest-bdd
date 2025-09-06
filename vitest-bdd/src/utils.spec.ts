import { describe, expect, it } from "vitest";
import { toNumbers, toRecords, toStrings } from "./utils";

describe("toRecords", () => {
  it("should parse a table", () => {
    const table = [
      ["name", "age"],
      ["John", "20"],
      ["Jane", "21"],
    ];
    const result = toRecords(table);
    expect(result).toEqual([
      { name: "John", age: "20" },
      { name: "Jane", age: "21" },
    ]);
  });
});

describe("toStrings", () => {
  it("should parse a table", () => {
    const table = [
      ["name", "other"],
      ["John", "ignored"],
      ["Jane", "ignored"],
    ];
    const result = toStrings(table);
    expect(result).toEqual(["John", "Jane"]);
  });
});

describe("toNumbers", () => {
  it("should parse a table", () => {
    const table = [
      ["age", "other"],
      ["20", "ignored"],
      ["21", "ignored"],
    ];
    const result = toNumbers(table);
    expect(result).toEqual([20, 21]);
  });
});
