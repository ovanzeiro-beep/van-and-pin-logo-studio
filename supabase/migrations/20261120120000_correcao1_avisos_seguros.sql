-- CORREÇÃO 1 (auditoria de 20/11/2026, P0-2): bloqueia avisos falsos no sininho e nas notificações.
--
-- Antes: qualquer pessoa de um destino podia criar, pela `salvar_aviso`, um aviso de QUALQUER tipo e com QUALQUER
-- texto para qualquer pessoa do destino, e podia trocar o texto de um aviso já existente (testes T2.1 a T2.7 em
-- docs/evidencias/2026-11-20-auditoria-fase4.md). Como o aviso vira notificação no celular, isso permitia golpe
-- ("pague no Pix ...") com cara de mensagem oficial do app.
--
-- Agora a função continua com o mesmo nome, os mesmos parâmetros e o mesmo jeito de responder ao app, mas:
--  1. Cada papel só cria os tipos que o próprio app dele cria (tabela abaixo). Tipos feitos só pelo banco
--     (destino excluído, a van está chegando, boa viagem, chegada ao ponto) nunca vêm do app.
--  2. O passageiro só fala pela PRÓPRIA matrícula. Para o vanzeiro, só cria "Resposta de passageiro", e o texto
--     precisa ser exatamente o que o app escreve para uma resposta ou período que existe de verdade no banco.
--     Os avisos que o passageiro cria para si mesmo (presença, prazo, cobrança vencendo) só vão para ele.
--  3. O vanzeiro só avisa passageiros do próprio destino (e "cobrança vencida" só para ele mesmo).
--  4. Trocar um aviso existente: só o passageiro, só os avisos da própria resposta/presença, do mesmo tipo.
--     O vanzeiro nunca troca (o app dele nunca pede isso), então ninguém sobrescreve aviso de outra pessoa.
--  5. Chaves e identificadores usados pelo banco ("boa_viagem_", "chegada_", "destino_excluido_", "proxima_")
--     ficam reservados; o tamanho do texto é limitado.
--
-- | Quem chama   | Tipo                                                      | Para quem                          |
-- | ------------ | --------------------------------------------------------- | ---------------------------------- |
-- | Vanzeiro     | pedido_aceito, pedido_recusado, endereco_aceito,          | passageiro do destino              |
-- |              | endereco_recusado, viagem_cancelada, viagem_de_volta,     |                                    |
-- |              | van_saiu, prazo_chegando, cobranca_vencendo               |                                    |
-- | Vanzeiro     | cobranca_vencida                                          | ele mesmo                          |
-- | Passageiro   | resposta_passageiro (texto conferido)                     | o vanzeiro do destino              |
-- | Passageiro   | presenca_confirmada, ausencia_registrada, prazo_chegando, | ele mesmo                          |
-- |              | cobranca_vencendo                                         |                                    |
--
-- Pode rodar de novo sem quebrar. Não muda tabelas nem dados existentes.

-- Textos que o app escreve (src/lib/avisos.ts), montados aqui para conferir o que chega. Só o banco usa.
create or replace function public.r_primeiro_nome(nome text) returns text
language sql immutable set search_path = '' as $$
  select coalesce((regexp_split_to_array(btrim(coalesce(nome, '')), '\s+'))[1], '')
$$;

-- quandoVai(): "hoje", "na quarta, 18 de nov" ou "no sábado, 21 de nov".
create or replace function public.r_quando_vai(dia date, hoje date) returns text
language sql immutable set search_path = '' as $$
  select case when dia = hoje then 'hoje' else
    (case when extract(dow from dia) in (0, 6) then 'no ' else 'na ' end)
    || (array['domingo','segunda','terça','quarta','quinta','sexta','sábado'])[extract(dow from dia)::int + 1]
    || ', ' || extract(day from dia)::int || ' de '
    || (array['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'])[extract(month from dia)::int] end
$$;

-- avisoDeResposta(): as frases possíveis para a resposta gravada ("vai" tem uma; "nao-vai" tem duas).
create or replace function public.r_textos_da_resposta(nome text, origem text, destino text, dia date, resposta text, hoje date)
returns text[] language sql immutable set search_path = '' as $$
  select case resposta
    when 'vai' then array[
      public.r_primeiro_nome(nome) || ' confirmou que ' || public.r_quando_vai(dia, hoje) || ' vai de ' || origem || ' a ' || destino || '.']
    when 'nao-vai' then array[
      public.r_primeiro_nome(nome) || ' avisou que ' || public.r_quando_vai(dia, hoje) || ' não vai de ' || origem || ' a ' || destino || '.',
      public.r_primeiro_nome(nome) || ' cancelou a participação na viagem de ' || origem || ' a ' || destino
        || ' (' || to_char(dia, 'DD/MM') || '). A vaga foi liberada.']
    else array[]::text[] end
