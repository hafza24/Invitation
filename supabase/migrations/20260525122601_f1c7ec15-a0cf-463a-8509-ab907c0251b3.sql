create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  wish_type text not null default 'wish',
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

-- Anyone (anonymous guests) can submit a wish
create policy "Anyone can submit a wish"
  on public.wishes for insert
  to anon, authenticated
  with check (true);

-- No public select: messages are private. Admin reads via server function (service role).
