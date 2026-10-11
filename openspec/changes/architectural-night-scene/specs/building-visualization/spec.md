## ADDED Requirements

### Requirement: Architectural night light hierarchy
The 3D scene MUST present a bright reflective landmark facade with fine white framing and sparse warm office lights, a warm illuminated podium, dimmer surrounding buildings, dark roads and leafy landscape silhouettes. Rotation MUST reveal detailed side and rear facades.

#### Scenario: Default and reverse architectural views
- **WHEN** the user opens the overview and rotates the scene
- **THEN** the landmark and podium remain visually distinct from darker surroundings, glass varies across the facade and view direction, and podium curves and leafy trees retain three-dimensional depth

### Requirement: Locally packaged scene assets
Any third-party scene assets MUST be locally packaged with source/license documentation and respect the production repository base path. Late asset completion MUST not mutate a disposed scene.

#### Scenario: Production scene asset loading
- **WHEN** the public repository-path build loads
- **THEN** local lighting and vegetation assets load successfully without external runtime dependency, and controls remain functional
