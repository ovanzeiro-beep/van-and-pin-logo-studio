-- Uma entrega por evento, conta e endereço. Renovar a inscrição na mesma conta preserva a pendência.
create table if not exists public.entregas_push (
  id bigint generated always as identity primary key,
  origem text not null check (origem in ('aviso', 'pedido')),
  evento_id text not null,
  conta_id uuid not null references public.contas (id) on delete cascade,
  endpoint text not null,
  tipo text not null,
  texto text not null,
  criada_em timestamptz not null default now(),
  tentar_em timestamptz not null default now(),
  ficha uuid,
  unique (origem, evento_id, conta_id, endpoint)
);
alter table public.entregas_push enable row level security;
revoke all on table public.entregas_push from public, anon, authenticated, service_role;
create index if not exists entregas_push_prontas_idx on public.entregas_push (tentar_em, id);
create index if not exists entregas_push_conta_idx on public.entregas_push (conta_id);

create or replace function public.reservar_entregas_push()
returns table (entrega_id bigint, ficha uuid, tag text, tipo text, texto text, endereco jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  -- A confirmação de leitura da origem e a criação das entregas acontecem na mesma transação.
  with prontos as (
    select a.id from public.avisos a where a.enviado_em is null
    order by a.criado_em, a.id limit 100 for update skip locked
  ), avisos as (
    update public.avisos a set enviado_em = now() from prontos p where a.id = p.id
    returning a.id, a.para, a.tipo, a.texto
  )
  insert into public.entregas_push (origem, evento_id, conta_id, endpoint, tipo, texto)
  select 'aviso', a.id, c.conta_id, c.endereco->>'endpoint', a.tipo, a.texto
  from avisos a join public.celulares c on c.conta_id::text = a.para
  where c.endereco->>'endpoint' is not null
  on conflict do nothing;

  with prontos as (
    select p.id from public.pedidos p where p.avisado_em is null
    order by p.pedido_em, p.id limit 100 for update skip locked
  ), pedidos as (
    update public.pedidos p set avisado_em = now() from prontos x where p.id = x.id
    returning p.id, p.vanzeiro_id, p.destino_id, p.nome, p.situacao
  )
  insert into public.entregas_push (origem, evento_id, conta_id, endpoint, tipo, texto)
  select 'pedido', p.id, c.conta_id, c.endereco->>'endpoint', 'pedido_novo',
         p.nome || ' quer entrar em ' || d.origem || ' → ' || d.destino
  from pedidos p join public.destinos d on d.id = p.destino_id
    join public.celulares c on c.conta_id = p.vanzeiro_id
  where p.situacao = 'aguardando' and c.endereco->>'endpoint' is not null
  on conflict do nothing;

  delete from public.entregas_push e
  where e.criada_em <= now() - interval '24 hours'
    or not exists (
      select 1 from public.celulares c where c.conta_id = e.conta_id
        and c.endereco->>'endpoint' = e.endpoint
    )
    or (e.origem = 'aviso' and not exists (
      select 1 from public.avisos a where a.id = e.evento_id and a.para = e.conta_id::text
    ))
    or (e.origem = 'pedido' and not exists (
      select 1 from public.pedidos p where p.id = e.evento_id and p.situacao = 'aguardando'
    ));

  -- Se o processo cair, uma nova execução pode assumir a entrega depois de dois minutos.
  return query
    with prontos as (
      select e.id from public.entregas_push e where e.tentar_em <= now()
      order by e.tentar_em, e.id limit 25 for update skip locked
    ), reservados as (
      update public.entregas_push e set tentar_em = now() + interval '2 minutes', ficha = gen_random_uuid()
      from prontos p where e.id = p.id
      returning e.*
    )
    select r.id, r.ficha, r.evento_id, r.tipo, r.texto, c.endereco
    from reservados r
    cross join lateral (
      select s.endereco from public.celulares s where s.conta_id = r.conta_id
        and s.endereco->>'endpoint' = r.endpoint order by s.criado_em desc, s.id limit 1
    ) c;
end $$;

create or replace function public.finalizar_entrega_push(entrega_id bigint, reserva uuid, resultado text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  tarefa public.entregas_push;
begin
  if resultado is null or resultado not in ('enviado', 'repetir', 'celular_invalido') then
    raise exception 'Resultado de entrega inválido.';
  end if;
  select * into tarefa from public.entregas_push e
  where e.id = entrega_id and e.ficha = reserva for update;
  if not found then return; end if;

  if resultado = 'repetir' then
    update public.entregas_push e set ficha = null, tentar_em = now() + interval '1 minute'
    where e.id = tarefa.id;
    return;
  end if;

  if resultado = 'celular_invalido' then
    delete from public.celulares c where c.conta_id = tarefa.conta_id
      and c.endereco->>'endpoint' = tarefa.endpoint;
  end if;
  delete from public.entregas_push e where e.id = tarefa.id;
end $$;

revoke all on function public.reservar_entregas_push() from public, anon, authenticated;
revoke all on function public.finalizar_entrega_push(bigint, uuid, text) from public, anon, authenticated;
grant execute on function public.reservar_entregas_push() to service_role;
grant execute on function public.finalizar_entrega_push(bigint, uuid, text) to service_role;

-- O disparo atual entrega imediatamente; este agendamento cobre a fila de tentativas e lotes maiores.
select cron.schedule(
  'vanzeiro-reenvio-push',
  '* * * * *',
  $job$
  select net.http_post(
    url := 'https://rnziztwicggdekmpwpgy.supabase.co/functions/v1/avisos-no-celular',
    body := '{}'::jsonb, headers := '{"Content-Type":"application/json"}'::jsonb
  )
  where exists (select 1 from public.entregas_push e where e.tentar_em <= now())
    or exists (select 1 from public.avisos a where a.enviado_em is null)
    or exists (select 1 from public.pedidos p where p.avisado_em is null)
  $job$
);
