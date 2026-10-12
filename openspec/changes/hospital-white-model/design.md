## Geometry pipeline
Read the user-owned DWG locally with LibreDWG, then deterministically convert mesh 584 faces to a locally packaged GLB using scripts/convert-white-model.py. Preserve coordinates under uniform scale and CAD Z-up to WebGL Y-up conversion, triangulate planar polygons, retain source handle in names, and classify the connected tower/podium into selectable A/B zones. Exclude city meshes, light blocks, displaced duplicates and overlapping curtain-wall copies. Original DWG and intermediate decoded JSON stay outside the public repository. Store a source hash and conversion manifest.

## Rendering and controls
Use HospitalAsset and BuildingScene lifecycle. GLB material names map to reflective glazing, stone, metal and facade textures with deterministic warm occupied windows. No further model normalization. Imported mesh userData.building maps picking to the actual A/B zone. No extra invented wings. Existing landscape and optional contextual geometry remain illustrative. Dispose generated textures and imported resources once, including late completions.

## Floor semantics
A is the 18-storey tower; B is the six-storey podium within the same building, not another building. Basement options -1/-2 are schematic navigation only, because source basement geometry is unverified. Floor 0 is disallowed. Selecting B clamps high floors to 6; negative floors remain valid. Tower floors 13/14 show retained-function status; basement scope explicitly says partial renovation. No actual clinical room assignment is asserted.

## Validation
Strict OpenSpec/build/full pointer harness, source bounds/provenance integrity checks, new tests for 18F/13F/14F/basement and tower-to-podium clamping. Inspect default, close and reverse renders before publishing through existing GitHub Pages workflow.
