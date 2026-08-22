import type { Animal } from "../../game-core/animal";
import type { HintPreference } from "../../game-core/hints";
import { getHintText } from "../../game-core/hints";

/**
 * Shared hint surface for every mode. Renders nothing when hints are
 * disabled or no animal is loaded — "no control lies" (HANDOFF §9 Phase 2).
 */
export default function HintLine({
  animal,
  pref,
}: {
  animal: Animal | null;
  pref?: HintPreference;
}) {
  if (!animal || !pref?.enabled) return null;

  return (
    <p className="text-center opacity-60 text-sm">
      Hint: {getHintText(animal, pref.type)}
    </p>
  );
}
