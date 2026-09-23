# Full-screen desktop mode

The Windows/macOS desktop app now starts in native fullscreen with no decorations, resizing, minimizing, or maximizing controls. It requests always-on-top display. Normal close requests are rejected while kiosk mode is active. The effect on system taskbar/Dock overlays must be tested on the target OS.

## Exit and recovery

Press **Ctrl+Alt+Shift+K** while the app has keyboard focus to return to a normal window without losing test progress. On macOS use **Control+Option+Shift+K**. The same shortcut returns to fullscreen. This is a documented convenience shortcut, not an administrator password or security boundary. After leaving fullscreen you can minimize or close the app normally. Closing the app ends the current practice session.

If the UI stops responding, the operating system's Task Manager or Force Quit remains available. Restarting the app restores full-screen mode. Windows uses a process-lifetime low-level keyboard hook; it only filters shortcuts while kiosk mode is enabled and this process owns the foreground window. It does not record or send keystrokes. No registry changes, process termination, or persistent machine policies are installed.

`npm run dev` stays a normal browser page. `npm run tauri:dev` and native builds use the full-screen window settings. Configuration lives in `src-tauri/tauri.conf.json`; the close guard and mode command live in `src-tauri/src/lib.rs`; the keyboard listener lives in `src/components/DesktopKiosk.tsx`.

## Scope

Native shortcut controls live in `src-tauri/src/kiosk_shortcuts.rs`:

- Windows filters Alt+Tab (including Alt+Shift+Tab), Alt+Esc, Alt+F4, Alt+Space, Alt+F6, Ctrl+Esc, and both Windows keys before the switcher receives them. Ctrl+Shift+Esc and Ctrl+Alt+Delete remain available for recovery. The hook runs on a dedicated message-loop thread. Leaving kiosk mode disables filtering immediately; closing the process removes the hook.
- macOS uses AppKit presentation options to hide the Dock/menu bar, disable the Command+Tab process-switching interface, and disable application hiding. Original presentation options are restored when leaving kiosk mode. Force Quit is left available. Presentation flags are reapplied after window focus/fullscreen size changes.
- Browser mode has no OS shortcut filtering. Linux has fullscreen presentation only.

These controls are not a complete secure exam browser. Trackpad gestures, Mission Control/Spaces, other monitors, secure system screens, and third-party global shortcuts are not comprehensively blocked. Complete macOS assessment restrictions require Apple's Automatic Assessment Configuration entitlement and a separately implemented assessment session: https://developer.apple.com/documentation/automaticassessmentconfiguration . This project does not request or claim that entitlement. A normal fullscreen window cannot guarantee suppression of all gesture overlays.

For institution-owned Windows devices, OS lockdown requires a separate administrator-managed configuration. Microsoft Shell Launcher can replace Explorer for a dedicated kiosk account, but alone does not block other applications; additional policy is needed. It is supported by specified Enterprise, Education, and IoT Enterprise editions. See [Microsoft Shell Launcher](https://learn.microsoft.com/en-us/windows/configuration/shell-launcher/). A macOS deployment likewise needs a separately chosen and tested managed-device/exam solution. This repository does not apply those policies.

GitHub Actions Native checks passed `cargo check --locked` on Windows and macOS for commit `99de4b3`. Installer packaging and live window behavior remain unverified. Before distribution, build on both Windows and macOS and verify shortcut suppression, fullscreen transitions, closing, taskbar/Dock behavior, and multiple monitors. Specifically verify that Ctrl+Alt+Shift+K restores normal switching, and that switching remains normal after closing the app. macOS trackpad/Mission Control restrictions remain an explicit limitation, not a passed check.
