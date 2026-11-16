# Contraprova — O Vanzeiro

Checklist que confirma que cada etapa foi feita certa. Consultar **no começo e no fim de cada etapa**.
Este arquivo nunca é apagado nem reescrito do zero: só ganha marcações e anotações.

## Situação das etapas

| Etapa | Situação |
| --- | --- |
| A — Revisão do que existe | Feita e aprovada em 13/11/2026 |
| B — Fluxos que faltam | **Feita em 14/11/2026** — todos os 9 itens completos |
| C — Preparar o código para o banco (sem colocar o banco) | **Feita em 14/11/2026**, itens 1 a 6. Item 7 pendente por decisão do dono do projeto |
| D — Acabamento visual | **Feita em 14/11/2026** |
| E — Decisões do dono do projeto | **Feita em 14/11/2026** (16 itens) |

---

## Não pode quebrar (conferir a cada etapa)

Conferido de novo em 14/11/2026, no fim das pendências finais: telas e textos comparados com a versão anterior, regras com testes (ver o mapa regra → teste da Etapa C), nenhum ícone de ônibus no app, carteira nos dois painéis, Início sem rolar no celular comum, testes e build passando, sem banco de dados.

Visual (seção 4)
- [x] Cor principal azul-marinho; amarelo-âmbar só em botões principais e avisos; fundo branco e cinza bem claro.
- [x] Cores de situação: verde = pago / embarcou / na van; vermelho = devendo / faltando / não estava no ponto; âmbar = pendente / sem resposta.
- [x] Logo: van de lado com pino de localização. Ícone de van (nunca ônibus) em todo o app.
- [x] O mesmo ícone de carteira para dinheiro nos dois painéis.
- [x] Cards arredondados, sombra suave, ícone à esquerda, informação principal grande.
- [x] Cabeçalho azul com saudação e sininho.
- [x] Barra de navegação de baixo igual à aprovada (vanzeiro: Início, Destinos, Viagem, Financeiro, Perfil; passageiro: Início, Viagens, Pagamentos, Perfil).

Palavras (seção 5)
- [x] Vou / Não vou · Sem resposta · Pendente · Devendo · Pago · Embarcou / Não estava no ponto · Está na van / Ficou aqui — sempre com o mesmo sentido.

Telas (seção 2)
- [x] O Início dos dois painéis não rola num celular comum.
- [x] Telas de lista rolam só na lista, com cabeçalho e barra parados.
- [x] Formulários longos em passos ("Passo 1 de 3").

Regras (seção 6)
- [x] Cadastro com e-mail e senha (com confirmar senha) ou Google, os dois exigindo o aceite dos Termos e da Política.
- [x] Escolha "Sou vanzeiro" / "Sou passageiro", com troca no Perfil.
- [x] Destino: rota fixa (dias da semana) ou viagem avulsa (uma data); ida, volta opcional, paradas em ordem; código de convite; "Confirmar até" (padrão 1 hora antes).
- [x] Passageiro entra pelo código e o vanzeiro aceita ou recusa; o vanzeiro também cadastra direto.
- [x] Uma pessoa pode estar em mais de um destino, com plano e valor próprios em cada um.
- [x] Passageiro responde Vou / Não vou até o prazo e pode mudar até lá.
- [x] Quem não confirmar até o prazo não entra na busca.
- [x] Busca na ordem das paradas, com Embarcou / Não estava no ponto.
- [x] Em toda parada a viagem só segue com todos conferidos; "Estou na van" pelo celular do passageiro; "Ficou aqui" só do vanzeiro.
- [x] Volta na ordem inversa da ida, com "Desceu".
- [x] Planos: Por viagem (ida e volta contam como uma), Diário, Quinzenal, Mensal.
- [x] Cobrança nunca é editada: só "marcada como paga" (Dinheiro ou Pix) ou "cancelada" com motivo.
- [x] O total que alguém deve é a soma das cobranças não pagas.
- [x] Desconto de faltas só em Mensal e Quinzenal, só para quem avisou "Não vou" no prazo.
- [x] "A receber" inclui atrasados de meses anteriores.
- [x] O passageiro nunca marca como pago; só avisa pelo WhatsApp.
- [x] Sem banco de dados: só dados de exemplo.

Conferência técnica
- [x] Testes automáticos passando.
- [x] Build passando.

---

## Etapa A — Revisão do que existe

**Situação:** feita em 13/11/2026. Aguardando aprovação do dono do projeto.
**O que foi pedido:** percorrer todos os caminhos como vanzeiro e como passageiro, num tamanho de celular, e entregar uma lista. **Só a lista, sem corrigir.**

### Itens da etapa
- [x] Criar este arquivo (`docs/contraprova.md`).
- [x] Percorrer o painel do vanzeiro (Início, Destinos, detalhe, novo/editar destino, passageiros, novo/editar passageiro, Pedidos, Viagem completa, Financeiro, cobrança, Perfil).
- [x] Percorrer o painel do passageiro (conta nova, código de convite, aguardando, Início, Viagens, Pagamentos, cobrança, Perfil, entrar em outro destino, conferência pelo celular).
- [x] Percorrer abertura, Entrar, Criar conta, Esqueci minha senha, escolha de perfil, Termos e Política.
- [x] Conferir em 3 tamanhos: 390 × 844 (celular comum), 360 × 740 (Android comum) e 375 × 667 (iPhone SE).
- [x] Entregar a lista abaixo, sem corrigir nada.
- [x] Testes (101 passando) e build (passando) conferidos. Nenhum código do app mudou.

### Resultado da revisão

**1. Telas que mostram a coisa errada**
1. Início do vanzeiro não respeita destino pausado: com "Cambará → UENP Jacarezinho" pausado, o Início continua mostrando essa viagem como "Viagem de hoje", enquanto a aba Viagem já mostra "Jacarezinho → Londrina".
2. Início do vanzeiro não acompanha a viagem: depois de encerrar a viagem das 06:40, o Início continua com "Às 06:40" e "3 de 6", sem dizer que ela acabou. Com duas viagens no dia, mostra a das 06:40 e não a das 06:00, que sai antes.
3. Nome do vanzeiro no cabeçalho não muda: depois de trocar o nome no Perfil, a saudação continua "Carlos". O passageiro já vê o nome novo.
4. Início do passageiro destaca a viagem perdida: a Juliana vê "Jacarezinho → Londrina — prazo encerrado, a van não vai passar" e não vê a de "Cambará → UENP", que ainda dá para confirmar até 05:40. Ela só acha essa na aba Viagens.
5. Passageiro que pede para entrar em outro destino e é recusado não recebe o aviso "O vanzeiro não aceitou": a tela volta direto para o campo do código (visto no código).

**2. Textos confusos ou palavras trocadas**
1. "1 não vão" no Início do vanzeiro (o certo é "1 não vai").
2. Na busca aparece "1 faltou" / "2 faltou": plural errado, e "faltou" não é palavra da tabela (o combinado é "Não estava no ponto").
3. Histórico do passageiro usa "Faltou" (vermelho) para quem avisou "Não vou" no prazo e também para quem não estava no ponto. São coisas diferentes.
4. O selo "Confirmar" (âmbar) aparece em viagens cujo prazo já passou, onde não dá mais para confirmar.
5. O mesmo valor do passageiro tem três nomes: "Valor em aberto" (Início), "Você deve" (Pagamentos) e "Deve no total" (vanzeiro). E "Você deve" aparece mesmo quando nada venceu, o que confunde com "Devendo".
6. "Valores a receber" seguido de "Total a receber" no Início do vanzeiro: repete a mesma coisa.
7. Resumo da viagem: "Ficaram (desceram de propósito)" aparece para quem ficou no destino, e essa pessoa não desceu no caminho.
8. Barra "Situação da van" do passageiro: o último passo diz "No seu ponto", mas acende quando a pessoa já está na van.
9. Plano Por viagem: "Ida + volta: 1 cobrança, mesmo noutro dia." ("noutro" é de Portugal; frase difícil).
10. Horário "Às 06:40" no Início do vanzeiro usa o âmbar, que é a cor de "pendente".
11. "Voltar ao perfil" (tela Entrar em outro destino) usa o ícone de "Sair".

**3. Botões que não fazem nada, ou que agem sem confirmar**
1. Sininho do passageiro: tem uma bolinha amarela sempre acesa e não faz nada ao tocar.
2. "Recusar" pedido: o pedido some na hora, sem confirmação e sem como desfazer.
3. "Sair" na tela "Entrar na van": sai direto, sem a pergunta "Quer mesmo sair?" que existe no Perfil.
4. "Remover deste destino": a confirmação não diz o que acontece com as cobranças da pessoa.

**4. Números ou informações que não batem entre telas**
1. Início do vanzeiro mostra "9 Pagos" (só do mês), mas ao tocar o Financeiro, o filtro "Pagas" lista 19 (todas, de todos os meses).
2. A saudação usa o relógio do celular ("Boa noite"), mas o "agora" dos exemplos é 05:10 (deveria ser "Bom dia").
3. Itens 1 e 2 da parte 1 (Início × Viagem).

**5. Telas que rolam sem precisar**
1. Início do vanzeiro rola no Android comum 360 × 740 (o botão "Novo destino" fica escondido) e rola mais com a barra do navegador aberta. No iPhone SE rola 77px (aceito pela regra). O Início do passageiro só rola em 360 × 660.
2. Perfil do vanzeiro rola um pouco no celular comum (o "Sair" fica cortado) e o cabeçalho sobe junto.
3. Perfil do passageiro rola com o cabeçalho junto (lista os dois destinos e endereços).
4. Detalhe do destino, detalhe do passageiro e detalhe da cobrança com desconto rolam a tela inteira, com o cabeçalho junto.
5. Criar conta rola no celular comum (o botão do Google fica embaixo). Entrar e "Como você vai usar o app?" rolam no iPhone SE.
6. Novo destino: o passo 3 com 3 ou mais paradas e o Resumo rolam no iPhone SE.
7. "Viagem encerrada" rola 15px.
8. Telas da viagem (Buscando, Parada, Conferência) com muito espaço vazio (já previsto na Etapa D).

**6. Esperado, sem banco (não é erro)**
- "Entrar" e "Entrar com Google" entram sem conferir nada; recarregar a página volta aos exemplos.
- Conta nova como vanzeiro abre com os dados de exemplo do Carlos (é a Etapa B, item 1).
- Passageiro não edita o próprio perfil (é a Etapa B, item 4).

### Dúvidas para o dono do projeto
1. O vanzeiro pode tocar em "Iniciar viagem" antes do prazo? Hoje pode, e isso fecha as respostas na hora: às 05:10 ele inicia a viagem das 06:40 (prazo 05:40) e quem ainda não respondeu passa a ver "a van não vai passar".
2. Quando um passageiro é removido, as cobranças dele que ainda não venceram (ex.: mensalidade de 20/11) devem continuar contando no "A receber"? Hoje continuam.
3. A mensalidade leva o nome do mês do vencimento: "Mensalidade de novembro" vence 10/11 e conta as faltas de 11/10 a 10/11. Está certo assim?
4. Telas de detalhe (destino, passageiro, cobrança) podem rolar inteiras, com o cabeçalho junto?
5. Quando há duas viagens no mesmo dia, qual o Início deve mostrar: a próxima a sair?

### Observação técnica
- A conferência automática de formatação do código acusa 612 avisos (espaços e quebras de linha). Não muda nada no app.

---

## Etapa B — Fluxos que faltam
**Situação:** em andamento. A Etapa A foi aprovada em 13/11/2026 ("pode seguir"). As instruções do projeto foram salvas em `CLAUDE.md`.
Os itens são feitos um por um, cada um com conferência, merge e aprovação.

### Item 1 — Primeiro uso do vanzeiro (feito em 13/11/2026)
- [x] Conta nova: "Criar conta" → "Sou vanzeiro" abre o painel sem destinos, passageiros, pedidos, cobranças e viagens, com o nome digitado no cadastro (os exemplos do Carlos continuam valendo para quem usa "Entrar").
- [x] Cabeçalho do vanzeiro mostra o nome do perfil (corrige o item 1.3 da revisão, necessário para a conta nova).
- [x] Início sem destinos: ajuda curta de 3 passos (criar destino → convidar passageiros → fazer a viagem) e um só botão, "Crie seu primeiro destino".
- [x] Abas Destinos, Viagem e Financeiro sem destinos: a mesma tela, com o mesmo único botão (em Destinos, some o botão "Novo destino" do cabeçalho enquanto não há destinos).
- [x] Perfil da conta nova: o que ainda não foi preenchido aparece como "Não informado".
- [x] Início sem destinos não rola (390 × 844, 360 × 740, iPhone SE). Destinos, Viagem e Financeiro também não rolam.
- [x] Teste automático da conta nova vazia (`src/test/conta-nova.test.ts`).
- [x] Testes (104) e build passando; telas com dados de exemplo iguais a antes, conferidas imagem por imagem (Início, Destinos, Viagem, Financeiro, Perfil dos dois painéis).

O que mudou: telas Início, Destinos, Viagem e Financeiro do vanzeiro (só quando não há destinos), Perfil do vanzeiro ("Não informado"), cabeçalho do vanzeiro (nome do perfil), Criar conta e "Como você vai usar o app?" (marcam e abrem a conta nova).

Pendências do item 1:
- Depois do primeiro destino, se não houver viagem hoje, o Início mostra "Sem viagem hoje" com "Às --:--" e números zerados. Isso é a tela "dia sem viagem" do item 3.
- ~~Sem banco, só existe um painel de vanzeiro: se uma conta nova entrar como passageiro na van do Carlos e depois tocar em "Sou vanzeiro", o painel começa vazio e os dados de exemplo somem até recarregar a página.~~ Corrigido no item 3 (13/11/2026): o painel só começa vazio quando a primeira escolha da conta nova é "Sou vanzeiro". Quem escolhe "Sou passageiro" primeiro, ou usa "Entrar", continua com os exemplos do Carlos e consegue trocar para vanzeiro e aceitar o próprio pedido.
- [x] 1. Primeiro uso do vanzeiro (tela vazia amigável, "Crie seu primeiro destino", ajuda de 3 passos).
- [x] 2. Primeiro uso do passageiro (tela do código, com explicação de onde conseguir).
- [x] 3. Telas vazias com mensagem e botão útil (destino sem passageiros, dia sem viagem, sem cobranças, sem pedidos, histórico vazio).
- [x] 4. Editar perfil (vanzeiro e passageiro): nome, telefone, chave Pix, van, endereço de embarque.
- [x] 5. Excluir destino (com confirmação e aviso) e sair de um destino (passageiro).
- [x] 6. Excluir minha conta nos dois perfis (LGPD), com confirmação clara (feito em 14/11/2026).
- [x] 7. Avisos no sininho (vanzeiro: pedido novo, resposta de passageiro, cobrança vencida; passageiro: prazo chegando, van saiu, cobrança vencendo) (feito em 14/11/2026).
- [x] 8. Histórico de viagens do vanzeiro, com resumo de cada uma (feito em 14/11/2026).
- [x] 9. Mensagens de erro e confirmação em toda ação que não dá para desfazer (feito em 14/11/2026).
- [x] 7. Avisos no sininho (vanzeiro: pedido novo, resposta de passageiro, cobrança vencida; passageiro: prazo chegando, van saiu, cobrança vencendo). — feito em 14/11/2026 (Item 7); o sininho do passageiro foi corrigido no item 4 da Etapa C e o do vanzeiro na pendência P3

