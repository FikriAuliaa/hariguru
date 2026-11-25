# Papan Tulis Terima Kasih Guru

Papan tulis bersama untuk Hari Guru Nasional (25 November). Pengunjung menulis ucapan untuk guru atau dosennya, dan ucapan itu tampil di papan seperti tulisan kapur. Ucapan baru dari orang lain muncul tanpa perlu refresh.

Dibuat dengan Next.js (App Router), Tailwind CSS, dan Supabase.

## 1. Siapkan Supabase

1. Buat proyek baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu jalankan. Ini membuat tabel `ucapan`, aturan RLS (boleh baca dan tulis, tidak boleh ubah atau hapus), dan mengaktifkan Realtime untuk tabel tersebut.
3. Kalau mau papan langsung berisi, jalankan juga `supabase/seed.sql`.
4. Buka **Project Settings → API**, salin **Project URL** dan kunci **anon public**.

## 2. Jalankan di komputer

```bash
cp .env.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Buka http://localhost:3000.

## 3. Deploy ke Vercel

1. Push proyek ini ke GitHub.
2. Di [vercel.com](https://vercel.com), pilih **Add New → Project** dan impor repositorinya.
3. Di **Environment Variables**, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan nilai yang sama seperti di `.env.local`.
4. Klik **Deploy**.

## Catatan

- Ucapan masuk lewat Server Action dan diperiksa dengan Zod. Database juga membatasi panjang teks dan pilihan warna.
- Tidak ada fitur hapus atau edit dari halaman. Kalau ada ucapan yang perlu dihapus, hapus langsung dari **Table Editor** di dasbor Supabase.
- Butuh Node.js 22 atau lebih baru (syarat `@supabase/supabase-js`). Vercel sudah memakai Node 22 secara default.
