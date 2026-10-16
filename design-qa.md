# Hospital visual style QA — 2026-10-16

Scope: follow the supplied blue architectural dashboard style and color hierarchy while preserving the user's actual hospital, source site and source city geometry. This is not a pixel-identical reconstruction of the unrelated reference tower. Proposed finishes, props and billboard imagery remain identified.

Reference: supplied 1378×649 screenshot; video contact sheet checked at 0/8/16/24/32/40 seconds. Private reference/comparison images remain in ignored artifacts/ci, not published assets.

Comparison method: source and implementation were combined into the same image at aligned 1378×649 dimensions and visually inspected. Initial comparison `reference-style-final-comparison.png` found a P1: the tower was too small and the full-width KPI strip competed with it. Corrected desktop FOV/target, slimmed the header, and made summary metrics opt-in for the desktop exterior. Floor/mobile layouts retain centered framing and metrics.

Post-fix comparison: `artifacts/ci/reference-style-post-framing-comparison.png`, inspected with both source and implementation visible. The main tower now dominates the left/central composition, the warm podium and foreground props remain visible, and two deep-blue translucent data columns occupy the right. Cyan values, diamond navigation, muted differentiated context buildings, warm/cool facade lights and blue glass follow the selected visual direction. The moon is subordinate. No remaining blocking layout discrepancy in this scoped comparison. This is a visual review, not proof of identical architecture or photorealistic reproduction.

Intentional differences: source hospital massing and calibration; existing hospital dashboard content/brand/header; real weather/time and bilingual controls; schematic business data. Do not stretch the source model or invent clinical allocations to match the commercial-building reference.

Focused final-framing checks passed 6/6: source pointer picks, context occlusion, rendered subject contrast and exact context restoration, desktop columns/palette/floor projection, optional real 3D props/material colors, sunlight preview. Earlier complete 56/56 passed before the framing correction. Final full regression, day/mobile captures, production and deployment results must be recorded in docs/verification.md before release is called complete.
