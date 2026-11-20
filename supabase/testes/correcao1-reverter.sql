-- REVERSÃO da Correção 1 (supabase/migrations/20261120120000_correcao1_avisos_seguros.sql).
-- Só com autorização do dono. Volta `salvar_aviso` à versão anterior e tira as 4 funções de texto da correção.
-- Não mexe em dados: avisos gravados continuam como estão. Reverter só depois das Correções 3 e 2 (ordem inversa).
begin;

create or replace function public.salvar_aviso(aviso jsonb, trocar boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare
  d text := aviso ->> 'destino_id';
  p text := aviso ->> 'para';
begin
  if auth.uid() is null then raise exception 'Entre na sua conta de novo.'; end if;
  if d is null or not (public.sou_vanzeiro_do_destino(d) or public.estou_no_destino(d)) then
    raise exception 'Este aviso não é deste destino.';
  end if;
  if not (p in (select vanzeiro_id::text from public.destinos where id = d)
          or p in (select coalesce(pessoa_id::text, id) from public.matriculas where destino_id = d)) then
    raise exception 'Este aviso não é para alguém deste destino.';
  end if;
  insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, cobranca_id, criado_em, lido)
  values (aviso ->> 'id', (select vanzeiro_id from public.destinos where id = d), p, aviso ->> 'tipo', aviso ->> 'texto',
          coalesce(aviso ->> 'chave', aviso ->> 'id'), d, aviso ->> 'matricula_id', aviso ->> 'cobranca_id',
          coalesce((aviso ->> 'criado_em')::date, public.hoje_em_brasilia()), false)
  on conflict (para, chave) do update
    set id = excluded.id, tipo = excluded.tipo, texto = excluded.texto, matricula_id = excluded.matricula_id,
        cobranca_id = excluded.cobranca_id, criado_em = excluded.criado_em, lido = false
    where trocar;
end $$;

revoke all on function public.salvar_aviso(jsonb, boolean) from public, anon;
grant execute on function public.salvar_aviso(jsonb, boolean) to authenticated;

drop function if exists public.r_textos_da_resposta(text, text, text, date, text, date);
drop function if exists public.r_textos_do_periodo(text, text, text, date, date);
drop function if exists public.r_quando_vai(date, date);
drop function if exists public.r_primeiro_nome(text);

commit;
