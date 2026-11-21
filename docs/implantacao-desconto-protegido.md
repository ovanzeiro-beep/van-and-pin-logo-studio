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

### Conferência de prontidão — 21/11/2026 (prompt-26)

**Resultado: preparada, mas ainda não liberada para implantação.** Conferência sobre
`ebbf4b425cf1d696f15e0c4982056719b5fd1ff4`, árvore limpa ao iniciar. O SQL existente
permanece intacto; SHA-256:
`f3dcf0c60039422425c6b8a32149320f30145974a16ac5e48a4ef885c3a5e21d`.
A migration `20261121121000_desconto_protegido.sql` ainda não existe nesta cópia.
Não houve nova tentativa de criação nem contorno da restrição.

**Compatibilidade:** a proteção usa os mesmos campos e preserva as funções das
Correções 2/3/5 presentes no repositório. O relógio da C2 incrementa `faltas` no banco;
a C5 mantém a recusa de edição de paga/cancelada e sua exceção de anonimização.
Os resultados existentes demonstram compatibilidade no laboratório, não no banco
atual. Nesta sessão não há conexão externa disponível; a consulta de metadados pelo
CLI gerenciado foi recusada porque este projeto não tem banco Lovable Cloud.
Isso não significa que o Supabase do dono esteja desligado. **Não foi possível
confirmar as definições reais nem se alguém já instalou a proteção externamente.**

Os registros históricos dizem que C1–C5 foram implantadas; a abertura da seção 22
ainda contém trechos que dizem que aguardam implantação. Essa divergência já estava
registrada e não foi resolvida por suposição. A conferência abaixo é obrigatória.
Não houve repetição da auditoria geral ou dos testes; os 40/40, 37/37 e 478/478
citados neste documento são evidências anteriores.

### O que falta, na ordem mais simples

1. **Conferir o banco correto, somente em leitura.** No painel do Supabase do dono,
   abrir `ovanzeiro` (`rnziztwicggdekmpwpgy`) → SQL Editor. Executar apenas as consultas
   abaixo e guardar os resultados, sem senhas ou chaves. Comparar as definições do
   relógio e da C5 com o pacote testado; conferir os demais gatilhos da cobrança,
   permissões e colunas. Se houver diferença funcional, parar e testar essa diferença
   numa cópia isolada, sem refazer a solução ou modificar produção.
2. **Registrar o arquivo novo fora desta ferramenta.** Pelo trabalho direto no
   repositório `ovanzeiro-beep/van-and-pin-logo-studio`, copiar integralmente o SQL
   existente para `supabase/migrations/20261121121000_desconto_protegido.sql` e conferir
   igualdade/SHA-256. Registrar em commit de preparação, sem merge, sem executar SQL
   e sem tocar na branch da Correção 6. Não reaplicar migrations antigas.
3. **Após autorização expressa, instalar e conferir.** Guardar backup recuperável,
   definições e fotografia das cobranças; executar somente o SQL existente completo
   no SQL Editor; executar a conferência existente somente de leitura. A proteção
   não exige publicação do app. Se já estiver instalada, comparar a definição e
   conferir os critérios de aceite antes de propor qualquer reaplicação.

### Consultas antes da instalação — somente leitura

Estas consultas não instalam, não chamam o relógio e não alteram cobranças.
Resultados de definições/permissões devem ser comparados por quem conduz a implantação;
o simples retorno de linhas não é aprovação automática de compatibilidade.

