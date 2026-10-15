## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Hospital demonstration terminology
The dashboard MUST use hospital-zone and floor/equipment terminology in the selected language, defaulting to Chinese, bound floors to the selected source tower/podium zone and clearly identify synthetic indicators and floor layouts in both languages.

#### Scenario: Select a hospital building and floor device
- **WHEN** the user selects a hospital zone, switches floors and locates equipment
- **THEN** zone/floor/device remain consistent, floor limits including B1/B2 are respected and the interface identifies data and floor diagrams as demonstrations

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

### Requirement: White-model scope controls and provenance
The dashboard MUST distinguish original hospital/context/site geometry from proposed finishes and schematic interiors, expose context loading status and provide a full-white-model view control in the selected language. Hospital selection, floor scope, equipment context and saved exterior pose MUST remain consistent.

#### Scenario: Full source view and floor return
- **WHEN** the user opens the full-white-model view, enters a floor then returns to3D
- **THEN** the prior full-view camera and context presentation are restored, and reset returns to the hospital framing
