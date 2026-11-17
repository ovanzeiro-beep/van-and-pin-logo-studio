-- REV-01 / G6: apaga a tabela de cidades, que o app nunca usou. Cole no SQL Editor do Supabase e clique em Run.
drop trigger if exists cidade_sem_conferir on public.cidades;
drop table if exists public.cidades;
drop function if exists public.cidade_nova_sem_conferir();
select count(*) as cidades_que_sobraram from information_schema.tables where table_schema = 'public' and table_name = 'cidades';
