"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks/useMounted";
import { currencySymbol } from "@/lib/currency";
import type { CategoryId } from "@/lib/types";
import { toast } from "sonner";
import { playSound, triggerHaptic } from "@/lib/utils/interaction";

interface ExpenseFormProps {
  onClose?: () => void;
}

// Helper to format date "YYYY-MM-DD"
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const mounted = useMounted();
  const addExpense = useStore((s) => s.addExpense);
  const categories = useStore((s) => s.categories);
  const incomeSources = useStore((s) => s.incomeSources);
  const currency = useStore((s) => s.currency as any);

  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<CategoryId>(categories[0]?.id ?? "makan");
  const [incomeSourceId, setIncomeSourceId] = useState<string>(incomeSources[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Custom UI states
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showIncomeDropdown, setShowIncomeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const catRef = useRef<HTMLDivElement>(null);
  const incRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setShowCatDropdown(false);
      }
      if (incRef.current && !incRef.current.contains(event.target as Node)) {
        setShowIncomeDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    if (!category) {
      toast.error("Pilih kategori pengeluaran dulu ya!");
      triggerHaptic(50);
      return;
    }
    if (incomeSources.length > 0 && !incomeSourceId) {
      toast.error("Pilih sumber pendapatan yang dipakai ya!");
      triggerHaptic(50);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Nominalnya jangan lupa diisi bro!");
      triggerHaptic(50);
      return;
    }
    
    setIsSubmitting(true);
    setShowHearts(true);
    playSound("coin");
    triggerHaptic([30, 50, 30]);

    setTimeout(() => {
      addExpense({ amount: Number(amount), category, note, date, incomeSourceId: incomeSourceId || undefined });
      setAmount("");
      setNote("");
      toast.success("Catatan berhasil ditambahkan! 🐾");
      if (onClose) onClose();
      setIsSubmitting(false);
      setShowHearts(false);
    }, 1500);
  }

  const selectedCat = categories.find(c => c.id === category);
  const selectedIncome = incomeSources.find(i => i.id === incomeSourceId);
  const budgetText = selectedCat?.limit ? `Budget: ${currencySymbol(currency)} ${selectedCat.limit.toLocaleString('id-ID')}` : "Tanpa Budget";

  // Calendar logic
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i);
      const dString = formatDate(d);
      const isSelected = date === dString;
      const isToday = formatDate(new Date()) === dString;
      
      days.push(
        <button
          key={i}
          type="button"
          onClick={() => {
            setDate(dString);
            setShowDatePicker(false);
          }}
          className={`h-8 w-8 flex items-center justify-center rounded-full font-body-md text-sm transition-colors ${
            isSelected ? 'bg-primary text-on-primary font-bold' : 
            isToday ? 'bg-secondary-container text-on-secondary-container font-bold' : 
            'hover:bg-surface-variant text-on-surface'
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-24 sm:pb-28 animate-slideUp">
      <div 
        className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-0"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-[400px] bg-surface rounded-[32px] p-5 sm:p-6 shadow-2xl shadow-tertiary/20 flex flex-col gap-md max-h-[78dvh] sm:max-h-[82vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-sm justify-center mb-sm mt-2">
          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center shadow-[0_4px_12px_rgba(254,182,196,0.4)] relative">
            {showHearts && (
              <span className="material-symbols-outlined absolute text-secondary-container text-2xl z-50 animate-float" style={{ animationDuration: '1s' }}>
                favorite
              </span>
            )}
            <span className="material-symbols-outlined text-on-secondary-container text-[32px]">account_balance_wallet</span>
          </div>
          <h2 className="font-display-lg-mobile text-headline-md text-tertiary text-center leading-tight">
            Catat Pengeluaran<br />
            <span className="font-body-md text-on-surface-variant font-medium">(Catat Transaksi)</span>
          </h2>
        </div>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          
          {/* Custom Category Dropdown */}
          <div className="flex flex-col gap-sm relative" ref={catRef}>
            <label className="font-label-md text-tertiary text-center">Kategori</label>
            <button
              type="button"
              onClick={() => setShowCatDropdown(!showCatDropdown)}
              className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface font-body-lg h-14 px-5 rounded-[24px] focus:bg-surface-container transition-colors shadow-[inset_0_2px_4px_rgba(121,86,76,0.05)] border-none"
            >
              {selectedCat && (
                <div 
                  className="w-3 h-3 rounded-full mr-1 shrink-0" 
                  style={{ backgroundColor: selectedCat.color }} 
                />
              )}
              <span>{selectedCat?.label}</span>
              <span className="material-symbols-outlined text-outline">expand_more</span>
            </button>
            
            {showCatDropdown && (
              <div className="absolute top-[80px] left-0 w-full bg-surface-container-high rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] z-20 py-2 border border-outline/10 max-h-[200px] overflow-y-auto animate-slideUp">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.id);
                      setShowCatDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-6 py-3 font-body-md transition-colors ${
                      category === c.id ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-surface-variant text-on-surface'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2 shrink-0" 
                      style={{ backgroundColor: c.color }} 
                    />
                    <span>{c.label}</span>
                    {category === c.id && <span className="material-symbols-outlined ml-auto text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between px-md mt-unit bg-tertiary-container/30 py-2 rounded-full mx-auto">
              <span className="font-body-md text-[13px] text-on-tertiary-container flex items-center gap-unit">
                <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span> 
                {budgetText}
              </span>
            </div>
          </div>

          {/* Custom Income Source Dropdown */}
          {incomeSources.length > 0 && (
            <div className="flex flex-col gap-sm relative" ref={incRef}>
              <label className="font-label-md text-tertiary text-center">Sumber Dana</label>
              <button
                type="button"
                onClick={() => setShowIncomeDropdown(!showIncomeDropdown)}
                className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface font-body-lg h-14 px-5 rounded-[24px] focus:bg-surface-container transition-colors shadow-[inset_0_2px_4px_rgba(121,86,76,0.05)] border-none"
              >
                <span className="material-symbols-outlined text-outline text-[20px]">payments</span>
                <span>{selectedIncome?.label || "Pilih Sumber..."}</span>
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </button>
              
              {showIncomeDropdown && (
                <div className="absolute top-[80px] left-0 w-full bg-surface-container-high rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] z-20 py-2 border border-outline/10 max-h-[200px] overflow-y-auto animate-slideUp">
                  {incomeSources.map((inc) => (
                    <button
                      key={inc.id}
                      type="button"
                      onClick={() => {
                        setIncomeSourceId(inc.id);
                        setShowIncomeDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3 font-body-md transition-colors ${
                        incomeSourceId === inc.id ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-surface-variant text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      <span>{inc.label}</span>
                      {incomeSourceId === inc.id && <span className="material-symbols-outlined ml-auto text-[18px]">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Date Picker */}
          <div className="flex flex-col gap-sm relative" ref={dateRef}>
            <label className="font-label-md text-tertiary text-center">Tanggal</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface font-body-lg h-14 px-5 rounded-[24px] focus:bg-surface-container transition-colors shadow-[inset_0_2px_4px_rgba(121,86,76,0.05)] border-none"
            >
              <span className="material-symbols-outlined text-outline">calendar_month</span>
              <span>{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </button>

            {showDatePicker && (
              <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[300px] bg-surface-container-high rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] z-20 p-4 border border-outline/10 animate-slideUp">
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <span className="font-label-md font-bold text-on-surface">
                    {calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                  <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-outline text-center">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateDays()}
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => {
                      setDate(formatDate(new Date()));
                      setShowDatePicker(false);
                    }}
                    className="text-primary font-label-md text-sm font-bold"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-tertiary text-center">Keterangan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface font-body-lg h-14 px-5 rounded-[24px] outline-none focus:bg-surface-container transition-colors shadow-[inset_0_2px_4px_rgba(121,86,76,0.05)] placeholder-outline-variant text-center"
              placeholder="Buat apa hayo?"
            />
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-tertiary text-center">Jumlah</label>
            <div className="relative flex items-center justify-center bg-surface-container-low rounded-[24px] shadow-[inset_0_2px_4px_rgba(121,86,76,0.05)] focus-within:bg-surface-container transition-colors h-16 px-5 overflow-hidden">
              <span className="font-headline-md text-tertiary select-none mr-sm">{currencySymbol(currency)}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-on-surface font-headline-md outline-none placeholder-outline-variant w-full max-w-[150px] text-left"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-sm w-full h-16 ${isSubmitting ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-container'} font-headline-sm rounded-[24px] flex items-center justify-center gap-sm shadow-[0_6px_16px_rgba(254,182,196,0.5)] active:translate-y-1 active:shadow-[0_2px_8px_rgba(254,182,196,0.5)] transition-all duration-200 shrink-0`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-bounce">favorite</span>
                Nyam Nyam...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                Simpan Pengeluaran
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-tertiary font-label-md hover:bg-surface-container rounded-full transition-colors text-center shrink-0"
          >
            Nanti Saja
          </button>
        </form>
      </div>
    </div>
  );
}