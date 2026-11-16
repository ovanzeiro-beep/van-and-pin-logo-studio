-- Vagas da van: o "Vou sempre" também ocupa lugar (antes só o "Vou" do dia contava, e a van podia passar do limite).
-- A van lotada recusa o "Vou"; quem sai do destino ou responde "Não vou" libera a vaga.
create or replace function public.responder(matricula text, dia date, resposta text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  m public.matriculas;
  d public.destinos;
  lugares int;
  vao int;
  prazo timestamptz;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  if resposta not in ('vai', 'nao-vai') then raise exception 'Resposta inválida.'; end if;
  -- Uma resposta por vez em cada destino: duas pessoas não disputam a última vaga ao mesmo tempo.
  select * into d from public.destinos where id = m.destino_id for update;
  if not public.tem_viagem_no_dia(d, dia) then raise exception 'Não tem viagem neste dia.'; end if;
  if exists (select 1 from public.viagens where destino_id = d.id and data = dia) then
    raise exception 'A viagem já começou. Não dá mais para responder.';
  end if;
  prazo := public.prazo_da_viagem(d, dia);
  if now() > prazo then raise exception 'O prazo para responder já passou.'; end if;
  if resposta = 'vai' then
    select van_lugares into lugares from public.perfis_vanzeiro where id = d.vanzeiro_id;
    -- Conta quem vai de verdade: o "Vou" do dia e também o "Vou sempre" (menos quem marcou "Não vou de… até…").
    -- Quem saiu do destino não conta: a vaga fica livre.
    select count(*) into vao from public.matriculas x
      where x.destino_id = d.id and x.saiu_em is null and x.id <> matricula
        and (public.r_resposta(x.id, dia, prazo)).resposta = 'vai';
    if lugares is not null and vao >= lugares then raise exception 'A van lotou. Não tem mais lugar nesta viagem.'; end if;
  end if;
  insert into public.respostas (matricula_id, data, resposta, respondida_em, prazo)
  values (matricula, dia, resposta, now(), prazo)
  on conflict (matricula_id, data) do update set resposta = excluded.resposta, respondida_em = excluded.respondida_em, prazo = excluded.prazo;
end $$;
