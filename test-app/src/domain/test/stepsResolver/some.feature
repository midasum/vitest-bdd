Feature: Test custom steps resolver

  Scenario: Test custom steps resolver
    Given I have a "custom" step
    When I run it
    Then it compiles using "custom-steps"