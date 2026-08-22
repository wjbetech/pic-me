// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import ConfirmBackModal from "../components/ConfirmBackModal/ConfirmBackModal";

/**
 * Phase 3 a11y suite: the exit dialog must be keyboard-operable without
 * leaking focus to the page behind it.
 */
function Host({ onHome }: { onHome?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <ConfirmBackModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onHome={onHome}
        onSettings={() => setOpen(false)}
      />
    </div>
  );
}

const tab = () =>
  fireEvent.keyDown(window, { key: "Tab" });
const shiftTab = () =>
  fireEvent.keyDown(window, { key: "Tab", shiftKey: true });

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("ConfirmBackModal accessibility", () => {
  it("exposes role=dialog with aria-modal and a label", () => {
    const { container } = render(<Host />);
    fireEvent.click(screen.getByText("Open modal"));

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-labelledby")).toBe(
      "confirm-back-title",
    );
  });

  it("moves focus into the dialog on open", () => {
    render(<Host />);
    fireEvent.click(screen.getByText("Open modal"));

    const dialog = document.querySelector('[role="dialog"]');
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
    expect(dialog?.contains(document.activeElement)).toBe(true);
  });

  it("traps Tab cycling inside the dialog", () => {
    const { container } = render(<Host />);
    fireEvent.click(screen.getByText("Open modal"));

    const focusables = Array.from(
      container
        .querySelector('[role="dialog"]')!
        .querySelectorAll<HTMLElement>("button"),
    );
    expect(focusables.length).toBe(3); // close ×, Home, Settings

    // Walk forward past the last control — focus must wrap to the first.
    let active: HTMLElement | null = null;
    for (let i = 0; i < 6; i++) {
      tab();
      active = document.activeElement as HTMLElement;
      expect(focusables).toContain(active);
    }

    // Shift+Tab from the first wraps to the last.
    (focusables[0] as HTMLElement).focus();
    shiftTab();
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);
  });

  it("returns focus to the trigger after closing", () => {
    render(<Host />);
    const trigger = screen.getByText("Open modal");
    // Real browsers focus a button on click; jsdom does not, so model that.
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByTestId("modal-home"));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("Escape closes the dialog", () => {
    render(<Host />);
    fireEvent.click(screen.getByText("Open modal"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("calls onHome when Back to Home is chosen", () => {
    const onHome = vi.fn();
    render(<Host onHome={onHome} />);
    fireEvent.click(screen.getByText("Open modal"));

    fireEvent.click(screen.getByTestId("modal-home"));

    expect(onHome).toHaveBeenCalledTimes(1);
  });
});
