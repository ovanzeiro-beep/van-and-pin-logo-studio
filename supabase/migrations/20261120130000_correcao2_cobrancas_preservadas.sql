-- CORREÇÃO 2 (auditoria de 20/11/2026, P0-1 e T1.8): cobranças preservadas quando o passageiro sai.
--
-- Antes: sair do destino, ser removido, excluir a conta ou ter o destino excluído cancelava toda cobrança ainda não
-- vencida, inclusive de viagens feitas (Por viagem e Diário vencem 7 dias depois do embarque) e da mensalidade ou
-- quinzena em andamento. Parte disso era feita no banco (sair_do_destino, excluir_minha_conta) e parte no celular do
-- vanzeiro (remover passageiro, excluir destino). E o vanzeiro deixava de ser avisado das dívidas de quem saiu.
-- Provas: docs/evidencias/2026-11-20-auditoria-fase4.md (T1.1, T1.5, T1.8) e o grupo c2 de scripts/auditoria-laboratorio.py.
--
-- Agora (decisão D1-C do dono), num lugar só, no banco:
--  1. Por viagem e Diário: nada é cancelado automaticamente na saída (essas cobranças só existem para viagens feitas).
--  2. Mensal e Quinzenal: continua valendo a cobrança cujo período já começou (inclusive no dia da saída); só é
--     cancelada a cobrança de período que começa DEPOIS da saída. O período é o que o sistema já usa no desconto
--     de faltas: do dia seguinte ao vencimento anterior até o vencimento (src/lib/cobrancas.ts, r_nova_cobranca).
--  3. Vencidas e pagas nunca são tocadas. Nada é apagado; o vínculo com matrícula, destino e período fica.
--  4. Todas as saídas passam pela mesma regra: um gatilho na matrícula, quando ela é encerrada, cancela só os
--     períodos futuros, com o motivo de cada caminho ("Saiu do destino", "Removido do destino", "Conta excluída",
--     "Destino excluído").
--  5. Proteção para celulares com versão antiga do app: o banco recusa o cancelamento automático (com esses motivos)
--     de um período já iniciado, e não grava cobrança Mensal/Quinzenal de período que começa depois da saída.
--     O vanzeiro continua podendo cancelar à mão, escrevendo o motivo com as próprias palavras.
--  6. A tarefa automática continua avisando o vanzeiro das cobranças vencidas de quem saiu (uma vez por cobrança).
--
-- Fora desta correção (Correção 5): excluir a conta do VANZEIRO ainda apaga os dados dele em cascata.
-- Pode rodar de novo sem quebrar. Não muda tabelas nem apaga dados.

-- Primeiro dia do período que a cobrança paga. Null quando não há período (Por viagem, Diário) ou não dá para saber.
create or replace function public.r_inicio_do_periodo(k public.cobrancas, dia integer) returns date
language sql stable set search_path = '' as $$
  select case
    when k.tipo not in ('mensal', 'quinzenal') then null
    when k.periodo_de is not null then k.periodo_de
    when dia is null then null
    when k.tipo = 'mensal' then public.r_somar_meses(k.vencimento, -1, dia) + 1
    else public.r_quinzena_anterior(dia, k.vencimento) + 1
  end
$$;

-- Período que só começa depois da saída: é o único que pode ser cancelado automaticamente.
create or replace function public.r_periodo_futuro(k public.cobrancas, dia integer, saida date) returns boolean
language sql stable set search_path = '' as $$
  select coalesce(public.r_inicio_do_periodo(k, dia) > saida, false)
$$;

-- Cancela, com o motivo, só as cobranças em aberto de períodos que começam depois da saída da matrícula.
create or replace function public.r_cancelar_periodos_futuros(p_matricula text, p_motivo text, p_saida date) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  update public.cobrancas k
     set cancelamento_data = public.hoje_em_brasilia(), cancelamento_motivo = p_motivo
    from public.matriculas m
   where m.id = p_matricula and k.matricula_id = m.id
     and k.pagamento_data is null and k.cancelamento_data is null
     and public.r_periodo_futuro(k, m.vencimento, p_saida);
  get diagnostics n = row_count;
  return n;
end $$;

-- Toda matrícula encerrada passa por aqui (passageiro saiu, vanzeiro removeu, conta excluída, destino excluído).
create or replace function public.matricula_encerrada() returns trigger
language plpgsql security definer set search_path = '' as $$
declare motivo text := nullif(current_setting('vanzeiro.motivo_da_saida', true), '');
begin
  if old.saiu_em is null and new.saiu_em is not null then
    motivo := coalesce(motivo, case when auth.uid() is not null and auth.uid() = new.pessoa_id then 'Saiu do destino' else 'Removido do destino' end);
    perform public.r_cancelar_periodos_futuros(new.id, motivo, new.saiu_em);
  end if;
  return null;
end $$;
drop trigger if exists matricula_encerrada on public.matriculas;
create trigger matricula_encerrada after update of saiu_em on public.matriculas
  for each row execute function public.matricula_encerrada();

