## ADDED Requirements

### Requirement: Original hospital proposal controls
The dashboard MUST expose a Chinese original hospital proposal layer toggle, enabled by default, which switches between original architectural details/materials and the existing source model presentation without changing camera, zone, floor or surrounding layer preferences. Copy MUST identify the model as an original proposal based on the white model, leave the institution name unset, and distinguish it from verified construction geometry.

#### Scenario: Inspect or hide the proposal
- **WHEN** a visitor changes the original hospital proposal checkbox
- **THEN** the Chinese source status reflects the selected presentation and actual rendered geometry/materials change while camera and source context remain stable

#### Scenario: Narrow screen and floor return
- **WHEN** a visitor uses the proposal control at 768 or 390 pixels or returns from a schematic floor
- **THEN** the control remains accessible without horizontal overflow and the chosen exterior presentation is restored
