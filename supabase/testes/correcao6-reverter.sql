-- DESFAZER a Correção 6 (só se algo der errado e com autorização do dono).
-- Volta a consulta do convite e o "pedir para entrar" de antes, tira o sorteio no servidor e o limite de tentativas.
-- NÃO volta: os códigos novos (continuam valendo, a função antiga aceita qualquer código gravado) e o acesso às duas
-- funções antigas de "juntar pelo telefone" (continuam fechadas: o app não usa e elas revelavam telefones).
drop trigger if exists destino_convite_do_servidor on public.destinos;
drop function if exists public.destino_convite_do_servidor();

create or replace function public.destino_pelo_convite(codigo text)
returns table (id text, origem text, destino text, paradas text[], saida text, vanzeiro_nome text, cafe_parada text, cafe_minutos integer, cafe_local text)
language sql stable security definer set search_path = '' as $$
  select d.id, d.origem, d.destino, d.paradas, d.saida, coalesce(p.nome, ''), d.cafe_parada, d.cafe_minutos, d.cafe_local
  from public.destinos d left join public.perfis_vanzeiro p on p.id = d.vanzeiro_id
  where upper(d.convite) = upper(trim(codigo)) and d.ativo
$$;

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

drop function if exists public.r_convite_liberado(uuid);
drop function if exists public.r_anotar_tentativa(uuid);
drop function if exists public.gerar_convite();
drop function if exists public.r_codigo_do_convite(text);
drop table if exists public.tentativas_de_convite;

revoke all on function public.destino_pelo_convite(text) from public, anon;
grant execute on function public.destino_pelo_convite(text) to authenticated;
revoke all on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) from public, anon;
grant execute on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) to authenticated;
