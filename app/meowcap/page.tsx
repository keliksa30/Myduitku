"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/currency";
import { toPng } from "html-to-image";
import Cat from "@/components/Cat/Cat";
import { triggerHaptic } from "@/lib/utils/interaction";

const QUOTES = [
  "ingat mati, ingat sakit, inget besok masih harus nyari duit",
  "Perasaan udah kerja keras tiap hari, bukannya makin kaya, malah makin stres. Makanya nabung, jangan boros",
  "Semangat kerjanya, lu bukan pemilik dapur embege",
  "1 Triliun tuh nol-nya berapa ya?",
  "Inget ya, kalo lagi bokek gausah banyak jajan, uangmu gabisa diganti kimpul",
  "Kayaknya lu butuh istirahat deh, besok kan kerja lagi",
  "Semangat terus narik rejekinya, rejeki mah gabakal kemana, cuman kalo ga dicari juga elu yang gaabisa kemana-mana",
  "Jadi kapan realisasiin wacana liburan itu? Makanya jangan boros bolo",
  "Susah sudah ngatur duit, ternyata diri sendiri yang gabisa diatur",
  "Kebanyakan jajan gpp, asal ada duitnya. Ada kan?",
  "Yaa Tuhan pengen kaya, pesugihan halal nyarinya dimana ya?",
  "Se-kaya kayanya orang, masih lebih kaya orang yang suka sedekah",
  "Self reward sih self reward, tapi ya maasaa tiap hari",
  "Hati orang lu jagain sepenuh hati, duitlu noh jagain",
  "Berjalan tak seperti rencana, adalah hal yang sudah biasa",
  "namanya juga usaha..hehe..hehe..hehe",
  "Lagi di fase, ga butuh semangat doang, butuh 5 M nih, cepetan",
  "Jadi mana orang yang lu pernah anggep rumah itu? Udah oper kontrak ya?"
];