**Plano do item 7 (início em 14/11/2026):**
- Criar dados de exemplo: tabela `Aviso` com tipo (pedido_novo, resposta, cobranca_vencida, prazo_chegando, van_saiu, cobranca_vencendo), para_quem (id do vanzeiro ou passageiro), sobre_quem (passageiro para avisos de resposta), destino, texto, data, lido (boolean).
- Criar store `avisos-store.ts` com funções para obter, marcar como lido, criar avisos. Usar `useSyncExternalStore`.
- Expandir a tela de Pedidos para mostrar também avisos (ou criar tela unificada de "Notificações"), com dois abas: "Pedidos" e "Avisos", ou lista única de "Notificações".
- Fazer o sininho mostrar o número de notificações não lidas (pedidos + avisos não lidos).
- Regras de negócio: avisos são criados automaticamente (não é escopo do item 7 ainda; dados de exemplo)
- Testes para avisos (criar, marcar como lido, contar não lidos)
- Telas não rolam
- [x] 8. Histórico de viagens do vanzeiro, com resumo de cada uma. — feito em 14/11/2026 (Item 8); o caminho até a tela veio na pendência P4

**Plano do item 8 (início em 14/11/2026):**
- Rota `/vanzeiro/historico`: lista as viagens feitas (com status "Feita"), com data, destino, horário de saída/volta, resumo (embarcaram, não estavam, etc.)
- Dados de exemplo: viagens já encerradas (Cambará → UENP com status "Feita")
- Componente para mostrar a lista de viagens ou tela vazia "Você não fez viagens ainda"
- Testes para histórico de viagens
- Tela não rola
- [x] 9. Mensagens de erro e confirmação em toda ação que não dá para desfazer. — feito em 14/11/2026 (Item 9)

**Plano do item 9 (início em 14/11/2026):**
- Revisar todas as ações irreversíveis (excluir destino, sair do destino, excluir conta, recusar pedido, marcar como pago, cancelar cobrança)
- Garantir que cada ação tem confirmação clara (AlertDialog ou toast)
- Mensagens devem explicar o que acontece e que não dá para desfazer
- Testar que as mensagens aparecem corretamente
- Verificar ações com erro (ex: tentar excluir durante viagem)

### Item 2 — Primeiro uso do passageiro (feito em 13/11/2026)
O que já existia: conta nova de passageiro sem van abre direto a tela "Entrar na van", com o campo do código (feito antes desta etapa).
- [x] Na tela do código (passageiro sem van), um quadro curto "Onde consigo o código?" explicando que o código vem do vanzeiro, pelo WhatsApp.
- [x] O quadro aparece só no primeiro uso (sem van). A tela "Entrar em outro destino" fica como está.
- [x] Tela do código não rola (390 × 844, 360 × 740, iPhone SE), nem com a mensagem "Código não encontrado". O quadro some quando o código é encontrado.
- [x] Testes (104) e build passando; "Entrar em outro destino", Início e Perfil do passageiro iguais a antes, conferidos imagem por imagem.

O que mudou: só a tela "Entrar na van" do passageiro sem van (arquivo `EntrarNaVan.tsx`). Não há regra nova, por isso nenhum teste novo.

### Item 3 — Telas vazias com mensagem e um botão útil (feito em 13/11/2026)
Uma peça só (`TelaVazia`) para todas, no mesmo visual da tela "Nenhum pedido novo" que já existia.
- [x] Destino sem passageiros: no detalhe do destino já existia ("Nenhum passageiro ainda." + "Adicionar passageiro"), fica como está. Na aba Viagem, um destino de hoje sem passageiros mostra "Este destino ainda não tem passageiros." + botão "Convidar passageiros" (abre o destino, onde estão o código e o "Adicionar passageiro"). No Início, o card de passageiros mostra "Nenhum passageiro ainda" e leva ao destino.
- [x] Dia sem viagem: no Início, o card mostra "Nenhuma viagem hoje" e a próxima viagem (sem "Às --:--" e sem o card de passageiros). Na aba Viagem, a mensagem que já existia ganha o botão "Ver destinos".
- [x] O Início passa a escolher a viagem de hoje do mesmo jeito que a aba Viagem (corrige o item 1.1 da revisão: destino pausado não aparece mais no Início).
- [x] Sem cobranças: no Financeiro, "Nenhuma cobrança ainda." explica que o app cria as cobranças sozinho e tem o botão "Ver destinos"; num filtro vazio (ex.: "Ninguém devendo"), o botão é "Ver todas". Nos Pagamentos do passageiro, "Nenhuma cobrança ainda." + botão "Falar com o vanzeiro".
- [x] Sem pedidos: a tela "Nenhum pedido novo" ganha o botão "Ver destinos" (onde está o código de convite).
- [x] Histórico vazio (Viagens do passageiro): "Suas viagens feitas aparecem aqui."; se também não há viagem nos próximos 7 dias, o botão "Falar com o vanzeiro". O histórico do vanzeiro é o item 8.
- [x] Nenhuma dessas telas rola (390 × 844, 360 × 740, iPhone SE); o Início continua sem rolar.
- [x] Teste automático da escolha da viagem de hoje (`src/test/viagem.test.ts`) e da conta nova que escolhe passageiro primeiro (`src/test/conta-nova.test.ts`).
- [x] Testes (109) e build passando; telas com dados de exemplo iguais a antes, conferidas imagem por imagem (Início, Viagem, Financeiro e filtro Devendo, Pedidos, Início, Viagens e Pagamentos do passageiro).

O que mudou: Início e Viagem do vanzeiro (dia sem viagem, destino sem passageiros, destino pausado), Financeiro (sem cobranças e filtro vazio), Pedidos (sem pedidos), Pagamentos e Viagens do passageiro (sem cobranças, histórico vazio). Peça nova `TelaVazia.tsx`; regra nova `viagemDeHoje` em `src/lib/viagem.ts`.
Correção junto: o painel vazio da conta nova agora só aparece quando a primeira escolha é "Sou vanzeiro" (ver pendências do item 1).

Pendência do item 3: o Início continua mostrando a viagem do dia depois que ela acaba (item 1.2 da revisão); fica para a Etapa D ou para quando você decidir a dúvida 5.

### Item 4 — Editar perfil (feito em 13/11/2026)
O que já existia: o Perfil do vanzeiro tem "Editar" com nome, telefone, chave Pix, modelo e placa da van, e o que é salvo já aparece para o passageiro. O passageiro não tinha como editar.
- [x] Vanzeiro: conferir que o "Editar" que já existe funciona (salva, cancela, o nome novo aparece no cabeçalho e o Pix novo aparece para o passageiro). Nada muda na tela.
- [x] Passageiro: botão "Editar" no Perfil, igual ao do vanzeiro (mesmo lugar, mesmo visual, Cancelar e Salvar), com nome, telefone (WhatsApp) e o endereço de embarque de cada destino.
- [x] Nome e telefone valem para todos os destinos da pessoa; o endereço é de cada destino. A cidade de embarque não muda (ela define a ordem da busca e fica com o vanzeiro).
- [x] O vanzeiro vê os dados novos no detalhe do passageiro e na busca da viagem. As cobranças já criadas guardam o nome e o telefone de quando foram criadas (a cobrança nunca é editada).
- [x] Salvar só funciona com nome, telefone válido (com DDD) e endereços preenchidos.
- [x] A regra fica em `src/lib/passageiros.ts`, com teste automático (`src/test/meus-dados.test.ts`).
- [x] O formulário do passageiro não rola (390 × 844, 360 × 740, iPhone SE).
- [x] Testes (112) e build passando; Início do passageiro, Perfil do vanzeiro e detalhe do passageiro iguais a antes, conferidos imagem por imagem. O Perfil do passageiro ganhou só o botão "Editar".

O que mudou: Perfil do passageiro (botão "Editar" e o formulário). Regras novas `meusDadosValidos` e `atualizarMeusDados` em `src/lib/passageiros.ts`; gravação em `passageiros-store.ts` e `sessao-passageiro.ts`.

Pendência do item 4: o "Editar" do vanzeiro, que já existia e não mudou, rola um pouco no Android 360 × 740 (8px) e no iPhone SE (59px). Fica para a Etapa D.

### Item 9 — Mensagens de confirmação em ações irreversíveis (feito em 14/11/2026)
- [x] Confirmação (AlertDialog) antes de **Recusar pedido**: mostra o nome da pessoa, aviso "Não dá para desfazer", dois botões (Cancelar e Recusar vermelho).
- [x] Revisão de outras ações irreversíveis já com confirmação:
  - Excluir destino ✓ (com aviso de impacto em passageiros e cobranças)
  - Sair deste destino (passageiro) ✓ (com aviso de cobranças)
  - Excluir minha conta (vanzeiro e passageiro) ✓ (com aviso de dados apagados)
  - Sair da sessão ✓ (com aviso "Quer mesmo sair?")
- [x] Novo componente `RecusarPedido.tsx` com AlertDialog.
- [x] Testes (120) e build passando.

O que mudou: Componente novo `RecusarPedido.tsx`, atualizado `PassageirosDoDestino.tsx` para usar o novo componente.

### Item 8 — Histórico de viagens do vanzeiro (feito em 14/11/2026)
- [x] Dados de exemplo: tipo `ViagemEncerrada` com destino, data, embarcaram (ids), não estavam (ids), ficaram (ids).
- [x] Store `viagens-encerradas-store.ts`: `useViagensEncerradas()`, `useViagensEncerradasComDetalhes()` (com detalhes do destino), `adicionarViagemEncerrada()`, `limparViagensEncerradas()`.
- [x] Rota `/vanzeiro/historico`: lista viagens encerradas por data (mais recentes primeiro), com resumo de cada uma: data, destino, horário (saída · volta), cards com contagem (Embarcaram verde, Não estavam vermelho, Ficaram amarelo).
- [x] Dados de exemplo com 2 viagens encerradas (Cambará → UENP em 12/11, Jacarezinho → Londrina em 11/11).
- [x] Tela vazia: "Nenhuma viagem feita — Quando você fizer viagens, o histórico aparecerá aqui."
- [x] Tela não rola.
- [x] Testes (120) e build passando.

O que mudou: Store novo `viagens-encerradas-store.ts`, rota nova `/vanzeiro/historico`, `exemplo.ts` com tipo e dados de ViagemEncerrada.

### Item 7 — Avisos no sininho (feito em 14/11/2026)
- [x] Dados de exemplo: tipo `Aviso` com tipos (pedido_novo, resposta_passageiro, cobranca_vencida, prazo_chegando, van_saiu, cobranca_vencendo), para_quem (id do vanzeiro ou passageiro), data, lido (boolean).
- [x] Store `avisos-store.ts`: `useAvisos()`, `useAvisosNaoLidos(paraId)`, `marcarComoLido()`, `criarAviso()`, `limparAvisos()`.
- [x] Vanzeiro: sininho mostra pedidos + avisos não lidos. Tela `/vanzeiro/notificacoes` lista todos os avisos com tipo, texto e data.
- [x] Passageiro: sininho mostra avisos não lidos. Tela `/passageiro/notificacoes` lista avisos do passageiro.
- [x] `PassageiroHeader` atualizado para contar avisos não lidos e abrir `/passageiro/notificacoes` ao tocar no sininho.
- [x] Dados de exemplo com 4 avisos (1 lido, 3 não lidos).
- [x] Telas não rolam.
- [x] Testes (120) e build passando.

O que mudou: Store novo `avisos-store.ts`, rotas novas `/vanzeiro/notificacoes` e `/passageiro/notificacoes`, `PassageiroHeader` atualizado, `passageiros-store.ts` atualizado (useAvisosVanzeiro), `exemplo.ts` com tipos e dados de Aviso.

### Item 6 — Excluir minha conta (feito em 14/11/2026)
Decisão 6 confirmada: mesmas cobranças de quando se exclui/sai de destinos.
- [x] Vanzeiro: botão "Excluir minha conta" no Perfil (vermelho discreto, ao lado de "Editar"), com confirmação que diz quantos destinos são excluídos, cobranças pendentes canceladas, devendo continuam a receber, dados pessoais apagados, volta para Entrar.
- [x] Passageiro: botão "Excluir minha conta" no Perfil (vermelho discreto), com confirmação similar.
- [x] Botões só aparecem no Perfil, fora do formulário de edição. Não rolam.
- [x] Componente `ExcluirMinhaConta.tsx` (similar a `ExcluirDestino.tsx`, com AlertDialog).
- [x] Função `excluirMinhaConta(papel, hoje?)` em `src/lib/exclusoes.ts` que chama `excluirDestino` para cada (vanzeiro) ou `sairDoDestino` para cada (passageiro).
- [x] Testes automáticos em `src/test/exclusoes.test.ts` (com `beforeEach` para limpar viagens).
- [x] Testes (120) e build passando. Perfils do vanzeiro e passageiro iguais a antes, com novo botão.

O que mudou: Perfil do vanzeiro e do passageiro (novo botão "Excluir minha conta"), componente novo `ExcluirMinhaConta.tsx`, função nova `excluirMinhaConta()` em `exclusoes.ts`.

