# PicMe — Active Work

Concise actionable checklist. Architectural context, phase details, and acceptance criteria live in [`HANDOFF.md`](./HANDOFF.md) (§9 roadmap). Completed work is logged in [`MILESTONES.md`](./MILESTONES.md), not here.

Legend: `[ ]` open · `[x]` done · `(P0)`…`(P4)` = roadmap phase.

## Phase 0 — Stabilize & truth-up

- [x] (P0) Prune obsolete branches locally + on origin: `backup-before-mass-reset/*`, `backup-before-rollback-*` (all merged into master) — 33 local refs deleted; origin had none
- [x] (P0) Create `src/game-core/persistence.ts`: namespaced load/save/clear over sessionStorage, JSON encoding, 10-min TTL for progress namespaces, durable namespaces for settings/theme — with unit tests (12 tests, PR #1)
- [x] (P0) Migrate all raw storage call-sites onto the persistence module — route/mode/progress session-scoped+TTL, settings/theme durable (PR #2; also resolved all 3 lint errors as a side effect)
- [x] (P0) Collapse `src/store/themeStore.js` + `themeStore.ts` into one TS module routed through persistence (PR #3)
- [x] (P0) Fix 3 lint errors — resolved via PR #2 (`useLocalJSON` deleted, `GameMessages` empty catch replaced); lint now exits 0
- [x] (P0) Remove `DEBUG_SELECTION` flag and leftover debug logging (~45 console.* sites); error-path warns kept (PR #4)
- [x] (P0) Delete dead files: `store/picMeStore.ts`, `context/ThemeContext.js`, `utils/letterBox.ts` (PR #5)
- [x] (P0) Seed `.github/workflows/ci.yml`: lint → tsc → vitest — green on first run (PR #6)
- [ ] (P0) Manual QA matrix: refresh <10 min resumes each mode incl. Hangman; >10 min or tab close → Home; settings/theme survive restarts; mode-tab no longer resets after playing — **needs a browser pass (Vercel preview deploys on every PR make this easy)**

## Phase 1 — One game core

- [x] (P1) Build `src/game-core/`: injected RNG, rotation, rounds — zero React/bundler/storage imports (PRs #8, #9; purity enforced via eslint no-restricted-imports)
- [x] (P1) Migrate games smallest-first: OpenAnswer (#10) → MultiChoice (#12) → Hangman (#11); stale-request guard semantics preserved; `utils/rotation.ts` deleted
- [x] (P1) Test suites: game-core units w/ injected RNG (a), mode-key contract regression (b), restore-flow per mode (c), App routing state machine incl. >10-min fallback (d) — 46 tests across 8 files (PRs #8/#13/#14)
- [ ] (P1) Browser parity pass: one round of each mode + refresh-resume check (Vercel preview deploys available per PR)

## Phase 2 — Real settings + finish Open Answer

- [x] (P2) Make hints real: per-mode toggles rendering habitat/diet/description from the data schema (PR #17)
- [x] (P2) Open Answer: rounds + session-scoped persisted score; receives its settings from GameOptions (PR #18)
- [x] (P2) Unify lives default (5, clamp 5–15) across HangmanSettings/Hangman (PR #19)
- [x] (P2) Disable Hangman letter/Enter listeners while ConfirmBackModal is open (PR #20)
- [x] (P2) Port `OpenAnswer.css` off dead daisyUI v3/v4 vars (`--b3/--su/--er`) onto v5 tokens — and wire the flash classes, which were never applied to the input at all (PR #21)
- [x] (P2) Settings-wiring tests proving hint toggles affect rendered hints, plus OA round completion (PR #22; found+fixed a real lock-out bug in OA completion semantics)
- [ ] (P2) Browser pass: both themes × mobile width spot check; flash animations visibly fire on correct/wrong

## Phase 3 — Content curation + responsive/a11y

- [x] (P3) Full-dataset link sweep: 145 URLs HEAD-checked 2026-08-22; one broken (Quoll q-5, Wikimedia oversized-thumb 400) repaired to 1280px — zero known-bad images remain (PR #27)
- [x] (P3) ConfirmBackModal: focus trap + focus return + dialog semantics, with a 6-test a11y suite (PR #24)
- [x] (P3) Navbar: replace hardcoded `text-amber-500` with a theme token (PR #25)
- [x] (P3) Conservative mobile-density tweaks: MC answer grid gap/padding and Hangman keyboard height/gap below `sm` (PR #26)
- [x] (P3) MC scroll-jump on new-load: investigated, no reproduction — image preloading + reserved Next-button space already mitigate the historical causes
- [ ] (P3) **Owner sign-off:** breakpoint matrix QA (360×800, 375×812, 412×915, 768×1024, 1366×768, 1920×1080) via Vercel previews — confirm the density tweaks read well and nothing clips

## Phase 4 — Hygiene gate

- [x] (P4) framer-motion ^10.18 → 13.1.1 — native React 19 peers, all animation APIs unchanged (PR #29)
- [x] (P4) Delete `.npmrc` legacy-peer-deps flag; fresh strict-peer install verified; CI installs flag-free (PR #30)
- [ ] (P4) Animation-parity eyeball check rides along with the pending owner browser pass
- [x] (P4) pnpm made canonical: pnpm-lock.yaml + pnpm-workspace.yaml committed, package-lock.json deleted, CI switched to `pnpm install --frozen-lockfile` with version pinned via package.json `packageManager` field
- [ ] (P4) PWA manifest + CSP headers: **deferred by design** until the companion-app direction (or a security requirement) justifies them

## Phase 5 — Homepage & Game Options polish (from 23/08 QA)

> Full decision maps for the two large redesigns live in `.scratch/` — this section is the sequenced checklist that consumes their tickets.

- [x] (P5) Remove homepage eyebrow "Free · No sign-up · No ads" (single line in `src/components/home/Hero.tsx:59`)
- [x] (P5) Enlarge hero headline "Learning animal names is hard. We made it a game." + adopt a more distinctive display face (see HOMEPAGE-BRIEF §4 sticker-book direction; Fredoka already in use) — headline now text-5xl/6xl/7xl; display face switched Fredoka → Baloo 2 (@fontsource-variable/baloo-2, brief §4 sanctioned alternative)
- [x] (P5) Restyle `Start Playing` button — new approachable/educational font, remove hard shadow `shadow-[0_6px_0_0_rgba(0,0,0,0.45)]` (Hero.tsx:72) — inherits Baloo 2 via font-display; hard shadow + active compensation removed, press softened to scale
- [x] (P5) Hide scrollbar on the animal image carousel while preserving scroll (`src/index.css:32` `.scrollbar-hidden` already exists — apply to marquee)
- [x] (P5) Fix Next Animal glow clipping: `ring-glow` on the button is cut off by the `Back to Menu` chunk's overflow (Game page, `src/components/Hangman/GameMessages.tsx` / `src/components/MultiChoice/MultiChoice.tsx:578`) — see `.scratch/game-mobile/issues/02-next-animal-glow.md` (fixed in #43)
- [x] (P5) Game Options screen redesign → see `.scratch/game-mode-screen/map.md` (wayfinder; 4 tickets, grill-me + design skills per your brief) — ModeStickers replace tabs (stuck-pressed selected tile + Picked! badge), settings as expanded sticker, OptionHeader dissolved into tiles
- [x] (P5) Home navbar redesign → see `.scratch/home-navbar/map.md` (wayfinder; transparent + glass-on-scroll vs top-fixed)
- [x] (P5) Game modal redesign → see `.scratch/game-modal/issues/01-modal-redesign.md` — sticker card (rounded-2xl, border-4), Baloo title, split actions: Home = accent sticker button, Settings = bordered base-100; a11y contract untouched

## Deferred (do not start without owner approval)

See HANDOFF §11: monorepo split · highscores/API/auth · sounds feature. (Homepage redesign shipped 2026-08-23 — see docs/HOMEPAGE-BRIEF.md.)

## Known Issues (from 23/08 QA — triaged as `bug`)

Repairable now; each has a `.scratch/bugs/issues/` ticket with verification steps and a proposed agent brief. Fix or move to `wontfix` via triage:

- [x] Fix MC images not loading — see `.scratch/bugs/issues/01-mc-images.md` (fixed in #41)
- [x] Fix Game Options mode preselect ignoring home card — see `.scratch/bugs/issues/02-mode-preselect.md` (fixed in #42)
- [x] Draft per-mode settings taxonomy (rounds, difficulty, etc.) + user flow → see `.scratch/game-settings-v2/map.md` — drafted (ticket 01), then implemented: difficulty pool filter live on all modes (#48)
