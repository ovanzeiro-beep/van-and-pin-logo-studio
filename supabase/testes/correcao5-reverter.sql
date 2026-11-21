-- REVERTER a Correção 5 (só se o dono autorizar). Volta as regras de antes; não apaga dados.
-- Atenção: contas que já foram excluídas com a Correção 5 ficam como registro "Conta excluída" sem login; por isso a
-- ligação login → conta volta como NOT VALID (vale para contas novas, não exige que as antigas tenham login).
alter table public.perfis_vanzeiro drop constraint if exists perfis_vanzeiro_id_fkey,
  add constraint perfis_vanzeiro_id_fkey foreign key (id) references public.contas(id) on delete cascade;
alter table public.destinos drop constraint if exists destinos_vanzeiro_id_fkey,
  add constraint destinos_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id) on delete cascade;
alter table public.matriculas drop constraint if exists matriculas_vanzeiro_id_fkey,
  add constraint matriculas_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id) on delete cascade;
alter table public.viagens drop constraint if exists viagens_vanzeiro_id_fkey,
  add constraint viagens_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id) on delete cascade;
alter table public.cobrancas drop constraint if exists cobrancas_vanzeiro_id_fkey,
  add constraint cobrancas_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id) on delete cascade;
alter table public.pedidos drop constraint if exists pedidos_vanzeiro_id_fkey,
  add constraint pedidos_vanzeiro_id_fkey foreign key (vanzeiro_id) references public.contas(id) on delete cascade;
alter table public.contas drop constraint if exists contas_id_fkey;
alter table public.contas add constraint contas_id_fkey foreign key (id) references auth.users(id) on delete cascade not valid;

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
