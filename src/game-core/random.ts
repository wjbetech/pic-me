/**
 * Randomness port for game-core.
 *
 * All randomness enters the core through a `Random` function so every
 * code path is deterministic under test. Production callers pass
 * `MathRandom`; tests pass seeded generators (see *.test.ts).
 */

/** Returns a float in [0, 1). Same contract as Math.random. */
export type Random = () => number;

/** The production RNG. */
export const MathRandom: Random = Math.random;
