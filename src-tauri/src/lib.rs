use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;

static LOCKDOWN_ACTIVE: AtomicBool = AtomicBool::new(true);

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

fn apply_window_lockdown(window: &tauri::WebviewWindow, enabled: bool) -> Result<(), String> {
    if enabled {
        window.set_decorations(false).map_err(|e| e.to_string())?;
        window.set_resizable(false).map_err(|e| e.to_string())?;
        window.set_minimizable(false).map_err(|e| e.to_string())?;
        window.set_maximizable(false).map_err(|e| e.to_string())?;
        window.set_closable(false).map_err(|e| e.to_string())?;
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
        window.set_fullscreen(true).map_err(|e| e.to_string())?;
        let _ = window.set_content_protected(true);
        let _ = window.set_focus();
    } else {
        let _ = window.set_content_protected(false);
        window.set_always_on_top(false).map_err(|e| e.to_string())?;
        window.set_closable(true).map_err(|e| e.to_string())?;
        window.set_fullscreen(false).map_err(|e| e.to_string())?;
        window.set_decorations(true).map_err(|e| e.to_string())?;
        window.set_resizable(true).map_err(|e| e.to_string())?;
        window.set_minimizable(true).map_err(|e| e.to_string())?;
        window.set_maximizable(true).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn apply_macos_lockdown(app: &tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let app = app.clone();
    app.run_on_main_thread(move || {
        use objc2::MainThreadMarker;
        use objc2_app_kit::{NSApplication, NSApplicationPresentationOptions as Options};

        let Some(mtm) = MainThreadMarker::new() else {
            return;
        };
        let ns_app = NSApplication::sharedApplication(mtm);

        let options = if enabled {
            Options::FullScreen
                | Options::HideDock
                | Options::HideMenuBar
                | Options::DisableProcessSwitching
                | Options::DisableForceQuit
                | Options::DisableSessionTermination
                | Options::DisableHideApplication
        } else {
            Options::Default
        };

        ns_app.setPresentationOptions(options);
    })
    .map_err(|e| e.to_string())
}

#[cfg(not(target_os = "macos"))]
fn apply_macos_lockdown(_app: &tauri::AppHandle, _enabled: bool) -> Result<(), String> {
    Ok(())
}

#[cfg(target_os = "windows")]
mod windows_lockdown {
    use super::LOCKDOWN_ACTIVE;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::thread;
    use windows_sys::Win32::Foundation::{LPARAM, LRESULT, WPARAM};
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
        VK_ESCAPE, VK_LCONTROL, VK_LMENU, VK_LSHIFT, VK_LWIN, VK_RCONTROL, VK_RMENU, VK_RSHIFT,
        VK_RWIN, VK_SNAPSHOT, VK_TAB,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, DispatchMessageW, GetMessageW, SetWindowsHookExW, TranslateMessage,
        HC_ACTION, KBDLLHOOKSTRUCT, MSG, WH_KEYBOARD_LL, WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN,
        WM_SYSKEYUP,
    };

    static CTRL_DOWN: AtomicBool = AtomicBool::new(false);
    static ALT_DOWN: AtomicBool = AtomicBool::new(false);
    static SHIFT_DOWN: AtomicBool = AtomicBool::new(false);

    const VK_F4_CODE: u32 = 0x73;

    fn set_modifier(vk: u32, down: bool) {
        match vk {
            x if x == VK_LCONTROL as u32 || x == VK_RCONTROL as u32 => {
                CTRL_DOWN.store(down, Ordering::SeqCst);
            }
            x if x == VK_LMENU as u32 || x == VK_RMENU as u32 => {
                ALT_DOWN.store(down, Ordering::SeqCst);
            }
            x if x == VK_LSHIFT as u32 || x == VK_RSHIFT as u32 => {
                SHIFT_DOWN.store(down, Ordering::SeqCst);
            }
            _ => {}
        }
    }

    unsafe extern "system" fn keyboard_hook(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code == HC_ACTION as i32 {
            let info = &*(lparam as *const KBDLLHOOKSTRUCT);
            let vk = info.vkCode;
            let message = wparam as u32;
            let is_down = message == WM_KEYDOWN || message == WM_SYSKEYDOWN;
            let is_up = message == WM_KEYUP || message == WM_SYSKEYUP;

            if is_down {
                set_modifier(vk, true);
            } else if is_up {
                set_modifier(vk, false);
            }

            if LOCKDOWN_ACTIVE.load(Ordering::SeqCst) && is_down {
                let ctrl = CTRL_DOWN.load(Ordering::SeqCst);
                let alt = ALT_DOWN.load(Ordering::SeqCst);
                let shift = SHIFT_DOWN.load(Ordering::SeqCst);

                // Keep Ctrl+Alt+Shift+K available for the app's emergency exit.
                let emergency_combo = ctrl && alt && shift && vk == b'K' as u32;

                if !emergency_combo {
                    let block = vk == VK_LWIN as u32
                        || vk == VK_RWIN as u32
                        || vk == VK_SNAPSHOT as u32
                        || (vk == VK_TAB as u32 && alt)
                        || (vk == VK_ESCAPE as u32 && alt)
                        || (vk == VK_ESCAPE as u32 && ctrl)
                        || (vk == VK_F4_CODE && alt);

                    if block {
                        return 1;
                    }
                }
            }
        }

        CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
    }

    pub fn install() {
        thread::spawn(|| unsafe {
            let hook = SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(keyboard_hook),
                std::ptr::null_mut(),
                0,
            );

            if hook.is_null() {
                return;
            }

            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        });
    }
}

