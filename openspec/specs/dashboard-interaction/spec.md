# dashboard-interaction Specification

## Purpose
Provide a Chinese smart-building operations dashboard with functional overview, equipment, access and energy views, honest demo-data labeling, responsive controls and reproducible browser acceptance evidence.

## Requirements

### Requirement: Clear dashboard navigation
The application MUST provide functional overview, equipment, access and energy navigation with the current view reflected in page heading and data panels.

#### Scenario: Navigation changes data
- **WHEN** the user chooses 通行统计 or 能源分析
- **THEN** the associated metrics and charts replace the overview data while retaining the 3D scene

### Requirement: Honest demo data
The application MUST label operational indicators and floor layouts as demonstrations, identify user-provided white-model geometry and proposed hospital finishes, and MUST NOT claim surveyed BIM, verified clinical allocation or live IoT/clinical connections.

#### Scenario: Demo source visible
- **WHEN** the dashboard loads
- **THEN** visible source/proposal indicators and provenance identify the provided shape, proposed materials and synthetic data

### Requirement: Responsive usable controls
The application MUST keep navigation and scene controls accessible at desktop and narrow screen sizes without horizontal overflow.

#### Scenario: Narrow viewport
- **WHEN** the viewport is 768×1024 or 390×844
- **THEN** the scene is visible, the 3D/2.5D switch is operable and the page has no horizontal overflow

### Requirement: Reproducible acceptance harness
The repository MUST provide a single command that launches browser acceptance tests, records failures and produces screenshots plus machine-readable results.

#### Scenario: Run harness
- **WHEN** the developer runs npm run harness
- **THEN** Playwright validates user interactions, captures visual evidence, and exits nonzero on failed assertions or unexpected browser errors

### Requirement: Immersive desktop architectural view
On desktop the architecture MUST occupy a large canvas behind translucent operational overlays. Navigation, building/floor selection and camera controls MUST remain usable. Mobile MUST retain a scrollable scene and dashboard without horizontal overflow.

#### Scenario: Desktop overlays and rotation
- **WHEN** the user opens the desktop overview and drags the unobstructed central region
- **THEN** the scene fills the workspace, the camera rotates, and selectors and floating panels remain readable and clickable

### Requirement: Hospital demonstration terminology
The dashboard MUST use Chinese hospital-zone and floor/equipment terminology, bound floors to the selected source tower/podium zone and clearly identify synthetic indicators and floor layouts.

#### Scenario: Select a hospital building and floor device
- **WHEN** the user selects a hospital zone, switches floors and locates equipment
- **THEN** zone/floor/device remain consistent, floor limits including B1/B2 are respected and the interface identifies data and floor diagrams as demonstrations

### Requirement: Verified project facts and illustrative data
The dashboard MUST identify the source DWG, show supplied renovation area 28,426 m², 18 aboveground plus two underground floors and investment 2.87亿元, and keep operational data and floor diagrams labeled synthetic. Dimensions from the project summary MUST be distinguished from calibrated white-model dimensions.

#### Scenario: Project facts and source distinction
- **WHEN** a user inspects the dashboard and model help
- **THEN** supplied project facts are visible and calibration, proposed finishes, synthetic floor diagrams and unconnected operational data are clearly explained
