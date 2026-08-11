// Zustand store + localStorage persistence (PRD §6.5).
// Key: myduitku.v1.state. Sync-ready: all I/O via storage.ts adapter.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppState, CatSkin, Category, CategoryId, Expense, Wishlist, IncomeSource } from "./types";
import { loadFromStorage, saveToStorage } from "./storage.ts";

export const STORAGE_KEY = "myduitku.v1.state";

export type Store = AppState & {
  setOnboarded: (v: boolean) => void;
  setUserName: (name: string) => void;
  setCatSkin: (skin: CatSkin) => void;
  setCurrency: (currency: string) => void;
  setIncomeSources: (sources: IncomeSource[]) => void;
  setGameBestScore: (score: number) => void;
  setCategoryLimit: (id: CategoryId, limit: number) => void;
  setCategories: (categories: Category[]) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  resetMonth: () => void;
  importData: (json: string) => boolean;
  exportData: () => string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  buyItem: (itemId: string, price: number) => boolean;
  equipItem: (category: "wall" | "carpet" | "hat" | "glasses" | "necklace", itemId: string | null) => void;
  setAccessoryColor: (itemId: string, colorClass: string) => void;
  setMonth: (month: string) => void;
  addWishlist: (name: string, target: number) => void;
  addWishlistFund: (id: string, amount: number) => void;
  deleteWishlist: (id: string) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
};

