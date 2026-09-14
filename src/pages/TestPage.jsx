import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Calculator,
  ChevronDown,
  MoreVertical,
  PenLine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAGES } from "../data/testStages";
import { isAnswered, questionKey } from "../hooks/testState";
import useTestSession from "../hooks/useTestSession";
import QuestionNavigator from "../components/test/QuestionNavigator";
import AnswerOption from "../components/test/AnswerOption";
import MathReferenceFloating from "../components/test/MathReferenceFloating";
import CalculatorPanel from "../components/test/CalculatorPanel";
import RichText from "../components/test/RichText";
import Modal from "../components/ui/Modal";
import { useSession } from "../app/sessionContext";
import BreakScreen from "../components/test/BreakScreen";
import {
  StudentResponseDirections,
  StudentResponseInput,
} from "../components/test/StudentResponse";
import "../styles/test.css";

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function TestPage() {
  const { session } = useSession();
  const { state, dispatch, secondsLeft } = useTestSession();
  const {
    stageIdx,
    qIdx,
    answers,
    marked,
    eliminated,
    notes,
    highlights,
    review,
    complete,
  } = state;
  const [showClock, setShowClock] = useState(true);
  const [panel, setPanel] = useState(null);
  const [showReference, setShowReference] = useState(false);
  const [highlightError, setHighlightError] = useState("");
  const contentRef = useRef(null);
  const selectedText = useRef("");
  const navigate = useNavigate();
  const stage = STAGES[stageIdx];
  const isMath = stage.title === "Math";
  const key = questionKey(stageIdx, qIdx);
  const question = stage.qs?.[qIdx];
  useEffect(() => {
    if (complete)
      navigate("/finish", {
        replace: true,
        state: {
          answered: Object.values(answers).filter(isAnswered).length,
          total: STAGES.reduce((sum, item) => sum + (item.qs?.length || 0), 0),
        },
      });
  }, [complete, answers, navigate]);
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    contentRef.current
      ?.querySelectorAll("[data-question-scroll]")
      .forEach((element) => {
        element.scrollTop = 0;
      });
  }, [qIdx, stageIdx, review]);

  useEffect(() => {
    setPanel(null);
    setShowReference(false);
    selectedText.current = "";
  }, [stageIdx]);

  function select(index) {
    dispatch({ type: "select", index });
    setPanel(null);
  }
  function advance() {
    setPanel(null);
    setShowReference(false);
    dispatch({ type: "advance", now: Date.now() });
  }
  const navigator = stage.qs && (
    <QuestionNavigator
      stageIdx={stageIdx}
      questions={stage.qs}
      current={qIdx}
      answers={answers}
      marked={marked}
      onSelect={select}
    />
  );
  const heading = `Section ${stage.sec}, Module ${stage.mod}: ${stage.title}`;
  const reviewBanner = (
    <div className="test-review-banner">
      <span className="test-question-number">{qIdx + 1}</span>
      <button
        aria-pressed={Boolean(marked[key])}
        onClick={() => dispatch({ type: "mark" })}
        className="flex items-center gap-2"
      >
        <Bookmark
          size={18}
          fill={marked[key] ? "#b91c1c" : "none"}
          className={marked[key] ? "text-red-700" : ""}
        />
        Mark for Review
      </button>
      <div className="test-dash" aria-hidden="true" />
    </div>
  );
  const options =
    question &&
    (question.choices ? (
      <ul className="test-options">
        {question.choices.map((text, index) => (
          <AnswerOption
            key={index}
            label={String.fromCharCode(65 + index)}
            text={text}
            active={answers[key] === index}
            eliminated={Boolean(eliminated[`${key}-${index}`])}
            onSelect={() => dispatch({ type: "answer", value: index })}
            onEliminate={() => dispatch({ type: "eliminate", index })}
          />
        ))}
      </ul>
    ) : (
      <StudentResponseInput
        value={answers[key] ?? ""}
        onChange={(value) => dispatch({ type: "answer", value })}
      />
    ));

  if (stage.id === "break")
    return (
      <BreakScreen
        time={formatTime(secondsLeft)}
        name={session?.name}
        onResume={advance}
      />
    );

  return (
    <div className="test-screen">
      <header className="test-header">
        <div className="test-heading">
          <h1>{heading}</h1>
          <button
            className="test-directions-button"
            onClick={() => setPanel("directions")}
          >
            Directions
            <ChevronDown size={13} />
          </button>
        </div>
        <div className="test-clock">
          {(showClock || secondsLeft <= 300) && (
            <span
              aria-label="Time remaining"
              className={`test-time ${secondsLeft <= 300 ? "text-red-700" : ""}`}
            >
              {formatTime(secondsLeft)}
            </span>
          )}
          <button
            disabled={secondsLeft <= 300}
            onClick={() => setShowClock((value) => !value)}
            className="test-clock-toggle"
          >
            {showClock ? "Hide" : "Show"}
          </button>
        </div>
        <div className="test-tools">
          {isMath ? (
            <>
              <button onClick={() => setPanel("calculator")}>
                <Calculator size={19} />
                Calculator
              </button>
              <button onClick={() => setShowReference((value) => !value)}>
                <span className="text-lg font-bold leading-5">x²</span>Reference
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setHighlightError("");
                setPanel("notes");
              }}
            >
              <PenLine size={19} />
              Highlights &amp; Notes
            </button>
          )}
          <button onClick={() => setPanel("more")}>
            <MoreVertical size={19} />
            More
          </button>
        </div>
      </header>
      <div className="test-dash" />
      <main
        ref={contentRef}
        className={`test-main ${review ? "test-main-review" : ""}`}
        onMouseUp={() => {
          const selection = window.getSelection();
          if (
            selection?.anchorNode &&
            contentRef.current?.contains(selection.anchorNode)
          )
            selectedText.current = selection.toString().trim();
        }}
      >
        {review ? (
          <section className="max-w-3xl mx-auto py-10">
            <h2 className="text-3xl font-semibold text-center mb-3">
              Check Your Work
            </h2>
            <p className="text-center mb-8">
              Select a question to review it. Your timer is still running.
            </p>
            <div className="border rounded-lg p-8">
              <h3 className="font-semibold mb-4">{heading}</h3>
              {navigator}
            </div>
          </section>
        ) : isMath && question.choices ? (
          <section className="test-math-choice">
            {reviewBanner}
            <div className="test-question-text">
              <RichText>{question.stem}</RichText>
            </div>
            {options}
          </section>
        ) : (
          <div className="test-reading-grid">
            <section data-question-scroll className="test-passage">
              {isMath ? (
                <StudentResponseDirections />
              ) : (
                <div className="whitespace-pre-wrap">
                  <RichText highlight={highlights[key]}>
                    {question.stem}
                  </RichText>
                </div>
              )}
            </section>
            <section data-question-scroll className="test-answers">
              {reviewBanner}
              <div className="test-question-text">
                <RichText>{isMath ? question.stem : question.prompt}</RichText>
              </div>
              {options}
            </section>
          </div>
        )}
      </main>
      <footer className="test-footer">
        <div className="test-dash absolute inset-x-0 top-0" />
        <div className="test-student-name">{session?.name}</div>
        {!review && (
          <button
            className="test-question-button"
            onClick={() => setPanel("navigator")}
          >
            Question {qIdx + 1} of {stage.qs.length}
            <ChevronDown size={15} />
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            className="test-nav"
            disabled={!review && qIdx === 0}
            onClick={() =>
              review
                ? dispatch({ type: "review", value: false })
                : select(qIdx - 1)
            }
          >
            Back
          </button>
          <button
            className="test-nav"
            onClick={() =>
              review
                ? setPanel("advance")
                : qIdx < stage.qs.length - 1
                  ? select(qIdx + 1)
                  : dispatch({ type: "review", value: true })
            }
          >
            {review
              ? stageIdx === STAGES.length - 1
                ? "Finish"
                : "Next Module"
              : qIdx === stage.qs.length - 1
                ? "Review"
                : "Next"}
          </button>
        </div>
      </footer>
      {showReference && isMath && (
        <MathReferenceFloating
          visible
          onClose={() => setShowReference(false)}
        />
      )}
      {panel && (
        <Modal
          key={`${stageIdx}-${panel}`}
          className={panel === "navigator" ? "navigator-modal" : ""}
          title={
            {
              directions: "Directions",
              calculator: "Calculator",
              notes: "Highlights & Notes",
              more: "Test Options",
              navigator: heading,
              advance:
                stageIdx === STAGES.length - 1 ? "Finish Test?" : "Continue?",
            }[panel]
          }
          onClose={() => setPanel(null)}
        >
          {panel === "directions" && (
            <p>
              {isMath
                ? "Solve each problem. Choose one answer or enter a response. You may use the calculator and reference sheet."
                : "Read each passage and choose the best answer. Each question has one answer."}{" "}
              You may return to any question in this module before continuing.
              This is an independent practice application.
            </p>
          )}
          {panel === "calculator" && <CalculatorPanel />}
          {panel === "notes" && (
            <div className="space-y-4">
              <label htmlFor="question-notes" className="block">
                Notes for question {qIdx + 1}
              </label>
              <textarea
                id="question-notes"
                rows={6}
                className="w-full border rounded p-3"
                value={notes[key] || ""}
                onChange={(event) =>
                  dispatch({ type: "note", value: event.target.value })
                }
              />
              <p className="text-sm">
                Select text in the passage before opening this panel to
                highlight it.
              </p>
              <button
                className="border rounded px-4 py-2 mr-3"
                onClick={() => {
                  if (
                    !selectedText.current ||
                    !question.stem.includes(selectedText.current)
                  ) {
                    setHighlightError(
                      "Select text from the current passage first.",
                    );
                    return;
                  }
                  dispatch({ type: "highlight", value: selectedText.current });
                  setPanel(null);
                }}
              >
                Highlight selection
              </button>
              <button
                className="underline"
                onClick={() => {
                  dispatch({ type: "highlight", value: "" });
                  setPanel(null);
                }}
              >
                Clear highlight
              </button>
              {highlightError && (
                <p role="alert" className="text-red-700">
                  {highlightError}
                </p>
              )}
            </div>
          )}
          {panel === "more" && (
            <div className="space-y-4">
              <button
                className="border rounded-full px-5 py-2"
                onClick={() => {
                  dispatch({ type: "review", value: true });
                  setPanel(null);
                }}
              >
                Review this module
              </button>
              <p>
                Answers and notes are kept in this open session. Reloading or
                closing the application starts over.
              </p>
            </div>
          )}
          {panel === "navigator" && (
            <>
              {navigator}
              <button
                className="navigator-review-button"
                onClick={() => {
                  dispatch({ type: "review", value: true });
                  setPanel(null);
                }}
              >
                Go to Review Page
              </button>
            </>
          )}
          {panel === "advance" && (
            <div className="space-y-5">
              <p>
                {stageIdx === STAGES.length - 1
                  ? "Finish this practice test?"
                  : "Leave this module and continue?"}{" "}
                You cannot return to this module afterward.
              </p>
              <button className="test-nav" onClick={advance}>
                Confirm and continue
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
