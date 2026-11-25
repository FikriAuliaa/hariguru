"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { PER_HALAMAN, WARNA, WARNA_KAPUR, type Ucapan, type Warna } from "@/lib/ucapan";
import { kirimUcapan } from "./actions";

type Props = { awal: Ucapan[]; gagalMuat: boolean; tanggal: string };

export default function Papan({ awal, gagalMuat, tanggal }: Props) {
  const [daftar, setDaftar] = useState(awal);
  const [baru, setBaru] = useState<ReadonlySet<string>>(new Set());
  const [adaLagi, setAdaLagi] = useState(awal.length === PER_HALAMAN);
  const [memuat, setMemuat] = useState(false);
  const [galatMuat, setGalatMuat] = useState(gagalMuat ? "Papan belum bisa dimuat. Coba muat ulang halaman." : "");
  const [warna, setWarna] = useState<Warna>("putih");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const papanRef = useRef<HTMLDivElement>(null);

  function tambah(u: Ucapan) {
    setDaftar((d) => (d.some((x) => x.id === u.id) ? d : [u, ...d]));
    setBaru((s) => new Set(s).add(u.id));
  }

  useEffect(() => {
    const kanal = supabase()
      .channel("ucapan-baru")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ucapan" }, (payload) =>
        tambah(payload.new as Ucapan),
      )
      .subscribe();
    return () => {
      supabase().removeChannel(kanal);
    };
  }, []);

  async function muatLagi() {
    const terakhir = daftar[daftar.length - 1];
    setMemuat(true);
    const { data, error } = await supabase()
      .from("ucapan")
      .select("*")
      .order("created_at", { ascending: false })
      .lt("created_at", terakhir.created_at)
      .limit(PER_HALAMAN)
      .returns<Ucapan[]>();
    setMemuat(false);
    if (error) {
      setGalatMuat("Gagal memuat tulisan lama. Coba lagi.");
      return;
    }
    setGalatMuat("");
    setDaftar((d) => [...d, ...data.filter((u) => !d.some((x) => x.id === u.id))]);
    setAdaLagi(data.length === PER_HALAMAN);
  }

  function ambilKapur(w: Warna) {
    setWarna(w);
    dialogRef.current?.showModal();
  }

  return (
    <main className="tembok flex h-dvh flex-col">
      <FilterKapur />

      <div className="flex min-h-0 flex-1 flex-col sm:px-[4vw] sm:pt-[3vh] lg:px-[7vw]">
        <div className="kayu flex min-h-0 flex-1 flex-col p-2 sm:p-4">
          <div className="papan relative min-h-0 flex-1 overflow-hidden">
            <BekasHapusan />
            <div ref={papanRef} className="relative h-full overflow-y-auto px-5 pt-5 pb-10 sm:px-10 sm:pt-8">
              <header className="kapur mb-10 flex flex-col-reverse gap-3 text-[#ecebe4] sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-4xl sm:text-5xl">Terima kasih, Guru.</h1>
                  <Garis className="-mt-1 w-56 sm:w-72" />
                  <p className="mt-3 max-w-md text-xl leading-snug">
                    Tulis ucapanmu buat guru yang paling kamu ingat.
                  </p>
                </div>
                <p className="self-end text-lg sm:self-auto sm:text-xl">{tanggal}</p>
              </header>

              {daftar.length === 0 && !galatMuat && (
                <p className="kapur text-2xl text-[#ecebe4]">
                  Papannya masih bersih. Ambil kapur di bawah, jadi yang pertama nulis.
                </p>
              )}

              <ul className="gap-12 sm:columns-2 xl:columns-3">
                {daftar.map((u) => (
                  <Tulisan key={u.id} u={u} animasi={baru.has(u.id)} />
                ))}
              </ul>

              {galatMuat && <p className="kapur mt-6 text-xl text-[#efd98a]">{galatMuat}</p>}

              {adaLagi && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={muatLagi}
                    disabled={memuat}
                    className="min-h-11 border border-dashed border-[#ecebe4]/50 px-5 text-sm text-[#ecebe4]/90 hover:border-[#ecebe4] disabled:opacity-60"
                  >
                    {memuat ? "Memuat…" : "Muat lagi"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tatakan onAmbil={ambilKapur} />
      </div>

      <div aria-hidden className="hidden h-[7vh] min-h-8 border-t-[6px] border-[#55614a] bg-lis sm:block" />

      <FormUcapan
        dialogRef={dialogRef}
        warna={warna}
        setWarna={setWarna}
        onTerkirim={(u) => {
          tambah(u);
          papanRef.current?.scrollTo({ top: 0 });
        }}
      />
    </main>
  );
}

function acak(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function Tulisan({ u, animasi }: { u: Ucapan; animasi: boolean }) {
  // Turunan dari id supaya posisi sama di server dan browser (tanpa hydration mismatch).
  const h = acak(u.id);
  const putar = (h % 401) / 100 - 2;
  const skala = 0.92 + ((h >>> 9) % 19) / 100;
  const coretan = (h >>> 14) % 4;
  const geser = ((h >>> 18) % 4) * 0.5;

  const judul = `Untuk ${u.nama_guru},`;
  const pengirim = `— ${u.pengirim || "Seorang murid"}`;
  const total = judul.length + u.pesan.length + pengirim.length;
  const jeda = Math.min(45, 3500 / total);

  return (
    <li
      className="kapur mb-12 break-inside-avoid [overflow-wrap:anywhere]"
      style={{ rotate: `${putar}deg`, fontSize: `${skala}rem`, paddingLeft: `${geser}rem`, color: WARNA_KAPUR[u.warna].hex }}
    >
      <p className="text-[1.6em] leading-tight">
        <Huruf teks={judul} mulai={0} jeda={jeda} animasi={animasi} />
        {coretan === 2 && <Bintang className="ml-2 inline-block h-[0.8em] w-[0.8em] align-baseline" />}
      </p>
      {coretan === 1 && <Garis className="w-40" />}
      <p className="mt-1 text-[1.3em] leading-snug whitespace-pre-line">
        <Huruf teks={u.pesan} mulai={judul.length} jeda={jeda} animasi={animasi} />
      </p>
      <p className="mt-2 pr-4 text-right text-[1.15em] opacity-85">
        <Huruf teks={pengirim} mulai={judul.length + u.pesan.length} jeda={jeda} animasi={animasi} />
      </p>
    </li>
  );
}

function Huruf({ teks, mulai, jeda, animasi }: { teks: string; mulai: number; jeda: number; animasi: boolean }) {
  if (!animasi) return teks;
  return (
    <>
      <span className="sr-only">{teks}</span>
      <span aria-hidden>
        {Array.from(teks).map((c, i) => (
          <span key={i} className="huruf" style={{ animationDelay: `${Math.round((mulai + i) * jeda)}ms` }}>
            {c}
          </span>
        ))}
      </span>
    </>
  );
}

function Garis({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 14" className={`h-3 ${className}`} fill="none">
      <path
        d="M3 9 C 40 5, 70 11, 110 7 S 170 4, 197 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        style={{ filter: "url(#kapur)" }}
      />
    </svg>
  );
}

function Bintang({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2.5 L14.6 9.3 L21.6 9.6 L16 14 L18 21 L12 17 L6.2 21.2 L8.1 14.1 L2.6 9.8 L9.5 9.2 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterKapur() {
  return (
    <svg aria-hidden className="absolute h-0 w-0">
      <filter id="kapur" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.55"
          result="butir"
        />
        <feComposite in="SourceGraphic" in2="butir" operator="in" result="tergerus" />
        <feDisplacementMap in="tergerus" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

function BekasHapusan() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <filter id="hapus">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <g fill="none" stroke="#dfe8df" strokeLinecap="round" filter="url(#hapus)" opacity="0.06">
        <path d="M80 150 C 260 95, 420 210, 620 135" strokeWidth="70" />
        <path d="M510 430 C 650 365, 800 480, 950 405" strokeWidth="95" />
        <path d="M110 480 C 220 440, 300 530, 430 485" strokeWidth="50" />
        <path d="M700 95 q 90 45 220 8" strokeWidth="40" />
        <path d="M300 300 C 380 270, 470 330, 560 290" strokeWidth="35" />
      </g>
    </svg>
  );
}

function Tatakan({ onAmbil }: { onAmbil: (w: Warna) => void }) {
  const kecil = WARNA.filter((w) => w !== "putih");
  return (
    <div className="kayu flex items-center justify-end gap-1 border-t-4 border-[#8d6038] px-3 py-1 sm:-mx-3 sm:px-8">
      <span className="mr-auto hidden text-sm text-[#f1e6d4]/80 sm:block">Ambil kapur, lalu tulis.</span>
      {kecil.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onAmbil(w)}
          aria-label={`Tulis dengan kapur ${WARNA_KAPUR[w].nama.toLowerCase()}`}
          title={`Kapur ${WARNA_KAPUR[w].nama.toLowerCase()}`}
          className="group flex h-12 w-14 items-center justify-center"
        >
          <span
            className="block h-3.5 w-11 rounded-[3px] border-r-4 border-black/10 transition-transform group-hover:-translate-y-0.5"
            style={{ backgroundColor: WARNA_KAPUR[w].hex }}
          />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onAmbil("putih")}
        className="group ml-2 flex h-12 items-center"
      >
        <span className="flex h-8 items-center rounded-[4px] border-r-[6px] border-black/10 bg-[#ecebe4] px-5 text-sm font-medium text-[#3a3a32] transition-transform group-hover:-translate-y-0.5">
          Tulis ucapan
        </span>
      </button>
    </div>
  );
}

type FormProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  warna: Warna;
  setWarna: (w: Warna) => void;
  onTerkirim: (u: Ucapan) => void;
};

function FormUcapan({ dialogRef, warna, setWarna, onTerkirim }: FormProps) {
  const [namaGuru, setNamaGuru] = useState("");
  const [pesan, setPesan] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [galat, setGalat] = useState("");
  const [mengirim, setMengirim] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMengirim(true);
    setGalat("");
    const hasil = await kirimUcapan({ nama_guru: namaGuru, pesan, pengirim, warna });
    setMengirim(false);
    if (!hasil.ok) {
      setGalat(hasil.galat);
      return;
    }
    setNamaGuru("");
    setPesan("");
    setPengirim("");
    dialogRef.current?.close();
    onTerkirim(hasil.ucapan);
  }

  const input =
    "mt-1 block w-full border-0 border-b border-[#8a8572] bg-transparent px-0 py-1.5 text-base outline-none focus:border-b-2 focus:border-papan";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="judul-form"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="buku m-auto w-[min(34rem,calc(100%-1.5rem))] border border-[#d6d0bb] p-0 text-[#2b2b24]"
    >
      <form onSubmit={kirim} className="py-6 pr-6 pl-14">
        <h2 id="judul-form" className="text-lg font-semibold">
          Tulis di papan
        </h2>
        <p className="mt-1 text-sm text-[#5f5b4c]">Nggak perlu panjang. Tulis yang kamu ingat.</p>

        <label className="mt-5 block text-sm font-medium">
          Untuk guru
          <input
            autoFocus
            required
            maxLength={60}
            value={namaGuru}
            onChange={(e) => setNamaGuru(e.target.value)}
            placeholder="Bu Ratna, guru Matematika"
            className={input}
          />
        </label>

        <label className="mt-5 block text-sm font-medium">
          Pesan
          <textarea
            required
            minLength={5}
            maxLength={280}
            rows={4}
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className={`${input} resize-none`}
          />
        </label>
        <p className={`mt-1 text-right text-xs ${pesan.length > 260 ? "text-[#a33a2a]" : "text-[#6c6858]"}`}>
          {pesan.length}/280
        </p>

        <label className="mt-3 block text-sm font-medium">
          Namamu <span className="font-normal text-[#6c6858]">(boleh dikosongkan)</span>
          <input
            maxLength={40}
            value={pengirim}
            onChange={(e) => setPengirim(e.target.value)}
            placeholder="Seorang murid"
            className={input}
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Warna kapur</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {WARNA.map((w) => (
              <label key={w} className="cursor-pointer text-center text-xs">
                <input
                  type="radio"
                  name="warna"
                  value={w}
                  checked={warna === w}
                  onChange={() => setWarna(w)}
                  className="peer sr-only"
                />
                <span
                  className="kapur flex h-11 items-center justify-center bg-papan text-2xl outline-offset-2 peer-checked:outline-2 peer-checked:outline-[#2b2b24] peer-focus-visible:outline-2 peer-focus-visible:outline-dashed"
                  style={{ color: WARNA_KAPUR[w].hex }}
                >
                  Aa
                </span>
                <span className="mt-1 block">{WARNA_KAPUR[w].nama}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {galat && (
          <p role="alert" className="mt-4 text-sm text-[#a33a2a]">
            {galat}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="min-h-11 px-4 text-sm text-[#4a473b] underline-offset-4 hover:underline"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={mengirim}
            className="min-h-11 bg-papan px-5 text-sm font-medium text-[#ecebe4] hover:bg-[#25402f] disabled:opacity-60"
          >
            {mengirim ? "Menulis…" : "Tulis di papan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
