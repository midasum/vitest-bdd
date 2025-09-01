Feature: Table Utils

  Scenario: To Records
    Given I have a table
      | name | age |
      | John | 20  |
      | Jane | 21  |
    When I convert the table to records
    And I select record 1
    Then selected name should be "Jane"
    And selected age should be 21