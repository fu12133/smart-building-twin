## ADDED Requirements
### Requirement: Original white-model surroundings and site
The application MUST render the supplied white model's surrounding city, nearby buildings and site meshes with traceable source handles, original relative coordinates and the same uniform scale/anchor as the hospital. Procedural city and ground footprints MUST NOT replace that source topology. Proposed finishes and added details MUST remain clearly distinguished from source geometry.

#### Scenario: Inspect restored source surroundings
- **WHEN** a visitor opens the hospital model and its full-white-model view
- **THEN** source city and nearby buildings plus original local/broad site meshes are visible, and camera reset returns to the hospital view

#### Scenario: Source surroundings layer and picking
- **WHEN** a visitor hides/shows surrounding buildings or clicks visible context geometry
- **THEN** only the context buildings change visibility, source site remains visible, and clicking context does not select a hospital zone behind it

#### Scenario: Context loading lifecycle and recovery
- **WHEN** a context asset fails or finishes after its scene has been reloaded
- **THEN** failure has a Chinese reload action, late resources are disposed without attaching to the old scene, and the current scene has one working renderer

### Requirement: Hospital source shape fidelity
The hospital exterior MUST preserve the provided source tower/podium shape and MUST NOT add unsupported facade members, entrance structures or landscaping. Source shape fidelity MUST be distinguished from surveyed physical dimensions, actual material finishes and unverified interiors.

#### Scenario: Compare the hospital with its source
- **WHEN** a user opens and rotates the hospital exterior
- **THEN** the supplied source geometry remains intact without extra architectural shapes, while proposed materials and the project-based uniform calibration are clearly identified

## MODIFIED Requirements
### Requirement: Building selection and scene layers
The application MUST select source tower/podium zones through visible labels or scene picking and independently toggle device markers and original source surrounding buildings while retaining the source site.

#### Scenario: Selected building
- **WHEN** the user selects B区
- **THEN** the podium zone is highlighted and the zone/floor information updates

### Requirement: Detailed architectural rendering
The hospital scene MUST render the supplied DWG hospital exterior and source surroundings/site with proposed reflective glazing and surface finishes, preserving source facade and rooftop geometry. All assets MUST remain genuine rotatable geometry and MUST distinguish source shape, proposed finishes and unverified dimensions/interiors without asserting a production BIM connection.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the DWG-derived tower/podium, original surrounding buildings and source site are visible with no unsupported architectural additions

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms with pointer and wheel
- **THEN** source side/rear geometry remains visible and camera reset and selection stay usable

### Requirement: Architectural night light hierarchy
The scene MUST present differentiated proposed hospital facade finishes, dimmer source surrounding buildings and legible source site divisions. Rotation MUST reveal source side/rear geometry; lighting and materials MUST NOT replace or invent architectural shape.

#### Scenario: Default and reverse architectural views
- **WHEN** the user opens the overview and rotates the scene
- **THEN** the hospital remains distinct from source context, glazing responds to view direction and source buildings/site retain three-dimensional depth
