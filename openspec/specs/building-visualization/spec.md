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
The application MUST select buildings through visible labels or scene picking and independently toggle device markers and surrounding buildings.

#### Scenario: Selected building
- **WHEN** the user selects B座
- **THEN** B座 is highlighted and the building/floor information updates

### Requirement: 2.5D floor visualization
The application MUST offer a 2.5D electronic floor map with extruded room boundaries, floor selection and selectable equipment markers.

#### Scenario: Floor device selection
- **WHEN** the user switches to 2.5D, selects floor 12 and selects a device
- **THEN** the floor heading shows 12F and the device details identify the current building and floor

#### Scenario: Return to 3D
- **WHEN** the user returns from 2.5D to 3D
- **THEN** the previous 3D camera pose is restored and free rotation is available again

### Requirement: WebGL recovery
The application MUST show an actionable error when WebGL creation fails or the rendering context is lost.

#### Scenario: Graphics unavailable
- **WHEN** WebGL context creation fails
- **THEN** the UI displays a readable rendering failure with a reload action instead of an empty canvas

### Requirement: Detailed architectural rendering
The 3D scene MUST render multi-face glass curtain walls with reflection response, visible mullions and varied illuminated office interiors, together with roof equipment, a warm stone commercial podium and landscaped ground detail. These assets MUST remain genuine rotatable geometry and MUST be identified as a demonstration model.

#### Scenario: Inspect the default architectural view
- **WHEN** the user opens the 3D overview
- **THEN** the rendered view shows differentiated reflective glass, thin facade framing, warm interior lighting, podium terraces, varied tree crowns and paved roads with street furniture

#### Scenario: Inspect another side
- **WHEN** the user rotates and zooms the model with pointer and wheel
- **THEN** newly visible facades retain window and framing detail, reflections respond to view direction, and existing camera reset and selection remain usable

### Requirement: Rendering resource lifecycle
Generated geometry, materials, textures and reflection render targets MUST be disposed when the scene is destroyed; rendering MUST retain responsive floor switching and graphics recovery.

#### Scenario: Reinitialize after graphics failure
- **WHEN** graphics recovery reloads the scene
- **THEN** the detailed model renders again with working controls and no uncaught browser errors
