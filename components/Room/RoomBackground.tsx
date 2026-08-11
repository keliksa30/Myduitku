"use client";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SHOP_ITEMS } from "./ShopModal";

export default function RoomBackground({ children }: { children?: React.ReactNode }) {
  const [paintingClicks, setPaintingClicks] = useState(0);
  const { equippedWall, equippedCarpet } = useStore();

  const handlePaintingClick = () => {
    setPaintingClicks((prev) => {
      const newCount = prev + 1;
      if (newCount === 6) {
        const audio = new Audio("/.easter egg/easter egg.mp3");
        audio.play().catch(() => {});
        return 0; // reset
      }
      return newCount;
    });
  };

  const wallFilter = SHOP_ITEMS.find(i => i.id === equippedWall)?.filterClass || "";
  const carpetFilter = SHOP_ITEMS.find(i => i.id === equippedCarpet)?.filterClass || "";

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* Base Background */}
      <div className={`absolute inset-0 z-0 bg-[#F4E9DF] transition-all duration-700 ${wallFilter}`}>
        <Image 
          src="/room/background.svg" 
          alt="Wall and Floor" 
          fill 
          className="object-cover object-bottom"
          priority 
          unoptimized
        />
      </div>

      {/* Wall Decor */}
      <div 
        onClick={handlePaintingClick}
        className="absolute top-[12%] left-[40%] w-[6%] aspect-[4/3] z-10 transition-transform origin-top hover:scale-105 cursor-pointer pointer-events-auto"
      >
        <Image src="/room/painting.svg" alt="Painting" fill className="object-contain drop-shadow-md" unoptimized />
      </div>

      {/* Floor Decor Back */}
      <div className="absolute bottom-[39%] left-[37%] w-[5%] aspect-square z-10 origin-bottom hover:-rotate-3 transition-transform">
        <Image src="/room/plant_1.svg" alt="Plant" fill className="object-contain drop-shadow-lg" unoptimized />
      </div>
      <div className="absolute bottom-[39%] right-[37%] w-[5%] aspect-square z-10 origin-bottom hover:rotate-3 transition-transform">
        <Image src="/room/plant_2.svg" alt="Plant" fill className="object-contain drop-shadow-lg" unoptimized />
      </div>

      {/* Carpet */}
      <div className="absolute bottom-[18%] left-0 w-full flex justify-center z-10">
        <div className={`w-[24%] aspect-[3/1] relative transition-all duration-700 ${carpetFilter}`}>
          <Image src="/room/carpet.svg" alt="Carpet" fill className="object-contain" unoptimized />
        </div>
      </div>

      {/* Foreground Items on Floor */}
      <div className="absolute bottom-[20%] left-[44%] w-[2.5%] aspect-square z-20">
        <Image src="/room/bowl_1.svg" alt="Food Bowl" fill className="object-contain drop-shadow-md" unoptimized />
      </div>
      <div className="absolute bottom-[20%] right-[44%] w-[2.5%] aspect-square z-20">
        <Image src="/room/bowl_2.svg" alt="Water Bowl" fill className="object-contain drop-shadow-md" unoptimized />
      </div>

      {children}
    </div>
  );
}
