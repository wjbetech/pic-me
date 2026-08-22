/**
 * Compatibility re-export.
 *
 * Canonical definition: src/game-core/animal.ts (game-core owns the data
 * contract). Existing component imports may keep using this path; new code
 * should import from game-core directly. Delete once no importers remain.
 */
export type { Animal } from "../game-core/animal";
