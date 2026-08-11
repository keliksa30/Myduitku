// Budget math — pure functions, no I/O. Mood derivation per PRD §6.4.

import type { Expense, Category } from "./types";

export function totalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function remaining(gaji: number, spent: number): number {
  return gaji - spent;
}

export function categorySpent(expenses: Expense[], categoryId: string): number {
  return expenses.filter((e) => e.category === categoryId).reduce((sum, e) => sum + e.amount, 0);
}

export function categoryRemaining(limit: number, spent: number): number {
  return limit - spent;
}

// Ratio 0..1+ of limit used; 0 when limit is 0.
export function limitRatio(spent: number, limit: number): number {
  return limit <= 0 ? (spent > 0 ? Infinity : 0) : spent / limit;
}

export function isOverLimit(spent: number, limit: number): boolean {
  return spent > limit;
}

// Per PRD §6.4 thresholds: <70% happy, 70–90% neutral, 90–100% worried, >100% sad.
// sad wins on any over-limit category; worried wins over neutral when any near-limit.
export type Mood = "happy" | "neutral" | "worried" | "sad";

export function deriveMood(expenses: Expense[], categories: Category[], incomeSources: { amount: number }[]): Mood {
  const spent = totalSpent(expenses);
  const ratios = categories.map((c) => limitRatio(categorySpent(expenses, c.id), c.limit));
  
  const totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);
  const gajiRatio = totalIncome > 0 ? spent / totalIncome : 0;

  if (ratios.some((r) => r > 1) || (totalIncome > 0 && spent > totalIncome)) return "sad";
  if (ratios.some((r) => r >= 0.9)) return "worried";
  if (ratios.every((r) => r < 0.7) && gajiRatio < 0.7) return "happy";
  return "neutral";
}
