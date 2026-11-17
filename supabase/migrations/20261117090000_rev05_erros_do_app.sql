-- REV-05: os erros que acontecem nos celulares ficam guardados para a equipe ver e corrigir.
-- Só o texto do erro (sem e-mail nem números longos, apagados pelo app), a tela, o papel e o navegador.
-- Qualquer celular grava (até antes de entrar na conta); ninguém lê pelo app (só quem cuida do banco).
create table if not exists public.erros_do_app (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  conta_id uuid default auth.uid(),
  papel text check (papel in ('vanzeiro', 'passageiro')),
  tela text not null check (length(tela) <= 200),
  mensagem text not null check (length(mensagem) between 1 and 2000),
  detalhe text check (length(detalhe) <= 4000),
  navegador text check (length(navegador) <= 300)
);
alter table public.erros_do_app enable row level security;
drop policy if exists "erros: qualquer celular grava" on public.erros_do_app;
create policy "erros: qualquer celular grava" on public.erros_do_app for insert to anon, authenticated
  with check (conta_id is null or conta_id = (select auth.uid()));
revoke all on public.erros_do_app from anon, authenticated;
grant insert (papel, tela, mensagem, detalhe, navegador) on public.erros_do_app to anon, authenticated;
create index if not exists erros_do_app_criado_em_idx on public.erros_do_app (criado_em desc);
