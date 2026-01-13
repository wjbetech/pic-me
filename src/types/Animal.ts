export interface Animal {
  id: string;
  commonName: string;
  latinName: string;
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
