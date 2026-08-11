// CatPicker — 4-skin selector
"use client";

import { useState } from "react";
import Image from "next/image";
import { CAT_SKINS, type CatSkinId } from "./catSkins";

type Props = {
  initial?: CatSkinId;
  onSelect?: (skin: CatSkinId) => void;
};

export default function CatPicker({ initial = "tabby", onSelect }: Props) {
  const [selected, setSelected] = useState<CatSkinId>(initial);

  function pick(id: CatSkinId) {
    setSelected(id);
    onSelect?.(id);
  }

  const getCatImage = (id: CatSkinId) => {
    switch (id) {
      case "hitam": return "/cat/cat_black.svg";
      case "oren": return "/cat/cat_orange.svg";
      case "tabby": return "/cat/cat_tabby.svg";
      case "putih": return "/cat/cat_white.svg";
      default: return "/cat/cat.svg";
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[24px]">pets</span>
        <h2 className="font-headline-sm text-primary">Pilih Kucing</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mx-auto">
        {CAT_SKINS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s.id)}
            aria-pressed={selected === s.id}
            aria-label={`Pilih kucing ${s.name}`}
            className={`bg-surface rounded-xl p-3 flex flex-col items-center gap-2 transition-all cursor-pointer border-2 ${
              selected === s.id
                ? "border-primary-container ring-2 ring-primary-container shadow-md scale-[1.03]"
                : "border-outline/10 hover:border-primary/50 hover:bg-surface-container-low"
            }`}
          >
            <div className="relative w-[70px] h-[70px] flex items-center justify-center">
              <Image src={getCatImage(s.id)} alt={s.name} fill className="object-contain" unoptimized />
            </div>
            <span className="font-label-md text-on-surface font-bold text-sm leading-tight text-center mt-1">{s.name}</span>
            <span className="font-body-md text-xs text-on-surface-variant text-center leading-snug">{s.flavor}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
