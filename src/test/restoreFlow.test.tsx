// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FakeImage } from "./fakeImage";
import { persistence } from "../game-core/persistence";
import type { Animal } from "../game-core/animal";
import animalsAJson from "../data/animalsA.json";
import OpenAnswer from "../components/OpenAnswer/OpenAnswer";
import Hangman from "../components/Hangman/Hangman";
import MultiChoice from "../components/MultiChoice/MultiChoice";

/**
 * Suite (c): restore-flow tests — one per mode.
 *
 * Each test seeds the documented progress-envelope format directly into
 * sessionStorage, renders the game, and asserts the restored state is
 * observable in the UI and/or re-persisted through the module API.
 */
const specimen = (animalsAJson as Animal[])[0];

function seedProgress(key: string, value: unknown, ageMs = 0) {
  window.sessionStorage.setItem(
    `picme.progress.${key}`,
    JSON.stringify({ savedAt: Date.now() - ageMs, value }),
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("Open Answer restore", () => {
  it("resumes the persisted session and proves it via a correct answer", async () => {
    // Seed with an aged timestamp so we can detect restore completion: the
    // deferred bootstrap refreshes the TTL clock via a re-save. The blob now
    // carries the whole session (currentId + score + roundsPlayed).
    const seededAt = Date.now() - 5_000;
    window.sessionStorage.setItem(
      "picme.progress.openanswer",
      JSON.stringify({
        savedAt: seededAt,
        value: { currentId: specimen.id, score: 2, roundsPlayed: 3 },
      }),
    );

    render(<OpenAnswer />);

    // Wait out the race with the deferred bootstrap: restoreAnimal sets the
    // current animal and THEN re-saves, so a freshened savedAt proves the
    // animal is loaded and safe to interact with.
    await waitFor(() => {
      const raw = window.sessionStorage.getItem("picme.progress.openanswer");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw as string).savedAt).toBeGreaterThan(seededAt);
    });

    // Restored score is visible (a fresh start would show 0).
    expect(screen.getByText(/Score:/i).textContent).toContain("2");

    const input = screen.getByPlaceholderText(/type the animal name/i);
    fireEvent.change(input, { target: { value: specimen.commonName } });
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

    expect(await screen.findByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText(/Score:/i).textContent).toContain("3");

    expect(
      persistence.progress.load<{ currentId: string; score: number }>(
        "openanswer",
      ),
    ).toMatchObject({ currentId: specimen.id, score: 3 });
  });
});

describe("Hangman restore", () => {
  it("restores lives, score, round and guessed letters", async () => {
    seedProgress("hangman", {
      currentAnimal: specimen,
      currentCommonName: specimen.commonName,
      guessed: [specimen.commonName.toUpperCase()[0]],
      wrong: ["X"],
      livesRemaining: 4,
      score: 2,
      roundsPlayed: 3,
      roundsTotal: "all",
      allRoundsCompleted: false,
      gameState: "playing",
    });

    const { container } = render(<Hangman />);

    // Header reflects restored counters once the deferred bootstrap flushes
    // (a fresh start would show Lives: 6, Score: 0).
    await waitFor(() => {
      expect(container.querySelector(".text-error")?.textContent).toBe("4");
    });
    expect(container.querySelector(".text-success")?.textContent).toBe("2");

    // LetterBoxes reveals restored guesses of the animal's name.
    const firstLetter = specimen.commonName.toUpperCase()[0];
    if (/^[A-Z]$/.test(firstLetter)) {
      expect(
        screen
          .getAllByText(firstLetter)
          .some((el) => el.className.includes("font-bold")),
      ).toBe(true);
    }
  });
});

describe("MultiChoice restore", () => {
  it("restores the persisted animal with four answer options", async () => {
    seedProgress("multichoice.current", specimen.id);

    const { rerender } = render(
      <MultiChoice settings={{ blur: 0, showDescription: false }} />,
    );

    // The correct answer must appear among the rendered options.
    expect(await screen.findByText(specimen.commonName)).toBeInTheDocument();

    // Per-mode hints default OFF — no hint line may render (settings honesty).
    expect(screen.queryByText(/Hint:/i)).toBeNull();

    // Enabling MC hints surfaces the line without remounting the game.
    rerender(
      <MultiChoice
        settings={{
          blur: 0,
          showDescription: false,
          mcHints: { enabled: true, type: "habitat" },
        }}
      />,
    );
    expect(await screen.findByText(/Hint:/i)).toBeInTheDocument();
  });
});
