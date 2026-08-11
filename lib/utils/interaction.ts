// Removed top-level import to prevent SSR crashes

export function triggerHaptic(pattern: number | number[] = 50) {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(pattern);
    } catch (e) {
      // Ignore
    }
  }
}

export function playSound(effectName: string) {
  if (typeof window !== "undefined") {
    try {
      const { zzfx } = require('zzfx');
      
      if (effectName === "coin") {
        // A subtle coin/cha-ching sound
        zzfx(...[,,1675,,.06,.24,1,1.82,,,837,.06]);
      } else if (effectName === "click") {
        // A subtle paper/click sound
        zzfx(...[,,129,.01,,.15,,,,,,,,5]);
      } else if (effectName === "levelUp") {
        // Level up sound
        zzfx(...[,,400,.1,.4,.4,1,1.5,,,.1,.1,.1,.1]);
      } else {
        const audio = new Audio(`/sfx/${effectName}.mp3`);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }
}