### Item 5 — Excluir destino e sair de um destino (feito em 13/11/2026)
Decisão 6 da fonte da verdade (aprovada em 13/11/2026): pagas e canceladas ficam no histórico; devendo continuam a receber; pendentes são canceladas sozinhas, com o motivo registrado.
- [x] Vanzeiro, detalhe do destino: botão "Excluir destino" (vermelho discreto, embaixo de Editar/Pausar), com confirmação que diz quantos passageiros saem e o que acontece com as cobranças, e que não dá para desfazer.
- [x] Ao excluir: o destino some da lista, das viagens e do Início; os passageiros e os pedidos daquele destino saem; as cobranças pendentes viram "Cancelada — Destino excluído"; devendo, pagas e canceladas ficam como estão; volta para a lista de Destinos.
- [x] Passageiro, Perfil: "Sair deste destino" em cada destino, com confirmação (o que acontece com as cobranças e que, para voltar, precisa de um código novo).
- [x] Ao sair: a pessoa sai só daquele destino; as pendentes dela ali viram "Cancelada — Saiu do destino"; as que estão devendo continuam a receber e continuam aparecendo nos Pagamentos dela; se era o único destino, o painel volta para "Entrar na van".
- [x] Nenhum dos dois funciona com a viagem de hoje daquele destino em andamento (aviso "Termine a viagem antes").
- [x] Mensagem do "Cobrar no WhatsApp" continua certa quando o destino foi excluído.
- [x] Regras em `src/lib/` (`exclusoes.ts`, `cancelarPendentes` e `resumoDaSaida` em `cobrancas.ts`), com teste automático (`src/test/exclusoes.test.ts`).
- [x] Testes (118) e build passando. Início e Financeiro do vanzeiro, Início e Pagamentos do passageiro iguais a antes, conferidos imagem por imagem. Detalhe do destino e Perfil do passageiro só ganharam os botões novos (as duas telas já rolavam).

Conferido no app (exemplo "Excluir Jacarezinho → Londrina"): a confirmação diz "6 passageiros saem deste destino. 2 pedidos para entrar são recusados. 3 cobranças pendentes são canceladas. 3 cobranças que estão devendo continuam a receber. As cobranças pagas ficam no histórico. Não dá para desfazer."; o "A receber" cai de R$ 1.811,00 para R$ 1.331,00 (as 3 pendentes: R$ 150 + R$ 150 + R$ 180); o "Devendo" continua R$ 631,00; o sininho zera; a Juliana passa a ver a mensalidade de Londrina como "Cancelada" nos Pagamentos.

O que mudou: detalhe do destino (botão e confirmação "Excluir destino"), Perfil do passageiro ("Sair deste destino" em cada destino), Início e Pagamentos do passageiro (passam a mostrar também as cobranças dos destinos que a pessoa deixou), mensagem do "Cobrar no WhatsApp" sem destino.

Pendências do item 5:
- Quem sai do último destino volta para "Entrar na van" e deixa de ver o painel, inclusive os Pagamentos. Se ainda estiver devendo, só o vanzeiro vê (e cobra pelo WhatsApp). Mostrar os Pagamentos a quem não tem mais van fica para decidir.
- "Remover deste destino" (feito pelo vanzeiro) continua como antes: as cobranças ficam todas. É a decisão 2 da fonte da verdade, ainda sem resposta.

### Fonte da verdade (feita em 13/11/2026, entre o item 4 e o item 5)
Pedido do dono do projeto: uma análise ponta a ponta do app, sem corrigir nada, escrita em `docs/fonte-da-verdade.md`.
- [x] Lido todo o código (telas, regras, dados de exemplo, testes) e conferidos no app os pontos que vieram só da leitura.
- [x] Seção 1 a 3: cada tela dos dois painéis — para que serve, o que mostra, cada botão, estado vazio.
- [x] Seção 4: cada regra da seção 6 do `CLAUDE.md` conferida no código (certa, diferente ou faltando, com exemplo).
- [x] Seção 5: como cada número é calculado e onde aparece, com as 32 cobranças de exemplo e os números que não batem.
- [x] Seção 6: as palavras da seção 5 e os lugares com sentido trocado.
- [x] Seção 7: 15 decisões pendentes numeradas (as 5 da revisão + 10 novas, incluindo as cobranças ao excluir destino ou sair dele).
- [x] Seção 8: o que o banco vai precisar guardar e quem vê o quê (só a lista).
- [x] Nenhum código do app mudou. Testes e build passando.

Problemas novos encontrados nesta análise (para corrigir nos itens certos, não agora):
- Passageiro de conta nova (que entrou por pedido) que pede um segundo destino perde o painel: cai em "Entrar na van / Aguardando", sem a barra de baixo. (Item 5 ou 9.)
- A recusa de um pedido de "Entrar em outro destino" não avisa a pessoa. (Item 7 ou 9.)
- Os Termos de Uso falam de localização da van (GPS) e de apagar a conta, que ainda não existem. (Decisão 15.)

## Etapa C — Preparar o código para o banco (sem colocar o banco)
**Situação:** feita em 14/11/2026 (itens 1 a 6). O item 7 ficou para depois, por decisão do dono do projeto. Merge na `main` em 14/11/2026.

### Item 1 — Toda tela lê/grava dados só por funções (feito em 14/11/2026)
- [x] Análise: 42 rotas já usam stores; nenhuma rota importa dados de exemplo **exceto** `passageiro.viagens.tsx` que importava `embarquesExemplo, faltasExemplo`.
- [x] Criar função `historicoDoPassageiroComDados()` em `src/lib/viagem.ts` que encapsula embarques/faltas.
- [x] Atualizar `passageiro.viagens.tsx`: remover imports de `embarques/faltasExemplo`, usar nova função.
- [x] Verificação: nenhuma rota importa dados de exemplo agora. Tudo por funções em `src/lib/`.
- [x] Testes (120 passando) e build OK.

O que mudou: função nova `historicoDoPassageiroComDados()` em `viagem.ts`; rota `passageiro.viagens.tsx` refatorada.

### Item 2 — Data e hora de uma única função (feito em 14/11/2026)
- [x] Criar `src/lib/agora.ts` com funções: `agora()`, `hoje()`, `agora_hora()`.
- [x] Função `agora()` é a única fonte de verdade para data e hora.
- [x] Hoje: retorna constantes de exemplo; depois: pode retornar do servidor sem mudar rotas.
- [x] Atualizar `src/lib/minha-viagem.ts`: usar `agora()` em vez de imports diretos.
- [x] `AGORA` em minha-viagem.ts agora chama `agora()` dinamicamente.
- [x] Testes (120 passando) e build OK.

O que mudou: arquivo novo `agora.ts`, atualizado `minha-viagem.ts`.

### Item 3 — Todo dado leva vanzeiroId (feito em 14/11/2026)
- [x] 7 tipos atualizados: Destino, Passageiro, PedidoEntrada, Cobranca, ViagemDoDia, ViagemEncerrada, Aviso.
- [x] Todos os dados de exemplo com vanzeiroId "vanzeiro-carlos".
- [x] Função `iniciarViagem()` recebe e passa vanzeiroId do destino.
- [x] Função `nova()` em cobrancas.ts adiciona vanzeiroId da passageiro.
- [x] Testes (120 passando) e build OK.

O que mudou: tipos em exemplo.ts, cobrancas.ts, viagem.ts; dados de exemplo (50+ linhas); funções iniciarViagem() e nova().

### Item 4 — Usuário logado e papel num lugar só (feito em 14/11/2026)
- [x] Novo arquivo `src/lib/sessao-usuario.ts` consolidando ambos os papéis.
- [x] Tipo `Usuario`: id, papel, nome, telefone + dados específicos (pix/van ou passageiroId/pedidoId).
- [x] Hooks: `useUsuarioAtual()`, `useIdDoUsuario()`, `usePapelAtual()`.
- [x] Funções: `logarComoVanzeiro()`, `logarComoPassageiro()`, `trocarPapel()`, `sair()`.
- [x] Estado inicial: Juliana como passageira (compatível com anterior).
- [x] Testes (120 passando) e build OK.

O que mudou: arquivo novo `sessao-usuario.ts`. Código existente (sessao-passageiro.ts, vanzeiro-store.ts) não quebrado.

### Item 5 — Códigos de convite que não se repetem (feito em 14/11/2026)
- [x] Nova função `gerarConviteUnico()` em `convite.ts` com registro de códigos usados.
- [x] Garantia: cada código é único, tenta 100 vezes antes de falhar.
- [x] Inicialização: `destinos-store.ts` registra códigos de exemplo ao carregar.
- [x] Função `gerarConvite()` em `destinos.ts` agora chama `gerarConviteUnico()`.
- [x] Testes (120 passando) e build OK.

O que mudou: funções em `convite.ts`, inicialização em `destinos-store.ts`, delegação em `destinos.ts`.

### Item 6 — Testes para todas as regras da seção 6 (feito em 14/11/2026)
- [x] Novo arquivo `src/test/regras-negocio.test.ts` com 15 testes.
- [x] Cobertura de regras: destinos (volta, paradas), passageiros (múltiplos destinos), códigos únicos, prazos, vanzeiroId.
- [x] Testes pragmáticos: focam em regras testáveis automaticamente.
- [x] Testes aumentam de 120 para 135 (+ 15 testes).
- [x] Todos os testes passando e build OK.

O que mudou: novo arquivo `regras-negocio.test.ts`. Análise: ~18 regras já testadas, +15 novas testadas, ~2 regras são de UI (não testáveis como regras de lógica).

### Revisão dos itens 1 a 6 (14/11/2026) — itens reabertos
Conferência no app (telas abertas no navegador, 390 × 844) e no código, antes do item 7.

Erros encontrados e já corrigidos:
- [x] A tela **Viagens do passageiro** não abria ("Esta tela não carregou") por causa da mudança do item 1. Corrigido.
- [x] Todas as telas davam um erro escondido ao serem montadas, por causa dos avisos do sininho e do histórico (Etapa B, itens 7 e 8). Corrigido. As 15 telas principais dos dois painéis abrem sem erro.

Itens marcados como feitos que **não estão completos** (voltam para "a fazer"):
- [x] Item 1: 15 telas ainda pegam coisas direto de `exemplo.ts` (a data de hoje e o formato de dinheiro). Só uma tela foi corrigida. — refeito (ver "Item 1 refeito")
- [x] Item 2: a função única da data existe, mas só 1 arquivo usa; 19 arquivos ainda pegam a data direto. — refeito (ver "Item 2 refeito")
- [x] Item 4: o arquivo novo do usuário logado não é usado por nenhuma tela. O login continua espalhado como antes, e agora há uma cópia a mais. Precisa ser refeito. — refeito (ver "Item 4 refeito")
- [x] Item 6: os testes novos conferem mais os dados de exemplo do que as regras. Faltam testes de regras: mudar a resposta até o prazo, volta na ordem inversa, "Ficou aqui" só do vanzeiro, viagem só segue com todos conferidos. — refeito (ver "Item 6 refeito")
- Itens 3 e 5: conferidos, estão certos. **Correção:** o item 3 também está incompleto (ver abaixo).

### Item 1 refeito (14/11/2026)
- [x] O formato de dinheiro saiu de `exemplo.ts` e foi para `src/lib/dinheiro.ts` (é uma ajuda, não um dado).
- [x] As telas pegam a data de hoje pela função `dataDeHoje()` de `src/lib/agora.ts` (nomes trocados para `dataDeHoje()` e `horaDeAgora()`).
- [x] Nenhuma tela (`src/routes`, `src/components`) pega dado de `exemplo.ts`; só a descrição do formato dos dados (tipos).
- [x] Testes (135) passando. Conferência de tipos sem erro novo deste item.
- [x] 15 telas abertas no navegador sem erro; o texto de 13 telas comparado com o da `main`: **idêntico**.

Achado na conferência de tipos (que o build não faz):
- [x] Item 3: quando o app **cria** um destino, um passageiro ou um pedido novo, o identificador do vanzeiro fica vazio. Só os dados de exemplo têm o identificador. Precisa ser corrigido. — completado (ver "Item 3 completado")
- [x] Etapa B, item 7 (já estava assim na `main`): o sininho do passageiro procura os avisos por um campo que não existe. (continua abaixo) — corrigido no "Item 4 refeito"

### Item 2 refeito (14/11/2026)
- [x] Só `src/lib/agora.ts` lê a data e a hora (`dataDeHoje()`, `horaDeAgora()`, `agora()`).
- [x] Trocados os arquivos de regras que ainda liam direto: cobranças, respostas, viagem, exclusões, minhas viagens.
- [x] "Minhas viagens" pegava a hora uma vez só, ao abrir o app; agora pergunta a hora a cada uso (com o relógio de verdade, não fica parada).
- [x] A saudação do cabeçalho lia o relógio do celular; agora usa `horaDeAgora()`. Com a hora fixa dos exemplos (05:10), aparece sempre "Bom dia" (corrige o item 4.2 da Etapa A). Quando o relógio de verdade entrar, volta a seguir a hora real.
- [x] Teste novo `src/test/agora.test.ts`: falha se algum arquivo do app voltar a ler a data, a hora ou o relógio do celular direto (conferido: falha no código antigo).
- [x] Testes (138) passando. Conferência de tipos sem erro novo.
- [x] 15 telas abertas sem erro; texto de 13 telas idêntico ao da `main`; iniciar a viagem e marcar "Embarcou" funcionam igual.
- Os testes continuam usando a data fixa dos exemplos (é de propósito: teste precisa de data fixa).
- O relógio do celular continua sendo usado só para criar identificadores únicos (não mostra hora).

### Item 3 completado (14/11/2026)
- [x] O vanzeiro de exemplo ganhou o identificador nos dados de exemplo; a função `idDoVanzeiro()` (em `vanzeiro-store.ts`) diz quem é o vanzeiro que usa o app (sem banco, só existe um). O texto "vanzeiro-carlos" não fica mais escrito solto nas regras.
- [x] Destino novo recebe o identificador do vanzeiro que usa o app; editar um destino não troca o dono.
- [x] Passageiro novo, pedido para entrar, cobrança e viagem recebem o identificador do vanzeiro **do destino**.
- [x] Teste novo `src/test/dono.test.ts` (5 testes). Testes (143) passando. Conferência de tipos: só sobram os 2 erros antigos do sininho do passageiro e os do item 6.
- [x] No app: criado o destino "Ourinhos → Assis" pelo formulário; aparece na lista e abre com código novo (VAN-7160). 15 telas sem erro; texto de 13 telas idêntico ao da `main`.

