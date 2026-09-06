-- ViraVeste: anuncios de preco fixo e leilao.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 1000),
  category text not null,
  other_category text,
  brand text check (brand is null or char_length(brand) <= 100),
  size text check (size is null or char_length(size) <= 30),
  item_condition text not null check (item_condition in ('Novo com etiqueta','Como novo','Excelente','Muito bom','Bom estado')),
  sale_mode text not null default 'fixed' check (sale_mode in ('fixed','auction')),
  price numeric(10,2) check (price is null or price > 0),
  starting_bid numeric(10,2) check (starting_bid is null or starting_bid > 0),
  auction_ends_at timestamptz,
  image_urls text[] not null default '{}',
  is_luxury boolean not null default false,
  luxury_document_count integer not null default 0 check (luxury_document_count >= 0),
  status text not null default 'draft' check (status in ('draft','published','paused','reserved','sold','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_fixed_price_check check (sale_mode <> 'fixed' or price is not null),
  constraint listings_auction_check check (sale_mode <> 'auction' or (starting_bid is not null and auction_ends_at is not null)),
  constraint listings_luxury_documents_check check (is_luxury = false or luxury_document_count > 0)
);
create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_status_created_at_idx on public.listings (status, created_at desc);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_sale_mode_idx on public.listings (sale_mode);
alter table public.listings enable row level security;
revoke all on table public.listings from anon, authenticated;
grant select on table public.listings to anon;
grant select, insert, update, delete on table public.listings to authenticated;
drop policy if exists "listings_public_select_published" on public.listings;
create policy "listings_public_select_published" on public.listings for select to anon, authenticated using (status = 'published');
drop policy if exists "listings_seller_select_own" on public.listings;
create policy "listings_seller_select_own" on public.listings for select to authenticated using ((select auth.uid()) = seller_id);
drop policy if exists "listings_seller_insert_own" on public.listings;
create policy "listings_seller_insert_own" on public.listings for insert to authenticated with check ((select auth.uid()) = seller_id);
drop policy if exists "listings_seller_update_own" on public.listings;
create policy "listings_seller_update_own" on public.listings for update to authenticated using ((select auth.uid()) = seller_id) with check ((select auth.uid()) = seller_id);
drop policy if exists "listings_seller_delete_own" on public.listings;
create policy "listings_seller_delete_own" on public.listings for delete to authenticated using ((select auth.uid()) = seller_id);
create or replace function public.set_listing_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at before update on public.listings for each row execute function public.set_listing_updated_at();
