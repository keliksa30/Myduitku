"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Cat from "@/components/Cat/Cat";
import { useMounted } from "@/lib/hooks/useMounted";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/currency";
import { totalSpent, remaining } from "@/lib/budget";
import { useRouter } from "next/navigation";
import ExpenseForm from "@/components/Budget/ExpenseForm";
import Clock from "@/components/Room/Clock";
import RoomBackground from "@/components/Room/RoomBackground";
import ShopModal from "@/components/Room/ShopModal";
import WishlistModal from "@/components/Room/WishlistModal";

export default function Home() {
  const mounted = useMounted();
  const router = useRouter();
  const onboarded = useStore((state) => state.onboarded);
  const catSkin = useStore((s) => s.catSkin);
  const userName = useStore((s) => s.userName);
  const { incomeSources, expenses, currency, catExp, categories, meowCoins } = useStore();
  const spent = totalSpent(expenses);
  const totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);
  const rem = remaining(totalIncome, spent);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showHeaderBudget, setShowHeaderBudget] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  // Cek batas anggaran kategori
  let maxPercentage = 0;
  let worstCategory = null;
  for (const cat of categories) {
    if (cat.limit > 0) {
      const catSpent = expenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
      const percentage = catSpent / cat.limit;
      if (percentage >= 0.8 && percentage > maxPercentage) {
        maxPercentage = percentage;
        worstCategory = cat;
      }
    }
  }

  let catMood: "happy" | "neutral" | "worried" | "sad" = "happy";
  let speechBubbleText = "Catat pengeluaranmu untuk memberi makan kucing! 🐾";

  if (worstCategory) {
    if (maxPercentage > 1) {
      catMood = "sad";
      speechBubbleText = `Waduh! Anggaran ${worstCategory.label} sudah jebol! 😿`;
    } else {
      catMood = "worried";
      speechBubbleText = `Hati-hati, anggaran ${worstCategory.label} hampir habis! 🙀`;
    }
  }

  useEffect(() => {
    if (mounted && !onboarded) {
      router.replace("/onboarding");
    }
  }, [mounted, onboarded, router]);

  if (!mounted || !onboarded) return null;

  // Calculate Level based on XP
  const catLevel = Math.floor(catExp / 100) + 1;
  const xpProgress = catExp % 100;

  return (
    <main className="relative w-full pt-20 pb-24 bg-surface min-h-screen">
      {/* App Header (Empty Top Area) */}
      <div className="absolute top-0 left-0 w-full h-20 px-6 flex items-center justify-between z-20 bg-surface">
        <button 
          onClick={() => setShowHeaderBudget(!showHeaderBudget)}
          className={`bg-surface-container hover:bg-surface-container-high transition-colors rounded-full px-4 sm:px-5 py-2 shadow-sm border border-outline/10 text-primary text-left focus:outline-none flex items-center gap-2 max-w-[55%] ${
            showHeaderBudget ? 'font-family-label font-bold text-xs sm:text-sm' : 'font-family-display font-bold text-lg sm:text-xl tracking-tight'
          }`}
        >
          {!showHeaderBudget && (
            <Image src="/logo.svg" alt="MyDuitku Logo" width={32} height={32} className="rounded-full" />
          )}
          {showHeaderBudget ? `Sisa: ${formatMoney(rem, currency as any)}` : "MyDuitku"}
        </button>
        <div className="bg-surface-container rounded-full px-3 py-2 shadow-sm border border-outline/10 max-w-[40%] truncate">
          <span className="font-family-label font-bold text-xs sm:text-sm text-on-surface truncate">Hai, {userName || "User"} 👋</span>
        </div>
      </div>

      <div className="flex justify-center items-center w-full h-[calc(100vh-164px)] overflow-hidden py-4 px-4 sm:px-8">
        <div 
          className="relative overflow-hidden text-on-surface rounded-2xl shadow-lg border border-outline/10 bg-[#EFE5D9] w-full h-full"
        >
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div 
              style={{ 
                minWidth: '100%',
                minHeight: '100%',
                aspectRatio: '3464.5 / 1920'
              }}
              className="relative shrink-0"
            >
              <RoomBackground>
                {/* Speech Bubble */}
                <div className="absolute bottom-[55%] left-0 w-full flex justify-center z-20 pointer-events-auto">
                  <div className="w-[16%] min-w-[160px]">
                    <div className={`relative rounded-[20px] p-2.5 border-2 shadow-sm animate-float ${
                      catMood === 'sad' ? 'bg-error-container border-error/20 text-on-error-container' : 
                      catMood === 'worried' ? 'bg-tertiary-container border-tertiary/20 text-on-tertiary-container' : 
                      'bg-surface border-outline/20 text-on-surface'
                    }`}>
                      <p className="text-[10px] sm:text-xs text-center leading-snug font-family-body font-medium">
                        {speechBubbleText}
                      </p>
                      <div className="absolute -bottom-2 left-0 w-full flex justify-center">
                        <div className={`w-4 h-4 border-b-2 border-r-2 rotate-45 ${
                          catMood === 'sad' ? 'bg-error-container border-error/20' : 
                          catMood === 'worried' ? 'bg-tertiary-container border-tertiary/20' : 
                          'bg-surface border-outline/20'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Cat on Rug */}
                <div className="absolute bottom-[23%] left-0 w-full flex justify-center z-10 pointer-events-none">
                  <div className="relative w-[15%] min-w-[160px] aspect-[4/3] flex items-end justify-center pointer-events-auto">
                    {/* The Cat */}
                    <div className="relative z-10 origin-bottom hover:scale-110 transition-transform cursor-pointer drop-shadow-md w-full h-full flex justify-center">
                      <Cat skin={catSkin} mood={catMood} size="100%" />
                    </div>
                  </div>
                </div>
              </RoomBackground>
            </div>
          </div>
        {/* Floating Mini Game Button */}


        {/* Real-time Clock */}
        <div className="absolute top-[4%] left-[4%] z-10 scale-[0.6] sm:scale-75 origin-top-left pointer-events-none">
          <Clock />
        </div>

        {/* Top Right Buttons */}
        <div className="absolute top-[4%] right-[4%] z-10 flex flex-col gap-3 pointer-events-none">
          {/* Shop Button */}
          <button 
            onClick={() => setShowShopModal(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/90 text-on-primary rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-primary transition-colors hover:scale-110"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">storefront</span>
          </button>
          
          {/* Achievements Button */}
          <button 
            onClick={() => router.push('/achievements')}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-400 text-amber-900 rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-amber-300 transition-colors hover:scale-110"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">emoji_events</span>
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={() => setShowWishlistModal(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-400 text-rose-100 rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-rose-300 transition-colors hover:scale-110"
            title="Target Tabungan"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">savings</span>
          </button>
        </div>

        {/* Top Level Bar (Replaces Sisa Anggaran) */}
        <div className="absolute top-[4%] left-0 w-full flex justify-center z-10 pointer-events-none">
          <div className="min-w-[180px] pointer-events-auto">
            <div className="bg-surface/90 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-outline/10 flex flex-col items-center w-full">
              <span className="text-[10px] text-on-surface-variant leading-tight font-bold mb-1" style={{ fontFamily: 'var(--font-label-md)' }}>Level Kucing</span>
              <div className="flex items-center justify-center gap-2 w-full">
                <span className="font-bold text-on-surface text-xs" style={{ fontFamily: 'var(--font-label-md)' }}>Lv. {catLevel}</span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container rounded-full transition-all duration-500" 
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
                <span className="text-on-surface-variant text-[10px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-label-md)' }}>{xpProgress}%</span>
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px]">monetization_on</span>
                <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-label-md)' }}>{meowCoins} Coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-[3%] left-0 w-full px-4 flex justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto w-[80%] max-w-[280px]">
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="w-full bg-primary-container text-on-primary-container rounded-full py-3 flex items-center justify-center gap-2 shadow-[0_6px_0_rgba(108,69,0,0.2),0_10px_20px_rgba(0,0,0,0.1)] active:translate-y-[6px] active:shadow-none transition-all border-2 border-on-primary-container/10 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span className="font-bold text-sm sm:text-base" style={{ fontFamily: 'var(--font-headline-sm)' }}>Catat Pengeluaran</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseForm onClose={() => setShowExpenseModal(false)} />
      )}
      
      {showShopModal && (
        <ShopModal onClose={() => setShowShopModal(false)} />
      )}
      
      {showWishlistModal && (
        <WishlistModal onClose={() => setShowWishlistModal(false)} />
      )}
    </main>
  );
}