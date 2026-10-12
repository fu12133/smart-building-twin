## ADDED Requirements

### Requirement: Licensed hospital campus geometry
The hospital demonstration MUST render locally packaged licensed hospital geometry with real pointer rotation, visible source attribution and a clear distinction from the user's actual hospital BIM. Loading failure MUST produce readable status and recovery, and late asset completion MUST not attach resources to a disposed scene.

#### Scenario: Explore the imported hospital
- **WHEN** a user opens the hospital demonstration and drags or zooms the canvas
- **THEN** the imported hospital renders on multiple sides with usable framing and real camera motion, and its source and demonstration status are visible

#### Scenario: Recover or reload during model loading
- **WHEN** hospital geometry fails to load or completes after a scene has been reloaded
- **THEN** failure is actionable, the recreated scene retains one usable renderer, and disposed-scene resources are released

#### Scenario: Hidden source geometry is not selectable
- **WHEN** the user selects the medical-tech building and clicks the empty campus foreground
- **THEN** the selection remains on that building, and hidden original ground or institution text does not capture the click

## MODIFIED Requirements

### Requirement: Detailed architectural rendering
The hospital scene MUST render a licensed detailed hospital exterior, reflective glazing, visible facade structure, rooftop equipment and landscaped ground. Supporting buildings MAY use explicitly identified procedural geometry. All assets MUST remain genuine rotatable geometry and MUST be identified as a demonstration rather than the user's actual hospital BIM.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the imported hospital exterior, Chinese entrance signs, illustrative supporting buildings and landscaped ground are visible

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms with pointer and wheel
- **THEN** side and rear architectural geometry remains visible and camera reset and selection stay usable

### Requirement: 2.5D floor visualization
The application MUST offer a 2.5D demonstration hospital floor map with extruded room boundaries, bounded floor selection and selectable equipment markers. Its layout MUST be visibly identified as synthetic.

#### Scenario: Floor device selection
- **WHEN** the user selects the inpatient building, switches to 2.5D, chooses floor 3 and selects a device
- **THEN** the heading shows 3F and device details identify the current building, floor and demonstration room

#### Scenario: Return to 3D
- **WHEN** the user returns from 2.5D to 3D
- **THEN** the previous 3D camera pose is restored and free rotation remains available

### Requirement: Architectural night light hierarchy
The scene MUST present differentiated hospital facade materials, illuminated entrances, dimmer surroundings, dark roads and leafy landscape silhouettes. Rotation MUST reveal side and rear facades.

#### Scenario: Default and reverse architectural views
- **WHEN** the user opens the overview and rotates the scene
- **THEN** the hospital remains distinct from contextual surroundings, reflective glazing responds to view direction and landscaping retains three-dimensional depth
