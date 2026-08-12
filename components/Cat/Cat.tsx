// Cat SVG — #korawia kawaii pixel-cat style (rounded square head, bean body, dot eyes,
// pink whiskers, thick curved tail). Fill-first with subtle outline for dark-bg visibility.
// Moods: happy / neutral / worried / sad (PRD §6.4). CSS animations, no motion lib.
"use client";

import { useState, useRef, useEffect } from "react";
import type { CatSkinId } from "./catSkins";
import { getSkin } from "./catSkins";
import { playSound, triggerHaptic } from "@/lib/utils/interaction";
import { useStore } from "@/lib/store";

import { CatBlack, CatOrange, CatTabby, CatWhite } from "./CatSvgs";

export type CatMood = "happy" | "neutral" | "worried" | "sad";

type Props = {
  skin: CatSkinId;
  mood?: CatMood;
  size?: number | string;
  onClick?: () => void;
  ariaLabel?: string;
};

export default function Cat({ skin: skinId, mood = "neutral", size = 160, onClick, ariaLabel }: Props) {
  const skin = getSkin(skinId);
  const [meow, setMeow] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const equippedHat = useStore((s) => s.equippedHat);
  const equippedGlasses = useStore((s) => s.equippedGlasses);
  const equippedNecklace = useStore((s) => s.equippedNecklace);

  const containerRef = useRef<HTMLDivElement>(null);

  // Inject accessories as SVG <image> elements directly inside the cat SVG groups.
  // This ensures they perfectly inherit ALL animations:
  //   - .cat-head-bob (idle head bobbing)
  //   - .cat-head-group via .cat-action-shake (head shake on tap)
  //   - .cat-breathe (idle body breathing)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove previously injected accessories
    container.querySelectorAll('.injected-acc').forEach(el => el.remove());

    const svg = container.querySelector('svg');
    if (!svg) return;

    // SVG viewBox: "150 250 780 780"
    // Coordinate space: x: 150..930, y: 250..1030
    //
    // Key landmarks from CatSvgs.tsx:
    //   Ear tips:     y ≈ 270
    //   Head (kepala): y ≈ 336, center x ≈ 520
    //   Eyes:          cy = 466, cx_left = 442, cx_right = 599
    //   Whiskers:      y ≈ 527
    //   Body (badan):  y ≈ 573..850, center x ≈ 527
    //   Head width:    x ≈ 298..744 (≈446 units)

    const headGroup = svg.querySelector('.cat-head-bob');
    const bodyGroup = svg.querySelector('.cat-breathe');

    const createImage = (href: string, x: number, y: number, w: number, h: number) => {
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('href', href);
      img.setAttribute('x', String(x));
      img.setAttribute('y', String(y));
      img.setAttribute('width', String(w));
      img.setAttribute('height', String(h));
      img.setAttribute('class', 'injected-acc');
      img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      return img;
    };

    // Use kepala_keseluruhan (.cat-head-group) NOT kepala (.cat-head-bob)
    // because eyes/nose/mouth are siblings of kepala inside kepala_keseluruhan.
    // Appending to kepala_keseluruhan = renders AFTER eyes = on top!
    const headOuterGroup = svg.querySelector('.cat-head-group');

    // Hat: on top of head between ears
    if (headOuterGroup && equippedHat) {
      const img = createImage(
        `/cat-accesories/${equippedHat}.svg?v=5`,
        350, 220, 340, 180
      );
      img.setAttribute('preserveAspectRatio', 'xMidYMax meet');
      headOuterGroup.appendChild(img);
    }

    // Glasses: at eye level spanning the face
    // Eyes at cy=466, enlarged to w=440
    if (headOuterGroup && equippedGlasses) {
      const img = createImage(
        `/cat-accesories/${equippedGlasses}.svg?v=5`,
        220, 395, 600, 150
      );
      headOuterGroup.appendChild(img);
    }

    // Necklace: at neck area
    // Insert BEFORE head Outer Group's first child so it renders BELOW the head (under the chin)
    if (headOuterGroup && equippedNecklace) {
      const isRibbon = equippedNecklace === "ribbon";
      const x = isRibbon ? 411 : 281;
      const y = isRibbon ? 590 : 575;
      const w = isRibbon ? 220 : 480;
      const h = isRibbon ? 186 : 255;

      const img = createImage(
        `/cat-accesories/${equippedNecklace}.svg?v=6`,
        x, y, w, h
      );
      img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      headOuterGroup.insertBefore(img, headOuterGroup.firstChild);
    }
  }, [equippedHat, equippedGlasses, equippedNecklace, skinId]);

  function handleClick() {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 7) {
        const audio = new Audio("/.easter egg/easter egg.mp3");
        audio.play().catch(() => {});
        return 0; // reset
      }
      return newCount;
    });

    setMeow(true);
    playSound("meow");
    triggerHaptic(30);
    
    // Pick random action
    const actions = ["shake", "twitch", "wag"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setAction(randomAction);

    window.setTimeout(() => {
      setMeow(false);
      setAction(null);
    }, 1500);
    onClick?.();
  }

  const SvgComponent = 
    skinId === "hitam" ? CatBlack :
    skinId === "oren" ? CatOrange :
    skinId === "putih" ? CatWhite :
    CatTabby;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }} ref={containerRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleClick(); }}
        aria-label={ariaLabel ?? `Kucing ${skin.name}, mood ${mood}`}
        className="cat-tap w-full h-full cursor-pointer bg-transparent border-0 p-0"
      >
        <div className={`w-full h-full relative cat-mood-${mood} ${action ? `cat-action-${action}` : ''}`}>
          <SvgComponent className="w-full h-full cat" />
        </div>
      </div>

      {/* Meow bubble */}
      {meow && (
        <div className="cat-meow absolute -top-4 left-1/2 -translate-x-1/2 bg-bg-surface-2 border border-border text-text-primary text-xs font-medium px-3 py-1 rounded-pill shadow-md whitespace-nowrap">
          Meow! 🐟
        </div>
      )}
    </div>
  );
}
