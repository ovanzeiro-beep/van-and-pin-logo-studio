
alter table public.destinos drop constraint if exists destinos_saida_check;
alter table public.destinos drop constraint if exists destinos_volta_check;
alter table public.destinos drop constraint if exists destino_saida_valida;
alter table public.destinos drop constraint if exists destino_volta_valida;
alter table public.destinos add constraint destino_saida_valida check (saida ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
alter table public.destinos add constraint destino_volta_valida check (volta is null or volta ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
create unique index if not exists destinos_convite_unico on public.destinos (upper(convite));
alter table public.destinos add column if not exists excluido_em timestamptz;

create or replace function public.estou_no_destino(d text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where destino_id = d and pessoa_id = auth.uid() and saiu_em is null)
$$;
create or replace function public.sou_passageiro_do_vanzeiro(v uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where vanzeiro_id = v and pessoa_id = auth.uid())
$$;

drop policy if exists "conta: mudar a minha" on public.contas;
create or replace function public.aceitar_termos() returns void
language sql security definer set search_path = '' as $$
  update public.contas set aceite_termos_em = coalesce(aceite_termos_em, now()) where id = auth.uid()
$$;

create unique index if not exists matriculas_conta_no_destino on public.matriculas (destino_id, pessoa_id) where saiu_em is null and pessoa_id is not null;
alter table public.matriculas drop constraint if exists matricula_ponto_completo;
alter table public.matriculas add constraint matricula_ponto_completo check ((ponto_lat is null) = (ponto_lng is null));

create or replace function public.conta_so_por_funcao() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and (
       (tg_op = 'INSERT' and new.pessoa_id is not null)
       or (tg_op = 'UPDATE' and new.pessoa_id is distinct from old.pessoa_id)) then
    raise exception 'A conta da pessoa só entra pelo pedido aceito ou pela confirmação do telefone.';
  end if;
  return new;
end $$;
drop trigger if exists matricula_conta on public.matriculas;
create trigger matricula_conta before insert or update on public.matriculas
  for each row execute function public.conta_so_por_funcao();

drop policy if exists "pedidos: o dono responde" on public.pedidos;
drop policy if exists "mudanças: o dono responde" on public.mudancas_endereco;

create or replace function public.aceitar_pedido(pedido text, matricula jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare p public.pedidos; novo text;
begin
  select * into p from public.pedidos where id = pedido and vanzeiro_id = auth.uid() and situacao = 'aguardando' for update;
  if not found then raise exception 'Este pedido já foi respondido.'; end if;
  insert into public.matriculas (id, vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, ponto_lat, ponto_lng, ordem,
                                 plano, valor, vencimento, desconta_faltas, valor_falta)
  values (coalesce(matricula ->> 'id', gen_random_uuid()::text), p.vanzeiro_id, p.destino_id, p.pessoa_id,
          matricula ->> 'nome', matricula ->> 'telefone', coalesce(matricula ->> 'cidade', ''), coalesce(matricula ->> 'endereco', ''),
          (matricula ->> 'ponto_lat')::double precision, (matricula ->> 'ponto_lng')::double precision, (matricula ->> 'ordem')::int,
          matricula ->> 'plano', (matricula ->> 'valor')::int, (matricula ->> 'vencimento')::int,
          coalesce((matricula ->> 'desconta_faltas')::boolean, false), (matricula ->> 'valor_falta')::int)
  returning id into novo;
  update public.pedidos set situacao = 'aceito', matricula_id = novo, respondido_em = public.hoje_em_brasilia() where id = pedido;
  return novo;
end $$;

create or replace function public.recusar_pedido(pedido text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.pedidos set situacao = 'recusado', respondido_em = public.hoje_em_brasilia()
  where id = pedido and vanzeiro_id = auth.uid() and situacao = 'aguardando';
  if not found then raise exception 'Este pedido já foi respondido.'; end if;
end $$;

create or replace function public.responder_mudanca(mudanca text, aceitar boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.mudancas_endereco;
begin
  select * into m from public.mudancas_endereco where id = mudanca and vanzeiro_id = auth.uid() and situacao = 'aguardando' for update;
  if not found then raise exception 'Este pedido de endereço já foi respondido.'; end if;
  update public.mudancas_endereco set situacao = case when aceitar then 'aceita' else 'recusada' end, respondido_em = public.hoje_em_brasilia()
  where id = mudanca;
  if aceitar then
    update public.matriculas
    set cidade = m.para ->> 'cidade', endereco = m.para ->> 'endereco',
        ponto_lat = (m.para -> 'ponto' ->> 'lat')::double precision, ponto_lng = (m.para -> 'ponto' ->> 'lng')::double precision
    where id = m.matricula_id and saiu_em is null;
  end if;
end $$;

create or replace function public.distancia_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision language sql immutable set search_path = '' as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)))
$$;

create or replace function public.mudar_meu_embarque(matricula text, nova_cidade text, novo_endereco text, lat double precision, lng double precision, distancia_km double precision)
returns text
language plpgsql security definer set search_path = '' as $$
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
end $$;

create or replace function public.confirmar_juntar_conta(matricula text, conta uuid, aceitar boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare j public.juntar_conta;
begin
  if not public.sou_vanzeiro_da_matricula(matricula) then raise exception 'Só o vanzeiro do destino confirma.'; end if;
  select * into j from public.juntar_conta where matricula_id = matricula and conta_id = conta and situacao = 'aguardando' for update;
  if not found then raise exception 'Este pedido já foi respondido.'; end if;
  if aceitar and not exists (select 1 from public.matriculas where id = matricula and pessoa_id is null and telefone = j.telefone and saiu_em is null) then
    raise exception 'Este cadastro mudou (já tem conta ou outro telefone). Peça para a pessoa entrar pelo código.';
  end if;
  update public.juntar_conta set situacao = case when aceitar then 'confirmada' else 'recusada' end, respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and conta_id = conta;
  if aceitar then
    if exists (select 1 from public.matriculas x join public.matriculas y on y.destino_id = x.destino_id
               where x.id = matricula and y.pessoa_id = conta and y.saiu_em is null) then
      raise exception 'Esta conta já está neste destino.';
    end if;
    update public.matriculas set pessoa_id = conta where id = matricula;
    update public.juntar_conta set situacao = 'recusada', respondido_em = public.hoje_em_brasilia()
      where matricula_id = matricula and conta_id <> conta and situacao = 'aguardando';
  end if;
end $$;

create or replace function public.tem_viagem_no_dia(d public.destinos, dia date) returns boolean
language sql stable set search_path = '' as $$
  select d.ativo and d.excluido_em is null
     and not exists (select 1 from public.dias_sem_viagem s where s.destino_id = d.id and s.data = dia)
     and case d.tipo
           when 'avulsa' then d.data = dia
           else (array['dom','seg','ter','qua','qui','sex','sab'])[extract(dow from dia)::int + 1] = any (d.dias)
         end
$$;

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
  select * into d from public.destinos where id = m.destino_id for update;
  if not public.tem_viagem_no_dia(d, dia) then raise exception 'Não tem viagem neste dia.'; end if;
  if exists (select 1 from public.viagens where destino_id = d.id and data = dia) then
    raise exception 'A viagem já começou. Não dá mais para responder.';
  end if;
  prazo := public.prazo_da_viagem(d, dia);
  if now() > prazo then raise exception 'O prazo para responder já passou.'; end if;
  if resposta = 'vai' then
    select van_lugares into lugares from public.perfis_vanzeiro where id = d.vanzeiro_id;
    select count(*) into vao from public.respostas r join public.matriculas x on x.id = r.matricula_id
      where x.destino_id = d.id and x.saiu_em is null and r.data = dia and r.resposta = 'vai' and r.matricula_id <> matricula;
    if lugares is not null and vao >= lugares then raise exception 'A van lotou. Não tem mais lugar nesta viagem.'; end if;
  end if;
  insert into public.respostas (matricula_id, data, resposta, respondida_em, prazo)
  values (matricula, dia, resposta, now(), prazo)
  on conflict (matricula_id, data) do update set resposta = excluded.resposta, respondida_em = excluded.respondida_em, prazo = excluded.prazo;
end $$;

drop policy if exists "vou sempre: a própria pessoa" on public.vou_sempre;
drop policy if exists "não vou: a própria pessoa" on public.nao_vou_periodos;
drop policy if exists "vou sempre: a própria pessoa vê" on public.vou_sempre;
drop policy if exists "não vou: a própria pessoa vê" on public.nao_vou_periodos;
create policy "vou sempre: a própria pessoa vê" on public.vou_sempre for select to authenticated using (public.minha_matricula(matricula_id));
create policy "não vou: a própria pessoa vê" on public.nao_vou_periodos for select to authenticated using (public.minha_matricula(matricula_id));

create or replace function public.ligar_vou_sempre(matricula text, ligar boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.';
  end if;
  if ligar then
    insert into public.vou_sempre (matricula_id) select matricula
    where not exists (select 1 from public.vou_sempre where matricula_id = matricula and ate is null);
  else
    update public.vou_sempre set ate = now() where matricula_id = matricula and ate is null;
  end if;
end $$;

create or replace function public.marcar_nao_vou(matricula text, primeiro date, ultimo date) returns text
language plpgsql security definer set search_path = '' as $$
declare novo text;
begin
  if not exists (select 1 from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.';
  end if;
  if primeiro < public.hoje_em_brasilia() then raise exception 'O primeiro dia não pode ser antes de hoje.'; end if;
  if ultimo < primeiro then raise exception 'O último dia não pode ser antes do primeiro.'; end if;
  insert into public.nao_vou_periodos (matricula_id, de, ate) values (matricula, primeiro, ultimo) returning id into novo;
  return novo;
end $$;

create or replace function public.tirar_nao_vou(periodo text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.nao_vou_periodos set tirado_em = now()
  where id = periodo and tirado_em is null and public.minha_matricula(matricula_id);
  if not found then raise exception 'Este período já tinha sido tirado.'; end if;
end $$;

alter table public.viagens drop constraint if exists viagem_fase_valida;
alter table public.viagens add constraint viagem_fase_valida
  check (fase in ('busca', 'parada', 'conferencia', 'chegada', 'conferencia-volta', 'volta', 'encerrada'));
create unique index if not exists viagens_uma_em_andamento on public.viagens (vanzeiro_id) where fase <> 'encerrada';
drop policy if exists "viagens: quem está no destino" on public.viagens;

create or replace function public.minha_viagem_de_hoje(matricula text)
returns table (viagem_id text, fase text, na_ordem boolean, embarcou boolean, conferencia text, comecou_em timestamptz)
language sql stable security definer set search_path = '' as $$
  select v.id, v.fase,
         (v.estado -> 'ordem') ? matricula,
         (v.estado -> 'embarcaram') ? matricula,
         v.estado -> 'conferencia' ->> matricula,
         v.comecou_em
  from public.viagens v join public.matriculas m on m.destino_id = v.destino_id
  where m.id = matricula and m.pessoa_id = auth.uid() and m.saiu_em is null and v.data = public.hoje_em_brasilia()
$$;

create or replace function public.estou_na_van(viagem text, matricula text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.viagens;
begin
  if not exists (select 1 from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Só dá para confirmar por você mesmo.';
  end if;
  select v2.* into v from public.viagens v2 join public.matriculas m on m.destino_id = v2.destino_id
    where v2.id = viagem and m.id = matricula for update of v2;
  if not found then raise exception 'Esta viagem não é do seu destino.'; end if;
  if v.fase not in ('parada', 'conferencia', 'conferencia-volta') then raise exception 'A van não está conferindo agora.'; end if;
  if not ((v.estado -> 'embarcaram') ? matricula or (v.estado -> 'naVolta') ? matricula) then
    raise exception 'Você não está nesta viagem.';
  end if;
  update public.viagens
  set estado = jsonb_set(
        jsonb_set(estado, array['conferencia', matricula], '"na-van"'),
        '{peloCelular}', coalesce(estado -> 'peloCelular', '[]'::jsonb) || to_jsonb(matricula))
  where id = viagem;
end $$;

alter table public.cobrancas drop constraint if exists cobranca_cancelada_com_motivo;
alter table public.cobrancas add constraint cobranca_cancelada_com_motivo
  check (cancelamento_data is null or (cancelamento_motivo is not null and length(trim(cancelamento_motivo)) > 0));

alter table public.avisos alter column chave set default gen_random_uuid()::text;
update public.avisos set chave = id where chave is null;
alter table public.avisos alter column chave set not null;
drop policy if exists "avisos: marcar como lido" on public.avisos;
drop policy if exists "avisos: criar" on public.avisos;
create policy "avisos: criar" on public.avisos for insert to authenticated with check (
  destino_id is not null
  and (public.sou_vanzeiro_do_destino(destino_id) or public.estou_no_destino(destino_id))
  and (
    para in (select vanzeiro_id::text from public.destinos where id = destino_id)
    or para in (select coalesce(pessoa_id::text, id) from public.matriculas where destino_id = avisos.destino_id)
  )
);
create or replace function public.marcar_avisos_lidos() returns void
language sql security definer set search_path = '' as $$
  update public.avisos set lido = true where para = auth.uid()::text and not lido
$$;

create or replace function public.cidade_nova_sem_conferir() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' then new.conferida := false; end if;
  return new;
end $$;
drop trigger if exists cidade_sem_conferir on public.cidades;
create trigger cidade_sem_conferir before insert on public.cidades
  for each row execute function public.cidade_nova_sem_conferir();

create or replace function public.excluir_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.matriculas
  set saiu_em = coalesce(saiu_em, public.hoje_em_brasilia()), nome = 'Conta excluída', endereco = '', ponto_lat = null, ponto_lng = null
  where pessoa_id = auth.uid();
  update public.cobrancas set cancelamento_data = public.hoje_em_brasilia(), cancelamento_motivo = 'Conta excluída'
  where matricula_id in (select id from public.matriculas where pessoa_id = auth.uid())
    and pagamento_data is null and cancelamento_data is null and vencimento >= public.hoje_em_brasilia();
  update public.pedidos set nome = 'Conta excluída', endereco = null, ponto_lat = null, ponto_lng = null where pessoa_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;

do $$
declare f record;
begin
  for f in select p.oid::regprocedure as assinatura from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.prokind = 'f'
  loop
    execute format('revoke all on function %s from public, anon', f.assinatura);
    execute format('grant execute on function %s to authenticated', f.assinatura);
  end loop;
end $$;
revoke all on all tables in schema public from anon;
