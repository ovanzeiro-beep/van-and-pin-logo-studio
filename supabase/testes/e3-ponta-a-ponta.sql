-- E3: teste de ponta a ponta no banco de verdade. Roda tudo como vanzeiro e passageiros de teste e, no fim,
-- desfaz tudo (raise exception): nada do teste fica gravado. Uso: select public.e3_teste_ponta_a_ponta();
create or replace function public.e3_teste_ponta_a_ponta() returns void
language plpgsql set search_path = '' as $f$
declare
  v uuid := 'e3e3e3e3-0000-4000-8000-000000000001';
  p1 uuid := 'e3e3e3e3-0000-4000-8000-000000000002';
  p2 uuid := 'e3e3e3e3-0000-4000-8000-000000000003';
  saida text := '23:59';
  amanha date := public.hoje_em_brasilia() + 1;
  ped1 text; ped2 text; m1 text; x text; n int;
  res text := '';
  procedure_ok boolean;
begin
  -- quem é quem
  insert into auth.users (id, email, aud, role, raw_user_meta_data, raw_app_meta_data) values
    (v,  'e3-vanzeiro@teste.invalid',  'authenticated', 'authenticated', '{"nome":"Vanzeiro Teste","aceite_termos_em":"2026-11-16T10:00:00Z"}', '{"provider":"email"}'),
    (p1, 'e3-passageiro1@teste.invalid','authenticated', 'authenticated', '{"nome":"Passageiro Um","aceite_termos_em":"2026-11-16T10:00:00Z"}', '{"provider":"email"}'),
    (p2, 'e3-passageiro2@teste.invalid','authenticated', 'authenticated', '{"nome":"Passageiro Dois","aceite_termos_em":"2026-11-16T10:00:00Z"}', '{"provider":"email"}');
  res := res || '01 contas criadas: ' || (select count(*) from public.contas where id in (v, p1, p2)) || E'\n';

  execute 'set local role authenticated';

  -- VANZEIRO: papel, perfil (1 lugar), destino
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v::text, true);
  perform public.escolher_papel('vanzeiro');
  update public.perfis_vanzeiro set van_lugares = 1, pix = 'teste@pix', telefone = '43999990001' where id = v;
  insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, convite, prazo)
  values ('e3-destino', v, 'Jacarezinho PR', 'Londrina PR', 'fixa', '{seg,ter,qua,qui,sex,sab,dom}', saida, 'VAN-E3E3', '1h');
  res := res || '02 vanzeiro: perfil e destino ok' || E'\n';

  -- PASSAGEIRO 1: acha pelo código e pede para entrar
  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p1::text, true);
  perform public.escolher_papel('passageiro');
  select destino into x from public.destino_pelo_convite('van-e3e3');
  res := res || '03 P1 acha pelo código: ' || coalesce(x, 'NÃO ACHOU') || E'\n';
  ped1 := public.pedir_para_entrar('VAN-E3E3', 'Passageiro Um', '43999990002', 'Jacarezinho PR', 'Rua 1', null, null);
  select count(*) into n from public.destinos; res := res || '04 P1 vê destinos antes de aceito: ' || n || E'\n';

  -- PASSAGEIRO 2 também pede (ainda tem 1 lugar)
  perform set_config('request.jwt.claims', json_build_object('sub', p2, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p2::text, true);
  ped2 := public.pedir_para_entrar('VAN-E3E3', 'Passageiro Dois', '43999990003', 'Jacarezinho PR', 'Rua 2', null, null);

  -- VANZEIRO aceita P1 (Diário R$ 150) e tenta aceitar P2 (van cheia)
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v::text, true);
  m1 := public.aceitar_pedido(ped1, '{"id":"e3-m1","nome":"Passageiro Um","telefone":"43999990002","cidade":"Jacarezinho PR","endereco":"Rua 1","plano":"diario","valor":15000}'::jsonb);
  res := res || '05 aceita P1: ' || m1 || E'\n';
  begin
    perform public.aceitar_pedido(ped2, '{"id":"e3-m2","nome":"Passageiro Dois","telefone":"43999990003","cidade":"Jacarezinho PR","endereco":"Rua 2","plano":"diario","valor":15000}'::jsonb);
    res := res || '06 aceita P2 com a van cheia: DEIXOU (ERRO)' || E'\n';
  exception when others then res := res || '06 aceita P2 com a van cheia: recusado (' || sqlerrm || ')' || E'\n'; end;
  begin
    perform public.recusar_pedido(ped2);
    res := res || '07 recusa P2: ok' || E'\n';
  exception when others then res := res || '07 recusa P2: ERRO ' || sqlerrm || E'\n'; end;

  -- P1 responde "Vou" para amanhã; P2 tenta pedir de novo (cheia)
  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p1::text, true);
  begin
    perform public.responder(m1, amanha, 'vai');
    res := res || '08 P1 responde Vou (amanhã): ok' || E'\n';
  exception when others then res := res || '08 P1 responde Vou: ERRO ' || sqlerrm || E'\n'; end;
  select count(*) into n from public.destinos; res := res || '09 P1 vê o destino depois de aceito: ' || n || E'\n';
  select count(*) into n from public.perfis_vanzeiro where pix = 'teste@pix'; res := res || '10 P1 vê o Pix do vanzeiro: ' || n || E'\n';
  begin
    perform public.salvar_aviso(json_build_object('id','e3-a1','para',v,'tipo','resposta_passageiro','texto','Passageiro respondeu Vou','chave','resposta_e3-m1_' || amanha,'destino_id','e3-destino','matricula_id',m1)::jsonb, true);
    res := res || '11 P1 avisa o vanzeiro (sininho): ok' || E'\n';
  exception when others then res := res || '11 aviso: ERRO ' || sqlerrm || E'\n'; end;

  perform set_config('request.jwt.claims', json_build_object('sub', p2, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p2::text, true);
  begin
    perform public.pedir_para_entrar('VAN-E3E3', 'Passageiro Dois', '43999990003', 'Jacarezinho PR', 'Rua 2', null, null);
    res := res || '12 P2 pede com a van cheia: DEIXOU (ERRO)' || E'\n';
  exception when others then res := res || '12 P2 pede com a van cheia: recusado (' || sqlerrm || ')' || E'\n'; end;
  select count(*) into n from public.matriculas; res := res || '13 P2 vê matrículas dos outros: ' || n || E'\n';

  -- VANZEIRO: viagem de hoje, Embarcou, cobrança Diária, pago; gasto; aviso no sininho
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v::text, true);
  select count(*) into n from public.avisos where para = v::text; res := res || '14 vanzeiro vê o aviso da resposta: ' || n || E'\n';
  insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado)
  values ('e3-viagem', v, 'e3-destino', public.hoje_em_brasilia(), 'busca', json_build_object('ordem', json_build_array(m1), 'embarcaram', '[]'::json, 'conferencia', '{}'::json)::jsonb);
  update public.viagens set estado = jsonb_set(estado, '{embarcaram}', jsonb_build_array(m1)) where id = 'e3-viagem';
  insert into public.embarques (matricula_id, data, viagem_id) values (m1, public.hoje_em_brasilia(), 'e3-viagem');
  insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
  values (m1 || '_' || public.hoje_em_brasilia(), v, m1, 'e3-destino', 'Passageiro Um', '43999990002', 'diario', 'Diária de hoje', public.hoje_em_brasilia() + 7, 15000);
  res := res || '15 viagem, embarque e cobrança R$ 150: ok' || E'\n';

  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p1::text, true);
  select count(*) into n from public.minha_viagem_de_hoje(m1) where embarcou; res := res || '16 P1 vê que embarcou: ' || n || E'\n';
  select count(*) into n from public.cobrancas where pagamento_data is null; res := res || '17 P1 vê a cobrança pendente: ' || n || E'\n';
  update public.cobrancas set pagamento_data = public.hoje_em_brasilia(), pagamento_forma = 'pix';
  get diagnostics n = row_count; res := res || '18 P1 tenta marcar pago (deve ser 0): ' || n || E'\n';
  select count(*) into n from public.viagens; res := res || '19 P1 lê a viagem inteira (deve ser 0): ' || n || E'\n';

  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v::text, true);
  update public.cobrancas set pagamento_data = public.hoje_em_brasilia(), pagamento_forma = 'pix' where matricula_id = m1;
  begin
    update public.cobrancas set valor_base = 1 where matricula_id = m1;
    res := res || '20 editar cobrança paga: DEIXOU (ERRO)' || E'\n';
  exception when others then res := res || '20 editar cobrança paga: recusado' || E'\n'; end;
  insert into public.gastos (id, vanzeiro_id, tipo, valor, data) values ('e3-g1', v, 'combustivel', 20000, public.hoje_em_brasilia());
  update public.viagens set fase = 'encerrada', terminou_em = now() where id = 'e3-viagem';
  res := res || '21 pago, gasto e viagem encerrada: ok' || E'\n';

  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p1::text, true);
  select count(*) into n from public.cobrancas where pagamento_forma = 'pix'; res := res || '22 P1 vê Pago: ' || n || E'\n';
  select count(*) into n from public.gastos; res := res || '23 P1 vê gastos do vanzeiro (deve ser 0): ' || n || E'\n';

  -- P1 sai; a vaga abre; P2 entra
  perform public.sair_do_destino(m1);
  perform set_config('request.jwt.claims', json_build_object('sub', p2, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', p2::text, true);
  begin
    ped2 := public.pedir_para_entrar('VAN-E3E3', 'Passageiro Dois', '43999990003', 'Jacarezinho PR', 'Rua 2', null, null);
    res := res || '24 P1 saiu, P2 pede: ok' || E'\n';
  exception when others then res := res || '24 P2 pede: ERRO ' || sqlerrm || E'\n'; end;
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', v::text, true);
  begin
    perform public.aceitar_pedido(ped2, '{"id":"e3-m2","nome":"Passageiro Dois","telefone":"43999990003","cidade":"Jacarezinho PR","endereco":"Rua 2","plano":"mensal","valor":30000,"vencimento":20}'::jsonb);
    res := res || '25 aceita P2 (Mensal): ok' || E'\n';
  exception when others then res := res || '25 aceita P2: ERRO ' || sqlerrm || E'\n'; end;

  -- vanzeiro exclui o destino: P2 recebe o aviso e sai
  update public.destinos set excluido_em = now(), ativo = false where id = 'e3-destino';
  execute 'reset role';
  select count(*) into n from public.avisos where para = p2::text and tipo = 'destino_excluido'; res := res || '26 P2 recebe "Destino excluído": ' || n || E'\n';
  select count(*) into n from public.matriculas where destino_id = 'e3-destino' and saiu_em is null; res := res || '27 ninguém fica no destino excluído: ' || (n = 0) || E'\n';

  -- a tarefa do relógio roda com tudo isso sem erro
  begin
    perform public.tarefas_do_relogio();
    res := res || '28 tarefa do relógio: ok' || E'\n';
  exception when others then res := res || '28 tarefa do relógio: ERRO ' || sqlerrm || E'\n'; end;

  -- Tudo é desfeito: nada do teste fica no banco.
  raise exception 'RESULTADO E3%', E'\n' || res;
end $f$;
revoke all on function public.e3_teste_ponta_a_ponta() from public, anon, authenticated;
