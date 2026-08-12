"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { triggerHaptic } from "@/lib/utils/interaction";

export default function BottomNav() {
  const pathname = usePathname();
  
  if (pathname === "/onboarding" || pathname === "/meowcap") {
    return null;
  }

  const navItems = [
    { name: "Room", path: "/", icon: "home" },
    { name: "Diary", path: "/diary", icon: "menu_book" },
    { name: "Game", path: "/play", icon: "sports_esports" },
    { name: "Statistik", path: "/analytics", icon: "pie_chart" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-20 px-container-padding">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => triggerHaptic(20)}
              className={`flex flex-col items-center justify-center gap-xs px-md py-sm rounded-lg transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary-container font-bold shadow-[0_4px_12px_rgba(130,85,0,0.2)]"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
