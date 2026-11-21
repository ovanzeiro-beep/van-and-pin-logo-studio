-- CORREÇÃO 5: teste da exclusão de contas, num banco DESCARTÁVEL (nunca em produção).
-- Dados 100% fictícios. Cada linha diz OK ou FALHOU. No fim desfaz tudo (raise exception).
-- Uso: select public.c5_teste();
create or replace function public.c5_teste() returns void
language plpgsql set search_path = '' as $f$
declare
  v  uuid := 'c5c5c5c5-0000-4000-8000-000000000001';  -- vanzeiro que exclui a conta
  w  uuid := 'c5c5c5c5-0000-4000-8000-000000000002';  -- outro vanzeiro (não pode ser afetado)
  p1 uuid := 'c5c5c5c5-0000-4000-8000-000000000003';  -- passageiro com conta (no destino de V e no de W)
  p3 uuid := 'c5c5c5c5-0000-4000-8000-000000000004';  -- quem pediu para entrar e está aguardando
  hoje date := public.hoje_em_brasilia();
  res text := ''; n int; n0 int; t text; hw text; hw2 text; ok boolean;
  procedure_dummy int;
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data, raw_app_meta_data) values
    (v,  'c5-v@teste.invalid',  'authenticated','authenticated','{"nome":"Vanzeiro Vê","aceite_termos_em":"2026-11-16T10:00:00Z"}','{"provider":"email"}'),
    (w,  'c5-w@teste.invalid',  'authenticated','authenticated','{"nome":"Vanzeiro Dáblio","aceite_termos_em":"2026-11-16T10:00:00Z"}','{"provider":"email"}'),
    (p1, 'c5-p1@teste.invalid', 'authenticated','authenticated','{"nome":"Passageira Um","aceite_termos_em":"2026-11-16T10:00:00Z"}','{"provider":"email"}'),
    (p3, 'c5-p3@teste.invalid', 'authenticated','authenticated','{"nome":"Pessoa Três","aceite_termos_em":"2026-11-16T10:00:00Z"}','{"provider":"email"}');
  insert into public.perfis_vanzeiro (id, nome, telefone, pix, van_modelo, van_placa) values
    (v, 'Vanzeiro Vê', '43999990001', 'v@pix', 'Sprinter', 'ABC1D23'), (w, 'Vanzeiro Dáblio', '43999990009', 'w@pix', 'Ducato', 'XYZ9K88')
    on conflict (id) do update set nome = excluded.nome, telefone = excluded.telefone, pix = excluded.pix, van_modelo = excluded.van_modelo, van_placa = excluded.van_placa;
  insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, convite, prazo) values
    ('c5-dv', v, 'Jacarezinho PR', 'Londrina PR', 'fixa', '{seg,ter,qua,qui,sex}', '06:00', 'VAN-C5V1', '1h'),
    ('c5-dw', w, 'Cambará PR', 'Ourinhos SP', 'fixa', '{seg,ter,qua,qui,sex}', '06:00', 'VAN-C5W1', '1h');
  -- passageiros: P1 com conta (em V e em W), P2 sem conta (só em V, mensal)
  insert into public.matriculas (id, vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, plano, valor, vencimento) values
    ('c5-m1v', v, 'c5-dv', p1,  'Passageira Um', '43999990003', 'Jacarezinho PR', 'Rua Um, 1', 'viagem', 15000, null),
    ('c5-m2v', v, 'c5-dv', null,'Passageiro Dois','43999990004', 'Jacarezinho PR', 'Rua Dois, 2', 'mensal', 30000, extract(day from hoje)::int),
    ('c5-m1w', w, 'c5-dw', p1,  'Passageira Um', '43999990003', 'Cambará PR', 'Rua Um, 1', 'viagem', 12000, null);
  -- cobranças: paga, aberta de viagem feita, mensal de período já começado e mensal de período futuro; e as de W
  insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base, pagamento_data, pagamento_forma) values
    ('c5-k-paga',   v, 'c5-m1v', 'c5-dv', 'Passageira Um', '43999990003', 'viagem', 'Viagem paga', hoje + 7, 15000, hoje, 'pix'),
    ('c5-k-aberta', v, 'c5-m1v', 'c5-dv', 'Passageira Um', '43999990003', 'viagem', 'Viagem em aberto', hoje + 7, 15000, null, null),
    ('c5-k-w1',     w, 'c5-m1w', 'c5-dw', 'Passageira Um', '43999990003', 'viagem', 'Viagem com W', hoje + 7, 12000, null, null),
    ('c5-k-w2',     w, 'c5-m1w', 'c5-dw', 'Passageira Um', '43999990003', 'viagem', 'Viagem paga com W', hoje + 7, 12000, hoje, 'dinheiro');
  insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base) values
    ('c5-k-mes-atual', v, 'c5-m2v', 'c5-dv', 'Passageiro Dois', '43999990004', 'mensal', 'Mensal deste período', hoje, 30000),
    ('c5-k-mes-futuro', v, 'c5-m2v', 'c5-dv', 'Passageiro Dois', '43999990004', 'mensal', 'Mensal do próximo', (hoje + interval '1 month')::date, 30000);
  insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values
    ('c5-viagem-antiga', v, 'c5-dv', hoje - 3, 'encerrada', '{"ordem":["c5-m1v"],"embarcaram":["c5-m1v"]}');
  insert into public.pedidos (id, vanzeiro_id, destino_id, pessoa_id, nome, telefone, cidade, endereco, situacao) values
    ('c5-ped3', v, 'c5-dv', p3, 'Pessoa Três', '43999990005', 'Jacarezinho PR', 'Rua Três, 3', 'aguardando');
  insert into public.gastos (id, vanzeiro_id, tipo, valor, data) values ('c5-g1', v, 'combustivel', 20000, hoje), ('c5-gw', w, 'pedagio', 900, hoje);
  insert into public.celulares (conta_id, endereco) values (v, '{"endpoint":"https://teste.invalid/v"}'), (p1, '{"endpoint":"https://teste.invalid/p1"}');
  insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, matricula_id, destino_id) values
    ('c5-a-v', v, v::text, 'pedido_novo', 'Pessoa Três quer entrar', 'c5-a-v', null, 'c5-dv'),
    ('c5-a-resp', w, w::text, 'resposta_passageiro', 'Passageira confirmou que vai', 'c5-a-resp', 'c5-m1w', 'c5-dw'),
    ('c5-a-p1', w, p1::text, 'van_saiu', 'A van saiu', 'c5-a-p1', 'c5-m1w', 'c5-dw');
  insert into public.mudancas_endereco (vanzeiro_id, destino_id, matricula_id, nome, de, para) values
    (w, 'c5-dw', 'c5-m1w', 'Passageira Um', '{"endereco":"Rua Um, 1"}', '{"endereco":"Rua Nova, 9"}');

  select md5(string_agg(to_jsonb(x)::text, '' order by x.id)) into hw from public.cobrancas x where vanzeiro_id = w and id <> 'c5-k-w1';
  select count(*) into n0 from public.cobrancas where matricula_id like 'c5-%'; res := res || 'antes: ' || n0 || ' cobranças de teste (uma criada pela Correção 3 na viagem antiga)' || E'\n';

  -- =============== VANZEIRO V EXCLUI A CONTA ===============
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
  perform public.excluir_minha_conta();
  execute 'reset role';

  ok := not exists (select 1 from auth.users where id = v); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V1 login apagado' || E'\n';
  ok := exists (select 1 from public.contas where id = v and nome = 'Conta excluída' and excluida_em is not null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V2 conta fica sem dados pessoais (registro "Conta excluída")' || E'\n';
  ok := exists (select 1 from public.perfis_vanzeiro where id = v and nome = 'Vanzeiro (conta excluída)' and telefone = '' and pix = '' and van_placa = ''); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V3 perfil do vanzeiro sem nome, telefone, Pix e van' || E'\n';
  ok := exists (select 1 from public.destinos where id = 'c5-dv' and excluido_em is not null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V4 destino continua no histórico, marcado como excluído' || E'\n';
  select count(*) into n from public.cobrancas where matricula_id like 'c5-%'; res := res || case when n = n0 then 'OK ' else 'FALHOU ' end || 'V5 nenhuma cobrança apagada (' || n || ' de ' || n0 || ')' || E'\n';
  ok := exists (select 1 from public.cobrancas where id = 'c5-k-paga' and pagamento_data = hoje and pagamento_forma = 'pix' and cancelamento_data is null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V6 cobrança paga intacta' || E'\n';
  select cancelamento_motivo into t from public.cobrancas where id = 'c5-k-aberta'; res := res || case when t = 'Conta do vanzeiro excluída' then 'OK ' else 'FALHOU ' end || 'V7 viagem em aberto cancelada com motivo: ' || coalesce(t,'-') || E'\n';
  select cancelamento_motivo into t from public.cobrancas where id = 'c5-k-mes-futuro'; res := res || case when t = 'Destino excluído' then 'OK ' else 'FALHOU ' end || 'V8 mensal de período futuro (Correção 2): ' || coalesce(t,'-') || E'\n';
  select cancelamento_motivo into t from public.cobrancas where id = 'c5-k-mes-atual'; res := res || case when t = 'Conta do vanzeiro excluída' then 'OK ' else 'FALHOU ' end || 'V9 mensal do período atual: ' || coalesce(t,'-') || E'\n';
  ok := (select count(*) from public.matriculas where id in ('c5-m1v','c5-m2v') and saiu_em is not null) = 2; res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V10 passageiros saem do destino e continuam no histórico' || E'\n';
  ok := exists (select 1 from public.avisos where para = p1::text and tipo = 'destino_excluido'); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V11 passageira avisada de que o destino foi excluído' || E'\n';
  ok := exists (select 1 from public.pedidos where id = 'c5-ped3' and situacao = 'recusado'); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V12 pedido aguardando recusado' || E'\n';
  ok := not exists (select 1 from public.gastos where vanzeiro_id = v) and exists (select 1 from public.gastos where id = 'c5-gw'); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V13 gastos de V apagados; de W intactos' || E'\n';
  ok := not exists (select 1 from public.celulares where conta_id = v) and not exists (select 1 from public.avisos where para = v::text); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V14 celular e avisos de V apagados' || E'\n';
  select md5(string_agg(to_jsonb(x)::text, '' order by x.id)) into hw2 from public.cobrancas x where vanzeiro_id = w and id <> 'c5-k-w1';
  ok := hw = hw2 and exists (select 1 from public.cobrancas where id = 'c5-k-w1' and cancelamento_data is null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'V15 dados do outro vanzeiro intactos' || E'\n';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  select count(*) into n from public.cobrancas where matricula_id = 'c5-m1v'; res := res || case when n = 3 then 'OK ' else 'FALHOU ' end || 'V16 passageira ainda vê o histórico com V (' || n || ' cobranças)' || E'\n';
  select count(*) into n from public.perfis_vanzeiro where id = v and pix = ''; res := res || case when n = 1 then 'OK ' else 'FALHOU ' end || 'V17 passageira vê "Vanzeiro (conta excluída)", sem Pix' || E'\n';
  execute 'reset role';

  -- =============== VIAGEM EM ANDAMENTO BLOQUEIA ===============
  insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values ('c5-viagem-hoje', w, 'c5-dw', hoje, 'busca', '{"ordem":["c5-m1w"],"embarcaram":[]}');
  begin
    execute 'set local role authenticated';
    perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
    perform public.excluir_minha_conta();
    execute 'reset role';
    res := res || 'FALHOU B1 excluir no meio da viagem: DEIXOU' || E'\n';
  exception when others then
    execute 'reset role';
    res := res || case when sqlerrm like '%acontecendo agora%' then 'OK ' else 'FALHOU ' end || 'B1 não exclui no meio de uma viagem: ' || sqlerrm || E'\n';
  end;
  ok := exists (select 1 from auth.users where id = p1) and exists (select 1 from public.cobrancas where id = 'c5-k-w2' and nome = 'Passageira Um');
  res := res || case when ok then 'OK ' else 'FALHOU ' end || 'B2 recusado sem mudar nada' || E'\n';
  update public.viagens set fase = 'encerrada' where id = 'c5-viagem-hoje';

  -- =============== PASSAGEIRA P1 EXCLUI A CONTA (ainda está no destino de W) ===============
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', p1, 'role', 'authenticated')::text, true);
  perform public.excluir_minha_conta();
  execute 'reset role';
  ok := not exists (select 1 from public.cobrancas where matricula_id in ('c5-m1v','c5-m1w') and nome <> 'Conta excluída') and exists (select 1 from public.cobrancas where matricula_id = 'c5-m1v'); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P1 nome sai de todas as cobranças dela (' || (select count(*) from public.cobrancas where matricula_id in ('c5-m1v','c5-m1w')) || ' de ' || (select count(*) from public.cobrancas where matricula_id in ('c5-m1v','c5-m1w')) || ')' || E'\n';
  ok := exists (select 1 from public.cobrancas where id = 'c5-k-w2' and pagamento_forma = 'dinheiro' and telefone = '43999990003'); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P2 pagamento e telefone ficam (decisão B: telefone com o vanzeiro)' || E'\n';
  select cancelamento_motivo into t from public.cobrancas where id = 'c5-k-w1'; res := res || case when t is null then 'OK ' else 'FALHOU ' end || 'P3 viagem feita com W continua a receber (Correção 2): ' || coalesce(t,'aberta') || E'\n';
  ok := exists (select 1 from public.matriculas where id = 'c5-m1w' and nome = 'Conta excluída' and endereco = '' and saiu_em is not null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P4 matrícula sem nome e endereço, saiu do destino' || E'\n';
  ok := exists (select 1 from public.mudancas_endereco where matricula_id = 'c5-m1w' and nome = 'Conta excluída' and de = '{}'::jsonb); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P5 pedido de mudança de endereço sem dados' || E'\n';
  ok := not exists (select 1 from public.avisos where id in ('c5-a-resp','c5-a-p1')); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P6 avisos que citavam a passageira e os dela apagados' || E'\n';
  ok := not exists (select 1 from auth.users where id = p1) and exists (select 1 from public.contas where id = p1 and excluida_em is not null); res := res || case when ok then 'OK ' else 'FALHOU ' end || 'P7 login apagado; conta vira registro sem dados' || E'\n';

  -- =============== PROTEÇÕES ===============
  begin
    update public.cobrancas set nome = 'Outro Nome' where id = 'c5-k-w1';
    res := res || 'FALHOU S1 editar o nome de uma cobrança: DEIXOU' || E'\n';
  exception when others then res := res || 'OK S1 editar o nome de uma cobrança continua proibido' || E'\n'; end;
  begin
    perform set_config('vanzeiro.anonimizar', 'sim', true);
    update public.cobrancas set valor_base = 1, nome = 'Conta excluída' where id = 'c5-k-w1';
    res := res || 'FALHOU S2 usar a exceção para mudar o valor: DEIXOU' || E'\n';
  exception when others then res := res || 'OK S2 a exceção não deixa mudar valor' || E'\n'; end;
  perform set_config('vanzeiro.anonimizar', '', true);
  begin
    delete from public.contas where id = w;
    res := res || 'FALHOU S3 apagar conta com histórico: DEIXOU' || E'\n';
  exception when others then res := res || 'OK S3 conta com histórico não pode ser apagada' || E'\n'; end;
  begin
    delete from auth.users where id = w;  -- como se alguém apagasse o login pelo painel
    ok := exists (select 1 from public.destinos where vanzeiro_id = w) and (select count(*) from public.cobrancas where vanzeiro_id = w) = 2;
    res := res || case when ok then 'OK ' else 'FALHOU ' end || 'S4 apagar o login pelo painel não apaga o histórico' || E'\n';
  exception when others then res := res || 'FALHOU S4 ' || sqlerrm || E'\n'; end;

  raise exception 'RESULTADO C5%', E'\n' || res;
end $f$;
