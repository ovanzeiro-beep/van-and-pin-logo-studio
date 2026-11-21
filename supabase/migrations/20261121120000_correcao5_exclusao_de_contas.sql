-- CORREÇÃO 5 (auditoria de 20/11/2026, P0/T1.10 e D3): excluir a conta não apaga o histórico de outras pessoas.
--
-- Antes: apagar o login apagava em cascata a tabela de contas e, com ela, os destinos, passageiros, viagens,
-- cobranças e avisos do VANZEIRO (os passageiros perdiam o histórico do que pagaram, sem aviso). Do PASSAGEIRO,
-- o nome e o endereço saíam do cadastro, mas o nome continuava nas cobranças (dado pessoal após a exclusão).
--
-- Agora (proposta da Correção 5, aguardando decisão do dono sobre os itens marcados com [DECISÃO]):
--  1. A conta vira um registro sem dados pessoais ("Conta excluída") e o LOGIN é apagado. A ligação
--     login → conta deixa de apagar em cascata; as tabelas de histórico (destinos, matrículas, viagens,
--     cobranças, pedidos, perfil do vanzeiro) passam a IMPEDIR que uma conta com histórico seja apagada.
--  2. Vanzeiro: cada destino é excluído como no app (os passageiros são avisados e saem; a Correção 2 cancela
--     só os períodos futuros); pedidos aguardando são recusados; [DECISÃO A] o que ainda estava em aberto é
--     cancelado com o motivo "Conta do vanzeiro excluída" (fica no histórico); nome, telefone, Pix e van são
--     apagados do perfil; [DECISÃO C] os gastos dele (só dele) são apagados.
--  3. Passageiro: como antes (sai dos destinos, nome e endereço apagados, o cadastro deixa de apontar para a conta) e, agora, o nome também sai das
--     cobranças, dos pedidos de mudança de endereço e dos avisos que citavam a pessoa.
--     [DECISÃO B] O telefone continua com o vanzeiro (como diz a Política de Privacidade).
--  4. Nada disso acontece no meio de uma viagem de hoje. Tudo numa operação só: se falhar, nada muda.
--  5. Cobranças continuam nunca editadas: a ÚNICA exceção é trocar o nome por "Conta excluída", e só
--     dentro desta função.
-- Nenhum prazo de guarda é definido aqui (decisão jurídica). Nada é apagado de histórico financeiro.

alter table public.contas add column if not exists excluida_em timestamptz;

-- 1. Apagar o login não apaga mais a conta (nem o histórico ligado a ela).
alter table public.contas drop constraint if exists contas_id_fkey;

-- Histórico protegido: uma conta com destinos, matrículas, viagens, cobranças ou pedidos não pode ser apagada.
alter table public.perfis_vanzeiro drop constraint if exists perfis_vanzeiro_id_fkey,
  add constraint perfis_vanzeiro_id_fkey foreign key (id) references public.contas(id);
alter table public.destinos drop constraint if exists destinos_vanzeiro_id_fkey,
  add constraint destinos_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id);
alter table public.matriculas drop constraint if exists matriculas_vanzeiro_id_fkey,
  add constraint matriculas_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id);
alter table public.viagens drop constraint if exists viagens_vanzeiro_id_fkey,
  add constraint viagens_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id);
alter table public.cobrancas drop constraint if exists cobrancas_vanzeiro_id_fkey,
  add constraint cobrancas_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id);
alter table public.pedidos drop constraint if exists pedidos_vanzeiro_id_fkey,
  add constraint pedidos_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id);

-- 5. Cobrança nunca editada: igual à de antes, mais a única exceção (anonimizar o nome, só na exclusão da conta).
create or replace function public.cobranca_nunca_editada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_setting('vanzeiro.anonimizar', true) = 'sim'
     and new.nome = 'Conta excluída'
     and (to_jsonb(new) - 'nome') = (to_jsonb(old) - 'nome') then
    return new;
  end if;
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

create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
  hoje date := public.hoje_em_brasilia();
  minhas text[];
begin
  if eu is null then raise exception 'Entre na sua conta para excluir.'; end if;
  -- 4. Nunca no meio de uma viagem de hoje (como vanzeiro ou como passageiro).
  if exists (select 1 from public.viagens v
             where v.data = hoje and v.fase <> 'encerrada'
               and (v.vanzeiro_id = eu or exists (select 1 from public.matriculas m
                    where m.destino_id = v.destino_id and m.pessoa_id = eu and m.saiu_em is null))) then
    raise exception 'Uma das suas viagens está acontecendo agora. Espere ela terminar para excluir a conta.';
  end if;

  -- 2. Como vanzeiro.
  update public.pedidos set situacao = 'recusado', respondido_em = hoje where vanzeiro_id = eu and situacao = 'aguardando';
  update public.destinos set excluido_em = now(), ativo = false where vanzeiro_id = eu and excluido_em is null;
  update public.cobrancas set cancelamento_data = hoje, cancelamento_motivo = 'Conta do vanzeiro excluída'
   where vanzeiro_id = eu and pagamento_data is null and cancelamento_data is null;                    -- [DECISÃO A]
  update public.perfis_vanzeiro set nome = 'Vanzeiro (conta excluída)', telefone = '', pix = '', van_modelo = '', van_placa = ''
   where id = eu;
  delete from public.gastos where vanzeiro_id = eu;                                                   -- [DECISÃO C]

  -- 3. Como passageiro.
  minhas := array(select id from public.matriculas where pessoa_id = eu);
  perform set_config('vanzeiro.motivo_da_saida', 'Conta excluída', true);
  update public.matriculas
     set saiu_em = coalesce(saiu_em, hoje), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null, pessoa_id = null
   where id = any(minhas);
  perform set_config('vanzeiro.motivo_da_saida', '', true);
  update public.pedidos set nome = 'Conta excluída', endereco = null, ponto_lat = null, ponto_lng = null, pessoa_id = null where pessoa_id = eu;
  update public.mudancas_endereco set nome = 'Conta excluída', de = '{}'::jsonb, para = '{}'::jsonb where matricula_id = any(minhas);
  perform set_config('vanzeiro.anonimizar', 'sim', true);
  update public.cobrancas set nome = 'Conta excluída' where matricula_id = any(minhas) and nome <> 'Conta excluída';
  perform set_config('vanzeiro.anonimizar', '', true);
  delete from public.avisos where matricula_id = any(minhas) and para <> eu::text and tipo = 'resposta_passageiro';

  -- 1. O que era só desta conta, e a própria conta sem dados pessoais. Por último, o login.
  delete from public.avisos where para = eu::text;
  delete from public.celulares where conta_id = eu;
  delete from public.entregas_push where conta_id = eu;
  delete from public.juntar_conta where conta_id = eu;
  delete from public.avisos_de_chegada where passageiro_id = eu;
  update public.contas set nome = 'Conta excluída', excluida_em = now() where id = eu;
  delete from auth.users where id = eu;
end $$;
revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
