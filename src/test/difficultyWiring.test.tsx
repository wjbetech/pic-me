// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import MultipleChoiceSettings from "../components/GameOptions/MultipleChoiceSettings";
import HangmanSettings from "../components/GameOptions/HangmanSettings";
import OpenAnswerSettings from "../components/GameOptions/OpenAnswerSettings";
import type { Settings } from "../types/GameOptions";

const BASE: Settings = {
  blur: 0,
  showDescription: false,
  rounds: 10,
  difficulty: "all",
  lives: 5,
  mcHints: { enabled: false, type: "habitat" },
  hangmanHints: { enabled: false, type: "habitat" },
};

afterEach(cleanup);

describe("settings-v2 panel wiring", () => {
  it.each([
    ["Multiple Choice", MultipleChoiceSettings],
    ["Hangman", HangmanSettings],
    ["Open Answer", OpenAnswerSettings],
  ] as const)("%s panel emits difficulty changes", (_, Panel) => {
    const onChange = vi.fn();
    render(<Panel settings={BASE} onChange={onChange} />);

    fireEvent.change(screen.getByTestId("difficulty-select"), {
      target: { value: "easy" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as Settings;
    expect(next.difficulty).toBe("easy");
    // The rest of the settings object travels unchanged.
    expect(next.rounds).toBe(BASE.rounds);
  });

  it("defaults the select to All when difficulty is unset", () => {
    render(
      <OpenAnswerSettings
        settings={{ ...BASE, difficulty: undefined }}
        onChange={vi.fn()}
      />,
    );
    expect(
      (screen.getByTestId("difficulty-select") as HTMLSelectElement).value,
    ).toBe("all");
  });
});
