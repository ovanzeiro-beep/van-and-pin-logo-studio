-- SOMENTE laboratório descartável: scripts/testar-financeiro-local.py.
-- Não colar no Supabase real. O guard rejeita qualquer outro nome de banco.
begin;
do $$ begin
 if current_database() <> 'vanzeiro_etapa6' then
  raise exception 'Este teste só roda no banco descartável vanzeiro_etapa6';
 end if;
end $$;
create or replace function public.hoje_em_brasilia() returns date
 language sql stable as $$ select date '2026-11-18' $$;
create function pg_temp.verificar(ok boolean, nome text) returns text
 language plpgsql as $$ begin
 if ok is distinct from true then raise exception 'FALHOU: %', nome; end if;
 return 'PASS: ' || nome;
end $$;
create function pg_temp.recusar(comando text, estado text, nome text) returns text
 language plpgsql as $$ begin
 begin execute comando;
 exception when others then
  if sqlstate <> estado then raise exception '%: esperado %, recebido %: %', nome, estado, sqlstate, sqlerrm; end if;
  return 'PASS: ' || nome;
 end;
 raise exception 'FALHOU: % (o banco aceitou)', nome;
end $$;

insert into auth.users(id,email,raw_user_meta_data) values
 ('60000000-0000-4000-8000-000000000001','motorista@teste.invalid','{"nome":"Motorista Fictício","aceite_termos_em":"2026-11-01T10:00:00Z"}'),
 ('60000000-0000-4000-8000-000000000002','pessoa-a@teste.invalid','{"nome":"Pessoa A","aceite_termos_em":"2026-11-01T10:00:00Z"}'),
 ('60000000-0000-4000-8000-000000000003','pessoa-b@teste.invalid','{"nome":"Pessoa B","aceite_termos_em":"2026-11-01T10:00:00Z"}');
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
select public.escolher_papel('vanzeiro');
update public.perfis_vanzeiro set van_lugares=15 where id=auth.uid();
insert into public.destinos(id,vanzeiro_id,origem,destino,tipo,dias,saida,convite,prazo)
 values('f-destino',auth.uid(),'Origem Teste','Destino Teste','fixa','{seg,ter,qua,qui,sex,sab,dom}','06:00','VAN-F600','1h'),
 ('f-destino2',auth.uid(),'Origem Teste','Outro Destino','fixa','{seg,ter,qua,qui,sex,sab,dom}','07:00','VAN-F601','1h');
insert into public.matriculas(id,vanzeiro_id,destino_id,pessoa_id,nome,telefone,plano,valor,vencimento,desconta_faltas,valor_falta,entrou_em) values
 ('f-mensal',auth.uid(),'f-destino','60000000-0000-4000-8000-000000000002','Pessoa A','11999990001','mensal',30000,20,true,1500,'2026-11-01'),
 ('f-quinzenal',auth.uid(),'f-destino','60000000-0000-4000-8000-000000000003','Pessoa B','11999990002','quinzenal',15000,20,true,1000,'2026-11-01'),
 ('f-diario',auth.uid(),'f-destino2','60000000-0000-4000-8000-000000000002','Pessoa A Diário','11999990003','diario',2200,null,false,null,'2026-11-01'),
 ('f-viagem',auth.uid(),'f-destino2','60000000-0000-4000-8000-000000000003','Pessoa B Viagem','11999990004','viagem',4550,null,false,null,'2026-11-01');

select pg_temp.verificar(array(select public.r_vencimentos('quinzenal',15,'2028-02-01','2028-03-31')) = array['2028-02-15','2028-02-29','2028-03-15','2028-03-30']::date[], 'quinzenal fixo em fevereiro bissexto');
select pg_temp.verificar(array(select public.r_vencimentos('mensal',31,'2027-02-01','2027-03-31')) = array['2027-02-28','2027-03-31']::date[], 'mensal 31 e fevereiro');
insert into public.faltas(matricula_id,data,avisou_no_prazo) values
 ('f-mensal','2026-11-16',true),('f-mensal','2026-11-17',true),('f-mensal','2026-11-18',false);
select public.r_nova_cobranca(m,'2026-11-20','2026-11-18') from public.matriculas m where id='f-mensal';
select public.r_nova_cobranca(m,'2026-11-20','2026-11-18') from public.matriculas m where id='f-mensal';
select pg_temp.verificar((select count(*)=1 and max(faltas)=2 and max(valor_base-faltas*valor_falta)=27000 from public.cobrancas where matricula_id='f-mensal'),'mensal 300 menos duas faltas de 15, sem duplicação');
select public.r_nova_cobranca(m,'2026-11-20','2026-11-18') from public.matriculas m where id='f-quinzenal';
select pg_temp.verificar((select valor_base=15000 and faltas=0 from public.cobrancas where matricula_id='f-quinzenal'),'quinzenal sem faltas conserva 150');

