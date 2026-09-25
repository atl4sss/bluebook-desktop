import { beforeEach, expect, it, vi } from "vitest";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { focusWindow } from "../src/services/focusWindow";

vi.mock("@tauri-apps/api/core", () => ({ isTauri: vi.fn() }));
vi.mock("@tauri-apps/api/window", () => ({ getCurrentWindow: vi.fn() }));
vi.mock("@tauri-apps/api/webview", () => ({ getCurrentWebview: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

it("does not request native focus in the browser", async () => {
  vi.mocked(isTauri).mockReturnValue(false);
  await focusWindow();
  expect(getCurrentWindow).not.toHaveBeenCalled();
  expect(getCurrentWebview).not.toHaveBeenCalled();
});

it("focuses the embedded WebView only after the native window is activated", async () => {
  vi.mocked(isTauri).mockReturnValue(true);
  const calls: string[] = [];
  const windowFocus = vi.fn(async () => {
    calls.push("window");
  });
  const webviewFocus = vi.fn(async () => {
    calls.push("webview");
  });
  vi.mocked(getCurrentWindow).mockReturnValue({
    setFocus: windowFocus,
  } as unknown as ReturnType<typeof getCurrentWindow>);
  vi.mocked(getCurrentWebview).mockReturnValue({
    setFocus: webviewFocus,
  } as unknown as ReturnType<typeof getCurrentWebview>);
  await focusWindow();
  expect(calls).toEqual(["window", "webview"]);
});
