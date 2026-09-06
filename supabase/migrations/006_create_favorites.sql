create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index if not exists favorites_listing_id_idx on public.favorites(listing_id);
alter table public.favorites enable row level security;
drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites" on public.favorites for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites" on public.favorites for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can remove own favorites" on public.favorites;
create policy "Users can remove own favorites" on public.favorites for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.favorites to authenticated;
