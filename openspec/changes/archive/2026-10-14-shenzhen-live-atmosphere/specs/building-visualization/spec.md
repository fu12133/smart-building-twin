## ADDED Requirements

### Requirement: Shenzhen exterior atmosphere
The exterior MUST adapt sky, reflection, illumination and fog to Shenzhen daylight and available current weather while preserving all source geometry and camera poses. Precipitation effects MUST be user-disableable and absent in floor/full-context views. Weather rendering and its owned GPU resources MUST use the existing BuildingScene lifecycle.

#### Scenario: Weather changes and disabling effects
- **WHEN** a visitor refreshes weather or disables weather effects through scene controls
- **THEN** available current weather changes actual sky/illumination/precipitation, disabling restores the display-lighting preset, and pointer rotation/reset remain functional

#### Scenario: Floor and idle rendering
- **WHEN** a visitor enters/returns from a floor or pauses precipitation effects
- **THEN** floor lighting stays legible, the saved exterior camera returns, and a stationary scene without active precipitation avoids continuous GPU redraws

## MODIFIED Requirements

### Requirement: Rendering resource lifecycle
Scene-owned geometry, materials, textures and reflection targets MUST be disposed on destruction; floor switching and graphics recovery MUST stay usable.

Idle scenes without active precipitation MUST avoid continuous GPU redraws. Camera motion, patrol, resize, atmosphere and layers MUST redraw. Precipitation MAY animate at a bounded rate and MUST stop in floor/full-context views or when weather effects are disabled.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors

#### Scenario: Idle rendering and renewed interaction
- **WHEN** the initial scene is stationary without active precipitation and the user subsequently zooms or hides surrounding buildings
- **THEN** the idle rendered-frame count stays stable, zoom advances rendered frames, and hiding surroundings changes the rendered background
