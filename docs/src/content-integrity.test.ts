import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { parse } from "yaml";

const content = new URL("../content/epurejs/", import.meta.url);
const slugPattern = /^[a-z0-9-]+$/;

type Value = string | { kind: "list"; items: string[] };
type Vars = Record<string, Value>;
type ApiGroup = "gherkin" | "yaml" | "vitest";

function scalar(vars: Vars, name: string): string {
  const value = vars[name];
  expect(typeof value, `${name} must be a scalar`).toBe("string");
  return value as string;
}

function list(vars: Vars, name: string): string[] {
  const value = vars[name];
  expect(value, `${name} must be a list`).toMatchObject({ kind: "list" });
  return (value as { kind: "list"; items: string[] }).items;
}

function frontmatter(text: string, file: string): Vars {
  if (!text.startsWith("---\n")) {
    throw new Error(`${file}: missing frontmatter`);
  }
  const end = text.indexOf("\n---", 4);
  if (end < 0) {
    throw new Error(`${file}: unclosed frontmatter`);
  }
  const value = parse(text.slice(4, end));
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${file}: frontmatter must be a mapping`);
  }
  return Object.fromEntries(
    Object.entries(value).map(([name, item]) => [
      name,
      Array.isArray(item) ? { kind: "list", items: item.map(String) } : String(item),
    ]),
  );
}

async function entries(dir: "guide" | `api/${ApiGroup}`) {
  const root = new URL(`${dir}/`, content);
  const files = (await readdir(root)).filter((file) => file.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (file) => ({
      group: dir.startsWith("api/") ? (dir.slice(4) as ApiGroup) : undefined,
      file,
      vars: frontmatter(await readFile(new URL(file, root), "utf8"), `${dir}/${file}`),
    })),
  );
}

async function apiEntries() {
  const root = new URL("api/", content);
  const contents = await readdir(root, { withFileTypes: true });
  const groups = contents
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const files = contents.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name);
  expect(groups).toEqual(["gherkin", "vitest", "yaml"]);
  expect(files, "Markdown files must belong to an API group").toEqual([]);
  return (await Promise.all(groups.map((group) => entries(`api/${group as ApiGroup}`)))).flat();
}

describe("API content", () => {
  test("uses the grouped schema in rendered order", async () => {
    const api = await apiEntries();
    expect(api.filter(({ group }) => group === "gherkin")).toHaveLength(9);
    expect(api.filter(({ group }) => group === "yaml")).toHaveLength(1);
    expect(api.filter(({ group }) => group === "vitest")).toHaveLength(6);
    const expected = [
      "name",
      "label",
      "slug",
      "kind",
      "since",
      "sort",
      "summary",
      "signature.ts",
      "signature.res",
      "tags",
    ].sort();

    for (const { file, vars } of api) {
      expect(Object.keys(vars).sort(), file).toEqual(expected);
      const slug = scalar(vars, "slug");
      const sort = Number(scalar(vars, "sort"));
      expect(slug, file).toMatch(slugPattern);
      expect(file).toBe(`${String(sort).padStart(3, "0")}-${slug}.md`);
      expect(["function", "type", "hook"]).toContain(scalar(vars, "kind"));
      expect(Number.isInteger(sort)).toBe(true);
      expect(scalar(vars, "name").length).toBeGreaterThan(0);
      expect(scalar(vars, "label").length).toBeGreaterThan(0);
      expect(scalar(vars, "since").length).toBeGreaterThan(0);
      expect(scalar(vars, "summary").length).toBeGreaterThan(0);
      expect(scalar(vars, "signature.ts").length).toBeGreaterThan(0);
      expect(scalar(vars, "signature.res").length).toBeGreaterThan(0);
      list(vars, "tags");
    }
  });
});

describe("guide content", () => {
  test("keeps chapters padded and cross-validates references", async () => {
    const [api, guide] = await Promise.all([apiEntries(), entries("guide")]);
    const apiSlugs = new Set(api.map(({ vars }) => scalar(vars, "slug")));
    const expected = ["title", "slug", "sort", "chapter", "refs"].sort();
    const slugs = new Set<string>();
    const sorts = new Set<number>();

    for (const { file, vars } of guide) {
      expect(Object.keys(vars).sort(), file).toEqual(expected);
      const slug = scalar(vars, "slug");
      const sort = Number(scalar(vars, "sort"));
      expect(file).toBe(`${String(sort).padStart(2, "0")}-${slug}.md`);
      expect(scalar(vars, "chapter")).toBe(String(sort).padStart(2, "0"));
      expect(slug, file).toMatch(slugPattern);
      expect(slugs.has(slug), `duplicate guide slug ${slug}`).toBe(false);
      expect(sorts.has(sort), `duplicate guide sort ${sort}`).toBe(false);
      slugs.add(slug);
      sorts.add(sort);
      for (const reference of list(vars, "refs")) {
        expect(apiSlugs.has(reference), `${file}: unknown API ref ${reference}`).toBe(true);
      }
    }
  });

  test("keeps API slugs and grouped names unique", async () => {
    const api = await apiEntries();
    const slugs = new Set<string>();
    const names = new Set<string>();

    for (const { group, file, vars } of api) {
      const slug = scalar(vars, "slug");
      const name = `${group}:${scalar(vars, "name")}`;
      expect(slugs.has(slug), `${file}: duplicate API slug ${slug}`).toBe(false);
      expect(names.has(name), `${file}: duplicate API name ${name}`).toBe(false);
      slugs.add(slug);
      names.add(name);
    }
  });
});
