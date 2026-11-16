-- O Vanzeiro — W2 a W8: todos os dados do app (docs/banco-de-dados.md, seções 2.2 a 2.17 e 7).
-- Depende da W1 (20261116120000_w1_contas.sql). Pode rodar de novo sem estragar nada.
-- Os identificadores são texto (o app cria com `novoId`; cobranças usam "matrícula_vencimento").
-- Datas do app são de Brasília: o dia de hoje é `public.hoje_em_brasilia()`.

create extension if not exists pgcrypto;

create or replace function public.hoje_em_brasilia() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

-- ---------- 2.2 Perfil do vanzeiro ----------
create table if not exists public.perfis_vanzeiro (
  id uuid primary key references public.contas (id) on delete cascade,
  nome text not null default '',
  telefone text not null default '',
  pix text not null default '',
  van_modelo text not null default '',
  van_placa text not null default '',
  van_lugares int check (van_lugares between 1 and 60)
);

-- ---------- 2.3 Destinos ----------
create table if not exists public.destinos (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  origem text not null,
  destino text not null,
  tipo text not null check (tipo in ('fixa', 'avulsa')),
  dias text[] not null default '{}' check (dias <@ array['seg','ter','qua','qui','sex','sab','dom']),
  data date,
  saida text not null check (saida ~ '^[0-2][0-9]:[0-5][0-9]$'),
  volta text check (volta ~ '^[0-2][0-9]:[0-5][0-9]$'),
  volta_data date,
  paradas text[] not null default '{}',
  -- Regra 3: código de convite único no app inteiro.
  convite text not null unique,
  -- Regra 4: só estes prazos.
  prazo text not null check (prazo in ('30min', '1h', '2h', 'noite-anterior')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  check (tipo = 'fixa' or data is not null)
);

-- Regra 4: viagem avulsa nunca no passado (ao criar ou ao mudar a data).
create or replace function public.destino_sem_data_passada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.tipo = 'avulsa' and new.data is not null
     and (tg_op = 'INSERT' or new.data is distinct from old.data)
     and new.data < public.hoje_em_brasilia() then
    raise exception 'A data da viagem já passou.';
  end if;
  return new;
end $$;
drop trigger if exists destino_data on public.destinos;
create trigger destino_data before insert or update on public.destinos
  for each row execute function public.destino_sem_data_passada();

-- ---------- 2.7.1 Dias sem viagem (feriado) ----------
create table if not exists public.dias_sem_viagem (
  destino_id text not null references public.destinos (id) on delete cascade,
  data date not null,
  motivo text not null check (length(trim(motivo)) between 1 and 60),
  cancelado_em date not null default public.hoje_em_brasilia(),
  primary key (destino_id, data)
);

-- ---------- 2.4 Matrículas (passageiro em um destino) ----------
create table if not exists public.matriculas (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  destino_id text not null references public.destinos (id),
  -- A conta do passageiro, quando ele tem (2.17: juntar pelo telefone).
  pessoa_id uuid references public.contas (id) on delete set null,
  nome text not null,
  telefone text not null check (telefone ~ '^[0-9]{10,11}$'),
  cidade text not null default '',
  endereco text not null default '',
  ponto_lat double precision,
  ponto_lng double precision,
  ordem int,
  plano text not null check (plano in ('viagem', 'diario', 'quinzenal', 'mensal')),
  -- Regra 5: valor maior que zero (centavos); vencimento só em Mensal e Quinzenal; desconto só neles.
  valor int not null check (valor > 0),
  vencimento int check (vencimento between 1 and 31),
  desconta_faltas boolean not null default false,
  valor_falta int check (valor_falta > 0),
  entrou_em date not null default public.hoje_em_brasilia(),
  saiu_em date,
  check ((plano in ('mensal', 'quinzenal')) = (vencimento is not null)),
  check (not desconta_faltas or (plano in ('mensal', 'quinzenal') and valor_falta is not null))
);
-- Regra 5: telefone não se repete no mesmo destino (entre quem ainda está nele).
create unique index if not exists matriculas_telefone_no_destino on public.matriculas (destino_id, telefone) where saiu_em is null;

-- ---------- 2.5 Pedidos para entrar ----------
create table if not exists public.pedidos (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  destino_id text not null references public.destinos (id) on delete cascade,
  pessoa_id uuid references public.contas (id) on delete set null,
  nome text not null,
  telefone text not null,
  cidade text,
  endereco text,
  ponto_lat double precision,
  ponto_lng double precision,
  situacao text not null default 'aguardando' check (situacao in ('aguardando', 'aceito', 'recusado')),
  matricula_id text references public.matriculas (id) on delete set null,
  pedido_em date not null default public.hoje_em_brasilia(),
  respondido_em date
);

-- ---------- 2.5.1 Mudanças de endereço ----------
create table if not exists public.mudancas_endereco (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  destino_id text not null references public.destinos (id) on delete cascade,
  matricula_id text not null references public.matriculas (id) on delete cascade,
  nome text not null,
  de jsonb not null,
  para jsonb not null,
  distancia_km double precision,
  pedido_em date not null default public.hoje_em_brasilia(),
  situacao text not null default 'aguardando' check (situacao in ('aguardando', 'aceita', 'recusada', 'cancelada')),
  respondido_em date
);

-- ---------- 2.17 Juntar o cadastro do vanzeiro com a conta, pelo telefone ----------
create table if not exists public.juntar_conta (
  matricula_id text not null references public.matriculas (id) on delete cascade,
  conta_id uuid not null references public.contas (id) on delete cascade,
  telefone text not null,
  situacao text not null default 'aguardando' check (situacao in ('aguardando', 'confirmada', 'recusada')),
  pedido_em date not null default public.hoje_em_brasilia(),
  respondido_em date,
  primary key (matricula_id, conta_id)
);

-- ---------- 2.6 Respostas (Vou / Não vou) e 2.15 respostas deixadas prontas ----------
create table if not exists public.respostas (
  matricula_id text not null references public.matriculas (id) on delete cascade,
  data date not null,
  resposta text not null check (resposta in ('vai', 'nao-vai')),
  respondida_em timestamptz not null default now(),
  prazo timestamptz not null,
  primary key (matricula_id, data)
);
create table if not exists public.vou_sempre (
  id text primary key default gen_random_uuid()::text,
  matricula_id text not null references public.matriculas (id) on delete cascade,
  desde timestamptz not null default now(),
  ate timestamptz
);
create table if not exists public.nao_vou_periodos (
  id text primary key default gen_random_uuid()::text,
  matricula_id text not null references public.matriculas (id) on delete cascade,
  de date not null,
  ate date not null,
  em timestamptz not null default now(),
  tirado_em timestamptz,
  check (ate >= de)
);

-- ---------- 2.7 Viagens (o estado completo da viagem do dia, salvo a cada toque) ----------
create table if not exists public.viagens (
  id text primary key,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  destino_id text not null references public.destinos (id) on delete cascade,
  data date not null,
  fase text not null,
  -- A viagem como o app guarda (`ViagemDoDia`): ordem, embarcaram, conferência, volta…
  estado jsonb not null,
  comecou_em timestamptz not null default now(),
  terminou_em timestamptz,
  unique (destino_id, data)
);

-- ---------- 2.8 Acontecimentos que viram cobrança e desconto ----------
create table if not exists public.embarques (
  matricula_id text not null references public.matriculas (id) on delete cascade,
  data date not null,
  viagem_id text references public.viagens (id) on delete set null,
  primary key (matricula_id, data)
);
create table if not exists public.faltas (
  matricula_id text not null references public.matriculas (id) on delete cascade,
  data date not null,
  avisou_no_prazo boolean not null,
  avisou_em text,
  primary key (matricula_id, data)
);

-- ---------- 2.9 e 2.10 Cobranças, pagamentos e cancelamentos ----------
create table if not exists public.cobrancas (
  id text primary key,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  viagem_id text,
  matricula_id text not null references public.matriculas (id),
  destino_id text not null,
  nome text not null,
  telefone text not null,
  tipo text not null check (tipo in ('viagem', 'diario', 'quinzenal', 'mensal')),
  referencia text not null,
  vencimento date not null,
  valor_base int not null check (valor_base > 0),
  faltas int not null default 0 check (faltas >= 0),
  valor_falta int not null default 0 check (valor_falta >= 0),
  periodo_de date,
  periodo_ate date,
  pagamento_data date,
  pagamento_forma text check (pagamento_forma in ('dinheiro', 'pix')),
  cancelamento_data date,
  cancelamento_motivo text,
  criada_em timestamptz not null default now(),
  check ((pagamento_data is null) = (pagamento_forma is null)),
  check (cancelamento_data is null or length(trim(cancelamento_motivo)) > 0),
  check (pagamento_data is null or cancelamento_data is null)
);

-- Regra 14: uma cobrança nunca é editada. Só pode: ser marcada como paga, ser cancelada (com motivo),
-- ou, enquanto não paga nem cancelada, receber as faltas avisadas no prazo (regra 16).
create or replace function public.cobranca_nunca_editada() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.pagamento_data is not null or old.cancelamento_data is not null then
    raise exception 'Esta cobrança já foi paga ou cancelada e não muda mais.';
  end if;
  if (new.id, new.vanzeiro_id, new.matricula_id, new.destino_id, new.tipo, new.referencia, new.vencimento, new.valor_base, new.nome, new.telefone)
     is distinct from
     (old.id, old.vanzeiro_id, old.matricula_id, old.destino_id, old.tipo, old.referencia, old.vencimento, old.valor_base, old.nome, old.telefone) then
    raise exception 'Uma cobrança nunca é editada: só pode ser paga ou cancelada.';
  end if;
  return new;
end $$;
drop trigger if exists cobranca_sem_edicao on public.cobrancas;
create trigger cobranca_sem_edicao before update on public.cobrancas
  for each row execute function public.cobranca_nunca_editada();

-- ---------- 2.11 Avisos (sininho) ----------
create table if not exists public.avisos (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  -- Para quem: a conta do vanzeiro ou a da pessoa (quando a matrícula ainda não tem conta, fica a identidade do app).
  para text not null,
  tipo text not null,
  texto text not null,
  chave text,
  destino_id text,
  matricula_id text,
  cobranca_id text,
  criado_em date not null default public.hoje_em_brasilia(),
  lido boolean not null default false,
  unique (para, chave)
);

-- ---------- 2.16 Gastos da van ----------
create table if not exists public.gastos (
  id text primary key default gen_random_uuid()::text,
  vanzeiro_id uuid not null references public.contas (id) on delete cascade,
  tipo text not null check (tipo in ('combustivel', 'manutencao', 'pedagio', 'documentos', 'outros')),
  descricao text not null default '',
  valor int not null check (valor > 0),
  data date not null,
  check (tipo <> 'outros' or length(trim(descricao)) > 0)
);
-- Regra 18: dia do gasto até hoje.
create or replace function public.gasto_ate_hoje() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.data > public.hoje_em_brasilia() then raise exception 'O dia do gasto não pode ser depois de hoje.'; end if;
  return new;
end $$;
drop trigger if exists gasto_data on public.gastos;
create trigger gasto_data before insert or update on public.gastos
  for each row execute function public.gasto_ate_hoje();

-- ---------- 2.13 Cidades no mapa e 2.14 Celulares para notificar ----------
create table if not exists public.cidades (
  nome text primary key,
  lat double precision not null,
  lng double precision not null,
  achada_em date not null default public.hoje_em_brasilia(),
  conferida boolean not null default false
);
create table if not exists public.celulares (
  id text primary key default gen_random_uuid()::text,
  conta_id uuid not null references public.contas (id) on delete cascade,
  endereco jsonb not null,
  criado_em timestamptz not null default now()
);

-- =====================================================================================
-- Quem vê o quê (regra 2). Funções de apoio que olham as regras sem passar por elas.
-- =====================================================================================

create or replace function public.sou_vanzeiro_do_destino(d text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.destinos where id = d and vanzeiro_id = auth.uid())
$$;
create or replace function public.estou_no_destino(d text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where destino_id = d and pessoa_id = auth.uid())
$$;
create or replace function public.minha_matricula(m text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where id = m and pessoa_id = auth.uid())
$$;
create or replace function public.sou_vanzeiro_da_matricula(m text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where id = m and vanzeiro_id = auth.uid())
$$;
create or replace function public.sou_passageiro_do_vanzeiro(v uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.matriculas where vanzeiro_id = v and pessoa_id = auth.uid())
$$;

alter table public.perfis_vanzeiro enable row level security;
alter table public.destinos enable row level security;
alter table public.dias_sem_viagem enable row level security;
alter table public.matriculas enable row level security;
alter table public.pedidos enable row level security;
alter table public.mudancas_endereco enable row level security;
alter table public.juntar_conta enable row level security;
alter table public.respostas enable row level security;
alter table public.vou_sempre enable row level security;
alter table public.nao_vou_periodos enable row level security;
alter table public.viagens enable row level security;
alter table public.embarques enable row level security;
alter table public.faltas enable row level security;
alter table public.cobrancas enable row level security;
alter table public.avisos enable row level security;
alter table public.gastos enable row level security;
alter table public.cidades enable row level security;
alter table public.celulares enable row level security;

-- Recria as regras de acesso do zero (para poder rodar de novo).
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in
    ('perfis_vanzeiro','destinos','dias_sem_viagem','matriculas','pedidos','mudancas_endereco','juntar_conta','respostas',
     'vou_sempre','nao_vou_periodos','viagens','embarques','faltas','cobrancas','avisos','gastos','cidades','celulares')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Perfil do vanzeiro: ele vê e muda o dele; os passageiros dele veem (nome, telefone, Pix, van).
create policy "perfil: o dono" on public.perfis_vanzeiro for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "perfil: os passageiros dele" on public.perfis_vanzeiro for select to authenticated using (public.sou_passageiro_do_vanzeiro(id));

-- Destinos: o vanzeiro dono faz tudo; o passageiro vê os destinos em que está.
create policy "destinos: o dono" on public.destinos for all to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid());
create policy "destinos: quem está nele" on public.destinos for select to authenticated using (public.estou_no_destino(id));

