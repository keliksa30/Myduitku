"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/lib/store";
import useSound from "use-sound";
import Cat from "@/components/Cat/Cat";
import CatPaw from "@/components/Game/CatPaw";
import { triggerHaptic } from "@/lib/utils/interaction";
import confetti from "canvas-confetti";

type ItemType = "koin" | "petasan" | "emas";

type GameItem = {
  id: string;
  slot: number;
  type: ItemType;
  createdAt: number;
  lifetime: number;
};

type FloatingText = {
  id: string;
  text: string;
  color: string;
  slot: number;
};

export default function PlayPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<GameItem[]>([]);
  const [activePawSlot, setActivePawSlot] = useState<number | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [flashLevel, setFlashLevel] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sparks, setSparks] = useState<{id: string, x: number, y: number, slot: number}[]>([]);

  // Combo timer
  useEffect(() => {
    if (combo > 0) {
      const timer = setTimeout(() => {
        setCombo(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const isFeverMode = combo >= 50;
  
  // Cat mood based on combo
  let catMood: "happy" | "sad" | "worried" = "happy";
  if (combo >= 30) catMood = "sad";
  else if (combo >= 10) catMood = "worried";
  
  // Retro Open Source SFX (Generated)
  const bgmRef = useRef<HTMLAudioElement>(null);

  const playSound = async (params: number[]) => {
    try {
      const { zzfx } = await import("zzfx");
      zzfx(...params);
    } catch (e) {
      console.warn("AudioContext not ready", e);
    }
  };
  const playCoin = () => playSound([1, 0.1, 1000, 0.05, 0.1, 0.1, 1, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.05, 0]);
  const playMeow = () => playSound([1, 0.1, 200, 0.1, 0.5, 0.5, 4, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.8, 0.1, 0]);
  const playMiss = () => playSound([1, 0.1, 150, 0.05, 0.1, 0.1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0]);
  
  const bestScore = useStore((s) => s.gameBestScore) || 0;
  const setBestScore = useStore((s) => s.setGameBestScore);
  const catSkin = useStore((s) => s.catSkin || "default");

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setItems([]);
    setFloatingTexts([]);
    setFlashLevel(0);
    setCombo(0);
    setSparks([]);
    
    // Play BGM natively
    if (bgmRef.current) {
      bgmRef.current.play().catch((e: any) => console.log("BGM error:", e));
    }
  };

  // Stop BGM when game over or unmount
  useEffect(() => {
    if (isGameOver || !isPlaying) {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    }
  }, [isGameOver, isPlaying]);

  // Game Loop
  const speedLevel = Math.floor(score / 200);
  
  useEffect(() => {
    if (speedLevel > 0 && speedLevel > flashLevel) {
      setFlashLevel(speedLevel);
      playSound([1, 0.1, 400, 0.1, 0.4, 0.4, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0]); // Level up sound
    }
  }, [speedLevel, flashLevel]);
  
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    // Spawn interval
    const spawnTimer = setInterval(() => {
      setItems((prev) => {
        // Find empty slots (6 slots total for 3x2)
        const filledSlots = prev.map((i) => i.slot);
        const emptySlots = [0, 1, 2, 3, 4, 5].filter((s) => !filledSlots.includes(s));
        
        if (emptySlots.length === 0) return prev;

        // Randomly pick item
        let type: ItemType = "koin";
        const rand = Math.random();
        if (rand > 0.9) type = "emas";
        else if (rand > 0.7) type = "petasan";

        const spawnRateModifier = isFeverMode ? 100 : 0;
        const lifetime = type === "emas" 
          ? Math.max(300, 700 - speedLevel * 50 - spawnRateModifier) 
          : Math.max(300, 800 - speedLevel * 50 - spawnRateModifier);

        const newItem: GameItem = {
          id: Math.random().toString(36).substr(2, 9),
          slot: emptySlots[Math.floor(Math.random() * emptySlots.length)],
          type,
          createdAt: Date.now(),
          lifetime,
        };

        return [...prev, newItem];
      });
    }, Math.max(250, (isFeverMode ? 400 : 600) - speedLevel * 50)); // Spawn gets faster

    // Cleanup interval
    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      setItems((prev) => {
        return prev.map((i) => {
          if (now - i.createdAt >= i.lifetime) {
            // 30% chance for an expired coin to turn into a firecracker
            if (i.type === "koin" && Math.random() < 0.3) {
              return {
                ...i,
                type: "petasan" as ItemType,
                createdAt: now,
                lifetime: Math.max(300, 800 - speedLevel * 50 - (isFeverMode ? 100 : 0)),
              };
            }
            return null;
          }
          return i;
        }).filter(Boolean) as GameItem[];
      });
    }, 100);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(cleanupTimer);
    };
  }, [isPlaying, isGameOver, speedLevel, isFeverMode]);

  const handleTap = (slotIndex: number) => {
    if (!isPlaying || isGameOver) return;

    // Trigger paw animation
    setActivePawSlot(slotIndex);
    setTimeout(() => {
      setActivePawSlot((prev) => (prev === slotIndex ? null : prev));
    }, 350);

    // Check if hit item
    const hitItem = items.find((i) => i.slot === slotIndex);
    
    const spawnText = (text: string, color: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setFloatingTexts((prev) => [...prev, { id, text, color, slot: slotIndex }]);
      setTimeout(() => setFloatingTexts((prev) => prev.filter((t) => t.id !== id)), 800);
    };

    if (hitItem) {
      if (hitItem.type === "petasan") {
        // Hit Petasan
        setCombo(0);
        playMeow();
        triggerHaptic([100, 50, 100]); // Strong haptic
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        
        spawnText(`-1 <span class="material-symbols-outlined text-lg align-middle">heart_broken</span>`, "text-error");
        
        setLives((l) => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setIsGameOver(true);
            setIsPlaying(false);
            if (score > bestScore) {
              setBestScore(score);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
          }
          return newLives;
        });
        setItems((prev) => prev.filter((i) => i.id !== hitItem.id));
        
      } else if (hitItem.type === "koin" || hitItem.type === "emas") {
        // Score!
        const basePoints = hitItem.type === "emas" ? 50 : 10;
        const points = basePoints * (isFeverMode ? 2 : 1);
        
        playCoin();
        triggerHaptic(30); // Light haptic
        setScore((s) => s + points);
        setCombo((c) => c + 1);
        
        spawnText(`+${points}`, "text-primary");
        
        // Spawn sparks
        const sparkCount = isFeverMode ? 5 : 3;
        for (let s = 0; s < sparkCount; s++) {
          const sparkId = Math.random().toString(36).substr(2, 9);
          setSparks((prev) => [...prev, { id: sparkId, x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80 - 40, slot: slotIndex }]);
          setTimeout(() => setSparks((prev) => prev.filter((sp) => sp.id !== sparkId)), 500);
        }

        setItems((prev) => prev.filter((i) => i.id !== hitItem.id));
      }
    } else {
      // Missed empty slot penalty
      setCombo(0);
      playMiss();
      triggerHaptic(10);
      setScore((s) => Math.max(0, s - 5));
      spawnText("-5", "text-error");
    }
  };

  return (
    <main className={`flex flex-col min-h-dvh pb-24 sm:pb-28 relative overflow-hidden transition-colors duration-500 ${isFeverMode ? 'bg-amber-900/20' : 'bg-surface-container'}`}>
      {/* Header Info */}
      <div className="flex justify-between items-start px-4 pt-3 pb-1 sm:p-4 w-full max-w-[400px] mx-auto z-10 relative">
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => router.back()}
            className="text-primary font-label-lg px-3.5 py-1.5 bg-primary/10 rounded-full active:scale-95 transition-transform w-max text-xs sm:text-sm"
          >
            &larr; Kembali
          </button>
          <div className="bg-surface border border-outline/20 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-amber-500 text-xs sm:text-sm">emoji_events</span>
            <span className="font-label-lg text-xs sm:text-sm text-on-surface/70">Best: </span>
            <span className="font-title-lg font-bold text-xs sm:text-sm text-primary">{bestScore}</span>
          </div>
          {/* Lives display */}
          <div className="px-2 py-0.5 flex gap-1">
            {[1, 2, 3].map((l) => (
              <span 
                key={l} 
                className={`material-symbols-outlined text-lg sm:text-xl text-error transition-opacity ${l <= lives ? "opacity-100" : "opacity-20 grayscale"}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {combo > 0 && (
            <div className={`bg-amber-500 text-on-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md flex items-center justify-center animate-combo ${isFeverMode ? 'animate-bounce shadow-amber-500/50 shadow-lg' : ''}`}>
              <span className="font-title-lg font-bold text-sm sm:text-base">{combo}x</span>
              <span className="text-[10px] sm:text-xs ml-1 font-bold">HIT</span>
            </div>
          )}
          <div className="bg-primary text-on-primary px-4 py-1.5 sm:px-6 sm:py-2 rounded-full shadow-md flex flex-col items-center">
            <span className="font-label-lg text-[10px] sm:text-xs opacity-80">Skor</span>
            <span className="font-title-xl font-bold text-base sm:text-lg">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Board (Meja) */}
      <div className={`flex-1 w-full flex flex-col items-center justify-center px-4 relative z-0 transition-transform ${isShaking ? 'animate-shake-gentle' : ''}`}>
        {/* Flash overlay */}
        {flashLevel > 0 && <div key={`flash-${flashLevel}`} className="absolute inset-0 animate-flash pointer-events-none rounded-3xl" />}

        <div className="w-full max-w-[400px] relative mt-20 sm:mt-24">
          
          {/* Cat watching from behind (Sibling to the board to render behind it) */}
          <div className="absolute bottom-[100%] left-0 w-full flex flex-col items-center pointer-events-none -mb-[95px] sm:-mb-[110px] z-10">
            {/* Speech Bubble */}
            <div className="relative mb-1 w-max max-w-[260px] sm:max-w-[280px] bg-surface border border-outline/30 rounded-2xl p-2.5 sm:p-3 shadow-md animate-fade-in z-20 pointer-events-auto">
              <p className="font-body-md text-on-surface text-[11px] sm:text-xs font-medium leading-tight text-center">
                Cari koin sebanyak-banyaknya, hindari petasan biar ga meleduk!
              </p>
              {/* Bubble Tail */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-6 sm:border-8 border-transparent border-t-surface drop-shadow-sm" />
            </div>

            {/* Cat Image */}
            <div className={`relative z-10 opacity-95 transition-transform ${isFeverMode ? 'scale-110 drop-shadow-[0_0_15px_rgba(251,176,59,0.8)]' : ''}`}>
              <Cat mood={catMood} skin={catSkin} size={190} />
            </div>
          </div>

          {/* The Board */}
          <div className={`w-full h-[270px] sm:h-[320px] rounded-3xl p-3 sm:p-4 shadow-lg border-b-[10px] sm:border-b-[12px] relative z-20 transition-colors duration-500 ${isFeverMode ? 'bg-[#7a3b1a] border-[#4a200a]' : 'bg-[#8A5A3C] border-[#5A3822]'}`}>
            
            {/* Grid Layout */}
          <div className="grid grid-cols-3 grid-rows-2 w-full h-full gap-3 sm:gap-4 relative">
            {[0, 1, 2, 3, 4, 5].map((slot) => {
              const item = items.find((i) => i.slot === slot);

              return (
                <div 
                  key={slot} 
                  className="bg-black/10 rounded-2xl relative cursor-pointer active:bg-black/20 flex items-center justify-center"
                  onPointerDown={(e) => {
                    e.preventDefault(); // Prevent double firing on touch
                    handleTap(slot);
                  }}
                >
                  {/* Item Image */}
                  {item && (
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 animate-fade-in relative ${item.type === 'emas' ? 'drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] scale-110' : 'drop-shadow-md'}`}>
                      <Image 
                        src={item.type === 'emas' ? `/games/koin.svg` : `/games/${item.type}.svg`} 
                        alt={item.type}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 4rem, 5rem"
                        unoptimized
                      />
                    </div>
                  )}
                  {/* Floating Text Overlay */}
                  {floatingTexts.filter((t) => t.slot === slot).map((t) => (
                    <div 
                      key={t.id} 
                      className={`absolute z-20 font-black text-2xl animate-float-up pointer-events-none drop-shadow-md flex items-center gap-1 ${t.color}`}
                      dangerouslySetInnerHTML={{ __html: t.text }}
                    />
                  ))}
                  
                  {/* Sparks */}
                  {sparks.filter((s) => s.slot === slot).map((s) => (
                    <div key={s.id} className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                      <div 
                        className="w-3 h-3 bg-amber-300 rounded-full animate-spark shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                        style={{ '--tx': `${s.x}px`, '--ty': `${s.y}px` } as React.CSSProperties} 
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Giant Paw Overlay */}
          {activePawSlot !== null && (
            <div 
              className="absolute pointer-events-none z-50 animate-paw-strike-huge"
              style={{
                width: "250px",
                left: `calc(${((activePawSlot % 3) * 33.33) + 16.66}% - 125px)`, 
                bottom: "-1200px", 
                "--reach-y": Math.floor(activePawSlot / 3) === 0 ? "-300px" : "-160px",
              } as React.CSSProperties}
            >
              <CatPaw className="w-full h-auto drop-shadow-2xl" />
            </div>
          )}
          
        </div>
      </div>
    </div>

      {/* Start / Game Over Overlay */}
      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
          <div className="bg-surface-container border border-outline/20 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center w-full max-w-sm min-w-[280px]">
            {isGameOver ? (
              <div className="flex flex-col items-center relative mb-4">
                <Cat size={180} mood="sad" skin={catSkin} />
              </div>
            ) : (
              <span className="material-symbols-outlined text-5xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                pets
              </span>
            )}
            <h2 className="font-display-lg text-primary mb-2">
              {isGameOver ? "Game Over!" : "Mew-Whack!"}
            </h2>
            <p className="font-body-lg text-on-surface-variant mb-6">
              {isGameOver ? `Kamu mengumpulkan ${score} poin.` : "Tangkap koinnya pakai kaki kucing. Awas jangan sentuh petasan!"}
            </p>
            
            <button 
              onClick={startGame} 
              className="mt-6 w-full max-w-sm px-6 py-4 bg-primary text-on-primary rounded-full font-label-lg font-bold shadow-[0_6px_0_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] transition-all mx-auto animate-pulse-gentle flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">{isGameOver ? 'refresh' : 'play_arrow'}</span>
              {isGameOver ? 'Main Lagi' : 'Mulai Game'}
            </button>
          </div>
        </div>
      )}

      {/* Audio Element for BGM */}
      <audio ref={bgmRef} src="/sfx/bgm.mp3" loop preload="auto" />
    </main>
  );
}
