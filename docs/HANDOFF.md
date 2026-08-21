# PicMe — Engineering Handoff

**Status:** authoritative engineering brief. A coding agent should be able to start **Phase 0** from this document alone.
**Baseline:** HEAD `3054317` ("fixing the bunk Jerboa url", 2026-01-29) · `master == origin/master` · docs redrafted 2026-08-21.

## How to read this document

State is tagged explicitly. Do not treat PLANNED or DEFERRED items as existing code.

| Tag | Meaning |
|---|---|
| **[CURRENT]** | Exists in the repository today; verified by direct inspection, builds, lint runs, or bundle inspection at HEAD `3054317`. |
| **[PLANNED]** | Agreed next work (see §9 roadmap). Not yet implemented — do not assume it exists. |
| **[DEFERRED]** | Deliberately postponed; do not build without owner approval. |
| **[DECIDED]** | Owner decision (2026-08-21) that overrides older code behavior. |

Companion documents: [`TODO.md`](./TODO.md) (concise actionable checklist), [`MILESTONES.md`](./MILESTONES.md) (append-only history), [`../src/data/appendix.md`](../src/data/appendix.md) (image curation list).

---

## 1. Project purpose

PicMe is a client-only web game for learning animal names: the player sees an animal photo and identifies it via one of three modes — **Multiple Choice**, **Hangman**, **Open Answer** — over a static dataset of **122 animals** in 26 per-letter JSON files (`src/data/animalsA.json` … `animalsZ.json`), photos hotlinked from Unsplash/Wikimedia. Audience is casual/kids; desktop web and mobile browser parity are both first-class. [CURRENT]

Long-term product direction: web app remains primary; a **companion mobile app is a plausible future addition**, which is why game logic is being centralized into a dependency-free core that could later be shared. [DECIDED]

## 2. Current architecture

Client-only React SPA. **No backend, API, database, auth, or environment variables exist anywhere in the repo.** All persistence is browser storage. [CURRENT]

```
index.html              inline <head> script: anti-FOUC theme bootstrap (reads localStorage "picme.theme",
                        sets data-theme=light|dark + .dark class before first paint)
src/
  main.tsx              StrictMode root; renders <App/> (no providers mounted)
  App.tsx               ROUTER: useState machine route ∈ {home, options, play} + mode + merged
                        gameSettings; persisted to localStorage pic-me:* keys; renders one game per
                        (route, mode); contains leftover debug logging incl. a render-path IIFE
  components/
    Main/               landing page (wallpaper hero, feature cards; "Immersive Sounds" card is a
                        labeled COMING SOON placeholder)
    Navbar/             brand button (hardcoded text-amber-500) + ThemeToggle
    GameOptions/        pre-game menu: ModeTabs + MultipleChoiceSettings / HangmanSettings /
                        OpenAnswerSettings panels + ActionRow; selection & settings persisted via
                        utils/useLocalJSON.ts
    MultiChoice/        game 1 (+ DisplayCard/, AnswerGrid/, colocated CSS). Most intricate logic:
                        stale-request guards around async image preloading (loadRequestIdRef,
                        loadTimeoutRef) — these encode real fixed bugs; preserve their semantics
    Hangman/            game 2 (+ Keyboard, LetterBoxes, Header, GameMessages, AnimalImage).
                        Most complete persistence: full state blob under picme-hangman-state-v1
    OpenAnswer/         game 3 (+ OpenAnswerForm). Thinnest mode: no rounds, score memory-only,
                        receives no settings props
    BackButton/ , ConfirmBackModal/   shared exit affordances (modal: Escape closes; no focus trap)
    common/MotionDiv.tsx  any-typed motion.div alias
    ThemeToggle/
  data/                 animalsA–Z.json (122 animals, every entry has ≥1 image URL) + appendix.md
  store/themeStore.js   zustand useUIStore — THE LIVE COPY (see §7 debt #1)
  store/themeStore.ts   typed twin — SHADOWED, dead at runtime
  store/picMeStore.ts   DEAD (zero importers)
  context/ThemeContext.js  DEAD (zero importers; never mounted)
  utils/                rotation.ts (shuffled queue; used only by MultiChoice), normalizeAnswer.ts,
                        openAnswer.ts (pickRandomAnimal/preloadImage), useLocalJSON.ts (used only by
                        GameOptions), letterBox.ts (DEAD, zero importers)
  hooks/useFlash.ts     correct/wrong flash timer for OpenAnswer
  constants/gameModes.ts  OPTIONS: ids multiple-choice | open-answer | hangman
```

