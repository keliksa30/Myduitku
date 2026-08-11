"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/currency";

type Props = {
  onClose: () => void;
};

export default function WishlistModal({ onClose }: Props) {
  const wishlists = useStore((s) => s.wishlists || []);
  const addWishlist = useStore((s) => s.addWishlist);
  const addWishlistFund = useStore((s) => s.addWishlistFund);
  const deleteWishlist = useStore((s) => s.deleteWishlist);
  const currency = useStore((s) => s.currency as any);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("");

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newTarget) return;
    addWishlist(newName, Number(newTarget));
    setNewName("");
    setNewTarget("");
    setIsAdding(false);
  }

  function handleFundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fundingId || !fundAmount) return;
    addWishlistFund(fundingId, Number(fundAmount));
    setFundingId(null);
    setFundAmount("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-surface rounded-[32px] shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-6 pb-0 flex justify-between items-center mb-2">
          <h2 className="font-headline-sm text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">savings</span>
            Target Tabungan
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {wishlists.length === 0 && !isAdding && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[64px] text-surface-variant mb-4">cruelty_free</span>
              <p className="font-body-md text-on-surface-variant">Belum ada target tabungan meow! Yuk buat impian pertamamu.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {wishlists.map((w) => {
              const progress = Math.min(100, Math.round((w.current / w.target) * 100));
              return (
                <div key={w.id} className="bg-surface-container-low border border-outline/10 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  {w.isCompleted && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-0 pointer-events-none">
                      <span className="material-symbols-outlined text-[100px] text-primary/20 -rotate-12">verified</span>
                    </div>
                  )}
                  
                  <div className="relative z-10 flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-label-md font-bold text-on-surface flex items-center gap-2">
                        {w.name}
                        {w.isCompleted && <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">
                        {formatMoney(w.current, currency)} / {formatMoney(w.target, currency)}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteWishlist(w.id)}
                      className="text-error opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden mt-3 mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 ${w.isCompleted ? 'bg-primary' : 'bg-tertiary'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {fundingId === w.id ? (
                    <form onSubmit={handleFundSubmit} className="flex gap-2 animate-slideUp">
                      <input
                        type="number"
                        placeholder="Nominal"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="flex-1 bg-surface border border-outline/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        required
                        autoFocus
                      />
                      <button type="submit" className="bg-primary text-on-primary px-3 rounded-lg text-sm font-bold">Simpan</button>
                      <button type="button" onClick={() => setFundingId(null)} className="bg-surface-container px-3 rounded-lg text-sm font-bold text-on-surface-variant">Batal</button>
                    </form>
                  ) : (
                    !w.isCompleted && (
                      <button 
                        onClick={() => setFundingId(w.id)}
                        className="w-full bg-primary-container text-on-primary-container py-2 rounded-lg font-label-md font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Isi Celengan
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="mt-4 bg-surface-container p-4 rounded-2xl animate-slideUp border border-outline/10">
              <h3 className="font-label-md text-primary mb-3">Target Baru</h3>
              <input
                type="text"
                placeholder="Nama (Cth: Beli PS5)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-surface border border-outline/20 rounded-lg px-3 py-2 mb-2 text-sm outline-none focus:border-primary"
                required
              />
              <input
                type="number"
                placeholder="Target Nominal"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full bg-surface border border-outline/20 rounded-lg px-3 py-2 mb-3 text-sm outline-none focus:border-primary"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-bold text-sm">Buat</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-surface-variant text-on-surface-variant py-2 rounded-lg font-bold text-sm">Batal</button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full mt-4 bg-surface-container-high text-on-surface py-3 rounded-xl font-label-md font-bold flex items-center justify-center gap-2 border border-outline/20 border-dashed hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Buat Target Baru
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
