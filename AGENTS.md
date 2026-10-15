# Project development contract

This project follows the user's OpenSpec + harness workflow.

- Read `openspec/specs/` and the relevant active change before changing behavior. For a new user-visible capability, record proposal, scenarios, design and tasks under `openspec/changes/<name>/` before implementation.
- Preserve real Three.js geometry and real pointer-based rotation; do not replace the model with a screenshot or CSS rotation.
- Hospital exterior and surroundings/site must retain source geometry and shared calibration/anchor. The user-authorized optional original hospital proposal may add facade/entrance details, clearly labeled as a design; its source view must hide additions and preserve existing source presentation. Never replace original surroundings/site with procedural city/ground footprints. Finishes, added details and interiors remain unverified proposals until actual references are supplied.
- Keep synthetic models and data explicitly identified. Do not claim a production BIM/IoT connection without provided and verified assets/endpoints.
- Use the existing `BuildingScene` for camera and GPU lifecycle. Call `dispose` when unmounting. Clear OrbitControls residual momentum before exact pose restoration.
- When locating equipment across buildings/floors, apply pending selection after floor/mode effects. Floor selection must not exceed the selected building's floor count.
- Keep Chinese as the default UI language and support the user-requested English switch across visible/accessibility copy. Preserve source filenames/equipment IDs and all demo/proposal notices; switching language must not recreate BuildingScene or reset its pose/business state. Use Asia/Shanghai for displayed times in both languages.
- Identify atmosphere previews explicitly and keep real weather/time intact. Solar direction remains illustrative until a true-north reference is provided; do not describe it as verified solar analysis.
- Preview runs on `127.0.0.1:4187`; do not stop or overwrite unrelated servers.
- Validate relevant changes using `npm run spec:validate`, `npm run build` and `npm run harness`. Harness interactions must use user-facing controls; internal snapshot is read-only and development-only. Controlled failure injection is allowed for graphics error scenarios.
- For exact model-geometry comparisons, use read-only visible scene geometry statistics; renderer triangle counters also include offscreen sky and shadow passes.
- Check rendered screenshots when layout or model framing changes. Update `docs/verification.md` with actual evidence, then archive completed OpenSpec changes.
