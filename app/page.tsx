import { supabase } from "@/lib/supabase";
import { PER_HALAMAN, type Ucapan } from "@/lib/ucapan";
import Papan from "./papan";

export const dynamic = "force-dynamic";

export default async function Halaman() {
  const { data, error } = await supabase()
    .from("ucapan")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PER_HALAMAN)
    .returns<Ucapan[]>();

  const tanggal = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return <Papan awal={data ?? []} gagalMuat={Boolean(error)} tanggal={tanggal} />;
}
