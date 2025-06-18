
Feature: Calculator

  Background:
    Given I have a "basic" calculator
    Then the title is "basic"

  Scenario: Add two numbers
    When I add 1 and 2
    Then the result is 3

  Scenario: Advanced calculator
    When I divide 1 by 2
    Then the result is 0.5

