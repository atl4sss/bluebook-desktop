import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ReadySignal from "../src/components/ReadySignal";
it("keeps readiness hidden until additional options are opened", () => {
  const onReady = vi.fn();
  const { container, rerender } = render(
    <ReadySignal
      disabled={false}
      sending={false}
      sent={false}
      error=""
      onReady={onReady}
    />,
  );
  expect(container.querySelector("details")).not.toHaveAttribute("open");
  fireEvent.click(screen.getByLabelText("Additional help options"));
  expect(onReady).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "I’m ready" }));
  expect(onReady).toHaveBeenCalledTimes(1);
  rerender(
    <ReadySignal
      disabled={false}
      sending={false}
      sent={true}
      error=""
      onReady={onReady}
    />,
  );
  expect(screen.getByRole("button", { name: "Code sent" })).toBeDisabled();
});
