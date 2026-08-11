// Shared domain types (plan-mvp.md data model).

export type CatSkin = "hitam" | "tabby" | "oren" | "putih";

export type CategoryId =
  | "makan"
  | "kos"
  | "transport"
  | "internet"
  | "harian"
  | "laundry"
  | "hiburan"
  | "darurat"
  | "kirim-ortu";

export type Expense = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  category: CategoryId;
  incomeSourceId?: string; // Optional for backward compatibility, identifies which income source funded it
  amount: number; // integer, minor unit of currency
  note: string;
  createdAt: number;
};

export type Category = {
  id: CategoryId;
  label: string;
  color: string;
  limit: number;
};

export type IncomeSource = {
  id: string;
  label: string;
  amount: number;
};

export type BadgeId = "hemat" | "jajan" | "konsisten" | "rungkad";

export type Wishlist = {
  id: string;
  name: string;
  target: number;
  current: number;
  isCompleted: boolean;
  createdAt: number;
};

export type AppState = {
  version: 1;
  onboarded: boolean;
  userName?: string;
  catSkin: CatSkin;
  currency: string; // Currency code, "IDR" default
  incomeSources: IncomeSource[];
  gameBestScore?: number;
  categories: Category[];
  expenses: Expense[];
  month: string; // "2026-08" — current budgeting month
  catExp: number;
  theme: "light" | "dark" | "system";
  meowCoins: number;
  unlockedItems: string[];
  equippedWall: string;
  equippedCarpet: string;
  unlockedBadges: BadgeId[];
  lastActiveDate: string | null; // ISO yyyy-mm-dd
  streakDays: number;
  wishlists: Wishlist[];
  notificationEnabled: boolean;
  notificationTime: string; // "20:00" format
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedNecklace: string | null;
  accessoryColors: Record<string, string>; // Maps accessory id to a filter string (e.g., "hue-rotate-[120deg]")
};
