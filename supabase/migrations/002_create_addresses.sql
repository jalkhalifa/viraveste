-- ViraVeste: enderecos privados dos usuarios.
-- Execute este arquivo uma unica vez no SQL Editor do Supabase.

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Casa' check (char_length(label) between 1 and 30),
  recipient_name text not null check (char_length(recipient_name) between 2 and 120),
  postal_code text not null check (postal_code ~ '^[0-9]{8}$'),
  street text not null check (char_length(street) between 2 and 150),
  number text not null check (char_length(number) between 1 and 20),
  complement text check (char_length(complement) <= 100),
  neighborhood text not null check (char_length(neighborhood) between 2 and 100),
  city text not null check (char_length(city) between 2 and 100),
  state text not null check (state ~ '^[A-Z]{2}$'),
  country_code text not null default 'BR' check (country_code = 'BR'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx
on public.addresses (user_id);

create unique index if not exists addresses_one_default_per_user_idx
on public.addresses (user_id)
where is_default = true;

alter table public.addresses enable row level security;

revoke all on table public.addresses from anon;
grant select, insert, update, delete on table public.addresses to authenticated;

drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own"
on public.addresses for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own"
on public.addresses for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own"
on public.addresses for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own"
on public.addresses for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.prepare_user_address()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.addresses where user_id = new.user_id
  ) then
    new.is_default = true;
  elsif new.is_default then
    update public.addresses
    set is_default = false, updated_at = now()
    where user_id = new.user_id
      and id <> new.id
      and is_default = true;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prepare_address_before_write on public.addresses;
create trigger prepare_address_before_write
before insert or update on public.addresses
for each row execute function public.prepare_user_address();
