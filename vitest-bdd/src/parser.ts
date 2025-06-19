import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  GherkinInMarkdownTokenMatcher,
  Parser,
} from "@cucumber/gherkin";
import {
  type Background as GBackground,
  type Scenario as GScenario,
} from "@cucumber/messages";

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

export function parse(
  text: string,
  type: "markdown" | "classic" = "classic"
): Feature {
  let i = 0;
  const uuidFn = () => `id${++i}`;
  const builder = new AstBuilder(uuidFn);
  const matcher =
    type === "markdown"
      ? new GherkinInMarkdownTokenMatcher()
      : new GherkinClassicTokenMatcher();

  const parser = new Parser(builder, matcher);
  const doc = parser.parse(text);
  if (!doc.feature) {
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
        return parseScenario(child.scenario);
      }
      if (child.background) {
        background = parseScenario(child.background);
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

export function runScenario(scenario: Scenario) {
  const given = scenario.steps[0];
  if (!given) {
    throw new Error("Scenario has no Given step");
  }
  const runner = loadRunner(given);
  for (const step of scenario.steps.slice(1)) {
    const operation = runner.operation(step.query);
    operation(...step.params);
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
    text2.replace(/\b\d+(?:\.\d+)?\b/g, (match) => {
      numbers.push(parseFloat(match));
      return "{number}";
    })
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
  return removeKeyword(text.toLocaleLowerCase())
    .trim()
    .replace(/ an /g, " a ")
    .replace(/ the /, " ");
}

function removeKeyword(text: string): string {
  for (const keyword of keywords) {
    if (text.startsWith(keyword + " ")) {
      return text.substring(keyword.length + 1);
    }
  }
  return text;
}

function parseScenario(gsc: GScenario | GBackground): Scenario {
  const s: Scenario = {
    title: gsc.name,
    location: gsc.location,
    steps: [],
  };
  if (gsc.steps) {
    for (const gstep of gsc.steps) {
      const step = parseStep(gstep.keyword, gstep.text);
      if (gstep.dataTable) {
        step.params.push(
          gstep.dataTable.rows.map((row) => row.cells.map((c) => c.value))
        );
      }
      s.steps.push({
        ...step,
        location: { ...gstep.location },
      });
    }
  }
  return s;
}
