"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { WARNA, type Ucapan } from "@/lib/ucapan";

const skema = z.object({
  nama_guru: z
    .string()
    .trim()
    .min(1, "Nama gurunya belum diisi.")
    .max(60, "Nama guru paling panjang 60 huruf."),
  pesan: z
    .string()
    .trim()
    .min(5, "Pesannya minimal 5 huruf.")
    .max(280, "Pesannya paling panjang 280 huruf."),
  pengirim: z
    .string()
    .trim()
    .max(40, "Namamu paling panjang 40 huruf.")
    .transform((v) => v || null),
  warna: z.enum(WARNA, "Pilih warna kapur dulu."),
});

type Hasil = { ok: true; ucapan: Ucapan } | { ok: false; galat: string };

export async function kirimUcapan(input: unknown): Promise<Hasil> {
  const cek = skema.safeParse(input);
  if (!cek.success) return { ok: false, galat: cek.error.issues[0].message };

  const { data, error } = await supabase()
    .from("ucapan")
    .insert(cek.data)
    .select()
    .single<Ucapan>();

  if (error) return { ok: false, galat: "Ucapanmu belum terkirim. Coba lagi sebentar." };
  return { ok: true, ucapan: data };
}
