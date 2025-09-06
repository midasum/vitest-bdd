import { AstBuilder, GherkinClassicTokenMatcher, Parser } from "@cucumber/gherkin";
import { type Background as GBackground, type Scenario as GScenario } from "@cucumber/messages";
import type { TestContext } from "vitest";

import { load as loadRunner } from "./steps";

export type TestFile = {
  uri: string;
  text: string;
  language: string;
};

export type Context = {
  execute: (step: Step) => void;
};

export type DataTable = string[][];

export type Step = {
  text: string;
  query: string;
  params: (number | string | DataTable)[];
};

export type SourceLocation = {
  line: number;
  column?: number;
};

export type LocatedStep = Step & {
  location: SourceLocation;
};

// Operation or Assertion
export type Scenario = {
  title: string;
  location: SourceLocation;
  steps: LocatedStep[];
};

export type Feature = {
  title: string;
  location: SourceLocation;
  scenarios: Scenario[];
};

export function mdToGherkin(atext: string, linemapper: Record<number, number>) {
  const lines = atext.split("\n");
  const gherkin: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```gherkin")) {
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        gherkin.push(lines[i]);
        linemapper[gherkin.length] = i + 1;
        i++;
      }
    }
    i++;
  }
  return gherkin.join("\n");
}

export function parse(atext: string, markdown: boolean = false): Feature | null {
  let i = 0;
  let text = atext;
  const uuidFn = () => `id${++i}`;
  const builder = new AstBuilder(uuidFn);
  const linemapper: Record<number, number> = {};
  if (markdown) {
    // Pre-parse (and store source mapping)
    text = mdToGherkin(atext, linemapper);
  }
  const matcher = new GherkinClassicTokenMatcher();

  const parser = new Parser(builder, matcher);
  const doc = parser.parse(text);
  if (!doc.feature) {
    if (markdown) {
      // ignore
      return null;
    }
    throw new Error("No feature found");
  }
  const feature: Feature = {
    title: doc.feature.name,
    location: { line: 1, column: 0 },
    scenarios: [],
  };

  let background: Scenario = {
    title: "",
    location: { line: 1, column: 0 },
    steps: [],
  };

  feature.scenarios = doc.feature.children
    .map((child) => {
      if (child.scenario) {
        return parseScenario(child.scenario, linemapper);
      }
      if (child.background) {
        background = parseScenario(child.background, linemapper);
      }
      return null;
    })
    .filter(Boolean) as Scenario[];

  for (const scenario of feature.scenarios) {
    scenario.steps.unshift(...background.steps);
  }

  return feature;
}

const keywords = ["given", "when", "then", "and", "but", "*"];

export async function runScenario(scenario: Scenario, testContext: TestContext) {
  const given = scenario.steps[0];
  if (!given) {
    throw new Error("Scenario has no Given step");
  }
  const runner = await loadRunner(given, testContext);
  for (const step of scenario.steps.slice(1)) {
    const operation = runner.operation(step.query);
    await operation(...step.params);
  }
}

export function parseStep(keyword: string, text: string): Step {
  // Extract quoted strings from the step text
  const strings: string[] = [];
  const text2 = text.replace(/"([^"]*)"/g, (match) => {
    strings.push(match.slice(1, -1));
    return "{string}";
  });

  const numbers: number[] = [];
  const query = normalize(
    text2.replace(/-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g, (match) => {
      numbers.push(parseFloat(match));
      return "{number}";
    }),
  );

  const params: (number | string)[] = [];
  for (const match of query.matchAll(/\{(string|number)\}/g)) {
    switch (match[1]) {
      case "number": {
        const n = numbers.shift();
        if (typeof n !== "number") {
          throw new Error(`Expected number, got ${JSON.stringify(n)}`);
        }
        params.push(n);
        break;
      }
      case "string":
        const s = strings.shift();
        if (typeof s !== "string") {
          throw new Error(`Expected string, got ${JSON.stringify(s)}`);
        }
        params.push(s);
        break;
      default:
        throw new Error(`Unknown parameter "${match[1]}"`);
    }
  }

  return {
    text: keyword + text,
    query,
    params,
  };
}

export function normalize(text: string): string {
  return removeKeyword(text.toLocaleLowerCase()).trim().replace(/ an /g, " a ").replace(/ the /, " ");
}

function removeKeyword(text: string): string {
  for (const keyword of keywords) {
    if (text.startsWith(keyword + " ")) {
      return text.substring(keyword.length + 1);
    }
  }
  return text;
}

function parseScenario(gsc: GScenario | GBackground, linemapper: Record<number, number>): Scenario {
  function loc(location: GScenario["location"]): GScenario["location"] {
    const line = linemapper[location.line] ?? location.line;
    return {
      ...location,
      line,
    };
  }
  const s: Scenario = {
    title: gsc.name,
    location: loc(gsc.location),
    steps: [],
  };
  if (gsc.steps) {
    for (const gstep of gsc.steps) {
      const step = parseStep(gstep.keyword, gstep.text);
      if (gstep.dataTable) {
        step.params.push(gstep.dataTable.rows.map((row) => row.cells.map((c) => c.value)));
      }
      s.steps.push({
        ...step,
        location: loc(gstep.location),
      });
    }
  }
  return s;
}
