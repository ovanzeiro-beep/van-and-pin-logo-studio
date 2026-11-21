-- O VANZEIRO · CORREÇÃO 6 · para colar no SQL Editor do Supabase (projeto ovanzeiro). SÓ com autorização do dono.
-- Tudo ou nada: se der qualquer erro, nada é gravado (begin/commit). Colar duas vezes não estraga nada.
begin;

-- CORREÇÃO 6 (auditoria T3.2, T3.3, T3.4 · decisões do dono de 21/11/2026) — segurança dos convites e dos telefones.
--
--  1. Código de convite: "VAN-" + 6 letras e números, sem os que se confundem (0, O, 1, I, L): 31^6 ≈ 887 milhões.
--     Quem cria o código é o banco (sorteio seguro do próprio PostgreSQL), nunca o celular. O celular não troca o código.
--  2. Os códigos dos destinos que não foram excluídos são trocados pelo formato novo (passageiros e vínculos ficam).
--     Os códigos antigos (4 números) deixam de valer, mesmo os de destinos excluídos.
--  3. Limite no servidor: 10 códigos errados por conta em 1 hora; depois disso, até código certo é recusado nessa hora.
--     Contra muitas contas ao mesmo tempo: se o total de códigos errados de todas as contas passar de 100 em 1 hora
--     (alarme), cada conta fica com 3 por hora enquanto durar. Ninguém é bloqueado sem ter errado. O registro guarda
--     só a conta e a hora, e é apagado depois de 1 dia.
--     Mesmo pedido repetido para a mesma van é recusado enquanto o primeiro espera resposta. "Van cheia" também conta
--     como tentativa (impede descobrir, testando telefones, quem já está cadastrado).
--  4. As duas funções antigas de "juntar pelo telefone" (o app não usa) perdem o acesso. Nenhum dado é apagado.
-- Tudo numa operação: se falhar, nada muda.