-- Dias sem viagem (regra 13): só o vanzeiro muda; os passageiros do destino veem.
create policy "dias sem viagem: o dono" on public.dias_sem_viagem for all to authenticated
  using (public.sou_vanzeiro_do_destino(destino_id)) with check (public.sou_vanzeiro_do_destino(destino_id) and data >= public.hoje_em_brasilia());
create policy "dias sem viagem: quem está no destino" on public.dias_sem_viagem for select to authenticated using (public.estou_no_destino(destino_id));

-- Matrículas: o vanzeiro dono faz tudo; a pessoa vê as dela (inclusive as de que saiu). O que a pessoa muda passa por funções (regra 6).
create policy "matrículas: o dono" on public.matriculas for all to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid() and public.sou_vanzeiro_do_destino(destino_id));
create policy "matrículas: a própria pessoa" on public.matriculas for select to authenticated using (pessoa_id = auth.uid());

-- Pedidos (regra 7): a pessoa cria pela função do convite e vê os dela; só o vanzeiro responde.
create policy "pedidos: o dono" on public.pedidos for select to authenticated using (vanzeiro_id = auth.uid());
create policy "pedidos: o dono responde" on public.pedidos for update to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid());
create policy "pedidos: a própria pessoa" on public.pedidos for select to authenticated using (pessoa_id = auth.uid());