export default function MeowcapPage() {
  const router = useRouter();
  const { expenses, month, incomeSources, currency, catSkin, categories } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // Kalkulasi Data
  const currentMonthExpenses = expenses.filter((e) => e.date.slice(0, 7) === month);
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomeSources.reduce((sum, src) => sum + src.amount, 0);
  const sisaGaji = totalIncome - totalSpent;
  const isHemat = sisaGaji > 0;

  // Cari kategori terboros
  const catSpent: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    catSpent[e.category] = (catSpent[e.category] || 0) + e.amount;
  });
  
  let topCategoryLabel = "Belum Ada";
  let topCategoryAmount = 0;
  
  if (Object.keys(catSpent).length > 0) {
    const topCatId = Object.keys(catSpent).reduce((a, b) => catSpent[a] > catSpent[b] ? a : b);
    topCategoryAmount = catSpent[topCatId];
    const catObj = categories.find((c) => c.id === topCatId);
    topCategoryLabel = catObj ? catObj.label : "Lainnya";
  }

  // Auto-advance slides
  useEffect(() => {
    if (currentSlide < 3 && !isCapturing) {
      const timer = setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 5000); // 5 seconds per slide
      return () => clearTimeout(timer);
    }
  }, [currentSlide, isCapturing]);

  function handleNext() {
    triggerHaptic(50);
    if (currentSlide < 3) setCurrentSlide((prev) => prev + 1);
  }

  function handlePrev() {
    triggerHaptic(50);
    if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
  }

  async function handleShare() {
    if (!slideRef.current) return;
    try {
      setIsCapturing(true);
      // Wait for React to render the capturing state
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(slideRef.current, { cacheBust: true, pixelRatio: 2 });
      
      // Coba native share kalau support (Mobile)
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'meowcap.png', { type: 'image/png' });
        await navigator.share({
          title: 'Meow-cap MyDuitku',
          text: 'Lihat kebiasaan finansialku bulan ini!',
          files: [file],
        });
      } else {
        // Fallback untuk desktop (download)
        const link = document.createElement('a');
        link.download = 'meowcap.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Gagal membuat gambar Meow-cap. Coba lagi meow!');
    } finally {
      setIsCapturing(false);
    }
  }

  const slides = [
    // Slide 1: Total Pengeluaran
    <div key="slide-1" className="h-full flex flex-col items-center justify-center text-center p-8 bg-surface-container-low">
      <h2 className="font-headline-md text-primary mb-4 animate-slideUp">Total Pengeluaran Bulan Ini</h2>
      <div className="text-4xl font-display font-bold text-on-surface mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {formatMoney(totalSpent, currency as any)}
      </div>
      <div className="animate-float" style={{ animationDelay: '0.4s' }}>
        <Cat skin={catSkin} mood={totalSpent > totalIncome ? "worried" : "happy"} size={180} />
      </div>
      <p className="mt-8 font-body-lg text-on-surface-variant max-w-xs animate-slideUp" style={{ animationDelay: '0.6s' }}>
        {totalSpent > totalIncome 
          ? "Meow! Kamu sudah melewati batas anggaranmu. Yuk lebih hemat!" 
          : "Meow! Sejauh ini pengeluaranmu masih dalam kendali."}
      </p>
    </div>,

    // Slide 2: Kategori Terboros
    <div key="slide-2" className="h-full flex flex-col items-center justify-center text-center p-8 bg-tertiary-container">
      <h2 className="font-headline-md text-on-tertiary-container mb-4 animate-slideUp">Kategori Paling Boros</h2>
      <div className="bg-surface/50 rounded-[32px] p-6 shadow-sm border border-outline/10 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-display text-3xl font-bold text-tertiary mb-2">{topCategoryLabel}</h3>
        <p className="font-label-md text-on-surface text-lg">{formatMoney(topCategoryAmount, currency as any)}</p>
      </div>
      <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
        <Cat skin={catSkin} mood="sad" size={160} />
      </div>
      <p className="mt-8 font-body-lg text-on-tertiary-container max-w-xs animate-slideUp" style={{ animationDelay: '0.6s' }}>
        Mungkin bulan depan kamu bisa mengurangi jajan di kategori ini meow? 😿
      </p>
    </div>,

    // Slide 3: Sisa Gaji & Tabungan
    <div key="slide-3" className="h-full flex flex-col items-center justify-center text-center p-8 bg-primary-container">
      <h2 className="font-headline-md text-on-primary-container mb-4 animate-slideUp">Sisa Uangmu</h2>
      <div className="text-4xl font-display font-bold text-primary mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        {formatMoney(sisaGaji, currency as any)}
      </div>
      <div className="animate-float" style={{ animationDelay: '0.4s' }}>
        <Cat skin={catSkin} mood={isHemat ? "happy" : "sad"} size={180} />
      </div>
      <p className="mt-8 font-body-lg text-on-primary-container max-w-xs animate-slideUp" style={{ animationDelay: '0.6s' }}>
        {isHemat 
          ? "Luar biasa! Kamu masih punya sisa uang. Bisa ditabung buat beli ikan! 🐟" 
          : "Yahh... uangmu sudah habis. Jangan menyerah, bulan depan pasti lebih baik! 💪"}
      </p>
    </div>,

    // Slide 4: Summary / Share Screen
    <div key="slide-4" className="h-full flex flex-col items-center justify-start text-center p-6 sm:p-8 pt-10 sm:pt-14 pb-24 sm:pb-28 bg-surface border-4 border-primary/20 relative overflow-y-auto scrollbar-hide" ref={slideRef}>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-primary rounded-tl-[32px] -mt-2 -ml-2"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-primary rounded-tr-[32px] -mt-2 -mr-2"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-primary rounded-bl-[32px] -mb-2 -ml-2"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-primary rounded-br-[32px] -mb-2 -mr-2"></div>
      
      <h1 className="font-display text-2xl font-bold text-primary mb-2">MyDuitku Meow-cap</h1>
      <p className="font-label-md text-on-surface-variant mb-4">{month}</p>
      
      <div className="w-full bg-surface-container rounded-3xl p-4 sm:p-6 mb-4 shadow-md border border-outline/10 text-left">
        <div className="mb-3 pb-3 border-b border-outline/10">
          <p className="text-xs text-on-surface-variant font-label-md">Total Pengeluaran</p>
          <p className="font-headline-sm text-error">{formatMoney(totalSpent, currency as any)}</p>
        </div>
        <div className="mb-3 pb-3 border-b border-outline/10">
          <p className="text-xs text-on-surface-variant font-label-md">Paling Boros Di</p>
          <p className="font-headline-sm text-tertiary">{topCategoryLabel}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-label-md">Berhasil Disimpan</p>
          <p className="font-headline-sm text-primary">{formatMoney(Math.max(0, sisaGaji), currency as any)}</p>
        </div>
      </div>
      
      {/* Quote Container */}
      <div className="w-full bg-secondary-container text-on-secondary-container rounded-2xl p-3 sm:p-4 mb-4 shadow-sm border border-secondary/20 relative animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <span className="absolute -top-3 left-4 text-3xl opacity-50 font-display">❝</span>
        <p className="font-body-md text-sm italic relative z-10 text-center leading-snug font-medium">"{quote}"</p>
        <span className="absolute -bottom-6 right-4 text-3xl opacity-50 font-display">❞</span>
      </div>
      
      <div className="shrink-0">
        <Cat skin={catSkin} mood="happy" size={70} />
      </div>
      
      {!isCapturing && (
        <button 
          onClick={handleShare}
          className="mt-6 mb-14 bg-primary text-on-primary px-8 py-4 rounded-full font-bold font-label-md shadow-lg flex items-center gap-2 hover:bg-surface-tint active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined">share</span>
          Bagikan ke Story
        </button>
      )}
      
      {isCapturing && (
        <p className="mt-8 text-sm font-label-md text-on-surface-variant opacity-70">
          Catat keuanganmu di MyDuitku App!
        </p>
      )}
    </div>
  ];

  return (
    <main className={`fixed inset-0 z-50 bg-inverse-surface flex justify-center items-center overflow-auto ${isCapturing ? 'capture-mode' : ''}`}>
      {/* Story Container */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[80vh] sm:rounded-[40px] overflow-hidden bg-surface shadow-2xl flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 w-full z-20 p-4 flex gap-1">
          {slides.map((_, idx) => (
            <div key={idx} className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all ease-linear"
                style={{ 
                  width: idx < currentSlide ? '100%' : idx === currentSlide ? (isCapturing ? '100%' : '100%') : '0%',
                  transitionDuration: idx === currentSlide && !isCapturing ? '5000ms' : '0ms'
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        {!isCapturing && (
          <button 
            onClick={() => router.push("/settings")}
            className="absolute top-8 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}

        {/* Story Content Area */}
        <div className="flex-1 relative">
          {slides[currentSlide]}
          
          {/* Tap Zones for Navigation */}
          {!isCapturing && currentSlide < 3 && (
            <>
              <div 
                className="absolute top-16 left-0 w-1/3 h-full z-10 cursor-pointer"
                onClick={handlePrev}
              />
              <div 
                className="absolute top-16 right-0 w-2/3 h-full z-10 cursor-pointer"
                onClick={handleNext}
              />
            </>
          )}
        </div>
        
      </div>
    </main>
  );
}
