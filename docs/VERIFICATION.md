# Verification

## Readiness, instructions, and native shortcut update

- `npm test`: 29 tests pass, including readiness channel/schema, repeated sends, retry after failure, hidden Help options, and supplied instruction text.
- `npm run lint` and `npm run build`: pass.
- Readiness uses the existing `enteredCodes` schema and rules; no production message was sent during testing. Actual push delivery depends on the external notification integration.
- GitHub Actions Native checks passed on Windows and macOS for commit `99de4b3`: web production build and `cargo check --locked` both succeed. Run: https://github.com/atl4sss/bluebook-desktop/actions/runs/35883807060 . This verifies native compilation/type checking, not installer packaging or live shortcut behavior. Run Desktop builds and the manual checks in KIOSK.md before distribution.
- macOS gesture/Mission Control lockdown is not implemented; it requires a separately provisioned assessment mode.

Verified in the source workspace:

- `npm run build`: TypeScript and the Vite production build pass.
- `npm run lint`: ESLint passes.
- `npm test`: all 22 component, state, timer, Firestore service, and desktop shortcut tests pass. Native window calls in the shortcut tests are mocked.
- The service writes only `name`, six-digit `code`, and a Firestore server timestamp to `enteredCodes`.
- The Tauri CSP permits the production Firestore endpoint and the local Firestore emulator.

The production Firebase project was not modified from this workspace. The owner must merge and publish the `enteredCodes` create rule without replacing rules required by the existing website. Native installers must still be built on their target operating systems.

## Reference interface update

The supplied images were inspected directly. Typography reuses the original Myriad Pro and Minion Pro font files, with shared CSS variables. Reading/Writing uses two equal columns and independent scrolling. Math student responses use a directions/examples column, compact entry field, and fraction preview. Break styling uses a dark two-column layout with the student name at the bottom. Existing automatic break advancement and the manual resume action are retained; the on-screen explanation reflects that behavior.

The local browser preview was attempted but blocked by the environment (`ERR_BLOCKED_BY_CLIENT`). Pixel comparison, live font rendering, and OS-specific layout remain unverified. No screenshot-perfect claim is made.

## Full-screen mode

The desktop shortcut tests cover browser-mode isolation, the recovery key combination, ignored repeated/partial keys, listener cleanup, and native command errors. `npm run tauri:build -- --no-bundle` could not start because Cargo is missing. Rust compilation, full-screen taskbar/Dock behavior, close-request handling, and recovery must be verified on Windows and macOS. See `KIOSK.md` for system-lockdown limitations.
