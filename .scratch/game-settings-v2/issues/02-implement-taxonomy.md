# Implement rounds + difficulty taxonomy (v2)

Status: resolved
Type: task

> Consumes decision [01-settings-taxonomy](./01-settings-taxonomy.md): minimal taxonomy = rounds (exists) + difficulty pool filter, pre-game only, every mode.

## Agent Brief

Add a shared `difficulty` pool filter to Settings and thread it through all
three modes.

**Decisions encoded here** (from ticket 01 + audit 03 constraints):

- `Settings.difficulty?: "all" | "easy" | "medium" | "hard"` — default `"all"`.
- **Shared field, mirroring `rounds`' existing shared-edit pattern** (audit
  constraint #1). Difficulty applies to every mode, so sharing leaks nothing;
  splitting per-mode is deferred until playtesting asks for it.
- Filter is **pure game-core** (`filterByDifficulty`), applied to the animal
  pool *before* `createRotation` so shuffle/clamp semantics stay intact and
  small pools (Easy ≈ 25) degrade gracefully via existing clamping.
- Pre-game read-on-entry: games read `settings.difficulty` at mount only; no
  mid-game ramping. A persisted current-animal id outside the filtered pool
  falls through to a fresh load (existing not-found path).
- Open Answer's panel gets its first controls (rounds already reached the game
  via GameOptions; now visible + difficulty).

## Acceptance criteria

- [ ] Core unit tests: filter correctness, "all" passthrough, case handling vs `"Easy"|"Medium"|"Hard"` data values, empty input
- [ ] All three settings panels expose Rounds + Difficulty; OA panel takes settings props
- [ ] MC / Hangman / OpenAnswer build their pools through the filter
- [ ] Full suite + lint + tsc + build green

## Answer

<!-- appended on resolve -->
