import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, HelpCircle, Home } from "lucide-react";
import {
  createSession,
  normalizeAccessCode,
  normalizeName,
  sessionErrorMessage,
  validateName,
  type Session,
} from "../services/sessionService";
import { useSession } from "../app/sessionContext";
import Modal from "../components/ui/Modal";
import ReadySignal from "../components/ReadySignal";
import { verbalInstructions } from "../data/verbalInstructions";
import "../styles/access-code.css";

export default function StartCodePage() {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("sat-practice-name") ?? "";
    } catch {
      return "";
    }
  });
  const [nameDraft, setNameDraft] = useState(name);
  const [nameError, setNameError] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyError, setReadyError] = useState("");
  const [registration, setRegistration] = useState<{
    code: string;
    session: Session;
    confirmed: boolean;
  } | null>(null);
  const [dialog, setDialog] = useState<"help" | "instructions" | "home" | null>(
    null,
  );
  const cells = useRef<Array<HTMLInputElement | null>>([]);
  const submitting = useRef(false);
  const { startSession, endSession } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    cells.current[0]?.focus();
  }, []);
  const complete = digits.every((digit) => /^\d$/.test(digit));
  const awaitingConfirmation = registration !== null && !registration.confirmed;
  const statusError =
    error || (awaitingConfirmation ? "The start code is incorrect." : "");

  function fill(raw: string, start: number) {
    const value = normalizeAccessCode(raw);
    if (!/^\d*$/.test(value)) {
      setError("The start code contains numbers only.");
      return;
    }
    const incoming = value.slice(0, 6 - start).split("");
    const next = [...digits];
    if (!incoming.length) next[start] = "";
    incoming.forEach((digit, offset) => {
      next[start + offset] = digit;
    });
    if (next.join("") !== digits.join("")) {
      setRegistration(null);
      setReadyError("");
    }
    setDigits(next);
    setError("");
    cells.current[Math.min(start + incoming.length, 5)]?.focus();
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace" && !digits[index] && index > 0)
      cells.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      cells.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      cells.current[index + 1]?.focus();
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    if (!complete) {
      setError("Enter all six numbers to start your test.");
      return;
    }
    if (!name) {
      setError("Enter your name using the Help button before starting.");
      setDialog("help");
      return;
    }
    if (registration) {
      setError("");
      if (registration.confirmed) {
        startSession(registration.session);
        navigate("/test", { replace: true });
      }
      return;
    }
    setError("The start code is incorrect.");
  }
  async function confirmReady() {
    if (
      submitting.current ||
      registration ||
      !complete ||
      !name ||
      normalizeName(nameDraft) !== name
    )
      return;
    submitting.current = true;
    setLoading(true);
    setError("");
    setReadyError("");
    try {
      const code = digits.join("");
      const session = await createSession(code, name);
      setRegistration({ code, session, confirmed: false });
    } catch (failure) {
      setReadyError(sessionErrorMessage(failure));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }
  return (
    <div className="access-screen">
      <header className="access-header">
        <button onClick={() => setDialog("help")}>
          <HelpCircle size={18} />
          Help
        </button>
        <button disabled={loading} onClick={() => setDialog("home")}>
          Return to Home
          <Home size={17} />
        </button>
      </header>
      <main className="access-main">
        <h1>Start Code</h1>
        <p className="access-intro">
          Enter your start code now to begin testing. Good luck!
        </p>
        <p className="access-hint" id="code-hint">
          The start code contains <strong>numbers only.</strong>
        </p>
        <form onSubmit={submit} className="access-form" aria-busy={loading}>
          <fieldset
            disabled={loading}
            aria-describedby="code-hint code-status"
            className="access-digits"
          >
            <legend className="sr-only">Six-digit start code</legend>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  cells.current[index] = element;
                }}
                aria-label={`Digit ${index + 1}`}
                aria-invalid={Boolean(statusError)}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => fill(event.target.value, index)}
                onKeyDown={(event) => keyDown(event, index)}
                onPaste={(event) => {
                  event.preventDefault();
                  const text = event.clipboardData.getData("text");
                  fill(
                    text,
                    normalizeAccessCode(text).length === 6 ? 0 : index,
                  );
                }}
              />
            ))}
          </fieldset>
          <button
            type="submit"
            className="access-submit"
            disabled={!complete || loading}
          >
            {loading ? "Sending…" : "Start Test"}
          </button>
          <div id="code-status" className="access-status" aria-live="polite">
            {statusError ? (
              <p role="alert">{statusError}</p>
            ) : loading ? (
              "Connecting securely…"
            ) : registration?.confirmed ? (
              "Code confirmed. Press Start Test when you are ready."
            ) : null}
          </div>
        </form>
        <button
          className="access-instructions"
          onClick={() => setDialog("instructions")}
        >
          <ClipboardList size={35} strokeWidth={1.4} aria-hidden="true" />
          <span>
            You can <span className="underline">review the instructions</span>
            <br />
            that the proctor reads aloud.
          </span>
        </button>
      </main>
      {dialog && (
        <Modal
          title={
            dialog === "help"
              ? "Help & Student Name"
              : dialog === "home"
                ? "Return to Home"
                : "Test Instructions"
          }
          onClose={() => setDialog(null)}
        >
          {dialog === "help" ? (
            <div className="space-y-3">
              <form
                className="access-name-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (submitting.current) return;
                  try {
                    const savedName = validateName(nameDraft);
                    if (savedName !== name) {
                      setRegistration(null);
                      setReadyError("");
                    }
                    setName(savedName);
                    setNameDraft(savedName);
                    setNameError("");
                    setError("");
                    try {
                      localStorage.setItem("sat-practice-name", savedName);
                    } catch {
                      // The name still remains available for the current session.
                    }
                    setDialog(null);
                  } catch (failure) {
                    setNameError(
                      failure instanceof Error
                        ? failure.message
                        : "Enter your name.",
                    );
                  }
                }}
              >
                <label htmlFor="student-name">Your name</label>
                <input
                  id="student-name"
                  autoFocus
                  autoComplete="name"
                  maxLength={80}
                  disabled={loading}
                  value={nameDraft}
                  onChange={(event) => {
                    setNameDraft(event.target.value);
                    setNameError("");
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" role="alert">
                    {nameError}
                  </p>
                )}
                <button type="submit" disabled={loading}>
                  Save name
                </button>
              </form>
              <p>
                Enter the six-digit code shared by your practice test organizer.
                You can paste the whole code.
              </p>
              <p>
                Your saved name and code will be sent to the test organizer when
                you choose I’m ready under ••• below. Entering a code or
                pressing Start Test will not send it before you are ready.
              </p>
              <div className="access-confirmation">
                <p>
                  After checking the code with your test organizer, confirm it
                  here. Then press Start Test at the agreed time.
                </p>
                {registration && (
                  <p>
                    Submitted code: <strong>{registration.code}</strong>
                  </p>
                )}
                <button
                  type="button"
                  disabled={
                    loading ||
                    !registration ||
                    registration.confirmed ||
                    normalizeName(nameDraft) !== name
                  }
                  onClick={() => {
                    if (!registration || submitting.current) return;
                    setRegistration({ ...registration, confirmed: true });
                    setError("");
                    setDialog(null);
                  }}
                >
                  {registration?.confirmed
                    ? "Code confirmed"
                    : "Confirm code is correct"}
                </button>
              </div>
              <button
                type="button"
                className="underline"
                onClick={() => setDialog("instructions")}
              >
                Verbal Instructions
              </button>
              <ReadySignal
                disabled={
                  !complete || !name || normalizeName(nameDraft) !== name
                }
                sending={loading}
                sent={registration !== null}
                error={readyError}
                onReady={confirmReady}
              />
            </div>
          ) : dialog === "instructions" ? (
            <div className="space-y-3">
              <p>{verbalInstructions}</p>
              <hr />
              <p>
                First enter your code, then choose Help → ••• → I’m ready to
                send it. Confirm the code in Help after checking with your test
                organizer, then press Start Test at the agreed time. The timer
                starts only when the test opens.
              </p>
              <p>
                This practice test has two Reading and Writing modules, a
                ten-minute break, and two Math modules.
              </p>
              <p>
                You may move between questions within the current module, mark
                questions for review, and revise answers before continuing. The
                timer keeps running during review.
              </p>
              <p>
                Answers and notes stay in this open session. Closing or
                reloading the application ends the session.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Return to your tests or clear the code to begin again. Returning
                home clears this code and its confirmation.
              </p>
              <button
                className="border rounded-full px-5 py-2"
                onClick={() => {
                  endSession();
                  navigate("/", { replace: true });
                }}
              >
                Return home
              </button>
              <button
                className="border rounded-full px-5 py-2"
                onClick={() => {
                  endSession();
                  setDigits(Array(6).fill(""));
                  setReadyError("");
                  setRegistration(null);
                  setError("");
                  setDialog(null);
                }}
              >
                Clear code
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