```sql
-- Definições, proprietário e permissões das duas funções centrais.
select p.oid::regprocedure::text as funcao,
       pg_get_userbyid(p.proowner) as proprietario,
       p.prosecdef as security_definer,
       p.proconfig as configuracao,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_executa,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as app_executa,
       pg_get_functiondef(p.oid) as definicao
from pg_catalog.pg_proc p
where p.oid in (
  to_regprocedure('public.tarefas_do_relogio(timestamptz)'),
  to_regprocedure('public.cobranca_nunca_editada()'),
  to_regprocedure('public.cobranca_desconto_do_banco()')
);

-- Todos os gatilhos da cobrança: comparar ligação, ordem, estado e definição.
select t.tgname, t.tgenabled,
       t.tgfoid::regprocedure::text as funcao,
       pg_get_triggerdef(t.oid) as definicao
from pg_catalog.pg_trigger t
where t.tgrelid = to_regclass('public.cobrancas') and not t.tgisinternal
order by t.tgname;

-- Campos usados pela proteção.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'cobrancas'
  and column_name in ('faltas', 'valor_falta', 'periodo_de', 'periodo_ate',
                      'pagamento_data', 'cancelamento_data')
order by column_name;

-- Impressões das funções públicas para comparação antes/depois: sem ler dados pessoais.
select p.oid::regprocedure::text as funcao,
       md5(pg_get_functiondef(p.oid)) as impressao_definicao,
       pg_get_userbyid(p.proowner) as proprietario, p.proacl::text as permissoes
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f'
order by 1;

-- Fotografia de integridade; não mostra o conteúdo das cobranças.
select count(*) as cobrancas,
       md5(coalesce(jsonb_agg(to_jsonb(k) order by id)::text,'')) as impressao_digital
from public.cobrancas k;
```

O relógio deve continuar `SECURITY DEFINER`, com proprietário interno diferente de
`anon`, `authenticated` e `service_role`, e não executável pelo app/sem login.
`cobranca_sem_edicao` deve estar ativo e ligado à definição C5 testada.
Se o gatilho adicional já existir, sua definição deve corresponder ao SQL preparado.
O SQL de instalação verifica apenas parte dos pré-requisitos; seu sucesso sozinho
não substitui essa comparação. Não enviar chaves, senhas ou dados de passageiros.

### Como comprovar o encerramento desta pendência

- **Instalação real:** `supabase/testes/desconto-protegido-verificar.sql` retorna
  quatro resultados `ok = true`; conferir também a definição exata do gatilho/função.
  Funções e permissões C1–C5 permanecem iguais; só a proteção adicional é nova.
- **Dados preservados:** comparar contagem e impressão digital antes/depois.
  Fazer a comparação numa janela coordenada sem gravações concorrentes. O relógio e
  os usuários podem alterar dados legitimamente; diferença exige identificar a causa,
  não restaurar valores automaticamente. A instalação não contém UPDATE de dados.
- **Reprodução isolada com a estrutura real:** mensal e quinzenal de R$ 300,
  duas faltas de R$ 10 devem continuar em R$ 280 depois de um envio antigo com zero
  faltas; relógio repetido ou concorrente não duplica. Pagamento/cancelamento mantêm
  esse desconto; cobranças pagas/canceladas continuam protegidas; passageiro não altera.
  Usar os testes existentes, sem rodá-los em produção.
- **Dois aparelhos em ambiente separado de homologação:** abrir ambos os painéis,
  carregar estado antigo num aparelho, calcular a falta pelo banco, reenviar estado
  antigo, reler e conferir o mesmo valor; pagar uma cobrança e cancelar outra com
  motivo, fechar/reabrir e conferir novamente. Não criar fichas fictícias em produção
  sem autorização específica. A prova visual anterior não foi concluída.
- **Registro final:** guardar versão, data, resultados da instalação, regressões e
  aparelhos em `docs/contraprova.md`; só então marcar P0-F1 concluída. Descontos
  eventualmente perdidos antes da proteção não são recuperados por este SQL e
  exigem investigação separada, sem editar cobranças encerradas.

**Próxima ação concreta:** obter a conferência de leitura do banco externo por um
acesso autorizado ou pelos resultados do SQL Editor do dono. Não é necessário
contratar/ativar Lovable Cloud, refazer telas ou publicar para concluir esta proteção.

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