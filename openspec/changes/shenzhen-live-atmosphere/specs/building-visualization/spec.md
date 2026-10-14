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
Generated geometry, materials, textures and reflection render targets MUST be disposed when the scene is destroyed; rendering MUST retain responsive floor switching and graphics recovery.

An idle scene without active precipitation MUST avoid continuous GPU redraws while camera motion, automatic rotation, viewport, atmosphere and layer changes MUST refresh the rendered view. Active precipitation MAY animate at a bounded rate and MUST stop in floor/full-context views or when weather effects are disabled.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors

#### Scenario: Idle rendering and renewed interaction
- **WHEN** the initial scene is stationary without active precipitation and the user subsequently zooms or hides surrounding buildings
- **THEN** the idle rendered-frame count stays stable, zoom advances rendered frames, and hiding surroundings changes the rendered background
