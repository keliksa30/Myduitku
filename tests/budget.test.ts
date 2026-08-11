import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totalSpent,
  remaining,
  categorySpent,
  categoryRemaining,
  limitRatio,
  isOverLimit,
  deriveMood,
} from "../lib/budget.ts";
import type { Expense, Category } from "../lib/types.ts";

const CATS: Category[] = [
  { id: "makan", color: "#000", label: "Makan", limit: 700_000 },
  { id: "kos", color: "#000", label: "Kos", limit: 1_200_000 },
  { id: "hiburan", color: "#000", label: "Hiburan", limit: 500_000 },
];

function exp(category: Expense["category"], amount: number, id = `${category}-${amount}`): Expense {
  return { id, date: "2026-08-04", category, amount, note: "", createdAt: 0 };
}

test("totalSpent sums all expenses", () => {
  assert.equal(totalSpent([exp("makan", 10_000), exp("kos", 500_000), exp("makan", 20_000)]), 530_000);
  assert.equal(totalSpent([]), 0);
});

test("remaining = gaji - totalSpent", () => {
  assert.equal(remaining(5_000_000, 530_000), 4_470_000);
});

test("categorySpent filters by category", () => {
  const exps = [exp("makan", 10_000), exp("kos", 500_000), exp("makan", 20_000)];
  assert.equal(categorySpent(exps, "makan"), 30_000);
  assert.equal(categorySpent(exps, "hiburan"), 0);
});

test("categoryRemaining = limit - spent", () => {
  assert.equal(categoryRemaining(700_000, 423_000), 277_000);
});

test("limitRatio handles zero limit", () => {
  assert.equal(limitRatio(0, 0), 0);
  assert.equal(limitRatio(100, 0), Infinity);
});

test("isOverLimit flags spent > limit", () => {
  assert.equal(isOverLimit(701_000, 700_000), true);
  assert.equal(isOverLimit(700_000, 700_000), false);
});

test("mood happy when <70% everywhere", () => {
  const exps = [exp("makan", 100_000), exp("kos", 200_000)];
  assert.equal(deriveMood(exps, CATS, [{ amount: 5_000_000 }]), "happy");
});

test("mood: neutral (70-90%)", () => {
  const exps = [{ id: "1", date: "2024-03-01", category: "c1" as any, amount: 800_000, note: "", createdAt: 0 }];
  assert.equal(deriveMood(exps, CATS, [{ amount: 5_000_000 }]), "neutral");
});

test("mood: worried (90-100%)", () => {
  const exps = [{ id: "1", date: "2024-03-01", category: "c1" as any, amount: 950_000, note: "", createdAt: 0 }];
  assert.equal(deriveMood(exps, CATS, [{ amount: 5_000_000 }]), "worried");
});

test("mood: sad (>100% cat)", () => {
  const exps = [{ id: "1", date: "2024-03-01", category: "c1" as any, amount: 1_200_000, note: "", createdAt: 0 }];
  assert.equal(deriveMood(exps, CATS, [{ amount: 5_000_000 }]), "sad");
});

test("mood: sad (>100% total)", () => {
  const exps = [{ id: "1", date: "2024-03-01", category: "c2" as any, amount: 6_000_000, note: "", createdAt: 0 }];
  assert.equal(deriveMood(exps, CATS, [{ amount: 5_000_000 }]), "sad");
});
