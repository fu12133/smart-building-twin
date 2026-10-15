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
The dashboard MUST use hospital-zone and floor/equipment terminology in the selected language, defaulting to Chinese, bound floors to the selected source tower/podium zone and clearly identify synthetic indicators and floor layouts in both languages.

#### Scenario: Select a hospital building and floor device
- **WHEN** the user selects a hospital zone, switches floors and locates equipment
- **THEN** zone/floor/device remain consistent, floor limits including B1/B2 are respected and the interface identifies data and floor diagrams as demonstrations

### Requirement: Verified project facts and illustrative data
The dashboard MUST identify the source DWG, show supplied renovation area 28,426 m², 18 aboveground plus two underground floors and investment 2.87亿元, and keep operational data and floor diagrams labeled synthetic. Dimensions from the project summary MUST be distinguished from calibrated white-model dimensions.

#### Scenario: Project facts and source distinction
- **WHEN** a user inspects the dashboard and model help
- **THEN** supplied project facts are visible and calibration, proposed finishes, synthetic floor diagrams and unconnected operational data are clearly explained

### Requirement: Bounded floor rail and system cards
The floor view MUST provide a visible bounded floor rail synchronized with floor selection, six localized equipment-system summary/filter cards with explicitly synthetic counts, and a clear all-systems reset. Floor bounds and renovation scope MUST remain consistent with the source project.

#### Scenario: Rail selection and zone bounds
- **WHEN** the user selects A 18F on the rail then changes to B
- **THEN** floor selection clamps to B 6F, the rail offers no B 7F or floor zero, and B1/B2 remain selectable

#### Scenario: Alarm overrides incompatible filter
- **WHEN** the user filters for video equipment then locates an HVAC alarm
- **THEN** the filter resets to all systems and the target zone/floor/device details appear after mode and floor updates

#### Scenario: Narrow interior controls
- **WHEN** the user views the interior at 768 or 390 pixels wide
- **THEN** floor selection, category reset and device details remain operable without horizontal page overflow

### Requirement: Floor-specific plan and equipment context
The dashboard MUST show the current zone/floor schematic plan summary and resolve equipment locations from that same plan. It MUST preserve floor bounds, synthetic labeling and retained-floor renovation scope.

#### Scenario: Select a different floor
- **WHEN** a user changes floor or switches from tower 18F to the podium
- **THEN** plan summary, room divisions and equipment locations update together, and the podium floor is bounded to 6F

#### Scenario: Locate equipment across contexts
- **WHEN** a user locates an alarm on a different floor while a category filter is active
- **THEN** the filter resets and the equipment detail uses the target floor's proposed location after its geometry has updated

### Requirement: White-model scope controls and provenance
The dashboard MUST distinguish original hospital/context/site geometry from proposed finishes and schematic interiors, expose context loading status and provide a full-white-model view control in the selected language. Hospital selection, floor scope, equipment context and saved exterior pose MUST remain consistent.

#### Scenario: Full source view and floor return
- **WHEN** the user opens the full-white-model view, enters a floor then returns to3D
- **THEN** the prior full-view camera and context presentation are restored, and reset returns to the hospital framing

### Requirement: Shenzhen clock and current weather
The dashboard MUST display a ticking Asia/Shanghai clock and Shenzhen weather sourced from a current online weather-model API with temperature, condition, data time and attribution. It MUST refresh automatically and through a user-facing action, identify stale/unavailable data honestly and retain accessible weather/time controls on narrow viewports.

#### Scenario: Online weather and live clock
- **WHEN** current weather data are available
- **THEN** the Shenzhen condition/temperature and provider data time are visible, the clock advances each second in Asia/Shanghai and weather refresh uses the fixed Shenzhen coordinates

#### Scenario: Unavailable weather
- **WHEN** weather requests fail, time out or return invalid/old data
- **THEN** the dashboard clearly shows unavailable/old data with a retry action, never fabricates current readings, and the model and floor controls remain usable

### Requirement: Original hospital proposal controls
The dashboard MUST expose a Chinese original hospital proposal layer toggle, enabled by default, which switches between original architectural details/materials and the existing source model presentation without changing camera, zone, floor or surrounding layer preferences. Copy MUST identify the model as an original proposal based on the white model, leave the institution name unset, and distinguish it from verified construction geometry.

#### Scenario: Inspect or hide the proposal
- **WHEN** a visitor changes the original hospital proposal checkbox
- **THEN** the Chinese source status reflects the selected presentation and actual rendered geometry/materials change while camera and source context remain stable

#### Scenario: Narrow screen and floor return
- **WHEN** a visitor uses the proposal control at 768 or 390 pixels or returns from a schematic floor
- **THEN** the control remains accessible without horizontal overflow and the chosen exterior presentation is restored

### Requirement: Chinese and English language selection
The dashboard MUST offer accessible Chinese and English controls, default to Chinese, persist a valid user preference when storage is available, and remain usable when storage is denied. Navigation, metrics, chart text, scene/floor controls, device details, help, errors and weather MUST follow the selected language, with matching document language/title. Source filenames and equipment IDs MUST retain their identity.

#### Scenario: Change language without losing context
- **WHEN** a user switches to English or back to Chinese through the language control
- **THEN** interface and scene labels update in place while the same renderer/canvas, camera pose, zone/floor, selected equipment, filters, layer choices and weather reading remain intact

#### Scenario: Remember language and handle unavailable storage
- **WHEN** the page reloads after language selection, or local storage is unavailable
- **THEN** an available saved preference is restored and otherwise the Chinese default and both language controls remain functional without errors

#### Scenario: English weather and time
- **WHEN** English is selected and weather details or clock are visible
- **THEN** conditions, errors, source/proposal notices and date/weekday use English while displayed time remains Asia/Shanghai and no language-only weather request is made

#### Scenario: Responsive English controls
- **WHEN** a user opens the English overview, floor, weather and device views at 768 or 390 pixels wide
- **THEN** language selection and primary controls remain accessible without horizontal page overflow or unreadable clipping
