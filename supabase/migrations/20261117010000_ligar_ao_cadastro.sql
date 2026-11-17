-- G1: passageiro que o vanzeiro cadastrou direto (sem conta) e depois entra no app com o código.
-- Ele pede para entrar normalmente; o vanzeiro vê "Já cadastrado neste destino" e toca em "Ligar ao cadastro":
-- a conta da pessoa passa a ser a desse cadastro (com o plano, o valor e as cobranças que já tinha). Nada duplica.

-- Com a van cheia, quem já está cadastrado (mesmo telefone, ainda sem conta) pode pedir: ele já ocupa o lugar dele.
create or replace function public.pedir_para_entrar(codigo text, nome text, telefone text, cidade text, endereco text, lat double precision, lng double precision)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  d public.destinos;
  novo text;
  lugares int;
  ja_cadastrado boolean;
begin
  select * into d from public.destinos where upper(convite) = upper(trim(codigo)) and ativo;
  if not found then raise exception 'Código não encontrado. Confira o código com o vanzeiro.'; end if;
  if exists (select 1 from public.matriculas where destino_id = d.id and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Você já está neste destino.';
  end if;
  ja_cadastrado := exists (select 1 from public.matriculas m where m.destino_id = d.id and m.telefone = pedir_para_entrar.telefone
                           and m.pessoa_id is null and m.saiu_em is null);
  lugares := public.lugares_do_destino(d.id);
  if not ja_cadastrado and lugares is not null and public.ocupados_no_destino(d.id) >= lugares then
    raise exception 'A van está cheia. Fale com o vanzeiro.';
  end if;
  insert into public.pedidos (vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, ponto_lat, ponto_lng)
  values (d.vanzeiro_id, d.id, auth.uid(), trim(nome), telefone, cidade, endereco, lat, lng)
  returning id into novo;
  return novo;
end $$;

-- "Ligar ao cadastro": só o vanzeiro do destino; o cadastro tem o mesmo telefone do pedido e ainda não tem conta.
create or replace function public.ligar_pedido_ao_cadastro(pedido text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  p public.pedidos;
  m public.matriculas;
begin
  select * into p from public.pedidos where id = pedido and vanzeiro_id = auth.uid() and situacao = 'aguardando' for update;
  if not found then raise exception 'Este pedido já foi respondido.'; end if;
  select * into m from public.matriculas where destino_id = p.destino_id and telefone = p.telefone and pessoa_id is null and saiu_em is null
    for update;
  if not found then raise exception 'Não achamos um cadastro com este telefone neste destino.'; end if;
  if exists (select 1 from public.matriculas where destino_id = p.destino_id and pessoa_id = p.pessoa_id and saiu_em is null) then
    raise exception 'Esta pessoa já está neste destino.';
  end if;
  update public.matriculas set pessoa_id = p.pessoa_id where id = m.id;
  update public.pedidos set situacao = 'aceito', matricula_id = m.id, respondido_em = public.hoje_em_brasilia() where id = pedido;
  return m.id;
end $$;
revoke all on function public.ligar_pedido_ao_cadastro(text) from public, anon;
grant execute on function public.ligar_pedido_ao_cadastro(text) to authenticated;
