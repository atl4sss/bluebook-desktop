import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  Check,
  CircleCheck,
  CirclePlay,
  ClipboardList,
  Ellipsis,
  Monitor,
  UserRound,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import { validateName } from "../services/sessionService";
import {
  defaultTestCard,
  loadStudentName,
  loadTestCard,
  STUDENT_NAME_KEY,
  TEST_CARD_KEY,
  type TestCardSettings,
} from "../services/testCardSettings";
import desktopConfig from "../../src-tauri/tauri.conf.json";
import "../styles/home.css";

type InfoDialog =
  "overview" | "checklist" | "scores" | "missing" | "practice" | "preview";
type TextField = Exclude<keyof TestCardSettings, "showScoreSends">;
const fields: {
  key: TextField;
  label: string;
  multiline?: boolean;
  required?: boolean;
}[] = [
  { key: "testName", label: "Test name", required: true },
  { key: "date", label: "Date or date message", required: true },
  { key: "arrivalTime", label: "Arrival time (optional)" },
  { key: "doorsClose", label: "Doors close (optional)" },
  { key: "school", label: "School / test center" },
  { key: "address", label: "Address", multiline: true },
  { key: "accommodations", label: "Testing accommodations", multiline: true },
  { key: "status", label: "Status message", multiline: true },
  { key: "buttonLabel", label: "Check-in button text", required: true },
  { key: "overviewLabel", label: "Overview link text", required: true },
  { key: "overview", label: "Overview content", multiline: true },
  {
    key: "checklist",
    label: "Test day checklist (one item per line)",
    multiline: true,
  },
  { key: "scoreSends", label: "SAT Score Sends content", multiline: true },
];

