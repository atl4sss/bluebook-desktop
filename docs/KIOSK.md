# Full-screen desktop mode

The Windows/macOS desktop app now starts in native fullscreen with no decorations, resizing, minimizing, or maximizing controls. It requests always-on-top display. Normal close requests are rejected while kiosk mode is active. The effect on system taskbar/Dock overlays must be tested on the target OS.

## Exit and recovery

Press **Ctrl+Alt+Shift+K** while the app has keyboard focus to return to a normal window without losing test progress. On macOS use **Control+Option+Shift+K**. The same shortcut returns to fullscreen. This is a documented convenience shortcut, not an administrator password or security boundary. After leaving fullscreen you can minimize or close the app normally. Closing the app ends the current practice session.

If the UI stops responding, the operating system's Task Manager or Force Quit remains available. Restarting the app restores full-screen mode. No system keyboard hooks, registry changes, process termination, or persistent machine policies are installed.

`npm run dev` stays a normal browser page. `npm run tauri:dev` and native builds use the full-screen window settings. Configuration lives in `src-tauri/tauri.conf.json`; the close guard and mode command live in `src-tauri/src/lib.rs`; the keyboard listener lives in `src/components/DesktopKiosk.tsx`.

## Scope

This is application-level kiosk presentation, not a secure exam browser. Alt+Tab, the Windows key, Ctrl+Alt+Delete, Command+Tab, Mission Control, other monitors, OS menus, and system gestures are not guaranteed to be blocked. Always-on-top does not disable app switching or secure system screens.

For institution-owned Windows devices, OS lockdown requires a separate administrator-managed configuration. Microsoft Shell Launcher can replace Explorer for a dedicated kiosk account, but alone does not block other applications; additional policy is needed. It is supported by specified Enterprise, Education, and IoT Enterprise editions. See [Microsoft Shell Launcher](https://learn.microsoft.com/en-us/windows/configuration/shell-launcher/). A macOS deployment likewise needs a separately chosen and tested managed-device/exam solution. This repository does not apply those policies.

Native packaging and these window behaviors were not tested in the Linux editing workspace because Rust/Cargo is unavailable. Test on Windows and macOS before distribution, especially fullscreen transitions, closing, taskbar/Dock behavior, multiple monitors, and the recovery shortcut.
