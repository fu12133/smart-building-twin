# Why
All floors currently reuse one interior schematic. Users need visually distinct layouts on every floor, while actual interior drawings remain unavailable.

# What Changes
- Provide 28 deterministic, distinct schematic layouts for tower 1–18/B1/B2 and podium 1–6/B1/B2.
- Keep vertically aligned structural cores within each zone, vary perimeter room divisions, circulation and openings by floor, and derive device locations from the selected plan.
- Rebuild floor resources safely without resetting the camera or accumulating DOM/GPU resources.
- Expose Chinese plan summaries and retain proposal/demo and renovation-scope labeling.

# Impact
Affected specifications: building-visualization, dashboard-interaction. Affected implementation: floor layout data, floor geometry, BuildingScene and dashboard. Exterior source geometry and supplied project facts remain unchanged.
