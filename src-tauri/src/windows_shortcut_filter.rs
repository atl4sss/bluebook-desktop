// Only tracks which suppressed keys still need their matching release swallowed.
// No text, timestamps, or input history is retained.
pub struct ShortcutFilter {
    suppressed: [bool; 256],
}

impl ShortcutFilter {
    pub const fn new() -> Self {
        Self { suppressed: [false; 256] }
    }

    pub fn should_block(
        &mut self,
        enabled: bool,
        key: u32,
        key_up: bool,
        alt: bool,
        ctrl: bool,
        shift: bool,
    ) -> bool {
        let Some(held) = self.suppressed.get_mut(key as usize) else {
            return false;
        };
        // Match a blocked down/repeat with its up even if Alt was released first,
        // focus changed, or kiosk mode was disabled while the key was held.
        let blocked = *held || (enabled && (
            matches!(key, 0x5B | 0x5C)
                || (alt && matches!(key, 0x09 | 0x1B | 0x73 | 0x20 | 0x75))
                || (ctrl && !shift && key == 0x1B)
        ));
        *held = blocked && !key_up;
        blocked
    }
}

#[cfg(test)]
mod tests {
    use super::ShortcutFilter;

    #[test]
    fn suppresses_switcher_combinations_and_both_windows_keys() {
        for shift in [false, true] {
            for key in [0x09, 0x1B, 0x73, 0x20, 0x75] {
                let mut filter = ShortcutFilter::new();
                assert!(filter.should_block(true, key, false, true, false, shift));
                assert!(filter.should_block(true, key, true, true, false, shift));
            }
        }
        for key in [0x5B, 0x5C] {
            let mut filter = ShortcutFilter::new();
            assert!(filter.should_block(true, key, false, false, false, false));
            assert!(filter.should_block(true, key, true, false, false, false));
            // A release of a Win key held before activation must not open Start.
            assert!(filter.should_block(true, key, true, false, false, false));
        }
        assert!(ShortcutFilter::new().should_block(true, 0x1B, false, false, true, false));
    }

    #[test]
    fn suppression_survives_modifier_release_repeats_and_mode_exit() {
        let mut filter = ShortcutFilter::new();
        assert!(filter.should_block(true, 0x09, false, true, false, false));
        assert!(filter.should_block(true, 0x09, false, true, false, false));
        assert!(filter.should_block(false, 0x09, true, false, false, false));
        assert!(!filter.should_block(false, 0x09, false, true, false, false));
        assert!(!filter.should_block(false, 0x09, true, true, false, false));
        assert!(!filter.should_block(true, 0x09, false, false, false, false));
    }

    #[test]
    fn normal_typing_navigation_and_recovery_stay_available() {
        let mut filter = ShortcutFilter::new();
        for key in [0x09, 0x1B, 0x20, 0x41, 0x4B, 0x25, 0x0D] {
            assert!(!filter.should_block(true, key, false, false, false, false));
            assert!(!filter.should_block(true, key, true, false, false, false));
        }
        // Ctrl+Shift+Esc (Task Manager), Ctrl+Alt+Shift+K (window recovery).
        assert!(!filter.should_block(true, 0x1B, false, false, true, true));
        assert!(!filter.should_block(true, 0x4B, false, true, true, true));
    }

    #[test]
    fn shortcuts_work_normally_outside_kiosk_mode() {
        let mut filter = ShortcutFilter::new();
        for key in [0x5B, 0x5C, 0x09, 0x1B, 0x73, 0x20, 0x75] {
            assert!(!filter.should_block(false, key, false, true, true, false));
            assert!(!filter.should_block(false, key, true, true, true, false));
        }
    }
}
