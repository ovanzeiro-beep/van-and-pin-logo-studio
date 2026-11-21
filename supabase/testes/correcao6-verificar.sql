-- CORREÇÃO 6 · CONFERÊNCIA (antes e depois de colar). SÓ LEITURA: pode rodar quantas vezes quiser.
-- Antes de colar: item 1 = 0 e itens 2 a 15 sem sentido ainda. Depois de colar: todos iguais ao esperado.
-- As impressões digitais (md5) dos dados (itens 20+) precisam ser IGUAIS antes e depois: a Correção 6 só troca o código.
select * from (
 select 1 o, 'Correção 6 aplicada (registro de tentativas existe)' item,
   (select count(*) from pg_class where relnamespace='public'::regnamespace and relname='tentativas_de_convite' and relrowsecurity)::text resultado, '1' esperado
 union all select 2, 'funções novas', (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in
   ('r_codigo_do_convite','gerar_convite','destino_convite_do_servidor','r_convite_liberado','r_anotar_tentativa'))::text, '5'
 union all select 3, 'gatilho "o banco escolhe o código" ligado', (select count(*) from pg_trigger where tgname='destino_convite_do_servidor' and tgenabled='O')::text, '1'
 union all select 4, 'destinos não excluídos ainda com código antigo',
   (select count(*) from public.destinos where excluido_em is null and convite !~ '^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$')::text, '0'
 union all select 5, 'destinos não excluídos (os 2 ativos)', (select count(*) from public.destinos where excluido_em is null)::text, '2'
 union all select 6, 'códigos repetidos', (select count(*) from (select 1 from public.destinos group by upper(convite) having count(*) > 1) x)::text, '0'
 union all select 7, 'funções de juntar pelo telefone abertas ao app', (select count(*) from pg_proc where pronamespace='public'::regnamespace
   and proname in ('pedir_juntar_pelo_telefone','confirmar_juntar_conta') and (has_function_privilege('authenticated', oid, 'execute') or has_function_privilege('anon', oid, 'execute')))::text, '0'
 union all select 8, 'funções internas abertas ao app', (select count(*) from pg_proc where pronamespace='public'::regnamespace
   and proname in ('r_codigo_do_convite','destino_convite_do_servidor','r_convite_liberado','r_anotar_tentativa') and has_function_privilege('authenticated', oid, 'execute'))::text, '0'
 union all select 9, 'funções chamáveis sem login', (select count(*) from pg_proc p where pronamespace='public'::regnamespace and has_function_privilege('anon', oid, 'execute')
   and not exists (select 1 from pg_depend d where d.objid=p.oid and d.deptype='e'))::text, '0'
 union all select 10, 'consultar convite e pedir para entrar: só com login', (select count(*) from pg_proc where pronamespace='public'::regnamespace
   and proname in ('destino_pelo_convite','pedir_para_entrar') and has_function_privilege('authenticated', oid, 'execute') and not has_function_privilege('anon', oid, 'execute'))::text, '2'
 union all select 11, 'tentativas registradas agora', (case when to_regclass('public.tentativas_de_convite') is null then 'não existe ainda' else (xpath('/row/n/text()', query_to_xml('select count(*) as n from public.tentativas_de_convite', false, true, '')))[1]::text end), '0 logo depois de colar'
 union all select 13, '"Ligar ao cadastro" só com código: funções novas', (select count(*) from pg_proc where pronamespace='public'::regnamespace
   and proname in ('pedir_confirmacao_do_cadastro','confirmar_cadastro_com_codigo') and has_function_privilege('authenticated', oid, 'execute') and not has_function_privilege('anon', oid, 'execute'))::text, '2'
 union all select 14, 'ligar direto (sem código) aberto ao app', (select count(*) from pg_proc where pronamespace='public'::regnamespace
   and proname = 'ligar_pedido_ao_cadastro' and has_function_privilege('authenticated', oid, 'execute'))::text, '0'
 union all select 15, 'tabela de códigos fechada ao app', (select count(*) from pg_class where relnamespace='public'::regnamespace and relname='confirmacoes_de_cadastro'
   and relrowsecurity and not has_table_privilege('authenticated', oid, 'select'))::text, '1'
 union all select 12, 'contas de login', (select count(*) from auth.users)::text, 'igual a antes'
 union all select 20, 'dados: destinos (sem o código)', (select md5(coalesce(string_agg((to_jsonb(x) - 'convite')::text, '|' order by x.id), '')) from public.destinos x), 'igual a antes'
 union all select 21, 'dados: matrículas', (select md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.matriculas x), 'igual a antes'
 union all select 22, 'dados: pedidos', (select md5(coalesce(string_agg((to_jsonb(x) - 'confirmacao_pedida_em')::text, '|' order by x.id), '')) from public.pedidos x), 'igual a antes'
 union all select 23, 'dados: cobranças', (select md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.cobrancas x), 'igual a antes'
 union all select 24, 'dados: juntar_conta (preservado)', (select md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by to_jsonb(x)::text), '')) from public.juntar_conta x), 'igual a antes'
 union all select 25, 'dados: contas', (select md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.contas x), 'igual a antes'
) s order by o;
