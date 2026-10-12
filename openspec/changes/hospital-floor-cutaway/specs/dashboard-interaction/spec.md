## ADDED Requirements

### Requirement: Bounded floor rail and system cards
The floor view MUST provide a visible bounded floor rail synchronized with floor selection, six Chinese equipment-system summary/filter cards with explicitly synthetic counts, and a clear all-systems reset. Floor bounds and renovation scope MUST remain consistent with the source project.

#### Scenario: Rail selection and zone bounds
- **WHEN** the user selects A 18F on the rail then changes to B
- **THEN** floor selection clamps to B 6F, the rail offers no B 7F or floor zero, and B1/B2 remain selectable

#### Scenario: Alarm overrides incompatible filter
- **WHEN** a user filters for video equipment then locates an HVAC alarm
- **THEN** the filter resets to all systems and the target zone/floor/device details appear after mode and floor updates

#### Scenario: Narrow interior controls
- **WHEN** the user views the interior at 768 or 390 pixels wide
- **THEN** floor selection, category reset and device details remain operable without horizontal page overflow
