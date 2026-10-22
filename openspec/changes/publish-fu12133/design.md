# Design

Use the current project checkout and preserve its history. Verify the active GitHub CLI account and repository permissions as fu12133 after the user's device-login authorization; never infer successful authentication from browser login alone. Keep the existing origin available and use a separate fu12133 remote for initial publication. Do not transfer/delete the old repository or stop unrelated servers.

The intended repository name is smart-building-twin, so the existing dynamic PAGES_BASE_PATH remains /smart-building-twin/. A new public repository requires Pages build_type=workflow and existing Actions/Pages permissions. Inspect destination contents before pushing; do not overwrite unrelated commits or force-push. Reuse the existing main-branch workflow; a failed acceptance/build must not replace the demonstration page.

Validation uses the existing full interaction harness and project-path build, followed by PRODUCTION_URL against the actual fu12133 Pages URL. Model/assets must return200, real pointer rotation/floor/equipment/language/weather controls must work, and public builds must omit development diagnostics. Record exact revision, Actions run and actual results in docs/verification.md, then archive. New auth codes/tokens stay out of repository files.
