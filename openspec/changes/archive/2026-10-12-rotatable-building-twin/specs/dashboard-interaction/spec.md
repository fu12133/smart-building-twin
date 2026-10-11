## ADDED Requirements

### Requirement: Clear dashboard navigation
The application MUST provide functional overview, equipment, access and energy navigation with the current view reflected in page heading and data panels.

#### Scenario: Navigation changes data
- **WHEN** the user chooses 通行统计 or 能源分析
- **THEN** the associated metrics and charts replace the overview data while retaining the 3D scene

### Requirement: Honest demo data
The application MUST label synthetic indicators and parametric models as demo content and MUST NOT claim a production IoT connection.

#### Scenario: Demo source visible
- **WHEN** the dashboard first loads
- **THEN** a visible demo-data indicator and parametric-model note identify the source

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
