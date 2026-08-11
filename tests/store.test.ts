import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { useStore, STORAGE_KEY } from "../lib/store.ts";

// Minimal localStorage mock (node:test has no DOM).
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

beforeEach(() => {
  mem.clear();
  useStore.setState({
    onboarded: false,
    catSkin: "tabby",
    currency: "IDR",
    incomeSources: [],
    categories: [],
    expenses: [],
  });
});

test("setIncomeSources updates state", () => {
  useStore.getState().setIncomeSources([{ id: "1", label: "Gaji", amount: 5_000_000 }]);
  assert.equal(useStore.getState().incomeSources[0].amount, 5_000_000);
});

test("addExpense appends with id + createdAt", () => {
  useStore.getState().addExpense({ date: "2026-08-04", category: "makan", amount: 25_000, note: "nasi padang" });
  const [e] = useStore.getState().expenses;
  assert.ok(e.id);
  assert.ok(e.createdAt > 0);
  assert.equal(e.amount, 25_000);
  assert.equal(e.category, "makan");
});

test("deleteExpense removes by id", () => {
  useStore.getState().addExpense({ date: "2026-08-04", category: "makan", amount: 1, note: "" });
  const id = useStore.getState().expenses[0].id;
  useStore.getState().deleteExpense(id);
  assert.equal(useStore.getState().expenses.length, 0);
});

test("persist writes to localStorage", () => {
  useStore.getState().setIncomeSources([{ id: "1", label: "Gaji", amount: 3_000_000 }]);
  // persist middleware writes async-ish via setItem; flush microtasks
  return Promise.resolve().then(() => {
    const raw = mem.get(STORAGE_KEY);
    assert.ok(raw, "expected persisted state in localStorage");
    const parsed = JSON.parse(raw);
    assert.equal(parsed.state.incomeSources[0].amount, 3_000_000);
  });
});

test("setCategoryLimit updates single category", () => {
  useStore.getState().setCategories([{ id: "makan", label: "Makan", limit: 0, color: "#fff" }]);
  useStore.getState().setCategoryLimit("makan", 999_999);
  const makan = useStore.getState().categories.find((c) => c.id === "makan");
  assert.equal(makan?.limit, 999_999);
});

test("resetMonth clears current month expenses only", () => {
  const now = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  useStore.getState().addExpense({ date: `${now}-05`, category: "makan", amount: 1, note: "bulan ini" });
  useStore.getState().addExpense({ date: "2026-07-20", category: "kos", amount: 2, note: "bulan lalu" });
  useStore.getState().resetMonth();
  const remaining = useStore.getState().expenses;
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].date, "2026-07-20");
});

test("exportData → JSON, importData restores", () => {
  useStore.getState().setIncomeSources([{ id: "gaji", label: "Gaji", amount: 4_000_000 }]);
  useStore.getState().addExpense({ date: "2026-08-01", category: "harian", amount: 50_000, note: "belanja" });
  const json = useStore.getState().exportData();
  const parsed = JSON.parse(json);
  assert.equal(parsed.version, 1);
  assert.ok(parsed.state.expenses.length === 1);

  // Fresh state, import back
  useStore.setState({ incomeSources: [], expenses: [], onboarded: false });
  assert.equal(useStore.getState().incomeSources.length, 0);
  const ok = useStore.getState().importData(json);
  assert.equal(ok, true);
  assert.equal(useStore.getState().incomeSources[0].amount, 4_000_000);
  assert.equal(useStore.getState().expenses.length, 1);
});

test("importData rejects invalid shape", () => {
  assert.equal(useStore.getState().importData("not json"), false);
  assert.equal(useStore.getState().importData(JSON.stringify({ foo: 1 })), false);
  assert.equal(useStore.getState().importData(JSON.stringify({ version: 2, state: {} })), false);
});
