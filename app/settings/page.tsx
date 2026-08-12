"use client";

import { useMounted } from "@/lib/hooks/useMounted";
import { useStore } from "@/lib/store";
import IncomeSourcesManager from "@/components/Budget/IncomeSourcesManager";
import CatPicker from "@/components/Cat/CatPicker";
import { useRouter } from "next/navigation";
import { sendCatNotification } from "@/components/NotificationManager";
import { toast } from "sonner";

export default function SettingsPage() {
  const mounted = useMounted();
  const setCatSkin = useStore((s) => s.setCatSkin);
  const catSkin = useStore((s) => s.catSkin);
  const userName = useStore((s) => s.userName);
  const setUserName = useStore((s) => s.setUserName);
  
  const notificationEnabled = useStore((s) => s.notificationEnabled);
  const setNotificationEnabled = useStore((s) => s.setNotificationEnabled);
  const notificationTime = useStore((s) => s.notificationTime);
  const setNotificationTime = useStore((s) => s.setNotificationTime);

  const router = useRouter();

  async function handleToggleNotification(e: React.ChangeEvent<HTMLInputElement>) {
    const enabled = e.target.checked;
    if (enabled) {
      if (!("Notification" in window)) {
        toast.error("Browser Anda tidak mendukung notifikasi.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationEnabled(true);
        toast.success("Notifikasi pengingat harian aktif!");
        sendCatNotification(
          "Pengingat Aktif! 🐾",
          "Meow! Notifikasi pengingat harian berhasil diaktifkan."
        );
      } else {
        toast.error("Izin notifikasi ditolak. Silakan izinkan melalui pengaturan browser.");
        setNotificationEnabled(false);
      }
    } else {
      setNotificationEnabled(false);
      toast.info("Notifikasi dinonaktifkan.");
    }
  }

  async function handleTestNotification() {
    if (!("Notification" in window)) {
      toast.error("Browser Anda tidak mendukung notifikasi.");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Izin notifikasi belum diberikan di browser.");
        return;
      }
    }

    const sent = await sendCatNotification(
      "Tes Notifikasi MyDuitku 🐾",
      "Meow! Notifikasi berfungsi dengan baik! Jangan lupa catat keuanganmu hari ini 🐟"
    );

    if (sent) {
      toast.success("Notifikasi tes terkirim!");
    } else {
      toast.error("Gagal mengirim notifikasi tes. Cek izin browser.");
    }
  }

  if (!mounted) return null;

  return (
    <main className="relative w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="flex flex-col w-full h-full p-container-padding max-w-[480px] mx-auto gap-6">
        <h1 className="font-headline-md text-primary text-center mb-2">Pengaturan & Toko</h1>
        
        {/* Profile Section */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline/10 flex flex-col gap-3">
          <h2 className="font-headline-sm text-on-surface">Profil Pengguna</h2>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-name" className="font-label-md text-on-surface-variant">Nama Panggilan</label>
            <input 
              id="user-name"
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              placeholder="Masukkan nama panggilanmu"
              maxLength={15}
              className="bg-surface-container border border-outline/20 rounded-lg px-4 py-3 text-on-surface w-full font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <IncomeSourcesManager />
        
        <CatPicker initial={catSkin} onSelect={setCatSkin} />
        
        {/* Export Section */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline/10 flex flex-col gap-3">
          <h2 className="font-headline-sm text-on-surface">Ekspor Data</h2>
          <p className="font-body-md text-sm text-on-surface-variant">Unduh laporan pengeluaran bulan ini.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                import("@/lib/export").then((m) => {
                  const state = useStore.getState();
                  m.exportToCSV(state.expenses, state.categories, state.currency, state.month);
                });
              }}
              className="flex-1 bg-surface-container border border-outline/20 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Unduh CSV
            </button>
            <button
              onClick={() => {
                import("@/lib/export").then((m) => {
                  const state = useStore.getState();
                  m.exportToPDF(state.expenses, state.categories, state.currency, state.month);
                });
              }}
              className="flex-1 bg-surface-container border border-outline/20 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Unduh PDF
            </button>
          </div>
        </div>
        
        {/* Meow-cap Section */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline/10 flex flex-col gap-3">
          <h2 className="font-headline-sm text-on-surface">Meow-cap Bulanan</h2>
          <p className="font-body-md text-sm text-on-surface-variant">Liat rekapan pengeluaranmu sampe saat ini.</p>
          <button
            onClick={() => router.push("/meowcap")}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md font-bold shadow-sm hover:bg-surface-tint transition-colors mt-2"
          >
            Buka Meow-cap
          </button>
        </div>

        {/* Notification Section */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline/10 flex flex-col gap-3">
          <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">notifications_active</span>
            Pengingat Harian
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant">Dapatkan notifikasi harian agar tidak lupa mencatat pengeluaran.</p>
          
          <div className="flex items-center justify-between mt-2">
            <label htmlFor="notif-toggle" className="font-label-md text-on-surface">Aktifkan Pengingat</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                id="notif-toggle" 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationEnabled}
                onChange={handleToggleNotification}
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {notificationEnabled && (
            <div className="flex flex-col gap-3 mt-2 animate-slideUp">
              <div className="flex flex-col gap-1">
                <label htmlFor="notif-time" className="font-label-md text-on-surface-variant">Jam Pengingat</label>
                <input 
                  id="notif-time"
                  type="time" 
                  value={notificationTime} 
                  onChange={(e) => setNotificationTime(e.target.value)} 
                  className="bg-surface-container border border-outline/20 rounded-lg px-4 py-3 text-on-surface w-full font-body-md focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full bg-primary/10 border border-primary/20 text-primary py-2.5 rounded-xl font-label-md font-bold text-xs hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                Uji Coba Notifikasi Sekarang 🐾
              </button>
            </div>
          )}

          <div className="mt-3 bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-3 text-xs text-on-tertiary-container font-medium">
            <p className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
              <span>
                <strong>TUTORIAL:</strong> Agar notifikasi bisa muncul meskipun aplikasi ditutup, pastikan Anda menekan <strong>"Add to Home Screen / Tambahkan ke Layar Utama"</strong> pada browser Anda dan menginstal MyDuitku. Jika tidak, biarkan tab browser ini tetap terbuka di latar belakang.
              </span>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}


