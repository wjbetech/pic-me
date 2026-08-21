# PicMe — Active Work

Concise actionable checklist. Architectural context, phase details, and acceptance criteria live in [`HANDOFF.md`](./HANDOFF.md) (§9 roadmap). Completed work is logged in [`MILESTONES.md`](./MILESTONES.md), not here.

Legend: `[ ]` open · `[x]` done · `(P0)`…`(P4)` = roadmap phase.

## Phase 0 — Stabilize & truth-up

- [ ] (P0) Prune obsolete branches locally + on origin: `backup-before-mass-reset/*`, `backup-before-rollback-*` (all merged into master)
- [ ] (P0) Create `src/game-core/persistence.ts`: namespaced load/save/clear over sessionStorage, JSON encoding, 10-min TTL for progress namespaces, durable namespaces for settings/theme — with unit tests
- [ ] (P0) Migrate all raw storage call-sites onto the persistence module (inventory: HANDOFF §3) — route/mode/progress session-scoped+TTL, settings/theme durable
- [ ] (P0) Collapse `src/store/themeStore.js` + `themeStore.ts` into one TS module (the `.js` copy currently shadows the `.ts` at runtime)
- [ ] (P0) Fix 3 lint errors: `GameMessages.tsx:74` (no-empty), `useLocalJSON.ts:8,17` (unused params)
- [ ] (P0) Remove `DEBUG_SELECTION` flag and leftover debug logging (~45 console.* sites)
- [ ] (P0) Delete dead files: `store/picMeStore.ts`, `context/ThemeContext.js`, `utils/letterBox.ts`
- [ ] (P0) Seed `.github/workflows/ci.yml`: lint → tsc → `vitest run --passWithNoTests`
- [ ] (P0) Manual QA matrix: refresh <10 min resumes each mode incl. Hangman; >10 min or tab close → Home; settings/theme survive restarts; mode-tab no longer resets after playing

## Phase 1 — One game core

- [ ] (P1) Build `src/game-core/`: injected RNG, rotation, rounds, scoring — zero React/bundler/storage imports
- [ ] (P1) Migrate games smallest-first: OpenAnswer → MultiChoice → Hangman (preserve MultiChoice stale-request guard semantics)
- [ ] (P1) Test suites: game-core units (injected RNG), mode-key contract regression, restore-flow per mode w/ mocked storage, App routing state machine incl. >10-min fallback

## Phase 2 — Real settings + finish Open Answer

- [ ] (P2) Make hints real: per-mode toggles rendering habitat/diet/description from the data schema
- [ ] (P2) Open Answer: rounds + session-scoped persisted score; receive its settings from GameOptions
- [ ] (P2) Unify lives default (5, clamp 5–15) across HangmanSettings/Hangman
- [ ] (P2) Disable Hangman letter/Enter listeners while ConfirmBackModal is open
- [ ] (P2) Port `OpenAnswer.css` off dead daisyUI v3/v4 vars (`--b3/--su/--er`) onto v5 tokens
- [ ] (P2) Settings-wiring tests proving hint toggles affect rendered hints

## Phase 3 — Content curation + responsive/a11y

- [ ] (P3) Work through `src/data/appendix.md` image-quality list (links verified healthy; this is curation, not repair) — timeboxed
- [ ] (P3) Responsive QA matrix: 360×800, 375×812, 412×915, 768×1024, 1366×768, 1920×1080 — incl. Hangman keyboard scaling and "all four MC options visible on mobile"
- [ ] (P3) Investigate MultiChoice scroll-jump on new animal load (open question, not yet reproduced)
- [ ] (P3) ConfirmBackModal: focus trap + focus return
- [ ] (P3) Navbar: replace hardcoded `text-amber-500` with a theme token

## Deferred (do not start without owner approval)

See HANDOFF §11: monorepo split · highscores/API/auth · sounds feature · homepage redesign · framer-motion upgrade & PWA (Phase 4 gate only).