-- Mudanças de endereço: a pessoa cria pela função (regra 1 km) e vê as dela; o vanzeiro vê e responde.
create policy "mudanças: o dono" on public.mudancas_endereco for select to authenticated using (vanzeiro_id = auth.uid());
create policy "mudanças: o dono responde" on public.mudancas_endereco for update to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid());
create policy "mudanças: a própria pessoa" on public.mudancas_endereco for select to authenticated using (public.minha_matricula(matricula_id));

-- Juntar pelo telefone (regra 8): a pessoa vê o dela; o vanzeiro vê e confirma.
create policy "juntar: a própria pessoa" on public.juntar_conta for select to authenticated using (conta_id = auth.uid());
create policy "juntar: o vanzeiro" on public.juntar_conta for select to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id));

-- Respostas (regras 9 e 10): a pessoa responde pela função `responder`; o vanzeiro e a pessoa veem.
create policy "respostas: o vanzeiro" on public.respostas for select to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id));
create policy "respostas: a própria pessoa" on public.respostas for select to authenticated using (public.minha_matricula(matricula_id));
create policy "vou sempre: a própria pessoa" on public.vou_sempre for all to authenticated using (public.minha_matricula(matricula_id)) with check (public.minha_matricula(matricula_id));
create policy "vou sempre: o vanzeiro" on public.vou_sempre for select to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id));
create policy "não vou: a própria pessoa" on public.nao_vou_periodos for all to authenticated
  using (public.minha_matricula(matricula_id)) with check (public.minha_matricula(matricula_id) and de >= public.hoje_em_brasilia());
