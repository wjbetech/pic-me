/**
 * Domain data type for the animal dataset.
 *
 * Lives in game-core so the extraction boundary (packages/game-core) can own
 * the data contract; the JSON files and their bundler loading stay outside
 * in the adapter layer. Plain data only — no imports of any kind.
 */

export interface Animal {
  id: string;
  commonName: string;
  latinName: string;
  animalClass: string;
  species?: string;
  description: string[];
  tags?: string[];
  habitat: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  food: string[];
  images: {
    url: string;
    thumb?: string;
  }[];
}
