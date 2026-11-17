-- REV-08: o passageiro vê quantos lugares estão ocupados na viagem (só números; nunca quem são).
-- Mesma conta da lotação de `responder`: o "Vou" do dia, o "Vou sempre" e o "Não vou de… até…", de quem está no destino.
create or replace function public.lugares_da_viagem(matricula text, dia date)
returns table (lugares int, vao int, eu_vou boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  m public.matriculas;
  d public.destinos;
  prazo timestamptz;
begin
  select * into m from public.matriculas x where x.id = matricula and x.pessoa_id = auth.uid() and x.saiu_em is null;
  if not found then return; end if;
  select * into d from public.destinos where id = m.destino_id;
  prazo := public.prazo_da_viagem(d, dia);
  return query
    select p.van_lugares,
           (select count(*)::int from public.matriculas x
             where x.destino_id = d.id and x.saiu_em is null and (public.r_resposta(x.id, dia, prazo)).resposta = 'vai'),
           coalesce((public.r_resposta(m.id, dia, prazo)).resposta = 'vai', false)
    from public.perfis_vanzeiro p where p.id = d.vanzeiro_id;
end $$;
revoke all on function public.lugares_da_viagem(text, date) from public, anon;
grant execute on function public.lugares_da_viagem(text, date) to authenticated;
