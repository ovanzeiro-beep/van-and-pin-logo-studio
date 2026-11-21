# Correção 6 — convites e telefones · roteiro de implantação

Preparado em 21/11/2026. **Nada disto foi feito na produção.** Cada passo só com autorização do dono.

Arquivos (branch `claude/correcao-6-convites-e-telefones`):

| Arquivo | Para quê |
| --- | --- |
| `supabase/testes/correcao6-verificar.sql` | Conferência antes e depois (só leitura) |
| `supabase/SO-SQL-18-correcao-6.sql` | A Correção 6 para colar no SQL Editor (tudo ou nada; colar duas vezes não estraga) |
| `supabase/SO-SQL-18b-desfazer-correcao-6.sql` | Desfazer, se precisar |
| `scripts/correcao6-laboratorio.py` | Teste completo num banco descartável (55 itens, inclui a Opção A) |
| `scripts/correcao6-ensaio.py` | Ensaio sobre a cópia dos dados reais (backup fora do GitHub) |

## O que entra

1. Código de convite novo (VAN- + 6 letras e números), criado pelo banco; troca dos códigos dos 2 destinos ativos.
2. Limite de códigos errados no servidor (10 por hora por conta; alarme contra muitas contas).
3. Funções antigas de "juntar pelo telefone" fechadas.
4. **Opção A — "Ligar ao cadastro" com código pelo WhatsApp:** o vanzeiro toca em "Enviar código", o app mostra um
   código de 6 números e o botão "Abrir o WhatsApp" já com a mensagem para o telefone **que estava no cadastro**. A
   pessoa digita o código no app e só então vê o cadastro (endereço, histórico, cobranças). Ligar direto, sem código,
   fica fechado. O banco guarda só a impressão do código; 5 tentativas; vale 10 minutos; uso único; apagado em até 7 dias.

## Ordem (desta vez o APP vem ANTES do banco)

O app novo entende os dois formatos de código e as duas formas de resposta do banco. O app de hoje não lê letras no
código, então, se o banco viesse primeiro, ninguém conseguiria entrar numa van até o app ser publicado.
Entre a publicação e a colagem do SQL (poucos minutos), o botão "Enviar código" responde "Esta função ainda está
sendo instalada"; nada se perde.

1. **Fora do horário da van.** O Claude roda `correcao6-verificar.sql` (só leitura) e guarda as impressões dos dados
   (itens 20 a 25). Se possível, um backup novo (como o de 21/11).
2. **Merge e publicação do app.** Conferir no celular: a tela "Entrar em outro destino" mostra "Ex.: VAN-7K2Q9M".
   Com o banco ainda antigo, tudo continua funcionando com os códigos de hoje.
3. **Banco:** o dono cola `SO-SQL-18-correcao-6.sql` no SQL Editor e toca em **Run** uma vez. Certo: "Success".
   Erro: nada é gravado; não tentar de novo; mandar a mensagem.
4. **Conferência:** o Claude roda `correcao6-verificar.sql` de novo (só leitura): itens 1 a 11 iguais ao esperado e
   itens 20 a 25 iguais aos do passo 1 (só o código mudou).
5. **No celular do dono:**
   - como vanzeiro, fechar e abrir o app → Destinos → o destino ativo mostra o **código novo** (VAN- e 6 letras e
     números) → "Copiar" e "Enviar pelo WhatsApp" funcionam;
   - como passageiro (a própria conta de teste do dono), "Entrar em outro destino" → digitar o código novo em
     minúsculas → a van aparece (não precisa mandar o pedido);
   - o código antigo mostra "Código não encontrado";
   - Opção A (opcional, só com contas de teste do dono): no destino, cadastrar à mão um passageiro com o telefone
     do próprio dono; com a conta de passageiro de teste, pedir para entrar com esse telefone; no pedido, tocar em
     "Enviar código" → "Abrir o WhatsApp" → a mensagem chega no WhatsApp do dono → digitar o código no app do
     passageiro → o Início abre com a van. Depois, remover esse cadastro de teste. Se preferir não criar dados de
     teste na produção, esta parte fica validada só no laboratório (55/55).
6. **Avisar o vanzeiro do piloto:** o código mudou; quem já está na van não precisa fazer nada; o código novo é para
   quem ainda vai entrar.

O teste do bloqueio (10 erros) fica só no laboratório, para não travar a conta do dono.

## Se algo der errado

| Quando | O que fazer |
| --- | --- |
| Erro ao colar | Nada foi gravado. |
| Conferência não bate | Colar `SO-SQL-18b-desfazer-correcao-6.sql` e conferir com o Claude. |
| Problema depois | Colar `SO-SQL-18b`. Volta a busca do convite e o pedido de antes; **os códigos novos continuam valendo** (não precisa avisar ninguém de novo); as funções antigas de telefone **continuam fechadas**; o "Ligar ao cadastro" **continua com o código do WhatsApp** (ligar direto não volta). O app publicado continua funcionando com o banco desfeito. |
