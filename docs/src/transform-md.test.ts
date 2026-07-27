import { describe, expect, test } from "bun:test";
import { apiMd, guideMd, rescript, typescript } from "./transform-md";

describe("guide markdown", () => {
  test("renders callout containers and body paragraphs", () => {
    const html = guideMd(["Intro", "", ":::: story", "A story", "::::", "", ":::: pro", "A tip", "::::"].join("\n"));

    expect(html).toContain('<p class="body">Intro</p>');
    expect(html).toContain('<div class="story">');
    expect(html).toContain('<span class="k">Story</span>');
    expect(html).toContain('<div class="pro">');
    expect(html).toContain('<span class="k">Pro tip</span>');
  });

  test("pairs TypeScript and ReScript fences", () => {
    const html = guideMd(
      ["```typescript", 'const value: string = "ok"', "```", "```rescript", 'let value: string = "ok"', "```"].join(
        "\n",
      ),
    );

    expect(html).toContain('<figure class="example" data-pair>');
    expect(html).toContain('class="lang-toggle"');
    expect(html).toContain('class="language-typescript"');
    expect(html).toContain('class="language-rescript"');
    expect(html.match(/<figure/g)?.length).toBe(1);
  });
});

describe("API markdown", () => {
  test("groups a contract with paired implementation fences", () => {
    const html = apiMd(
      [
        "```gherkin",
        "Fonctionnalité: Addition",
        "  Étant donné 1",
        "  Alors 1",
        "```",
        "```typescript",
        "const value = 1",
        "```",
        "```rescript",
        "let value = 1",
        "```",
      ].join("\n"),
    );

    expect(html).toContain('data-view="feature"');
    expect(html).toContain("viewswitch");
    expect(html).toContain("token keyword");
    expect(html).toContain('class="language-typescript"');
    expect(html).toContain('class="language-rescript"');
  });

  test("groups a YAML fixture with its steps", () => {
    const html = apiMd(
      [
        "```yaml",
        "feature: Calculator",
        "examples:",
        "  - scenario: adds numbers",
        "```",
        "```typescript",
        'Given("a calculator", () => {})',
        "```",
      ].join("\n"),
    );

    expect(html).toContain('data-view="yaml"');
    expect(html).toContain('data-view="yaml" aria-pressed="true">yaml</button>');
    expect(html).toContain('data-view="steps" aria-pressed="false">steps</button>');
    expect(html).toContain("token key atrule");
    expect(html).toContain('<pre data-pane="yaml" class="language-yaml">');
    expect(html).toContain('<pre data-pane="steps" hidden class="language-typescript">');
    expect(html.match(/<figure/g)?.length).toBe(1);
  });

  test("rejects headings, unknown containers, and unsupported fences", () => {
    expect(() => apiMd("# Heading")).toThrow("API entry body must not contain headings");
    expect(() => apiMd(":::: warning\nNo\n::::")).toThrow('unknown callout container ":::warning"');
    expect(() => apiMd("```javascript\nconst value = 1\n```")).toThrow('unsupported language "javascript"');
  });
});

test("highlights signatures", () => {
  expect(typescript("function make(value: string): void")).toContain('<pre class="sig language-typescript">');
  expect(typescript("function make(value: string): void")).toContain("token function");
  expect(rescript("let make: string => unit")).toContain('<pre class="sig language-rescript">');
});
