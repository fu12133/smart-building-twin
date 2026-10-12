# Design
## Evidence and assumptions
The DWG supplies exterior shape, not verified floor partitions. The latest user request requires different layouts on every floor. These are proposed neutral space divisions, not asserted clinical departments. Tower 13/14 retain their source renovation scope; their displayed partitions remain unverified schematics.

## Architecture
One typed layout resolver owns dimensions, core transform, room rectangles, circulation pattern and equipment positions. There are 28 stable zone/floor contexts, each with a unique arrangement. The tower core stays vertically aligned. The podium uses a separate aligned smaller core. Underground plans have open zones and service partitions. Room boundaries include real door openings and subtle floor surfaces; the scene remains genuine rotatable Three.js geometry.

React and BuildingScene consume the same resolved layout. BuildingScene replaces only its floor subtree and floor label resources, disposing old geometries/materials/lights and React icon roots/listeners. It retains camera pose, filters and device-layer preference. Floor bounds are applied before constructing a zone/floor context; pending alarm selection runs after context effects.

## Verification
Harness uses visible selectors to visit every zone/floor and compares rendered floor pixels, verifies deterministic return, current plan summaries/device details, six live markers with no orphaned labels and stable geometry counts after repeated changes. Existing rotation, exact exterior pose restoration, filtering, floor bounds, graphics recovery and responsive controls remain covered. Screenshots cover representative tower, podium and underground layouts. Full strict specs/build/harness and repository-path production smoke test are required.
