"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks/useMounted";
import { formatMoney } from "@/lib/currency";
import { CategoryId } from "@/lib/types";

export default function ExpenseList() {
  const mounted = useMounted();
  const { expenses, updateExpense, deleteExpense, currency, categories } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number | string>("");
  const [editNote, setEditNote] = useState("");

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  if (!mounted) return null;

  const getCategory = (categoryId: CategoryId) => {
    return categories.find((c) => c.id === categoryId);
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount);
    setEditNote(expense.note || "");
  };

  const handleSave = (id: string) => {
    if (editAmount && Number(editAmount) > 0) {
      updateExpense(id, { amount: Number(editAmount), note: editNote });
    }
    setEditingId(null);
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.createdAt - b.createdAt;
      case "highest":
        return b.amount - a.amount;
      case "lowest":
        return a.amount - b.amount;
      case "newest":
      default:
        return b.createdAt - a.createdAt;
    }
  });

  return (
    <div className="flex flex-col gap-3">
      {expenses.length > 0 && (
        <div className="flex items-center justify-between bg-surface px-4 py-3 rounded-2xl shadow-sm border border-outline/10">
          <span className="font-family-label text-on-surface font-bold text-sm">Urutkan</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-surface-container-low text-on-surface text-sm font-family-body font-medium rounded-full pl-4 pr-10 py-1.5 outline-none focus:ring-1 focus:ring-primary border border-outline/10 cursor-pointer shadow-sm"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Nominal Terbesar</option>
              <option value="lowest">Nominal Terkecil</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      )}

      {sortedExpenses.length === 0 ? (
        <div className="bg-surface p-6 rounded-2xl border border-outline/10 text-center shadow-sm">
          <p className="font-family-body text-on-surface-variant">Belum ada pengeluaran. 🐾</p>
        </div>
      ) : (
        sortedExpenses.map((e) => {
          const cat = getCategory(e.category as CategoryId);
          const isEditing = editingId === e.id;

          if (isEditing) {
            return (
              <div key={e.id} className="flex flex-col gap-3 bg-surface p-4 rounded-2xl shadow-md border border-primary/30 animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat?.color || '#6366F1' }}
                  />
                  <span className="font-family-label font-bold text-on-surface text-sm">Edit {cat?.label}</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editNote}
                    onChange={(ev) => setEditNote(ev.target.value)}
                    placeholder="Keterangan"
                    className="flex-1 min-w-0 bg-surface-container-low rounded-xl px-3 py-2 text-on-surface font-family-body text-sm outline-none focus:border focus:border-primary"
                  />
                  <div className="flex items-center gap-1 bg-surface-container-low rounded-xl px-3 py-2 w-[130px] shrink-0 focus-within:border focus-within:border-primary">
                    <span className="text-on-surface-variant text-sm font-medium">Rp</span>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(ev) => setEditAmount(ev.target.value)}
                      className="w-full bg-transparent text-on-surface font-family-body font-medium text-right outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 text-tertiary font-family-label hover:bg-surface-container rounded-xl transition-colors text-center text-sm font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleSave(e.id)}
                    className="flex-1 bg-primary text-on-primary rounded-xl font-family-label font-bold text-sm shadow-sm hover:bg-surface-tint"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={e.id} className="animate-list-enter flex items-center justify-between bg-surface p-4 rounded-2xl shadow-sm border border-outline/10 hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-family-body text-[15px] sm:text-[17px] font-semibold text-on-surface leading-tight">
                    {e.note || "(Tanpa Keterangan)"}
                  </p>
                  <p className="font-family-label font-medium text-on-surface-variant text-xs mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: cat?.color || '#6366F1' }}></span>
                    {cat?.label || e.category} &bull; {e.date}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-family-label font-bold text-secondary text-right mb-1 text-sm sm:text-base">
                  - {formatMoney(e.amount, currency as any)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(e)}
                    aria-label="Edit"
                    className="w-7 h-7 flex items-center justify-center rounded-full text-outline hover:bg-primary-container hover:text-on-primary-container transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => deleteExpense(e.id)}
                    aria-label="Hapus"
                    className="w-7 h-7 flex items-center justify-center rounded-full text-outline hover:bg-error hover:text-on-error transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
