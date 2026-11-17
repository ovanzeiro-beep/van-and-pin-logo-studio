-- Texto do aviso "A van está chegando" (pedido do dono, 17/11): diz que a van está a caminho do ponto da pessoa.
create or replace function public.avisar_proximo_da_busca() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  feitos text[];
  prox text;
  m public.matriculas;
begin
  if new.fase <> 'busca' then return null; end if;
  feitos := array(select jsonb_array_elements_text(coalesce(new.estado -> 'embarcaram', '[]'::jsonb)))
         || array(select jsonb_array_elements_text(coalesce(new.estado -> 'naoEstavam', '[]'::jsonb)));
  select o into prox from jsonb_array_elements_text(coalesce(new.estado -> 'ordem', '[]'::jsonb)) with ordinality e(o, n)
   where not (o = any(feitos)) order by n limit 1;
  if prox is null then return null; end if;
  select * into m from public.matriculas where id = prox;
  if not found then return null; end if;
  insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
  values (gen_random_uuid()::text, new.vanzeiro_id, coalesce(m.pessoa_id::text, m.id), 'proxima_parada',
          'A van está a caminho do seu ponto' || case when coalesce(trim(m.endereco), '') <> '' then ' (' || trim(m.endereco) || ')' else '' end || '. Você é o próximo: aguarde no ponto.', 'proxima_' || new.id || '_' || m.id,
          new.destino_id, m.id, public.hoje_em_brasilia())
  on conflict (para, chave) do nothing;
  return null;
end $$;
revoke all on function public.avisar_proximo_da_busca() from public, anon, authenticated;
create or replace trigger avisar_proximo_da_busca after insert or update of estado on public.viagens
  for each row execute function public.avisar_proximo_da_busca();
