-- PREPARADO; executar SOMENTE após autorização do dono e conferência da base.
-- P0 financeiro: um aparelho antigo não substitui o desconto calculado pelo banco.
-- Só proteção de UPDATE. Não recalcula nem altera cobranças existentes na implantação.
-- Mantém tarefas_do_relogio, Correções 3/5, RLS, pagamentos e anonimização existentes.
begin;
-- Recusa uma base incompatível em vez de instalar uma proteção que impeça o relógio.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_proc p
    where p.oid = 'public.tarefas_do_relogio(timestamptz)'::regprocedure
      and p.prosecdef and pg_get_userbyid(p.proowner) not in ('anon', 'authenticated', 'service_role')
  ) then
    raise exception 'Confira o proprietário e SECURITY DEFINER de tarefas_do_relogio antes de instalar.';
  end if;
end $$;
create or replace function public.cobranca_desconto_do_banco() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  dono_do_relogio name;
begin
  -- Cobranças finalizadas passam intactas à proteção C5, inclusive à sua exceção
  -- de anonimização; não normalizar campos pode mascarar uma tentativa de edição.
  if old.pagamento_data is not null or old.cancelamento_data is not null then
    return new;
  end if;
  -- SECURITY INVOKER distingue o app da execução interna SECURITY DEFINER do relógio.
  -- JWT, auth.uid() e configurações enviadas pelo cliente não concedem esse poder.
  select pg_get_userbyid(p.proowner) into dono_do_relogio
    from pg_catalog.pg_proc p
    where p.oid = 'public.tarefas_do_relogio(timestamptz)'::regprocedure;

  if current_user is distinct from dono_do_relogio then
    -- Aceita outras ações legítimas de versões antigas, ignorando desconto/período
    -- do aparelho. OLD é a linha bloqueada pelo UPDATE, inclusive depois de aguardar
    -- outra transação. O relógio continua com seu incremento atômico existente.
    new.faltas := old.faltas;
    new.valor_falta := old.valor_falta;
    new.periodo_de := old.periodo_de;
    new.periodo_ate := old.periodo_ate;
  end if;
  return new;
end $$;
revoke all on function public.cobranca_desconto_do_banco() from public, anon, authenticated;

-- Ordem alfabética: normaliza ANTES da proteção de edição da Correção 5.
-- Esta continua recusando paga/cancelada e permite sua anonimização interna.
drop trigger if exists cobranca_a_desconto_do_banco on public.cobrancas;
create trigger cobranca_a_desconto_do_banco before update on public.cobrancas
  for each row execute function public.cobranca_desconto_do_banco();
commit;