create policy "não vou: o vanzeiro" on public.nao_vou_periodos for select to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id));

-- Viagem (regra 12): só o vanzeiro faz; o passageiro vê a do destino dele ("Estou na van" passa por função).
create policy "viagens: o dono" on public.viagens for all to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid() and public.sou_vanzeiro_do_destino(destino_id));
create policy "viagens: quem está no destino" on public.viagens for select to authenticated using (public.estou_no_destino(destino_id));
create policy "embarques: o vanzeiro" on public.embarques for all to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id)) with check (public.sou_vanzeiro_da_matricula(matricula_id));
create policy "embarques: a própria pessoa" on public.embarques for select to authenticated using (public.minha_matricula(matricula_id));
create policy "faltas: o vanzeiro" on public.faltas for all to authenticated using (public.sou_vanzeiro_da_matricula(matricula_id)) with check (public.sou_vanzeiro_da_matricula(matricula_id));
create policy "faltas: a própria pessoa" on public.faltas for select to authenticated using (public.minha_matricula(matricula_id));

-- Cobranças (regras 14 a 17): o vanzeiro cria, marca como paga ou cancela; nunca apaga; a pessoa só vê as dela.
create policy "cobranças: o dono vê" on public.cobrancas for select to authenticated using (vanzeiro_id = auth.uid());
create policy "cobranças: o dono cria" on public.cobrancas for insert to authenticated with check (vanzeiro_id = auth.uid() and public.sou_vanzeiro_da_matricula(matricula_id));
create policy "cobranças: o dono paga ou cancela" on public.cobrancas for update to authenticated using (vanzeiro_id = auth.uid()) with check (vanzeiro_id = auth.uid());
create policy "cobranças: a própria pessoa" on public.cobrancas for select to authenticated using (public.minha_matricula(matricula_id));

