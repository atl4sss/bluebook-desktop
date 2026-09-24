export default function ReadySignal({
  disabled,
  sending,
  sent,
  error,
  onReady,
}: {
  disabled: boolean;
  sending: boolean;
  sent: boolean;
  error: string;
  onReady: () => void;
}) {
  return (
    <details className="access-ready">
      <summary aria-label="Additional help options">•••</summary>
      <p>
        Confirm you are ready to send your name and code to the test organizer.
        This will not start your test.
      </p>
      <button
        type="button"
        disabled={disabled || sending || sent}
        onClick={onReady}
      >
        {sending ? "Sending…" : sent ? "Code sent" : "I’m ready"}
      </button>
      {disabled && !sent && (
        <p>Enter all six digits and save your name first.</p>
      )}
      {sent && <p role="status">Your code and readiness have been sent.</p>}
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
