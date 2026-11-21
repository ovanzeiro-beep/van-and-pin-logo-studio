# Correção 6 — convites e telefones · roteiro de implantação

Preparado em 21/11/2026. **Nada disto foi feito na produção.** Cada passo só com autorização do dono.

Arquivos (branch `claude/correcao-6-convites-e-telefones`):

| Arquivo | Para quê |
| --- | --- |
| `supabase/testes/correcao6-verificar.sql` | Conferência antes e depois (só leitura) |
| `supabase/SO-SQL-17-correcao-6.sql` | A Correção 6 para colar no SQL Editor (tudo ou nada; colar duas vezes não estraga) |
| `supabase/SO-SQL-17b-desfazer-correcao-6.sql` | Desfazer, se precisar |
| `scripts/correcao6-laboratorio.py` | Teste completo num banco descartável (39 itens) |
| `scripts/correcao6-ensaio.py` | Ensaio sobre a cópia dos dados reais (backup fora do GitHub) |

## Ordem (desta vez o APP vem ANTES do banco)

O app novo entende os dois formatos de código e as duas formas de resposta do banco. O app de hoje não lê letras no
código, então, se o banco viesse primeiro, ninguém conseguiria entrar numa van até o app ser publicado.

1. **Fora do horário da van.** O Claude roda `correcao6-verificar.sql` (só leitura) e guarda as impressões dos dados
   (itens 20 a 25). Se possível, um backup novo (como o de 21/11).
2. **Merge e publicação do app.** Conferir no celular: a tela "Entrar em outro destino" mostra "Ex.: VAN-7K2Q9M".
   Com o banco ainda antigo, tudo continua funcionando com os códigos de hoje.
3. **Banco:** o dono cola `SO-SQL-17-correcao-6.sql` no SQL Editor e toca em **Run** uma vez. Certo: "Success".
   Erro: nada é gravado; não tentar de novo; mandar a mensagem.
4. **Conferência:** o Claude roda `correcao6-verificar.sql` de novo (só leitura): itens 1 a 11 iguais ao esperado e
   itens 20 a 25 iguais aos do passo 1 (só o código mudou).
5. **No celular do dono:**
   - como vanzeiro, fechar e abrir o app → Destinos → o destino ativo mostra o **código novo** (VAN- e 6 letras e
     números) → "Copiar" e "Enviar pelo WhatsApp" funcionam;
   - como passageiro (a própria conta de teste do dono), "Entrar em outro destino" → digitar o código novo em
     minúsculas → a van aparece (não precisa mandar o pedido);
   - o código antigo mostra "Código não encontrado".
6. **Avisar o vanzeiro do piloto:** o código mudou; quem já está na van não precisa fazer nada; o código novo é para
   quem ainda vai entrar.

O teste do bloqueio (10 erros) fica só no laboratório, para não travar a conta do dono.

## Se algo der errado

| Quando | O que fazer |
| --- | --- |
| Erro ao colar | Nada foi gravado. |
| Conferência não bate | Colar `SO-SQL-17b-desfazer-correcao-6.sql` e conferir com o Claude. |
| Problema depois | Colar `SO-SQL-17b`. Volta a busca do convite e o pedido de antes; **os códigos novos continuam valendo** (não precisa avisar ninguém de novo) e as funções antigas de telefone **continuam fechadas**. O app publicado continua funcionando com o banco desfeito. |
