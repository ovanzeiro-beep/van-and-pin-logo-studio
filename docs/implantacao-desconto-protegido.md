# P0 financeiro — proteção de descontos

## Situação

Preparação sobre `a72d89b`. Não aplicada no banco real e não publicada. Convites, telefones,
Correção 6, telas e arquivos `src/` permanecem intocados.

## Defeito e menor correção

`src/lib/banco/dinheiro.ts:227–240` envia `faltas`, `valor_falta`, `periodo_de` e
`periodo_ate` absolutos. A proteção vigente C5 permite esses campos em cobranças abertas.
T4.2 foi reproduzido num PostgreSQL 17.12 descartável: o relógio registrou uma falta
de R$ 10, mas um UPDATE autenticado com `faltas=0` apagou o desconto.

O SQL adiciona um gatilho, sem reescrever relógio, C3 ou C5. Para requisições do app,
os quatro campos permanecem iguais à linha armazenada. O cálculo/incremento existente
do relógio executa como seu proprietário, dentro do banco, e continua autorizado.
JWT ou configuração enviada pelo aparelho não substituem essa identidade PostgreSQL.
O bloqueio de linha do UPDATE preserva a versão nova mesmo se outro envio esperar.

Valores de desconto atrasados são ignorados, não recusam a operação inteira; pagamento
ou cancelamento válido de uma versão antiga continua funcionando. Paga/cancelada passa
sem normalização à proteção C5, preservando imutabilidade e anonimização.

Não há mudança de regra, recálculo retroativo ou reparação de descontos já perdidos.
INSERT inicial de cobranças e a validação dos registros de faltas não são modificados
nesta etapa: o escopo é a sobrescrita de descontos já calculados em UPDATE.

## Arquivos

- SQL preparado e idempotente: `supabase/SO-SQL-17-DESCONTO-PROTEGIDO.sql`.
- Laboratório: `scripts/testar-desconto-protegido-local.py`.
- Conferência somente leitura: `supabase/testes/desconto-protegido-verificar.sql`.

A ferramenta recusou criar um novo arquivo em `supabase/migrations/`. Não houve
contorno nem habilitação de outro banco. Registrar este SQL como **nova** migration
no fluxo externo do proprietário permanece pendente; não editar migrations antigas.

### Conferência do registro em 21/11/2026 (prompt-24)

Todos os oito arquivos da preparação estão salvos em `c133bb7`. Repetidos os testes
relacionados: 40/40, incluindo matriz financeira 20/20 e C5 45/45.

Uma nova tentativa de criar `supabase/migrations/20261121121000_desconto_protegido.sql`
foi recusada, sem escrita, pela proteção de todo o diretório. Não houve erro de SQL,
perda dos arquivos preparados ou alteração de migration antiga. Não usar ferramenta
de aplicação no banco, ativar outro banco ou contornar a proteção por shell para isso.

Pelo fluxo externo do repositório, registrar **uma cópia integral** de
`supabase/SO-SQL-17-DESCONTO-PROTEGIDO.sql` no novo caminho acima; verificar igualdade
dos arquivos e guardar em commit. Isso não deve executar o SQL, publicar ou alterar a
branch da Correção 6. O nome ordena a nova migration depois da C5. O registro externo
não foi realizado nesta sessão: o impedimento permanece, com o trabalho preservado.

## Implantação — somente após aprovação

1. Conferir a versão real de `cobranca_nunca_editada`, a presença do gatilho C5 e
   `tarefas_do_relogio(timestamptz)` com SECURITY DEFINER e proprietário interno.
   Comparar com o pacote testado; se divergir, parar, registrar e testar a diferença.
2. Registrar o SQL como nova migration no repositório pelo fluxo externo autorizado,
   mantendo a branch da Correção 6 intacta. Não aplicar migrations antigas de novo.
3. Guardar cópia/contagem/impressão digital das cobranças e definições dos gatilhos.
   Não rodar laboratório, limpeza ou fichas fictícias no banco real.
4. Com autorização expressa, executar **somente** `SO-SQL-17-DESCONTO-PROTEGIDO.sql`
   no SQL Editor do banco `rnziztwicggdekmpwpgy`. Já inclui BEGIN/COMMIT.
5. Rodar `desconto-protegido-verificar.sql`, comparar a definição nova e impressão
   digital anterior. A criação do gatilho não atualiza nenhuma cobrança.
6. Confirmar em conta de homologação: resposta no prazo, tarefa automática, aparelho
   antigo, releitura, pagamento e cancelamento; ambos os painéis devem ler o mesmo
   desconto. Nada de cobranças fictícias ou exclusões em contas reais.

Não requer publicar novas telas: a proteção funciona com o aplicativo atual.
Conferência em banco real/celulares ainda é pendente, não substituída pelo laboratório.

## Evidências desta preparação

- 40/40 verificações do script novo; inclui matriz financeira 20/20 e C5 45/45.
- 37/37 regressões T4/T5/C2/C3, incluindo embarques e reenvios concorrentes.
- 478/478 testes do app; compilação automática sem erro.
- 4/4 verificações somente leitura do gatilho no laboratório.
- Ensaio de navegador com ponte local não renderizou a cobrança; pagamento/releitura
  na tela e celular real **não confirmados**. Não foi alterado o app para contornar.

Resultados: [evidência local](evidencias/2026-11-21-desconto-protegido.json).

## Reversão

Somente se necessária e autorizada: remover o gatilho `cobranca_a_desconto_do_banco`
e sua função `cobranca_desconto_do_banco()`, dentro de uma transação. Não reverter C3/C5,
não restaurar valores nem apagar cobranças. Atenção: remover essa proteção reabre T4.2.