// Cat skin palette — #korawia pixel-cat style (ref: public/cat/_ref/user-ref.jpg v2).
// Fill-first, thin subtle outline (2px, slightly darker/lighter than fill) so dark skins
// stay visible on the #0F0F12 app background.

export type CatSkinId = "hitam" | "tabby" | "oren" | "putih";

export type CatSkin = {
  id: CatSkinId;
  name: string;
  flavor: string;
  fill: string; // body/head fill
  outline: string; // subtle edge — darker than fill, or lighter for dark skins
  accent: string; // stripes / belly / inner ear
  eye: string; // eye color
  paw: string; // paw/chest fill
  detail: "none" | "stripes" | "belly" | "violet";
};

export const CAT_SKINS: CatSkin[] = [
  {
    id: "hitam",
    name: "Hitam",
    flavor: "Kalau gak dipanggil, gak nongol.",
    fill: "#1F1F23",
    outline: "#3D3D45",
    accent: "#3D3D45",
    eye: "#FFD93D",
    paw: "#1F1F23",
    detail: "none",
  },
  {
    id: "tabby",
    name: "Tabby",
    flavor: "Selalu kepo sama dompet lu.",
    fill: "#C99A6A",
    outline: "#8A5A3C",
    accent: "#7B5436",
    eye: "#3D2817",
    paw: "#C99A6A",
    detail: "stripes",
  },
  {
    id: "oren",
    name: "Oren",
    flavor: "Makan adalah ibadah. Apapun makanannya.",
    fill: "#FF9A4D",
    outline: "#C97A35",
    accent: "#FFE066",
    eye: "#3D2817",
    paw: "#FFE066",
    detail: "belly",
  },
  {
    id: "putih",
    name: "Putih",
    flavor: "Cleans freak. Auto-delete kalau ada typo.",
    fill: "#FAF7F2",
    outline: "#D8D2C8",
    accent: "#9F8FB8",
    eye: "#3D2817",
    paw: "#FAF7F2",
    detail: "violet",
  },
];

export function getSkin(id: CatSkinId): CatSkin {
  return CAT_SKINS.find((s) => s.id === id) ?? CAT_SKINS[1];
}
