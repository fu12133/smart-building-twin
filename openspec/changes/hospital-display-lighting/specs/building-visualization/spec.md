## ADDED Requirements

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
