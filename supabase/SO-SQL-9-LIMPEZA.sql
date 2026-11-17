-- E5: limpeza dos dados de teste antes de entregar (decisão do dono, 16/11/2026).
-- As contas (e o perfil do vanzeiro) ficam. Apaga destinos excluídos, passageiros, pedidos, respostas, viagens,
-- cobranças, avisos e gastos de teste. Não dá para desfazer.
begin;
delete from public.avisos;
delete from public.cobrancas;
delete from public.embarques;
delete from public.faltas;
delete from public.respostas;
delete from public.vou_sempre;
delete from public.nao_vou_periodos;
delete from public.mudancas_endereco;
delete from public.juntar_conta;
delete from public.pedidos;
delete from public.viagens;
delete from public.viagem_sinais;
delete from public.matriculas;
delete from public.dias_sem_viagem;
delete from public.destinos where excluido_em is not null;
delete from public.gastos;
commit;
select (select count(*) from public.destinos) destinos, (select count(*) from public.matriculas) passageiros, (select count(*) from public.cobrancas) cobrancas, (select count(*) from public.avisos) avisos, (select count(*) from public.contas) contas;
