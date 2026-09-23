// Native presentation controls. No input is recorded or transmitted.
// Windows filtering applies only while this process owns the foreground window.
#[cfg(target_os = "windows")]
mod platform {
    use std::sync::{atomic::{AtomicBool, Ordering}, mpsc, OnceLock};
    use windows_sys::Win32::{
        Foundation::{LPARAM, LRESULT, WPARAM},
        System::{LibraryLoader::GetModuleHandleW, Threading::GetCurrentProcessId},
        UI::{Input::KeyboardAndMouse::GetAsyncKeyState, WindowsAndMessaging::*},
    };

    static ENABLED: AtomicBool = AtomicBool::new(false);
    static HOOK: OnceLock<Result<(), String>> = OnceLock::new();

    unsafe extern "system" fn keyboard_hook(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code >= 0 && ENABLED.load(Ordering::Relaxed) {
            let mut foreground_pid = 0;
            GetWindowThreadProcessId(GetForegroundWindow(), &mut foreground_pid);
            if foreground_pid == GetCurrentProcessId() {
                let key = &*(lparam as *const KBDLLHOOKSTRUCT);
                let alt = key.flags & LLKHF_ALTDOWN != 0;
                let ctrl = GetAsyncKeyState(0x11) < 0;
                let shift = GetAsyncKeyState(0x10) < 0;
                // Win, Alt+Tab/Esc/F4/Space/F6, Ctrl+Esc. Keep Ctrl+Shift+Esc
                // and Ctrl+Alt+Shift+K available for recovery.
                let blocked = matches!(key.vkCode, 0x5B | 0x5C)
                    || (alt && matches!(key.vkCode, 0x09 | 0x1B | 0x73 | 0x20 | 0x75))
                    || (ctrl && !shift && key.vkCode == 0x1B);
                if blocked { return 1; }
            }
        }
        CallNextHookEx(std::ptr::null_mut(), code, wparam, lparam)
    }

    pub fn set_enabled(enabled: bool) -> Result<(), String> {
        if enabled {
            HOOK.get_or_init(|| {
                let (sender, receiver) = mpsc::sync_channel(1);
                std::thread::Builder::new().name("kiosk-shortcuts".into()).spawn(move || unsafe {
                    let hook = SetWindowsHookExW(WH_KEYBOARD_LL, Some(keyboard_hook), GetModuleHandleW(std::ptr::null()), 0);
                    if hook.is_null() {
                        let _ = sender.send(Err(std::io::Error::last_os_error().to_string()));
                        return;
                    }
                    if sender.send(Ok(())).is_err() {
                        UnhookWindowsHookEx(hook);
                        return;
                    }
                    let mut message = std::mem::zeroed();
                    while GetMessageW(&mut message, std::ptr::null_mut(), 0, 0) > 0 {
                        TranslateMessage(&message);
                        DispatchMessageW(&message);
                    }
                    ENABLED.store(false, Ordering::Relaxed);
                    UnhookWindowsHookEx(hook);
                }).map_err(|error| error.to_string())?;
                receiver.recv_timeout(std::time::Duration::from_secs(5)).map_err(|error| error.to_string())?
            }).clone()?;
        }
        ENABLED.store(enabled, Ordering::Relaxed);
        Ok(())
    }
}

#[cfg(target_os = "macos")]
mod platform {
    use objc2::MainThreadMarker;
    use objc2_app_kit::{NSApplication, NSApplicationPresentationOptions as Options};
    use std::sync::Mutex;

    static ORIGINAL: Mutex<Option<Options>> = Mutex::new(None);

    // Tauri synchronous commands and window events run on the main thread.
    pub fn set_enabled(enabled: bool) -> Result<(), String> {
        let mtm = MainThreadMarker::new().ok_or("Presentation changes require the main thread")?;
        let app = NSApplication::sharedApplication(mtm);
        let mut original = ORIGINAL.lock().map_err(|error| error.to_string())?;
        if enabled {
            let current = app.presentationOptions();
            original.get_or_insert(current);
            // Hide and AutoHide are mutually exclusive. Keep FullScreen and
            // other flags that AppKit owns during fullscreen transitions.
            let options = (current & !(Options::AutoHideDock | Options::AutoHideMenuBar | Options::AutoHideToolbar))
                | Options::HideDock | Options::HideMenuBar
                | Options::DisableProcessSwitching | Options::DisableHideApplication;
            app.setPresentationOptions(options);
        } else if let Some(options) = original.take() {
            app.setPresentationOptions(options);
        }
        Ok(())
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
mod platform {
    pub fn set_enabled(_enabled: bool) -> Result<(), String> { Ok(()) }
}

pub use platform::set_enabled;
