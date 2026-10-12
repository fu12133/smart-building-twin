## ADDED Requirements

### Requirement: Project white-model geometry
The application MUST use the supplied DWG tower and podium geometry with traceable source handles and uniform height calibration, preserve real pointer rotation and display the distinction between source shape and proposed hospital finishes. It MUST NOT render invented supporting hospital buildings or invent an institution name.

#### Scenario: Inspect source building
- **WHEN** a visitor opens and rotates the model
- **THEN** the source enclosed podium, tall tower and curtain-wall members remain visible on multiple sides, with source/proposed-finish labeling

### Requirement: Project floor scope
The application MUST provide tower floors 1–18, podium floors 1–6 and schematic B1/B2 navigation without floor zero. Tower floors 13/14 MUST identify retained original functions; basements MUST identify partial renovation and unverified underground geometry.

#### Scenario: Floor bounds and retained functions
- **WHEN** a user selects tower 18F, switches to the podium, then selects tower 13F/14F or basement B2
- **THEN** podium selection clamps to 6F, retained floors show their source scope and B2 remains selectable with schematic/partial-renovation labeling


## MODIFIED Requirements

### Requirement: 2.5D floor visualization
The application MUST offer a 2.5D demonstration hospital floor map with extruded room boundaries, bounded floor selection and selectable equipment markers. Its layout MUST be visibly identified as synthetic.

#### Scenario: Floor device selection
- **WHEN** the user selects the podium zone, switches to 2.5D, chooses floor 3 and selects a device
- **THEN** the heading shows 3F and device details identify the current building, floor and demonstration room

#### Scenario: Return to 3D
- **WHEN** the user returns from 2.5D to 3D
- **THEN** the previous 3D camera pose is restored and free rotation remains available

### Requirement: Detailed architectural rendering
The hospital scene MUST render the supplied DWG hospital exterior with proposed finishes, reflective glazing, visible facade structure, rooftop equipment and landscaped ground. Optional surrounding city buildings and landscaping MUST be identified as illustrative. All assets MUST remain genuine rotatable geometry and MUST be identified as source white-model geometry with proposed finishes, without asserting a verified production BIM connection.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the DWG-derived tower/podium, generic Chinese entrance signs and landscaped ground are visible

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms with pointer and wheel
- **THEN** side and rear architectural geometry remains visible and camera reset and selection stay usable

### Requirement: Licensed hospital campus geometry
The hospital demonstration MUST render locally packaged user-provided project geometry with real pointer rotation, visible source provenance and a clear distinction between source geometry, proposed medical finishes and unverified BIM/floor semantics. Loading failure MUST produce readable status and recovery, and late asset completion MUST not attach resources to a disposed scene.

#### Scenario: Explore the imported hospital
- **WHEN** a user opens the hospital demonstration and drags or zooms the canvas
- **THEN** the imported hospital renders on multiple sides with usable framing and real camera motion, and its white-model source and proposed-finish status are visible

#### Scenario: Recover or reload during model loading
- **WHEN** hospital geometry fails to load or completes after a scene has been reloaded
- **THEN** failure is actionable, the recreated scene retains one usable renderer, and disposed-scene resources are released

#### Scenario: Hidden source geometry is not selectable
- **WHEN** the user selects the podium zone and clicks the empty campus foreground
- **THEN** the selection remains on that building, and excluded city geometry or hidden objects does not capture the click

### Requirement: Building selection and scene layers
The application MUST select source tower/podium zones through visible labels or scene picking and independently toggle device markers and illustrative surrounding buildings.

#### Scenario: Selected building
- **WHEN** the user selects B区
- **THEN** the podium zone is highlighted and the zone/floor information updates