-- Proteção das cobranças na saída (vale para qualquer celular, inclusive com versão antiga do app).
create or replace function public.cobranca_regras_da_saida() returns trigger
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  if tg_op = 'INSERT' then
    if new.tipo in ('mensal', 'quinzenal') then
      select * into m from public.matriculas where id = new.matricula_id for share;
      -- Não nasce cobrança de período que começa depois da saída (serviço que não vai ser prestado).
      if found and m.saiu_em is not null and public.r_periodo_futuro(new, m.vencimento, m.saiu_em) then
        return null;
      end if;
    end if;
    return new;
  end if;
  if old.cancelamento_data is null and new.cancelamento_data is not null
     and new.cancelamento_motivo in ('Saiu do destino', 'Removido do destino', 'Conta excluída', 'Destino excluído') then
    select * into m from public.matriculas where id = old.matricula_id;
    if not found or m.saiu_em is null or not public.r_periodo_futuro(old, m.vencimento, m.saiu_em) then
      raise exception 'Esta cobrança é de uma viagem feita ou de um período que já começou: ela continua valendo depois da saída. Para cancelar, escreva o motivo com suas palavras.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists cobranca_regras_da_saida on public.cobrancas;
create trigger cobranca_regras_da_saida before insert or update on public.cobrancas
  for each row execute function public.cobranca_regras_da_saida();

-- Sair do destino: o cancelamento agora é o do gatilho (só períodos futuros). O resto não muda.
create or replace function public.sair_do_destino(matricula text) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  if exists (select 1 from public.viagens where destino_id = m.destino_id and data = public.hoje_em_brasilia() and fase <> 'encerrada') then
    raise exception 'A viagem de hoje deste destino está acontecendo. Espere ela terminar.';
  end if;
  perform set_config('vanzeiro.motivo_da_saida', 'Saiu do destino', true);
  update public.matriculas set saiu_em = public.hoje_em_brasilia() where id = matricula;
  perform set_config('vanzeiro.motivo_da_saida', '', true);
  update public.mudancas_endereco set situacao = 'cancelada', respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and situacao = 'aguardando';
end $$;

-- Excluir minha conta (passageiro): mesma anonimização de antes; o cancelamento agora é o do gatilho.
-- A parte do vanzeiro (exclusão em cascata) não muda aqui: é a Correção 5.
create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform set_config('vanzeiro.motivo_da_saida', 'Conta excluída', true);
  update public.matriculas
  set saiu_em = coalesce(saiu_em, public.hoje_em_brasilia()), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null
  where pessoa_id = auth.uid();
  perform set_config('vanzeiro.motivo_da_saida', '', true);
  update public.pedidos set nome = 'Conta excluída', endereco = null, ponto_lat = null, ponto_lng = null where pessoa_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;

-- Destino excluído: mesmos avisos de antes; as matrículas encerradas passam pelo gatilho com o motivo certo.
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
    perform set_config('vanzeiro.motivo_da_saida', 'Destino excluído', true);
    update public.matriculas set saiu_em = public.hoje_em_brasilia() where destino_id = new.id and saiu_em is null;
    perform set_config('vanzeiro.motivo_da_saida', '', true);
  end if;
  return null;
end $$;

-- Tarefa automática: igual à de supabase/migrations/20261116180000_w9_relogio.sql, menos o filtro do item 3a.
create or replace function public.tarefas_do_relogio(agora timestamptz default now()) returns void
language plpgsql security definer set search_path = '' as $$
declare
  hoje date := (agora at time zone 'America/Sao_Paulo')::date;
  d public.destinos;
  m public.matriculas;
  c record;
  dia date;
  prazo timestamptz;
  r record;
  alvo text;
  v date;
