import RichText from "./RichText";

export default function AnswerOption({
  label,
  text,
  active,
  eliminated,
  onSelect,
  onEliminate,
}) {
  return (
    <li className="test-option-row">
      <button
        aria-label={`${label} ${text}`}
        aria-pressed={active}
        onClick={onSelect}
        className={`test-option ${active ? "is-selected" : ""} ${eliminated ? "is-eliminated" : ""}`}
      >
        <span className="test-option-letter" aria-hidden="true">
          {label}
        </span>
        <span className="test-option-text">
          <RichText>{text}</RichText>
        </span>
      </button>
      <button
        aria-label={`${eliminated ? "Restore" : "Eliminate"} choice ${label}`}
        aria-pressed={eliminated}
        onClick={onEliminate}
        className="test-eliminate"
      >
        <span aria-hidden="true">{label}</span>
      </button>
    </li>
  );
}
