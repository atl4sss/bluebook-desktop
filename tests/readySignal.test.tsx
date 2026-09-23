import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import ReadySignal from "../src/components/ReadySignal";
import { sendReadySignal } from "../src/services/sessionService";

vi.mock("../src/services/sessionService", () => ({ sendReadySignal: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
const session = { sessionId: "test-ready", name: "Student" };

it("hides readiness under additional options and disables duplicate sends", async () => {
  let finish!: () => void;
  vi.mocked(sendReadySignal).mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  const { container } = render(<ReadySignal session={session} code="001234" />);
  expect(container.querySelector("details")).not.toHaveAttribute("open");
  fireEvent.click(screen.getByLabelText("Additional help options"));
  fireEvent.click(screen.getByRole("button", { name: "I’m ready" }));
  expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  expect(sendReadySignal).toHaveBeenCalledExactlyOnceWith(session, "001234");
  finish();
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Readiness recorded.",
  );
  expect(screen.getByRole("button", { name: "Readiness sent" })).toBeDisabled();
});

it("shows a failed send and lets the student retry", async () => {
  vi.mocked(sendReadySignal)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(undefined);
  render(<ReadySignal session={session} code="123456" />);
  fireEvent.click(screen.getByLabelText("Additional help options"));
  fireEvent.click(screen.getByRole("button", { name: "I’m ready" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not send readiness",
  );
  fireEvent.click(screen.getByRole("button", { name: "I’m ready" }));
  expect(await screen.findByRole("status")).toBeVisible();
});
