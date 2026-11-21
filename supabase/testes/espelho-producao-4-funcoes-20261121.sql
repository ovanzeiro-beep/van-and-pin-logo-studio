-- Versões EM PRODUÇÃO (21/11/2026, lidas só em leitura) de 4 funções que diferem dos arquivos de supabase/migrations.
-- Usado só para o laboratório ficar idêntico à produção. NÃO é migração.
CREATE OR REPLACE FUNCTION public.conta_so_por_funcao() RETURNS trigger LANGUAGE plpgsql SET search_path TO '' AS $function$
begin
  if current_user = 'authenticated' and (
       (tg_op = 'INSERT' and new.pessoa_id is not null)
       or (tg_op = 'UPDATE' and new.pessoa_id is distinct from old.pessoa_id)) then
    raise exception 'A conta da pessoa só entra pelo pedido aceito ou pela confirmação do telefone.';
  end if;
  return new;
end $function$;
CREATE OR REPLACE FUNCTION public.destino_com_lugar() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare
  lugares int;
begin
  if new.saiu_em is not null then return new; end if;
  if tg_op = 'UPDATE' and old.saiu_em is null and old.destino_id = new.destino_id then return new; end if;
  perform 1 from public.destinos where id = new.destino_id for update;
  lugares := public.lugares_do_destino(new.destino_id);
  if lugares is not null and public.ocupados_no_destino(new.destino_id) >= lugares then
    raise exception 'A van está cheia: não tem mais lugar neste destino.';
  end if;
  return new;
end $function$;
CREATE OR REPLACE FUNCTION public.mudar_meu_embarque(matricula text, nova_cidade text, novo_endereco text, lat double precision, lng double precision, distancia_km double precision) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare m public.matriculas; km double precision; precisa boolean;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  update public.mudancas_endereco set situacao = 'cancelada', respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and situacao = 'aguardando';
  if m.ponto_lat is null and nova_cidade = m.cidade then
    km := null; precisa := false;
  elsif m.ponto_lat is not null and lat is not null then
    km := public.distancia_km(m.ponto_lat, m.ponto_lng, lat, lng); precisa := km > 1;
  else
    km := null; precisa := nova_cidade <> m.cidade;
  end if;
  if not precisa then
    update public.matriculas set cidade = nova_cidade, endereco = trim(novo_endereco), ponto_lat = lat, ponto_lng = lng where id = matricula;
    return 'salvo';
  end if;
  insert into public.mudancas_endereco (vanzeiro_id, destino_id, matricula_id, nome, de, para, distancia_km)
  values (m.vanzeiro_id, m.destino_id, m.id, m.nome,
          jsonb_build_object('cidade', m.cidade, 'endereco', m.endereco, 'ponto', case when m.ponto_lat is null then null else jsonb_build_object('lat', m.ponto_lat, 'lng', m.ponto_lng) end),
          jsonb_build_object('cidade', nova_cidade, 'endereco', trim(novo_endereco), 'ponto', case when lat is null then null else jsonb_build_object('lat', lat, 'lng', lng) end),
          km);
  return 'aguardando';
end $function$;
CREATE OR REPLACE FUNCTION public.responder(matricula text, dia date, resposta text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
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
  select * into d from public.destinos where id = m.destino_id for update;
  if not public.tem_viagem_no_dia(d, dia) then raise exception 'Não tem viagem neste dia.'; end if;
  if exists (select 1 from public.viagens where destino_id = d.id and data = dia) then
    raise exception 'A viagem já começou. Não dá mais para responder.';
  end if;
  prazo := public.prazo_da_viagem(d, dia);
  if now() > prazo then raise exception 'O prazo para responder já passou.'; end if;
  if resposta = 'vai' then
    select van_lugares into lugares from public.perfis_vanzeiro where id = d.vanzeiro_id;
    select count(*) into vao from public.matriculas x
      where x.destino_id = d.id and x.saiu_em is null and x.id <> matricula
        and (public.r_resposta(x.id, dia, prazo)).resposta = 'vai';
    if lugares is not null and vao >= lugares then raise exception 'A van lotou. Não tem mais lugar nesta viagem.'; end if;
  end if;
  insert into public.respostas (matricula_id, data, resposta, respondida_em, prazo)
  values (matricula, dia, resposta, now(), prazo)
  on conflict (matricula_id, data) do update set resposta = excluded.resposta, respondida_em = excluded.respondida_em, prazo = excluded.prazo;
end $function$;
