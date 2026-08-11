// Onboarding page — pick cat, pick currency (PRD §5.1, FR-1.1 to 1.6).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CatPicker from "@/components/Cat/CatPicker";
import { useStore } from "@/lib/store";
import { CURRENCIES, currencySymbol, formatMoney } from "@/lib/currency";
import { CATEGORY_COLORS } from "@/lib/defaults";
import type { Category, CategoryId, IncomeSource } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedSkin, setSelectedSkin] = useState(useStore.getState().catSkin);
  const [selectedCurrency, setSelectedCurrency] = useState(useStore.getState().currency);
  const [name, setName] = useState("");
  
  const [onboardingCategories, setOnboardingCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);

  const [onboardingIncomes, setOnboardingIncomes] = useState<IncomeSource[]>([{ id: `income-${Date.now()}`, label: "Gaji Utama", amount: 0 }]);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");

  const setOnboarded = useStore((state) => state.setOnboarded);
  const setCatSkin = useStore((state) => state.setCatSkin);
  const setCurrency = useStore((state) => state.setCurrency);
  const setCategories = useStore((state) => state.setCategories);
  const setIncomeSources = useStore((state) => state.setIncomeSources);
  const setUserName = useStore((state) => state.setUserName);

  function handleAddCategory(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: (`custom-${Date.now()}`) as CategoryId,
      label: newCatName.trim(),
      limit: Number(newCatLimit) || 0,
      color: newColor,
    };
    setOnboardingCategories([...onboardingCategories, newCat]);
    setNewCatName("");
    setNewCatLimit("");
    setNewColor(CATEGORY_COLORS[(onboardingCategories.length + 1) % CATEGORY_COLORS.length]);
  }

  function handleRemoveCategory(id: string) {
    setOnboardingCategories(onboardingCategories.filter(c => c.id !== id));
  }

  function handleAddIncome(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newIncomeName.trim()) return;
    const newIncome: IncomeSource = {
      id: `income-${Date.now()}`,
      label: newIncomeName.trim(),
      amount: Number(newIncomeAmount) || 0,
    };
    setOnboardingIncomes([...onboardingIncomes, newIncome]);
    setNewIncomeName("");
    setNewIncomeAmount("");
  }

  function handleRemoveIncome(id: string) {
    setOnboardingIncomes(onboardingIncomes.filter(i => i.id !== id));
  }

  function handleFinishOnboarding() {
    if (!name.trim()) {
      alert("Tulis nama panggilanmu dulu ya!");
      return;
    }
    if (onboardingCategories.length === 0) {
      alert("Buat minimal 1 kategori pengeluaran ya!");
      return;
    }
    if (onboardingIncomes.length === 0) {
      alert("Buat minimal 1 sumber pendapatan (misal: Gaji) ya!");
      return;
    }
    setUserName(name.trim());
    setCatSkin(selectedSkin);
    setCurrency(selectedCurrency);
    setCategories(onboardingCategories);
    setIncomeSources(onboardingIncomes);
    setOnboarded(true);
    router.replace("/");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 bg-surface">
      <div className="flex items-center gap-3 mb-6">
        <Image src="/logo.svg" alt="MyDuitku Logo" width={36} height={36} className="rounded-full shadow-sm" />
        <h1 className="font-display-lg font-bold text-on-surface text-center">
          MyDuitku 🐾
        </h1>
      </div>
      
      <div className="w-full max-w-xs flex flex-col gap-2 items-center mb-6">
        <label htmlFor="name-input" className="font-label-md text-on-surface-variant w-full text-center">
          Siapa namamu?
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Panggilan"
          maxLength={15}
          className="bg-surface-container border border-outline/20 rounded-full px-6 py-3 text-on-surface w-full max-w-[250px] text-center font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      <h2 className="font-headline-sm font-medium text-on-surface mb-4 text-center">
        Pilih Kucing Companionmu
      </h2>

      <div className="w-full max-w-3xl mb-8">
        <CatPicker initial={selectedSkin} onSelect={setSelectedSkin} />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-2 items-center">
        <label htmlFor="currency-select" className="font-label-md text-on-surface-variant">
          Mata Uang:
        </label>
        <select
          id="currency-select"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="bg-surface-container border border-outline/20 rounded-full px-6 py-3 text-on-surface w-full max-w-[200px] text-center-last font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c} {currencySymbol(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-sm mt-8 flex flex-col items-center">
        <label className="font-label-md text-on-surface-variant mb-4">
          Buat Kategori Pengeluaranmu
        </label>
        
        {/* Category List */}
        <div className="w-full flex flex-col gap-2 mb-4">
          {onboardingCategories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-surface-container-low px-4 py-3 rounded-xl border border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="font-body-md text-on-surface font-medium">{cat.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-label-md text-on-surface-variant text-sm">
                  {cat.limit > 0 ? formatMoney(cat.limit, selectedCurrency as any) : 'Tanpa Limit'}
                </span>
                <button 
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="text-error hover:text-error/80 transition-colors material-symbols-outlined text-[20px]"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
          {onboardingCategories.length === 0 && (
            <p className="text-center text-on-surface-variant text-sm py-4 italic">Belum ada kategori. Yuk, buat minimal satu!</p>
          )}
        </div>

        {/* Category Form */}
        <form onSubmit={handleAddCategory} className="w-full flex flex-col gap-3 bg-surface-container p-4 rounded-2xl border border-outline/20">
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
              placeholder="Nama Kategori (Makan, Kos, dll)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 min-w-0 bg-surface border border-outline/20 rounded-xl px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-sm font-label-md px-2">{currencySymbol(selectedCurrency as any)}</span>
            <input
              type="number"
              placeholder="Limit Sebulan (Opsional)"
              value={newCatLimit}
              onChange={(e) => setNewCatLimit(e.target.value)}
              className="flex-1 bg-surface border border-outline/20 rounded-xl px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-surface-tint shadow-sm transition-colors"
          >
            + Tambah Kategori
          </button>
        </form>
      </div>

      <div className="w-full max-w-sm mt-8 flex flex-col items-center">
        <label className="font-label-md text-on-surface-variant mb-4">
          Sumber Pendapatanmu
        </label>
        
        {/* Income List */}
        <div className="w-full flex flex-col gap-2 mb-4">
          {onboardingIncomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-surface-container-low px-4 py-3 rounded-xl border border-outline/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                <span className="font-body-md text-on-surface font-medium">{inc.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-label-md text-on-surface-variant text-sm">
                  {formatMoney(inc.amount, selectedCurrency as any)}
                </span>
                <button 
                  onClick={() => handleRemoveIncome(inc.id)}
                  className="text-error hover:text-error/80 transition-colors material-symbols-outlined text-[20px]"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
          {onboardingIncomes.length === 0 && (
            <p className="text-center text-on-surface-variant text-sm py-4 italic">Belum ada sumber pendapatan.</p>
          )}
        </div>

        {/* Income Form */}
        <form onSubmit={handleAddIncome} className="w-full flex flex-col gap-3 bg-surface-container p-4 rounded-2xl border border-outline/20">
          <input
            type="text"
            placeholder="Nama Sumber (Gaji, Bisnis, dll)"
            value={newIncomeName}
            onChange={(e) => setNewIncomeName(e.target.value)}
            className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-sm font-label-md px-2">{currencySymbol(selectedCurrency as any)}</span>
            <input
              type="number"
              placeholder="Jumlah Pendapatan (Bulan)"
              value={newIncomeAmount}
              onChange={(e) => setNewIncomeAmount(e.target.value)}
              className="flex-1 bg-surface border border-outline/20 rounded-xl px-4 py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-surface-tint shadow-sm transition-colors"
          >
            + Tambah Pendapatan
          </button>
        </form>
      </div>

      <div className="w-full max-w-xs mt-10">
        <button
          onClick={handleFinishOnboarding}
          className="w-full px-6 py-4 rounded-full bg-primary text-on-primary font-headline-sm hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 shadow-md"
        >
          Mulai Petualangan!
        </button>
      </div>
    </main>
  );
}
