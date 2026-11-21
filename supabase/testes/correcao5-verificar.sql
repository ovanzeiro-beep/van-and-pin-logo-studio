-- CORREÇÃO 5 · CONFERÊNCIA depois de aplicar. SÓ LEITURA: pode rodar quantas vezes quiser.
-- Cada linha mostra o resultado e o esperado. Os md5 "dados_antes" são os do backup de 21/11/2026
-- (colunas novas da Correção 5 fora da conta). Se algum md5 de dados não bater, alguém usou o app depois do backup:
-- conferir o motivo antes de seguir (não é erro da Correção 5).
with esperado(t, h) as (values
 ('avisos','031bd9a107f2e9b54354a55d91e9f3b2'),('cobrancas','8a08dbc63676dd4817b4f611b0fe6dc5'),('contas','a67be828c7242a87aa13544ef251e832'),
 ('destinos','0a1063f816646daf03603773e4c3dbf7'),('matriculas','64b7ea5688ec606c19a65a9a67773152'),('perfis_vanzeiro','6fbc88de50064e41e4a89d74cd1955e2'),
 ('viagens','e75c335a6a519f37a1d76942c92205d7'),('pedidos','5e65dfe81e680a3ca7378cc4ba06cf54'),('embarques','c4abccec35eb7f89c14beb7991748712')),
atual(t, h) as (
 select 'avisos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.avisos x
 union all select 'cobrancas', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.cobrancas x
 union all select 'contas', md5(coalesce(string_agg((to_jsonb(x) - 'excluida_em')::text, E'\n' order by (to_jsonb(x) - 'excluida_em')::text),'')) from public.contas x
 union all select 'destinos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.destinos x
 union all select 'matriculas', md5(coalesce(string_agg((to_jsonb(x) - 'conta_excluida_em')::text, E'\n' order by (to_jsonb(x) - 'conta_excluida_em')::text),'')) from public.matriculas x
 union all select 'perfis_vanzeiro', md5(coalesce(string_agg((to_jsonb(x) - 'saiu_do_app_em')::text, E'\n' order by (to_jsonb(x) - 'saiu_do_app_em')::text),'')) from public.perfis_vanzeiro x
 union all select 'viagens', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.viagens x
 union all select 'pedidos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.pedidos x
 union all select 'embarques', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.embarques x)
select * from (
 select 1 o, 'funções novas da Correção 5' item, (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in
   ('informar_acerto','encerrar_finalidade_dos_contatos','aviso_so_para_conta_ativa','r_em_aberto_sem_acerto','tenho_valor_em_aberto_com'))::text resultado, '5' esperado
 union all select 2, 'gatilho de avisos ligado', (select count(*) from pg_trigger where tgname='avisos_so_para_conta_ativa' and tgenabled='O')::text, '1'
 union all select 3, 'tarefa de fim de finalidade agendada', (select count(*) from cron.job where jobname='encerrar-finalidade-dos-contatos' and active)::text, '1'
 union all select 4, 'tabelas novas (acertos, regras de guarda)', (select count(*) from pg_class where relnamespace='public'::regnamespace and relname in ('acertos_informados','regras_de_guarda') and relrowsecurity)::text, '2'
 union all select 5, 'prazo legal (vazio até o advogado)', (select coalesce(meses::text,'vazio') from public.regras_de_guarda where chave='contatos_de_cobranca_em_aberto'), 'vazio'
 union all select 6, 'login → conta sem cascata', (select count(*) from pg_constraint where conname='contas_id_fkey')::text, '0'
 union all select 7, 'histórico com cascata a partir de contas', (select count(*) from pg_constraint where contype='f' and confdeltype='c' and confrelid='public.contas'::regclass
     and conrelid::regclass::text in ('destinos','matriculas','viagens','cobrancas','pedidos','perfis_vanzeiro'))::text, '0'
 union all select 8, 'funções internas chamáveis pelo app', (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in
     ('encerrar_finalidade_dos_contatos','aviso_so_para_conta_ativa','r_em_aberto_sem_acerto') and has_function_privilege('authenticated', oid, 'execute'))::text, '0'
 union all select 9, 'funções chamáveis sem login', (select count(*) from pg_proc p where pronamespace='public'::regnamespace and has_function_privilege('anon', oid, 'execute')
     and not exists (select 1 from pg_depend d where d.objid=p.oid and d.deptype='e'))::text, '0'
 union all select 10, 'proteção "cobrança nunca editada" ligada', (select count(*) from pg_trigger where tgname='cobranca_sem_edicao' and tgenabled='O')::text, '1'
 union all select 11, 'funções das Correções 1 a 3', (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in ('r_textos_da_resposta','r_textos_do_periodo','r_quando_vai','r_primeiro_nome',
     'r_cancelar_periodos_futuros','r_periodo_futuro','r_inicio_do_periodo','matricula_encerrada','cobranca_regras_da_saida','r_cobranca_do_embarque','embarque_gera_cobranca','viagem_registra_embarques'))::text, '12'
 union all select 12, 'contas de login', (select count(*) from auth.users)::text, '7'
 union all select 13, 'contas marcadas como excluídas', (select count(*) from public.contas where excluida_em is not null)::text, '0'
 union all select 14, 'avisos duplicados', (select count(*) from (select 1 from public.avisos group by para, chave having count(*) > 1) x)::text, '0'
 union all select 20 + row_number() over (order by e.t), 'dados iguais ao backup: ' || e.t, case when a.h = e.h then 'igual' else 'DIFERENTE' end, 'igual'
   from esperado e join atual a using (t)
) s order by o;
