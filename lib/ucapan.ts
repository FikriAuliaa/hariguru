export const WARNA = ["putih", "kuning", "merah_muda", "biru_muda"] as const;

export type Warna = (typeof WARNA)[number];

export type Ucapan = {
  id: string;
  created_at: string;
  nama_guru: string;
  pesan: string;
  pengirim: string | null;
  warna: Warna;
};

export const WARNA_KAPUR: Record<Warna, { nama: string; hex: string }> = {
  putih: { nama: "Putih", hex: "#ecebe4" },
  kuning: { nama: "Kuning", hex: "#efd98a" },
  merah_muda: { nama: "Merah muda", hex: "#eeb4c2" },
  biru_muda: { nama: "Biru muda", hex: "#a8cfe2" },
};

export const PER_HALAMAN = 30;
