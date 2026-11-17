-- G6: a tabela de cidades nunca foi usada pelo app (as cidades vêm do mapa). Sai, com a regra dela.
drop trigger if exists cidade_sem_conferir on public.cidades;
drop table if exists public.cidades;
drop function if exists public.cidade_nova_sem_conferir();
-- G4 (parte do banco): a função que cria a conta no cadastro só roda pelo próprio banco, nunca pelo app.
revoke all on function public.criar_conta_do_login() from public, anon, authenticated;
