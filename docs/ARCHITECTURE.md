# Architecture

## Entry and routes

`main.jsx` mounts `App.jsx` under React StrictMode. `App` wraps the router in an error boundary and an in-memory `SessionProvider`. Hash routing works with both Vite and Tauri's packaged custom protocol. `/` is the editable Your Tests dashboard; `/start-code` is the access screen; `/test` and `/finish` require a started session. Unknown paths return to `/`. The finish page also needs completion information from the test screen.

The route gate is user-flow state, not an authorization boundary. Firestore Security Rules control database access. Reloading clears the in-memory test session and progress intentionally; offline disk recovery is not implemented.

## Home and test-card settings

`HomePage.tsx` provides the welcome header, Your Tests card, independent Active/Past filters, and Practice and Prepare tiles. The profile button and card’s ••• button open the editor. `testCardSettings.ts` loads validated field types from `sat-practice-test-card-v1`; the student name shares `sat-practice-name` with the start-code Help dialog. Saving settings only writes local storage. Displayed test name, schedule, location, accommodations, status, check-in label, overview, checklist, and optional score-sends information are editable. This metadata does not change the SAT question bank, durations, or send scores.

The check-in and full-length practice buttons navigate to `/start-code` without creating a session or transmitting a code. Return home clears the code screen’s transient readiness state. Past tabs show an honest empty state because completed-session history is not persisted. The header uses the desktop product name from `tauri.conf.json` and the existing `public/app-icon.svg` asset.

## Firebase and startup

`services/firebase.ts` lazily initializes Firebase and Cloud Firestore. Configuration errors stay recoverable on the form. It connects to the local Firestore emulator only when Vite is in development mode and the emulator flag is set.

`sessionService.ts` normalizes and validates the student's name and six-digit code, then creates an `enteredCodes` document directly with `serverTimestamp()` only after the student chooses I’m ready. The single entry includes a readiness prefix in the name; the returned in-app session keeps the original name. The document ID follows `normalized_name__code__local_timestamp`, matching the existing website's collection. It allows one in-flight request and reuses the document ID on retry. The Help dialog stores the name locally for later starts.

No Firebase Authentication or Cloud Function is used. Rules allow only strictly shaped creates in `enteredCodes`; clients cannot list, read, update, or delete these records. Because creation is public, the collection should be monitored for abuse before broad distribution.

This is code registration, not an allowlist-based access-control system. All valid six-digit codes are accepted. No exam answers are transmitted.

`StartCodePage` keeps unsent digits local. Start Test never performs a write. Help → ••• → I’m ready invokes `createSession` and then retains the submitted code, returned session, and a confirmation flag locally. `ReadySignal` is controlled by the parent so closing/reopening Help cannot reset a pending or successful submission. A successful write leaves the session provider empty and displays the requested incorrect-code message. Help can confirm a successfully submitted code; confirmation itself does not navigate. A subsequent Start Test click activates the session and opens `/test`, where the timer is initialized. Editing the code, changing the saved name, or clearing the code discards registration and confirmation. Name/code edits are disabled during the write. Confirmation does not persist across reloads, and no server-synchronized start time is implemented.

## SAT state and components

`data/testStages.js` contains the original active question banks, unchanged, and linear stage order: RW1 → RW2 → break → Math1 → Math2. The separate original JSON banks remain available but unused.

`hooks/testState.js` is a pure reducer. Keys are `stageIndex-questionIndex`, so answer, review, note, highlight, and elimination state cannot collide across modules. `useTestSession.js` owns the reducer and deadline clock. Review does not pause time. Background time is carried across expired stages. Manual advancement requires a confirmation dialog, resets the next deadline, and never permits returning to a completed module.

`TestPage` composes `AnswerOption`, `QuestionNavigator`, `RichText` (KaTeX), `MathReferenceFloating`, and `CalculatorPanel`. Presentation lives in dedicated CSS; no global state library is needed. `Modal` uses the browser's native dialog behavior for focus trapping/Escape and restores focus on close. Reading columns scroll independently within a fixed desktop header/footer.

`BreakScreen` renders the dark timer/instructions layout. `StudentResponse` contains the Math directions table and fraction preview. Shared font tokens live in `index.css`; dimensions, answer styles, and break layout live in `styles/test.css`. The student's name comes from the same in-memory session created on the start page and appears in both test and break footers.

Finish navigation carries answered/total counts. It does not claim successful cloud answer submission or fabricate a score. The active question content lacks a complete validated answer key.

## Tauri boundary

`src-tauri/src/main.rs` starts the library builder. Rust embeds the same `dist` generated by Vite. `lib.rs` provides app metadata, the local `toggle_kiosk` command, and a close-request guard while kiosk presentation is active. `DesktopKiosk.tsx` handles the recovery shortcut only in Tauri; browser mode registers no listener. No Node.js process or Electron runtime ships with the app. The main window has no filesystem, shell, or remote-content capabilities. CSP restricts scripts to packaged assets and connections to Firestore and Tauri IPC.

`tauri.conf.json` sets identity, window sizes, build hooks, icons, and package targets. `Cargo.toml` contains native dependencies. The desktop CI builds on each native OS and uploads unsigned artifacts. Signing, Firebase deployment, and production environment values belong to the project owner.
