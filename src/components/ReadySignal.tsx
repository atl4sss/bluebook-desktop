import { useRef, useState } from "react";
import { sendReadySignal, type Session } from "../services/sessionService";

export default function ReadySignal({
  session,
  code,
}: {
  session: Session;
  code: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const pending = useRef(false);
  async function send() {
    if (pending.current || status === "sent") return;
    pending.current = true;
    setStatus("sending");
    try {
      await sendReadySignal(session, code);
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }
  return (
    <details className="access-ready">
      <summary aria-label="Additional help options">•••</summary>
      <p>
        Let your test organizer know you are ready. This will not start your
        test.
      </p>
      <button
        type="button"
        disabled={status === "sending" || status === "sent"}
        onClick={send}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Readiness sent"
            : "I’m ready"}
      </button>
      {status === "sent" && <p role="status">Readiness recorded.</p>}
      {status === "error" && (
        <p role="alert">
          Could not send readiness. Check your connection and try again.
        </p>
      )}
    </details>
  );
}
