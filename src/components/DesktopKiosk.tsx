import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

export default function DesktopKiosk() {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isTauri()) return;
    let pending = false;
    let mounted = true;
    async function onKeyDown(event: KeyboardEvent) {
      if (
        event.ctrlKey &&
        event.altKey &&
        event.shiftKey &&
        event.code === "KeyK"
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (pending || event.repeat) return;
        pending = true;
        try {
          await invoke<boolean>("toggle_kiosk");
          if (mounted) setError("");
        } catch {
          if (mounted)
            setError(
              "Could not change full-screen mode. Try Ctrl+Alt+Shift+K again.",
            );
        } finally {
          pending = false;
        }
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      mounted = false;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return error ? (
    <div role="alert" className="kiosk-error">
      {error}
    </div>
  ) : null;
}
