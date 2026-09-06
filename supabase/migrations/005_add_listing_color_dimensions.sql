-- ViraVeste: cor para todos os itens e dimensoes para objetos.
alter table public.listings
add column if not exists color text
check (color is null or char_length(color) <= 60);

alter table public.listings
add column if not exists dimensions text
check (dimensions is null or char_length(dimensions) <= 100);
