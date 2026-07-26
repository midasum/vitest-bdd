import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import Prism from "prismjs";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-rescript.js";
import "prismjs/components/prism-gherkin.js";

const languages = ["typescript", "rescript", "res", "gherkin"];
const toggle =
  '<button class="lang-toggle" type="button" aria-label="Switch example language"><span class="lt lt-ts">TS</span><span class="lt lt-res">RES</span></button>';
const switcher =
  '<div class="viewswitch" role="group" aria-label="Contract pane"><button type="button" data-view="feature" aria-pressed="true">feature</button><button type="button" data-view="steps" aria-pressed="false">steps</button></div>';

type Page = "api" | "guide";

function language(name: string): string {
  return name === "res" ? "rescript" : name;
}

function highlight(code: string, name: string, signature = false): string {
  const prismName = language(name);
  const grammar = Prism.languages[prismName];
  if (!grammar) {
    throw new Error(`Unsupported Prism language "${prismName}"`);
  }
  const html = Prism.highlight(code, grammar, prismName);
  const classes = signature ? `sig language-${name}` : `language-${name}`;
  return `<pre class="${classes}"><code>${html}</code></pre>`;
}

function callouts(body: string): void {
  const matches = body.matchAll(/^:{3,}[ \t]*(\S*)$/gm);
  for (const match of matches) {
    const name = match[1];
    if (name && name !== "story" && name !== "pro" && name !== "def") {
      throw new Error(`unknown callout container ":::${name}" (expected "story", "pro" or "def")`);
    }
  }
}

function pairs(tokens: MarkdownIt.Token[]): void {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token?.type !== "fence") continue;
    const name = language(token.info.trim());
    const next = tokens[index + 1];
    if (name === "typescript" && next?.type === "fence" && language(next.info.trim()) === "rescript") {
      token.meta = { pair: "start" };
      next.meta = { pair: "end" };
      index++;
    }
  }
}

function contracts(tokens: MarkdownIt.Token[]): void {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token?.type !== "fence" || language(token.info.trim()) !== "gherkin") continue;
    const next = tokens[index + 1];
    if (next?.type !== "fence" || language(next.info.trim()) !== "typescript") continue;
    const paired = next.meta?.pair === "start";
    token.meta = { ...token.meta, contract: "start", contractPair: paired };
    if (paired) {
      next.meta = { ...next.meta, contract: "mid" };
      const last = tokens[index + 2];
      if (last) last.meta = { ...last.meta, contract: "end" };
      index += 2;
    } else {
      next.meta = { ...next.meta, contract: "end" };
      index++;
    }
  }
}

function headings(tokens: MarkdownIt.Token[]): void {
  if (tokens.some((token) => token.type === "heading_open")) {
    throw new Error("API entry body must not contain headings");
  }
}

function markdown(page: Page): MarkdownIt {
  const md = new MarkdownIt({ html: false });
  md.use(container, "story", {
    render: (tokens, index) =>
      tokens[index]?.nesting === 1 ? '<div class="story">\n<span class="k">Story</span>\n' : "</div>\n",
  });
  md.use(container, "pro", {
    render: (tokens, index) =>
      tokens[index]?.nesting === 1 ? '<div class="pro">\n<span class="k">Pro tip</span>\n' : "</div>\n",
  });
  md.use(container, "def", {
    render: (tokens, index) => (tokens[index]?.nesting === 1 ? '<div class="defcard">\n' : "</div>\n"),
  });

  md.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    if (!token) return "";
    const name = language(token.info.trim());
    if (!languages.includes(name)) {
      throw new Error(
        `code fence uses unsupported language "${name}" (only "typescript", "rescript", "res", or "gherkin" allowed)`,
      );
    }
    const code = highlight(token.content.replace(/\n$/, ""), name);
    const pair = token.meta?.pair;
    const label = name === "gherkin" ? "Contract" : "Example";
    if (page === "guide") {
      const open =
        pair === "start"
          ? `<figure class="example" data-pair><figcaption class="exbar"><span class="k">Example</span>${toggle}</figcaption>`
          : pair
            ? ""
            : `<figure class="example"><figcaption class="exbar"><span class="k">${label}</span></figcaption>`;
      return `${open}${code}${pair === "start" ? "" : "</figure>"}`;
    }

    const contract = token.meta?.contract;
    if (contract === "start") {
      return `<figure class="ex"${token.meta.contractPair ? " data-pair" : ""} data-view="feature"><figcaption class="exbar"><span class="k">Contract</span>${switcher}</figcaption>${code}`;
    }
    if (contract === "mid") return code;
    if (contract === "end") return `${code}</figure>`;
    if (pair === "start") {
      return `<figure class="ex" data-pair><figcaption class="exbar"><span class="k">Example</span></figcaption>${code}`;
    }
    if (pair === "end") return `${code}</figure>`;
    const plain = code.replace(/^<pre class="language-[^"]+">/, '<pre class="code">');
    return `<figure class="ex"><figcaption class="k">${label}</figcaption>${plain}</figure>`;
  };

  const paragraph = md.renderer.rules.paragraph_open;
  md.renderer.rules.paragraph_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    if (page === "guide" && token?.level === 0) {
      const current = token.attrGet("class");
      token.attrSet("class", current ? `${current} body` : "body");
    }
    return paragraph ? paragraph(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
  };
  return md;
}

const api = markdown("api");
const guide = markdown("guide");

function render(md: MarkdownIt, text: string, page: Page): string {
  callouts(text);
  const tokens = md.parse(text, {});
  if (page === "api") headings(tokens);
  pairs(tokens);
  if (page === "api") contracts(tokens);
  return md.renderer.render(tokens, md.options, {});
}

export function apiMd(text: string): string {
  return render(api, text, "api");
}

export function guideMd(text: string): string {
  return render(guide, text, "guide");
}

export function typescript(text: string): string {
  return highlight(text, "typescript", true);
}

export function rescript(text: string): string {
  return highlight(text, "rescript", true);
}
