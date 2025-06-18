Feature: Calculator

  Scenario: Add two numbers
    Given I have a "basic" calculator
    When I add 1 and 2
    Then the result is 3
    And the title is "basic"

  Scenario: Advanced calculator
    Given I have an "advanced" calculator
    When I divide 1 by 2
    Then the result is 0.5
    And the title is "advanced"