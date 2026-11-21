-- CORREÇÃO 5 (auditoria de 20/11/2026, T1.10 e D3) — revisada com as decisões do dono de 21/11/2026.
-- Excluir a conta não apaga o histórico de outras pessoas, não perdoa dívidas sozinho e não guarda dados sem finalidade.
--
--  1. A conta vira um registro sem dados pessoais ("Conta excluída") e o LOGIN é apagado. Apagar o login não apaga
--     mais nada em cascata; destinos, matrículas, viagens, cobranças, pedidos e perfil IMPEDEM apagar a conta.
--  2. VANZEIRO (decisão A): cada destino é excluído como no app (passageiros avisados; a Correção 2 cancela SÓ as
--     cobranças de período que começa depois da saída — as futuras). Viagens feitas, períodos já começados e
--     vencidas continuam EM ABERTO: nada é perdoado sozinho. Pagas e canceladas não mudam. Quem tem valor em
--     aberto recebe um aviso. Depois, o passageiro pode INFORMAR um acerto feito fora do app: fica registrado como
--     declaração dele (data e cobrança), NÃO como pagamento; a cobrança continua sem pagamento.
--  3. CONTATO (decisão B): telefone e Pix do vanzeiro ficam só enquanto algum passageiro COM CONTA tem valor em
--     aberto com ele sem acerto informado, e só esses passageiros veem. O telefone do passageiro que excluiu a conta
--     fica só nas cobranças em aberto com um vanzeiro que continua no app (só ele vê). Passageiros SEM conta de um
--     vanzeiro que saiu ficam sem dados pessoais (ninguém mais os acessa); as dívidas continuam registradas. Quando a finalidade acaba (quitado, cancelado ou acerto
--     informado), os contatos são apagados por uma tarefa automática. Prazo legal máximo: em
--     public.regras_de_guarda, definido pelo advogado (sem prazo inventado aqui).
--  4. GASTOS (decisão C): o app oferece o relatório para baixar antes de excluir; os gastos são apagados (o app não
--     tem obrigação legal própria sobre eles). Nada de totais para estatística.
--  5. Nunca no meio de uma viagem de hoje. Tudo numa operação: se falhar, nada muda.
--  6. Cobrança nunca editada: única exceção, dentro destas funções, trocar o nome por "Conta excluída" e apagar o
--     telefone quando a finalidade acaba.

alter table public.contas add column if not exists excluida_em timestamptz;
alter table public.perfis_vanzeiro add column if not exists saiu_do_app_em date;
alter table public.matriculas add column if not exists conta_excluida_em date;

-- O telefone do cadastro pode ficar vazio só quando a conta da pessoa foi excluída e a finalidade acabou.
alter table public.matriculas drop constraint if exists matriculas_telefone_check;
alter table public.matriculas add constraint matriculas_telefone_check
  check (telefone ~ '^[0-9]{10,11}$' or (telefone = '' and conta_excluida_em is not null));

-- 1. Apagar o login não apaga mais a conta, e o histórico impede apagar a conta.
alter table public.contas drop constraint if exists contas_id_fkey;
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

-- 3. Prazo legal máximo de guarda dos contatos (vazio até o advogado definir; aí a tarefa passa a aplicar).
create table if not exists public.regras_de_guarda (
  chave text primary key,
  meses integer check (meses is null or meses > 0),
  fundamento text,
  definido_em timestamptz
);
insert into public.regras_de_guarda (chave, fundamento) values
  ('contatos_de_cobranca_em_aberto', 'A definir pelo advogado (decisão do dono, 21/11/2026).')
on conflict (chave) do nothing;
alter table public.regras_de_guarda enable row level security;
revoke all on public.regras_de_guarda from anon, authenticated;

