import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrentWebview } from "@tauri-apps/api/webview";

// Always-on-top does not imply keyboard focus. Activate both the native window
// and its embedded WebView before focusing a form control.
export async function focusWindow(): Promise<void> {
  if (!isTauri()) return;
  await getCurrentWindow().setFocus();
  await getCurrentWebview().setFocus();
}
