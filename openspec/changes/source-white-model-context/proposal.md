# Why
The previous conversion exported only hospital mesh 584 and replaced its source surroundings with a procedural city/ground. The user reports that the white model's surroundings were not included.

# What Changes
- Restore original surrounding city, nearby building and site meshes from the verified DWG export, retaining relative coordinates and the hospital's uniform scale.
- Replace generic city and ground footprints with source geometry; retain clearly identified proposed material finishes.
- The user additionally requires hospital source fidelity: remove procedural facade, arrival and landscape geometry without source support. Actual material/interior fidelity requires further references; dimension calibration is explicitly distinguished.
- Add a Chinese full-white-model view with suitable camera/fog and reset to the hospital view.
- Keep source surroundings independently toggleable and nonselectable as hospital zones; handle loading failures, late completion and disposal.

# Impact
Specifications: building-visualization and dashboard-interaction. Implementation: context conversion/manifest, context asset lifecycle, BuildingScene, copy and harness. Original hospital GLB, supplied project facts and 28 schematic floor plans remain intact. Raw DWG and decoded JSON remain local.
