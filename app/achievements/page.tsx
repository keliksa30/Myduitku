"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import type { BadgeId } from "@/lib/types";

type BadgeInfo = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
};

const BADGES_DATA: BadgeInfo[] = [
  {
    id: "hemat",
    name: "Si Paling Hemat",
    description: "Pengeluaran di bawah 50% gaji (min. 5 transaksi).",
    icon: "savings",
    colorClass: "bg-emerald-100 text-emerald-600 border-emerald-300",
  },
  {
    id: "jajan",
    name: "Raja Jajan",
    description: "Mencatat 10x pengeluaran Makanan / Minuman.",
    icon: "fastfood",
    colorClass: "bg-amber-100 text-amber-600 border-amber-300",
  },
  {
    id: "konsisten",
    name: "Konsisten Meow",
    description: "Mencatat pengeluaran 7 hari berturut-turut.",
    icon: "local_fire_department",
    colorClass: "bg-rose-100 text-rose-600 border-rose-300",
  },
  {
    id: "rungkad",
    name: "Pendekar Rungkad",
    description: "Habis >100rb sehari, selama 7 hari berturut-turut.",
    icon: "payments",
    colorClass: "bg-fuchsia-100 text-fuchsia-600 border-fuchsia-300",
  },
];

export default function AchievementsPage() {
  const router = useRouter();
  const unlockedBadges = useStore((s) => s.unlockedBadges || []);

  return (
    <main className="min-h-screen bg-surface p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline/10 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="font-family-display font-bold text-2xl text-primary text-center">Ruang Piala</h1>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-md mx-auto">
        <p className="text-center font-family-body text-on-surface-variant mb-6 px-4">
          Kumpulkan lencana ini dengan menyelesaikan berbagai tantangan menabung dan mencatat pengeluaranmu! 🏆
        </p>

        <div className="grid grid-cols-2 gap-4">
          {BADGES_DATA.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return (
              <div 
                key={badge.id}
                className={`relative rounded-[24px] p-4 flex flex-col items-center justify-center border-2 text-center transition-all duration-300 shadow-sm ${
                  isUnlocked 
                    ? badge.colorClass + ' scale-100 opacity-100' 
                    : 'bg-surface-container border-outline/20 text-outline scale-95 opacity-70 grayscale'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[12px] text-on-surface-variant">lock</span>
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner bg-white/50`}>
                  <span className="material-symbols-outlined text-[32px]">{badge.icon}</span>
                </div>
                
                <h3 className="font-family-label font-bold text-sm mb-1 line-clamp-2 leading-tight">
                  {badge.name}
                </h3>
                <p className="font-family-body text-[10px] opacity-80 leading-snug">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
