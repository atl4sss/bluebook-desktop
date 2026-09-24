import userEvent from "@testing-library/user-event";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import StartCodePage from "../src/pages/StartCodePage";
import SessionProvider from "../src/app/SessionProvider";
import { verbalInstructions } from "../src/data/verbalInstructions";
import {
  createSession,
  validateAccessCode,
  type Session,
} from "../src/services/sessionService";
vi.mock("../src/services/sessionService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/services/sessionService")>()),
  createSession: vi.fn(),
}));
function setup(name = "Student") {
  if (name) localStorage.setItem("sat-practice-name", name);
  return render(
    <SessionProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<StartCodePage />} />
          <Route path="/test" element={<p>Test loaded</p>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}
function paste(code = "123456") {
  fireEvent.paste(screen.getByLabelText("Digit 1"), {
    clipboardData: { getData: () => code },
  });
}
function help() {
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
}
function close() {
  fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
}
function start() {
  fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
}
function ready() {
  help();
  fireEvent.click(screen.getByLabelText("Additional help options"));
  fireEvent.click(screen.getByRole("button", { name: "I’m ready" }));
}
async function send(code = "123456") {
  paste(code);
  ready();
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Your code and readiness have been sent.",
  );
  close();
}
function confirm() {
  help();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  vi.mocked(createSession).mockResolvedValue({
    sessionId: "entry",
    name: "Student",
  });
});

it("never sends a code before readiness, including repeated Start Test clicks", async () => {
  setup();
  paste("００１２３４");
  start();
  start();
  help();
  expect(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  ).toBeDisabled();
  close();
  expect(createSession).not.toHaveBeenCalled();
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "The start code is incorrect.",
  );
  ready();
  expect(await screen.findByRole("status")).toBeVisible();
  close();
  expect(createSession).toHaveBeenCalledExactlyOnceWith("001234", "Student");
  start();
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
  confirm();
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
  start();
  expect(await screen.findByText("Test loaded")).toBeVisible();
  expect(createSession).toHaveBeenCalledTimes(1);
});

it("locks edits during readiness submission and prevents duplicate sends across Help reopening", async () => {
  let resolve!: (value: Session) => void;
  vi.mocked(createSession).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  setup();
  paste();
  ready();
  expect(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Sending…",
    }),
  ).toBeDisabled();
  expect(screen.getByLabelText("Your name")).toBeDisabled();
  expect(screen.getByLabelText("Digit 1")).toBeDisabled();
  close();
  help();
  expect(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  ).toBeDisabled();
  resolve({ sessionId: "entry", name: "Student" });
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Your code and readiness have been sent.",
  );
  close();
  help();
  fireEvent.click(screen.getByLabelText("Additional help options"));
  expect(screen.getByRole("button", { name: "Code sent" })).toBeDisabled();
  expect(createSession).toHaveBeenCalledTimes(1);
});

it("requires explicit readiness retry after a failed write", async () => {
  vi.mocked(createSession)
    .mockRejectedValueOnce({ code: "unavailable" })
    .mockResolvedValueOnce({ sessionId: "retry", name: "Student" });
  setup();
  paste();
  ready();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Check your connection",
  );
  expect(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  ).toBeDisabled();
  close();
  start();
  expect(createSession).toHaveBeenCalledTimes(1);
  ready();
  await screen.findByRole("status");
  close();
  confirm();
  start();
  await screen.findByText("Test loaded");
  expect(createSession).toHaveBeenCalledTimes(2);
});

it("requires new readiness when the code changes", async () => {
  setup();
  await send();
  confirm();
  paste("654321");
  start();
  expect(createSession).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
  ready();
  await screen.findByRole("status");
  close();
  expect(createSession).toHaveBeenNthCalledWith(2, "654321", "Student");
  confirm();
  start();
  await screen.findByText("Test loaded");
});

it("requires new readiness when the saved name changes", async () => {
  setup();
  await send();
  confirm();
  help();
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Other Student" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save name" }));
  start();
  expect(createSession).toHaveBeenCalledTimes(1);
  ready();
  await screen.findByRole("status");
  expect(createSession).toHaveBeenNthCalledWith(2, "123456", "Other Student");
});

it("clears readiness on return home and on remount", async () => {
  const view = setup();
  await send();
  confirm();
  fireEvent.click(screen.getByRole("button", { name: "Return to Home" }));
  fireEvent.click(screen.getByRole("button", { name: "Clear code" }));
  paste();
  start();
  expect(createSession).toHaveBeenCalledTimes(1);
  await send();
  confirm();
  view.unmount();
  setup();
  paste();
  start();
  expect(createSession).toHaveBeenCalledTimes(2);
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
});

it("disables readiness for missing code, missing name or unsaved name edits", () => {
  setup("");
  help();
  fireEvent.click(screen.getByLabelText("Additional help options"));
  expect(screen.getByRole("button", { name: "I’m ready" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Student" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save name" }));
  help();
  fireEvent.click(screen.getByLabelText("Additional help options"));
  expect(screen.getByRole("button", { name: "I’m ready" })).toBeDisabled();
  close();
  paste();
  help();
  fireEvent.click(screen.getByLabelText("Additional help options"));
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Not saved" },
  });
  expect(screen.getByRole("button", { name: "I’m ready" })).toBeDisabled();
  expect(createSession).not.toHaveBeenCalled();
});

it("normalizes full-width digits and rejects invalid codes", () => {
  expect(validateAccessCode(" ００１２３４ ")).toBe("001234");
  expect(() => validateAccessCode("abc123456")).toThrow();
  setup();
  paste("abc123");
  expect(screen.getByRole("alert")).toHaveTextContent("numbers only");
  expect(createSession).not.toHaveBeenCalled();
});
it("shows the supplied instructions from both entry points", () => {
  setup();
  fireEvent.click(
    screen.getByRole("button", { name: /review the instructions/ }),
  );
  expect(screen.getByText(verbalInstructions)).toBeVisible();
  close();
  help();
  fireEvent.click(screen.getByRole("button", { name: "Verbal Instructions" }));
  expect(screen.getByText(verbalInstructions)).toBeVisible();
  expect(createSession).not.toHaveBeenCalled();
});
it("supports digit keyboard navigation without submitting", async () => {
  setup();
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Digit 1"), "123456");
  expect(screen.getByLabelText("Digit 6")).toHaveFocus();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByLabelText("Digit 5")).toHaveFocus();
  expect(createSession).not.toHaveBeenCalled();
});
it("asks for a name before starting", async () => {
  setup("");
  paste();
  start();
  await waitFor(() => expect(screen.getByLabelText("Your name")).toHaveFocus());
  expect(createSession).not.toHaveBeenCalled();
});
