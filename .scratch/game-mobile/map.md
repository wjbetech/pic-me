# Wayfinder Map — Game Page Mobile Polish

## Destination

The three game modes (Multiple Choice, Hangman, Open Answer) feel equally polished on 360×800 phones as on desktop — no clipped glows, readable typography, reachable controls, verified across the breakpoint matrix from TODO Phase 3.

## Notes

- Domain: `CONTEXT.md` — Hint Line, Animal, Game Mode. Mobile signals are first-class (see pnpm canonical decision: phone parity is a goal).
- Skills: `tdd` for fixes, `design-taste-frontend` VISUAL_DENSITY dial for spacing, `diagnosing-bugs` for the clipping root cause.

## Decisions so far

- [01-mobile-audit](../game-mobile/issues/01-mobile-audit.md) — static code audit across 360/375/412/768/ desktop: keyboard 36px <44px, Header gap-6 tight at 360, LetterBoxes overflow on 10-letter names, Open Answer input h-8 undersized; all flagged for live device verification before graduating new tickets. Glow clipping confirmed as already-ticketed.

## Not yet specified

- Whether the mobile audit surfaces new tickets beyond the two already filed.

## Out of scope

- New game modes or settings (see `game-settings-v2`).
