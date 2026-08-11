"use client";

import { useStore } from "@/lib/store";
import { useState } from "react";

export type ShopItem = {
  id: string;
  category: "wall" | "carpet" | "hat" | "glasses" | "necklace";
  name: string;
  price: number;
  filterClass: string;
  previewColor: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: "wall-default", category: "wall", name: "Tembok Standar", price: 0, filterClass: "", previewColor: "#EFE5D9" },
  { id: "wall-pink", category: "wall", name: "Tembok Pink", price: 100, filterClass: "hue-rotate-[-20deg] saturate-[1.5] brightness-105", previewColor: "#fce7f3" },
  { id: "wall-mint", category: "wall", name: "Tembok Mint", price: 150, filterClass: "hue-rotate-[120deg] saturate-[0.8] brightness-105", previewColor: "#d1fae5" },
  { id: "wall-night", category: "wall", name: "Malam Hari", price: 300, filterClass: "hue-rotate-[200deg] saturate-[0.6] brightness-[0.4]", previewColor: "#334155" },

  { id: "carpet-default", category: "carpet", name: "Karpet Coklat", price: 0, filterClass: "", previewColor: "#e6b981" },
  { id: "carpet-red", category: "carpet", name: "Karpet Merah", price: 50, filterClass: "hue-rotate-[-40deg] saturate-[1.5]", previewColor: "#f87171" },
  { id: "carpet-blue", category: "carpet", name: "Karpet Biru", price: 100, filterClass: "hue-rotate-[180deg] saturate-[1.2]", previewColor: "#60a5fa" },
  { id: "carpet-purple", category: "carpet", name: "Karpet Ungu", price: 150, filterClass: "hue-rotate-[240deg] saturate-[1.2]", previewColor: "#c084fc" },

  { id: "cowboy-hat", category: "hat", name: "Topi Koboi", price: 100, filterClass: "", previewColor: "#AA6E3C" },
  { id: "hat-1", category: "hat", name: "Topi Biru", price: 80, filterClass: "", previewColor: "#5A8CE5" },
  { id: "man-hat", category: "hat", name: "Topi Pantai", price: 150, filterClass: "", previewColor: "#DA8759" },
  { id: "wizard-hat", category: "hat", name: "Topi Penyihir", price: 200, filterClass: "", previewColor: "#9766C8" },
  
  { id: "love-eyeglasses", category: "glasses", name: "Kacamata Cinta", price: 150, filterClass: "", previewColor: "#EA6588" },
  { id: "thug-eyeglasses", category: "glasses", name: "Kacamata Piksel", price: 200, filterClass: "", previewColor: "#000000" },
  { id: "trendy-eyeglasses", category: "glasses", name: "Kacamata Trendi", price: 120, filterClass: "", previewColor: "#455F6E" },
  
  { id: "necklace-1", category: "necklace", name: "Kalung Biru", price: 80, filterClass: "", previewColor: "#D8482B" },
  { id: "necklace-2", category: "necklace", name: "Kalung Bintang", price: 100, filterClass: "", previewColor: "#D8482B" },
  { id: "necklace-3", category: "necklace", name: "Kalung Punk", price: 120, filterClass: "", previewColor: "#D8482B" },
  { id: "ribbon", category: "necklace", name: "Pita Cantik", price: 100, filterClass: "", previewColor: "#60B7FC" },
];

