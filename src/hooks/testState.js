import { STAGES } from "../data/testStages";

export const questionKey = (stage, question) => `${stage}-${question}`;
export const isAnswered = (answer) =>
  answer !== undefined && answer !== null && String(answer).trim() !== "";

export function initialTestState(now = Date.now()) {
  return {
    stageIdx: 0,
    qIdx: 0,
    answers: {},
    marked: {},
    eliminated: {},
    notes: {},
    highlights: {},
    review: false,
    complete: false,
    deadline: now + STAGES[0].mins * 60000,
  };
}
function advance(state, now) {
  if (state.stageIdx === STAGES.length - 1) return { ...state, complete: true };
  const stageIdx = state.stageIdx + 1;
  return {
    ...state,
    stageIdx,
    qIdx: 0,
    review: false,
    deadline: now + STAGES[stageIdx].mins * 60000,
  };
}
export function testReducer(state, action) {
  if (state.complete) return state;
  if (action.type === "tick") {
    let next = state;
    // Carry elapsed time across sleep/background throttling, including the break.
    while (!next.complete && action.now >= next.deadline)
      next = advance(next, next.deadline);
    return next;
  }
  const stage = STAGES[state.stageIdx];
  const key = questionKey(state.stageIdx, state.qIdx);
  switch (action.type) {
    case "advance":
      return advance(state, action.now);
    case "select":
      return {
        ...state,
        review: false,
        qIdx: Math.max(0, Math.min((stage.qs?.length || 1) - 1, action.index)),
      };
    case "review":
      return { ...state, review: action.value };
    case "answer":
      return { ...state, answers: { ...state.answers, [key]: action.value } };
    case "mark":
      return {
        ...state,
        marked: { ...state.marked, [key]: !state.marked[key] },
      };
    case "note":
      return { ...state, notes: { ...state.notes, [key]: action.value } };
    case "highlight":
      return {
        ...state,
        highlights: { ...state.highlights, [key]: action.value },
      };
    case "eliminate": {
      const choiceKey = `${key}-${action.index}`;
      return {
        ...state,
        eliminated: {
          ...state.eliminated,
          [choiceKey]: !state.eliminated[choiceKey],
        },
      };
    }
    default:
      return state;
  }
}
