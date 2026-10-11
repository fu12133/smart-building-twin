# Verification — rotatable-building-twin

Result: passed for the implemented local demo scope.

## Automated evidence

`npm run build` passed TypeScript validation and production bundling. `npm run spec:validate` passed OpenSpec strict validation. `npm run harness` passed **9 / 9** acceptance tests in **20.8 s**, using Microsoft Edge headless + SwiftShader on Windows. The final run produced no unexpected browser console errors or uncaught exceptions.

| Requirement | Evidence |
| --- | --- |
| Real WebGL rotation | V1 uses an actual pointer drag; camera coordinates change by more than 20 world units and canvas screenshot hashes differ. Rendered geometry has more than 1,000 triangles. |
| Zoom, pan, keyboard and reset | V2 performs wheel zoom, right-button pan and ArrowLeft; reset returns within 0.01 world units of the initial pose. |
| Pause/start巡航 | V3 observes rotation while running, then verifies positional drift below 0.05 after pausing. |
| Building / floor / device linkage | V4 chooses B座 through its label, opens 12F, selects a smoke detector and verifies B-12F-SMK-03; returns to saved 3D pose. |
| Layers / mode preferences | V5 hides and restores equipment labels, hides surrounding geometry, disables巡航 in 2.5D and restores its 3D preference. |
| Navigation / alarm location / floor limits | D1 switches energy/access/equipment panels; verifies alarm detail, clamps C座 to 20F, then locates A-12F-AC-01 from another building and floor. |
| Responsive controls | D2 validates 768×1024 and 390×844, checks no horizontal overflow and uses floor/device/3D controls. V2 additionally verifies all desktop side panels fit 1440×900. |
| Graphics recovery | V6 injects the browser context-lost event, checks the recovery UI and verifies scene initialization after reload. WebGL creation failure is handled by the constructor catch; it was not independently fault-injected. |
| Honest sources | Harness verifies the visible demo-data label; model-source note remains visible in the header. |

Machine-readable evidence: `artifacts/harness/results.json`.

## Visual evidence

- `artifacts/harness/overview-desktop.png`: 1440×900 default overview; all panels fit; model roof and building labels are visible.
- `artifacts/harness/rotated-desktop.png`: changed viewing angle after actual pointer drag.
- `artifacts/harness/floor-device-desktop.png`: 2.5D room geometry, equipment marker and details.
- `artifacts/harness/overview-768.png`: tablet layout.
- `artifacts/harness/overview-390.png`: phone layout, complete scrollable page.

The desktop, floor-device and phone screenshots were visually inspected. Compared with the supplied references, the implementation preserves the blue night scene, glass-building grid, surrounding massing, green landscaping and operational data panels. It uses a clearer dashboard frame and schematic geometry. It is **not** a geometrically faithful reproduction of the reference building, because no source BIM asset was supplied.

## Defects found and resolved

1. Tall narrow canvases cropped geometry: adaptive camera distance now uses canvas aspect ratio.
2. Reset applied residual OrbitControls movement: pending deltas are cleared before pose restoration.
3. Pause retained damped drift: pending control movement is cleared while preserving the current pose.
4. Fixed-height desktop panels extended below the screen: compact spacing is applied at desktop heights up to 1000px; an acceptance assertion checks panel bounds.
5. Cross-building alarm location could clear selection in a floor effect: device selection is committed after building/floor/mode transitions, with a regression assertion.
6. Missing favicon caused console 404: local favicon is supplied. External font dependency removed.

## Remaining scope and dependency notes

- Geometry, IoT values and alarms are explicitly synthetic. Repeated floor diagrams provide demonstration semantics, not engineering BIM accuracy.
- Actual hardware GPU performance and touch-device gestures were not tested on physical devices. Automated WebGL verification used software rendering.
- `npm audit --omit=dev`: 0 vulnerabilities. Full audit reports 4 high-severity entries in OpenSpec's transitive `fast-glob → micromatch → braces` development-tool chain. Registry version 3.0.3 of braces has no patched replacement in the current dependency tree; avoid running the CLI against untrusted pathological glob input. This dependency is excluded from the browser production bundle.
