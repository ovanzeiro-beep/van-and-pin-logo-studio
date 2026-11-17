-- "Boa viagem!" (pedido do dono, 17/11): quando o vanzeiro marca "Embarcou", o passageiro recebe um aviso no sininho
-- e no celular. Um por pessoa por viagem (chave), só para quem acabou de entrar na lista de embarcados.
create or replace function public.avisar_boa_viagem() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  novos text[];
  mid text;
  m public.matriculas;
  d public.destinos;
begin
  novos := array(
    select jsonb_array_elements_text(coalesce(new.estado -> 'embarcaram', '[]'::jsonb))
    except
    select jsonb_array_elements_text(coalesce(case when tg_op = 'UPDATE' then old.estado -> 'embarcaram' end, '[]'::jsonb)));
  if coalesce(array_length(novos, 1), 0) = 0 then return null; end if;
  select * into d from public.destinos where id = new.destino_id;
  foreach mid in array novos loop
    select * into m from public.matriculas where id = mid;
    if not found then continue; end if;
    insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
    values (gen_random_uuid()::text, new.vanzeiro_id, coalesce(m.pessoa_id::text, m.id), 'boa_viagem',
            'Você embarcou' || case when d.id is not null then ' na van de ' || d.origem || ' → ' || d.destino else '' end
              || '. Boa viagem!',
            'boa_viagem_' || new.id || '_' || m.id, new.destino_id, m.id, public.hoje_em_brasilia())
    on conflict (para, chave) do nothing;
  end loop;
  return null;
end $$;
revoke all on function public.avisar_boa_viagem() from public, anon, authenticated;
create or replace trigger avisar_boa_viagem after insert or update of estado on public.viagens
  for each row execute function public.avisar_boa_viagem();
