"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm animate-fade-in">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Clock Body */}
        <circle cx="50" cy="50" r="46" fill="#F4E3D0" stroke="#A0785D" strokeWidth="6" />
        <circle cx="50" cy="50" r="38" fill="#FFF8F0" />
        
        {/* Ticks */}
        <line x1="50" y1="14" x2="50" y2="20" stroke="#A0785D" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="86" x2="50" y2="80" stroke="#A0785D" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="50" x2="20" y2="50" stroke="#A0785D" strokeWidth="3" strokeLinecap="round" />
        <line x1="86" y1="50" x2="80" y2="50" stroke="#A0785D" strokeWidth="3" strokeLinecap="round" />

        {/* Hour Hand */}
        <line
          x1="50" y1="50" x2="50" y2="30"
          stroke="#524A47" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: "50px 50px", transform: `rotate(${hourAngle}deg)` }}
        />
        {/* Minute Hand */}
        <line
          x1="50" y1="50" x2="50" y2="22"
          stroke="#524A47" strokeWidth="4" strokeLinecap="round"
          style={{ transformOrigin: "50px 50px", transform: `rotate(${minuteAngle}deg)` }}
        />
        {/* Second Hand */}
        <line
          x1="50" y1="56" x2="50" y2="20"
          stroke="#E57373" strokeWidth="2" strokeLinecap="round"
          style={{ transformOrigin: "50px 50px", transform: `rotate(${secondAngle}deg)` }}
        />
        {/* Center Dot */}
        <circle cx="50" cy="50" r="4" fill="#524A47" />
      </svg>
    </div>
  );
}
