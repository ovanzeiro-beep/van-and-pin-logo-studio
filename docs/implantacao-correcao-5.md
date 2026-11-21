# Correção 5 — roteiro de implantação

Preparado em 21/11/2026. **Nada disto foi feito na produção.** Cada passo só com autorização do dono.

Arquivos (branch `claude/correcao-5-exclusao-de-contas`):

| Arquivo | Para quê |
| --- | --- |
| `supabase/testes/correcao5-pre-verificar.sql` | Conferência **antes** (só leitura) |
| `supabase/SO-SQL-16-correcao-5.sql` | A Correção 5 para colar no SQL Editor (tudo ou nada) |
| `supabase/testes/correcao5-verificar.sql` | Conferência **depois** (só leitura) |
| `supabase/SO-SQL-16b-desfazer-correcao-5.sql` | Desfazer, se precisar (não traz a cascata de volta) |
| `supabase/functions/avisos-no-celular/index.ts` | Versão 10 da produção + o título "Vanzeiro saiu do app" |
| backup `backup-ovanzeiro-2026-11-21.json` | Fora do GitHub (tem dados pessoais); sha256 `d22dd401…8de6148` |

## Ordem (o banco SEMPRE antes do app)

O app novo lê `saiu_do_app_em`, que só existe depois da Correção 5. Publicar o app antes faria o Início do passageiro
não carregar o vanzeiro. Por isso:

1. **Fora do horário da van.** Conferência antes: colar `correcao5-pre-verificar.sql` no SQL Editor (ou o Claude roda,
   só leitura). Tudo precisa dar o esperado e "igual". Se algum dado der **DIFERENTE**, alguém usou o app depois do
   backup: fazer um backup novo antes de seguir.
2. **Aplicar:** abrir o SQL Editor, colar `SO-SQL-16-correcao-5.sql` inteiro e tocar em **Run**.
   - Certo: aparece uma linha `schedule` com um número (é a tarefa de hora em hora sendo agendada).
   - Erro: nada é gravado (o arquivo é "tudo ou nada"). Não tentar de novo; mandar a mensagem para o Claude.
   - Colar duas vezes não estraga nada (testado).
3. **Conferir:** colar `correcao5-verificar.sql` (ou o Claude roda, só leitura). São 23 linhas; todas iguais ao
   esperado. Itens 21 a 29 mostram que nenhum dado existente mudou.
4. **Merge** da branch na `main` e **publicação** no Lovable.
5. **Função de avisos:** publicar a versão com o título "Vanzeiro saiu do app" (é a versão 10 de hoje + 1 linha).
   Enquanto não publicar, esse aviso chega no celular com o título "O Vanzeiro"; o resto não muda.
6. **Teste no celular**, só com contas de teste: excluir um vanzeiro de teste com cobrança em aberto → o passageiro de
   teste vê o aviso, o card "O vanzeiro saiu do app", informa o acerto → a cobrança continua "Pendente"/"Devendo" com
   a linha "Acerto informado… Não é comprovante".
7. Depois: o advogado define o prazo legal máximo (fica vazio até lá).

## Se algo der errado

| Quando | O que fazer |
| --- | --- |
| Erro ao colar (passo 2) | Nada foi gravado. Não precisa desfazer. |
| Conferência (passo 3) não bate | Não publicar o app. Colar `SO-SQL-16b-desfazer-correcao-5.sql` e conferir com o Claude. |
| Problema depois de publicar | Colar `SO-SQL-16b-desfazer-correcao-5.sql`. Ele tira as regras novas, mas **mantém** as colunas e tabelas novas (vazias), então o app publicado continua abrindo. Depois decidir se volta o app também. |
| Dados estragados (não esperado) | Restaurar do backup **só as tabelas afetadas**, com o Claude, pelo mesmo método do ensaio (`scripts/backup-ensaio-correcao5.py`). |

O desfazer **nunca** volta a ligação login → conta nem a exclusão em cascata. A única regra que não volta a ser a de
antes é `excluir_minha_conta`: fica a da Correção 2, já sem apagar cobranças.

## Backup: o que tem e o que não tem

É um **backup lógico parcial**, não um backup completo do Supabase.

- **Tem:** as 20 tabelas do app (198 linhas): contas, perfis, destinos, matrículas, respostas, viagens, embarques,
  cobranças, faltas, gastos, pedidos, avisos etc., com a impressão digital (md5) de cada tabela na hora da exportação.
- **Não tem:** logins e senhas (`auth.users`, guardados pelo Supabase); chave secreta das notificações
  (`chaves_push`); endereços de notificação dos celulares (`celulares`, `entregas_push` — refazem-se ao ativar de novo);
  arquivos; configurações do projeto. As regras (funções, gatilhos, acessos) não estão no backup: estão no GitHub
  (`supabase/migrations` + `supabase/testes/espelho-producao-4-funcoes-20261121.sql`).
- **Restauração:** no ensaio, um banco de teste montado com as regras do GitHub recebeu o backup e ficou **20 de 20
  tabelas idênticas** à produção. Na produção, a restauração seria só das tabelas afetadas, inserindo de volta as linhas
  do arquivo, sempre conferindo o md5.
- **Para um backup completo** (com logins), é preciso o plano pago do Supabase (backups diários ou volta no tempo).
- A Correção 5, ao ser aplicada, **não apaga nem muda nenhum dado** (conferido no ensaio e pela conferência do passo 3).
