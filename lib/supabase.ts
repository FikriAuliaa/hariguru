import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let klien: SupabaseClient | undefined;

// Satu instance per proses: tanpa login, jadi aman dipakai bersama di server
// dan mencegah peringatan "Multiple GoTrueClient instances" di browser.
export function supabase() {
  klien ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  return klien;
}
