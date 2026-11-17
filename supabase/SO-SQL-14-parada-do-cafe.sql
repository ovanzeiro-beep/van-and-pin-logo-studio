-- Parada do café (pedido do dono, 17/11): o destino marca uma das paradas como café, com os minutos.
-- Ela não é cidade de embarque. O passageiro vê onde é e, na viagem, até que horas volta para a van (estado.voltaAs).
alter table public.destinos add column if not exists cafe_parada text;
alter table public.destinos add column if not exists cafe_minutos integer;
alter table public.destinos drop constraint if exists cafe_minutos_validos;
alter table public.destinos add constraint cafe_minutos_validos
  check (cafe_parada is null or (cafe_minutos between 5 and 180 and cafe_parada = any(paradas)));

drop function if exists public.destino_pelo_convite(text);
create function public.destino_pelo_convite(codigo text)
returns table (id text, origem text, destino text, paradas text[], saida text, vanzeiro_nome text, cafe_parada text, cafe_minutos integer)
language sql stable security definer set search_path = '' as $$
  select d.id, d.origem, d.destino, d.paradas, d.saida, coalesce(p.nome, ''), d.cafe_parada, d.cafe_minutos
  from public.destinos d left join public.perfis_vanzeiro p on p.id = d.vanzeiro_id
  where upper(d.convite) = upper(trim(codigo)) and d.ativo
$$;
revoke all on function public.destino_pelo_convite(text) from public, anon;
grant execute on function public.destino_pelo_convite(text) to authenticated;

drop function if exists public.minha_viagem_de_hoje(text);
create function public.minha_viagem_de_hoje(matricula text)
returns table (viagem_id text, fase text, na_ordem boolean, embarcou boolean, conferencia text, comecou_em timestamptz, volta_as text)
language sql stable security definer set search_path = '' as $$
  select v.id, v.fase,
         (v.estado -> 'ordem') ? matricula,
         (v.estado -> 'embarcaram') ? matricula,
         v.estado -> 'conferencia' ->> matricula,
         v.comecou_em,
         v.estado ->> 'voltaAs'
  from public.viagens v join public.matriculas m on m.destino_id = v.destino_id
  where m.id = matricula and m.pessoa_id = (select auth.uid()) and m.saiu_em is null and v.data = public.hoje_em_brasilia()
$$;
revoke all on function public.minha_viagem_de_hoje(text) from public, anon;
grant execute on function public.minha_viagem_de_hoje(text) to authenticated;