Stack: React 19.2 · TypeScript 5.9 strict (`tsc -b`, project refs app/node) · Vite 7.3 · Tailwind CSS v4 via `@tailwindcss/vite` · daisyUI 5.5.14 loaded CSS-first (`@plugin "daisyui"` in `src/index.css`) · zustand 5 (theme store only) · framer-motion 10.x · react-icons 5. [CURRENT]

Theming model: exactly two themes exist in emitted CSS — `[data-theme=light]` and `[data-theme=dark]` (verified against built bundle). The store keeps internal tokens `'cmyk' | 'dracula'` and maps them to those attribute values. Nothing uses Tailwind `dark:` variants today; the `.dark` class sync is harmless but currently pointless. Root `tailwind.config.js` is **inert** (Tailwind v4 never reads it; no `@config` directive exists). [CURRENT]

## 3. Current state-management & persistence architecture

### Where state lives today [CURRENT — since Phase 0]

One owner: `src/game-core/persistence.ts` (PR #1/#2). Two groups: **`progress`** = sessionStorage, JSON envelope with `savedAt`, 10-minute TTL refreshed on every save; expired/corrupt entries self-heal. **`config`** = durable localStorage.

| Namespace | Group | Contents |
|---|---|---|
| `navigation` | progress | `{route, mode}` — validated on load; stale → Home |
| `hangman` | progress | full round state blob |
| `multichoice.current`, `openanswer.current` | progress | current animal id |
| `settings` | config | game settings (durable) |
| `picme.theme` (raw byte-exact legacy key) | config | theme token; read by index.html FOUC script |

Legacy `pic-me:*` keys and `picme-hangman-state-v1` are swept/ignored on load. The former mode-key raw-vs-JSON bug is structurally impossible now (single encoding). Theme store (`src/store/themeStore.ts`) routes through the module's raw methods; no other file touches storage directly.

### Intended persistence model [CURRENT — implemented in Phase 0; manual QA matrix pending] [DECIDED]

One module owns all app persistence. Semantics:

- **Session-scoped (expire):** `route`, `mode`, per-game progress/state. Underlying mechanism: `sessionStorage` (tab close = reset comes free), wrapped with a **10-minute TTL**: refreshing/revisiting within 10 minutes resumes mid-game; after >10 minutes stale progress is discarded and the user lands on Home. TTL timestamp refreshes on each save (i.e., measured from last state change, not first visit).
- **Durable configuration (never expires):** settings preferences (`blur`, `showDescription`, hints toggles, rounds, lives) and theme. These are configuration, NOT game progress, and must survive browser restarts. Document-level rule: *progress expires; preferences persist.*
- Hangman's localStorage blob migrates into this model (losing its current weeks-long lifetime — intended).
- The mode-key bug disappears structurally: one writer, one encoding, one namespace scheme.
- Interface shape: small `load/save/clear` per namespace so a future API-backed adapter can replace the implementation without touching callers.

Placement note: seeded as `src/game-core/persistence.ts` in Phase 0 — the first inhabitant of game-core. Phase 1 grows the rest of the core around it.

## 4. Current game architecture

Each game component independently: `import.meta.glob("../../data/*.json", { as: "json" })` → flatten to one array → shuffle/sample → manage rounds/scoring itself → restore "where was I" from storage. Vite code-splits each letter file into its own async chunk. [CURRENT]

Known divergences between modes: Hangman shuffles inline instead of using `utils/rotation.ts`; MultiChoice uses `createRotation` + queue index; OpenAnswer picks purely randomly with image-preference filtering. Settings plumbing differs per mode (see §7 #6/#7). [CURRENT]

### Shared game core [PLANNED — Phase 1] [DECIDED]

Create `src/game-core/`: **dependency-free** logic — rotation, rounds, scoring, persistence interface — with an **injected RNG** (`type Random = () => number`) so all randomness is testable. React-specific adapters/hooks stay OUTSIDE the core. Structure must make a later extraction to `packages/game-core` straightforward, but **no monorepo/`apps/web` restructuring now** (it would also require changing the Vercel project's Root Directory — deferred until the companion app is real).

**Belongs in game-core:** pure logic over plain data types (`Animal[]`, settings objects); RNG port; rotation/queue creation; round counting; scoring rules; persistence interface + TTL wrapper.
**MUST NOT go into game-core:** React/DOM imports; `import.meta.glob` (bundler-coupled — loaders stay in adapter layer and pass `Animal[]` in); direct `localStorage`/`sessionStorage` access (goes through the injected persistence port); JSX/CSS; component state.

Migration order: smallest-first — OpenAnswer → MultiChoice → Hangman. Port MultiChoice's stale-request guards faithfully into the adapter layer; do not simplify them away during migration.

## 5. Current testing state

**Vitest is installed; 12 unit tests exist** for the persistence module (`src/game-core/persistence.test.ts`: TTL round-trip/expiry/refresh, corrupt-envelope self-heal, custom ttl, key isolation, config durability, raw-key byte preservation). [CURRENT]

Toolchain baseline since Phase 0: `npm.cmd run build` (= `tsc -b && vite build`) passes strict · `npm.cmd run lint` exits **0** (all 3 pre-existing errors resolved in PR #2) · `npm.cmd test` 12/12 green. [CURRENT, verified 2026-08-21]

Suites still to come [PLANNED — Phases 1–2] [DECIDED]:

- **(a)** game-core unit tests with injected RNG — rotation, rounds, scoring, TTL expiry
- **(b)** regression test locking the mode/route persistence contract (so the format-bug class cannot return)
- **(c)** restore-flow tests per mode with mocked storage
- **(d)** App routing state machine incl. stale-route (>10 min) fallback to Home
- **(e)** after Phase 2: settings-wiring tests proving hint toggles actually affect rendered hints

Phase 0 delivered its slice of suite (a) — the persistence module tests (PR #1); Phases 1–2 add the rest.

## 6. Current CI/deployment state

**CI exists since Phase 0** (PR #6): `.github/workflows/ci.yml` runs on pushes to `development`/`master` and PRs into `development` — npm ci → lint → `tsc -b` → vitest. Green on its first run. [CURRENT]

Deployment is **Vercel** with per-PR preview deployments wired up; production deploys from `master`. Owner position: Vercel is sufficient "for now or forever" — no migration planned. [CURRENT] + [DECIDED]

## 7. Known bugs & technical debt

Resolved in Phase 0 (kept for history):

1. ~~**Store shadow landmine**~~ [RESOLVED — PR #3]: `themeStore.js` shadowed `themeStore.ts`; collapsed into one typed module.
2. ~~**Mode-key format conflict**~~ [RESOLVED structurally — PR #2]: single encoding via the persistence module; live browser confirmation pending in the Phase 0 QA matrix.
3. ~~**Lint fails (3 errors)**~~ [RESOLVED — PR #2 side effect]: lint exits 0.
10. ~~**Debug residue**~~ [RESOLVED — PR #4]: `DEBUG_SELECTION` and ~45 debug sites removed; failure-path warns kept.
11. ~~**Dead files**~~ [RESOLVED — PR #5]: `picMeStore.ts`, `ThemeContext.js`, `letterBox.ts` deleted.

Still open:

4. **Dead daisyUI-v3/v4 CSS:** `src/components/OpenAnswer/OpenAnswer.css` keyframes use `hsl(var(--b3))`, `--su`, `--er` — none are defined in daisyUI 5 output (verified: zero definitions in built CSS). Correct/wrong flash animations are visually inert. Port to v5 tokens (`--color-base-300`, `--color-success`, `--color-error`). (Phase 2)
5. **Inert/junk styling config:** root `tailwind.config.js` never loaded; `src/index.css` line `themes: light --cymk, dark --dracula;` contains ignored flags and a misspelled comment ("cymk"). Emitted themes are literally light/dark only.
6. **Hints are theater:** `hintsEnabled`/`hintType` (habitat/diet/description options in `MultipleChoiceSettings.tsx`) persist and flow to `App.tsx` but no game consumes them; MultiChoice and Hangman render the habitat hint unconditionally. [DECIDED] hints stay per-mode toggles inside pre-game settings; they must actually work (Phase 2).
7. **Open Answer gaps:** receives no settings object at all (`GameOptions.handleConfirm` else-branch passes none); score is memory-only; no round limit. (Phase 2)
8. **Lives default mismatch:** `HangmanSettings.tsx` clamps 5–15 default 5; `Hangman.tsx` falls back to `settings.lives ?? 6`. (Phase 2)
9. **Keyboard leaks through modal:** Hangman's window-level letter-guess listener stays active while ConfirmBackModal is open (gameState still `"playing"`); typing behind the modal guesses letters. Same class of issue for Enter-to-advance when won. (Phase 2)
12. **Deprecation warnings:** `import.meta.glob(..., { as: "json" })` ×3 components → migrate to `{ query: '?json', import: 'default' }`. (Phase 1, alongside game-core loader extraction)
13. **Dependency pin oddity:** framer-motion ^10 predates React 19 peer support; installs only because `.npmrc` sets `legacy-peer-deps=true`. Upgrade deliberately (Phase 4 gate), not casually.
14. Minor duplication/drift: `.mc-spinner` defined in both `MultiChoice.css` and `DisplayCard.css`; two MotionDiv any-casts (`common/MotionDiv.tsx`, local in `Main.tsx`); hardcoded `text-amber-500` in Navbar amid otherwise semantic-token styling; daisyUI sits in devDependencies despite being runtime-critical. (Phase 3 sweep)

Security baseline [CURRENT]: grep-verified **no** `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `document.write` anywhere in `src/`; no auth; no user input stored or reflected into HTML contexts. Dependency freshness and optional CSP headers via Vercel remain future considerations — this is not a security-heavy application; keep it that way.

## 8. Authoritative product/architecture decisions [ALL DECIDED, 2026-08-21]

1. **daisyUI is the long-term styling bet.** New UI uses daisyUI semantic tokens (`bg-base-100`, `btn`, `text-success`) + Tailwind utilities for layout; avoid bespoke CSS-variable theming.
2. **Hints/settings are per-mode toggles** inside each mode's pre-game settings panel. No cross-mode settings contract is required.
3. **Web + mobile browser parity matters now.** A companion native app is plausible long-term; keep dataset and game logic portable/framework-agnostic.
4. **Progress semantics:** session-scoped with 10-minute resume TTL; durable settings (see §3). Long-term highscores would warrant a real API/DB — explicitly out of scope until product pull exists.
5. **Shared core starts now, seam-first:** `src/game-core/` dependency-free; no workspace/monorepo restructuring yet.
6. **Testing:** Vitest + Testing Library, targeted suites (§5); minimal GitHub Actions CI (lint/tsc/test).
7. **Branch hygiene:** obsolete backup branches are approved for deletion locally AND on origin (Phase 0).
8. **Refresh UX:** refreshing resumes mid-game (within TTL); >10 min away returns to Home.

## 9. Roadmap

Conventions for every phase below: **Objective / Current-state problem / Intended result / Affected files (verified paths) / Dependencies / Acceptance criteria / Tests & verification / Out of scope.**

---

### Phase 0 — Stabilize & truth-up  [DONE — PRs #1–#6; manual QA matrix still pending owner browser pass]

- **Objective:** trustworthy baseline; centralized persistence seam lands; docs and git are true.
- **Current-state problem:** §7 items 1, 2, 3, 11 partially; scattered storage (§3); no CI; misleading README; 51 local branches cluttered with merged `backup-before-mass-reset/*` and `backup-before-rollback-*` refs.
- **Intended result:**
  1. Delete obsolete backup branches/refs locally and on origin (all are already merged into master — verified).
  2. Create `src/game-core/persistence.ts`: namespaced `load/save/clear` over sessionStorage with JSON encoding, `savedAt` timestamps, 10-minute TTL for progress namespaces; durable (TTL-exempt) namespaces for settings and theme. Ship unit tests for it (suite (a) subset: TTL expiry, encoding, namespace isolation).
  3. Migrate ALL storage call-sites (table in §3) onto the module. Route/mode/progress become session-scoped+TTL; settings/theme become durable. Mode-key bug disappears structurally.
  4. Collapse `themeStore.{js,ts}` into one TS module (keep zustand; keep token→data-theme mapping; keep FOUC script contract in `index.html`).
  5. Fix the 3 lint errors; remove `DEBUG_SELECTION` and obvious debug logging (keep genuine error-path warns where useful).
  6. Seed `.github/workflows/ci.yml`: lint → `tsc -b` → `vitest run --passWithNoTests` (green from day one).
  7. Record baseline in this doc's §5 after fixes (expect: build ✓, lint ✓, tests ✓).
- **Affected files:** `src/game-core/persistence.ts` (new) + its test; `src/App.tsx`; `src/utils/useLocalJSON.ts` (absorbed/deleted); `src/store/themeStore.*`; `src/components/{MultiChoice,OpenAnswer,Hangman}/**` storage lines; `src/components/Hangman/GameMessages.tsx`; `eslint` targets only; `.github/workflows/ci.yml` (new); README/docs.
- **Dependencies:** none. First phase.
- **Acceptance criteria:** green lint/build/CI; manual matrix passes — (i) refresh <10 min resumes the same animal/round in each mode incl. Hangman; (ii) >10 min (or tab close) → Home, progress gone; (iii) settings and theme survive expiry AND full browser restart; (iv) select Hangman → play → Options → Hangman tab still selected; (v) closing exit modal then typing does not guess letters is NOT required here (that's Phase 2).
- **Tests/verification:** persistence unit tests; manual matrix above; `git status` shows only intended paths.
- **Out of scope:** engine extraction beyond persistence; hint wiring; OpenAnswer features; styling debt beyond lint; any visual changes.

### Phase 1 — One game core

- **Objective:** eliminate triplicated game scaffolding; make future features cost 1× not 3×; create the future extraction boundary.
- **Current-state problem:** three games each implement loading/shuffle/rounds/scoring/restore independently with drift (§4); `utils/rotation.ts` used by only one mode; untestable randomness.
- **Intended result:** `src/game-core/` with injected RNG, rotation/rounds/scoring logic, persistence interface (absorbing Phase 0 module); thin React/bundler adapters outside the core (data loader via glob stays an adapter; games receive `Animal[]`). Games migrated smallest-first: OpenAnswer → MultiChoice → Hangman. MultiChoice stale-request guard semantics preserved verbatim in the adapter layer.
- **Affected files:** new `src/game-core/*` + tests; `src/utils/rotation.ts` (ported), `src/utils/openAnswer.ts`, `src/hooks/useFlash.ts` (stays adapter-side); all three game component trees; `src/constants/gameModes.ts` unchanged.
- **Dependencies:** Phase 0 (persistence module, green CI).
- **Acceptance criteria:** exactly one implementation of load/shuffle/round-count/score/persist; each game file materially smaller; `grep -r "react" src/game-core/` returns zero hits (enforce via eslint `no-restricted-imports` on that path); all three modes behave identically to pre-refactor on the QA checklist; mode-contract regression test (suite b) green.
- **Tests/verification:** suites (a) complete, (b), (c), (d); side-by-side manual parity pass per mode before deleting old paths.
- **Out of scope:** any behavior change; settings/hints; visual changes; physical package extraction.

### Phase 2 — Real settings + finish Open Answer

- **Objective:** no control in the options UI lies; Open Answer reaches parity.
- **Current-state problem:** §7 items 4, 6, 7, 8, 9.
- **Intended result:** per-mode hint toggles rendering real content (schema already has `habitat[]`, `food[]`, `description[]` per animal); Open Answer gains rounds + session-scoped persisted score and receives its settings; lives default unified (pick 5, clamp 5–15 everywhere); Hangman keyboard/Enter listeners disabled while ConfirmBackModal is open; `OpenAnswer.css` ported off dead v3/v4 vars onto daisyUI 5 tokens.
- **Affected files:** `components/GameOptions/*` (esp. `MultipleChoiceSettings.tsx`, `OpenAnswerSettings.tsx`), `components/OpenAnswer/*`, hint surfaces in MultiChoice/Hangman, `OpenAnswer.css`, `Hangman.tsx` listener effects.
- **Dependencies:** Phase 1 (cheap to touch all three modes).
- **Acceptance criteria:** every visible control verifiably affects gameplay, in both themes, spot-checked at mobile width; OA score survives refresh within TTL, resets after; flash animations visibly fire on correct/wrong.
- **Tests/verification:** suite (e) settings-wiring tests; extend restore-flow tests to OA rounds/score.
- **Out of scope:** new hint types beyond schema fields; sounds; difficulty tuning.

### Phase 3 — Content curation + responsive/a11y pass

- **Objective:** kid-facing polish; parity across breakpoints; accessible shared chrome.
- **Current-state problem:** `src/data/appendix.md` lists animals whose images need quality fixes (sampled URLs return HTTP 200 — this is a curation list, not broken links); open responsive TODOs (MC scroll-jump on new load — unreproduced; Hangman keyboard scaling on small screens); ConfirmBackModal has Escape-close but no focus trap/return; Navbar amber hardcode.
- **Intended result:** appendix list worked through (timeboxed); breakpoint matrix QA'd (360×800, 375×812, 412×915, 768×1024, 1366×768, 1920×1080); modal traps/restores focus; amber-500 replaced with a theme token.
- **Affected files:** `src/data/*.json` (image URLs), `appendix.md`, `ConfirmBackModal.tsx`, `Navbar.tsx`, responsive classes across game components.
- **Dependencies:** best after Phase 2 (stable UI), but independent — can interleave.
- **Acceptance criteria:** zero known-bad images; matrix signed off by owner; keyboard-only users can open/exit the modal without losing focus.
- **Tests/verification:** manual; optional a11y smoke via Testing Library focus assertions.
- **Out of scope:** new animals/content expansion; design redesign.

### Phase 4 — Optional gate (hygiene/future-proofing)

- **Objective:** remove the dependency crutch; prep optional PWA shell.
- **Contents:** framer-motion upgrade (10 → current/motion) dropping `legacy-peer-deps`; PWA manifest/service-worker **only if** the companion-app direction justifies it; CSP headers via Vercel if desired.
- **Dependencies:** Phases 0–2 stable; animation-parity check after upgrade.
- **Acceptance:** modern peer graph installs without `legacy-peer-deps`; all animations behave identically.
- **Out of scope:** anything else.

## 10. Acceptance criteria summary

Per-phase acceptance lives in §9. Global definition of done for any phase: `tsc -b` clean · ESLint clean · CI green · manual QA matrix for touched flows passes in light+dark · docs updated in same change · no new `any`, no new raw `localStorage`/`sessionStorage` calls outside the persistence module, no new console.log left behind.

## 11. Explicit non-goals / deferred work

- **Monorepo / `apps/web` split** — deferred until companion-app development is real (would require Vercel Root Directory change).
- **Highscores / any API/database/auth** — deferred until product pull; persistence interface is the only prep.
- **Immersive Sounds** (placeholder card on Main) — deferred.
- **Homepage collage redesign** — deferred.
- **Type-checked linting (`recommendedTypeChecked`)** — deferred; README previously suggested it, never applied.
- **Removing zustand or the `.dark`-class machinery** — churn without payoff; leave as-is.
- **New game modes, new datasets, i18n** — not planned.

## 12. Open questions

None blocking Phase 0. Two recorded judgment calls an owner may revisit:
1. TTL measures from **last save** (state change), not last interaction — an idle open tab expires 10 min after the player's last move. Adjustable constant if playtesting disagrees.
2. Tab close always resets progress even within 10 minutes (consequence of sessionStorage choice, per decision). If "close laptop, come back in 5 min" should resume, we'd switch progress namespaces to localStorage + TTL only — one-line change in the module, deliberately isolated there.

---

## Agent quickstart notes

- Shell on this machine: plain `npm` is blocked by PowerShell execution policy — use `npm.cmd`. Chain with `;` / `if ($?) { }`, not `&&`.
- Commands: `npm.cmd run dev` · `npm.cmd run build` (includes `tsc -b`) · `npm.cmd run lint` · `npm.cmd run preview`.
- Conventions: strict TS, no new `any`; daisyUI semantic tokens first; storage keys only via the persistence module; version storage keys if shape changes (precedent: `-v1`); PascalCase component folders, colocated subcomponents.
- **Do not change yet** (wait for their phase): game engines' internal logic (Phase 1), settings/hint behavior (Phase 2), data image URLs (Phase 3), framer-motion (Phase 4), anything tagged DEFERRED in §11.
