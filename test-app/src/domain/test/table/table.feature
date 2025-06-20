Feature: Table

  Background:
    Given I have a table
      | firstName | lastName | isActive |
      | Charlie   | Smith    | true     |
      | Bob       | Johnson  | false    |
      | Alice     | Williams | true     |

  Scenario: Sort by name
    When I sort by "lastName"
    Then the table is
      | firstName | lastName | isActive |
      | Bob       | Johnson  | false    |
      | Charlie   | Smith    | true     |
      | Alice     | Williams | true     |

  Scenario: Sort by firstName
    When I sort by "firstName"
    Then the table is
      | firstName | lastName | isActive |
      | Alice     | Williams | true     |
      | Bob       | Johnson  | false    |
      | Charlie   | Smith    | true     |

  Scenario: Sort by isActive
    When I sort by "isActive"
    Then the table is
      | firstName | lastName | isActive |
      | Bob       | Johnson  | false    |
      | Charlie   | Smith    | true     |
      | Alice     | Williams | true     |