"use client";

import { useMounted } from "@/lib/hooks/useMounted";
import BudgetSummary from "@/components/Budget/BudgetSummary";
import CategoryManager from "@/components/Budget/CategoryManager";
import ExpenseList from "@/components/Budget/ExpenseList";

export default function DiaryPage() {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <main className="relative w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="flex flex-col w-full p-container-padding max-w-[480px] mx-auto">
        {/* Modal-like container */}
        <div className="relative w-full bg-surface-container rounded-[32px] shadow-[0_8px_32px_rgba(130,85,0,0.15)] overflow-hidden">
          {/* Decorative Header / Cat Ears */}
          <div className="absolute -top-4 left-6 w-12 h-12 bg-surface-container rounded-t-full rotate-[-15deg] z-0"></div>
          <div className="absolute -top-4 right-6 w-12 h-12 bg-surface-container rounded-t-full rotate-[15deg] z-0"></div>
          
          <div className="relative z-10 bg-surface-container rounded-[32px] p-6 pb-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Ringkasan Keuangan</h2>
                <p className="font-body-md text-body-md text-on-surface-variant opacity-80">(Buku Harian Kucing)</p>
              </div>
            </div>

            <BudgetSummary />
            
            <CategoryManager />
            
            <div className="mt-8">
              <h3 className="font-headline-sm text-headline-sm text-tertiary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                Riwayat Transaksi
              </h3>
              <ExpenseList />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
