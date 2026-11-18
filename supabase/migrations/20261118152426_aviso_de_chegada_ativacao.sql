-- Chegada ao ponto: registro separado do estado da viagem e do embarque.
create table if not exists public.avisos_de_chegada (
  id uuid primary key default gen_random_uuid(),
  viagem_id text not null references public.viagens (id) on delete cascade,
  matricula_id text not null references public.matriculas (id) on delete cascade,
  passageiro_id uuid not null references public.contas (id) on delete cascade,
  criado_em timestamptz not null,
  expira_em timestamptz not null,
  confirmado_em timestamptz,
  unique (viagem_id, matricula_id),
  check (expira_em > criado_em),
  check (confirmado_em is null or (confirmado_em >= criado_em and confirmado_em < expira_em))
);
alter table public.avisos_de_chegada enable row level security;
revoke all on table public.avisos_de_chegada from public, anon, authenticated, service_role;
create index if not exists avisos_de_chegada_matricula_idx on public.avisos_de_chegada (matricula_id);
create index if not exists avisos_de_chegada_passageiro_idx on public.avisos_de_chegada (passageiro_id);

-- Mesma regra da tela de busca: o primeiro da ordem que ainda espera.
create or replace function public.proxima_matricula_para_aviso(viagem public.viagens)
returns text
language sql stable set search_path = '' as $$
  select item.matricula
  from jsonb_array_elements_text(viagem.estado -> 'ordem')
       with ordinality as item(matricula, posicao)
  where viagem.fase = 'busca'
    and viagem.data = public.hoje_em_brasilia()
    and not (coalesce(viagem.estado -> 'embarcaram', '[]'::jsonb) ? item.matricula)
    and not (coalesce(viagem.estado -> 'naoEstavam', '[]'::jsonb) ? item.matricula)
  order by item.posicao
  limit 1
$$;
revoke all on function public.proxima_matricula_para_aviso(public.viagens)
  from public, anon, authenticated, service_role;

create or replace function public.avisar_chegada(p_viagem_id text, p_matricula_id text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  viagem public.viagens;
  passageiro uuid;
  aviso public.avisos_de_chegada;
  instante timestamptz;
begin
  select * into viagem from public.viagens v
  where v.id = p_viagem_id and v.vanzeiro_id = (select auth.uid()) for update;
  if not found then raise exception 'Esta viagem não está disponível.'; end if;

  if p_matricula_id is null
     or public.proxima_matricula_para_aviso(viagem) is distinct from p_matricula_id then
    raise exception 'Este passageiro não é mais o próximo da busca.';
  end if;

  select m.pessoa_id into passageiro from public.matriculas m
  where m.id = p_matricula_id and m.destino_id = viagem.destino_id
    and m.vanzeiro_id = viagem.vanzeiro_id and m.saiu_em is null
  for share;
  if passageiro is null then raise exception 'Este passageiro ainda não pode receber um aviso no app.'; end if;

  instante := clock_timestamp();
  -- O bloqueio da linha da viagem serializa tentativas feitas por aparelhos diferentes.
  select * into aviso from public.avisos_de_chegada a
    where a.viagem_id = viagem.id and a.matricula_id = p_matricula_id;
  if found then
    if aviso.passageiro_id = passageiro and aviso.expira_em > instante then return aviso.id; end if;
    raise exception 'Este aviso de chegada já expirou.';
  end if;

  insert into public.avisos_de_chegada (viagem_id, matricula_id, passageiro_id, criado_em, expira_em)
  values (viagem.id, p_matricula_id, passageiro, instante, instante + interval '3 minutes')
  returning id into aviso.id;
  return aviso.id;
end $$;

create or replace function public.confirmar_aviso_de_chegada(p_aviso_id uuid)
returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare
  aviso public.avisos_de_chegada;
  viagem public.viagens;
  instante timestamptz;
begin
  select * into aviso from public.avisos_de_chegada a
    where a.id = p_aviso_id and a.passageiro_id = (select auth.uid());
  if not found then raise exception 'Este aviso não está disponível.'; end if;

  -- A mesma ordem de bloqueio do envio evita confirmar com base em uma busca que já avançou.
  select * into viagem from public.viagens v where v.id = aviso.viagem_id for update;
  if public.proxima_matricula_para_aviso(viagem) is distinct from aviso.matricula_id then
    raise exception 'Este aviso de chegada já expirou.';
  end if;

  perform 1 from public.matriculas m
    where m.id = aviso.matricula_id and m.pessoa_id = aviso.passageiro_id
      and m.destino_id = viagem.destino_id and m.vanzeiro_id = viagem.vanzeiro_id and m.saiu_em is null
    for share;
  if not found then raise exception 'Este aviso não está disponível.'; end if;

  instante := clock_timestamp();
  if aviso.expira_em <= instante then raise exception 'Este aviso de chegada já expirou.'; end if;

  update public.avisos_de_chegada a
    set confirmado_em = instante where a.id = aviso.id and a.confirmado_em is null
    returning a.confirmado_em into aviso.confirmado_em;
  if not found then
    select a.confirmado_em into aviso.confirmado_em from public.avisos_de_chegada a where a.id = aviso.id;
  end if;
  return aviso.confirmado_em;
end $$;

revoke all on function public.avisar_chegada(text, text) from public, anon, authenticated, service_role;
revoke all on function public.confirmar_aviso_de_chegada(uuid) from public, anon, authenticated, service_role;
grant execute on function public.avisar_chegada(text, text) to authenticated;
grant execute on function public.confirmar_aviso_de_chegada(uuid) to authenticated;


-- O canal da chegada só enxerga registros da própria viagem ou matrícula.
grant select on table public.avisos_de_chegada to authenticated;
drop policy if exists "avisos de chegada: participantes" on public.avisos_de_chegada;
create policy "avisos de chegada: participantes"
  on public.avisos_de_chegada for select to authenticated
  using (
    (
      passageiro_id = (select auth.uid())
      and exists (
        select 1 from public.matriculas m where m.id = matricula_id
          and m.pessoa_id = (select auth.uid()) and m.saiu_em is null
      )
    )
    or exists (
      select 1 from public.viagens v where v.id = viagem_id and v.vanzeiro_id = (select auth.uid())
    )
  );

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'avisos_de_chegada'
  ) then
    alter publication supabase_realtime add table public.avisos_de_chegada;
  end if;
