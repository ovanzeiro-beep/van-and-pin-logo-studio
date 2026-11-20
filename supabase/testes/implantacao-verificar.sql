-- VERIFICAÇÃO depois de implantar as Correções 1 a 3 no Supabase. SÓ LEITURA: pode rodar quantas vezes quiser.
-- Troque o horário em `marco` pelo momento da implantação (UTC).
with marco as (select timestamptz '2026-11-20 00:00:00+00' as t)
select item, resultado, esperado from (
  -- 1. Estrutura: as funções e os gatilhos das correções estão no lugar
  select 1 as ordem, 'funções das correções' as item,
         (select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname in
           ('r_textos_da_resposta','r_textos_do_periodo','r_quando_vai','r_primeiro_nome',
            'r_cancelar_periodos_futuros','r_periodo_futuro','r_inicio_do_periodo','matricula_encerrada','cobranca_regras_da_saida',
            'r_cobranca_do_embarque','embarque_gera_cobranca','viagem_registra_embarques'))::text as resultado, '12' as esperado
  union all
  select 2, 'gatilhos das correções',
         (select count(*) from pg_trigger where not tgisinternal and tgname in
           ('matricula_encerrada','cobranca_regras_da_saida','embarque_gera_cobranca','viagem_registra_embarques'))::text, '4'
  union all
  select 3, 'funções internas chamáveis pelo app (deve ser 0)',
         (select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname like 'r\_%'
            and has_function_privilege('authenticated', oid, 'execute'))::text, '0'
  union all
  -- 2. Erros vindos dos celulares depois da implantação
  select 4, 'erros do app desde a implantação',
         (select count(*) from public.erros_do_app, marco where criado_em >= marco.t)::text, '0 (ver a lista abaixo se não for)'
  union all
  -- 3. Tarefas automáticas e envio de notificações
  select 5, 'tarefas automáticas com falha desde a implantação',
         (select count(*) from cron.job_run_details, marco where status <> 'succeeded' and start_time >= marco.t)::text, '0'
  union all
  select 6, 'envios de notificação com falha desde a implantação',
         (select count(*) from net._http_response, marco where created >= marco.t and (status_code is null or status_code >= 400))::text, '0'
  union all
  -- 4. Correção 3: ninguém embarcado sem cobrança (Por viagem e Diário) em viagens novas
  select 7, 'embarcados sem cobrança em viagens desde a implantação',
         (select count(*) from public.viagens v cross join lateral jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]')) x(mid)
            join public.matriculas m on m.id = x.mid and m.plano in ('viagem','diario'), marco
          where v.comecou_em >= marco.t
            and not exists (select 1 from public.cobrancas k where k.matricula_id = x.mid
                            and k.id in (x.mid || '_' || v.id, x.mid || '_' || v.data::text)))::text, '0'
  union all
  -- 5. Correção 2: cancelamentos automáticos depois da implantação só de período futuro (Mensal/Quinzenal)
  select 8, 'cancelamentos automáticos de viagem feita ou período iniciado',
         (select count(*) from public.cobrancas k join public.matriculas m on m.id = k.matricula_id, marco
          where k.cancelamento_data >= marco.t::date
            and k.cancelamento_motivo in ('Saiu do destino','Removido do destino','Conta excluída','Destino excluído')
            and not public.r_periodo_futuro(k, m.vencimento, coalesce(m.saiu_em, k.cancelamento_data)))::text, '0'
  union all
  -- 6. Avisos: nada duplicado
  select 9, 'avisos duplicados', (select count(*) from (select 1 from public.avisos group by para, chave having count(*) > 1) x)::text, '0'
) s order by ordem;

-- Lista dos erros do app desde a implantação (só texto do erro, tela e data; sem dados pessoais):
-- select criado_em, tela, mensagem from public.erros_do_app where criado_em >= '2026-11-20' order by criado_em desc limit 50;
