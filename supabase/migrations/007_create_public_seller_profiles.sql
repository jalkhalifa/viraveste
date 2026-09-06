create or replace view public.public_seller_profiles
with (security_barrier = true)
as
select id, coalesce(nullif(trim(full_name), ''), 'Vendedor ViraVeste') as display_name,
  city, state, avatar_url, created_at as member_since
from public.profiles
where account_status = 'active';
revoke all on public.public_seller_profiles from public;
revoke all on public.public_seller_profiles from anon;
revoke all on public.public_seller_profiles from authenticated;
grant select on public.public_seller_profiles to anon, authenticated;
