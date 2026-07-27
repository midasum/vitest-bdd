import { beforeAll, describe, expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";
import { build } from "./build";

const root = new URL("../", import.meta.url);
const output = new URL("../../dist/", import.meta.url);

beforeAll(build);

async function generated(file: string): Promise<string> {
  return readFile(new URL(file, output), "utf8");
}

describe("documentation build", () => {
  test("loads the shared shell from partial files", async () => {
    const [html, config] = await Promise.all([
      generated("index.html"),
      readFile(new URL("content/base-config.yaml", root), "utf8"),
    ]);

    for (const name of ["shell", "header", "nav", "footer"]) {
      expect(config).toContain(`${name}:\n    file: partial/${name}.html`);
      await access(new URL(`content/partial/${name}.html`, root));
    }
    expect(html).toContain('<nav class="nav" aria-label="Site">');
    expect(html).toContain('<footer class="foot">');
  });

  test("builds the home fragment once inside the document shell", async () => {
    const [html, fragment] = await Promise.all([
      generated("index.html"),
      readFile(new URL("content/epurejs/home/index.html", root), "utf8"),
    ]);

    expect(html).toContain("<title>@epure/vitest — Contracts That Run</title>");
    expect(html).toMatch(/<main>\s*<section class="hero"/);
    expect(html).toContain('<a href="./index.html" aria-current="page">Home</a>');
    expect(html).toContain('<h1 id="hero-title">Contracts That&nbsp;Run</h1>');
    expect(html).toContain('document.getElementById("hero-code")');
    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html.match(/<header class="top">/g)).toHaveLength(1);
    expect(html.match(/<footer class="foot">/g)).toHaveLength(1);
    expect(fragment).not.toMatch(
      /<!doctype|<html(?:\s|>)|<head(?:\s|>)|<body(?:\s|>)|<main(?:\s|>)|<header class="top"|<footer class="foot"|<script(?:\s|>)/,
    );
  });

  test("builds API entries in their structural groups and order", async () => {
    const html = await generated("api.html");
    const start = html.indexOf('<nav class="api-index"');
    const index = html.slice(start, html.indexOf("</nav>", start));

    expect(html).toContain('<a href="./api.html" aria-current="page">API</a>');
    expect(index).toMatch(
      /Gherkin[\s\S]*epureVitest\(options\)[\s\S]*Given\(pattern, build\)[\s\S]*toRecords\(table\)[\s\S]*YAML[\s\S]*Given\(name, handle\)/,
    );
    expect(index).toMatch(/Vitest[\s\S]*expect\(actual\)[\s\S]*expected[\s\S]*describe\(name, fn\)/);
    expect(html).toContain('<article class="entry" id="epure-vitest">');
    expect(html.match(/<article class="entry"/g)).toHaveLength(16);
    expect(html).toContain('<pre class="sig language-typescript">');
    expect(html).toContain('<pre class="sig language-rescript">');
    expect(html).toContain('<span class="gherkin">Gherkin</span>');
    expect(html).toContain('<span class="vitest">Vitest</span>');
    expect([...html.matchAll(/<article class="entry" id="([^"]+)">/g)].map((match) => match[1])).toEqual([
      "epure-vitest",
      "given",
      "to-records",
      "to-strings",
      "to-numbers",
      "steps-resolver",
      "options-type",
      "res-compiled-resolver",
      "step-type",
      "yaml-given",
      "expect",
      "expected",
      "describe",
      "test",
      "before-each",
      "assertions-type",
    ]);
    expect(html).toContain('data-view="feature"');
    expect(html).toContain('class="viewswitch"');
  });

  test("builds the guide with padded chapters and links", async () => {
    const html = await generated("guide.html");

    expect(html).toContain('<section class="chapter" id="an-opinion-until-it-runs">');
    expect(html).toContain('<li><a href="#an-opinion-until-it-runs">An opinion until it runs</a></li>');
    expect(html).toContain('<span class="no">01</span>');
    expect(html.match(/<section class="chapter"/g)).toHaveLength(8);
    expect(html).toContain('<a href="./guide.html" aria-current="page">Guide</a>');
    expect(html).toContain('<a href="./api.html#steps-resolver">steps-resolver</a>');
    expect(html).toContain('<div class="story">');
    expect(html).toContain('<div class="pro">');
    expect(html).toContain('<figure class="example" data-pair>');
  });

  test("copies shared assets and model documentation", async () => {
    await Promise.all(
      ["style.css", "fonts/ibm-plex-sans-400.woff2", "llms.txt"].map((file) => access(new URL(file, output))),
    );
  });
});

describe("stylesheet behavior", () => {
  test("underlines only prose links", async () => {
    const css = await readFile(new URL("assets/style.css", root), "utf8");

    expect(css.match(/text-decoration: underline/g)).toHaveLength(1);
    expect(css).toMatch(/\.entry \.prose > ol a \{[\s\S]*text-decoration: underline;/);
    expect(css).not.toMatch(/\.xref a,[\s\S]*text-decoration: underline;/);
  });
});
