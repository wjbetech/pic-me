// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import GameOptions from "../components/GameOptions/GameOptions";
import { useUIStore } from "../store/themeStore";
import { persistence } from "../game-core/persistence";

/**
 * Suite (b): persistence contract regression tests.
 *
 * These lock in the Phase 0/1 storage architecture:
 * - ALL app writes go through game-core/persistence (namespaced keys)
 * - mode selection uses one JSON envelope encoding shared by writer+readers
 * - theme keeps its byte-exact legacy format for the index.html FOUC script
 *
 * The namespace-whitelist test is the structural guard: if anyone reintroduces
 * raw localStorage/sessionStorage calls outside the module, it fails.
 */

const KNOWN_KEY = /^(picme\.progress\.[^.]+|picme\.config\.[^.]+|picme\.theme)$/;

function assertOnlyKnownKeys() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      expect(key).toMatch(KNOWN_KEY);
    }
  }
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

describe("persistence contract", () => {
  it("GameOptions writes only namespaced keys", () => {
    render(<GameOptions />);

    assertOnlyKnownKeys();
  });

  it("mode selection round-trips through one shared encoding", async () => {
    render(<GameOptions />);

    // Writer side: user picks the Hangman tab.
    fireEvent.click(screen.getByRole("button", { name: /^Hangman/ }));
    await Promise.resolve();

    // Reader side (what App does): same module API, same key, same encoding.
    expect(persistence.progress.load<string>("mode")).toBe("hangman");

    // Raw encoding guard: the envelope must carry the value as JSON, so any
    // reader that assumes a different format fails here first.
    const raw = window.sessionStorage.getItem("picme.progress.mode");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual({
      savedAt: expect.any(Number),
      value: "hangman",
    });

    assertOnlyKnownKeys();
  });

  it("settings land in the durable config group", async () => {
    render(<GameOptions />);
    await Promise.resolve();

    const settings = persistence.config.load<Record<string, unknown>>(
      "settings",
    );
    expect(settings).not.toBeNull();
    expect(settings).toMatchObject({ blur: 0, showDescription: false });
    assertOnlyKnownKeys();
  });

  it("theme token stays byte-exact for the FOUC script", () => {
    // Store maps token -> data-theme at import time; toggling writes the
    // legacy raw key. index.html reads this exact byte sequence pre-React.
    useUIStore.getState().toggle();

    expect(window.localStorage.getItem("picme.theme")).toBe("dracula");

    useUIStore.getState().toggle();
    expect(window.localStorage.getItem("picme.theme")).toBe("cmyk");
  });

  it("no raw pic-me:* legacy keys are ever written", async () => {
    render(<GameOptions />);
    fireEvent.click(screen.getByRole("button", { name: /^Hangman/ }));
    await Promise.resolve();

    const allKeys = [
      ...Array.from({ length: window.sessionStorage.length }, (_, i) =>
        window.sessionStorage.key(i),
      ),
      ...Array.from({ length: window.localStorage.length }, (_, i) =>
        window.localStorage.key(i),
      ),
    ];

    // The old bug wrote 'pic-me:mode' as a raw string next to GameOptions'
    // JSON copy. This assertion fails if that pattern ever returns.
    expect(allKeys.filter((k) => k?.startsWith("pic-me:"))).toEqual([]);
  });
});