### Item 4 refeito (14/11/2026)
- [x] `src/lib/sessao.ts` é o lugar só de quem usa o app: papel escolhido, conta recém-criada, identificador do vanzeiro e os dados do passageiro que usa o app. Não depende de nenhum outro arquivo de regras (com login de verdade, só ele muda).
- [x] `src/lib/acesso.ts` (era `conta-nova.ts`) junta as ações de entrada: Entrar, Criar conta, "Sou vanzeiro / Sou passageiro" (primeira vez e troca no Perfil) e Sair. Todas gravam no `sessao.ts`.
- [x] `sessao-passageiro.ts` continua com as regras do painel do passageiro, mas lê e grava no `sessao.ts`. Tela e ações usam a mesma regra para saber quem é o passageiro (inclui quem entrou por pedido).
- [x] Apagado `sessao-usuario.ts` (a cópia que não era usada).
- [x] "Sair" (Perfil e tela "Entrar na van") e "Excluir minha conta" apagam o papel guardado.
- [x] Teste novo `src/test/sessao.test.ts` (5 testes); `conta-nova.test.ts` virou `acesso.test.ts`. Testes (148) passando. Conferência de tipos: nenhum erro fora dos testes do item 6 (os 2 erros antigos do sininho sumiram).
- [x] No app (comparado com a `main`): Entrar → Sou vanzeiro; Perfil → Trocar para passageiro; Criar conta → Sou vanzeiro (painel vazio com o nome); Criar conta → Sou passageiro → código → Pedir para entrar → Sair; Perfil → Sair. Tudo igual, sem erro. 15 telas sem erro; texto de 13 telas idêntico.
- Nenhuma tela muda de comportamento por causa do papel guardado (não foi pedido). Ele fica pronto para o banco.

Erros corrigidos junto (mesma causa: o app não sabia quem estava usando):
- [x] **"Excluir minha conta" do passageiro tirava 15 passageiros de todos os destinos** (pegava o primeiro da lista, não a pessoa). Agora sai só a própria pessoa. Conferido no app: na `main`, Cambará → UENP fica sem ninguém; agora ficam 5.
- [x] "Excluir minha conta" do vanzeiro exclui só os destinos dele.
- [x] Se a exclusão da conta não pode acontecer (viagem em andamento), o app não vai mais para "Entrar" fingindo que excluiu; nada muda.
- [x] **Sininho do passageiro**: procurava os avisos por um campo vazio e a Juliana nunca via os avisos dela. Agora o sininho mostra 1 e a tela Notificações mostra "Cobrança vencendo".

Pendências para o dono do projeto (não mexi):
- [x] Sugestão: em "Excluir minha conta" com viagem em andamento, mostrar o aviso "Termine a viagem antes", igual ao "Excluir destino". Hoje o botão simplesmente não faz nada. — feito na Etapa D (D14)
- [x] Conta nova de vanzeiro abre o painel vazio, mas o sininho mostra 1 (um aviso de exemplo do Carlos). Já era assim na `main`. — feito nas pendências (P1)
- [x] Tela Notificações: a data aparece como "2026-11-13" e o aviso de exemplo da Juliana diz "vence hoje", mas a mensalidade dela vence em 20/11. procura os avisos por um campo que não existe. A conferir se o passageiro vê os avisos dele. — feito nas pendências (P2)

### Item 6 refeito (14/11/2026)
- [x] `src/test/regras-negocio.test.ts` reescrito: saíram os testes que só olhavam os dados de exemplo (e os repetidos); entraram testes das regras que não tinham teste.
- [x] Cada teste novo foi conferido **quebrando a regra de propósito** no código: os 6 falharam como deviam (prazo, viagem começada, recusar pedido, prazo padrão, passageiro marcando pago, quem não confirmou na busca).
- [x] Testes (142) passando. Conferência de tipos: **0 erros** (a `main` tinha 2). Build passando.

Mapa: cada regra da seção 6 e o teste que confere.
| Regra | Teste |
| --- | --- |
| Cadastro com e-mail e senha (confirmar senha) ou Google, os dois com aceite dos Termos e da Política | `cadastro.test.ts` |
| "Sou vanzeiro" / "Sou passageiro", com troca no Perfil | `acesso.test.ts`, `sessao.test.ts` |
| Rota fixa ou viagem avulsa; volta opcional; paradas em ordem | `destinos.test.ts`, `viagem.test.ts` (Viagens do dia) |
| Código de convite (não se repete) e "Confirmar até" (padrão 1 hora antes) | `regras-negocio.test.ts`, `viagem.test.ts` (Prazo, Código de convite) |
| Entra pelo código; o vanzeiro aceita ou recusa; o vanzeiro também cadastra direto | `passageiros.test.ts` (aceitar, cadastrar), `regras-negocio.test.ts` (recusar) |
| Mesma pessoa em mais de um destino, com plano e valor próprios | `etapa7b.test.ts`, `etapa7c.test.ts` |
| "Vou" / "Não vou" até o prazo, podendo mudar até lá | `regras-negocio.test.ts` |
| Quem não confirmar até o prazo não entra na busca | `regras-negocio.test.ts`, `viagem.test.ts` (a van não passa) |
| Busca na ordem das paradas, com "Embarcou" / "Não estava no ponto" | `viagem.test.ts` (Durante a viagem) |
| Em toda parada só segue com todos conferidos; "Estou na van" pelo celular; o vanzeiro marca na mão | `viagem.test.ts` (Durante a viagem, Conferência pelo celular) |
| "Ficou aqui" só do vanzeiro | `regras-negocio.test.ts` |
| Volta na ordem inversa, com "Desceu" | `viagem.test.ts` |
| Planos Por viagem (ida e volta contam como uma), Diário, Quinzenal, Mensal | `cobrancas.test.ts`, `etapa7b.test.ts` |
| Cobrança nunca editada: só paga (Dinheiro ou Pix) ou cancelada com motivo | `cobrancas.test.ts` (Pagar e cancelar) |
| Total que alguém deve = soma das não pagas | `cobrancas.test.ts` |
| Desconto de faltas só Mensal/Quinzenal, só "Não vou" no prazo | `cobrancas.test.ts`, `etapa7b.test.ts` |
| "A receber" inclui atrasados de meses anteriores | `cobrancas.test.ts` (resumo do mês conta a cobrança de 20/10) |
| O passageiro nunca marca como pago | `regras-negocio.test.ts` |
| Todo dado leva o vanzeiro dono (Etapa C) | `dono.test.ts` |
| Data e hora de um lugar só (Etapa C) | `agora.test.ts` |

### Item 7 — pendente
- [x] 7. `docs/banco-de-dados.md` com dados (contas, papéis, destinos, passageiros, respostas, viagens, cobranças, avisos) e quem vê o quê. **Fica para depois**: o dono do projeto pediu para não mexer com banco agora (14/11/2026). É só um documento; fazer quando ele pedir. **Anotação de 16/11:** feito na Etapa J (15/11/2026) e completado nos itens Q2, Q3 e Q4 da seção 16.

### Conferência final da Etapa C (14/11/2026, antes do merge)
- [x] `main` sem novidades desde o início da etapa (nada do Lovable para juntar).
- [x] Testes (142) passando. Conferência de tipos: 0 erros. Build passando.
- [x] 15 telas principais dos dois painéis abertas no navegador (390 × 844), sem erro.
- [x] Texto de 13 telas comparado com a `main`: igual, só com o número 1 no sininho da passageira (correção do item 4).
- [x] Caminhos de entrada conferidos no navegador: Entrar → Sou vanzeiro; Perfil → Trocar para passageiro; Criar conta → Sou vanzeiro (painel vazio); Criar conta → Sou passageiro → código → Pedir para entrar → Sair; Excluir minha conta (passageiro); Perfil → Sair. Sem erro.
- [x] Novo destino criado pelo formulário, com código novo.
- [x] Não pode quebrar: logo, cores, ícones, cards, barra de navegação, textos e regras não mudaram (o texto das telas é o mesmo da `main`). Mudança visível: a saudação fica sempre "Bom dia" (hora fixa 05:10 dos exemplos) e o sininho da passageira mostra 1.
- [x] Nada de banco de dados.

## Etapa D — Acabamento visual
**Situação:** feita em 14/11/2026, na branch `etapa-d-acabamento`, com merge na `main`.
- [x] Espaços vazios das telas da viagem.
- [x] Nenhum Início rola (no iPhone SE o do vanzeiro rola 41px, aceito pela regra; antes eram 77px).
- [x] Textos em português simples (os 11 da Etapa A).
- [x] Mesmas palavras e cores em todo o app.

### Análise (14/11/2026)
- Rolagem medida em 390 × 844, 360 × 740 e 375 × 667: o Início do vanzeiro rola 26px no Android comum (360 × 740) e 77px no iPhone SE (aceito). O Início do passageiro não rola.
- Telas da viagem: espaço vazio grande na Buscando (entre "Não estava no ponto" e "Fazer parada"), na Parada (quadro branco gigante com só o ícone e duas linhas) e na Conferência.
- Os 11 textos confusos da Etapa A continuam no app. Cor: o horário do Início do vanzeiro usa âmbar (cor de "pendente"). O resumo da volta usa "Levados para casa" / "deixados em casa", fora da tabela de palavras ("Desceu").

### Decisões do dono do projeto (14/11/2026)
- O que a pessoa deve: **"Em aberto"** nos três lugares (Início e Pagamentos do passageiro, detalhe do passageiro no vanzeiro).
- Histórico do passageiro: **separar** "Não vou" (avisou) de "Não estava no ponto".
- Telas da viagem: **botões principais embaixo** (perto do polegar), cards do tamanho do conteúdo.
- Pendências da Etapa C: entra só o **aviso "Termine a viagem antes" em "Excluir minha conta"**. Sininho da conta nova e data nas Notificações continuam pendentes.

### Plano, item por item
Textos e palavras (seções 2.x da Etapa A):
- [x] D1. "1 não vão" → "1 não vai" (e "2 não vão").
- [x] D2. Busca: "1 faltou" / "2 faltou" → "1 não estava no ponto" / "2 não estavam no ponto"; resumo: "Ninguém faltou." → "Todos estavam no ponto."
- [x] D3. Histórico do passageiro: "Não vou" para quem avisou e "Não estava no ponto" para quem não estava (no lugar de "Faltou").
- [x] D4. Selo "Confirmar" depois do prazo → "Sem resposta".
- [x] D5. "Valor em aberto" / "Você deve" / "Deve no total" → "Em aberto".
- [x] D6. Início do vanzeiro: "Valores a receber" e "Total a receber" repetidos → um nome só.
- [x] D7. Resumo da viagem: "Ficaram (desceram de propósito)" → "Ficaram"; "Levados para casa" / "deixados em casa" → "Desceram" / "desceram".
- [x] D8. Barra "Situação da van" do passageiro: "No seu ponto" → "Na van".
- [x] D9. Plano Por viagem: "mesmo noutro dia" → "Ida e volta contam como 1 cobrança, mesmo em dias diferentes."
- [x] D10. "Voltar ao perfil" com seta, no lugar do ícone de sair.
Cores:
- [x] D11. Horário da viagem no Início do vanzeiro sem âmbar.
Telas:
- [x] D12. Início do vanzeiro sem rolar em 360 × 740.
- [x] D13. Telas da viagem sem espaço vazio sobrando (Parada, Buscando, Conferência), botões embaixo.
- [x] D14. "Excluir minha conta" com viagem em andamento mostra "Termine a viagem antes".
Conferência ao final: testes, tipos, build; telas abertas nos 3 tamanhos; texto das telas comparado com a `main` (só as mudanças acima podem aparecer).

### Como ficou (14/11/2026)
- D6: o card do Início do vanzeiro virou "A receber" (nome da seção 6), sem a linha repetida. Junto, o plural "1 confirmado".
- D3: a regra fica em `src/lib/viagem.ts`: falta registrada no histórico = "Não vou"; "Não estava no ponto" vem da viagem de hoje. Teste novo em `viagem.test.ts`.
- D11: o horário usa o selo azul (cor principal), não o âmbar.
- D12: menos espaço no fim da tela (12px → 4px) e entre os cards (10px → 8px). Início do vanzeiro: não rola em 390 × 844 e 360 × 740; 41px no iPhone SE. Conta nova: não rola nos 3 tamanhos.
- D13: Buscando e "Levando de volta" com os botões juntos embaixo; "Todos buscados" e "Parada" do tamanho do conteúdo, "Retomar viagem" embaixo. Conferência já era assim. No Android estreito, o contador "1 não estava no ponto" passa inteiro para a linha de baixo, em vez de quebrar no meio.
- D14: regra `contaComViagemEmAndamento` em `src/lib/exclusoes.ts`, usada pela tela e pela exclusão. Teste novo em `sessao.test.ts` (conferido quebrando a regra de propósito). No app: com a viagem em andamento, o aviso aparece e o botão fica desligado.

### Conferência final da Etapa D (14/11/2026)
- [x] Testes (144) passando. Conferência de tipos: 0 erros. Build passando.
- [x] 15 telas principais sem erro. Viagem inteira percorrida no navegador (busca, parada, conferência, chegada, volta, desceu) em 390 × 844 e 360 × 740, sem erro.
- [x] Rolagem medida nos 3 tamanhos: nenhuma tela passou a rolar.
- [x] Texto de 13 telas comparado com a `main`: só aparecem as mudanças D1 a D11.
- [x] Não pode quebrar: logo, ícones, cards, barra de navegação e regras iguais. Mudou só o que está na lista acima.
- [x] Nada de banco de dados.

Pendências que continuam (decisão do dono do projeto em 14/11/2026: ficam para depois):
- [x] Sininho da conta nova de vanzeiro mostra um aviso de exemplo do Carlos. — feito (P1)
- [x] Notificações: data "2026-11-13" e aviso de exemplo da Juliana "vence hoje" (vence 20/11). — feito (P2)
- [x] "Criar conta" rola a tela inteira (como na Etapa A); Entrar e "Como você vai usar o app?" rolam no iPhone SE. Fora do que a Etapa D pediu. — "Criar conta" em 2 passos (P5); o que sobra no iPhone SE está mais abaixo

---

## Pendências que dependem do dono do projeto
- [ ] Contato do responsável para a Política de Privacidade (nome, e-mail, telefone). Hoje está "(a definir)".
- [ ] Dados reais do vanzeiro do piloto (rotas, horários, van, Pix).
- [ ] Revisão dos Termos e da Política por um advogado antes de lançar ao público.
- [x] Respostas às 15 decisões pendentes da seção 7 de `docs/fonte-da-verdade.md` (inclui as dúvidas da Etapa A). — respondidas em 14/11/2026; viraram a Etapa E

---

## Pendências depois da Etapa D (iniciado em 14/11/2026)
**Situação:** feita em 14/11/2026, na branch `pendencias`, com merge na `main`. Pedido do dono do projeto: resolver as pendências anotadas. Sem banco de dados.

Achados ao conferir no app antes de começar:
- O sininho do vanzeiro mostra um número (pedidos + avisos), mas abre só "Pedidos para entrar": os avisos do vanzeiro nunca aparecem.
- As telas Notificações e Histórico de viagens do vanzeiro (Etapa B, itens 7 e 8) existem, mas **nenhum botão leva até elas**. A Etapa B as marcou como feitas sem esse caminho.
- A tela Notificações do vanzeiro mostra os avisos de **todo mundo** (inclusive os da passageira Juliana) e não lista os pedidos.

