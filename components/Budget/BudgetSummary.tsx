"use client";

import { useStore } from "@/lib/store";
import { totalSpent, remaining } from "@/lib/budget";
import { formatMoney } from "@/lib/currency";
import { useMounted } from "@/lib/hooks/useMounted";

export default function BudgetSummary() {
  const mounted = useMounted();
  const { incomeSources, expenses, currency } = useStore();
  const spent = totalSpent(expenses);
  const totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);
  const rem = remaining(totalIncome, spent);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      {/* Income */}
      <div className="bg-surface rounded-2xl p-4 shadow-[0_4px_12px_rgba(130,85,0,0.05)] relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-container rounded-full opacity-20"></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[18px]">arrow_downward</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant truncate">Pemasukan</span>
        </div>
        <p className="font-headline-sm text-[18px] leading-[24px] font-bold text-primary truncate">
          {formatMoney(totalIncome, currency as any)}
        </p>
      </div>

      {/* Spent */}
      <div className="bg-surface rounded-2xl p-4 shadow-[0_4px_12px_rgba(130,85,0,0.05)] relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary-container rounded-full opacity-20"></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 shrink-0 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container text-[18px]">arrow_upward</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant truncate">Pengeluaran</span>
        </div>
        <p className="font-headline-sm text-[18px] leading-[24px] font-bold text-secondary truncate">
          {formatMoney(spent, currency as any)}
        </p>
      </div>

      {/* Remaining (Full Width) */}
      <div className={`col-span-2 ${rem < 0 ? 'bg-error text-on-error' : 'bg-primary text-on-primary'} rounded-2xl p-5 shadow-[0_4px_12px_rgba(130,85,0,0.2)] relative overflow-hidden flex items-center justify-between`}>
        <svg className="absolute right-0 top-0 h-full w-32 opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0,100 C20,80 50,100 100,50 L100,100 Z" fill="currentColor"></path>
        </svg>
        <div>
          <span className="font-label-md text-label-md opacity-90 block mb-1">Sisa Anggaran</span>
          <p className="font-display-lg-mobile text-[24px] leading-[32px] font-extrabold whitespace-nowrap">
            {formatMoney(rem, currency as any)}
          </p>
        </div>
        <div className={`w-12 h-12 ${rem < 0 ? 'bg-on-error text-error' : 'bg-on-primary text-primary'} rounded-full flex items-center justify-center shadow-inner shrink-0 ml-4`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {rem < 0 ? 'warning' : 'savings'}
          </span>
        </div>
      </div>
    </div>
  );
}
