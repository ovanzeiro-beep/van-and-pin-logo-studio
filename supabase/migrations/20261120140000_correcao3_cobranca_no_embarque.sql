-- CORREÇÃO 3 (auditoria de 20/11/2026, P0-3 e T5.1): a cobrança do embarque não se perde quando a internet cai.
--
-- Antes: ao tocar "Embarcou" com sinal, a viagem ia para o banco, mas o embarque e a cobrança (Por viagem e
-- Diário) ficavam só na memória do celular e eram enviados ~400 ms depois, em outro pedido. Se a internet caísse
-- nesse meio-tempo, ou o app fosse fechado, a viagem no banco dizia que a pessoa embarcou e a cobrança nunca nascia.
-- O banco também não criava cobrança para um embarque gravado sem ela. Provas: cenários A e B em
-- docs/evidencias/2026-11-20-fase4-cobranca-com-sinal.test.ts.txt e T5.1 em docs/evidencias/2026-11-20-auditoria-fase4.md.
-- Em produção, uma consulta de leitura de 20/11 achou 2 embarques de 17/11 ("Por viagem") nessa situação.
--
-- Agora o banco garante, na MESMA operação que grava a viagem:
--  1. Cada pessoa em "embarcaram" na viagem ganha o registro de embarque (um por matrícula e dia).
--  2. Cada embarque de quem é "Por viagem" ou "Diário" ganha a cobrança, igual à que o app cria
--     (src/lib/cobrancas.ts: mesmo identificador, referência, vencimento em 7 dias e valor da matrícula).
--     Se a viagem chegou ao banco, a cobrança chegou junto; se não chegou, a viagem fica na fila do celular
--     (src/lib/banco/fila.ts) e, quando for enviada, a cobrança nasce junto.
--  3. Tudo é idempotente: reenvios, toques repetidos e o envio do próprio app nunca criam duas cobranças
--     (o identificador é o mesmo e o app já envia com "ignorar se já existe"). Cobrança paga ou cancelada não muda.
--  4. Só vale para passageiros do próprio destino da viagem; identificador estranho em "embarcaram" é ignorado.
--  5. Mensal e Quinzenal não ganham cobrança por embarque (como no app).
--
-- Não muda tabelas, políticas ou dados existentes. Os 2 casos antigos de produção NÃO são recuperados aqui
-- (isso grava dados reais; roteiro separado em supabase/testes/correcao3-recuperar-embarques.sql, só com autorização).
-- Pode rodar de novo sem quebrar.

-- A cobrança de um embarque, igual à do app. Não faz nada para Mensal/Quinzenal nem se a cobrança já existe.
create or replace function public.r_cobranca_do_embarque(p_matricula text, p_data date, p_viagem text) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  select * into m from public.matriculas where id = p_matricula;
  if not found or m.plano not in ('viagem', 'diario') then return; end if;
  insert into public.cobrancas (id, vanzeiro_id, viagem_id, matricula_id, destino_id, nome, telefone, tipo, referencia,
                                vencimento, valor_base, faltas, valor_falta)
  values (m.id || '_' || case when m.plano = 'viagem' and p_viagem is not null then p_viagem else p_data::text end,
          m.vanzeiro_id, case when m.plano = 'viagem' then p_viagem end, m.id, m.destino_id, m.nome, m.telefone, m.plano,
          case m.plano when 'diario' then 'Diária de ' else 'Viagem de ' end || to_char(p_data, 'DD/MM'),
          p_data + 7, m.valor, 0, 0)
  on conflict (id) do nothing;
end $$;

-- Todo embarque gravado (pelo app ou pelo banco) garante a sua cobrança.
create or replace function public.embarque_gera_cobranca() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.r_cobranca_do_embarque(new.matricula_id, new.data, new.viagem_id);
  return null;
end $$;
drop trigger if exists embarque_gera_cobranca on public.embarques;
create trigger embarque_gera_cobranca after insert on public.embarques
  for each row execute function public.embarque_gera_cobranca();

-- A viagem gravada (com sinal, ou pela fila quando o sinal volta) garante embarque e cobrança de quem embarcou.
create or replace function public.viagem_registra_embarques() returns trigger
language plpgsql security definer set search_path = '' as $$
declare mid text;
begin
  for mid in
    select x.id from jsonb_array_elements_text(coalesce(new.estado -> 'embarcaram', '[]'::jsonb)) as x(id)
      join public.matriculas m on m.id = x.id and m.destino_id = new.destino_id and m.vanzeiro_id = new.vanzeiro_id
  loop
    insert into public.embarques (matricula_id, data, viagem_id) values (mid, new.data, new.id)
    on conflict (matricula_id, data) do nothing;
    -- Também quando o embarque já existia sem a cobrança.
    perform public.r_cobranca_do_embarque(mid, new.data, new.id);
  end loop;
  return null;
end $$;
drop trigger if exists viagem_registra_embarques on public.viagens;
create trigger viagem_registra_embarques after insert or update of estado on public.viagens
  for each row execute function public.viagem_registra_embarques();

revoke all on function public.r_cobranca_do_embarque(text, date, text) from public, anon, authenticated;
revoke all on function public.embarque_gera_cobranca() from public, anon, authenticated;
revoke all on function public.viagem_registra_embarques() from public, anon, authenticated;