function Tabs({
  label,
  past,
  onChange,
}: {
  label: string;
  past: boolean;
  onChange: (past: boolean) => void;
}) {
  return (
    <div className="home-tabs" role="group" aria-label={label}>
      <button aria-pressed={!past} onClick={() => onChange(false)}>
        {!past && <Check size={16} />}Active
      </button>
      <button aria-pressed={past} onClick={() => onChange(true)}>
        {past && <Check size={16} />}Past
      </button>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [card, setCard] = useState(loadTestCard);
  const [name, setName] = useState(loadStudentName);
  const [draft, setDraft] = useState(card);
  const [nameDraft, setNameDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [past, setPast] = useState(false);
  const [practicePast, setPracticePast] = useState(false);
  const [info, setInfo] = useState<InfoDialog | null>(null);
  const firstName = name.split(/\s+/)[0];

  function edit() {
    setDraft({ ...card });
    setNameDraft(name);
    setError("");
    setEditing(true);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    let savedName: string;
    try {
      savedName = validateName(nameDraft);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Enter your name.");
      return;
    }
    const next = { ...draft };
    for (const field of fields) {
      next[field.key] = next[field.key].trim();
      if (field.required && !next[field.key]) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    try {
      localStorage.setItem(TEST_CARD_KEY, JSON.stringify(next));
      localStorage.setItem(STUDENT_NAME_KEY, savedName);
    } catch {
      setError(
        "Could not save these settings on this device. Check available storage and try again.",
      );
      return;
    }
    setCard(next);
    setName(savedName);
    setEditing(false);
  }

  const infoTitle =
    info === "overview"
      ? card.overviewLabel
      : info === "checklist"
        ? "Test Day Checklist"
        : info === "scores"
          ? "SAT Score Sends"
          : info === "missing"
            ? "Your Tests"
            : info === "preview"
              ? "Test Preview"
              : "Practice and Prepare";

  return (
    <div className="home-screen">
      <header className="home-hero">
        <div className="home-container">
          <div className="home-topbar">
            <div className="home-brand">
              <img src="/app-icon.svg" alt="" />
              {desktopConfig.productName}
            </div>
            <button
              className="home-profile"
              onClick={edit}
              aria-label="Edit profile and test details"
            >
              <span>{name || "Your profile"}</span>
              <span className="home-avatar">
                <UserRound size={23} />
              </span>
            </button>
          </div>
          <h1>
            Welcome{firstName ? `, ${firstName}` : ""}. Good luck on test day!
          </h1>
        </div>
      </header>
      <main className="home-container home-content">
        <section aria-labelledby="your-tests-title">
          <div className="home-section-heading">
            <h2 id="your-tests-title">Your Tests</h2>
            <Tabs label="Your Tests filter" past={past} onChange={setPast} />
            <button
              className="home-link home-section-link"
              onClick={() => setInfo("missing")}
            >
              Don’t see your test here?
            </button>
          </div>
          {past ? (
            <div className="home-empty">
              <h3>No past tests</h3>
              <p>Completed test history is not saved on this device.</p>
            </div>
          ) : (
            <article
              className="home-test-card"
              aria-label="Your scheduled test"
            >
              <div className="home-card-heading">
                <h3>{card.testName}</h3>
                <button
                  className="home-edit"
                  aria-label="Edit test details"
                  title="Edit test details"
                  onClick={edit}
                >
                  <Ellipsis size={24} />
                </button>
              </div>
              <div className="home-card-details">
                <div>
                  <p>
                    <strong>Date:</strong> {card.date}
                  </p>
                  {card.arrivalTime && (
                    <p>
                      <strong>Arrival Time:</strong> {card.arrivalTime}
                    </p>
                  )}
                  {card.doorsClose && (
                    <p>
                      <strong>Doors Close:</strong> {card.doorsClose}
                    </p>
                  )}
                  <div className="home-location">
                    <strong>{card.school}</strong>
                    <p className="home-multiline">{card.address}</p>
                  </div>
                </div>
                <nav className="home-card-links" aria-label="Test information">
                  <button
                    className="home-link"
                    onClick={() => setInfo("overview")}
                  >
                    <CirclePlay size={21} />
                    {card.overviewLabel}
                  </button>
                  <button
                    className="home-link"
                    onClick={() => setInfo("checklist")}
                  >
                    <Check size={23} />
                    Test Day Checklist
                  </button>
                  {card.showScoreSends && (
                    <button
                      className="home-link"
                      onClick={() => setInfo("scores")}
                    >
                      <BookOpen size={21} />
                      SAT Score Sends
                    </button>
                  )}
                </nav>
              </div>
              {card.accommodations && (
                <p className="home-accommodations home-multiline">
                  <strong>Testing Accommodations:</strong> {card.accommodations}
                </p>
              )}
              <div className="home-card-footer">
                <p>
                  <CircleCheck size={22} fill="currentColor" stroke="white" />
                  <span>{card.status}</span>
                </p>
                <button
                  className="home-primary"
                  onClick={() => navigate("/start-code")}
                >
                  {card.buttonLabel}
                </button>
              </div>
            </article>
          )}
        </section>
        <section aria-labelledby="practice-title" className="home-practice">
          <div className="home-section-heading">
            <h2 id="practice-title">Practice and Prepare</h2>
            <Tabs
              label="Practice filter"
              past={practicePast}
              onChange={setPracticePast}
            />
            <button
              className="home-link home-section-link"
              onClick={() => setInfo("practice")}
            >
              Learn more about practice
            </button>
          </div>
          {practicePast ? (
            <div className="home-empty">
              <h3>No past practice tests</h3>
              <p>Practice results are not saved after a session ends.</p>
            </div>
          ) : (
            <div className="home-practice-grid">
              <button
                className="home-practice-card"
                aria-label="Test Preview"
                onClick={() => setInfo("preview")}
              >
                <span className="home-preview-art">
                  <ClipboardList size={48} />
                  <Calculator size={33} />
                </span>
                <span>
                  Test
                  <br />
                  Preview
                </span>
              </button>
              <button
                className="home-practice-card"
                aria-label="Full-Length Practice"
                onClick={() => navigate("/start-code")}
              >
                <Monitor size={65} strokeWidth={1.4} />
                <span>
                  Full-Length
                  <br />
                  Practice
                </span>
              </button>
            </div>
          )}
        </section>
      </main>
      {editing && (
        <Modal
          title="Profile & Test Details"
          onClose={() => setEditing(false)}
          className="home-editor"
        >
          <form onSubmit={save}>
            <p className="home-editor-note">
              Customize the information shown on your home page. Settings are
              saved on this device. These details do not change the practice
              questions or module timing.
            </p>
            <div className="home-editor-grid">
              <label className="home-wide">
                Student full name
                <input
                  autoFocus
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                />
              </label>
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={field.multiline ? "home-wide" : ""}
                >
                  {field.label}
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      maxLength={4000}
                      value={draft[field.key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [field.key]: event.target.value })
                      }
                    />
                  ) : (
                    <input
                      required={field.required}
                      maxLength={160}
                      value={draft[field.key]}
                      onChange={(event) =>
                        setDraft({ ...draft, [field.key]: event.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              <label className="home-wide home-checkbox">
                <input
                  type="checkbox"
                  checked={draft.showScoreSends}
                  onChange={(event) =>
                    setDraft({ ...draft, showScoreSends: event.target.checked })
                  }
                />
                Show SAT Score Sends link
              </label>
            </div>
            {error && (
              <p className="home-error" role="alert">
                {error}
              </p>
            )}
            <div className="home-editor-actions">
              <button
                type="button"
                className="home-link"
                onClick={() => setDraft({ ...defaultTestCard })}
              >
                Restore defaults
              </button>
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="home-primary">
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}
      {info && (
        <Modal title={infoTitle} onClose={() => setInfo(null)}>
          {info === "overview" ? (
            <p className="home-multiline">{card.overview}</p>
          ) : info === "checklist" ? (
            <ul className="home-checklist">
              {card.checklist
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => (
                  <li key={index}>
                    <Check size={18} />
                    <span>{line}</span>
                  </li>
                ))}
            </ul>
          ) : info === "scores" ? (
            <p className="home-multiline">{card.scoreSends}</p>
          ) : info === "missing" ? (
            <div>
              <p>
                You can update your test information using the ••• menu on your
                test card.
              </p>
              <button
                className="home-primary home-modal-action"
                onClick={() => {
                  setInfo(null);
                  edit();
                }}
              >
                Edit test details
              </button>
            </div>
          ) : (
            <div>
              <p>
                This app contains one full-length SAT practice test with Reading
                and Writing and Math modules. You can move between questions,
                mark questions for review, and use the calculator during Math.
              </p>
              <p className="home-modal-action">
                Choose Full-Length Practice or the check-in button to enter your
                start code. Your test begins only after the readiness and code
                confirmation steps.
              </p>
              <button
                className="home-primary home-modal-action"
                onClick={() => navigate("/start-code")}
              >
                Continue to Start Code
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
