// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "../App";
import { persistence } from "../game-core/persistence";

/**
 * Suite (d): App routing state machine.
 *
 * The router is localStorage/sessionStorage-backed (see docs/HANDOFF.md §3).
 * Tests seed the documented progress-envelope format directly and assert
 * which screen renders — including the stale-route (>10 min) fallback to Home.
 */

const TEN_MIN_MS = 10 * 60 * 1000;

function seedNavigation(
  value: { route: string; mode: string | null },
  ageMs = 0,
) {
  window.sessionStorage.setItem(
    "picme.progress.navigation",
    JSON.stringify({ savedAt: Date.now() - ageMs, value }),
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

describe("App routing", () => {
  it("fresh visit lands on Home", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: /start playing/i })).toBeInTheDocument();
  });

  it("stale navigation (>10 min) is discarded and falls back to Home", () => {
    seedNavigation({ route: "play", mode: "hangman" }, TEN_MIN_MS + 5_000);

    render(<App />);

    // Home renders, not the Hangman screen the stale envelope pointed at.
    // (The homepage legitimately *mentions* Hangman as a mode tile, so
    // assert on the game screen's unique "Lives" counter instead.)
    expect(screen.getByRole("button", { name: /start playing/i })).toBeInTheDocument();
    expect(screen.queryByText(/Lives:/i)).toBeNull();

    // Stale progress for games must not survive either (same TTL group).
    expect(persistence.progress.load("hangman")).toBeNull();
  });

  it("valid navigation resumes mid-game within the TTL window", () => {
    seedNavigation({ route: "play", mode: "hangman" });

    render(<App />);

    expect(screen.getByRole("heading", { name: "Hangman" })).toBeInTheDocument();
  });

  it("options route restores the previously selected mode tab", () => {
    persistence.progress.save<string>("mode", "open-answer");
    seedNavigation({ route: "options", mode: "open-answer" });

    render(<App />);

    const tab = screen.getByRole("button", { name: "Open Answer" });
    expect(tab.getAttribute("aria-pressed")).toBe("true");
  });

  it("Start Playing advances Home → Options", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /start playing/i }));

    expect(screen.getByText(/pick a game mode/i)).toBeInTheDocument();
  });
});
