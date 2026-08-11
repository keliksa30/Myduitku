"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks/useMounted";
import { formatMoney } from "@/lib/currency";
import { CATEGORY_COLORS } from "@/lib/defaults";
import type { Category, CategoryId } from "@/lib/types";

export default function CategoryManager() {
  const mounted = useMounted();
  const categories = useStore((s) => s.categories);
  const setCategories = useStore((s) => s.setCategories);
  const expenses = useStore((s) => s.expenses);
  const currency = useStore((s) => s.currency as any);

  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);

  if (!mounted) return null;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel) return;
    const newCat: Category = {
      id: (`custom-${Date.now()}`) as CategoryId,
      label: newLabel,
      color: newColor,
      limit: Number(newLimit) || 0,
    };
    setCategories([...categories, newCat]);
    setNewLabel("");
    setNewLimit("");
    setNewColor(CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]);
  }

  function handleUpdate(id: CategoryId, field: keyof Omit<Category, "id">, value: any) {
    const updated = categories.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setCategories(updated);
  }

  function handleDelete(id: CategoryId) {
    setCategories(categories.filter((c) => c.id !== id));
  }

  // Calculate spent per category
  const spentByCat = categories.map(cat => {
    const spent = expenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
    const percentage = cat.limit > 0 ? Math.min(100, Math.round((spent / cat.limit) * 100)) : 0;
    const isOver = cat.limit > 0 && spent > cat.limit;
    return { ...cat, spent, percentage, isOver };
  });

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-sm text-headline-sm text-tertiary flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          Rincian Kategori
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-primary text-sm font-label-md flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">{isEditing ? 'done' : 'edit'}</span>
          {isEditing ? 'Selesai' : 'Atur'}
        </button>
      </div>

      {!isEditing ? (
        <div className="flex flex-col gap-6">
          {spentByCat.map((cat, idx) => (
            <div key={cat.id} className="group">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 font-label-md text-[13px] rounded-full shadow-sm text-white"
                    style={{ backgroundColor: cat.color || '#6366F1' }}
                  >
                    {cat.label}
                  </span>
                </div>
                <span className="font-label-md text-[13px] text-on-surface-variant text-right">
                  {formatMoney(cat.spent, currency)} / {formatMoney(cat.limit, currency)}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                    cat.isOver ? 'bg-error' : 
                    idx % 3 === 0 ? 'bg-primary-container' :
                    idx % 3 === 1 ? 'bg-secondary' : 'bg-inverse-primary'
                  }`} 
                  style={{ width: `${cat.percentage}%` }}
                ></div>
                {cat.percentage > 5 && (
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 -ml-2 drop-shadow-md transition-all duration-1000 ease-out ${cat.isOver ? 'text-on-error' : 'text-primary'}`} 
                    style={{ left: `${Math.max(5, cat.percentage - 5)}%` }}
                  >
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {cat.isOver ? 'warning' : 'pets'}
                    </span>
                  </div>
                )}
              </div>
              {cat.isOver && (
                <p className="text-xs text-error mt-1.5 font-label-md">Oops! Melebihi anggaran {formatMoney(cat.spent - cat.limit, currency)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-slideUp">
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-surface-container-low p-3 rounded-[16px] border border-outline/10 shadow-sm">
                <input
                  type="color"
                  value={c.color || '#6366F1'}
                  onChange={(e) => handleUpdate(c.id, "color", e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer shrink-0 border-none p-0 bg-transparent overflow-hidden appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
                  title="Pilih Warna Kategori"
                />
                <input
                  type="text"
                  value={c.label}
                  onChange={(e) => handleUpdate(c.id, "label", e.target.value)}
                  className="flex-1 min-w-[80px] bg-transparent border-b border-outline/20 px-1 py-1 text-on-surface font-body-md focus:outline-none focus:border-primary"
                />
                <div className="flex items-center gap-1 border-b border-outline/20 focus-within:border-primary">
                  <span className="text-on-surface-variant text-sm">Rp</span>
                  <input
                    type="number"
                    value={c.limit}
                    onChange={(e) => handleUpdate(c.id, "limit", Number(e.target.value))}
                    className="w-[80px] bg-transparent py-1 text-on-surface font-body-md text-right focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full text-error hover:bg-error-container transition-colors ml-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            ))}
          </ul>
          {/* Add new category */}
          <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-surface-container border border-outline/10 rounded-2xl p-4 shadow-sm mt-4">
            <h3 className="font-label-md text-primary">Tambah Kategori Baru</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded-full cursor-pointer shrink-0 border-none p-0 bg-transparent overflow-hidden appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
                  title="Pilih Warna Kategori"
                />
                <input
                  type="text"
                  placeholder="Nama Kategori"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 min-w-0 bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body-md outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <input
                type="number"
                placeholder="Limit Anggaran"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body-md outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-surface-tint shadow-sm"
              >
                Tambah Kategori
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
