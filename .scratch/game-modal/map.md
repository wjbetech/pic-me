# Wayfinder Map — Game Exit Modal Redesign

## Destination

The "Leave this game?" modal (`src/components/ConfirmBackModal/ConfirmBackModal.tsx`) looks like the rest of the app — professional, modern, and consistent with the new homepage's sticker-book language, while preserving its existing focus trap/return and dialog semantics (PR #24).

## Notes

- Domain: Game Mode, Game Options screen.
- Skills: `grill-me` for art direction (one question at a time), `design-taste-frontend` for material/shadow/card discipline.

## Decisions so far

- [01-modal-redesign](../game-modal/issues/01-modal-redesign.md) — Fredoka display for "Leave this game?", flat sticker cards, scrim `bg-black/50`, two sticker-button actions

## Out of scope

- Changing modal behavior (Back to Home vs Back to Settings) — already correct per persistence model.

## Not yet specified

- Whether the modal should use the homepage's Fredoka display face or stay body-typed.
