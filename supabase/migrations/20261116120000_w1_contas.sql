-- O Vanzeiro — W1: contas (docs/banco-de-dados.md, seções 2.1 e 7, regra 1).
-- Cole tudo no SQL Editor do Supabase e clique em Run. Pode rodar de novo sem estragar nada.

-- Uma linha por pessoa, ligada ao login do Supabase (auth.users).
create table if not exists public.contas (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  -- Aceite dos Termos de Uso e da Política de Privacidade (LGPD). Obrigatório no cadastro por e-mail;
  -- no Google, o app grava logo depois de voltar do Google (W1b).
  aceite_termos_em timestamptz,
  -- Papéis da mesma conta (decisão do dono, 16/11/2026): vanzeiro, passageiro ou os dois.
  e_vanzeiro boolean not null default false,
  e_passageiro boolean not null default false,
  -- O último painel usado abre primeiro.
  ultimo_papel text check (ultimo_papel in ('vanzeiro', 'passageiro')),
  criada_em timestamptz not null default now()
);

-- Regra 1: cada pessoa só vê e muda a própria conta.
alter table public.contas enable row level security;

drop policy if exists "conta: ver a minha" on public.contas;
create policy "conta: ver a minha" on public.contas
  for select to authenticated using (id = auth.uid());

drop policy if exists "conta: mudar a minha" on public.contas;
create policy "conta: mudar a minha" on public.contas
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- A conta nasce sozinha quando a pessoa se cadastra (e-mail ou Google), com o nome e o aceite.
-- Cadastro por e-mail sem aceite é recusado.
create or replace function public.criar_conta_do_login()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  aceite timestamptz := nullif(new.raw_user_meta_data ->> 'aceite_termos_em', '')::timestamptz;
begin
  if aceite is null and coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email' then
    raise exception 'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';
  end if;
  insert into public.contas (id, nome, aceite_termos_em)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    aceite
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_login on auth.users;
create trigger ao_criar_login
  after insert on auth.users
  for each row execute function public.criar_conta_do_login();

-- "Sou vanzeiro" / "Sou passageiro": marca o papel e guarda como o último usado.
create or replace function public.escolher_papel(papel text)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.contas
  set ultimo_papel = papel,
      e_vanzeiro = e_vanzeiro or papel = 'vanzeiro',
      e_passageiro = e_passageiro or papel = 'passageiro'
  where id = auth.uid() and papel in ('vanzeiro', 'passageiro');
$$;

grant execute on function public.escolher_papel(text) to authenticated;

-- "Excluir minha conta" (LGPD, regra 20): a própria pessoa apaga o login e a conta.
-- Os registros que a lei manda guardar (cobranças pagas ou devendo) entram na W7, sem dados pessoais.
create or replace function public.excluir_minha_conta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