-- 2. Acerto informado pelo passageiro (declaração, não pagamento).
create table if not exists public.acertos_informados (
  cobranca_id text primary key references public.cobrancas(id),
  matricula_id text not null references public.matriculas(id),
  informado_em timestamptz not null default now()
);
alter table public.acertos_informados enable row level security;
drop policy if exists "acertos: os envolvidos veem" on public.acertos_informados;
create policy "acertos: os envolvidos veem" on public.acertos_informados for select to authenticated
  using (public.minha_matricula(matricula_id) or public.sou_vanzeiro_da_matricula(matricula_id));
revoke all on public.acertos_informados from anon, authenticated;
grant select on public.acertos_informados to authenticated;

-- 6. Cobrança nunca editada: igual à de antes, mais a única exceção (só dentro destas funções).
create or replace function public.cobranca_nunca_editada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_setting('vanzeiro.anonimizar', true) = 'sim'
     and new.nome in (old.nome, 'Conta excluída') and new.telefone in (old.telefone, '')
     and (to_jsonb(new) - 'nome' - 'telefone') = (to_jsonb(old) - 'nome' - 'telefone') then
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

-- Valor em aberto (sem pagamento, sem cancelamento) e sem acerto informado.
create or replace function public.r_em_aberto_sem_acerto(k public.cobrancas) returns boolean
language sql stable security definer set search_path = '' as $$
  select k.pagamento_data is null and k.cancelamento_data is null
     and not exists (select 1 from public.acertos_informados a where a.cobranca_id = k.id)
$$;

-- 3. Passageiro só vê o contato do vanzeiro que saiu do app se ainda tiver valor em aberto com ele.
create or replace function public.tenho_valor_em_aberto_com(v uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cobrancas k join public.matriculas m on m.id = k.matricula_id
                 where k.vanzeiro_id = v and m.pessoa_id = auth.uid() and public.r_em_aberto_sem_acerto(k))
$$;
drop policy if exists "perfil: os passageiros dele" on public.perfis_vanzeiro;
create policy "perfil: os passageiros dele" on public.perfis_vanzeiro for select to authenticated
  using (public.sou_passageiro_do_vanzeiro(id) and (saiu_do_app_em is null or public.tenho_valor_em_aberto_com(id)));

-- 3. Fim da finalidade: apaga os contatos que não têm mais motivo para existir.
create or replace function public.encerrar_finalidade_dos_contatos() returns void
language plpgsql security definer set search_path = '' as $$
declare
  hoje date := public.hoje_em_brasilia();
  meses integer := (select r.meses from public.regras_de_guarda r where r.chave = 'contatos_de_cobranca_em_aberto');
begin
  perform set_config('vanzeiro.anonimizar', 'sim', true);
  -- Passageiro que excluiu a conta: telefone sai quando não há mais valor em aberto (ou passou o prazo legal).
  --    Só fica enquanto o vanzeiro dele continua no app e ainda tem valor em aberto a receber dele.
  update public.cobrancas k set telefone = ''
   where k.telefone <> '' and (
     -- já paga ou cancelada: o telefone não tem mais finalidade
     ((k.pagamento_data is not null or k.cancelamento_data is not null)
       and exists (select 1 from public.matriculas m where m.id = k.matricula_id and m.conta_excluida_em is not null))
     or k.matricula_id in (
     select m.id from public.matriculas m where m.conta_excluida_em is not null and (
       not exists (select 1 from public.cobrancas x where x.matricula_id = m.id and x.pagamento_data is null and x.cancelamento_data is null)
       or exists (select 1 from public.contas c where c.id = m.vanzeiro_id and c.excluida_em is not null)
       or (meses is not null and m.conta_excluida_em + make_interval(months => meses) <= hoje))));
  update public.matriculas m set telefone = ''
   where m.conta_excluida_em is not null and m.telefone <> '' and (
     not exists (select 1 from public.cobrancas x where x.matricula_id = m.id and x.pagamento_data is null and x.cancelamento_data is null)
     or exists (select 1 from public.contas c where c.id = m.vanzeiro_id and c.excluida_em is not null)
     or (meses is not null and m.conta_excluida_em + make_interval(months => meses) <= hoje));
  perform set_config('vanzeiro.anonimizar', '', true);
  -- Vanzeiro que saiu do app: telefone e Pix saem quando nenhum passageiro COM CONTA (quem consegue ver) tem valor
  -- em aberto sem acerto informado (ou passou o prazo legal).
  update public.perfis_vanzeiro p set telefone = '', pix = ''
   where p.saiu_do_app_em is not null and (p.telefone <> '' or p.pix <> '') and (
     not exists (select 1 from public.cobrancas k join public.matriculas m on m.id = k.matricula_id
                 where k.vanzeiro_id = p.id and m.pessoa_id is not null and public.r_em_aberto_sem_acerto(k))
     or (meses is not null and p.saiu_do_app_em + make_interval(months => meses) <= hoje));
