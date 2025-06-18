import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  GherkinInMarkdownTokenMatcher,
  Parser,
} from "@cucumber/gherkin";
import { IdGenerator } from "@cucumber/messages";

import { loadedRunner as loadRunner } from "./steps";

export type TestFile = {
  uri: string;
  text: string;
  language: string;
};

export type Context = {
  execute: (step: Step) => void;
};

export type Step = {
  text: string;
  query: string;
  params: (number | string)[];
};

// Operation or Assertion
export type Scenario = {
  title: string;
  steps: Step[];
};
export type Feature = {
  title: string;
  scenarios: Scenario[];
};

export function parse(uri: string, text: string): Feature {
  const uuidFn = IdGenerator.uuid();
  const builder = new AstBuilder(uuidFn);
  const matcher = uri.endsWith(".md")
    ? new GherkinInMarkdownTokenMatcher()
    : new GherkinClassicTokenMatcher();

  const parser = new Parser(builder, matcher);
  const doc = parser.parse(text);
  if (!doc.feature) {
    throw new Error("No feature found");
  }
  const feature: Feature = {
    title: doc.feature.name,
    scenarios: [],
  };
  let background: Scenario = {
    title: "",
    steps: [],
  };

  feature.scenarios = doc.feature.children
    .map((child) => {
      if (child.scenario) {
        const scenario: Scenario = {
          title: child.scenario.name,
          steps: [],
        };
        if (child.scenario.steps) {
          for (const step of child.scenario.steps) {
            scenario.steps.push(parseStep(step.text));
          }
        }
        return scenario;
      }
      if (child.background) {
        background = {
          title: child.background.name,
          steps: [],
        };
        if (child.background.steps) {
          for (const step of child.background.steps) {
            background.steps.push(parseStep(step.text));
          }
        }
      }
      return null;
    })
    .filter(Boolean) as Scenario[];

  for (const scenario of feature.scenarios) {
    scenario.steps.unshift(...background.steps);
  }

  return feature;
  // return parse1(uri, text);
}

const keywords = ["given", "when", "then", "and", "but", "*"];

export function runScenario(scenario: Scenario) {
  const given = scenario.steps[0];
  if (!given) {
    throw new Error("Scenario has no Given step");
  }
  const runner = loadRunner(given);
  for (const step of scenario.steps.slice(1)) {
    runner.execute(step);
  }
}

export function parseStep(text: string): Step {
  // Extract quoted strings from the step text
  const strings: string[] = [];
  const text2 = normalize(text).replace(/"([^"]*)"/g, (match) => {
    strings.push(match.slice(1, -1));
    return "{string}";
  });

  const numbers: number[] = [];
  const query = text2.replace(/\b\d+(?:\.\d+)?\b/g, (match) => {
    numbers.push(parseFloat(match));
    return "{number}";
  });

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
    text,
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
