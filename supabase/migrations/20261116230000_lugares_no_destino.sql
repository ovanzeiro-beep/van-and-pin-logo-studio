-- E1: os lugares da van (Perfil do vanzeiro) valem para quem está no destino.
-- Quem entra primeiro com o código entra; com a van cheia, ninguém mais entra (nem pedindo, nem aceito, nem
-- cadastrado direto). Quem sai do destino libera a vaga. Sem número de lugares no Perfil, não há limite.

create or replace function public.lugares_do_destino(d text) returns int
language sql stable security definer set search_path = '' as $$
  select p.van_lugares from public.destinos x join public.perfis_vanzeiro p on p.id = x.vanzeiro_id where x.id = d
$$;

create or replace function public.ocupados_no_destino(d text) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.matriculas where destino_id = d and saiu_em is null
$$;

-- Toda entrada no destino passa por aqui (aceitar pedido, cadastrar direto, voltar para o destino).
create or replace function public.destino_com_lugar() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  lugares int;
begin
  if new.saiu_em is not null then return new; end if;
  if tg_op = 'UPDATE' and old.saiu_em is null and old.destino_id = new.destino_id then return new; end if;
  -- Um por vez em cada destino: duas pessoas não pegam a última vaga ao mesmo tempo.
  perform 1 from public.destinos where id = new.destino_id for update;
  lugares := public.lugares_do_destino(new.destino_id);
  if lugares is not null and public.ocupados_no_destino(new.destino_id) >= lugares then
    raise exception 'A van está cheia: não tem mais lugar neste destino.';
  end if;
  return new;
end $$;
revoke all on function public.destino_com_lugar() from public, anon, authenticated;
create or replace trigger destino_com_lugar before insert or update of saiu_em, destino_id on public.matriculas
  for each row execute function public.destino_com_lugar();

-- Pedir para entrar com a van cheia: já avisa (o vanzeiro nem recebe o pedido).
create or replace function public.pedir_para_entrar(codigo text, nome text, telefone text, cidade text, endereco text, lat double precision, lng double precision)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  d public.destinos;
  novo text;
  lugares int;
begin
  select * into d from public.destinos where upper(convite) = upper(trim(codigo)) and ativo;
  if not found then raise exception 'Código não encontrado. Confira o código com o vanzeiro.'; end if;
  if exists (select 1 from public.matriculas where destino_id = d.id and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Você já está neste destino.';
  end if;
  lugares := public.lugares_do_destino(d.id);
  if lugares is not null and public.ocupados_no_destino(d.id) >= lugares then
    raise exception 'A van está cheia. Fale com o vanzeiro.';
  end if;
  insert into public.pedidos (vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, ponto_lat, ponto_lng)
  values (d.vanzeiro_id, d.id, auth.uid(), trim(nome), telefone, cidade, endereco, lat, lng)
  returning id into novo;
  return novo;
end $$;
