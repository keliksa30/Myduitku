# MyDuitKu Project Status (Snapshot: 2026-08-04)

## Project Overview
- **Nama Proyek:** MyDuitKu
- **Deskripsi:** Aplikasi keuangan pribadi web-based, client-side, dengan kucing virtual companion. Aesthetic "Cyber-Retro Game".
- **Direktori:** `/Users/rano/Documents/myduitku`
- **Tujuan Utama:** MVP (Minimum Viable Product) sesuai `plan-mvp.md`.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS v4 (dengan inline `@theme` di `globals.css`)
- **State Management:** Zustand (dengan `persist` ke `localStorage`)
- **Testing:** `node:test` (native Node.js test runner)
- **Deployment Target:** Cloudflare Pages (static export)

## Fitur yang Sudah Diimplementasikan
1.  **Project Bootstrap:**
    *   Inisialisasi proyek Next.js dengan TypeScript, Tailwind CSS, App Router.
    *   Setup `npm install` dengan `.npmrc` untuk `allow-scripts=true`.
    *   Build proyek berhasil.
2.  **Design Tokens & Styling:**
    *   Integrasi Tailwind CSS v4 dengan custom design tokens di `app/globals.css`.
    *   Custom font (Plus Jakarta Sans, Inter).
    *   Palet warna utama (dark mode default) dan elemen UI dasar.
3.  **Core Logic (lib/):**
    *   `lib/currency.ts`: Fungsi `formatMoney` untuk berbagai mata uang (default IDR), mendukung Intl.NumberFormat. `parseMoney` dihapus (YAGNI).
    *   `lib/budget.ts`: Fungsi kalkulasi budget (`totalSpent`, `remaining`, `deriveMood`, dll).
    *   `lib/types.ts`: Definisi type untuk `Expense`, `Category`, `AppState`.
    *   `lib/defaults.ts`: Definisi kategori default.
    *   Unit tests menggunakan `node:test` untuk `currency.ts` dan `budget.ts` (26 tests pass).
4.  **State Management (Zustand):**
    *   `lib/store.ts`: Zustand store dengan middleware `persist` (key `myduitku.v1.state`) untuk `localStorage`.
    *   `lib/storage.ts`: Adapter storage untuk `persist`.
    *   Tests untuk store (8 tests pass).
5.  **Kucing Virtual (components/Cat/):**
    *   `components/Cat/Cat.tsx`: Komponen SVG kucing interaktif.
    *   Gaya visual diperbarui ke aesthetic "pixel-chibi #korawia" (fill-only, subtle outline, rounded-square head, bean body, dot eyes, pink whiskers/blush).
    *   4 skin kucing (`hitam`, `tabby`, `oren`, `putih`) dengan palet warna dan detail unik.
    *   4 mood kucing (`happy`, `neutral`, `worried`, `sad`) dengan animasi CSS-only (telinga, mata, ekor, meow bubble, blink, sway, bounce).
    *   `components/Cat/catSkins.ts`: Data skin kucing.
6.  **Onboarding:**
    *   `app/onboarding/page.tsx`: Halaman onboarding untuk memilih skin kucing dan mata uang.
    *   `components/Cat/CatPicker.tsx`: Komponen selektor skin kucing (digunakan di onboarding dan mungkin settings).
7.  **Hydration Mismatch Fix:**
    *   `lib/hooks/useMounted.ts`: Custom hook untuk mencegah hydration mismatch saat menggunakan Zustand `persist` dengan Next.js App Router (karena `localStorage` tidak tersedia di server).
    *   Komponen-komponen yang bergantung pada store (`app/page.tsx`, `GajiInput.tsx`, `BudgetSummary.tsx`, `ExpenseForm.tsx`, `ExpenseList.tsx`, `CategoryManager.tsx`) menggunakan `useMounted` untuk menunggu hydration selesai sebelum render konten yang bergantung pada state.
8.  **Fitur Utama Aplikasi:**
    *   `components/Budget/GajiInput.tsx`: Input gaji bulanan user.
    *   `components/Budget/BudgetSummary.tsx`: Menampilkan total gaji, sisa, dan terpakai.
    *   `components/Budget/ExpenseForm.tsx`: Form untuk menambah pengeluaran (jumlah, kategori, keterangan, tanggal).
    *   `components/Budget/ExpenseList.tsx`: Menampilkan daftar pengeluaran, dengan tombol hapus.
    *   `components/Budget/CategoryManager.tsx`: User dapat menambah, mengedit label/icon/limit, dan menghapus kategori kustom.
9.  **Navigasi:**
    *   `app/page.tsx`: Handle redirect otomatis ke `/onboarding` jika `onboarded` bernilai `false` di store.

## Cara Menjalankan Proyek
1.  **Pastikan di direktori proyek:** `cd /Users/rano/Documents/myduitku`
2.  **Install dependencies:** `npm install`
3.  **Jalankan development server:** `npm run dev` (aplikasi akan tersedia di `http://localhost:3000`)
4.  **Jalankan type check:** `npm run typecheck`
5.  **Jalankan build:** `npm run build`
6.  **Jalankan tests:** `npm run test`

## Hal yang Perlu Diperhatikan (Known Issues / Next Steps)
-   **UI Refinement:** Desain lebih lanjut untuk detail UI dan responsivitas.
-   **Cloudflare Pages Deployment:** Siapkan dan lakukan deployment final.
-   **Settings Page:** Untuk mengubah skin kucing, mata uang, atau reset data.
-   **Mood Logic:** `deriveMood` di `lib/budget.ts` sudah ada, perlu diintegrasikan ke tampilan kucing di `app/page.tsx` atau `components/Cat/Cat.tsx` (saat ini mood di `page.tsx` masih hardcoded untuk preview).
-   **Peringatan Turbopack:** `Warning: Next.js ignored package-lock.json in /Users/rano because it would include your home directory (/Users/rano). To use this directory, set `turbopack.root` in your Next.js config.` (ini karena `pnpm` atau setup global di user home, bisa diabaikan untuk local dev atau tambahkan `turbopack.root` ke `next.config.ts` jika ingin menggunakannya dengan Turbopack).

Ini harusnya cukup untuk melanjutkan nanti.
