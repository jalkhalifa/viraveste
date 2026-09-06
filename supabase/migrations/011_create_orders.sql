-- Estrutura executada no SQL Editor antes da integração do checkout.
-- Mantida no projeto para registrar o histórico do banco de dados.
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), offer_id uuid references public.offers(id),
 buyer_id uuid not null references auth.users(id), seller_id uuid not null references auth.users(id), sale_mode text not null check(sale_mode in ('fixed','auction','offer')),
 item_price numeric(12,2) not null check(item_price>0), protection_fee numeric(12,2) not null default 0 check(protection_fee>=0), shipping_price numeric(12,2) not null default 0 check(shipping_price>=0), total_amount numeric(12,2) not null check(total_amount>0),
 payment_method text check(payment_method is null or payment_method in ('credit_card','pix')), payment_status text not null default 'pending' check(payment_status in ('pending','processing','paid','failed','refunded','partially_refunded','cancelled')),
 order_status text not null default 'awaiting_payment' check(order_status in ('awaiting_payment','payment_confirmed','preparing_shipment','shipped','delivered','completed','cancellation_requested','cancelled','disputed')),
 shipping_method text, tracking_code text, recipient_name text not null, postal_code text not null, street text not null, address_number text not null, complement text, neighborhood text not null, city text not null, state text not null,
 created_at timestamptz not null default now(), paid_at timestamptz, shipped_at timestamptz, delivered_at timestamptz, completed_at timestamptz, cancelled_at timestamptz, constraint different_order_participants check(buyer_id<>seller_id)
);
create index if not exists orders_buyer_id_idx on public.orders(buyer_id,created_at desc);
create index if not exists orders_seller_id_idx on public.orders(seller_id,created_at desc);
create index if not exists orders_listing_id_idx on public.orders(listing_id);
create index if not exists orders_offer_id_idx on public.orders(offer_id) where offer_id is not null;
alter table public.orders enable row level security;
create policy "Comprador visualiza seus pedidos" on public.orders for select using(auth.uid()=buyer_id);
create policy "Vendedor visualiza suas vendas" on public.orders for select using(auth.uid()=seller_id);
create policy "Comprador inicia pedido" on public.orders for insert with check(auth.uid()=buyer_id and buyer_id<>seller_id and payment_status='pending' and order_status='awaiting_payment');
grant select,insert on public.orders to authenticated;
