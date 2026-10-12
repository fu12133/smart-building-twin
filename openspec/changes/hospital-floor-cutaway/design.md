# Design

Use real Three.js rounded extrusions for gray floor slabs and white perimeter walls, repeated columns and a compact central core with stairs, elevator/service rooms and a central passage. Neutral rough materials and floor-only lighting retain readable white surfaces and depth. No screenshot, CSS-rotated floor or image replacement.

Floor-only half-resolution SSAO supplies wall/floor contact depth with eight samples; allocate it under BuildingScene, enable only for floors, resize with the composer and dispose explicitly. Preserve the exterior reflection background, and use a dark neutral background for the cutaway. Frame the floor using actual available canvas width after overlays, scale camera distance on resize without changing orbit orientation, and give tablets a full-width floor row. Keep camera buttons and floor rail in separate columns.

Project device buttons to world positions, display Lucide library icons in circular cyan buttons, and retain accessible Chinese names and actual Three.js pointer cones. Dispose per-marker React roots on scene disposal. Category filtering and device-layer visibility compose in one update; hidden markers cannot capture raycast selection. Scene camera and OrbitControls continue to own rotation and exact previous-3D pose restoration.

Add a bounded, scrollable right floor rail using the same selection state as the existing floor select. Retain A floors 18..1/B1/B2 and B floors 6..1/B1/B2, including 13/14 retained-function labels. Six synthetic category cards (video, power, HVAC, water, access, fire) filter demonstration floor points and report counts computed from those points, not fabricated live totals. Locating from alarms clears an incompatible filter, with pending device selection applied after mode/floor effects. Mobile uses a horizontal floor rail and stacked cards without horizontal page overflow.

Compare the reference at normalized size with actual browser screenshots, allowing deliberate preservation of the existing outer dashboard. Record limitations: source DWG provides exterior geometry only; interior core/rooms and device placement remain schematic.
