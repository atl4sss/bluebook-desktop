// Native presentation controls. No input is recorded or transmitted.
// Windows filtering lasts for the kiosk session, including focus transitions.
#[cfg(target_os = "windows")]
#[path = "windows_shortcut_filter.rs"]
mod windows_shortcut_filter;

#[cfg(target_os = "windows")]
mod platform {
    use super::windows_shortcut_filter::ShortcutFilter;
    use std::cell::RefCell;
    use std::sync::{atomic::{AtomicBool, Ordering}, mpsc, OnceLock};
    use windows_sys::Win32::{
        Foundation::{LPARAM, LRESULT, WPARAM},
        System::LibraryLoader::GetModuleHandleW,
        UI::{Input::KeyboardAndMouse::GetAsyncKeyState, WindowsAndMessaging::*},
    };

    static ENABLED: AtomicBool = AtomicBool::new(false);
    static HOOK: OnceLock<Result<(), String>> = OnceLock::new();

    thread_local! {
        static FILTER: RefCell<ShortcutFilter> = RefCell::new(ShortcutFilter::new());
    }

    unsafe extern "system" fn keyboard_hook(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code == HC_ACTION as i32 {
            let key = &*(lparam as *const KBDLLHOOKSTRUCT);
            // Do not gate this on foreground PID: the app can remain visible
            // (always-on-top) while another window owns keyboard focus. Letting
            // that event through allows Explorer to draw Start/the switcher.
            let blocked = FILTER.with(|filter| filter.borrow_mut().should_block(
                ENABLED.load(Ordering::Relaxed),
                key.vkCode,
                key.flags & LLKHF_UP != 0,
                key.flags & LLKHF_ALTDOWN != 0,
                GetAsyncKeyState(0x11) < 0,
                GetAsyncKeyState(0x10) < 0,
            ));
            if blocked { return 1; }
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