-- ---------- 1. o código ----------
create or replace function public.r_codigo_do_convite(texto text) returns text
language plpgsql immutable set search_path = '' as $$
declare s text := upper(regexp_replace(coalesce(texto, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if length(s) = 9 and left(s, 3) = 'VAN' then s := substr(s, 4); end if;
  if s !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$' then return null; end if;
  return 'VAN-' || s;
end $$;

create or replace function public.gerar_convite() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  alfabeto constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  b bytea; c text; i int; v int;
begin
  loop
    c := '';
    while length(c) < 6 loop
      b := uuid_send(gen_random_uuid());  -- 16 bytes do sorteio seguro do PostgreSQL; os 6 primeiros são todos sorteados
      for i in 0..5 loop
        v := get_byte(b, i);
        if v < 248 then c := c || substr(alfabeto, v % 31 + 1, 1); end if;  -- 248 = 31 × 8: sem preferência por letra
        exit when length(c) = 6;
      end loop;
    end loop;
    exit when not exists (select 1 from public.destinos where upper(convite) = 'VAN-' || c);
  end loop;
  return 'VAN-' || c;
end $$;

-- O celular (papéis authenticated/anon) nunca escolhe nem troca o código; o administrador pode.
create or replace function public.destino_convite_do_servidor() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then new.convite := public.gerar_convite();
    else new.convite := old.convite;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists destino_convite_do_servidor on public.destinos;
create trigger destino_convite_do_servidor before insert or update of convite on public.destinos
  for each row execute function public.destino_convite_do_servidor();

-- ---------- 2. troca dos códigos atuais ----------
-- Só os que ainda estão no formato antigo: colar duas vezes não troca de novo.
update public.destinos set convite = public.gerar_convite()
  where excluido_em is null and public.r_codigo_do_convite(convite) is distinct from upper(convite);

-- ---------- 3. limite de tentativas ----------
create table if not exists public.tentativas_de_convite (
  id bigint generated always as identity primary key,
  conta uuid not null,
  em timestamptz not null default now()
);
create index if not exists tentativas_de_convite_conta on public.tentativas_de_convite (conta, em);
create index if not exists tentativas_de_convite_em on public.tentativas_de_convite (em);
alter table public.tentativas_de_convite enable row level security;
revoke all on public.tentativas_de_convite from anon, authenticated;

create or replace function public.r_convite_liberado(eu uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare minhas int; todas int; limite int := 10;
begin
  if eu is null then raise exception 'Entre na sua conta para usar o código de convite.'; end if;
  select count(*) filter (where conta = eu), count(*) into minhas, todas
    from public.tentativas_de_convite where em > now() - interval '1 hour';
  if todas >= 100 then limite := 3; end if;  -- alarme: muitas contas errando ao mesmo tempo
  if minhas >= limite then
    raise exception 'Muitos códigos errados. Espere 1 hora e tente de novo.';
  end if;
end $$;

create or replace function public.r_anotar_tentativa(eu uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.tentativas_de_convite where em < now() - interval '1 day';
  insert into public.tentativas_de_convite (conta) values (eu);
$$;

-- Mesmo formato de resposta de antes (o app não muda por causa disto).
create or replace function public.destino_pelo_convite(codigo text)
returns table (id text, origem text, destino text, paradas text[], saida text, vanzeiro_nome text, cafe_parada text, cafe_minutos integer, cafe_local text)
language plpgsql volatile security definer set search_path = '' as $$
declare eu uuid := auth.uid(); c text := public.r_codigo_do_convite(codigo);
begin
  perform public.r_convite_liberado(eu);
  return query
    select d.id, d.origem, d.destino, d.paradas, d.saida, coalesce(p.nome, ''), d.cafe_parada, d.cafe_minutos, d.cafe_local
    from public.destinos d left join public.perfis_vanzeiro p on p.id = d.vanzeiro_id
    where c is not null and upper(d.convite) = c and d.ativo and d.excluido_em is null;
  if not found then perform public.r_anotar_tentativa(eu); end if;
end $$;

-- Código errado → devolve vazio (null); van cheia → '#cheia'. Assim a tentativa fica anotada (um erro desfaria a anotação).
create or replace function public.pedir_para_entrar(codigo text, nome text, telefone text, cidade text, endereco text, lat double precision, lng double precision)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
  d public.destinos;
  novo text;
  lugares int;
  ja_cadastrado boolean;
begin
  perform public.r_convite_liberado(eu);
  select * into d from public.destinos x
    where upper(x.convite) = public.r_codigo_do_convite(codigo) and x.ativo and x.excluido_em is null;
  if not found then
    perform public.r_anotar_tentativa(eu);
    return null;
  end if;
  if exists (select 1 from public.matriculas where destino_id = d.id and pessoa_id = eu and saiu_em is null) then
    raise exception 'Você já está neste destino.';
  end if;
  if exists (select 1 from public.pedidos where destino_id = d.id and pessoa_id = eu and situacao = 'aguardando') then
    raise exception 'Seu pedido para esta van já foi enviado. Aguarde a resposta do vanzeiro.';
  end if;
  ja_cadastrado := exists (select 1 from public.matriculas m where m.destino_id = d.id and m.telefone = pedir_para_entrar.telefone
                           and m.pessoa_id is null and m.saiu_em is null);
  lugares := public.lugares_do_destino(d.id);
  if not ja_cadastrado and lugares is not null and public.ocupados_no_destino(d.id) >= lugares then
    perform public.r_anotar_tentativa(eu);
    return '#cheia';
  end if;
  insert into public.pedidos (vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, ponto_lat, ponto_lng)
  values (d.vanzeiro_id, d.id, eu, trim(nome), telefone, cidade, endereco, lat, lng)
  returning id into novo;
  return novo;
end $$;

-- ---------- 4. funções antigas do telefone ----------
revoke all on function public.pedir_juntar_pelo_telefone(text) from public, anon, authenticated;
revoke all on function public.confirmar_juntar_conta(text, uuid, boolean) from public, anon, authenticated;

-- ---------- acesso ----------
revoke all on function public.r_codigo_do_convite(text) from public, anon, authenticated;
-- O gatilho roda como a pessoa que salva o destino, por isso ela pode sortear (só devolve um código novo, livre).
revoke all on function public.gerar_convite() from public, anon;
grant execute on function public.gerar_convite() to authenticated;
revoke all on function public.destino_convite_do_servidor() from public, anon, authenticated;
revoke all on function public.r_convite_liberado(uuid) from public, anon, authenticated;
revoke all on function public.r_anotar_tentativa(uuid) from public, anon, authenticated;
revoke all on function public.destino_pelo_convite(text) from public, anon;
grant execute on function public.destino_pelo_convite(text) to authenticated;
revoke all on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) from public, anon;
grant execute on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) to authenticated;

commit;
