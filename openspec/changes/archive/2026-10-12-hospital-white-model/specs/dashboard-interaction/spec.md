## ADDED Requirements

### Requirement: Verified project facts and illustrative data
The dashboard MUST identify the source DWG, show supplied renovation area 28,426 m², 18 aboveground plus two underground floors and investment 2.87亿元, and keep operational data and floor diagrams labeled synthetic. Dimensions from the project summary MUST be distinguished from calibrated white-model dimensions.

#### Scenario: Project facts and source distinction
- **WHEN** a user inspects the dashboard and model help
- **THEN** supplied project facts are visible and calibration, proposed finishes, synthetic floor diagrams and unconnected operational data are clearly explained

## MODIFIED Requirements

### Requirement: Honest demo data
The application MUST label operational indicators and floor layouts as demonstrations, identify user-provided white-model geometry and proposed hospital finishes, and MUST NOT claim surveyed BIM, verified clinical allocation or live IoT/clinical connections.

#### Scenario: Demo source visible
- **WHEN** the dashboard loads
- **THEN** visible source/proposal indicators and provenance identify the provided shape, proposed materials and synthetic data

### Requirement: Hospital demonstration terminology
The dashboard MUST use Chinese hospital-zone and floor/equipment terminology, bound floors to the selected source tower/podium zone and clearly identify synthetic indicators and floor layouts.

#### Scenario: Select a hospital building and floor device
- **WHEN** the user selects a hospital zone, switches floors and locates equipment
- **THEN** zone/floor/device remain consistent, floor limits including B1/B2 are respected and the interface identifies data and floor diagrams as demonstrations