export default function ShopModal({ onClose }: { onClose: () => void }) {
  const { 
    meowCoins, unlockedItems, equippedWall, equippedCarpet, 
    equippedHat, equippedGlasses, equippedNecklace, accessoryColors,
    buyItem, equipItem, setAccessoryColor
  } = useStore();
  const [activeTab, setActiveTab] = useState<"wall" | "carpet" | "hat" | "glasses" | "necklace">("wall");

  const visibleItems = SHOP_ITEMS.filter((item) => item.category === activeTab);

  const handleAction = (item: ShopItem) => {
    const isUnlocked = unlockedItems.includes(item.id);
    let isEquipped = false;
    if (item.category === "wall") isEquipped = equippedWall === item.id;
    else if (item.category === "carpet") isEquipped = equippedCarpet === item.id;
    else if (item.category === "hat") isEquipped = equippedHat === item.id;
    else if (item.category === "glasses") isEquipped = equippedGlasses === item.id;
    else if (item.category === "necklace") isEquipped = equippedNecklace === item.id;

    if (isEquipped && ["wall", "carpet"].includes(item.category)) return;
    
    // For accessories, tapping an equipped item unequips it
    if (isEquipped && ["hat", "glasses", "necklace"].includes(item.category)) {
       equipItem(item.category, null);
       return;
    }

    if (isUnlocked) {
      equipItem(item.category, item.id);
    } else {
      if (meowCoins >= item.price) {
        buyItem(item.id, item.price);
        // Auto equip after buying
        equipItem(item.category, item.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-surface w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-slideUp">
        
        {/* Header */}
        <div className="bg-surface-container-high px-6 py-5 flex items-center justify-between border-b border-outline/10">
          <div>
            <h2 className="font-family-display font-bold text-xl text-primary leading-tight">Toko Meow</h2>
            <p className="font-family-label text-sm text-on-surface-variant font-medium mt-1 flex items-center gap-1.5">
              Saldo: <span className="font-bold text-amber-600 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">monetization_on</span> {meowCoins} Coins</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-outline/10 px-4 pt-2 gap-4 whitespace-nowrap">
          {["wall", "carpet", "hat", "glasses", "necklace"].map((tab) => {
            const labels = {
              "wall": "Tembok",
              "carpet": "Karpet",
              "hat": "Topi",
              "glasses": "Kacamata",
              "necklace": "Kalung"
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 font-family-label font-bold text-sm text-center border-b-2 transition-colors ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {labels[tab as keyof typeof labels]}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-4 bg-surface max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const isUnlocked = unlockedItems.includes(item.id);
              let isEquipped = false;
              if (item.category === "wall") isEquipped = equippedWall === item.id;
              else if (item.category === "carpet") isEquipped = equippedCarpet === item.id;
              else if (item.category === "hat") isEquipped = equippedHat === item.id;
              else if (item.category === "glasses") isEquipped = equippedGlasses === item.id;
              else if (item.category === "necklace") isEquipped = equippedNecklace === item.id;
              const canAfford = meowCoins >= item.price;

              return (
                <div 
                  key={item.id} 
                  className={`bg-surface-container-low border rounded-2xl p-3 flex flex-col items-center gap-3 transition-colors ${
                    isEquipped ? 'border-primary/50 bg-primary-container/20' : 'border-outline/10'
                  }`}
                >
                  {/* Preview Swatch */}
                  <div 
                    className="w-16 h-16 rounded-2xl shadow-inner border border-outline/10 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: ['hat','glasses','necklace'].includes(item.category) ? 'transparent' : item.previewColor }}
                  >
                    {['hat','glasses','necklace'].includes(item.category) && (
                      <img src={`/cat-accesories/${item.id}.svg?v=1`} className="w-12 h-12 object-contain" />
                    )}
                    {isEquipped && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary font-bold drop-shadow-md">check</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="text-center w-full">
                    <p className="font-family-body font-semibold text-[13px] text-on-surface truncate">{item.name}</p>
                    


                    <button
                      onClick={() => handleAction(item)}
                      disabled={(isEquipped && ["wall", "carpet"].includes(item.category)) || (!isUnlocked && !canAfford)}
                      className={`mt-2 w-full py-1.5 rounded-full font-family-label font-bold text-xs transition-colors flex items-center justify-center gap-1 ${
                        isEquipped 
                          ? 'bg-primary-container text-on-primary-container border border-primary/20' 
                          : isUnlocked
                            ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                            : canAfford
                              ? 'bg-primary text-on-primary hover:bg-surface-tint shadow-sm'
                              : 'bg-surface-container text-outline opacity-70 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? (["wall","carpet"].includes(item.category) ? "Dipakai" : "Lepas") : isUnlocked ? "Pakai" : (
                        <>
                          <span className="material-symbols-outlined text-[14px]">monetization_on</span>
                          <span>{item.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
