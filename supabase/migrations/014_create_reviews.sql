create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewed_user_id uuid not null references auth.users(id) on delete cascade,
  review_type text not null check (review_type in ('buyer_reviews_seller', 'seller_reviews_buyer')),
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) between 3 and 1000),
  created_at timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

create index if not exists reviews_reviewed_user_idx
  on public.reviews (reviewed_user_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Avaliações são públicas" on public.reviews;
create policy "Avaliações são públicas"
  on public.reviews for select
  using (true);

drop policy if exists "Participantes avaliam pedidos concluídos" on public.reviews;
create policy "Participantes avaliam pedidos concluídos"
  on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid());

grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

create or replace function public.validate_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order public.orders%rowtype;
begin
  select * into target_order
  from public.orders
  where id = new.order_id;

  if target_order.id is null then
    raise exception 'Pedido não encontrado';
  end if;
  if target_order.order_status <> 'completed' then
    raise exception 'O pedido precisa estar concluído para ser avaliado';
  end if;
  if new.reviewer_id = target_order.buyer_id then
    new.reviewed_user_id = target_order.seller_id;
    new.review_type = 'buyer_reviews_seller';
  elsif new.reviewer_id = target_order.seller_id then
    new.reviewed_user_id = target_order.buyer_id;
    new.review_type = 'seller_reviews_buyer';
  else
    raise exception 'Usuário não participa deste pedido';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_review_before_insert on public.reviews;
create trigger validate_review_before_insert
before insert on public.reviews
for each row execute function public.validate_review();

create or replace view public.review_summaries
with (security_invoker = true)
as
select
  reviewed_user_id,
  round(avg(rating)::numeric, 1) as average_rating,
  count(*)::bigint as review_count
from public.reviews
group by reviewed_user_id;

grant select on public.review_summaries to anon, authenticated;

alter table public.notifications
  drop constraint if exists notifications_notification_type_check;
alter table public.notifications
  add constraint notifications_notification_type_check
  check (notification_type in (
    'message', 'offer_received', 'offer_accepted', 'offer_rejected',
    'counteroffer', 'order_created', 'order_updated', 'shipment',
    'delivery', 'cancellation', 'issue', 'review_received'
  ));

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications
    (user_id, notification_type, title, body, link)
  values
    (
      new.reviewed_user_id,
      'review_received',
      'Você recebeu uma avaliação',
      'Uma nova avaliação foi publicada no seu perfil.',
      '/armario/' || new.reviewed_user_id::text || '#avaliacoes'
    );
  return new;
end;
$$;

drop trigger if exists notify_new_review_after_insert on public.reviews;
create trigger notify_new_review_after_insert
after insert on public.reviews
for each row execute function public.notify_new_review();
