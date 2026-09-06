-- ViraVeste: perfil privado vinculado ao usuário do Supabase Auth.
-- Execute este arquivo uma única vez no SQL Editor do Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 30),
  city text check (char_length(city) <= 100),
  state text check (char_length(state) <= 30),
  wants_to_buy boolean not null default true,
  wants_to_sell boolean not null default false,
  avatar_url text,
  account_status text not null default 'active'
    check (account_status in ('active', 'restricted', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, full_name, phone, city, state, wants_to_buy, wants_to_sell
  ) values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'state',
    coalesce((new.raw_user_meta_data ->> 'wants_to_buy')::boolean, true),
    coalesce((new.raw_user_meta_data ->> 'wants_to_sell')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

-- Cria o perfil das contas cadastradas antes desta migração.
insert into public.profiles (
  id, full_name, phone, city, state, wants_to_buy, wants_to_sell
)
select
  id,
  raw_user_meta_data ->> 'full_name',
  raw_user_meta_data ->> 'phone',
  raw_user_meta_data ->> 'city',
  raw_user_meta_data ->> 'state',
  coalesce((raw_user_meta_data ->> 'wants_to_buy')::boolean, true),
  coalesce((raw_user_meta_data ->> 'wants_to_sell')::boolean, false)
from auth.users
on conflict (id) do nothing;
