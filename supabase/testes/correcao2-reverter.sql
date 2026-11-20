-- REVERSÃO da Correção 2 (supabase/migrations/20261120130000_correcao2_cobrancas_preservadas.sql).

-- Só com autorização do dono. Volta as funções às versões anteriores e tira os dois gatilhos novos.

-- Não mexe em dados: cobranças que a Correção 2 preservou continuam como estão.

begin;

drop trigger if exists matricula_encerrada on public.matriculas;

drop trigger if exists cobranca_regras_da_saida on public.cobrancas;

create or replace function public.sair_do_destino(matricula text) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  if exists (select 1 from public.viagens where destino_id = m.destino_id and data = public.hoje_em_brasilia() and fase <> 'encerrada') then
    raise exception 'A viagem de hoje deste destino está acontecendo. Espere ela terminar.';
  end if;
  update public.matriculas set saiu_em = public.hoje_em_brasilia() where id = matricula;
  update public.cobrancas set cancelamento_data = public.hoje_em_brasilia(), cancelamento_motivo = 'Saiu do destino'
    where matricula_id = matricula and pagamento_data is null and cancelamento_data is null and vencimento >= public.hoje_em_brasilia();
  update public.mudancas_endereco set situacao = 'cancelada', respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and situacao = 'aguardando';
end $$;

create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.matriculas
  set saiu_em = coalesce(saiu_em, public.hoje_em_brasilia()), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null
  where pessoa_id = auth.uid();
  update public.cobrancas set cancelamento_data = public.hoje_em_brasilia(), cancelamento_motivo = 'Conta excluída'
  where matricula_id in (select id from public.matriculas where pessoa_id = auth.uid())
    and pagamento_data is null and cancelamento_data is null and vencimento >= public.hoje_em_brasilia();
  update public.pedidos set nome = 'Conta excluída', endereco = null, ponto_lat = null, ponto_lng = null where pessoa_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;

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
  for c in select k.*, x.pessoa_id, y.origem, y.destino as para_onde from public.cobrancas k
             join public.matriculas x on x.id = k.matricula_id join public.destinos y on y.id = k.destino_id
            where k.pagamento_data is null and k.cancelamento_data is null and x.saiu_em is null and y.excluido_em is null
              and k.vencimento <= hoje + 3 loop
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

revoke all on function public.sair_do_destino(text) from public, anon;

grant execute on function public.sair_do_destino(text) to authenticated;

revoke all on function public.excluir_minha_conta() from public, anon;

grant execute on function public.excluir_minha_conta() to authenticated;

revoke all on function public.avisar_destino_excluido() from public, anon, authenticated;

revoke all on function public.tarefas_do_relogio(timestamptz) from public, anon, authenticated;

-- As funções novas da correção, que ficam sem uso depois de tirar os gatilhos.
drop function if exists public.cobranca_regras_da_saida();
drop function if exists public.matricula_encerrada();
drop function if exists public.r_cancelar_periodos_futuros(text, text, date);
drop function if exists public.r_periodo_futuro(public.cobrancas, integer, date);
drop function if exists public.r_inicio_do_periodo(public.cobrancas, integer);

commit;
