use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;
mod kiosk_shortcuts;

struct KioskState(AtomicBool);

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppInfo {
    platform: &'static str,
    app_version: String,
}

#[tauri::command]
fn app_info(app: tauri::AppHandle) -> AppInfo {
    AppInfo {
        platform: std::env::consts::OS,
        app_version: app.package_info().version.to_string(),
    }
}

pub fn run() {
    tauri::Builder::default()
        .manage(KioskState(AtomicBool::new(true)))
        .setup(|_| {
            kiosk_shortcuts::set_enabled(true).map_err(std::io::Error::other)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "main" {
                // AppKit can adjust presentation flags during fullscreen transitions.
                #[cfg(target_os = "macos")]
                if matches!(event, tauri::WindowEvent::Resized(_) | tauri::WindowEvent::Focused(true))
                    && window.state::<KioskState>().inner().0.load(Ordering::SeqCst)
                {
                    if let Err(error) = kiosk_shortcuts::set_enabled(true) {
                        eprintln!("Could not restore kiosk presentation: {error}");
                    }
                }
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    if window.state::<KioskState>().inner().0.load(Ordering::SeqCst) {
                        api.prevent_close();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![app_info, toggle_kiosk])
        .run(tauri::generate_context!())
        .expect("Unable to start Bluebook.");
}
// A local window mode, not an OS-level security boundary.
#[tauri::command]
fn toggle_kiosk(window: tauri::WebviewWindow, state: tauri::State<KioskState>) -> Result<bool, String> {
    if window.label() != "main" {
        return Err("Only the main window can change presentation mode.".into());
    }
    let enabled = !state.inner().0.load(Ordering::SeqCst);
    // Always release the close guard first, so a partial failure stays recoverable.
    state.inner().0.store(false, Ordering::SeqCst);
    kiosk_shortcuts::set_enabled(false)?;
    let apply = || -> tauri::Result<()> {
        if !enabled {
            window.set_always_on_top(false)?;
            window.set_closable(true)?;
            window.set_fullscreen(false)?;
            window.set_decorations(true)?;
            window.set_resizable(true)?;
            window.set_minimizable(true)?;
            window.set_maximizable(true)?;
        } else {
            window.set_decorations(false)?;
            window.set_resizable(false)?;
            window.set_minimizable(false)?;
            window.set_maximizable(false)?;
            window.set_closable(false)?;
            window.set_always_on_top(true)?;
            window.set_fullscreen(true)?;
        }
        Ok(())
    };
    if let Err(error) = apply() {
        let _ = window.set_always_on_top(false);
        let _ = window.set_closable(true);
        let _ = window.set_fullscreen(false);
        let _ = window.set_decorations(true);
        let _ = window.set_resizable(true);
        let _ = window.set_minimizable(true);
        let _ = window.set_maximizable(true);
        return Err(error.to_string());
    }
    if let Err(error) = kiosk_shortcuts::set_enabled(enabled) {
        let _ = kiosk_shortcuts::set_enabled(false);
        let _ = window.set_always_on_top(false);
        let _ = window.set_closable(true);
        let _ = window.set_fullscreen(false);
        let _ = window.set_decorations(true);
        let _ = window.set_resizable(true);
        let _ = window.set_minimizable(true);
        let _ = window.set_maximizable(true);
        return Err(error);
    }
    state.inner().0.store(enabled, Ordering::SeqCst);
    Ok(enabled)
}