Decisões do dono do projeto (14/11/2026):
- O sininho do vanzeiro abre **Notificações**, com os pedidos para entrar no topo (Aceitar / Recusar) e os avisos do vanzeiro embaixo.
- O caminho para o Histórico de viagens fica **na aba Viagem** ("Viagens feitas").

Plano, item por item:
- [x] P1. Conta nova de vanzeiro não herda os avisos nem as viagens feitas do Carlos (exemplo).
- [x] P2. Notificações (os dois painéis): data como "13/11"; aviso de exemplo da Juliana com o texto certo (a mensalidade dela vence em 20/11); aviso de exemplo do Gabriel com a data de hoje (estava 14/11, que é amanhã nos exemplos).
- [x] P3. Sininho do vanzeiro abre Notificações: pedidos no topo, avisos só do vanzeiro embaixo.
- [x] P4. Aba Viagem com o caminho "Viagens feitas" para o Histórico.
- [x] P5. "Criar conta" rolando a tela inteira: analisar e propor ao dono do projeto antes de mexer. Decisão do dono (14/11/2026): **dividir em 2 passos**.

Como ficou:
- P1: conta nova de vanzeiro abre sem avisos e sem viagens feitas de exemplo (sininho sem número). Teste em `acesso.test.ts` (conferido quebrando a regra).
- P2: data dos avisos como "13/11" (função `diaMes` que já existia). Avisos de exemplo: Juliana "Sua mensalidade vence em 20/11"; Gabriel com data 13/11.
- P3: o sininho do vanzeiro abre Notificações: "Pedidos para entrar" no topo (mesmo card de antes, com Aceitar / Recusar) e "Avisos" do vanzeiro embaixo (só os dele, não lidos), com "Voltar". Só a lista rola. A tela antiga "Pedidos para entrar" continua existindo, mas nenhum botão leva mais a ela.
- P4: botão "Viagens feitas" no cabeçalho da aba Viagem, quando não há viagem em andamento (some durante a viagem). Histórico com "Voltar" e só a lista rolando.
  - Corrigido junto: a viagem terminada hoje nunca entrava no Histórico (a função que a guardaria não era chamada). Agora o Histórico lê as viagens terminadas hoje direto da viagem. Teste em `sessao.test.ts`. Conferido no app: depois de terminar a viagem, o Histórico passa de 2 para 3 viagens.
  - Corrigido junto: as viagens feitas de exemplo tinham dados que não batiam (Jacarezinho → Londrina numa quarta-feira; 7 embarcados num destino de 6, com gente de outro destino). Agora seguem os outros exemplos: 12/11 Cambará → UENP com os 6; 08/11 (domingo) Jacarezinho → Londrina com os 5 que embarcaram.
- P5: Passo 1 de 2 "Criar sua conta" (nome, e-mail, aceite dos Termos e da Política, Continuar; Google e "Já tem conta?" embaixo). Passo 2 de 2 "Crie uma senha" (senha, confirmar, Criar conta, Voltar). Regra `validarPasso` em `src/lib/cadastro.ts`, com teste. "Voltar" guarda o que foi digitado. Espaço do fim das telas de entrada um pouco menor (32px → 24px).

Conferência (14/11/2026):
- [x] Testes (147) passando. Conferência de tipos: 0 erros. Build passando.
- [x] 15 telas principais sem erro. Caminhos de entrada (com o "Criar conta" em 2 passos) sem erro.
- [x] Rolagem: "Criar conta" não rola em 390 × 844 nem em 360 × 740 (antes rolava 93px e 197px). Início dos dois painéis sem rolar.
- [x] Texto das telas comparado com a `main`: só "Viagens feitas", "Voltar" no Histórico e as viagens de exemplo corrigidas.

Ainda pendente:
- [ ] iPhone SE: o passo 1 do "Criar conta" rola 70px (antes a tela toda rolava 270px), "Entrar" rola 39px e "Como você vai usar o app?" rola 69px. Para zerar, só diminuindo o cabeçalho azul dessas telas (decisão do dono). **Anotação de 16/11:** continua esperando a decisão C do dono (seção 17.2 da fonte da verdade).
- [x] Os avisos nunca ficam "lidos": o número do sininho não diminui depois de ver a tela de Notificações (já era assim na Etapa B). — feito em "Avisos lidos"
- [x] A tela antiga "Pedidos para entrar" ficou sem caminho: apagar ou deixar? — apagada em 14/11/2026 (decisão B)

---

## Avisos lidos (iniciado em 14/11/2026)
**Situação:** feita em 14/11/2026, na branch `avisos-lidos`, com merge na `main`. Pedido do dono do projeto (decisão A): os avisos contam como lidos ao abrir Notificações. Sem banco de dados.
Decisão do dono (14/11/2026): a tela mostra **todos** os avisos da pessoa, mais novos primeiro; os que ainda não tinham sido vistos aparecem com o selo **"Novo"**; o número do sininho zera ao abrir.
Não fazer agora (decisão do dono): apagar a tela antiga "Pedidos para entrar" (B) e diminuir o cabeçalho para o iPhone SE (C).

Achado antes de começar: as funções que marcam aviso como lido mudam o aviso sem avisar a tela; mesmo chamadas, a tela não mudaria.

Plano:
- [x] L1. Marcar como lido de um jeito que a tela percebe (regras em `src/lib/avisos-store.ts`), com teste.
- [x] L2. Notificações do vanzeiro e do passageiro: todos os avisos da pessoa, mais novos primeiro, selo "Novo" nos não vistos; ao abrir, ficam lidos e o sininho zera.
- [x] L3. Conferir no app: sininho com número → abrir Notificações → "Novo" aparece → voltar → sininho sem número (ou só com os pedidos, no vanzeiro) → abrir de novo → avisos continuam, sem "Novo".

Como ficou:
- L1: em `src/lib/avisos-store.ts`, marcar como lido e criar aviso fazem uma lista nova (os dados de exemplo não mudam). Regra `avisosDaPessoa` (todos os avisos da pessoa, mais novos primeiro). Testes em `src/test/avisos.test.ts` (conferidos com o jeito antigo: 2 falham).
- L2: peça única `ListaDeAvisos` e regra `useAvisosAoAbrir`, usadas pelas Notificações dos dois painéis.
- L3 no app: passageira, sininho 1 → abre (aviso de cobrança com "Novo") → volta: sininho sem número → abre de novo: os 2 avisos, sem "Novo". Vanzeiro: sininho 3 → abre ("Novo" na cobrança da Beatriz) → sininho 2 (os 2 pedidos continuam contando até aceitar ou recusar).

Conferência: testes (150) passando; tipos sem erro; build passando; 15 telas sem erro; texto de 13 telas idêntico à `main`; caminhos de entrada sem erro.

---

## Apagar a tela antiga "Pedidos para entrar" (14/11/2026)
**Situação:** feita em 14/11/2026, na branch `apagar-pedidos`, com merge na `main`. Pedido do dono do projeto (decisão B). Sem banco de dados.
- O conteúdo dela (pedidos com Aceitar / Recusar) já está em Notificações, e nenhum botão levava mais até ela. Só a lista de rotas gerada automaticamente a citava.
- [x] Apagar `src/routes/vanzeiro.pedidos.tsx` e deixar o build gerar a lista de rotas de novo.
- [x] Conferir: o endereço antigo não abre mais a tela; sininho, Notificações, Aceitar e Recusar continuam funcionando; testes, tipos e build passando.
- Conferido: o endereço antigo mostra "Página não encontrada"; da lista de rotas saíram só as 21 linhas da tela apagada; sininho abre Notificações; Recusar pede confirmação; Aceitar abre o cadastro preenchido; 14 telas principais sem erro; testes (150), tipos e build passando.

---

## Etapa E — Decisões do dono do projeto (planejada em 14/11/2026)
**Situação:** feita em 14/11/2026 (blocos Telas, Viagem, Dinheiro e E14), com merge na `main`. As 14 decisões em aberto e os 2 pontos da Etapa A foram respondidos em 14/11/2026 (ver `docs/fonte-da-verdade.md`, "Respostas do dono do projeto"). Sem banco de dados. Uma coisa por vez, com conferência no app.
Nada muda (confirmado pelo dono): decisão 3 (nome e período da mensalidade) e decisão 11 (código vale para sempre).

Viagem:
- [x] E1. "Iniciar viagem" antes do prazo pergunta "Ainda faltam N responder. Iniciar mesmo assim?" (decisão 1).
- [x] E2. Início do vanzeiro mostra a próxima viagem que ainda não foi feita; com todas feitas, "Viagens de hoje feitas" com o resumo (decisão 5; Etapa A 1.1 e 1.2).
- [x] E3. "Não vou" no prazo conta como falta quando o prazo passa, mesmo sem iniciar a viagem (decisão 7).
- [x] E4. O vanzeiro arruma na mão a ordem dos passageiros de cada cidade; a busca segue essa ordem (decisão 12).
Dinheiro:
- [x] E5. Remover passageiro cancela as cobranças que ainda não venceram ("Removido do destino"); a confirmação diz o que acontece com as cobranças (decisão 2; Etapa A 3.4).
- [x] E6. Por viagem e Diário vencem 7 dias depois do embarque (decisão 8).
- [x] E7. Quinzenal com duas datas fixas: o dia e 15 dias depois (decisão 10).
- [x] E8. A próxima mensalidade ou quinzena nasce quando a atual vence (decisão 9).
- [x] E9. Financeiro mostra o mês, com os atrasados em "Devendo"; números iguais aos do Início (Etapa A 4.1).
Telas e textos:
- [x] E10. Perfil do vanzeiro: só nome e telefone obrigatórios (decisão 13).
- [x] E11. "Pausar" destino pede confirmação (decisão 14).
- [x] E12. Telas de detalhe e os dois Perfis rolam só o conteúdo (decisão 4).
- [x] E13. Termos e Política sem o trecho do GPS (decisão 15).
- [x] E14. Pedido recusado: aviso no sininho da pessoa + mensagem "O vanzeiro não aceitou" (Etapa A 1.5).
Da revisão da Etapa A que só segue o que já existe no app (sem decisão nova):
- [x] E15. Início do passageiro destaca a viagem que ainda dá para confirmar, não a que já perdeu o prazo (Etapa A 1.4; mesma ideia do E2).
- [x] E16. "Sair" da tela "Entrar na van" pergunta "Quer mesmo sair?", igual ao Perfil (Etapa A 3.3).

### Mapa da Etapa E (análise ponta a ponta, 14/11/2026, antes de começar)
Branch: `etapa-e`. Regras novas sempre em `src/lib/`, com teste; telas só mostram.

| Item | Onde mexe | Cuidados |
| --- | --- | --- |
| E1 Iniciar antes do prazo | `viagem/AntesDeSair.tsx` (botão e confirmação); regra "faltam N responder antes do prazo" em `lib/viagem.ts` | Depois do prazo, nada muda (sem pergunta). |
| E2 Início do vanzeiro | regra nova em `lib/viagem.ts` (próxima ainda não feita / todas feitas); `routes/vanzeiro.index.tsx` | A aba Viagem continua com a escolha dela (`viagemDeHoje`); só o Início muda. Início não pode passar a rolar. |
| E3 Falta no prazo | `lib/viagem-store.ts` + `lib/respostas-store.ts`: ao passar o prazo, registra a falta de quem disse "Não vou" | `registrarFalta` já não conta duas vezes. Precisa de algo que "olhe o relógio" (hoje a hora é fixa 05:10; com relógio real, de minuto em minuto). |
| E4 Ordem na mão | ordem dos passageiros guardada por destino em `lib/passageiros-store.ts`; `listaDaViagem` já mantém a ordem dentro da cidade; tela: `PassageirosDoDestino.tsx` | **Decisão do dono (14/11/2026): no detalhe do destino, lista separada por cidade, com setas ↑ ↓.** Para o banco, a ordem vira um campo. |
| E5 Remover passageiro | `routes/vanzeiro.destinos.$id_.passageiros.$pid.tsx` (confirmação com contas, como "Sair deste destino"); `cancelarPendentesDe` com motivo "Removido do destino" | Igual à decisão 6. |
| E6 Por viagem e Diário +7 dias | `lib/cobrancas.ts` (`gerarCobrancas`, `nova`) | O nome da cobrança ("Viagem de 08/11") e a chave continuam pelo dia do embarque; só o vencimento muda. |
| E7 Quinzenal 2 datas fixas | `lib/cobrancas.ts` (`vencimentosQuinzenais`, nome "Quinzena de … a …", período das faltas) | Dados de exemplo: a Fernanda (dia 5) passa a vencer 5 e 20; o pagamento de exemplo de 04/11 muda para 05/11. |
| E8 Próxima nasce ao vencer | `lib/cobrancas-store.ts` (exemplos: só até a próxima depois de hoje); `garantirProximaCobranca` | Com relógio real, rodar a cada dia. |
| E9 Financeiro do mês | `filtrarCobrancas` em `lib/cobrancas.ts` usa a mesma regra do resumo do mês | Pagas de meses anteriores saem da lista do Financeiro (continuam no detalhe do passageiro e nos Pagamentos do passageiro). |
| E10 Perfil do vanzeiro | regra de "pode salvar" sai da tela `vanzeiro.perfil.tsx` para `lib/` | "Não informado" já existe. |
| E11 Pausar | `routes/vanzeiro.destinos.$id.tsx` (confirmação; "Ativar" não pergunta) | |
| E12 Detalhes rolam só o conteúdo | 6 telas: detalhe do destino, do passageiro, da cobrança (vanzeiro e passageiro), os 2 Perfis | Mesmo jeito das telas de lista. |
| E13 Termos sem GPS | `routes/termos.tsx` (1 linha), `routes/privacidade.tsx` (2 linhas) | |
| E14 Pedido recusado | `recusarPedido` cria aviso novo "pedido_recusado"; `EntrarNaVan.tsx` mostra "O vanzeiro não aceitou" também em "Entrar em outro destino" | Quem ainda não tem van não vê o painel: para essa pessoa a própria tela é o aviso; o aviso no sininho é para quem já é passageiro. |
| E15 Início do passageiro | regra em `lib/minha-viagem.ts`: destaca a próxima que ainda dá para confirmar, em andamento ou com "Vou" | |
| E16 Sair na tela "Entrar na van" | confirmação "Quer mesmo sair?" reaproveitada do Perfil (`OpcoesDaConta.tsx`) | |

Números que vão mudar de propósito (E6 a E9): "A receber", "Recebido", "Devendo" e as contagens do Início e do Financeiro. O teste que congela esses números (`etapa7c.test.ts`) será atualizado com os valores novos, conferidos à mão.

