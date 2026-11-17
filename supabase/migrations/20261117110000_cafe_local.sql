-- Parada do café: o nome do lugar (posto, lanchonete), além da cidade. O passageiro vê no convite também.
alter table public.destinos add column if not exists cafe_local text;
alter table public.destinos drop constraint if exists cafe_local_tamanho;
alter table public.destinos add constraint cafe_local_tamanho check (cafe_local is null or length(cafe_local) <= 80);

drop function if exists public.destino_pelo_convite(text);
create function public.destino_pelo_convite(codigo text)
returns table (id text, origem text, destino text, paradas text[], saida text, vanzeiro_nome text, cafe_parada text, cafe_minutos integer, cafe_local text)
language sql stable security definer set search_path = '' as $$
  select d.id, d.origem, d.destino, d.paradas, d.saida, coalesce(p.nome, ''), d.cafe_parada, d.cafe_minutos, d.cafe_local
  from public.destinos d left join public.perfis_vanzeiro p on p.id = d.vanzeiro_id
  where upper(d.convite) = upper(trim(codigo)) and d.ativo
$$;
revoke all on function public.destino_pelo_convite(text) from public, anon;
grant execute on function public.destino_pelo_convite(text) to authenticated;