set local role authenticated;
insert into public.cobrancas(id,vanzeiro_id,matricula_id,destino_id,nome,telefone,tipo,referencia,vencimento,valor_base) values
 ('f-diaria',auth.uid(),'f-diario','f-destino2','Pessoa A','11999990003','diario','Diária 18/11','2026-11-25',2200),
 ('f-por-viagem',auth.uid(),'f-viagem','f-destino2','Pessoa B','11999990004','viagem','Viagem 18/11','2026-11-25',4550);
select pg_temp.recusar($q$update public.cobrancas set valor_base=1 where id='f-diaria'$q$,'P0001','não editar o valor de uma cobrança aberta');
update public.cobrancas set pagamento_data='2026-11-18',pagamento_forma='dinheiro' where id='f-diaria';
update public.cobrancas set pagamento_data='2026-11-18',pagamento_forma='pix' where id='f-por-viagem';
select pg_temp.verificar((select sum(valor_base)=6750 from public.cobrancas where pagamento_data is not null),'recebido dinheiro e Pix = 67,50');
select pg_temp.recusar($q$update public.cobrancas set pagamento_forma='pix' where id='f-diaria'$q$,'P0001','paga não muda mesmo com toque repetido');
select pg_temp.recusar($q$update public.cobrancas set cancelamento_data='2026-11-18',cancelamento_motivo='Duplicada' where id='f-diaria'$q$,'P0001','paga não pode ser cancelada');
select pg_temp.recusar($q$update public.cobrancas set cancelamento_data='2026-11-18',cancelamento_motivo=' ' where matricula_id='f-quinzenal'$q$,'23514','cancelamento exige motivo');
update public.cobrancas set cancelamento_data='2026-11-18',cancelamento_motivo='Cortesia' where matricula_id='f-quinzenal';
select pg_temp.recusar($q$update public.cobrancas set pagamento_data='2026-11-18',pagamento_forma='pix' where matricula_id='f-quinzenal'$q$,'P0001','cancelada não pode ser paga');
insert into public.gastos(id,vanzeiro_id,tipo,valor,data) values('f-gasto',auth.uid(),'combustivel',1010,'2026-11-18');
select pg_temp.recusar($q$insert into public.gastos(id,vanzeiro_id,tipo,valor,data) values('f-futuro',auth.uid(),'pedagio',500,'2026-11-19')$q$,'P0001','gasto futuro recusado');
select pg_temp.recusar($q$insert into public.gastos(id,vanzeiro_id,tipo,valor,data) values('f-negativo',auth.uid(),'pedagio',-1,'2026-11-18')$q$,'23514','gasto negativo recusado');
select pg_temp.verificar((select 6750-sum(valor)=5740 from public.gastos),'saldo recebido menos gasto = 57,40');

-- Outra pessoa não paga nem lê a cobrança do vizinho, mesmo chamando o banco diretamente.
select set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000002',true);
select pg_temp.verificar((select count(*)=2 from public.cobrancas),'passageiro A só lê suas duas cobranças');
do $$ declare n int; begin
 update public.cobrancas set pagamento_data='2026-11-18',pagamento_forma='pix' where matricula_id='f-mensal';
 get diagnostics n=row_count;
 if n<>0 then raise exception 'passageiro marcou como pago'; end if;
end $$;
select pg_temp.verificar((select pagamento_data is null from public.cobrancas where matricula_id='f-mensal'),'passageiro não marca pago');
select pg_temp.verificar((select count(*)=0 from public.gastos),'passageiro não lê gastos');
select pg_temp.verificar((select count(*)=0 from public.cobrancas where matricula_id='f-viagem'),'passageiro A não lê cobrança de B');
reset role;

-- O relógio e a aplicação usam os mesmos identificadores; rodar de novo não cria outra cobrança.
select public.tarefas_do_relogio('2026-11-20T12:00:00-03');
select public.tarefas_do_relogio('2026-11-20T12:00:00-03');
select pg_temp.verificar((select count(*)=1 from public.cobrancas where id='f-mensal_2026-12-20'),'relógio cria só uma mensalidade seguinte');
select pg_temp.verificar((select count(*)=1 from public.cobrancas where id='f-quinzenal_2026-12-05'),'relógio cria próxima quinzena fixa');
select pg_temp.verificar((select faltas=2 and valor_base=30000 from public.cobrancas where id='f-mensal_2026-11-20'),'relógio preserva valor e desconto da cobrança anterior');
rollback;
