-- Tempo real: quando um celular muda algo, o banco avisa os outros na hora (Supabase Realtime).
-- Cada pessoa só recebe o aviso das linhas que ela já pode ler (as mesmas regras de acesso).

-- O passageiro não lê a viagem inteira (tem os outros passageiros): ele recebe só um "sinal" de que a viagem
-- do destino dele mudou, e então lê a própria situação (minha_viagem_de_hoje).
create table if not exists public.viagem_sinais (
  destino_id text primary key,
  mudou_em timestamptz not null default now()
);
alter table public.viagem_sinais enable row level security;
drop policy if exists "sinal: quem é do destino" on public.viagem_sinais;
create policy "sinal: quem é do destino" on public.viagem_sinais for select to authenticated
  using (public.sou_vanzeiro_do_destino(destino_id) or public.estou_no_destino(destino_id));

create or replace function public.sinal_da_viagem() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.viagem_sinais (destino_id, mudou_em) values (new.destino_id, now())
  on conflict (destino_id) do update set mudou_em = now();
  return null;
end $$;
revoke all on function public.sinal_da_viagem() from public, anon, authenticated;
create or replace trigger sinal_da_viagem after insert or update on public.viagens
  for each row execute function public.sinal_da_viagem();

do $$
declare t text;
begin
  foreach t in array array['destinos','dias_sem_viagem','matriculas','pedidos','mudancas_endereco','respostas','vou_sempre',
                           'nao_vou_periodos','viagens','viagem_sinais','embarques','cobrancas','avisos','perfis_vanzeiro'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
