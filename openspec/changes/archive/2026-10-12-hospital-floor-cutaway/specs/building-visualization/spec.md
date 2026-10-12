## ADDED Requirements

### Requirement: Reference floor cutaway geometry
The floor view MUST render a real rotatable gray rounded slab with white perimeter walls, columns and central service-core/stair geometry, cyan library-icon equipment markers, and explicit design-proposal labeling. It MUST NOT claim a verified hospital interior or assign clinical functions without supplied plans.

#### Scenario: Explore cutaway
- **WHEN** the user enters 2.5D and drags or zooms the floor canvas
- **THEN** the slab, white core and stair geometry change perspective, equipment pins follow their world positions, and returning to 3D restores the previous camera pose

#### Scenario: Filter and select equipment
- **WHEN** a user chooses a system category then selects a visible equipment pin
- **THEN** only matching points remain visible and selectable, the Chinese detail identifies the current zone/floor and demonstration status, and hiding the device layer hides matching pins too
