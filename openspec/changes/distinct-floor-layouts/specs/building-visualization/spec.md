## ADDED Requirements
### Requirement: Distinct schematic floor layouts
The application MUST render a deterministic, visibly different arrangement for every selectable zone/floor, including basements. Tower and podium MUST use separate structural-core configurations that remain vertically aligned within each zone. Proposed room divisions and door openings MUST remain real geometry and explicitly schematic, without claiming verified clinical allocation.

#### Scenario: Inspect every floor
- **WHEN** a user visits tower 1–18/B1/B2 and podium 1–6/B1/B2 using floor controls
- **THEN** all 28 selected contexts show distinct room/circulation arrangements, and returning to a prior context restores its same layout

#### Scenario: Repeated floor switching
- **WHEN** a user rotates the floor view and repeatedly changes floors or zones
- **THEN** camera pose remains stable, replaced floor resources are disposed, only current equipment markers remain, and returning to 3D restores the saved exterior pose
