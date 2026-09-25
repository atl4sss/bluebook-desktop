import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { focusWindow } from "../../services/focusWindow";

export default function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    let disposed = false;
    dialog?.showModal();
    const initial =
      dialog?.querySelector<HTMLElement>(
        "input:not([disabled]), textarea:not([disabled])",
      ) ?? dialog?.querySelector<HTMLElement>("button:not([disabled])");
    // Native focus can arrive after showModal. Reapply DOM focus afterwards,
    // without moving it away from another control the user already selected.
    void focusWindow()
      .catch(() => {})
      .finally(() => {
        if (disposed || !dialog?.open) return;
        const active = document.activeElement;
        if (
          active instanceof HTMLElement &&
          dialog.contains(active) &&
          active !== dialog
        ) {
          active.focus({ preventScroll: true });
        } else {
          initial?.focus({ preventScroll: true });
        }
      });
    initial?.focus({ preventScroll: true });
    return () => {
      disposed = true;
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      className={`app-modal ${className}`}
      onPointerDownCapture={(event) => {
        const target = event.target;
        if (!(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ))
          return;
        // Recover when another app owns keyboard focus but this topmost window
        // still receives clicks. Do not cancel the click or any keyboard input.
        if (!document.hasFocus()) {
          void focusWindow()
            .catch(() => {})
            .finally(() => {
              if (ref.current?.open && target.isConnected)
                target.focus({ preventScroll: true });
            });
        }
      }}
    >
      <div className="flex items-center justify-between gap-6 mb-5">
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        <button type="button" aria-label="Close dialog" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
