# SAT Practice — Windows, macOS, and web

An independent SAT practice application, built on the existing `atl4sss/bluebook` React project. The same Vite/React/Tailwind frontend runs in a browser and in a Tauri 2 desktop window. It is not an official College Board application.

The supplied Start Code screenshot controls the startup design. Existing question content is retained: 27 + 27 Reading and Writing questions, a 10-minute break, and 22 + 22 Math questions. Test answers, flags, notes, and highlights stay in memory during the open test. Closing/reloading starts over. Only startup session information is sent to Firebase; answers are not uploaded or scored.

## Requirements

- Node.js **22.22.2+ (22 LTS)** or **24.15+ (24 LTS)** and npm. Node 22 is recommended for the Firebase Functions runtime and desktop CI.
- For desktop: current stable Rust installed through [rustup](https://rustup.rs/).
- Windows: Visual Studio Build Tools with **Desktop development with C++**, a Windows SDK, and WebView2.
- macOS: Xcode Command Line Tools (`xcode-select --install`). The app targets macOS 12 or later.
- Firebase setup: a project with Cloud Firestore. No Firebase Authentication, Cloud Functions, or Blaze plan is required.
- Optional emulator checks: Firebase CLI and Java 21 or later (Firebase CLI 14 also runs with Java 17).

See the official [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

## Install and develop

```sh
npm install
```

Copy `.env.example` to `.env.local`, then fill in your Firebase **web app** configuration. On PowerShell use `Copy-Item .env.example .env.local`; on macOS use `cp .env.example .env.local`.

```sh
npm run dev           # Browser frontend at http://127.0.0.1:5173
npm run tauri:dev     # Desktop window; starts Vite automatically
```

Do not run both commands at once: they use the same fixed port. The startup screen renders without Firebase configuration and gives a useful setup error when you submit. It does not fake a successful backend request.

## Build

```sh
npm run build        # TypeScript check + production web assets in dist/
npm run tauri:build  # Native build for the OS you are running on
```

Equivalent Tauri syntax: `npm run tauri -- build`.

### Windows

Run on Windows with the prerequisites installed:

```sh
npm run tauri:build -- --bundles nsis,msi
```

Installers are under `src-tauri/target/release/bundle/nsis/` (`.exe`) and `bundle/msi/` (`.msi`). The executable is under `src-tauri/target/release/`. NSIS installs for the current user by default.

### macOS

Run on a Mac:

```sh
npm run tauri:build -- --bundles app,dmg
```

The `.app` is under `src-tauri/target/release/bundle/macos/`; the `.dmg` is under `bundle/dmg/`. The default build uses the Mac's native architecture. To build a universal Intel + Apple Silicon app:

```sh
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run tauri:build -- --target universal-apple-darwin --bundles app,dmg
```

These are development/unsigned distribution builds unless you configure platform signing. Public macOS distribution needs your Apple signing/notarization setup; Windows reputation/signing uses your certificate. No signing credentials are included. See [macOS signing](https://v2.tauri.app/distribute/sign/macos/) and [Windows signing](https://v2.tauri.app/distribute/sign/windows/).

`.github/workflows/desktop-build.yml` runs native builds on Windows and macOS runners when manually triggered or when a `v*` tag is pushed. Add the `VITE_FIREBASE_*` values as GitHub repository **Actions variables** first. The workflow uploads build artifacts; it does not publish releases or deploy Firebase. It has not been run from this workspace.

## Desktop full-screen mode

Native builds start in fullscreen without window borders or minimize controls. Windows filters common switching shortcuts including Alt+Tab; macOS disables the Command+Tab interface through AppKit. **Ctrl+Alt+Shift+K** (macOS: **Control+Option+Shift+K**) restores a normal window and normal shortcut behavior; the same shortcut re-enters fullscreen. Browser development remains unchanged. Trackpad gestures and Mission Control are not fully restricted. Read [KIOSK.md](docs/KIOSK.md) for recovery, configuration, and system-level limitations.

## Firebase setup

1. Register a web app in your Firebase project and create a Firestore database.
2. Copy the Firebase web configuration into `.env.local` using the keys below.
3. Authenticate your own Firebase CLI with `npx firebase-tools login`.
4. Review the rules against your existing production collections, then deploy only the merged rules:

```sh
npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
```

**Rules migration:** the included rule allows validated creates in `enteredCodes` and denies client reads, updates, and deletes. If the same Firebase project serves another app, merge its existing collection rules before publishing. Deploying this file unchanged can replace rules needed by that app.

### Environment variables

| Variable                            | Value                                                                |
| ----------------------------------- | -------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase web app API key                                             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Project's Firebase auth domain                                       |
| `VITE_FIREBASE_PROJECT_ID`          | Project ID                                                           |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket (no uploads currently)                       |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID; replaces the old `VITE_FIREBASE_SENDER_ID` name |
| `VITE_FIREBASE_APP_ID`              | Firebase web app ID                                                  |
| `VITE_USE_FIREBASE_EMULATORS`       | `false`; `true` only for local development                           |

Vite replaces these values at build time. Restart Vite after changes, and rebuild desktop installers after changing production configuration. Firebase web configuration is public in client bundles. Firestore Security Rules enforce database access. Never add Admin SDK keys, Telegram tokens, or private credentials to a `VITE_` variable.

### Session flow

The student enters and saves their name through Help. The six-digit code is normalized with Unicode NFKC and whitespace removal; leading zeros are retained. Choosing Help → ••• → I’m ready writes directly to Firestore:

```text
enteredCodes/{normalizedName}__{code}__{timestamp}
  name: string
  code: string
  createdAt: Firestore server timestamp
```

The name is remembered locally on that computer. No Firebase account or Cloud Function is required. Firestore rules validate writes and deny client reads, updates, and deletes. Because unauthenticated clients can create validly shaped entries, monitor usage and consider App Check or a server endpoint before broad public distribution.

Entering a code or pressing **Start Test** does not transmit anything. The student first chooses Help → **•••** → **I’m ready**. Only this action sends one entry containing the six-digit code, a server timestamp, and `name: "Готов: <student name>"` (within the existing 80-character limit). It uses the existing session document ID and three-field `enteredCodes` schema; no separate readiness entry or rules change is needed. The in-app session retains the student's original name.

After successful sending, the start page shows **The start code is incorrect.** until the student chooses **Confirm code is correct** in Help after checking with the organizer. A subsequent **Start Test** click opens the test and starts the timer. Changing the code or saved name, clearing the code, or reloading requires new readiness and code confirmation. Failed writes can be retried using **I’m ready**; repeated Start Test clicks never submit or retry a write. Readiness remains under ••• and is disabled until six digits and a saved name are present.

The external receiving integration must forward new `enteredCodes` entries, including their names, for the code and readiness label to reach the same recipient. End-to-end push delivery has not been tested. This is manual coordination, not a shared server countdown. The provided verbal instructions are available from Review the Instructions and Help → Verbal Instructions; their wording does not add process detection or official College Board score handling.

## Local Firebase checks

No production credentials are needed for demo emulators. Use these values in `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-sat-practice.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-sat-practice
VITE_FIREBASE_APP_ID=demo-app
VITE_USE_FIREBASE_EMULATORS=true
```

Then, in a separate terminal:

```sh
npx firebase-tools emulators:start --project demo-sat-practice --only firestore
```

Run `npm run dev` and submit any six-digit code. The emulator UI is at `http://127.0.0.1:4000`. This lets you test writes without touching production data. Production builds ignore the emulator flag.

## Project map and common edits

| Location                                      | Purpose                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `src/main.jsx`, `src/App.jsx`                 | React entry, error boundary, providers, hash routing                      |
| `src/pages/StartCodePage.tsx`                 | Screenshot-based six-digit access form                                    |
| `src/styles/access-code.css`                  | Access-screen measurements, colors, button states                         |
| `src/pages/TestPage.jsx`                      | Test screen composition and UI panel selection                            |
| `src/styles/test.css`                         | Desktop test layout, two independently scrolling reading columns          |
| `src/pages/FinishPage.jsx`                    | Completion screen and restart                                             |
| `src/components/test/`                        | Answers, navigator, math text, reference, basic calculator                |
| `src/components/ui/Modal.tsx`                 | Native HTML dialog with focus restoration and Escape support              |
| `src/hooks/testState.js`, `useTestSession.js` | Test reducer, module transitions, timer                                   |
| `src/data/testStages.js`                      | **Active question sets**, extracted unchanged from the original test page |
| `src/data/*.json`, `loadModule.js`            | Original alternate data files; not the active question source             |
| `src/services/firebase.ts`                    | Lazy Firebase and Firestore initialization                                |
| `src/services/sessionService.ts`              | Name/code validation, Firestore write, retries, error messages             |
| `src/app/`                                    | In-memory session gate                                                    |
| `src-tauri/`                                  | Rust wrapper, windows, permissions, packaging, icons                      |
| `public/fonts/`, `src/assets/`                | Existing fonts and images                                                 |
| `tests/`                                      | Component, state, timer, and Firestore service regressions                 |

To add a screen, create `src/pages/MyPage.tsx` and add a route in `src/App.jsx`. Wrap it with `RequireSession` if it needs a started session. Keep backend operations in `src/services`, and reuse `Modal` for simple dialogs. Hash routes work inside installed Tauri bundles without an HTTP routing server.

To change the UI, start with the matching page and its CSS; the rest of the test logic should rarely need to change. New screenshot states belong in existing components, not duplicate pages. Add inline math as `$x^2$` or `\(x^2\)`, and display math as `$$...$$`; ordinary question text remains text. Keep literal dollar prices outside paired math delimiters.

The calculator is a basic offline calculator with arithmetic, square, and square root, not a Desmos graphing calculator. Highlighting stores one selected passage phrase per question. Module progression is linear practice mode, not adaptive scoring. Existing content has some abbreviated passages and a Math question with three choices; content quality was not silently changed.

## Name, version, icons, and desktop permissions

- App name/title/identifier: `src-tauri/tauri.conf.json`; browser title: `index.html`.
- Version: change `package.json` and the matching Cargo package version in `src-tauri/Cargo.toml`. Tauri reads the displayed/bundled version from `package.json`.
- Icon source: `public/app-icon.png`; regenerate with `npm run icons`. The source is a neutral book icon, not the College Board logo. Replace it with your own asset if desired.
- Window: default 1366×768, minimum 1024×640, normal resizable system window.
- Capabilities: `src-tauri/capabilities/main.json`; no filesystem, shell, or remote webpage permissions. The only application command is read-only `app_info`.
- Content policy: `app.security` in `tauri.conf.json`. Do not disable it to fix a blocked resource; permit only the specific endpoint the feature needs.

## Checks and common issues

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

- **Cargo not found:** install Rust, reopen the terminal, and check `cargo --version`.
- **Windows linker/MSVC error:** install the C++ workload and Windows SDK, then reopen the terminal.
- **macOS compiler error:** install the Xcode command-line tools and complete any Xcode setup required on your Mac.
- **Port 5173 in use:** stop the other Vite instance. Tauri intentionally uses a fixed port.
- **Firebase not configured:** check `.env.local` and restart Vite.
- **Firestore permission denied:** publish or merge the included `enteredCodes` create rule in Firebase Console → Firestore → Rules.
- **Offline:** a new session needs network access. Once started, the local question/test tools do not need Firebase. A failed submission keeps the code for retry.
- **Blank desktop content:** run `npm run build`, confirm `frontendDist` is `../dist`, and check the Tauri dev console for missing assets or CSP violations.
- **Unsigned installer warning:** release signing is a separate owner configuration step, not a frontend bug.
- **Fonts look slightly different:** the app uses the original bundled Myriad Pro for controls and Minion Pro for passages/questions. Only regular font files are supplied, so bold and italic are synthesized. System rasterization, reflections, and photographed-screen colors cannot be matched pixel for pixel.

## Security migration and verification status

The original root `.env` and `functions/.env` were tracked and contained Telegram bot credentials. They were removed from the current tree, and environment files are now ignored. **Revoke/rotate the exposed Telegram bot token. Deleting files does not remove secrets from Git history or existing clones.** If you clean Git history, coordinate with collaborators and still rotate the token first. Firebase web config itself is not an Admin SDK secret.

The desktop app does not contain or deploy Cloud Functions. Existing functions already deployed for the website are not changed by this repository; audit or retire any old public chat deployment separately.

See `docs/VERIFICATION.md` for exactly which checks ran and which environment limitations remain. See `docs/ARCHITECTURE.md` for the short architecture overview.

### Home page and test-card customization

The app opens on **Your Tests**. Click **•••** on the test card (or your profile at the top right) to edit the student name, test name, date/message, optional arrival/door times, school, address, accommodations, status message, check-in button text, overview and checklist content, and optional SAT Score Sends information. Select **Save changes**. Settings are local to this device and survive restarts; they do not change questions or module timing.

**Check In Now / Start Exam Setup** opens Start Code. No code is sent until **Help → ••• → I’m ready**. Return to Home now returns to Your Tests; the existing Clear code action remains available.

To change installed-app branding, set `productName` and the main window `title` in `src-tauri/tauri.conf.json`, update the page title in `index.html`, replace `public/app-icon.png`, and run `npm run icons` before rebuilding. The home-page brand follows the desktop product name. Keep the bundle identifier stable to preserve the installed app’s identity and local settings.
