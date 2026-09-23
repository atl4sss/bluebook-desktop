import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StartCodePage from "../src/pages/StartCodePage";
import SessionProvider from "../src/app/SessionProvider";
import {
  createSession,
  validateAccessCode,
  type Session,
} from "../src/services/sessionService";
vi.mock("../src/services/sessionService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/services/sessionService")>()),
  createSession: vi.fn(),
}));
function setup() {
  render(
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
function paste(code: string) {
  fireEvent.paste(screen.getByLabelText("Digit 1"), {
    clipboardData: { getData: () => code },
  });
}
function confirmCode() {
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  );
}
async function submitSavedNameCode(code = "123456") {
  paste(code);
  fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "The start code is incorrect.",
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});
describe("Access screen", () => {
  it("normalizes full-width digits and preserves leading zeros, rejecting letters", () => {
    expect(validateAccessCode(" ００１２３４ ")).toBe("001234");
    expect(() => validateAccessCode("abc123456")).toThrow();
    expect(() => validateAccessCode("")).toThrow();
  });
  it("disables incomplete submissions and submits once while loading", async () => {
    let resolve!: (value: Session) => void;
    vi.mocked(createSession).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    await userEvent.type(
      screen.getByLabelText("Your name"),
      "Arina Masalskaia",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(screen.getByRole("button", { name: "Start Test" })).toBeDisabled();
    paste("００１２３４");
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(
      screen.getByRole("button", { name: "Confirm code is correct" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save name" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(createSession).toHaveBeenCalledExactlyOnceWith(
      "001234",
      "Arina Masalskaia",
    );
    resolve({ sessionId: "test-session", name: "Arina Masalskaia" });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The start code is incorrect.",
    );
    expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
    confirmCode();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    expect(await screen.findByText("Test loaded")).toBeVisible();
    expect(createSession).toHaveBeenCalledTimes(1);
  });
  it("keeps the code after network errors and allows a retry", async () => {
    vi.mocked(createSession)
      .mockRejectedValueOnce({ code: "functions/unavailable" })
      .mockResolvedValueOnce({ sessionId: "retried", name: "Student" });
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    await userEvent.type(screen.getByLabelText("Your name"), "Student");
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    paste("123456");
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check your connection",
    );
    expect(screen.getByLabelText("Digit 1")).toHaveValue("1");
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(
      screen.getByRole("button", { name: "Confirm code is correct" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "The start code is incorrect.",
      ),
    );
    expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
    confirmCode();
    fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
    await waitFor(() => expect(screen.getByText("Test loaded")).toBeVisible());
  });
  it("opens usable instructions and rejects invalid pasted text", () => {
    setup();
    paste("abc123");
    expect(screen.getByRole("alert")).toHaveTextContent("numbers only");
    fireEvent.click(
      screen.getByRole("button", { name: /review the instructions/ }),
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

it("requires a fresh submission and confirmation when a confirmed code changes", async () => {
  localStorage.setItem("sat-practice-name", "Student");
  vi.mocked(createSession).mockResolvedValue({
    sessionId: "entry",
    name: "Student",
  });
  setup();
  await submitSavedNameCode();
  confirmCode();
  await submitSavedNameCode("654321");
  expect(createSession).toHaveBeenNthCalledWith(2, "654321", "Student");
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
  expect(screen.getByText("654321")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm code is correct" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
  expect(await screen.findByText("Test loaded")).toBeVisible();
  expect(createSession).toHaveBeenCalledTimes(2);
});

it("invalidates confirmation when the saved student name changes", async () => {
  localStorage.setItem("sat-practice-name", "Student");
  vi.mocked(createSession).mockResolvedValue({
    sessionId: "entry",
    name: "Student",
  });
  setup();
  await submitSavedNameCode();
  confirmCode();
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Other Student" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save name" }));
  await submitSavedNameCode();
  expect(createSession).toHaveBeenNthCalledWith(2, "123456", "Other Student");
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
});

it("clears confirmation when returning home even if the same code is entered again", async () => {
  localStorage.setItem("sat-practice-name", "Student");
  vi.mocked(createSession).mockResolvedValue({
    sessionId: "entry",
    name: "Student",
  });
  setup();
  await submitSavedNameCode();
  confirmCode();
  fireEvent.click(screen.getByRole("button", { name: "Return to Home" }));
  fireEvent.click(screen.getByRole("button", { name: "Clear code" }));
  expect(screen.getByRole("button", { name: "Start Test" })).toBeDisabled();
  await submitSavedNameCode();
  expect(createSession).toHaveBeenCalledTimes(2);
  expect(screen.queryByText("Test loaded")).not.toBeInTheDocument();
});

it("supports typing all digits and moving between them with the keyboard", async () => {
  const user = userEvent.setup();
  setup();
  await user.type(screen.getByLabelText("Digit 1"), "123456");
  expect(screen.getByLabelText("Digit 6")).toHaveValue("6");
  expect(screen.getByLabelText("Digit 6")).toHaveFocus();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByLabelText("Digit 5")).toHaveFocus();
  expect(screen.getByRole("button", { name: "Start Test" })).toBeEnabled();
});

it("asks for a name through Help before starting", async () => {
  setup();
  paste("123456");
  fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByLabelText("Your name")).toHaveFocus();
  expect(createSession).not.toHaveBeenCalled();
});