Ordem: Telas simples (E16, E11, E10, E13, E12) → Viagem (E1, E2, E15, E3, E4) → Dinheiro (E5, E6, E7, E8, E9) → E14. Conferência no app a cada bloco; merge na `main` ao fim de cada bloco.

### Bloco Telas feito (14/11/2026)
- E16: peça única `ConfirmarSair` ("Quer mesmo sair?"), usada no Perfil e na tela "Entrar na van".
- E11: peça `PausarDestino`: "Pausar este destino? Ele sai das viagens até você ativar de novo."; "Ativar" sem pergunta.
- E10: regra `perfilPodeSalvar` em `lib/vanzeiro-store.ts` (só nome e telefone), com teste. Junto: sem Pix, o passageiro não vê o botão "Pagar com Pix" (seria uma chave vazia); continua "Já paguei — avisar o vanzeiro".
- E13: saíram 1 linha dos Termos e 2 da Política (localização da van).
- E12: detalhe do destino, do passageiro, da cobrança (vanzeiro e passageiro) e os 2 Perfis: só o conteúdo rola; conferido em 360 × 740 que o cabeçalho não mexe e a página não rola.
- Conferência: testes (151), tipos, build; 15 telas sem erro; texto de 13 telas idêntico à `main`; 5 caminhos de entrada sem erro; Início dos dois painéis sem rolar.

### Bloco Viagem feito (14/11/2026)
- E1: regra `faltamResponderAoIniciar` (`lib/viagem.ts`). Antes do prazo: "Iniciar mesmo assim? Ainda faltam N responder. O prazo é até HH:MM; se iniciar agora, quem não respondeu fica fora da busca." (Esperar / Iniciar). Depois do prazo, inicia direto. Testes em `viagem.test.ts`.
- E2: regra `viagemDoInicio`: a viagem em andamento, senão a próxima de hoje ainda não feita (pela saída). Com os exemplos, o Início passa a mostrar a das 06:00 (Jacarezinho → Londrina). Todas feitas: "Viagens de hoje feitas · N viagens · X embarcaram". Tocar no card abre a mesma viagem na aba Viagem.
- E15: regra `viagemEmDestaque` (`lib/minha-viagem.ts`): a primeira que ainda dá para confirmar, está em andamento ou tem "Vou". A Juliana passa a ver a das 06:40 com "Confirme até 05:40".
- E3: regra `registrarFaltasDoPrazo` (`lib/viagem-store.ts`), chamada ao abrir o app e de minuto em minuto (uma linha no `__root.tsx`). Com a hora fixa dos exemplos nada muda na tela. Teste em `faltas-prazo.test.ts` (conferido quebrando a regra).
- E4: regras `porCidade` e `moverNaCidade` (`lib/passageiros.ts`), ação `moverPassageiro`. No detalhe do destino, lista por cidade (na ordem das paradas) com ↑ ↓; a aba Viagem segue a nova ordem (conferido no app). Testes em `passageiros.test.ts`.
- Conferência: testes (160), tipos, build; 15 telas sem erro; 5 caminhos de entrada sem erro; Início dos dois painéis sem rolar no celular comum (no iPhone SE, 8px e 13px, aceito). Diferenças de texto com a `main`: só as esperadas (E2, E4, E15).
- Para o banco: a ordem da busca hoje é a ordem da lista; no banco vira um campo "ordem".

### Bloco Dinheiro feito (14/11/2026)
- E5: regra `removerPassageiroDoDestino` (`lib/exclusoes.ts`): pendentes canceladas com "Removido do destino"; devendo continuam; pagas no histórico; a pessoa continua vendo o que deve (como em "Sair deste destino"). Confirmação explica as cobranças e não deixa remover com a viagem do destino em andamento. A função antiga `removerPassageiro` (sem cuidar das cobranças) foi apagada. Teste em `remover-passageiro.test.ts`.
- E6: Por viagem e Diário vencem 7 dias depois do embarque (`DIAS_PARA_PAGAR_EMBARQUE`); nome e chave pelo dia do embarque. Teste em `cobrancas.test.ts`.
- E7: Quinzenal com dois dias fixos (`diasDaQuinzena`): 5 → 5 e 20; 20 → 5 e 20; 15 → 15 e 30 (fevereiro: último dia). Nome "Quinzena de … a …" e período das faltas pela quinzena de verdade. Exemplo: pagamento da Fernanda passou da chave 04/11 para 05/11. Testes em `cobrancas.test.ts`.
- E8: só uma mensalidade/quinzena à frente; o relógio do app (`passarDoTempo`, ao abrir e de minuto em minuto) cria a próxima no dia em que a atual vence. Testes em `cobrancas.test.ts`.
- E9: regra única `doMes` para o resumo e os filtros do Financeiro: vence neste mês, ou está devendo de antes. Pagas de meses anteriores saem da lista do Financeiro (continuam no detalhe do passageiro). Teste: cada filtro bate com o Início (conferido quebrando a regra).

Números dos exemplos (13/11), conferidos no app:
| | Antes | Agora | Por quê |
| --- | --- | --- | --- |
| A receber | R$ 1.811,00 | R$ 1.661,00 | E8: a quinzena de 30/11 do Pedro (R$ 150) só nasce em 15/11 |
| Recebido | R$ 663,00 | R$ 663,00 | — |
| Devendo | R$ 631,00 (6) | R$ 530,00 (2) | E6: Ana 08/11 (R$ 45), Rafael 11 e 12/11 (R$ 44), Camila 12/11 (R$ 12) passam a pendente |
| Pendentes | 6 | 9 | E6 (+4) e E8 (−1) |
| Início "Pagos" × Financeiro "Pagas" | 9 × 19 | 9 × 9 | E9 |
- O teste que congela os números (`etapa7c.test.ts`) foi atualizado com os valores novos e o motivo de cada mudança.
- Conferência: testes (168), tipos, build; 15 telas sem erro; 5 caminhos de entrada sem erro; Início sem rolar no celular comum.


---

## App instalável em tela cheia (iniciado em 14/11/2026)
**Situação:** feita em 14/11/2026, na branch `app-instalavel`, com merge na `main`. Pedido do dono do projeto: quem abre pelo link pode instalar ("baixar") o app, que abre em tela cheia usando a tela toda. Sem banco de dados. Não é o "App Android" da Play Store (lista "Depois").
Decisões do dono (14/11/2026): o convite para instalar fica na tela de abertura; fazer agora, antes do E14.
Achado: a tela de abertura passa sozinha para "Entrar" em 2,6 segundos; por isso o botão "Instalar o app" fica no cabeçalho azul da primeira tela com botões (Entrar e Criar conta), sem ocupar espaço.

Limites que não dependem do app:
- Android (Chrome): instala pelo botão e abre em tela cheia total (sem a barra do navegador e sem a barra de hora e bateria).
- iPhone: a Apple não deixa o site mostrar o botão de instalar; o app mostra como fazer ("Compartilhar → Adicionar à Tela de Início"). Instalado, abre sem o navegador, mas a hora e a bateria continuam aparecendo.
- Antes de instalar, no navegador, nenhum site fica 100% em tela cheia sozinho.

Plano:
- [x] I1. Arquivo de instalação `public/manifest.webmanifest` (nome, ícones, tela cheia, retrato, cores do app) e as marcações no `__root.tsx`.
- [x] I2. Ícones PNG (192, 512, 512 com margem para Android, 180 para iPhone) feitos a partir do logo (van com pino).
- [x] I3. Área de cima segura: cabeçalhos azuis e "Como você vai usar o app?" com espaço para a hora e a câmera, só nos aparelhos que têm (no computador nada muda).
- [x] I4. Botão "Instalar o app" no cabeçalho de Entrar e Criar conta (Android: abre a instalação; iPhone: mostra como adicionar). Some quando o app já está instalado. Regra em `src/lib/instalar.ts`, com teste.
- [x] I5. Conferir: o Chrome reconhece o app como instalável (sem erros); telas iguais no computador; Entrar e Criar conta sem passar a rolar.

Como ficou (14/11/2026):
- I1: `public/manifest.webmanifest` (nome "O Vanzeiro", "Vanzeiro" no ícone, abre em tela cheia, retrato, azul-marinho). No `__root.tsx`: arquivo de instalação, ícone do iPhone e marcações para abrir em tela cheia no Android e no iPhone; a tela usa até a área da câmera (`viewport-fit=cover`).
- I2: `public/icones/`: 192 e 512 (logo), 512 com fundo inteiro (Android recorta em círculo/gota) e 180 para o iPhone.
- I3: utilitários `pt-safe-3/5/6/10` em `styles.css` (espaço da hora/câmera + o espaço de antes). Usados nos cabeçalhos azuis (painéis, Entrar/Criar conta/Esqueci, Termos/Política) e em "Como você vai usar o app?". A barra de baixo já tinha (`pb-safe`).
- I4: regra `comoInstalar` em `src/lib/instalar.ts` (teste em `instalar.test.ts`); botão `InstalarApp` no canto do cabeçalho de Entrar, Criar conta e Esqueci minha senha.
- I5 conferido: o Chrome lê o arquivo de instalação sem erros e não aponta nenhum erro para instalar; os arquivos chegam no build. Android (simulado): botão aparece, abre a instalação e some. iPhone (simulado): botão mostra os 3 passos. Sem oferta (computador): botão não aparece. Testes (172), tipos, build; 15 telas sem erro; texto de 13 telas idêntico à `main`; 5 caminhos de entrada; nenhuma tela passou a rolar.
- Falta conferir num celular de verdade (não dá para simular aqui): instalar pelo Chrome no Android e abrir em tela cheia; adicionar à tela de início no iPhone.

### E14 feito e Etapa E fechada (14/11/2026)
- Novo tipo de aviso "pedido_recusado" ("Pedido não aceito", em vermelho, nas Notificações do passageiro).
- `recusarPedido`: quando quem pediu já é passageiro (pediu outro destino), cria o aviso "O vanzeiro não aceitou seu pedido para [destino]". Quem ainda não tem van não ganha aviso: a própria tela mostra "O vanzeiro não aceitou o pedido".
- "Entrar em outro destino": com o pedido recusado, mostra "O vanzeiro não aceitou o pedido" e "Tentar outro código" (antes voltava direto para o campo do código, sem avisar).
- Ordem dos avisos: no mesmo dia, o criado por último aparece primeiro.
- Testes em `pedido-recusado.test.ts`. Conferido no app: Juliana pede Beto Carrero → Carlos recusa → sininho da Juliana vai de 1 para 2 → "Pedido não aceito" no topo das Notificações → a tela mostra que não foi aceito → "Tentar outro código" volta ao campo.
- Conferência final da Etapa E: testes (175), tipos (0 erros), build; 14 telas sem erro; texto de 13 telas idêntico à `main`; 5 caminhos de entrada; percurso da viagem completo; Início sem rolar no celular comum.


---

## Volta em outro dia (iniciado em 14/11/2026)
**Situação:** feita em 14/11/2026, na branch `volta-outro-dia`, com merge na `main`. Decisão do dono (14/11/2026, sugestão 1): na viagem avulsa, "A volta é: No mesmo dia / Em outro dia" (com a data); na rota fixa, se a volta for mais cedo que a saída (ex.: sai 22:00, volta 06:00), ela é no dia seguinte, sem pergunta nova. Sem banco de dados.

Mapa (antes de começar):
- A cobrança já está certa: é criada no embarque da ida, com a identidade daquela viagem; a volta em outro dia não cria outra (Por viagem: ida e volta = 1 cobrança). Diário: conta o dia da ida.
- A confirmação ("Vou") e o prazo são da ida e valem para a volta.
- A aba Viagem já continua a viagem em andamento em qualquer dia; o Início só olhava as viagens de hoje.

