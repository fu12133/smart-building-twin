# building-visualization Specification

## Purpose
Provide a genuine WebGL smart-building scene that users can rotate, zoom, pan and reset, with linked building selection, scene layers and an interactive 2.5D floor map. Preserve clear demo-asset boundaries and recover gracefully from graphics failures.

## Requirements

### Requirement: Real rotatable geometry
The application MUST render building geometry in WebGL and allow pointer rotation, wheel zoom, right-button pan, keyboard rotation and camera reset.

#### Scenario: Pointer rotates the model
- **WHEN** a user drags within the central canvas
- **THEN** camera position changes, rendered pixels change, and building side faces remain visible

#### Scenario: Zoom and reset
- **WHEN** a user scrolls on the canvas and then activates reset
- **THEN** camera distance changes within limits and reset restores the default 3D pose

### Requirement: Controlled automatic rotation
The application MUST provide a visible automatic-rotation toggle that works only in 3D mode and preserves the user's preference across mode switches.

#### Scenario: Start and pause巡航
- **WHEN** the user starts automatic rotation and subsequently pauses it
- **THEN** camera orientation changes while active and stabilizes after controls damping settles

### Requirement: Building selection and scene layers
The application MUST select source tower/podium zones through visible labels or scene picking and independently toggle device markers and illustrative surrounding buildings.

#### Scenario: Selected building
- **WHEN** the user selects B区
- **THEN** the podium zone is highlighted and the zone/floor information updates

### Requirement: 2.5D floor visualization
The application MUST offer a 2.5D demonstration hospital floor map with extruded room boundaries, bounded floor selection and selectable equipment markers. Its layout MUST be visibly identified as synthetic.

#### Scenario: Floor device selection
- **WHEN** the user selects the podium zone, switches to 2.5D, chooses floor 3 and selects a device
- **THEN** the heading shows 3F and device details identify the current building, floor and demonstration room

#### Scenario: Return to 3D
- **WHEN** the user returns from 2.5D to 3D
- **THEN** the previous 3D camera pose is restored and free rotation remains available

### Requirement: WebGL recovery
The application MUST show an actionable error when WebGL creation fails or the rendering context is lost.

#### Scenario: Graphics unavailable
- **WHEN** WebGL context creation fails
- **THEN** the UI displays a readable rendering failure with a reload action instead of an empty canvas

### Requirement: Detailed architectural rendering
The hospital scene MUST render the supplied DWG hospital exterior with proposed finishes, reflective glazing, visible facade structure, rooftop equipment and landscaped ground. Optional surrounding city buildings and landscaping MUST be identified as illustrative. All assets MUST remain genuine rotatable geometry and MUST be identified as source white-model geometry with proposed finishes, without asserting a verified production BIM connection.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the DWG-derived tower/podium, generic Chinese entrance signs and landscaped ground are visible

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms with pointer and wheel
- **THEN** side and rear architectural geometry remains visible and camera reset and selection stay usable

### Requirement: Rendering resource lifecycle
Generated geometry, materials, textures and reflection render targets MUST be disposed when the scene is destroyed; rendering MUST retain responsive floor switching and graphics recovery.

An idle scene MUST avoid continuous GPU redraws while camera motion, automatic rotation, viewport and layer changes MUST refresh the rendered view.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors

#### Scenario: Idle rendering and renewed interaction
- **WHEN** the initial scene is stationary and the user subsequently zooms or hides surrounding buildings
- **THEN** the idle rendered-frame count stays stable, zoom advances rendered frames, and hiding surroundings changes the rendered background

### Requirement: Architectural night light hierarchy
The scene MUST present differentiated hospital facade materials, illuminated entrances, dimmer surroundings, dark roads and leafy landscape silhouettes. Rotation MUST reveal side and rear facades.

#### Scenario: Default and reverse architectural views
- **WHEN** the user opens the overview and rotates the scene
- **THEN** the hospital remains distinct from contextual surroundings, reflective glazing responds to view direction and landscaping retains three-dimensional depth

### Requirement: Locally packaged scene assets
Any third-party scene assets MUST be locally packaged with source/license documentation and respect the production repository base path. Late asset completion MUST not mutate a disposed scene.

#### Scenario: Production scene asset loading
- **WHEN** the public repository-path build loads
- **THEN** local lighting and vegetation assets load successfully without external runtime dependency, and controls remain functional

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

### Requirement: Reference floor cutaway geometry
The floor view MUST render a real rotatable gray rounded slab with white perimeter walls, columns and central service-core/stair geometry, cyan library-icon equipment markers, and explicit design-proposal labeling. It MUST NOT claim a verified hospital interior or assign clinical functions without supplied plans.

#### Scenario: Explore cutaway
- **WHEN** the user enters 2.5D and drags or zooms the floor canvas
- **THEN** the slab, white core and stair geometry change perspective, equipment pins follow their world positions, and returning to 3D restores the previous camera pose

#### Scenario: Filter and select equipment
- **WHEN** a user chooses a system category then selects a visible equipment pin
- **THEN** only matching points remain visible and selectable, the Chinese detail identifies the current zone/floor and demonstration status, and hiding the device layer hides matching pins too
