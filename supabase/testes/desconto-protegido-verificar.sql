-- SOMENTE LEITURA. Executar após autorização e implantação do SQL preparado.
select 'gatilho adicional ativo' as verificacao, exists (
  select 1 from pg_trigger where tgrelid='public.cobrancas'::regclass
    and tgname='cobranca_a_desconto_do_banco' and tgenabled='O' and not tgisinternal
) as ok
union all
select 'proteção C5 mantida', exists (
  select 1 from pg_trigger where tgrelid='public.cobrancas'::regclass
    and tgname='cobranca_sem_edicao' and tgenabled='O'
)
union all
select 'gatilho não privilegiado e busca restrita', exists (
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='cobranca_desconto_do_banco'
    and not p.prosecdef and array_to_string(p.proconfig,',') like '%search_path=""%'
)
union all
select 'função fechada para clientes', coalesce((
  select not has_function_privilege('authenticated',p.oid,'execute')
     and not has_function_privilege('anon',p.oid,'execute')
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='cobranca_desconto_do_banco'
), false);

-- Comparar antes/depois: o arquivo de implantação não deve alterar nenhuma linha.
select count(*) as cobrancas,
       md5(coalesce(jsonb_agg(to_jsonb(k) order by id)::text,'')) as impressao_digital
from public.cobrancas k;