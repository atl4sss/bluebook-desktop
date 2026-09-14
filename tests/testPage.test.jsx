import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TestPage from "../src/pages/TestPage";
import CalculatorPanel from "../src/components/test/CalculatorPanel";
import SessionProvider from "../src/app/SessionProvider";
import { SessionContext } from "../src/app/sessionContext";
import { STAGES } from "../src/data/testStages";

describe("Test interactions", () => {
  it("selects answers, marks review, eliminates options, navigates and returns from review", () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <TestPage />
        </SessionProvider>
      </MemoryRouter>,
    );
    const answer = screen.getByRole("button", { name: "B hinder" });
    fireEvent.click(answer);
    fireEvent.click(screen.getByRole("button", { name: "Mark for Review" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminate choice C" }));
    fireEvent.click(screen.getByRole("button", { name: "Next", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Back", exact: true }));
    expect(screen.getByRole("button", { name: "B hinder" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Restore choice C" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Question 1 of 27" }));
    expect(
      screen.getByRole("button", {
        name: "Question 1, answered, marked for review",
      }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Go to Review Page" }));
    expect(
      screen.getByRole("heading", { name: "Check Your Work" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Question 1, answered, marked for review",
      }),
    );
    expect(screen.getByRole("button", { name: "B hinder" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("requires confirmation for manual module transitions", () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <TestPage />
        </SessionProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "More", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Review this module" }));
    fireEvent.click(screen.getByRole("button", { name: "Next Module" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Confirm and continue",
      }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Section 1, Module 2: Reading and Writing",
      }),
    ).toBeVisible();
  });
  it("calculates and recovers after divide-by-zero", () => {
    render(<CalculatorPanel />);
    for (const name of ["8", "÷", "2", "="])
      fireEvent.click(screen.getByRole("button", { name, exact: true }));
    expect(screen.getByLabelText("Calculator display")).toHaveTextContent("4");
    for (const name of ["÷", "0", "="])
      fireEvent.click(screen.getByRole("button", { name, exact: true }));
    expect(screen.getByLabelText("Calculator display")).toHaveTextContent(
      "Error",
    );
    fireEvent.click(screen.getByRole("button", { name: "C", exact: true }));
    expect(screen.getByLabelText("Calculator display")).toHaveTextContent("0");
  });
});

it("renders math notation through KaTeX and preserves ordinary text", async () => {
  const { default: RichText } = await import("../src/components/test/RichText");
  const { container } = render(
    <RichText>{"Solve \\(x^2+1\\) and explain."}</RichText>,
  );
  expect(container.querySelector(".katex")).not.toBeNull();
  expect(container.textContent).toContain("Solve");
  expect(container.textContent).toContain("and explain.");
});

it("shows the student's name, break layout, and Math response preview without losing answers", () => {
  render(
    <MemoryRouter>
      <SessionContext.Provider
        value={{ session: { sessionId: "layout-test", name: "Test Student" } }}
      >
        <TestPage />
      </SessionContext.Provider>
    </MemoryRouter>,
  );
  expect(screen.getByText("Test Student")).toBeVisible();
  function nextModule() {
    fireEvent.click(screen.getByRole("button", { name: "More", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Review this module" }));
    fireEvent.click(screen.getByRole("button", { name: "Next Module" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm and continue" }),
    );
  }
  nextModule();
  nextModule();
  expect(
    screen.getByRole("heading", {
      name: "Take a Break: Do Not Close Your Device",
    }),
  ).toBeVisible();
  expect(screen.getByText("Test Student")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Resume Testing Now" }));
  const math = STAGES.find((stage) => stage.title === "Math");
  const responseIndex = math.qs.findIndex((question) => !question.choices);
  fireEvent.click(
    screen.getByRole("button", { name: `Question 1 of ${math.qs.length}` }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: `Question ${responseIndex + 1}, unanswered`,
    }),
  );
  expect(
    screen.getByRole("heading", {
      name: "Student-produced response directions",
    }),
  ).toBeVisible();
  fireEvent.change(screen.getByLabelText("Your answer"), {
    target: { value: "7/2" },
  });
  expect(document.querySelector(".answer-preview .katex")).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Back", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Next", exact: true }));
  expect(screen.getByLabelText("Your answer")).toHaveValue("7/2");
});
