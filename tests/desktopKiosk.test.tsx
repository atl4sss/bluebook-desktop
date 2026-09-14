import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { invoke, isTauri } from "@tauri-apps/api/core";
import DesktopKiosk from "../src/components/DesktopKiosk";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn(), isTauri: vi.fn() }));
const shortcut = { code: "KeyK", ctrlKey: true, altKey: true, shiftKey: true };
beforeEach(() => vi.resetAllMocks());

it("does not invoke desktop commands in browser development", () => {
  vi.mocked(isTauri).mockReturnValue(false);
  render(<DesktopKiosk />);
  fireEvent.keyDown(window, shortcut);
  expect(invoke).not.toHaveBeenCalled();
});

it("allows the recovery shortcut but ignores partial and repeated keys", async () => {
  vi.mocked(isTauri).mockReturnValue(true);
  vi.mocked(invoke).mockResolvedValue(false);
  const view = render(<DesktopKiosk />);
  fireEvent.keyDown(window, { ...shortcut, shiftKey: false });
  fireEvent.keyDown(window, { ...shortcut, repeat: true });
  expect(invoke).not.toHaveBeenCalled();
  fireEvent.keyDown(window, shortcut);
  await waitFor(() =>
    expect(invoke).toHaveBeenCalledExactlyOnceWith("toggle_kiosk"),
  );
  view.unmount();
  fireEvent.keyDown(window, shortcut);
  expect(invoke).toHaveBeenCalledTimes(1);
});

it("shows a recoverable error when native mode changes fail", async () => {
  vi.mocked(isTauri).mockReturnValue(true);
  vi.mocked(invoke).mockRejectedValueOnce(new Error("native failure"));
  render(<DesktopKiosk />);
  fireEvent.keyDown(window, shortcut);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not change full-screen mode",
  );
  vi.mocked(invoke).mockResolvedValue(false);
  fireEvent.keyDown(window, shortcut);
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});