-- Avisos (regra 19): só o destinatário vê e marca como lido; quem cria é alguém do mesmo destino.
create policy "avisos: o destinatário" on public.avisos for select to authenticated using (para = auth.uid()::text);
create policy "avisos: marcar como lido" on public.avisos for update to authenticated using (para = auth.uid()::text) with check (para = auth.uid()::text);
create policy "avisos: criar" on public.avisos for insert to authenticated with check (
  vanzeiro_id = auth.uid() or (destino_id is not null and public.estou_no_destino(destino_id))
);

-- Gastos (regra 18): só o vanzeiro dono; nunca editados (apaga e anota de novo).
create policy "gastos: o dono vê" on public.gastos for select to authenticated using (vanzeiro_id = auth.uid());
create policy "gastos: o dono anota" on public.gastos for insert to authenticated with check (vanzeiro_id = auth.uid());
create policy "gastos: o dono apaga" on public.gastos for delete to authenticated using (vanzeiro_id = auth.uid());

-- Cidades: todos veem; quem está logado pode acrescentar uma cidade nova.
create policy "cidades: todos veem" on public.cidades for select to authenticated using (true);
create policy "cidades: acrescentar" on public.cidades for insert to authenticated with check (true);

-- Celulares: só a própria pessoa.
create policy "celulares: o dono" on public.celulares for all to authenticated using (conta_id = auth.uid()) with check (conta_id = auth.uid());

-- =====================================================================================
-- O que a pessoa faz em dados que não são dela (funções que conferem as regras).
-- =====================================================================================

-- Prazo de confirmação da viagem de um dia (Brasília): 30 min, 1 h, 2 h antes da saída, ou 20h da noite anterior.
create or replace function public.prazo_da_viagem(d public.destinos, dia date) returns timestamptz
language sql stable set search_path = '' as $$
  select case d.prazo
    when 'noite-anterior' then ((dia - 1) + time '20:00') at time zone 'America/Sao_Paulo'
    else ((dia + d.saida::time) - case d.prazo when '30min' then interval '30 minutes' when '1h' then interval '1 hour' else interval '2 hours' end)
         at time zone 'America/Sao_Paulo'
  end
$$;

-- Regras 9, 10 e 11: "Vou" / "Não vou" só pela própria pessoa, até o prazo, antes de a viagem começar, e "Vou" só com lugar.
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
  select * into d from public.destinos where id = m.destino_id;
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

