-- O VANZEIRO · DESFAZER a Correção 5 (só se algo der errado e com autorização do dono). Não traz de volta a cascata.
begin;

-- REVERTER a Correção 5 (só com autorização do dono). Decisão do dono (21/11/2026): a reversão NUNCA traz de volta a
-- exclusão em cascata. Volta só as regras de funcionamento; as proteções de histórico ficam. Nenhum dado é apagado:
-- acertos informados, colunas novas e contas já excluídas continuam como estão.
-- Junto com o banco, o app volta para a versão anterior (sem a tela de acerto, que chama informar_acerto).
select cron.unschedule(jobid) from cron.job where jobname = 'encerrar-finalidade-dos-contatos';
drop trigger if exists avisos_so_para_conta_ativa on public.avisos;
drop function if exists public.aviso_so_para_conta_ativa();
drop function if exists public.informar_acerto(text);
drop function if exists public.encerrar_finalidade_dos_contatos();
drop policy if exists "perfil: os passageiros dele" on public.perfis_vanzeiro;
create policy "perfil: os passageiros dele" on public.perfis_vanzeiro for select to authenticated using (public.sou_passageiro_do_vanzeiro(id));
drop function if exists public.tenho_valor_em_aberto_com(uuid);
drop function if exists public.r_em_aberto_sem_acerto(public.cobrancas);

create or replace function public.cobranca_nunca_editada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.pagamento_data is not null or old.cancelamento_data is not null then
    raise exception 'Esta cobrança já foi paga ou cancelada e não muda mais.';
  end if;
  if (new.id, new.vanzeiro_id, new.matricula_id, new.destino_id, new.tipo, new.referencia, new.vencimento, new.valor_base, new.nome, new.telefone)
     is distinct from
     (old.id, old.vanzeiro_id, old.matricula_id, old.destino_id, old.tipo, old.referencia, old.vencimento, old.valor_base, old.nome, old.telefone) then
    raise exception 'Uma cobrança nunca é editada: só pode ser paga ou cancelada.';
  end if;
  return new;
end $$;

-- excluir_minha_conta da Correção 2, MAS sem apagar o login em cascata: o login continua sendo apagado; a conta fica
-- como registro (a ligação login → conta não volta; as tabelas de histórico continuam impedindo apagar a conta).
create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('vanzeiro.motivo_da_saida', 'Conta excluída', true);
  update public.matriculas
  set saiu_em = coalesce(saiu_em, public.hoje_em_brasilia()), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null
  where pessoa_id = auth.uid();
  perform set_config('vanzeiro.motivo_da_saida', '', true);
  update public.pedidos set nome = 'Conta excluída', endereco = null, ponto_lat = null, ponto_lng = null where pessoa_id = auth.uid();
  update public.contas set nome = 'Conta excluída', excluida_em = now() where id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;

commit;
