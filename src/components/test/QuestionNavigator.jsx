import { Bookmark, MapPin } from "lucide-react";
import { isAnswered, questionKey } from "../../hooks/testState";

export default function QuestionNavigator({
  stageIdx,
  questions,
  current,
  answers,
  marked,
  onSelect,
}) {
  return (
    <div className="question-navigator">
      <div className="navigator-legend">
        <span>
          <MapPin size={22} aria-hidden="true" /> Current
        </span>
        <span>
          <i className="navigator-unanswered" aria-hidden="true" /> Unanswered
        </span>
        <span>
          <Bookmark
            size={22}
            className="navigator-bookmark"
            aria-hidden="true"
          />{" "}
          For Review
        </span>
      </div>
      <div className="navigator-grid">
        {questions.map((_, index) => {
          const key = questionKey(stageIdx, index);
          const answered = isAnswered(answers[key]);
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              aria-label={`Question ${index + 1}, ${answered ? "answered" : "unanswered"}${marked[key] ? ", marked for review" : ""}`}
              aria-current={index === current ? "step" : undefined}
              className={`navigator-cell ${answered || index === current ? "is-filled" : ""}`}
            >
              {index + 1}
              {index === current && (
                <MapPin
                  className="navigator-current"
                  size={22}
                  aria-hidden="true"
                />
              )}
              {marked[key] && (
                <Bookmark
                  aria-hidden="true"
                  size={14}
                  className="navigator-flag"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
