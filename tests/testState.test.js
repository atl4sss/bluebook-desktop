import { describe, it, expect } from "vitest";
import { STAGES } from "../src/data/testStages";
import {
  initialTestState,
  testReducer,
  isAnswered,
} from "../src/hooks/testState";

describe("SAT state", () => {
  it("keeps answers, flags, eliminated choices and notes across navigation and modules", () => {
    let state = initialTestState(0);
    for (const action of [
      { type: "answer", value: 0 },
      { type: "mark" },
      { type: "eliminate", index: 2 },
      { type: "note", value: "check this" },
      { type: "select", index: 4 },
      { type: "select", index: 0 },
      { type: "advance", now: 200 },
    ])
      state = testReducer(state, action);
    expect(state.answers["0-0"]).toBe(0);
    expect(state.marked["0-0"]).toBe(true);
    expect(state.eliminated["0-0-2"]).toBe(true);
    expect(state.notes["0-0"]).toBe("check this");
    expect(state.stageIdx).toBe(1);
    expect(state.qIdx).toBe(0);
  });
  it("advances when time expires even while reviewing", () => {
    let state = testReducer(initialTestState(0), {
      type: "review",
      value: true,
    });
    state = testReducer(state, { type: "tick", now: 32 * 60000 });
    expect(state.stageIdx).toBe(1);
    expect(state.review).toBe(false);
  });
  it("catches up after background sleep, including break, and completes exactly once", () => {
    const state = testReducer(initialTestState(0), {
      type: "tick",
      now: (32 + 32 + 10 + 35 + 35) * 60000,
    });
    expect(state.complete).toBe(true);
    expect(state.stageIdx).toBe(4);
    expect(testReducer(state, { type: "tick", now: 999999999 })).toBe(state);
  });
  it("does not count a cleared grid-in answer; choice A is an answer", () => {
    expect(isAnswered("  ")).toBe(false);
    expect(isAnswered("")).toBe(false);
    expect(isAnswered(0)).toBe(true);
  });
  it("retains all original four modules and valid question shapes", () => {
    expect(
      STAGES.filter((stage) => stage.qs).map((stage) => stage.qs.length),
    ).toEqual([27, 27, 22, 22]);
    for (const stage of STAGES.filter((stage) => stage.qs))
      for (const question of stage.qs) {
        expect(typeof question.stem).toBe("string");
        expect(question.stem.length).toBeGreaterThan(0);
        expect(question.grid === true || question.choices?.length >= 2).toBe(
          true,
        );
      }
  });
});
