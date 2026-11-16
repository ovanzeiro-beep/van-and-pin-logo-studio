-- W8: avisos do sininho no banco.
-- O app cria os avisos (resposta, a van saiu, prazo, cobrança, pedido aceito, dia cancelado) e salva por esta função.
-- Mesmo "chave" para a mesma pessoa: não repete (ou troca o texto, quando a pessoa mudou a resposta).
-- Só cria aviso quem é do destino (o vanzeiro dono ou um passageiro que está nele), e só para alguém desse destino.
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

-- A tabela só é escrita pela função acima (e lida pelo destinatário).
drop policy if exists "avisos: criar" on public.avisos;
