## ADDED Requirements
### Requirement: Floor-specific plan and equipment context
The dashboard MUST show the current zone/floor schematic plan summary and resolve equipment locations from that same plan. It MUST preserve floor bounds, synthetic labeling and retained-floor renovation scope.

#### Scenario: Select a different floor
- **WHEN** a user changes floor or switches from tower 18F to the podium
- **THEN** plan summary, room divisions and equipment locations update together, and the podium floor is bounded to 6F

#### Scenario: Locate equipment across contexts
- **WHEN** a user locates an alarm on a different floor while a category filter is active
- **THEN** the filter resets and the equipment detail uses the target floor's proposed location after its geometry has updated