end $$;

-- 2. O passageiro informa um acerto feito fora do app (só quando o vanzeiro saiu do app).
create or replace function public.informar_acerto(cobranca text) returns void
language plpgsql security definer set search_path = '' as $$
declare k public.cobrancas;
begin
  select * into k from public.cobrancas where id = cobranca;
  if not found or not public.minha_matricula(k.matricula_id) then raise exception 'Não achamos esta cobrança.'; end if;
  if k.pagamento_data is not null or k.cancelamento_data is not null then raise exception 'Esta cobrança não está em aberto.'; end if;
  if not exists (select 1 from public.perfis_vanzeiro p where p.id = k.vanzeiro_id and p.saiu_do_app_em is not null) then
    raise exception 'O vanzeiro está no app: combine com ele. Quem marca como pago é o vanzeiro.';
  end if;
  insert into public.acertos_informados (cobranca_id, matricula_id) values (k.id, k.matricula_id) on conflict do nothing;
  perform public.encerrar_finalidade_dos_contatos();
end $$;

-- Avisos não vão para contas excluídas, e cobrança de vanzeiro que saiu do app não gera lembrete automático.
create or replace function public.aviso_so_para_conta_ativa() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.contas c where c.excluida_em is not null
             and (c.id::text = new.para or (new.tipo in ('cobranca_vencida', 'cobranca_vencendo') and c.id = new.vanzeiro_id))) then
    return null;
  end if;
  return new;
end $$;
drop trigger if exists avisos_so_para_conta_ativa on public.avisos;
create trigger avisos_so_para_conta_ativa before insert on public.avisos
  for each row execute function public.aviso_so_para_conta_ativa();

create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
  hoje date := public.hoje_em_brasilia();
  minhas text[];
