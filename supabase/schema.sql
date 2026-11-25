create table if not exists public.ucapan (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nama_guru text not null check (char_length(btrim(nama_guru)) between 1 and 60),
  pesan text not null check (char_length(btrim(pesan)) between 5 and 280),
  pengirim text check (pengirim is null or char_length(btrim(pengirim)) between 1 and 40),
  warna text not null default 'putih'
    check (warna in ('putih', 'kuning', 'merah_muda', 'biru_muda'))
);

create index if not exists ucapan_created_at_idx on public.ucapan (created_at desc);

alter table public.ucapan enable row level security;

drop policy if exists "Siapa saja boleh membaca" on public.ucapan;
create policy "Siapa saja boleh membaca"
  on public.ucapan for select
  to anon, authenticated
  using (true);

drop policy if exists "Siapa saja boleh menulis" on public.ucapan;
create policy "Siapa saja boleh menulis"
  on public.ucapan for insert
  to anon, authenticated
  with check (true);

-- Tidak ada policy update/delete, jadi RLS menolak keduanya.
-- Hak tabelnya juga dicabut supaya penolakan tidak hanya bergantung pada RLS.
revoke update, delete, truncate on public.ucapan from anon, authenticated;
grant select, insert on public.ucapan to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ucapan'
  ) then
    alter publication supabase_realtime add table public.ucapan;
  end if;
end $$;