end $$;

-- Releitura após cada evento. O passageiro vê apenas seus avisos ainda acionáveis.
-- O vanzeiro consulta uma parada e continua vendo o resultado após o prazo de confirmação.
create or replace function public.ler_avisos_de_chegada(p_viagem_id text, p_matricula_id text)
returns table (
  id uuid, destino_id text, trajeto text, expira_em timestamptz, confirmado_em timestamptz, servidor_agora timestamptz
)
language sql stable security definer set search_path = '' as $$
  select a.id, v.destino_id, d.origem || ' → ' || d.destino, a.expira_em, a.confirmado_em, statement_timestamp()
    from public.avisos_de_chegada a
    join public.viagens v on v.id = a.viagem_id
    join public.destinos d on d.id = v.destino_id
    join public.matriculas m on m.id = a.matricula_id
   where (
      (
        p_viagem_id is null and p_matricula_id is null
        and a.passageiro_id = (select auth.uid())
        and a.confirmado_em is null and a.expira_em > statement_timestamp()
      )
      or (
        a.viagem_id = p_viagem_id and a.matricula_id = p_matricula_id
        and v.vanzeiro_id = (select auth.uid())
      )
    )
    and public.proxima_matricula_para_aviso(v) = m.id
    and m.pessoa_id = a.passageiro_id and m.saiu_em is null
    and m.destino_id = v.destino_id and m.vanzeiro_id = v.vanzeiro_id
  order by a.criado_em, a.id
$$;

revoke all on function public.ler_avisos_de_chegada(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.ler_avisos_de_chegada(text, text) to authenticated;


-- Esta linha interna reaproveita a fila de push, sem entrar no sininho.
create or replace function public.enfileirar_push_de_chegada()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.avisos (
    id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, lido, apagado
  )
  select 'chegada_' || new.id, v.vanzeiro_id, new.passageiro_id::text, 'chegada_no_ponto',
         'O vanzeiro está aguardando no seu ponto de embarque.',
         'chegada_' || new.id, v.destino_id, new.matricula_id, true, true
  from public.viagens v where v.id = new.viagem_id;
  return null;
end $$;
revoke all on function public.enfileirar_push_de_chegada() from public, anon, authenticated, service_role;
create or replace trigger enfileirar_push_de_chegada after insert on public.avisos_de_chegada
  for each row execute function public.enfileirar_push_de_chegada();

-- A entrega só vale na parada atual, até o primeiro aceite ou o fim do prazo.
-- A consulta retorna apenas a validade restante, sem identidade ou dados da viagem.
create or replace function public.validade_push_de_chegada(p_aviso_id uuid)
returns integer
language sql stable security definer set search_path = '' as $$
  select floor(extract(epoch from a.expira_em - statement_timestamp()))::integer
  from public.avisos_de_chegada a
  join public.viagens v on v.id = a.viagem_id
  join public.matriculas m on m.id = a.matricula_id
  join public.avisos n on n.id = 'chegada_' || a.id and n.tipo = 'chegada_no_ponto'
    and n.para = a.passageiro_id::text and n.matricula_id = a.matricula_id
  where a.id = p_aviso_id and a.confirmado_em is null and a.expira_em > statement_timestamp()
    and public.proxima_matricula_para_aviso(v) = m.id
    and m.pessoa_id = a.passageiro_id and m.saiu_em is null
    and m.destino_id = v.destino_id and m.vanzeiro_id = v.vanzeiro_id
$$;
revoke all on function public.validade_push_de_chegada(uuid) from public, anon, authenticated, service_role;
grant execute on function public.validade_push_de_chegada(uuid) to service_role;

-- O app pode ser publicado antes do banco. Só mostra o botão quando esta etapa foi aplicada.
create or replace function public.chegada_disponivel()
returns boolean
language sql stable set search_path = '' as $$ select true $$;
revoke all on function public.chegada_disponivel() from public, anon, authenticated, service_role;
grant execute on function public.chegada_disponivel() to authenticated;
