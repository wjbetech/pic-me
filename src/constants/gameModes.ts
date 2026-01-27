export type GameMode = {
  id: string;
  title: string;
  desc?: string;
};

export const OPTIONS: GameMode[] = [
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    desc: "Choose the correct name from a list of options.",
  },
  {
    id: "open-answer",
    title: "Open Answer",
    desc: "Type the animal name yourself for a freer challenge.",
  },
  {
    id: "hangman",
    title: "Hangman",
    desc: "Guess letters to reveal the animal name.",
  },
];

export default OPTIONS;
