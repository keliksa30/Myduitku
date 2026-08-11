"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

export default function NotificationManager() {
  const notificationEnabled = useStore((s) => s.notificationEnabled);
  const notificationTime = useStore((s) => s.notificationTime); // format "HH:MM"
  
  // Track if we already sent it today to prevent spam
  const lastSentDate = useRef<string | null>(null);

  useEffect(() => {
    if (!notificationEnabled) return;

    // Cek setiap 30 detik
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const todayStr = now.toISOString().slice(0, 10);

      // Jika waktunya sama dan belum pernah dikirim hari ini
      if (currentTimeStr === notificationTime && lastSentDate.current !== todayStr) {
        if ("Notification" in window && Notification.permission === "granted") {
          
          try {
            // Coba panggil service worker registration kalau ada (PWA)
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification("Waktunya Kasih Makan Kucing!", {
                body: "Meow! Jangan lupa catat pengeluaranmu hari ini ya, biar aku bisa makan enak 🐟",
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-192x192.png",
                vibrate: [200, 100, 200, 100, 200, 100, 200]
              } as any);
            });
          } catch (e) {
            // Fallback ke normal notification API jika bukan PWA / SW tidak aktif
            new Notification("Waktunya Kasih Makan Kucing!", {
              body: "Meow! Jangan lupa catat pengeluaranmu hari ini ya, biar aku bisa makan enak 🐟",
              icon: "/icons/icon-192x192.png",
            });
          }
          
          // Tandai sudah terkirim hari ini
          lastSentDate.current = todayStr;
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [notificationEnabled, notificationTime]);

  return null;
}