#[cfg(not(target_os = "windows"))]
mod windows_lockdown {
    pub fn install() {}
}

fn set_lockdown(
    window: &tauri::WebviewWindow,
    state: &tauri::State<KioskState>,
    enabled: bool,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("Only the main window can change lockdown mode.".into());
    }

    // Release guards before changing UI state so a platform failure never
    // leaves the user permanently trapped.
    state.inner().0.store(false, Ordering::SeqCst);
    LOCKDOWN_ACTIVE.store(false, Ordering::SeqCst);

    if let Err(error) = apply_window_lockdown(window, enabled) {
        let _ = apply_macos_lockdown(window.app_handle(), false);
        let _ = apply_window_lockdown(window, false);
        return Err(error);
    }

    if let Err(error) = apply_macos_lockdown(window.app_handle(), enabled) {
        let _ = apply_window_lockdown(window, false);
        return Err(error);
    }

    LOCKDOWN_ACTIVE.store(enabled, Ordering::SeqCst);
    state.inner().0.store(enabled, Ordering::SeqCst);
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .manage(KioskState(AtomicBool::new(true)))
        .setup(|app| {
            windows_lockdown::install();
            LOCKDOWN_ACTIVE.store(true, Ordering::SeqCst);

            apply_macos_lockdown(app.handle(), true)?;

            if let Some(window) = app.get_webview_window("main") {
                apply_window_lockdown(&window, true)?;
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() != "main" {
                return;
            }

            let locked = window
                .state::<KioskState>()
                .inner()
                .0
                .load(Ordering::SeqCst);

            match event {
                tauri::WindowEvent::CloseRequested { api, .. } if locked => {
                    api.prevent_close();
                }
                tauri::WindowEvent::Focused(false) if locked => {
                    let _ = window.set_always_on_top(true);
                    let _ = window.set_fullscreen(true);
                    let _ = window.set_focus();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![app_info, toggle_kiosk])
        .run(tauri::generate_context!())
        .expect("Unable to start SAT Practice");
}

#[tauri::command]
fn toggle_kiosk(
    window: tauri::WebviewWindow,
    state: tauri::State<KioskState>,
) -> Result<bool, String> {
    let enabled = !state.inner().0.load(Ordering::SeqCst);
    set_lockdown(&window, &state, enabled)?;
    Ok(enabled)
}
