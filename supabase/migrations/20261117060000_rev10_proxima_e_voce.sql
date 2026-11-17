-- REV-10: "Você é o próximo. Aguarde no ponto: a van está chegando."
-- Feito pelo banco a cada mudança da viagem na fase de busca (funciona também com a fila sem sinal do vanzeiro):
-- o primeiro da ordem ainda não tratado (nem "Embarcou" nem "Não estava no ponto") recebe o aviso, uma vez só.
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
          'Você é o próximo. Aguarde no ponto: a van está chegando.', 'proxima_' || new.id || '_' || m.id,
          new.destino_id, m.id, public.hoje_em_brasilia())
  on conflict (para, chave) do nothing;
  return null;
end $$;
revoke all on function public.avisar_proximo_da_busca() from public, anon, authenticated;
create or replace trigger avisar_proximo_da_busca after insert or update of estado on public.viagens
  for each row execute function public.avisar_proximo_da_busca();
