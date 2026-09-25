# Home reference layout and practice artwork update

- Removed the trailing period from the displayed app, window, and page name: `Bluebook`.
- Matched the home page container, welcome header, section heading scale, and practice tile proportions to the supplied reference at wide desktop sizes; narrower layouts remain responsive.
- Replaced the practice tiles’ placeholder line icons with the two supplied PNGs, preserving original files and transparency.
- The scheduled-test card markup, styling, editing, and check-in behavior are unchanged.
- Production build, lint, and all five home-page tests passed. Visual comparison in a running desktop app remains a manual check.

# Branding, home density, and form focus update

- Product/window/page name: `Bluebook.`; supplied PNG is the source for the header, favicon, and generated Windows/macOS icons.
- Home typography and spacing are approximately 12% smaller. Test-module layouts and timers are unchanged.
- Dialogs explicitly activate the Tauri window and embedded WebView, then focus an editable control. Clicking a field recovers focus if the document is inactive. This addresses a potential focus-loss cause; the reported Windows typing issue still needs verification on the affected machine.
- System-shortcut suppression remains enabled. Ordinary text entry is not filtered.
- `npm test`: 36 tests passed, including keyboard typing, Cyrillic, spaces, Backspace, paste, and native window/WebView focus ordering. `npm run build` and `npm run lint` passed.

# Your Tests home page update

- Added an editable dashboard at `/`, moved Start Code to `/start-code`, and connected Return home.
- `npm test`: all 33 tests pass, including settings persistence, editable informational dialogs, canceled edits, independent filters, malformed storage, and home/code navigation without an early Firestore write.
- `npm run build` and `npm run lint`: passed.
- Interactive visual verification was not available in this workspace; review the dashboard and scrolling editor in the next desktop build. Branding replacement awaits the chosen app name and icon.

# Windows overlay suppression update

Removed the foreground-process condition from the Windows low-level keyboard hook. Filtering now follows the enabled kiosk session, so a focus change cannot exempt Alt+Tab or Windows keys. Matching releases remain suppressed after modifier release or mode changes. Added event-sequence regression tests to Native checks.

This workspace has no Rust compiler or interactive Windows desktop. Native compilation and event tests run in GitHub Actions; actual absence of Start/Alt+Tab overlays must be checked using `docs/KIOSK.md` on a fresh Windows build.

# Verification

## Readiness, instructions, and native shortcut update

- `npm test`: 29 tests pass, including no transmission before I’m ready, new readiness after name/code edits, failed-write retries, duplicate suppression, reload/reset behavior, the single ready-code entry, and supplied instruction text.
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