-- O passageiro acha o destino pelo código de convite (só o que precisa para pedir para entrar).
create or replace function public.destino_pelo_convite(codigo text)
returns table (id text, origem text, destino text, paradas text[], saida text, vanzeiro_nome text)
language sql stable security definer set search_path = '' as $$
  select d.id, d.origem, d.destino, d.paradas, d.saida, coalesce(p.nome, '')
  from public.destinos d left join public.perfis_vanzeiro p on p.id = d.vanzeiro_id
  where upper(d.convite) = upper(trim(codigo)) and d.ativo
$$;

-- Regra 7: pedir para entrar com um código válido.
create or replace function public.pedir_para_entrar(codigo text, nome text, telefone text, cidade text, endereco text, lat double precision, lng double precision)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  d public.destinos;
  novo text;
begin
  select * into d from public.destinos where upper(convite) = upper(trim(codigo)) and ativo;
  if not found then raise exception 'Código não encontrado. Confira o código com o vanzeiro.'; end if;
  if exists (select 1 from public.matriculas where destino_id = d.id and pessoa_id = auth.uid() and saiu_em is null) then
    raise exception 'Você já está neste destino.';
  end if;
  insert into public.pedidos (vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, ponto_lat, ponto_lng)
  values (d.vanzeiro_id, d.id, auth.uid(), trim(nome), telefone, cidade, endereco, lat, lng)
  returning id into novo;
  return novo;
end $$;

