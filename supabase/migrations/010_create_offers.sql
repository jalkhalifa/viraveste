create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  parent_offer_id uuid references public.offers(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','countered','withdrawn','expired')),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (buyer_id <> seller_id),
  check (created_by = buyer_id or created_by = seller_id)
);

create index if not exists offers_conversation_idx on public.offers(conversation_id,created_at);
create index if not exists offers_listing_idx on public.offers(listing_id);
alter table public.offers enable row level security;
create policy "Participants view offers" on public.offers for select using (auth.uid()=buyer_id or auth.uid()=seller_id);
create policy "Participants create offers" on public.offers for insert with check ((auth.uid()=buyer_id or auth.uid()=seller_id) and auth.uid()=created_by);
create policy "Participants update offers" on public.offers for update using (auth.uid()=buyer_id or auth.uid()=seller_id);
grant select,insert on public.offers to authenticated;
grant update(status,responded_at) on public.offers to authenticated;

create or replace function public.protect_offer_update() returns trigger language plpgsql security invoker set search_path=public as $$
begin
  if new.listing_id<>old.listing_id or new.conversation_id<>old.conversation_id or new.buyer_id<>old.buyer_id or new.seller_id<>old.seller_id or new.created_by<>old.created_by or new.parent_offer_id is distinct from old.parent_offer_id or new.amount<>old.amount or new.created_at<>old.created_at or new.expires_at<>old.expires_at then raise exception 'Offer fields are immutable'; end if;
  if old.status<>'pending' then raise exception 'Offer already answered'; end if;
  if auth.uid()=old.seller_id and new.status not in ('accepted','rejected','countered') then raise exception 'Invalid seller response'; end if;
  if auth.uid()=old.buyer_id and new.status<>'withdrawn' then raise exception 'Invalid buyer response'; end if;
  new.responded_at=now(); return new;
end; $$;
drop trigger if exists protect_offer_update_trigger on public.offers;
create trigger protect_offer_update_trigger before update on public.offers for each row execute function public.protect_offer_update();
