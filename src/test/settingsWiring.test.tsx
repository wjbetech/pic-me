// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FakeImage } from "./fakeImage";
import App from "../App";
import GameOptions from "../components/GameOptions/GameOptions";
import Hangman from "../components/Hangman/Hangman";
import OpenAnswer from "../components/OpenAnswer/OpenAnswer";
import { persistence } from "../game-core/persistence";
import type { Settings } from "../types/GameOptions";
import type { Animal } from "../game-core/animal";
import animalsAJson from "../data/animalsA.json";

/**
 * Suite (e): settings-wiring.
 *
 * Proves the full chain promised by "no control lies": panel toggle →
 * durable settings → game renders the configured behavior.
 */
const specimen = (animalsAJson as Animal[])[0];

function seedProgress(key: string, value: unknown) {
  window.sessionStorage.setItem(
    `picme.progress.${key}`,
    JSON.stringify({ savedAt: Date.now(), value }),
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  // afterEach calls vi.unstubAllGlobals(), which removes setup.ts's global
  // IntersectionObserver stub; restore it for tests rendering <App />.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("hint toggles reach durable settings", () => {
  it("Multiple Choice panel persists its own hint preference", async () => {
    render(<GameOptions />);

    fireEvent.click(screen.getByLabelText("Enable hints"));
    fireEvent.change(screen.getByDisplayValue("Habitat"), {
      target: { value: "diet" },
    });

    await waitFor(() => {
      expect(persistence.config.load<Settings>("settings")?.mcHints).toEqual({
        enabled: true,
        type: "diet",
      });
    });
  });

  it("Hangman hints persist via the hangman-config page", async () => {
    // Lives + hint preference moved off the configure panel to their own
    // page (keeps /configure height-stable). Travel there through App so
    // App-level settings persistence is exercised too.
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /start playing/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Hangman/ }));
    fireEvent.click(
      await screen.findByTestId("hangman-more-options"),
    );

    const hangmanToggle = await screen.findByTestId(
      "hangman-hints-enabled",
    );
    fireEvent.click(hangmanToggle);

    const typeSelect = screen.getByDisplayValue("Habitat");
    fireEvent.change(typeSelect, { target: { value: "description" } });

    await waitFor(() => {
      const settings = persistence.config.load<Settings>("settings");
      expect(settings?.hangmanHints).toEqual({
        enabled: true,
        type: "description",
      });
      // Per-mode isolation: MC hints remain untouched at their default.
      expect(settings?.mcHints).toEqual({ enabled: false, type: "habitat" });
    });
  });
});

describe("hangmanHints affect rendered gameplay", () => {
  it("renders the diet hint when enabled and none when disabled", async () => {
    const withDiet: Settings = {
      lives: 5,
      rounds: "all",
      hangmanHints: { enabled: true, type: "diet" },
    };
    seedProgress("hangman", {
      currentAnimal: specimen,
      guessed: [],
      wrong: [],
      livesRemaining: 5,
      score: 0,
      roundsPlayed: 1,
      roundsTotal: "all",
      allRoundsCompleted: false,
      gameState: "playing",
    });

    const { rerender } = render(<Hangman settings={withDiet} />);

    expect(
      await screen.findByText(
        `Hint: Eats ${specimen.food.join(", ")}`,
      ),
    ).toBeInTheDocument();

    rerender(
      <Hangman
        settings={{
          ...withDiet,
          hangmanHints: { enabled: false, type: "diet" },
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByText(/Hint:/i)).toBeNull();
    });
  });
});

describe("Open Answer honors the rounds setting", () => {
  it("locks the round after the configured limit and shows the summary", async () => {
    vi.stubGlobal("Image", FakeImage);
    const seededAt = Date.now() - 5_000;
    window.sessionStorage.setItem(
      "picme.progress.openanswer",
      JSON.stringify({
        savedAt: seededAt,
        value: { currentId: specimen.id, score: 0, roundsPlayed: 1 },
      }),
    );

    render(<OpenAnswer settings={{ rounds: 1 }} />);

    // Gate on the deferred bootstrap's re-save before interacting.
    await waitFor(() => {
      const raw = window.sessionStorage.getItem("picme.progress.openanswer");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string).savedAt).toBeGreaterThan(seededAt);
    });

    const input = screen.getByPlaceholderText(/type the animal name/i);
    fireEvent.change(input, { target: { value: specimen.commonName } });
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(await screen.findByText("Correct!")).toBeInTheDocument();
    expect(await screen.findByText(/All rounds completed!/i)).toBeInTheDocument();

    // Input is locked once the session completes.
    expect(screen.getByPlaceholderText(/type the animal name/i)).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /next animal/i }),
    ).toBeNull();
  });
});
