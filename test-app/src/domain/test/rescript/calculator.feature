Feature: Calculator

  Background:
    Given I have a "basic" calculator
    Then the title is "basic"

  Scenario: Add two numbers
    When I add 1 to 2
    Then the result is 3

  Scenario: Add a list of numbers
    When I sum 1, 2, and 3
    Then the result is 6

  Scenario: Advanced calculator
    When I divide 1 by 2
    Then the result is 0.5

