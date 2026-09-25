import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import HomePage from "../src/pages/HomePage";
import StartCodePage from "../src/pages/StartCodePage";
import SessionProvider from "../src/app/SessionProvider";
import { createSession } from "../src/services/sessionService";
import { TEST_CARD_KEY } from "../src/services/testCardSettings";

vi.mock("../src/services/sessionService", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/services/sessionService")>()),
  createSession: vi.fn(),
}));

function setup() {
  return render(
    <SessionProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-code" element={<StartCodePage />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

it("accepts keyboard typing, spaces, editing and paste in the details form", async () => {
  setup();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Edit test details" }));
  const name = screen.getByLabelText("Student full name");
  expect(name).toHaveFocus();
  await user.type(name, "Alex Student");
  const school = screen.getByLabelText("School / test center");
  await user.clear(school);
  await user.type(school, "Школа 12{Backspace}3");
  const address = screen.getByLabelText("Address");
  await user.clear(address);
  await user.paste("100 Main Street\nAlmaty");
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.getByRole("article")).toHaveTextContent("Школа 13");
  expect(screen.getByRole("article")).toHaveTextContent(
    "100 Main Street Almaty",
  );
  expect(screen.getByRole("heading", { name: /Welcome, Alex/ })).toBeVisible();
});

it("persists edited profile, optional times, card content and information dialogs", () => {
  const view = setup();
  fireEvent.click(screen.getByRole("button", { name: "Edit test details" }));
  change("Student full name", "Alex Student");
  change("Test name", "PSAT/NMSQT");
  change("Date or date message", "Sat, Oct 3, 2026");
  change("Arrival time (optional)", "7:45 a.m. GMT+5");
  change("Doors close (optional)", "8:00 a.m. GMT+5");
  change("School / test center", "Example High School");
  change("Address", "100 Main Street\nAlmaty, Kazakhstan");
  change("Testing accommodations", "Extra breaks");
  change("Status message", "It’s time to set up your exam.");
  change("Check-in button text", "Start Exam Setup");
  change("Overview link text", "SAT Overview");
  change("Overview content", "My test overview");
  change(
    "Test day checklist (one item per line)",
    "Charge laptop\nBring a pencil",
  );
  change("SAT Score Sends content", "Ask the organizer about scores.");
  fireEvent.click(screen.getByLabelText("Show SAT Score Sends link"));
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  view.unmount();
  setup();
  expect(
    screen.getByRole("heading", {
      name: "Welcome, Alex. Good luck on test day!",
    }),
  ).toBeVisible();
  const card = screen.getByRole("article", { name: "Your scheduled test" });
  for (const value of [
    "PSAT/NMSQT",
    "Sat, Oct 3, 2026",
    "7:45 a.m. GMT+5",
    "8:00 a.m. GMT+5",
    "Example High School",
    "Almaty, Kazakhstan",
    "Extra breaks",
    "It’s time to set up your exam.",
  ]) {
    expect(card).toHaveTextContent(value);
  }
  expect(
    screen.getByRole("button", { name: "Start Exam Setup" }),
  ).toBeVisible();
  for (const [button, content] of [
    ["SAT Overview", "My test overview"],
    ["Test Day Checklist", "Bring a pencil"],
    ["SAT Score Sends", "Ask the organizer about scores."],
  ]) {
    fireEvent.click(screen.getByRole("button", { name: button }));
    expect(screen.getByRole("dialog")).toHaveTextContent(content);
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  }
  expect(createSession).not.toHaveBeenCalled();
});

it("opens the code page without transmitting and returns home with code cleared", () => {
  localStorage.setItem("sat-practice-name", "Alex Student");
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Check In Now" }));
  expect(screen.getByRole("heading", { name: "Start Code" })).toBeVisible();
  fireEvent.paste(screen.getByLabelText("Digit 1"), {
    clipboardData: { getData: () => "123456" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Start Test" }));
  expect(createSession).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Help" }));
  expect(screen.getByLabelText("Your name")).toHaveValue("Alex Student");
  fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  fireEvent.click(screen.getByRole("button", { name: "Return to Home" }));
  fireEvent.click(screen.getByRole("button", { name: "Return home" }));
  expect(screen.getByRole("heading", { name: "Your Tests" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Check In Now" }));
  expect(screen.getByLabelText("Digit 1")).toHaveValue("");
  expect(createSession).not.toHaveBeenCalled();
});

it("discards canceled edits and keeps the test and practice filters independent", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Edit test details" }));
  change("Test name", "Discard me");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByText("Discard me")).not.toBeInTheDocument();
  fireEvent.click(
    within(screen.getByRole("group", { name: "Your Tests filter" })).getByRole(
      "button",
      { name: "Past" },
    ),
  );
  expect(screen.getByText("No past tests")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Full-Length Practice" }),
  ).toBeVisible();
  fireEvent.click(
    within(screen.getByRole("group", { name: "Your Tests filter" })).getByRole(
      "button",
      { name: "Active" },
    ),
  );
  expect(screen.getByRole("button", { name: "Check In Now" })).toBeVisible();
});

it("recovers from malformed saved settings", () => {
  localStorage.setItem(TEST_CARD_KEY, "{broken");
  setup();
  expect(screen.getByRole("heading", { name: "SAT" })).toBeVisible();
  expect(screen.queryByText("Arrival Time:")).not.toBeInTheDocument();
});
