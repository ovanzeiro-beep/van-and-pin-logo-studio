-- REVERSÃO da Correção 3 (supabase/migrations/20261120140000_correcao3_cobranca_no_embarque.sql).
-- Só com autorização do dono. Tira os dois gatilhos e as três funções novas; nada mais muda.
-- Não apaga dados: embarques e cobranças criados enquanto a correção esteve ligada continuam como estão.
begin;
drop trigger if exists viagem_registra_embarques on public.viagens;
drop trigger if exists embarque_gera_cobranca on public.embarques;
drop function if exists public.viagem_registra_embarques();
drop function if exists public.embarque_gera_cobranca();
drop function if exists public.r_cobranca_do_embarque(text, date, text);
commit;
