"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { currencySymbol, formatMoney } from "@/lib/currency";
import { useMounted } from "@/lib/hooks/useMounted";
import type { IncomeSource } from "@/lib/types";

export default function IncomeSourcesManager() {
  const mounted = useMounted();
  const { incomeSources, setIncomeSources, currency } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  if (!mounted) return null;

  function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newName.trim() || !newAmount) return;
    
    const newSource: IncomeSource = {
      id: `income-${Date.now()}`,
      label: newName.trim(),
      amount: Number(newAmount) || 0,
    };
    
    setIncomeSources([...incomeSources, newSource]);
    setNewName("");
    setNewAmount("");
  }

  function handleRemove(id: string) {
    setIncomeSources(incomeSources.filter(src => src.id !== id));
  }

  const totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);

  return (
    <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
        <h2 className="font-headline-sm text-primary">Sumber Pendapatan</h2>
      </div>
      
      {!isEditing ? (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-outline/10">
            <div>
              <p className="font-label-md text-on-surface-variant mb-1">Total Pemasukan</p>
              <p className="font-display-lg-mobile text-[24px] text-on-surface font-bold">
                {formatMoney(totalIncome, currency as any)}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
          
          {incomeSources.length > 0 && (
            <div className="flex flex-col gap-2 animate-slideUp">
              {incomeSources.map(src => (
                <div key={src.id} className="flex justify-between items-center bg-surface-container-low px-4 py-2 rounded-lg border border-outline/5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary/70 text-[16px]">payments</span>
                    <span className="font-body-md text-on-surface">{src.label}</span>
                  </div>
                  <span className="font-label-md text-on-surface-variant text-sm">
                    {formatMoney(src.amount, currency as any)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-slideUp">
          
          <div className="flex flex-col gap-2">
            {incomeSources.map(src => (
              <div key={src.id} className="flex items-center justify-between bg-surface px-4 py-3 rounded-xl border border-outline/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                  <span className="font-body-md text-on-surface font-medium">{src.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-md text-on-surface-variant text-sm">
                    {formatMoney(src.amount, currency as any)}
                  </span>
                  <button 
                    onClick={() => handleRemove(src.id)}
                    className="text-error hover:text-error/80 transition-colors material-symbols-outlined text-[18px]"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
            {incomeSources.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-2 italic">Belum ada sumber pendapatan.</p>
            )}
          </div>

          <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-surface p-3 rounded-xl border border-outline/10">
            <input
              type="text"
              placeholder="Nama (Misal: Gaji, Bisnis)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline/20 rounded-lg px-3 py-2 text-on-surface font-body-md focus:outline-none focus:border-primary"
            />
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-sm font-label-md">{currencySymbol(currency as any)}</span>
              <input
                type="number"
                placeholder="Jumlah per bulan"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1 bg-surface-container-low border border-outline/20 rounded-lg px-3 py-2 text-on-surface font-body-md focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 mt-1 rounded-lg bg-secondary-container text-on-secondary-container font-label-md font-bold transition-colors"
            >
              + Tambah
            </button>
          </form>

          <button
            onClick={() => setIsEditing(false)}
            className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md font-bold shadow-sm"
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}
