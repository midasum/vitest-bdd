import { loadedRunner as loadRunner } from "./steps";

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

export function parse(text: string): Feature[] {
  const features: Feature[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let currentFeature: Feature | null = null;
  let currentScenario: Scenario | null = null;

  for (const line of lines) {
    // Skip comments
    if (line.startsWith("#")) {
      continue;
    }

    // Feature declaration
    if (line.toLowerCase().startsWith("feature:")) {
      // Save previous feature if exists
      if (currentFeature) {
        // Add current scenario to feature if exists
        if (currentScenario) {
          currentFeature.scenarios.push(currentScenario);
          currentScenario = null;
        }
        features.push(currentFeature);
      }

      currentFeature = {
        title: line.substring(8).trim(), // Remove "Feature:" prefix
        scenarios: [],
      };
    }

    // Scenario declaration
    else if (line.toLowerCase().startsWith("scenario:")) {
      if (!currentFeature) {
        throw new Error("Scenario found without a Feature declaration");
      }

      // Save previous scenario if exists
      if (currentScenario) {
        currentFeature.scenarios.push(currentScenario);
      }

      currentScenario = {
        title: line.substring(9).trim(), // Remove "Scenario:" prefix
        steps: [],
      };
    }

    // Step declarations (Given, When, Then, And, But)
    else if (isStepKeyword(line)) {
      if (!currentScenario) {
        throw new Error("Step found without a Scenario declaration");
      }

      currentScenario.steps.push(parseStep(line));
    }

    // Handle continuation lines (indented lines that continue previous steps)
    else if (line.startsWith("  ") || line.startsWith("\t")) {
      if (currentScenario && currentScenario.steps.length > 0) {
        const idx = currentScenario.steps.length - 1;
        // Append to the last step
        const last = currentScenario.steps[idx];
        currentScenario.steps[idx] = parseStep(last.text + "\n" + line);
      }
    }
  }

  // Don't forget to add the last feature and scenario
  if (currentFeature) {
    if (currentScenario) {
      currentFeature.scenarios.push(currentScenario);
    }
    features.push(currentFeature);
  }

  return features;
}
const keywords = ["given", "when", "then", "and", "but", "*"];

function isStepKeyword(line: string): boolean {
  const lowerLine = line.toLowerCase();
  return keywords.some(
    (keyword) => lowerLine.startsWith(keyword + " ") || lowerLine === keyword
  );
}

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
