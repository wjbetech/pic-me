// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../App";
import { persistence } from "../game-core/persistence";

/**
 * Regression suite for .scratch/bugs/issues/02-mode-preselect.md
 *
 * Tapping a Mode Card on the home page must carry its mode intent forward so
 * the Game Options screen preselects that tile — while persistence still
 * covers refresh-without-context and direct navigation.
 */

const MODES = [
  { id: "multiple-choice", title: "Multiple Choice" },
  { id: "open-answer", title: "Open Answer" },
  { id: "hangman", title: "Hangman" },
] as const;

function seedNavigation(value: { route: string; mode: string | null }) {
  window.sessionStorage.setItem(
    "picme.progress.navigation",
    JSON.stringify({ savedAt: Date.now(), value }),
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("mode card preselect (02-mode-preselect)", () => {
  it.each(MODES)("tapping the $id home card preselects $title", ({ id, title }) => {
    render(<App />);

    // Home Mode Card — same id the GameOptions tabs use.
    fireEvent.click(screen.getByRole("button", { name: new RegExp(title, "i") }));

    // Game Options screen: the tapped tile must be preselected.
    const tab = screen.getByRole("button", { name: new RegExp(`^${title}`) });
    expect(tab.getAttribute("aria-pressed")).toBe("true");

    // Persistence respected: refresh keeps the preselected value.
    expect(persistence.progress.load<string>("mode")).toBe(id);
  });

  it("direct navigation without a card context falls back to the saved mode", () => {
    persistence.progress.save<string>("mode", "open-answer");
    seedNavigation({ route: "options", mode: "open-answer" });

    render(<App />);

    const tab = screen.getByRole("button", { name: /^Open Answer/ });
    expect(tab.getAttribute("aria-pressed")).toBe("true");
  });

  it("no card context and no saved mode falls back to Multiple Choice", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /start playing/i }));

    const tab = screen.getByRole("button", { name: /^Multiple Choice/ });
    expect(tab.getAttribute("aria-pressed")).toBe("true");
  });
});
