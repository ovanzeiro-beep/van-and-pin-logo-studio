# Etapa 6 — fichas financeiras e limites da prova

Base: `2a3f5434ff3b9d2ccc03954b6debd877370c1331`. Dados fictícios. Nenhuma escrita no Supabase real.

## Aplicativo — nove cenários novos passaram

| Ficha | Resultado esperado e observado |
| --- | --- |
| Por viagem, duas saídas no mesmo dia, R$ 33,33 cada, toque repetido | Duas cobranças, R$ 66,66; vencimento sete dias depois do embarque. |
| Diário, duas viagens no mesmo dia, R$ 33,33 | Uma cobrança, R$ 33,33. |
| Por viagem, volta no dia seguinte com a mesma identidade | Mantém uma cobrança, R$ 33,33. |
| Mensal, vencimento dia 31 | Fevereiro: 29/02/2028 e 28/02/2027; virada do ano conserva o dia 31. |
| Quinzenal, dias fixos | Dia 15: 15/02, 29/02, 15/03 e 30/03 de 2028. Dia 20: 05/12, 20/12, 05/01 e 20/01. |
| Mensal com desconto | Só duas datas avisadas no prazo contam; data duplicada conta uma vez e falta sem aviso não desconta; resultado nunca negativo. |
| Quinzenal com desconto | Mesmo critério de prazo e duplicação, respeitando o período da quinzena. |
| Cobranças encerradas e saída do destino | Pagas, canceladas e vencidas mantêm seus valores; ao sair, só as pendentes são canceladas; R$ 60,00 vencidos continuam devidos. |
| Fechamento misto | A receber R$ 375,50, recebido R$ 22,00, dívida antiga R$ 60,00. No mês: falta receber R$ 315,50; R$ 15,10 de gastos deixam R$ 6,90. A dívida total individual inclui R$ 50,00 futuros: R$ 425,50. |

Essas diferenças entre total do mês e dívida total são intencionais, de acordo com as regras existentes. Os dois Inícios e o Financeiro usam as funções compartilhadas; o passageiro lê apenas suas matrículas.

## PostgreSQL — vinte verificações passaram

`python3 scripts/testar-financeiro-local.py` criou um PostgreSQL 18.6 descartável, sem rede, reaplicou as 26 migrations e executou `supabase/testes/etapa6-financeiro.sql`. Auth, agendador e transporte de notificações foram simulados; tabelas, funções, constraints, triggers e RLS foram executados pelo PostgreSQL.

As verificações cobrem: datas mensais e quinzenais; desconto e deduplicação; registro de pagamento por dinheiro/Pix; cobrança paga ou cancelada imutável; proibição de editar o valor; motivo obrigatório ao cancelar; gasto futuro/negativo recusado; saldo; leitura por matrícula, passageiro sem permissão para pagar ou ver gastos; próxima cobrança criada uma só vez pelo relógio. A transação de teste foi desfeita e o container removido. A primeira preparação foi recusada por duplicar uma pessoa no mesmo destino; a ficha foi ajustada para usar dois destinos, conforme a regra do app. Isso foi um erro de preparação, sem mudança no produto.

## Comparação de leitura com produção

Em 18/11/2026, às 09:34:24 UTC, os corpos das cinco funções abaixo tiveram a mesma impressão MD5 no laboratório e em produção, depois de retirar comentários de linha e espaços. É uma comparação de versão, não uma prova completa dos dados ou de permissões de todo o sistema.

| Função | Impressão normalizada |
| --- | --- |
| `cobranca_nunca_editada` | `abf1918336168f30c8438b19ded8ffed` |
| `gasto_ate_hoje` | `b9ea63cb0e2f8b0016e8837c1116d451` |
| `r_nova_cobranca` | `64dadeefdd97ea6f172600f1caebbf03` |
| `r_vencimentos` | `6e90ae0550aab00d9ce8443bf2da7dfa` |
| `tarefas_do_relogio` | `4301c23f5ba66c059ea70d2a19e50db5` |

A consulta de catálogo confirmou RLS em `cobrancas`, `embarques`, `faltas` e `gastos`. Os agendamentos de relógio (cinco minutos) e reenvio push (um minuto) estavam ativos; no conjunto das execuções da hora anterior, 72 sucessos, sem falhas listadas.

## Regressão e limites

- Base: 431 testes em 86 arquivos passaram; tipos passaram. Lint: 1.752 erros e cinco avisos herdados.
- Após os nove cenários: 440 testes em 87 arquivos passaram; tipos e build passaram.
- Arquivo de teste novo formatado e aprovado pelo ESLint. Não houve formatação geral ou mudança na implementação.
- Ainda não comprova pagamento bancário/Pix efetivo, recebimento de e-mail, recebimento de aviso no aparelho, restauração de backup de produção nem totais por API acima do limite de linhas. A leitura financeira por API sem paginação segue como limite a validar antes de uso em grande volume.
- Aceite em celular foi adiado pelo dono para o roteiro final. Nenhuma dessas pendências foi marcada como aprovada.