begin
  -- 1. Prazo passou (hoje e ontem): "Não vou" no prazo vira falta; com desconto, entra na próxima cobrança aberta.
  for d in select * from public.destinos where excluido_em is null loop
    foreach dia in array array[hoje - 1, hoje] loop
      continue when not public.tem_viagem_no_dia(d, dia);
      prazo := public.prazo_da_viagem(d, dia);
      continue when agora <= prazo;
      for m in select * from public.matriculas where destino_id = d.id and saiu_em is null and entrou_em <= dia loop
        select * into r from public.r_resposta(m.id, dia, prazo);
        continue when r.resposta is distinct from 'nao-vai';
        insert into public.faltas (matricula_id, data, avisou_no_prazo, avisou_em)
        values (m.id, dia, true, public.r_momento(r.em)) on conflict do nothing;
        continue when not found or not m.desconta_faltas or m.plano not in ('mensal', 'quinzenal');
        select id into alvo from public.cobrancas
         where matricula_id = m.id and tipo = m.plano and pagamento_data is null and cancelamento_data is null
           and vencimento > hoje and vencimento >= dia order by vencimento limit 1;
        if alvo is not null then
          update public.cobrancas set faltas = faltas + 1, valor_falta = coalesce(m.valor_falta, 0) where id = alvo;
        else
          select x into v from public.r_vencimentos(m.plano, m.vencimento,
                 case when m.plano = 'mensal' then dia else public.r_somar_meses(dia, -1, 1) end, dia + 45) x
           where x > hoje and x >= dia limit 1;
          if v is not null then perform public.r_nova_cobranca(m, v, hoje, 1); end if;
        end if;
        alvo := null;
      end loop;
    end loop;
  end loop;

  -- 2. Mensal e Quinzenal sem cobrança à frente de hoje: cria a próxima.
  for m in select x.* from public.matriculas x join public.destinos y on y.id = x.destino_id
            where x.saiu_em is null and y.excluido_em is null and x.plano in ('mensal', 'quinzenal')
              and not exists (select 1 from public.cobrancas k where k.matricula_id = x.id and k.tipo = x.plano
                               and k.cancelamento_data is null and k.vencimento > hoje) loop
    select x into v from public.r_vencimentos(m.plano, m.vencimento, hoje + 1, hoje + 45) x limit 1;
    if v is not null then perform public.r_nova_cobranca(m, v, hoje); end if;
  end loop;

  -- 3a. Cobrança vencida (para o vanzeiro) e vencendo em até 3 dias (para o passageiro).
  --     Correção 2 (20/11/2026): a dívida continua sendo lembrada ao vanzeiro depois que o passageiro sai do
  --     destino, é removido, exclui a conta ou o destino é excluído. O aviso "vencendo" ao passageiro não muda.
  for c in select k.*, x.pessoa_id, y.origem, y.destino as para_onde,
                  (x.saiu_em is not null or y.excluido_em is not null) as encerrada
             from public.cobrancas k
             join public.matriculas x on x.id = k.matricula_id join public.destinos y on y.id = k.destino_id
            where k.pagamento_data is null and k.cancelamento_data is null
              and k.vencimento <= hoje + 3 loop
    continue when c.encerrada and c.vencimento >= hoje;
    if c.vencimento < hoje then
      insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, cobranca_id, criado_em)
      values (gen_random_uuid()::text, c.vanzeiro_id, c.vanzeiro_id::text, 'cobranca_vencida',
              split_part(trim(c.nome), ' ', 1) || ' está devendo ' || public.r_reais(greatest(0, c.valor_base - c.faltas * c.valor_falta)) || ', em ' || c.origem || ' → ' || c.para_onde,
              'cobranca_vencida_' || c.id, c.destino_id, c.matricula_id, c.id, c.vencimento + 1)
      on conflict (para, chave) do nothing;
    else
      insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, cobranca_id, criado_em)
      values (gen_random_uuid()::text, c.vanzeiro_id, coalesce(c.pessoa_id::text, c.matricula_id), 'cobranca_vencendo',
              c.referencia || ' de ' || public.r_reais(greatest(0, c.valor_base - c.faltas * c.valor_falta)) || ' vence ' ||
              case when c.vencimento = hoje then 'hoje' else 'em ' || public.r_dia_mes(c.vencimento) end || ', em ' || c.origem || ' → ' || c.para_onde,
              'cobranca_vencendo_' || c.id, c.destino_id, c.matricula_id, c.id, hoje)
      on conflict (para, chave) do nothing;
    end if;
  end loop;

  -- 3b. Prazo chegando: 30 minutos antes, para quem ainda não respondeu (hoje e amanhã).
  for d in select * from public.destinos where excluido_em is null loop
    foreach dia in array array[hoje, hoje + 1] loop
      continue when not public.tem_viagem_no_dia(d, dia);
      continue when exists (select 1 from public.viagens w where w.destino_id = d.id and w.data = dia);
      prazo := public.prazo_da_viagem(d, dia);
      continue when not (prazo > agora and prazo <= agora + interval '30 minutes');
      for m in select * from public.matriculas where destino_id = d.id and saiu_em is null loop
        select * into r from public.r_resposta(m.id, dia, prazo);
        continue when r.resposta is not null;
        insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
        values (gen_random_uuid()::text, d.vanzeiro_id, coalesce(m.pessoa_id::text, m.id), 'prazo_chegando',
                'Responda até ' || to_char(prazo at time zone 'America/Sao_Paulo', 'HH24:MI') || ' se vai ' || public.r_quando(dia, hoje) || ', em ' || d.origem || ' → ' || d.destino,
                'prazo_' || m.id || '_' || dia, d.id, m.id, hoje)
        on conflict (para, chave) do nothing;
      end loop;
    end loop;
  end loop;
end $$;


revoke all on function public.r_inicio_do_periodo(public.cobrancas, integer) from public, anon, authenticated;
revoke all on function public.r_periodo_futuro(public.cobrancas, integer, date) from public, anon, authenticated;
revoke all on function public.r_cancelar_periodos_futuros(text, text, date) from public, anon, authenticated;
revoke all on function public.matricula_encerrada() from public, anon, authenticated;
revoke all on function public.cobranca_regras_da_saida() from public, anon, authenticated;
revoke all on function public.tarefas_do_relogio(timestamptz) from public, anon, authenticated;
revoke all on function public.sair_do_destino(text) from public, anon;
grant execute on function public.sair_do_destino(text) to authenticated;
revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
revoke all on function public.avisar_destino_excluido() from public, anon, authenticated;
