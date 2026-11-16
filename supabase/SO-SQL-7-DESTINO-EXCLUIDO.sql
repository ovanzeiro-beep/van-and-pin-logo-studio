-- Destino excluído pelo vanzeiro: cada passageiro que estava nele recebe o aviso no sininho (e no celular),
-- e sai do destino na mesma hora.
create or replace function public.avisar_destino_excluido() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.excluido_em is null and new.excluido_em is not null then
    insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
    select gen_random_uuid()::text, new.vanzeiro_id, coalesce(m.pessoa_id::text, m.id), 'destino_excluido',
           'O vanzeiro excluiu o destino ' || new.origem || ' → ' || new.destino || '. As viagens dele não acontecem mais. Se quiser, peça um código novo ao vanzeiro.',
           'destino_excluido_' || new.id, new.id, m.id, public.hoje_em_brasilia()
    from public.matriculas m where m.destino_id = new.id and m.saiu_em is null
    on conflict (para, chave) do nothing;
    update public.matriculas set saiu_em = public.hoje_em_brasilia() where destino_id = new.id and saiu_em is null;
  end if;
  return null;
end $$;
revoke all on function public.avisar_destino_excluido() from public, anon, authenticated;
drop trigger if exists destino_excluido on public.destinos;
create trigger destino_excluido after update of excluido_em on public.destinos for each row execute function public.avisar_destino_excluido();
