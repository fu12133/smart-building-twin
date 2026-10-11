# Project development contract

This project follows the user's OpenSpec + harness workflow.

- Read `openspec/specs/` and the relevant active change before changing behavior. For a new user-visible capability, record proposal, scenarios, design and tasks under `openspec/changes/<name>/` before implementation.
- Preserve real Three.js geometry and real pointer-based rotation; do not replace the model with a screenshot or CSS rotation.
- Keep synthetic models and data explicitly identified. Do not claim a production BIM/IoT connection without provided and verified assets/endpoints.
- Use the existing `BuildingScene` for camera and GPU lifecycle. Call `dispose` when unmounting. Clear OrbitControls residual momentum before exact pose restoration.
- When locating equipment across buildings/floors, apply pending selection after floor/mode effects. Floor selection must not exceed the selected building's floor count.
- Keep all UI copy Chinese, and use Asia/Shanghai for displayed times.
- Preview runs on `127.0.0.1:4187`; do not stop or overwrite unrelated servers.
- Validate relevant changes using `npm run spec:validate`, `npm run build` and `npm run harness`. Harness interactions must use user-facing controls; internal snapshot is read-only and development-only. Controlled failure injection is allowed for graphics error scenarios.
- Check rendered screenshots when layout or model framing changes. Update `docs/verification.md` with actual evidence, then archive completed OpenSpec changes.
