# Wayfinder Map — Game Mode Screen Redesign

## Destination

The "Pick a game mode!" screen thematically matches the new homepage (sticker-book playful, photo showcase, Fredoka/Nunito), with very strong contrast in both `light` and `dark` themes — while keeping current options/functionality byte-for-byte (no new modes, no settings taxonomy changes in this effort).

## Notes

- Domain: `CONTEXT.md` — Game Mode, Mode Card, Game Options screen, Homepage Collage. Read `docs/agents/domain.md` before exploring.
- Skills: `frontend-design` + `design-taste-frontend` (you explicitly asked to find them) + `grill-me` breadth-first, then `tdd`.
- Standing: pnpm, daisyUI, no new deps unless grilled.

## Decisions so far

- [01-visual-language](../game-mode-screen/issues/01-visual-language.md) — card-forward sticker sheet, not photo-forward hero; the mode screen echoes the homepage's *tokens* (Fredoka/Nunito, thick-border sticker cards, flat surfaces) while the homepage retains its photo-showcase exclusivity
- [02-layout-flow](../game-mode-screen/issues/02-layout-flow.md) — mirrored `ModeTiles`: three sticker cards in `grid md:grid-cols-3`, selected state stuck-pressed, `OptionHeader` description inside the expanded tile, settings panel directly underneath; tapping a home card feels like the same card enlarged
- Contrast addendum (your 23/08 clarification) — very strong contrast requirement is scoped to **accent buttons + text** (`bg-accent`/`bg-primary` paired with `text-accent-content`/`text-primary-content`, `font-semibold` + `border-base-content` edge) in both `light` and `dark` themes, not to card-vs-page background photography

## Not yet specified

- Settings taxonomy changes (see `game-settings-v2` map) — deliberately excluded from this effort.

## Out of scope

- New game modes or settings fields (see `game-settings-v2` map).
- Changing `GameOptions` persistence (`pic-me:mode` / `pic-me:settings`).
