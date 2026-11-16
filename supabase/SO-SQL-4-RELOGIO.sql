-- W9: o que depende do relógio, feito pelo banco a cada 5 minutos, mesmo com o app fechado.
-- As mesmas regras do app (src/lib/cobrancas.ts, src/lib/avisos.ts, src/lib/viagem-store.ts), com os mesmos
-- identificadores: se o app já fez, o banco não repete (e o contrário também).
--  1. Prazo passou: quem avisou "Não vou" no prazo ganha a falta (e o desconto, se o plano tiver).
--  2. Mensal e Quinzenal: quando uma cobrança vence, a próxima é criada (uma à frente de hoje, nunca duas).
--  3. Avisos: prazo chegando (30 min antes, para quem não respondeu), cobrança vencendo (3 dias antes, para o
--     passageiro) e cobrança vencida (para o vanzeiro).

-- ---------- datas e textos (iguais aos do app) ----------
create or replace function public.r_dia_do_mes(a int, m int, dia int) returns date
language sql immutable set search_path = '' as $$
  select make_date(a, m, least(dia, extract(day from (make_date(a, m, 1) + interval '1 month - 1 day'))::int))
$$;

create or replace function public.r_somar_meses(v date, meses int, dia int) returns date
language sql immutable set search_path = '' as $$
  select public.r_dia_do_mes(extract(year from x)::int, extract(month from x)::int, dia)
  from (select (date_trunc('month', v) + make_interval(months => meses))::date as x) t
$$;

-- Vencimentos de um plano Mensal ou Quinzenal entre duas datas.
create or replace function public.r_vencimentos(plano text, dia int, desde date, ate date) returns setof date
language sql immutable set search_path = '' as $$
  select distinct v from (
    select public.r_somar_meses(desde, i, case when plano = 'mensal' then dia when dia <= 15 then dia else dia - 15 end) as v
      from generate_series(0, 3) i
    union all
    select public.r_somar_meses(desde, i, case when dia <= 15 then dia + 15 else dia end)
      from generate_series(0, 3) i where plano = 'quinzenal'
  ) t where v between desde and ate order by v
$$;

create or replace function public.r_quinzena_anterior(dia int, v date) returns date
language sql immutable set search_path = '' as $$
  select coalesce(max(x), v - 15) from public.r_vencimentos('quinzenal', dia, v - 40, v - 1) x
$$;

create or replace function public.r_dia_mes(v date) returns text
language sql immutable set search_path = '' as $$ select to_char(v, 'DD/MM') $$;

create or replace function public.r_referencia(plano text, v date, dia int) returns text
language sql immutable set search_path = '' as $$
  select case plano
    when 'mensal' then 'Mensalidade de ' || (array['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'])[extract(month from v)::int]
    else 'Quinzena de ' || public.r_dia_mes(public.r_quinzena_anterior(dia, v) + 1) || ' a ' || public.r_dia_mes(v)
  end
$$;

-- 28050 → "R$ 280,50" (com o mesmo espaço que o app usa).
create or replace function public.r_reais(centavos int) returns text
language sql immutable set search_path = '' as $$
  select 'R$' || chr(160) || translate(to_char(centavos / 100.0, 'FM999,999,990.00'), ',.', '.,')
$$;

-- "hoje" ou "sáb, 28 de nov".
create or replace function public.r_quando(dia date, hoje date) returns text
language sql immutable set search_path = '' as $$
  select case when dia = hoje then 'hoje' else
    (array['dom','seg','ter','qua','qui','sex','sáb'])[extract(dow from dia)::int + 1] || ', ' || extract(day from dia)::int || ' de ' ||
    (array['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'])[extract(month from dia)::int] end
$$;

create or replace function public.r_momento(t timestamptz) returns text
language sql immutable set search_path = '' as $$ select to_char(t at time zone 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI') $$;

-- A resposta que vale para a pessoa no dia: a do dia; senão "Não vou de… até…"; senão "Vou sempre" (cada uma só se
-- foi escolhida antes do prazo e não foi tirada antes dele). Devolve também quando foi dada.
create or replace function public.r_resposta(m text, dia date, prazo timestamptz, out resposta text, out em timestamptz)
language plpgsql stable set search_path = '' as $$
begin
  select r.resposta, r.respondida_em into resposta, em from public.respostas r where r.matricula_id = m and r.data = dia;
  if found then return; end if;
  select 'nao-vai', n.em into resposta, em from public.nao_vou_periodos n
   where n.matricula_id = m and dia between n.de and n.ate and n.em <= prazo and (n.tirado_em is null or n.tirado_em > prazo)
   order by n.em limit 1;
  if found then return; end if;
  select 'vai', s.desde into resposta, em from public.vou_sempre s
   where s.matricula_id = m and s.desde <= prazo and (s.ate is null or s.ate > prazo) order by s.desde limit 1;
end $$;

-- A cobrança Mensal/Quinzenal com vencimento v, já com as faltas no prazo do período até hoje (como o app).
create or replace function public.r_nova_cobranca(m public.matriculas, v date, hoje date, minimo_faltas int default 0) returns void
language plpgsql set search_path = '' as $$
declare
  de date;
  n int := 0;
begin
  if m.desconta_faltas then
    de := case when m.plano = 'mensal' then public.r_somar_meses(v, -1, m.vencimento) + 1 else public.r_quinzena_anterior(m.vencimento, v) + 1 end;
    select count(distinct f.data) into n from public.faltas f
     where f.matricula_id = m.id and f.avisou_no_prazo and f.data between de and least(v, hoje);
  end if;
  -- Criada por causa de uma falta: tem pelo menos essa (como o app).
  n := greatest(n, minimo_faltas);
  insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento,
                                valor_base, faltas, valor_falta, periodo_de, periodo_ate)
  values (m.id || '_' || v, m.vanzeiro_id, m.id, m.destino_id, m.nome, m.telefone, m.plano, public.r_referencia(m.plano, v, m.vencimento), v,
          m.valor, n, case when n > 0 then coalesce(m.valor_falta, 0) else 0 end, case when m.desconta_faltas then de end, case when m.desconta_faltas then v end)
  on conflict (id) do nothing;
end $$;

-- ---------- a tarefa ----------
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

-- Só o banco roda (ninguém pelo app).
do $$
declare f text;
begin
  foreach f in array array['r_dia_do_mes(int,int,int)','r_somar_meses(date,int,int)','r_vencimentos(text,int,date,date)','r_quinzena_anterior(int,date)',
    'r_dia_mes(date)','r_referencia(text,date,int)','r_reais(int)','r_quando(date,date)','r_momento(timestamptz)','r_resposta(text,date,timestamptz)',
    'r_nova_cobranca(public.matriculas,date,date,int)','tarefas_do_relogio(timestamptz)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;
-- W9: roda a tarefa do relógio a cada 5 minutos (pg_cron, do próprio Supabase).
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'tarefas-do-relogio';
select cron.schedule('tarefas-do-relogio', '*/5 * * * *', 'select public.tarefas_do_relogio()');
