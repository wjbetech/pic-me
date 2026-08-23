/**
 * Curated homepage photo set — Wikimedia Commons lead images.
 *
 * All entries are high-resolution, watermark-free, and freely licensed
 * (CC BY-SA / CC BY or public-domain equivalents via Wikimedia). Each file
 * remains on Commons' CDN (hotlinkable); no repo bloat. The set decouples
 * the homepage's visual quality from the in-game dataset, which still
 * contains 20 premium Unsplash+ watermarked previews (see src/data/appendix.md).
 *
 * Alt text uses the dataset's commonName so screen readers hear real animal
 * names — not generic "animal photo".
 */
export interface HomePhoto {
  /** Stable id matching the game's animal id when possible, otherwise a slug. */
  id: string;
  src: string;
  alt: string;
  /** Commons file title for attribution / future license audit. */
  commonsFile: string;
}

export const HOME_PHOTOS: HomePhoto[] = [
  {
    id: "elephant",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg/1920px-178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg",
    alt: "African bush elephant",
    commonsFile: "178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg",
  },
  {
    id: "bison",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/American_bison_k5680-1.jpg/1920px-American_bison_k5680-1.jpg",
    alt: "American bison",
    commonsFile: "American_bison_k5680-1.jpg",
  },
  {
    id: "giraffe",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Giraffe_Mikumi_National_Park.jpg",
    alt: "Giraffe",
    commonsFile: "Giraffe_Mikumi_National_Park.jpg",
  },
  {
    id: "koala",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/49/Koala_climbing_tree.jpg",
    alt: "Koala",
    commonsFile: "Koala_climbing_tree.jpg",
  },
  {
    id: "jaguar",
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    alt: "Jaguar",
    commonsFile: "Standing_jaguar.jpg",
  },
  {
    id: "rhinoceros",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/081_White_rhinoceros_%28male%29_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg/1920px-081_White_rhinoceros_%28male%29_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg",
    alt: "White rhinoceros",
    commonsFile: "081_White_rhinoceros_(male)_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg",
  },
  {
    id: "shark",
    src: "https://upload.wikimedia.org/wikipedia/commons/5/56/White_shark.jpg",
    alt: "Great white shark",
    commonsFile: "White_shark.jpg",
  },
  {
    id: "flamingo",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flamingos_Laguna_Colorada.jpg/1920px-Flamingos_Laguna_Colorada.jpg",
    alt: "Flamingos",
    commonsFile: "Flamingos_Laguna_Colorada.jpg",
  },
  {
    id: "arctic-fox",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Vulpes_lagopus_in_Iceland_%28cropped_3%29.jpg/1920px-Vulpes_lagopus_in_Iceland_%28cropped_3%29.jpg",
    alt: "Arctic fox",
    commonsFile: "Vulpes_lagopus_in_Iceland_(cropped_3).jpg",
  },
  {
    id: "falcon",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg",
    alt: "Peregrine falcon",
    commonsFile: "Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg",
  },
  {
    id: "capybara",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Capybaracropped.jpg/1920px-Capybaracropped.jpg",
    alt: "Capybara",
    commonsFile: "Capybaracropped.jpg",
  },
  {
    id: "orangutan",
    src: "https://upload.wikimedia.org/wikipedia/commons/b/be/Orang_Utan%2C_Semenggok_Forest_Reserve%2C_Sarawak%2C_Borneo%2C_Malaysia.JPG",
    alt: "Orangutan",
    commonsFile: "Orang_Utan,_Semenggok_Forest_Reserve,_Sarawak,_Borneo,_Malaysia.JPG",
  },
];