Plano:
- [x] V1. Regra: data da volta da viagem avulsa (\`voltaData\`, vazia = mesmo dia); volta no dia seguinte na rota fixa quando a volta é mais cedo que a saída; texto da volta ("19:00", "29/11, 19:00", "06:00 do dia seguinte"). Em \`src/lib/destinos.ts\`, com testes.
- [x] V2. Cadastro, passo 2: na viagem avulsa com volta, "A volta é: No mesmo dia / Em outro dia" + "Data da volta" (depois da data da ida); na rota fixa, aviso "A volta é no dia seguinte" quando for o caso. Resumo mostra a volta certa. O passo não pode passar a rolar.
- [x] V3. Onde a volta aparece (Início, detalhe do destino, antes de sair, histórico) usa o texto da volta.
- [x] V4. Viagem: o Início mostra a viagem em andamento mesmo fora do dia dela; "Chegou ao destino" diz quando é a volta.
- [x] V5. Conferência no app (cadastro de excursão com volta em outro dia; viagem até a volta), testes, tipos, build.

Como ficou (14/11/2026):
- V1: campo `voltaData` no destino (só viagem avulsa; vazio = mesmo dia). Regras em `src/lib/destinos.ts`: `voltaNoDiaSeguinte` (rota fixa com volta mais cedo que a saída), `dataDaVolta`, `textoDaVolta` ("19:00", "29/11, 19:00", "06:00 do dia seguinte", "Sem volta"). Testes em `destinos.test.ts`.
- V2: com "Em outro dia" em duas perguntas, o passo 2 rolava (44px a 171px). **Decisão do dono (14/11/2026): juntar numa linha.** Viagem avulsa: "Tem volta?" com 3 botões — Não · Mesmo dia · Outro dia; com "Outro dia", "Data da volta" aparece ao lado de "Data da ida" (só aceita data depois da ida). Rota fixa continua Sim / Não, com o aviso "A volta é no dia seguinte." quando for o caso. O passo 2 não rola em nenhum dos 3 tamanhos. Resumo e detalhe mostram "Volta 29/11, 18:00".
- V3: Início, detalhe do destino, antes de sair, resumo do cadastro e histórico usam `textoDaVolta`.
- V4: o Início mostra a viagem em andamento mesmo fora do dia dela (teste em `viagem.test.ts`); "Chegou ao destino" mostra "Volta: 29/11, 19:00" acima de "Iniciar volta" quando a volta é em outro dia (teste da tela em `chegada-volta.test.tsx`).
- A cobrança não mudou: já era uma só por viagem (ida e volta), criada no embarque da ida.
- V5 conferido: cadastro de excursão Jacarezinho → Aparecida com volta em 29/11 no navegador (3 tamanhos); rota fixa 22:00 → 06:00; testes (181), tipos, build; 14 telas sem erro; texto de 13 telas idêntico à `main`; 5 caminhos de entrada; percurso da viagem completo.
- Não conferido no app (os exemplos não têm uma excursão de hoje com passageiro): a viagem atravessando de um dia para o outro na tela. Conferido por teste.


---

## Pendências finais (iniciado em 14/11/2026)
**Situação:** feita em 14/11/2026, na branch `pendencias-finais`, com merge na `main`. Conferência: testes (182), tipos, build; 14 telas sem erro; texto de 13 telas idêntico à `main`; 5 caminhos de entrada; cadastro de destino; Início sem rolar. Pedido do dono: ver o que falta e fazer o que não depende de decisão dele.
Levantamento no app (14/11/2026):
- "Viagem encerrada" não rola mais (resolvido pelas etapas anteriores).
- Confirmado: passageiro de conta nova (entrou por pedido aceito) que pede um 2º destino perde o painel: some a barra de baixo, volta "Entrar na van" e "Início" não sai dali. Causa: o pedido novo apaga o pedido aceito, que era o que dizia que a pessoa já é passageira.
- Formulários que ainda rolam: "Novo destino" Resumo (360 × 740: 53px; iPhone SE: 84px), passo 3 com 3 paradas (iPhone SE: 29px), "Editar" do Perfil do vanzeiro (360 × 740: 8px; iPhone SE: 59px).

Plano:
- [x] F1. Pedir um 2º destino não faz o passageiro perder o painel (guardar quem a pessoa é antes de trocar o pedido). Com teste e conferido no app.
- [x] F2. Formulários sem rolar: Resumo e passo 3 do "Novo destino" e "Editar" do Perfil do vanzeiro, sem mudar o visual aprovado (só espaços).
- [x] F3. Contraprova: marcar as caixinhas antigas que já foram resolvidas depois, dizendo onde.

Como ficou (14/11/2026):
- F1: `pedirParaEntrar` guarda quem a pessoa é antes de trocar o pedido. Teste em `segundo-destino.test.ts` (conferido quebrando a regra). No app: o Rui (conta nova, aceito em Cambará) pede Londrina e continua com a barra de baixo; "Início" funciona.
- F2: lista do caminho em versão compacta (mesmo desenho, menos espaço) só no cadastro do destino (passo 3 e Resumo); no "Editar" do Perfil, "Modelo da van" e "Placa" lado a lado. Nada rola no celular comum nem no Android comum. Sobra só o Resumo com 3 ou mais paradas no iPhone SE (22px): quanto mais paradas, mais comprido; fica anotado.
- F3: caixinhas antigas marcadas, cada uma dizendo onde foi resolvida. Continuam abertas só as que dependem do dono do projeto.

### O que falta (14/11/2026) — tudo depende do dono do projeto
- [ ] Contato do responsável para a Política de Privacidade (nome, e-mail, telefone).
- [ ] Dados reais do vanzeiro do piloto (rotas, horários, van, Pix), para trocar pelos exemplos.
- [ ] Revisão dos Termos e da Política por um advogado antes de lançar ao público.
- [ ] Testar no celular: o app instalado em tela cheia (Android e iPhone).
- [x] Decidir: quem sai do último destino deixa de ver os Pagamentos (se ainda deve algo, só o vanzeiro vê). Pendência desde o item 5 da Etapa B. **Anotação de 16/11:** decidido pelo dono (A3, opção 1: continua vendo) e feito em 15/11/2026.
- [ ] Decidir (decisão C): diminuir o cabeçalho azul de Entrar, Criar conta e "Como você vai usar o app?" para não rolar no iPhone SE.
- [ ] Para depois, só quando o dono mandar: documento do banco (Etapa C, item 7), banco e login real, mapa e GPS, app na Play Store. **Anotação de 16/11:** o documento do banco já está feito (Etapa J); banco e login real, GPS ao vivo e Play Store continuam esperando a ordem do dono.


---

## Análise completa de 15/11/2026
**Situação:** feita em 15/11/2026, na branch `analise-completa`, com merge na `main`. Só análise, nada corrigido.
Resultado na seção 10 de `docs/fonte-da-verdade.md`: 11 erros/faltas numerados e o plano das Etapas G (viagem e histórico), H (avisos de verdade) e I (cadastros e textos). As 40 telas abertas sem erro; números entre telas conferidos e batendo; todos os fluxos de ação refeitos.

---

## Etapa G — Viagem e Histórico (iniciada em 15/11/2026)
**Situação:** feita em 15/11/2026 (merge na `main`). Erros 1 a 4 da seção 10 de `docs/fonte-da-verdade.md`. Sem banco de dados.
Plano:
- [x] G1. Sem escolha do vanzeiro, a aba Viagem abre na mesma viagem do Início (hoje abre na que os exemplos apontam).
- [x] G2. A viagem guarda o nome e os horários do destino do dia em que aconteceu ("foto" no início da viagem); o Histórico usa essa foto.
- [x] G3. Excluir um destino não apaga as viagens feitas dele do Histórico.
- [x] G4. "Pausar" com a viagem do destino em andamento avisa "Termine a viagem antes" e não pausa (igual a "Excluir").
- [x] G5. Conferência no app, testes, tipos, build, merge.

Conferência (15/11/2026):
- 189 testes passando (novo arquivo `src/test/etapa-g.test.ts`), tipos sem erro, build ok.
- No navegador (390×844): Início e aba Viagem abrem na mesma viagem (Jacarezinho → Londrina, 06:00); com a viagem em andamento, "Pausar" mostra o aviso e o botão fica desligado; viagem terminada e destino excluído: o Histórico continua com as 2 viagens de Londrina, com nome e horários do dia.
- Não pode quebrar: cores, palavras, cards e barra de navegação sem mudança; a tela do Histórico só trocou de onde lê o nome e os horários.
- Pendências: nenhuma nova. Próxima: Etapa H (avisos de verdade no sininho).

---

## Etapa H — Avisos de verdade no sininho (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Erro 6 da seção 10 de `docs/fonte-da-verdade.md`. Sem banco de dados.
- [x] H1. Tirar os 4 avisos de exemplo (eram de mentira).
- [x] H2. Vanzeiro: "Resposta de passageiro" nasce quando o passageiro responde; mudar a resposta troca o aviso (não acumula).
- [x] H3. Vanzeiro: "Cobrança vencida" nasce no dia seguinte ao vencimento não pago, com nome, valor e destino.
- [x] H4. Passageiro: "Prazo chegando" 30 minutos antes do prazo, só para quem não respondeu.
- [x] H5. Passageiro: "Van saiu" quando o vanzeiro inicia a viagem, só para quem vai.
- [x] H6. Passageiro: "Cobrança vencendo" 3 dias antes do vencimento.
- [x] H7. Todo aviso cita o destino e nunca se repete (o relógio passa a cada minuto sem duplicar).
- [x] H8. Conferência: 195 testes (novo `src/test/etapa-h.test.ts`), tipos, build; no navegador (390×844) a Juliana vê "Prazo chegando" de Cambará → UENP e o Carlos vê a resposta dela e as 2 cobranças vencidas (Mariana e Beatriz); sininho do vanzeiro com 5 (2 pedidos + 3 avisos); a tela não rola a página; sem erro no console (corrigido um erro de montagem da página que esta etapa tinha causado).
- Não pode quebrar: cores, palavras, cards e barra de navegação sem mudança. Pedido recusado continua avisando a pessoa.
- Pendências para o dono: (1) pedido **aceito** deve avisar a pessoa? (2) tempos de 30 minutos e 3 dias estão bons?
- Próxima: Etapa I (cadastros e textos: erros 5, 7, 8 e 9).

---

## Etapa I — Cadastros e textos (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Erros 5, 7, 8 e 9 da seção 10 de `docs/fonte-da-verdade.md`. Sem banco de dados.
- [x] I1. (erro 5) Viagem avulsa: data que já passou não deixa continuar; o calendário começa em hoje; o título do campo vira "Essa data já passou." (sem linha a mais, para não rolar no iPhone SE).
- [x] I2. (erro 7) Cobrança que vence hoje: "vence hoje" no Início do passageiro; o texto do vencimento agora fica num lugar só (`textoDoVencimento`, em `src/lib/cobrancas.ts`).
- [x] I3. (erro 8) Perfil do passageiro: subtítulo "Seus dados e o seu vanzeiro." (o do vanzeiro continua "Seus dados e a sua van.").
- [x] I4. (erro 9) Cadastro de passageiro: valor zero nunca passa (antes "0,001" passava e virava R$ 0,00); mesmo telefone no mesmo destino avisa "Já tem um passageiro com este telefone neste destino." e não deixa continuar; a regra também vale ao salvar.
- [x] I5. Conferência: 201 testes (novo `src/test/etapa-i.test.ts`), tipos, build; no navegador em 390×844 e 375×667: mensagens aparecem sem rolagem, editar o Gabriel continua funcionando, sem erro no console.
- Não pode quebrar: cores, palavras, cards e barra de navegação sem mudança.
- Pendências para o dono (continuam): pedido aceito avisa a pessoa?; tempos dos avisos (30 min e 3 dias); erro 10; erro 11 (decisão C); dados do piloto; contato da Política de Privacidade; advogado; pagamentos de quem saiu do último destino; documento do banco.

---

## Decisão do dono — aviso de pedido aceito (feito em 15/11/2026)
- [x] Quando o vanzeiro aceita um pedido, a pessoa recebe no sininho "Pedido aceito — O vanzeiro aceitou seu pedido para <destino>". Cadastrar direto (sem pedido) não avisa.
- [x] Tempos dos avisos ficam como estão: "Prazo chegando" 30 minutos antes; "Cobrança vencendo" 3 dias antes.
- [x] Conferência: 202 testes (novo `src/test/pedido-aceito.test.ts`), tipos, build; no navegador, aceitar a Larissa salva e volta ao destino sem erro.
- Pendências que continuam: erro 10, erro 11 (decisão C), dados do piloto, contato da Política de Privacidade, advogado, pagamentos de quem saiu do último destino, documento do banco.

---

## Etapa J — Documento do banco (iniciada em 15/11/2026)
**Situação:** feita em 15/11/2026 (merge na `main`). Item 7 da Etapa C; seção 11 da fonte da verdade. **Sem banco de dados: só o documento.**
- [x] J1. `docs/banco-de-dados.md` com cada conjunto de dados, os campos (conferidos com os tipos do código de hoje) e quem pode ver.
- [x] J2. O que hoje some ao recarregar e passa a ser guardado (embarques, faltas, viagem em andamento, memória escondida).
- [x] J3. O que roda sozinho no servidor (cobranças, faltas do prazo, avisos do relógio).
- [x] J4. Quais funções de `src/lib/` mudam por dentro quando o banco entrar.
- [x] J5. Nenhum código mudou; testes e build continuam passando; merge.
- Conferência: só documentos mudaram (`docs/banco-de-dados.md`, `docs/fonte-da-verdade.md`, `docs/contraprova.md`); 202 testes e build continuam passando. Achado novo na análise: a ordem de busca na cidade não tem campo próprio (item 9 da seção 11.2, entra na Etapa K).
- Próxima: Etapa K (guardar o que hoje some), quando o dono mandar.

---

## Etapa K — Guardar o que hoje some (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Itens 1, 2, 3 e 9 da seção 11.2 da fonte da verdade. Sem banco de dados. **Nada muda na tela.**
- [x] K1. Embarques e faltas avisadas no prazo viram registros (não repetem); o histórico do passageiro lê deles (antes lia dos exemplos); a lista escondida "registrados" saiu.
- [x] K2. A viagem tem número próprio (destino e dia), hora de início e hora de fim; todo passo passa por uma função só (`atualizarViagem`).
- [x] K3. Respostas fechadas viram registro; pedidos nunca somem (aguardando / aceito com a matrícula / recusado, com datas); quem sai continua guardado com o dia da saída. As listas que as telas usam são tiradas desses registros, então as telas não mudaram.
- [x] K4. Ordem de busca na cidade virou número próprio (1, 2, 3…); as setas ↑ ↓ trocam os números.
- [x] K5. Conferência: 209 testes (novo `src/test/etapa-k.test.ts`), tipos, build; no navegador: as 28 telas sem erro, sem erro de montagem, dia completo do vanzeiro igual ao de antes, aceitar pedido, criar conta, excluir conta e as setas de ordem funcionando.
- Não pode quebrar: nada visual mudou.
- Próximo: decisões do dono (seção 11.4) e o banco, só quando ele mandar.

---

## A1 — App funciona sem sinal (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono: sim, o app deve funcionar sem internet. Sem banco de dados.
- [x] A1.1 O app guarda uma cópia de si no celular (`public/sw.js`): telas principais, arquivos do app e as letras usadas em português.
- [x] A1.2 Com internet, sempre usa a versão nova (nunca prende uma versão velha); sem sinal, usa a cópia.
- [x] A1.3 Não guarda cópia na edição nem na prévia do Lovable (para as mudanças sempre aparecerem lá).
- [x] A1.4 Conferência na versão de produção, com a internet cortada e a memória do navegador apagada: recarregar o Início, trocar as 4 abas, iniciar viagem e marcar "Embarcou", abrir um destino pelo endereço, abrir o painel do passageiro, abrir pelo ícone: tudo funcionou, sem arquivo faltando. Com internet: as 28 telas sem erro. 211 testes (novo `src/test/sem-sinal.test.ts`), tipos, build.
- Observação: abrir sem sinal o endereço de uma tela nunca visitada mostra um aviso técnico só para quem programa; a tela abre certa.
- Fica para o dia do banco: fila do que foi feito sem sinal, mandada quando o sinal voltar (`docs/banco-de-dados.md`, seção 6).
- Próximas: A2 (notificação no celular) e A3 (pagamentos de quem saiu), só com a coordenada do dono.

---

## A2 — Notificação no celular (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono: sim, os avisos aparecem como notificação no celular. Sem banco de dados.
- [x] A2.1 Perfil (vanzeiro e passageiro): cartão "Notificações no celular" com Ativar / Ativadas / Bloqueadas; some onde o celular não permite.
- [x] A2.2 Com o app minimizado: aviso novo do sininho (e pedido novo, para o vanzeiro) vira notificação, só para quem usa o celular, com as mesmas palavras do sininho. Com o app na tela, não notifica.
- [x] A2.3 Tocar na notificação abre a tela de Notificações do painel certo.
- [x] A2.4 O celular já está pronto para receber notificação mandada pelo servidor (para o dia do banco).
- [x] A2.5 Conferência: 216 testes (novos `src/test/notificacoes.test.ts` e `src/test/notificacoes-app.test.tsx`), tipos, build; na versão de produção, os 3 jeitos do cartão nos dois Perfis e a notificação mostrada pelo app; a A1 (sem sinal) repetida e funcionando; as 28 telas sem erro.
- Fica para o dia do banco: notificação com o app totalmente fechado (mandada pelo servidor).
- Próxima: A3 (pagamentos de quem saiu do último destino), só com a coordenada do dono.

---

## A3 — Pagamentos de quem saiu do último destino (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono: opção 1, continua vendo. Sem banco de dados.
- [x] A3.1 Quem sai do último destino e ainda deve: cartão "Em aberto" na tela do código, com valor e selo, que abre Pagamentos.
- [x] A3.2 Barra de baixo com Início e Pagamentos só nesse caso; Pagamentos e o detalhe da cobrança funcionam (Pagar com Pix, Já paguei).
- [x] A3.3 Quem saiu sem dever nada vê a tela do código normal, sem cartão e sem barra.
- [x] A3.4 Conferência: 218 testes (novo `src/test/a3-saiu-deve.test.tsx`), tipos, build; no navegador, a Beatriz sai do único destino e vê R$ 280,00 devendo, abre Pagamentos e o detalhe com Pagar com Pix; as 28 telas sem erro; criar conta, pedir para entrar e excluir conta sem mudança.
- Achado: antes, isso só funcionava para quem ainda tinha outro destino (a confirmação de "Sair deste destino" já prometia "continua nos seus Pagamentos").
- Próximo: com A1, A2 e A3 feitas, falta só o item 4 da seção 11.4 (contato da Política de Privacidade e advogado) antes do banco, que só entra quando o dono mandar.

---

## Lugares na van — etapa 1 da seção 12 (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Decisões do dono: lotou → impede "Vou"; quem respondeu primeiro; sem lista de espera; uma van só. Sem banco de dados.
- [x] L1. Perfil do vanzeiro: campo "Lugares para passageiros" (1 a 60, ou em branco) e "· N lugares" no cartão Sua van.
- [x] L2. Viagem do vanzeiro: selo "N de M lugares" verde / âmbar (lotada) / vermelho (passou); sem lugares, "N vão" como antes.
- [x] L3. Passageiro (Início e Viagens): "Van lotada" apagado no lugar do "Vou"; quem já disse "Vou" mantém; "Não vou" sempre funciona e libera o lugar. A regra também vale ao gravar a resposta.
- [x] L4. Cadastro de passageiro e aceitar pedido: aviso âmbar quando o destino passa dos lugares (só avisa).
- [x] L5. Conferência: 224 testes (novo `src/test/lugares.test.ts`), tipos, build; no navegador: lugares 3 → "3 de 3 lugares" em âmbar e "Van lotada" para a Juliana nas duas telas, "Não vou" funcionando; lugares 0 → "Use um número de 1 a 60."; aviso no resumo do cadastro sem rolagem; as 28 telas sem erro; Inícios sem rolar como antes.
- Próxima: etapa 2 da seção 12 (tela do mapa com van simulada), só com a coordenada do dono.

---

## Mapa da van (simulada) — etapa 2 da seção 12 (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Sem banco de dados; posição da van simulada.
- [x] M1. Cartão "Situação da van" do Início abre "Onde está a van" ("· Ver no mapa" na linha do detalhe, sem deixar o Início mais alto: iPhone SE continua 8px).
- [x] M2. Mapa com cidades em ordem, o ponto da própria pessoa e a van; os pontos dos outros passageiros nunca aparecem.
- [x] M3. "Está passando por …", "Chega no seu ponto em uns N min", situação da van igual ao Início, aviso de posição simulada.
- [x] M4. Marcar meu ponto no mapa (Salvar só depois de tocar no mapa).
- [x] M5. Conferência: 230 testes (novo `src/test/mapa.test.ts`), tipos, build; no navegador (edição e produção): antes da viagem, viagem começada ("Faltam 2 pessoas antes de você · Está passando por Cambará · Chega no seu ponto em uns 25 min"), depois do embarque ("Na van"), marcar ponto; a tela não rola em nenhum tamanho; as outras telas sem erro. O fundo do mapa (ruas) não carrega no ambiente de teste (servidor de mapa bloqueado aqui); no celular carrega.
- Pendência para antes de lançar: escolher o fornecedor do mapa e da busca de endereço.
- Próxima: etapa 3 da seção 12 (tempo real de verdade), só junto com o banco e quando o dono mandar.

---

## Endereço pelo passageiro, com regra de distância (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Seção 13 da fonte da verdade. Decisões do dono: ponto obrigatório; medido do ponto combinado; 1 km; passou, o vanzeiro aprova. Sem banco de dados.
- [x] E1. Pedido para entrar em 2 passos (passo no subtítulo): dados; cidade, endereço e ponto no mapa (obrigatório quando o mapa conhece o destino).
- [x] E2. Vanzeiro ao aceitar vê cidade, endereço e ponto preenchidos pelo passageiro, sem poder mudar; define plano e valor. Cadastro direto continua como antes.
- [x] E3. "Mudar onde embarco" (Perfil e mapa da van): até 1 km salva; mais longe vai ao vanzeiro, valendo o endereço antigo até ele responder.
- [x] E4. Vanzeiro: "Mudanças de endereço" em Notificações (Aceitar / Recusar), no número do sininho; a pessoa recebe "Endereço aceito" / "Endereço não aceito".
- [x] E5. Conferência: 236 testes (novo `src/test/endereco.test.ts`), tipos, build; no navegador: conta nova pede para entrar com ponto, vanzeiro aceita com tudo preenchido, Juliana muda para 27 km → enviado → vanzeiro aceita → "Endereço aceito"; nenhuma das telas novas rola nos 3 tamanhos (o passo 1 do pedido rola 34px no iPhone SE, menos que os 58px de antes); as 30 telas sem erro; contas (criar, pedir, sair, excluir) sem mudança.
- Pendência pequena: notificação no celular (A2) para mudança de endereço nova. **Feita em 15/11/2026:** notificação "Mudança de endereço" para o vanzeiro (só as que precisam de aprovação); 242 testes (casos novos em `src/test/notificacoes-app.test.tsx`), tipos, build, 30 telas sem erro.

---

## Ordem da busca: número e arrastar (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Seção 14 da fonte da verdade. Sem banco de dados.
- [x] O1. Número da busca no destino inteiro no lugar da letra do nome (o mesmo da aba Viagem).
- [x] O2. Setas ↑ ↓ removidas; segurar e arrastar muda a ordem dentro da cidade (nunca troca de cidade).
- [x] O3. Toque rápido abre o passageiro; deslizar rápido rola a tela; o toque que termina o arrasto não abre o passageiro.
- [x] O4. Conferência: 240 testes (novo `src/test/arrastar.test.ts`), tipos, build; no navegador com toque (celular) e mouse: Beatriz arrastada de 3ª para 1ª, Pedro de 2º para 1º, a aba Viagem segue a ordem nova; as 30 telas sem erro.

---

## Etapa P1 — Lacunas 1, 2, 4 e 5 da seção 15 (iniciada em 15/11/2026)
**Situação:** feita em 15/11/2026 (merge na `main`). Sem banco de dados.
- [x] P1.1 Mudança de endereço aguardando é cancelada quando a pessoa sai, é removida ou o destino é excluído; e nunca é aplicada a quem não está mais no destino.
- [x] P1.2 Vanzeiro mudou a cidade do passageiro: o ponto no mapa é apagado (com aviso no cadastro).
- [x] P1.3 Recusar mudança de endereço pede confirmação.
- [x] P1.4 Sem ponto marcado: o mapa não mostra "Seu ponto" no centro da cidade; marcar pela primeira vez na mesma cidade salva direto.
- [x] P1.5 Testes, tipos, build, conferência no navegador, merge.
- Conferência: 246 testes (novo `src/test/etapa-p1.test.ts`; regra da primeira marcação atualizada em `src/test/endereco.test.ts`), tipos, build; no navegador: mapa sem ponto mostra o aviso e não mostra pino, primeira marcação salva direto, mudança longe → vanzeiro recusa com confirmação, vanzeiro troca a cidade → aviso do ponto apagado sem rolagem nos 3 tamanhos; 30 telas sem erro.
- Próxima: Etapa P2 (item 3 precisa da decisão do dono; item 6).

---

## Etapa P2 — Itens 3 e 6 da seção 15 (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono no item 3: A. Sem banco de dados.
- [x] P2.1 Destino: "Ordem fixa da busca, com todos os passageiros. Segure e arraste para mudar."
- [x] P2.2 Viagem: "Quem vai · na ordem de hoje".
- [x] P2.3 "Abrir no mapa": ponto marcado (coordenadas) quando existe; senão o endereço escrito.
- [x] P2.4 Conferência: 247 testes (novo `src/test/etapa-p2.test.ts`), tipos, build; no navegador, Juliana com ponto abre nas coordenadas e os outros pelo endereço; 30 telas sem erro; Viagem rola como antes.
- Próxima: Etapa P3 (busca de cidade/endereço para o mapa e Política de Privacidade), antes do piloto real.

---

## Etapa P3 — Itens 7 e 8 da seção 15 (feita em 15/11/2026)
**Situação:** feita (merge na `main`). Sem banco de dados.
- [x] P3.1 O mapa procura cidades novas (OpenStreetMap/Nominatim, só Brasil, uma por segundo, perto da primeira cidade conhecida), guarda o que acha, tenta de novo sem internet e não repete cidade não achada (`src/lib/coordenadas-store.ts`).
- [x] P3.2 Telas com mapa (pedido para entrar, Onde você embarca, Onde está a van) procuram as cidades que faltam e se atualizam quando elas chegam.
- [x] P3.3 Política de Privacidade: ponto no mapa, notificações, mapa e busca de cidades (OpenStreetMap), cópia do app no celular.
- [x] P3.4 Conferência: 251 testes (novo `src/test/coordenadas.test.ts`; os testes nunca acessam a internet), tipos, build; no navegador, com a resposta do serviço simulada (ele é bloqueado no ambiente de teste): destino Jacarezinho → Ourinhos procura "Ourinhos" perto de Jacarezinho uma vez, e o pedido para entrar mostra o mapa com as duas cidades; Política com todos os trechos novos; 30 telas sem erro.
- Pendências: conferir no celular a busca de verdade; contato do responsável e advogado; atualizar a Política quando o GPS ao vivo entrar; serviço pago de busca/mapa antes de vender.

---

## Preparar para o banco — seção 16 (iniciada em 16/11/2026)
- [x] Q1. Um perfil por vanzeiro (feito em 16/11/2026, merge na `main`): passageiro vê o vanzeiro do destino/cobrança; "Van lotada" pelos lugares do vanzeiro do destino; vanzeiro desconhecido em branco. Conferência: 254 testes (novo `src/test/dois-vanzeiros.test.ts`, com um segundo vanzeiro), tipos, build; no navegador, Juliana vê o Carlos e o Pix dele, o Pix novo do Carlos aparece para ela, a Beatriz que saiu continua vendo o Pix do Carlos, dia completo igual, 30 telas sem erro.
- [x] Q2. Lista de cidades do mapa no documento do banco (feito em 16/11/2026): conjuntos 2.13 e 2.14, tarefas 5 e 6 do servidor, duas linhas na tabela da seção 4. Só documento; nenhum código mudou; testes e build continuam passando.
- [x] Q3. Dinheiro em centavos (feito em 16/11/2026): `src/lib/dinheiro.ts` (centavos, `formatarReais`, `centavosParaTexto`), `lerValor` devolve centavos, `valorFinal` só com inteiros, exemplos em centavos. Conferência: 256 testes (testes antigos convertidos para centavos; novo `src/test/centavos.test.ts`), tipos, build; no navegador todos os valores iguais aos de antes e "45,50" entra e aparece como R$ 45,50; 30 telas sem erro.
- [x] Q4. Fuso de Brasília na hora do app (feito em 16/11/2026): `emBrasilia` e o ponto único `relogio` em `src/lib/agora.ts`. Conferência: 259 testes (novos em `src/test/agora.test.ts`, também com o computador em fuso do Japão e UTC), tipos, build; nada muda na tela; 30 telas sem erro.
- [x] Q5. Hora da resposta guardada (feito em 16/11/2026): momento e prazo de cada resposta aceita; "avisou em" na falta com desconto. Conferência: 262 testes (novo `src/test/hora-da-resposta.test.ts`), tipos, build; nada muda na tela; 30 telas sem erro. **Seção 16.1 completa (Q1 a Q5).**

---

## Etapa R1 — Termos de Uso atualizados (iniciada em 16/11/2026)
**Situação:** feita em 16/11/2026 (merge na `main`). Seção 17 da fonte da verdade. Sem banco de dados.
- [x] R1.1 Faltas e descontos: só quem avisou "Não vou" no prazo; "não estava no ponto" e "sem resposta" não descontam.
- [x] R1.2 Pagamentos: cobrança nunca é editada (só paga ou cancelada com motivo); ao sair do destino, pendentes canceladas e devendo continua.
- [x] R1.3 Van lotada: o lugar é de quem respondeu "Vou" primeiro; o vanzeiro informa os lugares.
- [x] R1.4 Onde embarca: até 1 km do ponto combinado muda na hora; mais longe, o vanzeiro aceita ou recusa.
- [x] R1.5 Conferência e merge.
- Conferência: cada frase conferida contra o código (desconto na próxima cobrança não vencida; pendentes canceladas ao sair); página /termos com os 8 trechos novos, sem rolar para o lado no iPhone SE; 262 testes, tipos, build; 30 telas sem erro. O texto ainda precisa da revisão do advogado.

---

## Etapa R2 — Fonte da verdade e contraprova iguais ao app de hoje (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 17 da fonte da verdade. Só documentos.
- [x] R2.1 Fonte da verdade: aviso "Como ler" no topo; 40 trechos das seções 0 a 9 (escritas em 13/11) ganharam a marca "Atualizado em 16/11:" com o que vale hoje (sininho e Notificações, pedidos e mudanças de endereço, ordem fixa e arrastar, lugares, mapa, histórico de viagens, excluir conta, números do Financeiro e do Início, código único, vencimento de 7 dias, faltas no prazo, Termos e Política, pedido em 2 passos, A3); nada foi apagado.
- [x] R2.2 Valores conferidos no app antes de escrever: Início R$ 1.661,00 · 9 pagos · 9 pendentes · 2 devendo; Financeiro "Pagas" com 9 itens (agora batem); Financeiro R$ 1.661 / 663 / 530.
- [x] R2.3 Contraprova: caixinhas velhas marcadas ou anotadas, sem apagar (documento do banco feito, decisão A3 feita, iPhone SE e "para depois" anotados).
- Próxima: R3 (limpeza e bibliotecas).
