-- CORREÇÃO 5 · CONFERÊNCIA ANTES de colar. SÓ LEITURA. Tudo precisa dar "igual"/esperado.
-- Se algum dado der DIFERENTE, alguém usou o app depois do backup de 21/11/2026: fazer um backup novo antes.
with esperado(t, h) as (values
 ('avisos','031bd9a107f2e9b54354a55d91e9f3b2'),('cobrancas','8a08dbc63676dd4817b4f611b0fe6dc5'),('contas','a67be828c7242a87aa13544ef251e832'),
 ('destinos','0a1063f816646daf03603773e4c3dbf7'),('matriculas','64b7ea5688ec606c19a65a9a67773152'),('perfis_vanzeiro','6fbc88de50064e41e4a89d74cd1955e2'),
 ('viagens','e75c335a6a519f37a1d76942c92205d7'),('pedidos','5e65dfe81e680a3ca7378cc4ba06cf54'),('embarques','c4abccec35eb7f89c14beb7991748712')),
atual(t, h) as (
 select 'avisos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.avisos x
 union all select 'cobrancas', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.cobrancas x
 union all select 'contas', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.contas x
 union all select 'destinos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.destinos x
 union all select 'matriculas', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.matriculas x
 union all select 'perfis_vanzeiro', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.perfis_vanzeiro x
 union all select 'viagens', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.viagens x
 union all select 'pedidos', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.pedidos x
 union all select 'embarques', md5(coalesce(string_agg(to_jsonb(x)::text, E'\n' order by to_jsonb(x)::text),'')) from public.embarques x)
select * from (
 select 1 o, 'Correção 5 ainda não aplicada' item, (select count(*) from pg_class where relnamespace='public'::regnamespace and relname='acertos_informados')::text resultado, '0' esperado
 union all select 2, 'contas de login', (select count(*) from auth.users)::text, '7'
 union all select 3, 'viagem acontecendo agora (aplicar fora do horário da van)', (select count(*) from public.viagens where data = (now() at time zone 'America/Sao_Paulo')::date and fase <> 'encerrada')::text, '0'
 union all select 4, 'proteção "cobrança nunca editada" ligada', (select count(*) from pg_trigger where tgname='cobranca_sem_edicao' and tgenabled='O')::text, '1'
 union all select 10 + row_number() over (order by e.t), 'dados iguais ao backup: ' || e.t, case when a.h = e.h then 'igual' else 'DIFERENTE' end, 'igual'
   from esperado e join atual a using (t)
) s order by o;
