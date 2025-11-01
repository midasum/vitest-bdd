Feature: Calculator

  Scenario: Multiple arguments in given
    # We cannot have a given with multiple arguments in ReScript due to typing limitations.
    Given a calculator
    And I have 1 and 2 and 3
    When I add them all
    Then the result is 6