begin
  if eu is null then raise exception 'Entre na sua conta para excluir.'; end if;
  -- 5. Nunca no meio de uma viagem de hoje (como vanzeiro ou como passageiro).
  if exists (select 1 from public.viagens v
             where v.data = hoje and v.fase <> 'encerrada'
               and (v.vanzeiro_id = eu or exists (select 1 from public.matriculas m
                    where m.destino_id = v.destino_id and m.pessoa_id = eu and m.saiu_em is null))) then
    raise exception 'Uma das suas viagens está acontecendo agora. Espere ela terminar para excluir a conta.';
  end if;

  -- 2. Como vanzeiro: destinos excluídos (só as cobranças futuras são canceladas, pela Correção 2).
  update public.pedidos set situacao = 'recusado', respondido_em = hoje where vanzeiro_id = eu and situacao = 'aguardando';
  update public.destinos set excluido_em = now(), ativo = false where vanzeiro_id = eu and excluido_em is null;
  update public.perfis_vanzeiro set saiu_do_app_em = hoje, nome = 'Vanzeiro (conta excluída)', van_modelo = '', van_placa = ''
   where id = eu;
  insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, criado_em)
  select gen_random_uuid()::text, eu, coalesce(m.pessoa_id::text, m.id), 'vanzeiro_saiu',
         'O vanzeiro saiu do app. Ficou ' || public.r_reais(sum(greatest(0, k.valor_base - k.faltas * k.valor_falta))::int)
           || ' em aberto com ele. Em Pagamentos você vê como combinar o acerto.',
         'vanzeiro_saiu_' || eu, hoje
    from public.cobrancas k join public.matriculas m on m.id = k.matricula_id
   where k.vanzeiro_id = eu and k.pagamento_data is null and k.cancelamento_data is null and m.pessoa_id is not null
   group by coalesce(m.pessoa_id::text, m.id)
  on conflict (para, chave) do nothing;
  -- Passageiros SEM conta que ele cadastrou: ninguém mais acessa esses dados; nome, endereço e telefone saem
  -- (as cobranças continuam registradas, sem dados pessoais).
  update public.matriculas set nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null, conta_excluida_em = hoje
   where vanzeiro_id = eu and pessoa_id is null;
  perform set_config('vanzeiro.anonimizar', 'sim', true);
  update public.cobrancas k set nome = 'Conta excluída'
   where k.vanzeiro_id = eu and k.nome <> 'Conta excluída'
     and exists (select 1 from public.matriculas m where m.id = k.matricula_id and m.pessoa_id is null);
  perform set_config('vanzeiro.anonimizar', '', true);
  delete from public.gastos where vanzeiro_id = eu;                                   -- 4. depois do relatório

  -- Como passageiro.
  minhas := array(select id from public.matriculas where pessoa_id = eu);
  perform set_config('vanzeiro.motivo_da_saida', 'Conta excluída', true);
  update public.matriculas
     set saiu_em = coalesce(saiu_em, hoje), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null,
         pessoa_id = null, conta_excluida_em = hoje
   where id = any(minhas);
  perform set_config('vanzeiro.motivo_da_saida', '', true);
  update public.pedidos set nome = 'Conta excluída', telefone = '', endereco = null, ponto_lat = null, ponto_lng = null, pessoa_id = null
   where pessoa_id = eu;
  update public.mudancas_endereco set nome = 'Conta excluída', de = '{}'::jsonb, para = '{}'::jsonb where matricula_id = any(minhas);
  perform set_config('vanzeiro.anonimizar', 'sim', true);
  update public.cobrancas set nome = 'Conta excluída' where matricula_id = any(minhas) and nome <> 'Conta excluída';
  perform set_config('vanzeiro.anonimizar', '', true);
  delete from public.avisos where matricula_id = any(minhas) and para <> eu::text and tipo = 'resposta_passageiro';

  -- 1. O que era só desta conta, a conta sem dados pessoais e, por último, o login.
  delete from public.avisos where para = eu::text;
  delete from public.celulares where conta_id = eu;
  delete from public.entregas_push where conta_id = eu;
  delete from public.juntar_conta where conta_id = eu;
  delete from public.avisos_de_chegada where passageiro_id = eu;
  update public.contas set nome = 'Conta excluída', excluida_em = now() where id = eu;
  delete from auth.users where id = eu;
  perform public.encerrar_finalidade_dos_contatos();
end $$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
revoke all on function public.informar_acerto(text) from public, anon;
grant execute on function public.informar_acerto(text) to authenticated;
revoke all on function public.encerrar_finalidade_dos_contatos() from public, anon, authenticated;
revoke all on function public.aviso_so_para_conta_ativa() from public, anon, authenticated;
revoke all on function public.r_em_aberto_sem_acerto(public.cobrancas) from public, anon, authenticated;
revoke all on function public.tenho_valor_em_aberto_com(uuid) from public, anon;
grant execute on function public.tenho_valor_em_aberto_com(uuid) to authenticated;

-- A tarefa da finalidade roda a cada hora (além de rodar na hora da exclusão e de cada acerto informado).
select cron.schedule('encerrar-finalidade-dos-contatos', '23 * * * *', 'select public.encerrar_finalidade_dos_contatos()');
