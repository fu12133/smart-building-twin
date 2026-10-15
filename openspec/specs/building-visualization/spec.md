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
The application MUST select source tower/podium zones through visible labels or scene picking and independently toggle device markers and original source surrounding buildings while retaining the source site.

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

### Requirement: Rendering resource lifecycle
Scene-owned geometry, materials, textures and reflection targets MUST be disposed on destruction; floor switching and graphics recovery MUST stay usable.

Idle scenes without active precipitation MUST avoid continuous GPU redraws. Camera motion, patrol, resize, atmosphere and layers MUST redraw. Precipitation MAY animate at a bounded rate and MUST stop in floor/full-context views or when weather effects are disabled.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors

#### Scenario: Idle rendering and renewed interaction
- **WHEN** the initial scene is stationary without active precipitation and the user subsequently zooms or hides surrounding buildings
- **THEN** the idle rendered-frame count stays stable, zoom advances rendered frames, and hiding surroundings changes the rendered background

### Requirement: Architectural night light hierarchy
The scene MUST differentiate hospital facade finishes from dimmer source context/site. The original proposal MAY include user-authorized architectural details and static facade/entrance light strips; the source view MUST retain original shape. Glazing MUST respond to actual view direction and neither view may use a screenshot substitute.

#### Scenario: Default and reverse architectural views
- **WHEN** a user rotates the original hospital or its source view
- **THEN** the selected view keeps three-dimensional depth and view-dependent glazing, while source context/site geometry remains unchanged

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

### Requirement: Distinct schematic floor layouts
The application MUST render a deterministic, visibly different arrangement for every selectable zone/floor, including basements. Tower and podium MUST use separate structural-core configurations that remain vertically aligned within each zone. Proposed room divisions and door openings MUST remain real geometry and explicitly schematic, without claiming verified clinical allocation.

#### Scenario: Inspect every floor
- **WHEN** a user visits tower 1–18/B1/B2 and podium 1–6/B1/B2 using floor controls
- **THEN** all 28 selected contexts show distinct room/circulation arrangements, and returning to a prior context restores its same layout

#### Scenario: Repeated floor switching
- **WHEN** a user rotates the floor view and repeatedly changes floors or zones
- **THEN** camera pose remains stable, replaced floor resources are disposed, only current equipment markers remain, and returning to 3D restores the saved exterior pose

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
The hospital MUST retain the supplied source tower/podium geometry and shared source calibration. The original white-model view MUST show no added architectural shapes. A separately identified original hospital design view MAY add user-authorized facade and entrance details without replacing source massing, surrounding geometry or site. Physical dimensions, proposed finishes/details and schematic interiors MUST remain distinguished.

#### Scenario: Compare the hospital with its source
- **WHEN** a visitor toggles the original hospital proposal through scene layers
- **THEN** real architectural detail and proposed finishes appear/disappear, source geometry stays intact, and camera position and original surroundings/site do not change

### Requirement: Hospital display illumination
The exterior MUST provide static warm hospital surface/window lighting and cooler side/back fill with restrained bloom using the existing rendering lifecycle. Illumination MUST retain unchanged source assets/geometry/coordinates, remain identified as a display proposal and preserve the existing floor-view lighting and idle redraw behavior.

#### Scenario: Inspect illuminated exterior
- **WHEN** a visitor opens, rotates and zooms the hospital exterior
- **THEN** warm illuminated hospital surfaces/windows and cooler background depth remain visible on multiple sides, with unchanged source shapes and Chinese display-lighting proposal identification

#### Scenario: Floor and lighting lifecycle
- **WHEN** a visitor enters a floor, returns to 3D or reloads after a graphics failure
- **THEN** floor white-wall visualization remains usable, exterior illumination returns with the saved camera pose, a single renderer remains and idle rendering settles without uncaught errors

### Requirement: Reflective hospital glazing finish
The source hospital glazing MUST use physically based dielectric reflectance, a restrained smooth coating and subtle surface detail that responds to actual camera motion and scene illumination. The finish MUST preserve source geometry and remain identified as a proposal.

#### Scenario: View-angle glazing response
- **WHEN** a visitor rotates and zooms the exterior using pointer controls
- **THEN** the source glass has smooth environmental highlights and view-dependent reflections while source window/facade shapes remain unchanged

### Requirement: Shenzhen exterior atmosphere
The exterior MUST adapt sky, reflection, illumination and fog to Shenzhen daylight and available current weather while preserving all source geometry and camera poses. Precipitation effects MUST be user-disableable and absent in floor/full-context views. Weather rendering and its owned GPU resources MUST use the existing BuildingScene lifecycle.

#### Scenario: Weather changes and disabling effects
- **WHEN** a visitor refreshes weather or disables weather effects through scene controls
- **THEN** available current weather changes actual sky/illumination/precipitation, disabling restores the display-lighting preset, and pointer rotation/reset remain functional

#### Scenario: Floor and idle rendering
- **WHEN** a visitor enters/returns from a floor or pauses precipitation effects
- **THEN** floor lighting stays legible, the saved exterior camera returns, and a stationary scene without active precipitation avoids continuous GPU redraws

### Requirement: Visible sunlight and explicit sunny preview
The exterior MUST default to a visible sun and warm sunlight in Shenzhen daytime and a moon with cool fill at night, without preview actions. Weather MUST attenuate these illustrative effects while real readings, source geometry and user state remain intact. Initial/reset framing MUST include the active body on desktop and narrow screens. Optional sunny preview MUST be bilingual, explicitly non-live and reversible.

#### Scenario: Clear daylight and adverse weather
- **WHEN** the page opens in daylight or weather changes to clouds, rain or night
- **THEN** default daylight shows a sun with weather-attenuated glow and light, night shows a moon instead, actual readings remain honest, and weather updates preserve camera and source geometry

#### Scenario: Sunny preview and return to Shenzhen
- **WHEN** the visitor enables sunny preview then cancels it or disables weather effects
- **THEN** preview is clearly non-live while actual time/weather remain real, cancellation restores the default Shenzhen day sun/night moon, and disabling effects restores the static preset without celestial bodies

#### Scenario: Floor, language and lifecycle
- **WHEN** a visitor switches language, enters a floor, returns to 3D, reloads or leaves it idle
- **THEN** language/floor switches preserve pose and preview state, full reload defaults to automatic sun/moon, floor lighting stays unchanged and one renderer disposes resources and settles without active precipitation

#### Scenario: Explicit sun observation
- **WHEN** a visitor optionally chooses View the sun in sunny preview
- **THEN** the camera orbits within control bounds, source geometry remains unchanged and reset restores the default framing with the celestial body visible

#### Scenario: Default celestial framing
- **WHEN** a visitor opens the exterior in day or night at desktop, 768 or 390 pixels wide
- **THEN** the active sun or moon is painted in the Three.js sky in the default view without clicking preview or observation, and bilingual controls/notices remain accessible
