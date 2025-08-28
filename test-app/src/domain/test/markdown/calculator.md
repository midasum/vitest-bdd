# This is a normal markdown file

This is a markdown specification document example. The document serves both documentation, specification and testing purposes. **vitest-bdd** parses the `gherkin` code fences and compiles them into a test suite.

## Calculator setup

We should make it possible to setup different types of calculators.

Some types needed:

```ts
type CalculatorType = "basic" | "advanced";
```

### Basic calculator

```gherkin
Feature: Calculator in md

  Background:
    Given I have a "basic" calculator
    Then the title is "basic"
```

Task:

- [ ] Implement types

## Basic operations

```gherkin
Scenario: Add two numbers
  When I add 1 and 2
  Then the result is 3

Scenario: Advanced calculator
  When I divide 1 by 2
  Then the result is 0.5
```

- [x] Implement basic operations and test steps.

And this is some more markdown.