function newId(): string {
  return crypto.randomUUID();
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "2026-08"
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      version: 1,
      onboarded: false,
      userName: "",
      catSkin: "tabby",
      currency: "IDR",
      incomeSources: [],
      gameBestScore: 0,
      categories: [],
      expenses: [],
      month: currentMonth(),
      catExp: 0,
      theme: "system",
      meowCoins: 0,
      unlockedItems: ["wall-default", "carpet-default"],
      equippedWall: "wall-default",
      equippedCarpet: "carpet-default",
      equippedHat: null,
      equippedGlasses: null,
      equippedNecklace: null,
      accessoryColors: {},

      unlockedBadges: [],
      lastActiveDate: null,
      streakDays: 0,
      wishlists: [],
      notificationEnabled: false,
      notificationTime: "20:00",

      setOnboarded: (v) => set({ onboarded: v }),
      setUserName: (name) => set({ userName: name }),
      setCatSkin: (skin) => set({ catSkin: skin }),
      setCurrency: (currency) => set({ currency }),
      setIncomeSources: (incomeSources) => set({ incomeSources }),
      setGameBestScore: (score) => set({ gameBestScore: score }),
      setTheme: (theme) => set({ theme }),

      setCategoryLimit: (id, limit) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, limit } : c)),
        })),

      setCategories: (categories) => set({ categories }),

      addExpense: (e) =>
        set((s) => {
          const newExpense = { ...e, id: newId(), createdAt: Date.now() };
          const newExpenses = [...s.expenses, newExpense];
          
          // Streak Logic
          const todayStr = new Date().toISOString().slice(0, 10);
          let newStreak = s.streakDays;
          if (s.lastActiveDate !== todayStr) {
            if (s.lastActiveDate) {
              const last = new Date(s.lastActiveDate);
              const today = new Date(todayStr);
              const diffTime = Math.abs(today.getTime() - last.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                newStreak += 1;
              } else {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }
          }

          // Badges Evaluation
          const newBadges = new Set(s.unlockedBadges);
          
          // 1. Konsisten Meow
          if (newStreak >= 7) newBadges.add("konsisten");
          
          // 2. Raja Jajan (Cek ID 'makan' atau keyword di nama kategori)
          const jajanKeywords = ["makan", "jajan", "food", "snack", "minum", "cemilan"];
          let jajanCount = 0;
          for (const x of newExpenses) {
            const cat = s.categories.find(c => c.id === x.category);
            const label = cat ? cat.label.toLowerCase() : "";
            if (x.category === "makan" || jajanKeywords.some(kw => label.includes(kw))) {
              jajanCount++;
            }
          }
          if (jajanCount >= 10) newBadges.add("jajan");

          // 3. Si Paling Hemat (Minimal 5 pengeluaran bulan ini dan masih di bawah 50% gaji)
          const currentMonthExpenses = newExpenses.filter(x => x.date.slice(0, 7) === s.month);
          const currentMonthSpent = currentMonthExpenses.reduce((sum, x) => sum + x.amount, 0);
          const totalIncome = s.incomeSources.reduce((sum, src) => sum + src.amount, 0);
          if (currentMonthExpenses.length >= 5 && currentMonthSpent < (totalIncome * 0.5)) {
            newBadges.add("hemat");
          }

          // 4. Pendekar Rungkad (> 100k per hari selama 7 hari berturut-turut)
          if (!newBadges.has("rungkad")) {
            const dailySpent: Record<string, number> = {};
            for (const x of newExpenses) {
              dailySpent[x.date] = (dailySpent[x.date] || 0) + x.amount;
            }
            const rungkadDates = Object.keys(dailySpent)
              .filter(d => dailySpent[d] >= 100000)
              .sort();
            
            let maxRungkadStreak = 0;
            let currentRungkadStreak = 0;
            let prevDateStr = "";

            for (const dStr of rungkadDates) {
              if (!prevDateStr) {
                currentRungkadStreak = 1;
              } else {
                const d = new Date(dStr);
                const prevD = new Date(prevDateStr);
                const diffTime = Math.abs(d.getTime() - prevD.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                  currentRungkadStreak++;
                } else {
                  currentRungkadStreak = 1;
                }
              }
              if (currentRungkadStreak > maxRungkadStreak) maxRungkadStreak = currentRungkadStreak;
              prevDateStr = dStr;
            }
            if (maxRungkadStreak >= 7) newBadges.add("rungkad");
          }

          return {
            expenses: newExpenses,
            catExp: s.catExp + 20,
            meowCoins: (s.meowCoins || 0) + 10,
            lastActiveDate: todayStr,
            streakDays: newStreak,
            unlockedBadges: Array.from(newBadges) as any[],
          };
        }),

      updateExpense: (id, e) =>
        set((s) => ({
          expenses: s.expenses.map((x) => (x.id === id ? { ...x, ...e } : x)),
        })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),

      resetMonth: () =>
        set((s) => ({
          expenses: s.expenses.filter((x) => x.date.slice(0, 7) !== s.month),
        })),

      buyItem: (itemId, price) => {
        const state = get();
        if (state.meowCoins >= price && !state.unlockedItems.includes(itemId)) {
          set({
            meowCoins: state.meowCoins - price,
            unlockedItems: [...state.unlockedItems, itemId],
          });
          return true;
        }
        return false;
      },

      equipItem: (category, itemId) => {
        if (category === "wall") set({ equippedWall: itemId || "wall-default" });
        else if (category === "carpet") set({ equippedCarpet: itemId || "carpet-default" });
        else if (category === "hat") set({ equippedHat: itemId });
        else if (category === "glasses") set({ equippedGlasses: itemId });
        else if (category === "necklace") set({ equippedNecklace: itemId });
      },

      setAccessoryColor: (itemId, colorClass) => {
        set((s) => ({
          accessoryColors: {
            ...s.accessoryColors,
            [itemId]: colorClass
          }
        }));
      },

      setMonth: (month) => set({ month }),

      addWishlist: (name, target) => 
        set((s) => ({
          wishlists: [...s.wishlists, { id: newId(), name, target, current: 0, isCompleted: false, createdAt: Date.now() }],
        })),
        
      addWishlistFund: (id, amount) =>
        set((s) => ({
          wishlists: s.wishlists.map((w) => 
            w.id === id 
              ? { 
                  ...w, 
                  current: w.current + amount, 
                  isCompleted: w.current + amount >= w.target 
                } 
              : w
          ),
        })),

      deleteWishlist: (id) =>
        set((s) => ({ wishlists: s.wishlists.filter((w) => w.id !== id) })),

      setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),
      setNotificationTime: (time) => set({ notificationTime: time }),

      exportData: () => JSON.stringify({ version: 1, state: get() }, null, 2),

      importData: (json) => {
        try {
          const parsed = JSON.parse(json) as { version?: number; state?: Partial<Store> };
          if (parsed?.version !== 1 || !parsed.state) return false;
          const { state } = parsed;
          if (!Array.isArray(state.expenses) || !Array.isArray(state.categories)) return false;
          set({
            onboarded: Boolean(state.onboarded ?? true),
            userName: state.userName ?? get().userName,
            catSkin: (state.catSkin as CatSkin) ?? get().catSkin,
            currency: state.currency ?? get().currency,
            incomeSources: state.incomeSources ? state.incomeSources : (typeof (state as any).gaji === "number" ? [{ id: "gaji", label: "Gaji", amount: (state as any).gaji }] : get().incomeSources),
            gameBestScore: typeof state.gameBestScore === "number" ? state.gameBestScore : get().gameBestScore,
            categories: state.categories as Category[],
            expenses: state.expenses as Expense[],
            month: (state.month as string) ?? get().month,
            catExp: typeof state.catExp === "number" ? state.catExp : get().catExp,
            theme: (state.theme as any) ?? get().theme,
            meowCoins: typeof state.meowCoins === "number" ? state.meowCoins : get().meowCoins,
            unlockedItems: Array.isArray(state.unlockedItems) ? state.unlockedItems : get().unlockedItems,
            equippedWall: state.equippedWall ?? get().equippedWall,
            equippedCarpet: state.equippedCarpet ?? get().equippedCarpet,
            equippedHat: state.equippedHat !== undefined ? state.equippedHat : get().equippedHat,
            equippedGlasses: state.equippedGlasses !== undefined ? state.equippedGlasses : get().equippedGlasses,
            equippedNecklace: state.equippedNecklace !== undefined ? state.equippedNecklace : get().equippedNecklace,
            accessoryColors: state.accessoryColors || get().accessoryColors || {},
            unlockedBadges: Array.isArray(state.unlockedBadges) ? state.unlockedBadges : get().unlockedBadges,
            lastActiveDate: state.lastActiveDate !== undefined ? state.lastActiveDate : get().lastActiveDate,
            streakDays: typeof state.streakDays === "number" ? state.streakDays : get().streakDays,
            wishlists: Array.isArray(state.wishlists) ? state.wishlists : get().wishlists,
            notificationEnabled: typeof state.notificationEnabled === "boolean" ? state.notificationEnabled : get().notificationEnabled,
            notificationTime: state.notificationTime ?? get().notificationTime,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (k) => loadFromStorage(k),
        setItem: (k, v) => saveToStorage(k, v),
        removeItem: (k) => {
          try {
            localStorage.removeItem(k);
          } catch {
            /* ignore */
          }
        },
      })),
    }
  )
);
