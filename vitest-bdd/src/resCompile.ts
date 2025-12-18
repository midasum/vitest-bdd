import {existsSync, readFileSync} from "node:fs";
import {SourceMapGenerator} from "source-map";
import type {VitestBddOptions} from ".";

const TEST_RE = /(describe|it|test|only|skip|todo)\(("([^"]*)")/;
type Stone = {
  key: string;
  line: number;
};

// Parse rescript tests
// TODO: Also use this SourceMap maker to parse ReScript Gherkins steps
export function resCompile(path: string, opts: Required<VitestBddOptions>) {
  const {resCompiledResolver} = opts;
  const text = readFileSync(path, "utf8");
  const resLines = text.split("\n");
  const rmap: Stone[] = [];
  for (let i = 0; i < resLines.length; i++) {
    const line = resLines[i];
    let re = TEST_RE.exec(line);
    if (re) {
      rmap.push({key: re[2], line: i + 1});
    }
  }
  if (rmap.length === 0) {
    return {
      code: `
      import { describe} from "vitest";
      describe.skip("No tests found in ReScript file", () => {});
    `,
    };
  }

  const compiledPath = resCompiledResolver(path);

  if (!compiledPath) {
    const map = new SourceMapGenerator({file: path});
    function sm(rline: number, cline: number) {
      map.addMapping({
        source: path,
        original: {line: rline, column: 0},
        generated: {line: cline, column: 0},
      });
    }
    const out: string[] = [];
    const push = (text: string) => {
      out.push(text);
      sm(1, out.length);
    };
    const shortpath = path.split("/").slice(-4, -1).join("/") + ".[ts|tsx|js|jsx|mjs|cjs|res.mjs|res.jsx|res.tsx]";
    push(`import { describe, it, assert } from "vitest";`);
    push(`describe.concurrent(${JSON.stringify(path.split("/").slice(-1)[0])}, () => {`);
    push(`  it(${JSON.stringify("Should have a compiled file")}, () => {`);
    push(`    assert.fail(${JSON.stringify(`Compiled js file for ${JSON.stringify(shortpath)} not found.`)});`);
    push(`  });`);
    push(`});`);
    return {code: out.join("\n"), map: map.toJSON()};
  } else {
    const smap: number[][] = [];
    const compiled = readFileSync(compiledPath, "utf8");
    const lines = compiled.split("\n");
    let cursor = 0;
    let rline = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let ce = TEST_RE.exec(line);
      if (ce) {
        const key = ce[2];
        let found = false;
        for (let j = cursor; j < rmap.length; j++) {
          if (rmap[j].key === key) {
            rline = rmap[j].line;
            smap.push([rline, i + 1]);
            found = true;
            cursor = j + 1;
            break;
          }
        }
        if (!found) {
          console.log(`No source mapping for ${ce[1]}`);
        }
      }
    }
    const map = new SourceMapGenerator({file: path});
    function sm(rline: number, cline: number) {
      map.addMapping({
        source: path,
        original: {line: rline, column: 0},
        generated: {line: cline, column: 0},
      });
    }
    let ri = 1;
    let ci = 1;

    for (const [rline, cline] of smap) {
      let dr = rline - ri;
      let dc = cline - ci;
      if (dr > dc) {
        for (let i = 1; i <= dr; i++) {
          sm(ri + i, Math.ceil(ci + (i * dc) / dr));
        }
      } else {
        for (let i = 1; i <= dc; i++) {
          sm(Math.ceil(ri + (i * dr) / dc), ci + i);
        }
      }
      ri = rline;
      ci = cline;
    }

    return {code: compiled, map: map.toJSON()};
  }
}

function baseResolver(path: string): string | null {
  for (const ext of [".js", ".mjs", ".cjs"]) {
    const p = `${path}${ext}`;
    if (existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function resCompiledResolver(path: string): string | null {
  for (const r of [".res", ""]) {
    const p = baseResolver(path.replace(/\.res$/, r));
    if (p) {
      return p;
    }
  }
  return null;
}