-- Regra 12: "Estou na van" só pelo próprio passageiro, para si, na viagem em andamento do destino dele.
create or replace function public.estou_na_van(viagem text, matricula text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.viagens;
begin
  if not exists (select 1 from public.matriculas where id = matricula and pessoa_id = auth.uid()) then
    raise exception 'Só dá para confirmar por você mesmo.';
  end if;
  select * into v from public.viagens where id = viagem and fase <> 'encerrada';
  if not found then raise exception 'Nenhuma viagem está acontecendo agora.'; end if;
  update public.viagens
  set estado = jsonb_set(
        jsonb_set(estado, array['conferencia', matricula], '"na-van"'),
        '{peloCelular}', coalesce(estado -> 'peloCelular', '[]'::jsonb) || to_jsonb(matricula))
  where id = viagem;
end $$;

-- Regra 6: a pessoa muda só o próprio nome e telefone (em todas as matrículas dela).
create or replace function public.salvar_meus_dados(novo_nome text, novo_telefone text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if length(trim(novo_nome)) = 0 then raise exception 'Digite seu nome.'; end if;
  update public.matriculas set nome = trim(novo_nome), telefone = novo_telefone where pessoa_id = auth.uid() and saiu_em is null;
  update public.contas set nome = trim(novo_nome) where id = auth.uid();
end $$;

-- Regra 6: endereço até 1 km do ponto combinado muda na hora; mais longe vira pedido para o vanzeiro.
create or replace function public.mudar_meu_embarque(matricula text, nova_cidade text, novo_endereco text, lat double precision, lng double precision, distancia_km double precision)
returns text
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  update public.mudancas_endereco set situacao = 'cancelada', respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and situacao = 'aguardando';
  if m.cidade = nova_cidade and distancia_km is not null and distancia_km <= 1 then
    update public.matriculas set endereco = trim(novo_endereco), ponto_lat = lat, ponto_lng = lng where id = matricula;
    return 'salvo';
  end if;
  insert into public.mudancas_endereco (vanzeiro_id, destino_id, matricula_id, nome, de, para, distancia_km)
  values (m.vanzeiro_id, m.destino_id, m.id, m.nome,
          jsonb_build_object('cidade', m.cidade, 'endereco', m.endereco, 'ponto', case when m.ponto_lat is null then null else jsonb_build_object('lat', m.ponto_lat, 'lng', m.ponto_lng) end),
          jsonb_build_object('cidade', nova_cidade, 'endereco', trim(novo_endereco), 'ponto', case when lat is null then null else jsonb_build_object('lat', lat, 'lng', lng) end),
          distancia_km);
  return 'aguardando';
end $$;

-- "Sair deste destino": a pessoa sai; as pendentes dela ali são canceladas (as devendo continuam).
create or replace function public.sair_do_destino(matricula text) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.matriculas;
begin
  select * into m from public.matriculas where id = matricula and pessoa_id = auth.uid() and saiu_em is null;
  if not found then raise exception 'Não achamos este destino. Ele pode ter sido excluído ou você saiu dele.'; end if;
  if exists (select 1 from public.viagens where destino_id = m.destino_id and data = public.hoje_em_brasilia() and fase <> 'encerrada') then
    raise exception 'A viagem de hoje deste destino está acontecendo. Espere ela terminar.';
  end if;
  update public.matriculas set saiu_em = public.hoje_em_brasilia() where id = matricula;
  update public.cobrancas set cancelamento_data = public.hoje_em_brasilia(), cancelamento_motivo = 'Saiu do destino'
    where matricula_id = matricula and pagamento_data is null and cancelamento_data is null and vencimento >= public.hoje_em_brasilia();
  update public.mudancas_endereco set situacao = 'cancelada', respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and situacao = 'aguardando';
end $$;

-- 2.17 (regra 8): ao entrar como passageiro, a conta pede para juntar com o cadastro de mesmo telefone;
-- o vanzeiro confirma com `confirmar_juntar_conta`.
create or replace function public.pedir_juntar_pelo_telefone(meu_telefone text) returns int
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  insert into public.juntar_conta (matricula_id, conta_id, telefone)
  select m.id, auth.uid(), m.telefone from public.matriculas m
  where m.telefone = meu_telefone and m.pessoa_id is null and m.saiu_em is null
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.confirmar_juntar_conta(matricula text, conta uuid, aceitar boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.sou_vanzeiro_da_matricula(matricula) then raise exception 'Só o vanzeiro do destino confirma.'; end if;
  update public.juntar_conta set situacao = case when aceitar then 'confirmada' else 'recusada' end, respondido_em = public.hoje_em_brasilia()
    where matricula_id = matricula and conta_id = conta and situacao = 'aguardando';
  if not found then raise exception 'Este pedido já foi respondido.'; end if;
  if aceitar then
    if exists (select 1 from public.matriculas x join public.matriculas y on y.destino_id = x.destino_id
               where x.id = matricula and y.pessoa_id = conta and y.saiu_em is null) then
      raise exception 'Esta conta já está neste destino.';
    end if;
    update public.matriculas set pessoa_id = conta where id = matricula;
  end if;
end $$;

-- Quem pode chamar cada função.
revoke all on function public.responder(text, date, text) from public, anon;
revoke all on function public.destino_pelo_convite(text) from public, anon;
revoke all on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) from public, anon;
revoke all on function public.estou_na_van(text, text) from public, anon;
revoke all on function public.salvar_meus_dados(text, text) from public, anon;
revoke all on function public.mudar_meu_embarque(text, text, text, double precision, double precision, double precision) from public, anon;
revoke all on function public.sair_do_destino(text) from public, anon;
revoke all on function public.pedir_juntar_pelo_telefone(text) from public, anon;
revoke all on function public.confirmar_juntar_conta(text, uuid, boolean) from public, anon;
grant execute on function public.responder(text, date, text) to authenticated;
grant execute on function public.destino_pelo_convite(text) to authenticated;
grant execute on function public.pedir_para_entrar(text, text, text, text, text, double precision, double precision) to authenticated;
grant execute on function public.estou_na_van(text, text) to authenticated;
grant execute on function public.salvar_meus_dados(text, text) to authenticated;
grant execute on function public.mudar_meu_embarque(text, text, text, double precision, double precision, double precision) to authenticated;
grant execute on function public.sair_do_destino(text) to authenticated;
grant execute on function public.pedir_juntar_pelo_telefone(text) to authenticated;
grant execute on function public.confirmar_juntar_conta(text, uuid, boolean) to authenticated;

-- O perfil do vanzeiro nasce quando a conta escolhe "Sou vanzeiro" pela primeira vez.
create or replace function public.escolher_papel(papel text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if papel not in ('vanzeiro', 'passageiro') then return; end if;
  update public.contas
  set ultimo_papel = papel,
      e_vanzeiro = e_vanzeiro or papel = 'vanzeiro',
      e_passageiro = e_passageiro or papel = 'passageiro'
  where id = auth.uid();
  if papel = 'vanzeiro' then
    insert into public.perfis_vanzeiro (id, nome) select id, nome from public.contas where id = auth.uid()
    on conflict (id) do nothing;
  end if;
end $$;
grant execute on function public.escolher_papel(text) to authenticated;
