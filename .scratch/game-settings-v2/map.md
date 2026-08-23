# Wayfinder Map — Per-Mode Settings v2

## Destination

A coherent, per-mode settings taxonomy (beyond today's rounds/difficulty hints) plus the user flow that exposes it — each mode gets the controls that matter for *that* mode, without leaking another mode's concepts, and every control visibly affects gameplay.

Inbox seeded this as: "Number of rounds. Animal difficulty. etc." — the etc. is the fog.

## Notes

- Domain: `CONTEXT.md` — Game Mode, Game Options screen, Animal difficulty, Hint Line. Update the glossary as terms like "difficulty" get pinned (filter by `difficulty` field vs image blur vs hint gating?).
- Skills: `grill-me` + `domain-modeling` together (one question at a time, sharpening CONTEXT.md), then `tdd` for implementation.
- Current taxonomy lives in `src/types/GameOptions.ts: Settings` and `src/store/themeStore` — read them before grilling.

## Decisions so far

- [01-settings-taxonomy](../game-settings-v2/issues/01-settings-taxonomy.md) — taxonomy = rounds + difficulty (pool filter Easy/Medium/Hard/All via `Animal.difficulty`); time pressure / hint budgets deferred until playtesting

## Not yet specified

- Full settings list per mode (what "difficulty" actually filters).
- Whether difficulty is a pre-game filter or a mid-game progression.

## Out of scope

- New game modes (see HANDOFF §11).
