import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Confirmation dialog for leaving a game.
 *
 * Accessibility contract (HANDOFF §9 Phase 3):
 * - role="dialog" + aria-modal, labelled by the title
 * - focus moves into the dialog on open and returns to the trigger on close
 * - Tab/Shift+Tab are trapped inside the dialog while it is open
 * - Escape still closes
 */
export default function ConfirmBackModal({
  isOpen,
  onClose,
  onHome,
  onSettings,
  title = "Leave this game?",
  description = "You can return to settings or go back to the home page.",
}: {
  isOpen: boolean;
  onClose: () => void;
  onHome?: () => void;
  onSettings?: () => void;
  title?: string;
  description?: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus management: capture the trigger, move focus in, restore on close.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    dialogRef.current?.focus();

    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;

        // Fully owned Tab handling: deterministic wrap-around regardless of
        // native browser behavior (and required for jsdom-based tests).
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute("disabled"));
        e.preventDefault();
        if (focusables.length === 0) {
          root.focus();
          return;
        }

        const active =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const currentIndex =
          active && root.contains(active) ? focusables.indexOf(active) : -1;

        let nextIndex: number;
        if (e.shiftKey) {
          nextIndex =
            currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
        } else {
          nextIndex =
            currentIndex === -1 || currentIndex === focusables.length - 1
              ? 0
              : currentIndex + 1;
        }
        focusables[nextIndex].focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-back-title"
        tabIndex={-1}
        className="bg-base-100 text-base-content rounded-2xl border-4 border-base-content p-6 sm:p-8 z-10 w-11/12 max-w-lg relative outline-none"
      >
        <button
          aria-label="Close"
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          ×
        </button>

        <h3
          id="confirm-back-title"
          className="font-display text-2xl font-semibold mb-3 pr-8"
        >
          {title}
        </h3>
        <p className="mb-6 text-sm opacity-80">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            data-testid="modal-home"
            className="btn-pop btn-pop-accent min-h-12 px-6 text-base"
            onClick={() => {
              onClose();
              if (onHome) onHome();
            }}
          >
            Back to Home
          </button>
          <button
            data-testid="modal-settings"
            className="btn-pop btn-pop-ghost min-h-12 px-6 text-base"
            onClick={() => {
              onClose();
              if (onSettings) onSettings();
            }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
