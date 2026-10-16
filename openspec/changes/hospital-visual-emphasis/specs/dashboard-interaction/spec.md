## ADDED Requirements

### Requirement: Reference blue visual style
The dashboard MUST use the supplied reference's saturated blue sky, deep-blue translucent panels, cyan accents and warm-white hospital emphasis. Desktop exterior data MUST form two right columns around an open hospital composition. Existing business controls, bilingual copy and floor layout MUST remain usable. Responsive views MUST retain accessible controls without overflow. The reference's architecture MUST NOT replace the source hospital.

#### Scenario: Inspect reference styling
- **WHEN** the desktop exterior is opened at the reference viewport
- **THEN** the sky, panels, typography hierarchy and data accents follow the sampled blue palette, the hospital occupies the open left/central region and both data columns remain readable

#### Scenario: Floor and narrow viewport
- **WHEN** a visitor enters a floor, switches language or uses 768/390 pixels
- **THEN** controls and data remain accessible, the floor uses its centered projection, and returning preserves the exterior pose and reference presentation

#### Scenario: Optional streetscape layer
- **WHEN** a visitor changes the bilingual Streetscape props checkbox
- **THEN** trees, people, vehicles and billboard faces change actual geometry visibility without changing source geometry, context colors, pose or business selection, and the preference survives language/floor switches

#### Scenario: Unobstructed exterior composition
- **WHEN** the desktop exterior opens
- **THEN** summary metrics default hidden and can be shown through the bilingual layer control without changing the camera; floor and narrow layouts retain their visible summary metrics
