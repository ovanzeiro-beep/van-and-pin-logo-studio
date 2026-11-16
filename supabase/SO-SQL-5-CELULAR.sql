-- W10: avisos na tela do celular (notificação "push"), mesmo com o app fechado.
-- Cada celular que ativou as notificações guarda aqui o endereço de entrega dele (celulares).
-- Quando nasce um aviso (ou um pedido para entrar), o banco chama a função "avisos-no-celular" do Supabase,
-- que entrega a notificação nos celulares da pessoa. As chaves das notificações são criadas pela própria função
-- e ficam numa tabela que ninguém lê pelo app.

alter table public.avisos add column if not exists enviado_em timestamptz;
update public.avisos set enviado_em = now() where enviado_em is null;
alter table public.pedidos add column if not exists avisado_em timestamptz;
update public.pedidos set avisado_em = now() where avisado_em is null;

create table if not exists public.chaves_push (
  id int primary key default 1 check (id = 1),
  publica text not null,
  privada text not null
);
alter table public.chaves_push enable row level security;
revoke all on public.chaves_push from anon, authenticated;

-- Um celular é de uma conta só: quem entra nele por último passa a receber.
create or replace function public.guardar_celular(endereco jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta de novo.'; end if;
  if coalesce(endereco ->> 'endpoint', '') !~ '^https://' then raise exception 'Este celular não aceita notificações.'; end if;
  delete from public.celulares where celulares.endereco ->> 'endpoint' = guardar_celular.endereco ->> 'endpoint';
  insert into public.celulares (conta_id, endereco) values (auth.uid(), guardar_celular.endereco);
end $$;
revoke all on function public.guardar_celular(jsonb) from public, anon;
grant execute on function public.guardar_celular(jsonb) to authenticated;

-- Chama a entrega (sem nunca atrapalhar quem criou o aviso).
create extension if not exists pg_net;
create or replace function public.chamar_entrega() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  begin
    perform net.http_post(url := 'https://rnziztwicggdekmpwpgy.supabase.co/functions/v1/avisos-no-celular',
                          body := '{}'::jsonb, headers := '{"Content-Type": "application/json"}'::jsonb);
  exception when others then null;
  end;
  return null;
end $$;
revoke all on function public.chamar_entrega() from public, anon, authenticated;
drop trigger if exists entregar_aviso on public.avisos;
create trigger entregar_aviso after insert or update of id, texto on public.avisos for each statement execute function public.chamar_entrega();
drop trigger if exists entregar_pedido on public.pedidos;
create trigger entregar_pedido after insert on public.pedidos for each statement execute function public.chamar_entrega();

-- Um aviso trocado (a pessoa mudou a resposta) é entregue de novo.
create or replace function public.aviso_trocado_de_novo() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id then new.enviado_em := null; end if;
  return new;
end $$;
drop trigger if exists aviso_de_novo on public.avisos;
create trigger aviso_de_novo before update on public.avisos for each row execute function public.aviso_trocado_de_novo();
