## MODIFIED Requirements

### Requirement: Hospital source shape fidelity
The hospital MUST retain the supplied source tower/podium geometry and shared source calibration. The original white-model view MUST show no added architectural shapes. A separately identified original hospital design view MAY add user-authorized facade and entrance details without replacing source massing, surrounding geometry or site. Physical dimensions, proposed finishes/details and schematic interiors MUST remain distinguished.

#### Scenario: Compare the hospital with its source
- **WHEN** a visitor toggles the original hospital proposal through scene layers
- **THEN** real architectural detail and proposed finishes appear/disappear, source geometry stays intact, and camera position and original surroundings/site do not change

### Requirement: Detailed architectural rendering
The hospital scene MUST render the supplied DWG hospital and original surroundings/site as genuine rotatable geometry. The default original hospital proposal MUST add source-aligned three-dimensional curtain-wall frames, layered facade detailing and a proposed entrance with original materials. Source provenance and unverified proposal/dimension/interior boundaries MUST be visible.

#### Scenario: Inspect the default architectural view
- **WHEN** a visitor opens, rotates and zooms the default overview
- **THEN** original facade frames, shading details, differentiated glazing and entrance geometry remain visible on multiple sides with Chinese proposal identification

#### Scenario: Inspect another side
- **WHEN** a visitor rotates and zooms the exterior
- **THEN** source side/rear geometry and original details remain three-dimensional, with usable reset and zone selection

#### Scenario: Preserve lifecycle and floor navigation
- **WHEN** a visitor disables the proposal, enters/returns from a floor, re-enables the proposal or reloads after graphics failure
- **THEN** proposal preference and saved exterior pose are respected, one renderer remains usable, original assets stay unchanged, and static rendering settles without accumulated resources or errors

### Requirement: Architectural night light hierarchy
The scene MUST differentiate hospital facade finishes from dimmer source context/site. The original proposal MAY include user-authorized architectural details and static facade/entrance light strips; the source view MUST retain original shape. Glazing MUST respond to actual view direction and neither view may use a screenshot substitute.

#### Scenario: Default and reverse architectural views
- **WHEN** a user rotates the original hospital or its source view
- **THEN** the selected view keeps three-dimensional depth and view-dependent glazing, while source context/site geometry remains unchanged
