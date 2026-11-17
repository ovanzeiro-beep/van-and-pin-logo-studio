-- REV-09: durante a busca, o passageiro acompanha o embarque: quantos já embarcaram (com as iniciais, nunca o
-- nome completo), sua posição na ordem e quantos faltam antes dele. Só para a própria matrícula, só a viagem de hoje.
create or replace function public.iniciais_do_nome(nome text) returns text
language sql immutable set search_path = '' as $$
  select case
    when array_length(p, 1) is null then ''
    when array_length(p, 1) = 1 then upper(left(p[1], 1)) || '.'
    else upper(left(p[1], 1)) || '. ' || upper(left(p[array_length(p, 1)], 1)) || '.'
  end
  from (select regexp_split_to_array(trim(nome), '\s+') as p) t
$$;
revoke all on function public.iniciais_do_nome(text) from public, anon, authenticated;

create or replace function public.embarque_da_viagem(matricula text)
returns table (total int, embarcaram int, iniciais text[], posicao int, faltam_antes int, eu_embarquei boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  m public.matriculas;
  v public.viagens;
  ordem text[];
  feitos text[];
  pos int;
begin
  select * into m from public.matriculas x where x.id = matricula and x.pessoa_id = auth.uid() and x.saiu_em is null;
  if not found then return; end if;
  select * into v from public.viagens w where w.destino_id = m.destino_id and w.data = public.hoje_em_brasilia();
  if not found then return; end if;
  ordem := array(select jsonb_array_elements_text(coalesce(v.estado -> 'ordem', '[]'::jsonb)));
  feitos := array(select jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]'::jsonb)))
         || array(select jsonb_array_elements_text(coalesce(v.estado -> 'naoEstavam', '[]'::jsonb)));
  pos := array_position(ordem, m.id);
  return query select
    coalesce(array_length(ordem, 1), 0),
    coalesce(jsonb_array_length(v.estado -> 'embarcaram'), 0),
    array(select public.iniciais_do_nome(x.nome)
            from jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]'::jsonb)) with ordinality e(id, n)
            join public.matriculas x on x.id = e.id order by e.n),
    pos,
    case when pos is null then null
         else (select count(*)::int from unnest(ordem[1:pos - 1]) o where not (o = any(feitos))) end,
    coalesce((v.estado -> 'embarcaram') ? m.id, false);
end $$;
revoke all on function public.embarque_da_viagem(text) from public, anon;
grant execute on function public.embarque_da_viagem(text) to authenticated;