$$;

-- avisoDePeriodoDeNaoVou(): "Ana marcou "Não vou" de 20/11 até 22/11, em A → B" (ou "tirou o").
create or replace function public.r_textos_do_periodo(nome text, origem text, destino text, de date, ate date)
returns text[] language sql immutable set search_path = '' as $$
  select array[
    public.r_primeiro_nome(nome) || ' marcou "Não vou" ' || x.dias || ', em ' || origem || ' → ' || destino,
    public.r_primeiro_nome(nome) || ' tirou o "Não vou" ' || x.dias || ', em ' || origem || ' → ' || destino]
  from (select case when de = ate then 'em ' || to_char(de, 'DD/MM')
                    else 'de ' || to_char(de, 'DD/MM') || ' até ' || to_char(ate, 'DD/MM') end as dias) x
$$;

revoke all on function public.r_primeiro_nome(text) from public, anon, authenticated;
revoke all on function public.r_quando_vai(date, date) from public, anon, authenticated;
revoke all on function public.r_textos_da_resposta(text, text, text, date, text, date) from public, anon, authenticated;
revoke all on function public.r_textos_do_periodo(text, text, text, date, date) from public, anon, authenticated;

create or replace function public.salvar_aviso(aviso jsonb, trocar boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
  hoje date := public.hoje_em_brasilia();
  d_id text := aviso ->> 'destino_id';
  v_para text := aviso ->> 'para';
  v_tipo text := aviso ->> 'tipo';
  v_texto text := aviso ->> 'texto';
  v_id text := aviso ->> 'id';
  v_chave text := coalesce(aviso ->> 'chave', aviso ->> 'id');
  v_mid text := aviso ->> 'matricula_id';
  v_cid text := aviso ->> 'cobranca_id';
  v_criado date;
  d public.destinos;
  m public.matriculas;
  r public.respostas;
  per public.nao_vou_periodos;
  dia date;
  sou_dono boolean;
  pode_trocar boolean := false;
begin
  if eu is null then raise exception 'Entre na sua conta de novo.'; end if;

  -- 1. Só quem é do destino (o vanzeiro dono ou um passageiro que está nele).
  select * into d from public.destinos where id = d_id;
  if not found then raise exception 'Este aviso não é deste destino.'; end if;
  sou_dono := d.vanzeiro_id = eu;
  if not sou_dono and not public.estou_no_destino(d_id) then
    raise exception 'Este aviso não é deste destino.';
  end if;

  -- 2. Aviso completo, de tamanho normal, sem chave ou identificador reservados ao banco.
  if v_id is null or v_tipo is null or v_texto is null or v_para is null or btrim(v_texto) = '' then
    raise exception 'Aviso incompleto.';
  end if;
  if length(v_texto) > 400 or length(v_chave) > 200 or length(v_id) > 200 then
    raise exception 'Aviso grande demais.';
  end if;
  if v_chave ~ '^(boa_viagem|chegada|destino_excluido|proxima)_' or v_id ~ '^(boa_viagem|chegada|destino_excluido|proxima)_' then
    raise exception 'Este aviso só pode ser criado pelo sistema.';
  end if;
  v_criado := coalesce((aviso ->> 'criado_em')::date, hoje);
  if v_criado > hoje + 1 then v_criado := hoje; end if;

  -- A matrícula citada é deste destino.
  if v_mid is not null then
    select * into m from public.matriculas where id = v_mid and destino_id = d_id;
    if not found then raise exception 'Este aviso não é deste destino.'; end if;
  end if;

  if sou_dono then
    -- 3. Vanzeiro: os tipos que o app do vanzeiro cria.
    if v_tipo = 'cobranca_vencida' then
      if v_para <> eu::text or v_chave !~ '^cobranca_vencida_' then
        raise exception 'Este aviso não é para alguém deste destino.';
      end if;
    elsif v_tipo in ('pedido_aceito', 'pedido_recusado', 'endereco_aceito', 'endereco_recusado',
                     'viagem_cancelada', 'viagem_de_volta', 'van_saiu', 'prazo_chegando', 'cobranca_vencendo') then
      if not exists (select 1 from public.matriculas x where x.destino_id = d_id and coalesce(x.pessoa_id::text, x.id) = v_para) then
        raise exception 'Este aviso não é para alguém deste destino.';
      end if;
      if v_mid is not null and coalesce(m.pessoa_id::text, m.id) <> v_para then
        raise exception 'Este aviso não é para alguém deste destino.';
      end if;
    else
      raise exception 'Este tipo de aviso não pode ser criado pelo app.';
    end if;
  else
    -- 4. Passageiro: só pela própria matrícula, ativa, neste destino.
    if v_mid is null or m.pessoa_id is distinct from eu or m.saiu_em is not null then
      raise exception 'Só dá para avisar pela sua própria matrícula.';
    end if;
    if v_tipo = 'resposta_passageiro' then
      if v_para <> d.vanzeiro_id::text then
        raise exception 'Este aviso não é para alguém deste destino.';
      end if;
      if v_criado < hoje - 1 then raise exception 'Este aviso é antigo demais.'; end if;
      if v_chave ~ '^resposta_' and v_chave = 'resposta_' || v_mid || '_' || substring(v_chave from '(\d{4}-\d{2}-\d{2})$') then
        -- Resposta do dia: precisa existir no banco, e o texto é o que o app escreve para ela.
        dia := substring(v_chave from '(\d{4}-\d{2}-\d{2})$')::date;
        select * into r from public.respostas where matricula_id = v_mid and data = dia;
        if not found or not (v_texto = any (public.r_textos_da_resposta(m.nome, d.origem, d.destino, dia, r.resposta, v_criado))) then
          raise exception 'Este aviso não confere com a sua resposta.';
        end if;
      elsif v_chave ~ '^nao_vou_periodo_' then
        -- "Não vou de… até…": o período precisa ser desta matrícula.
        select * into per from public.nao_vou_periodos where id = substring(v_chave from 17) and matricula_id = v_mid;
        if not found or not (v_texto = any (public.r_textos_do_periodo(m.nome, d.origem, d.destino, per.de, per.ate))) then
          raise exception 'Este aviso não confere com o seu período.';
        end if;
      else
        raise exception 'Este aviso não confere com a sua resposta.';
      end if;
      pode_trocar := true;
    elsif v_tipo in ('presenca_confirmada', 'ausencia_registrada', 'prazo_chegando', 'cobranca_vencendo') then
      if v_para <> eu::text then
        raise exception 'Este aviso não é para alguém deste destino.';
      end if;
      if v_tipo in ('presenca_confirmada', 'ausencia_registrada') then
        if v_chave !~ ('^presenca_' || regexp_replace(v_mid, '([^a-zA-Z0-9_-])', '\\\1', 'g') || '_\d{4}-\d{2}-\d{2}$') then
          raise exception 'Este aviso não confere com a sua resposta.';
        end if;
        pode_trocar := true;
      elsif v_tipo = 'prazo_chegando' then
        if v_chave !~ ('^prazo_' || regexp_replace(v_mid, '([^a-zA-Z0-9_-])', '\\\1', 'g') || '_\d{4}-\d{2}-\d{2}$') then
          raise exception 'Este aviso não confere com a sua viagem.';
        end if;
      elsif v_cid is null or v_chave <> 'cobranca_vencendo_' || v_cid
            or not exists (select 1 from public.cobrancas k where k.id = v_cid and k.matricula_id = v_mid) then
        raise exception 'Este aviso não confere com a sua cobrança.';
      end if;
    else
      raise exception 'Este tipo de aviso não pode ser criado pelo app.';
    end if;
  end if;

  insert into public.avisos as a (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, cobranca_id, criado_em, lido)
  values (v_id, d.vanzeiro_id, v_para, v_tipo, v_texto, v_chave, d_id, v_mid, v_cid, v_criado, false)
  on conflict (para, chave) do update
    set id = excluded.id, tipo = excluded.tipo, texto = excluded.texto, matricula_id = excluded.matricula_id,
        cobranca_id = excluded.cobranca_id, criado_em = excluded.criado_em, lido = false
    -- 5. Só troca a própria resposta/presença: mesmo destino, mesma matrícula, tipo da mesma família.
    where trocar and pode_trocar
      and a.destino_id = excluded.destino_id
      and a.matricula_id = excluded.matricula_id
      and (a.tipo = excluded.tipo
           or (a.tipo in ('presenca_confirmada', 'ausencia_registrada')
               and excluded.tipo in ('presenca_confirmada', 'ausencia_registrada')));
end $$;

revoke all on function public.salvar_aviso(jsonb, boolean) from public, anon;
grant execute on function public.salvar_aviso(jsonb, boolean) to authenticated;
