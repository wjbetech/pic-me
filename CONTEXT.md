# CONTEXT

Ubiquitous language for pic-me.

## Glossary

| Term | Definition |
|------|------------|
| Animal | One entry in the curated dataset (`src/data/animals*.json`) — id, commonName, latinName, images, habitat, difficulty. Displayed on game cards and the marquee. |
| Game Mode | One of three play styles selected on the "Pick a game mode!" screen: multiple-choice, open-answer, hangman. Each has its own settings and route (`mode` persisted via the session-persistence module). |
| Mode Card | The three tiles on the home page under "Three ways to play" — each links to that mode's settings. Now mirrored as sticker cards on the Game Options screen (card-forward decision 23/08). |
| Game Options / Pick a Game Mode screen | The pre-game settings screen (`src/components/GameOptions/`) — mode sticker tiles mirroring the home Mode Cards, with the selected tile stuck-pressed and settings in an expanded sticker beneath. Persists selection to `picme.progress.mode` / `picme.config.settings` and must survive refresh without resetting. Card-forward sticker sheet that echoes homepage tokens, not photos. |
| Homepage Collage | Dedicated `HOME_PHOTOS` set (12 Wikimedia Commons lead images, 1920px) decoupled from the in-game dataset. See `src/data/homePhotos.ts`. Deferred collage concept now shipped as the marquee (the page's ONE perpetual motion). |
| Hint / Hint Line | Optional gameplay aid rendered via shared `src/components/common/HintLine.tsx` + core `src/game-core/hints.ts` (`getHintText`). Controlled per-mode via `Settings.mcHints` / `hangmanHints` (`{enabled, type: "habitat"|"diet"|"description"}`). |
| Home Photo Set | Curated, watermark-free homepage images (`src/data/homePhotos.ts`) — hero + marquee. Distinct from the in-game dataset which still holds 20 premium Unsplash+ previews. |
| Session Persistence | The `src/game-core/persistence` + `useAnimals` layer that restores current animal/progress across reloads and HMR without a backend. Progress namespaces carry a 10-min TTL; config namespaces are durable. |
| Theme | Light/dark via daisyUI (`src/store/themeStore` + `src/context/ThemeContext`). Must keep contrast parity between themes; accent buttons use paired `text-*-content` tokens + `border-base-content` edge for very strong contrast. |
| Navbar (Home) | Sticky, transparent at scroll 0 with scrim strip + white-with-shadow text; becomes `bg-base-100/80 backdrop-blur-md` glass after hero. See `.scratch/home-navbar/map.md`. |
| Modal (Game Exit) | Confirmation dialog for leaving a game (`src/components/ConfirmBackModal/`). Focus trap + return, dialog semantics. Slated for visual reskin to match homepage sticker language. |

## Open questions

- Should the homepage collage recycle into the Game Options screen as a top accent strip, or stay exclusive to the homepage? (Resolved 23/08: stays homepage-exclusive — Game Options is card-forward, not photo-forward.)
- Is "Pick a game mode!" the final headline copy, or should it mirror the hero's benefit-led voice?
