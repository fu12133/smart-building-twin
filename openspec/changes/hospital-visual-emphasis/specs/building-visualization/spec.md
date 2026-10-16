## ADDED Requirements

### Requirement: Illustrative hospital streetscape
The optional hospital proposal MUST include real 3D trees, people, vehicles and facade billboards, with varied subdued context finishes. Props MUST use original site heights, avoid source building volumes, and preserve source geometry and calibration. Placement and AI-generated advertisement imagery MUST be identified as illustrative in both languages. Source/full-source views MUST hide additions and restore original context finishes; owned resources MUST be disposed.

#### Scenario: Inspect trees, people, vehicles and advertising
- **WHEN** a visitor opens or rotates the hospital proposal
- **THEN** trees, human figures, cars and image-based facade advertising are visible as real scene objects, with varied surrounding finishes and no replacement of source roads/buildings

#### Scenario: Recognizable entrance and upper/lower finish distinction
- **WHEN** the default proposed hospital exterior is inspected
- **THEN** an advertising screen is mounted above the proposed main-entrance canopy and remains legible in the default composition, with support/frame geometry; the upper tower has cool-blue glass/silver vertical detailing and the podium has warm-stone/champagne horizontal detailing, using separate materials and spacing rather than one repeated facade treatment
- **AND** source/proposal and streetscape controls restore or hide the additions consistently without changing original source buffers

#### Scenario: Hide additions and retain source
- **WHEN** the visitor turns off the proposal, opens full-source context or enters a floor
- **THEN** added props and advertising disappear, original geometry stays intact, and returning restores the chosen presentation without resource growth or late-loaded attachment to disposed scenes

### Requirement: Hospital visual hierarchy
The default hospital proposal MUST emphasize the source hospital through closer framing, reflective glazing, legible facade illumination and subdued source surroundings. Source geometry/calibration MUST remain intact. Proposal-off and full-source context MUST restore existing context finishes. Weather, sun/moon, floor illumination, user camera state and bilingual notices MUST remain usable. Styling MUST NOT be described as verified one-to-one reconstruction.

#### Scenario: Prominent hospital by day and night
- **WHEN** a visitor opens or resets the hospital view in daytime or at night
- **THEN** the tower and podium dominate the central composition with clear glazing/frame detail, warmer podium and cooler context, and default sun/moon remain visible without preview clicks

#### Scenario: Restore source context presentation
- **WHEN** the proposal is disabled or the full-source overview is opened
- **THEN** context materials restore their exact prior values, source geometry and coordinates stay unchanged, and proposal toggling preserves camera pose

#### Scenario: Responsive interaction and lifecycle
- **WHEN** a visitor rotates, switches language, enters a floor, returns, or inspects the view at 768/390 pixels
- **THEN** real pointer interaction and saved pose work, floor lighting stays unchanged, no control overflow occurs, and static lighting settles without continuous GPU redraw or resource growth
