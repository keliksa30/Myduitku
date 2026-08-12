"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

export async function sendCatNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const options: NotificationOptions = {
    body,
    icon: "/android-icon-192x192.png",
    badge: "/android-icon-192x192.png",
    tag: "cat-reminder",
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
  };

  // Try ServiceWorker notification first (required for Android / PWA)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch (err) {
      console.warn("SW notification failed, falling back to Notification API", err);
    }
  }

  // Fallback to standard Notification API
  try {
    new Notification(title, options);
    return true;
  } catch (err) {
    console.error("Standard Notification API failed", err);
    return false;
  }
}

export default function NotificationManager() {
  const notificationEnabled = useStore((s) => s.notificationEnabled);
  const notificationTime = useStore((s) => s.notificationTime); // format "HH:MM"
  
  // Track if we already sent it today to prevent spam
  const lastSentDate = useRef<string | null>(null);

  useEffect(() => {
    if (!notificationEnabled) return;

    // Check every 15 seconds for accurate minute trigger
    const interval = setInterval(async () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const todayStr = now.toISOString().slice(0, 10);

      if (currentTimeStr === notificationTime && lastSentDate.current !== todayStr) {
        const sent = await sendCatNotification(
          "Waktunya Kasih Makan Kucing!",
          "Meow! Jangan lupa catat pengeluaranmu hari ini ya, biar aku bisa makan enak 🐟"
        );
        if (sent) {
          lastSentDate.current = todayStr;
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [notificationEnabled, notificationTime]);

  return null;
}
