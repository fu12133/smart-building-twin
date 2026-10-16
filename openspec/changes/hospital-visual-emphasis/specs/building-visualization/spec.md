## ADDED Requirements

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
