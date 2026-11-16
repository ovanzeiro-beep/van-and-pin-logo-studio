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
- [x] R2.1 Fonte da verdade: aviso "Como ler" no topo; 42 trechos das seções 0 a 9 (escritas em 13/11) ganharam a marca "Atualizado em 16/11:" com o que vale hoje (sininho e Notificações, pedidos e mudanças de endereço, ordem fixa e arrastar, lugares, mapa, histórico de viagens, excluir conta, números do Financeiro e do Início, código único, vencimento de 7 dias, faltas no prazo, Termos e Política, pedido em 2 passos, A3); nada foi apagado.
- [x] R2.2 Valores conferidos no app antes de escrever: Início R$ 1.661,00 · 9 pagos · 9 pendentes · 2 devendo; Financeiro "Pagas" com 9 itens (agora batem); Financeiro R$ 1.661 / 663 / 530.
- [x] R2.3 Contraprova: caixinhas velhas marcadas ou anotadas, sem apagar (documento do banco feito, decisão A3 feita, iPhone SE e "para depois" anotados).
- Próxima: R3 (limpeza e bibliotecas).

---

## Etapa R3 — Limpeza e bibliotecas (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 17 da fonte da verdade.
- [x] R3.1 Código sem uso tirado: `moverPassageiro` e `moverNaCidade` (as setas ↑ ↓ que saíram) e `viagemHoje` dos exemplos. Os testes que usavam as setas passaram a usar o arrastar (`moverParaNaCidade`, `reordenarPassageiro`), conferindo as mesmas coisas.
- [x] R3.2 "seroval" e "seroval-plugins" (montam as páginas; a única biblioteca com alerta que vai para o app) fixadas na 1.6.12, a mais nova da mesma linha, com a correção. `bun audit` não lista mais a seroval. Os alertas que sobraram (inclusive o crítico) são de ferramentas de trabalho (eslint, servidor de edição, testes), que não vão para o celular.
- [x] R3.3 Formatação (1.204 avisos de espaços e quebras de linha): **não mexida de propósito** (reescreveria 134 arquivos e atrapalharia o Lovable).
- [x] R3.4 Conferência completa depois da atualização: 262 testes, tipos, build; servidor de edição: 30 telas sem erro, sem erro de montagem da página, dia completo, A3 (Beatriz), endereço, P1, arrastar e lugares iguais a antes; produção: 30 telas sem erro, sem erro de montagem e o teste sem internet completo.
- **Seção 17.1 completa (R1, R2, R3).** O que falta antes do banco é a seção 17.2 (decisões, Política/Termos com o advogado, teste no celular).

---

## Decisões do dono de 16/11/2026 (seção 17.1.1 da fonte da verdade)
- [x] Feriado: sim, cancelar a viagem de um dia, sem desconto para o mensalista. → Etapa S1 (feita em 16/11/2026).
- [x] Uma conta pode ser vanzeiro e passageiro: sim (como hoje). Registrado em `docs/banco-de-dados.md`.
- [x] iPhone SE (decisão C): sim, diminuir o cabeçalho das 3 telas de entrada. → Etapa S2 (feita em 16/11/2026).

---

## Etapa S1 — Cancelar a viagem de um dia (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono: sim, sem desconto. Sem banco de dados.
- [x] S1.1 Regra num lugar só: `aconteceEm` deixa de valer nos dias cancelados (`diasCancelados` no destino); por isso Início, aba Viagem, viagens do passageiro, avisos de prazo, faltas e cobranças obedecem sozinhos.
- [x] S1.2 Destino: cartão "Dias sem viagem" (cancelar um dia com dia e motivo; lista com Desfazer). Aba Viagem: "Não vai ter viagem hoje".
- [x] S1.3 Passageiros recebem "Sem viagem" ao cancelar e "Vai ter viagem" ao desfazer ("Viagem de volta" foi evitado para não confundir com a volta da viagem).
- [x] S1.4 Proteções: só dia com viagem, de hoje em diante; motivo obrigatório (até 60 letras); viagem já começada não pode ser cancelada; editar o destino não perde os dias cancelados; sem desconto (quem disse "Não vou" no dia cancelado não ganha falta).
- [x] S1.5 Conferência: 267 testes (novo `src/test/dias-sem-viagem.test.ts`), tipos, build; no navegador: cancelar hoje em Cambará → some da Viagem e do Início, Juliana vê a próxima viagem e recebe o aviso; Desfazer devolve a viagem; atalho da Viagem sem escolha de dia; 30 telas sem erro; dia completo igual.
- Próxima: Etapa S2 (cabeçalho menor no iPhone SE), com o "pode seguir" do dono.

---

## Etapa S2 — Cabeçalho menor no iPhone SE (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Decisão C do dono. Sem banco de dados.
- [x] S2.1 Só em telas até 700 de altura: menos espaço em volta do título em Entrar e Criar conta (`AuthLayout.tsx`) e no topo e nos cartões de "Como você vai usar o app?".
- [x] S2.2 Rolagem no iPhone SE: Entrar 39px → 0, Criar conta 70px → 0, "Como você vai usar o app?" 69px → 0; Esqueci a senha continua 0; nenhuma rola em 390×844 e 360×740.
- [x] S2.3 Celulares comuns: fotos de antes (main) e depois iguais em Entrar e "Como você vai usar o app?". No Criar conta aparece uma diferença de 0,3% dos pontos, mas ela aparece também entre duas fotos da mesma versão (variação da própria tela), então não vem desta etapa.
- [x] S2.4 Conferência: 267 testes, tipos, build; 30 telas sem erro; criar conta, entrar, sair e excluir conta sem mudança.
- Observação: o verificador de segurança dos comandos ficou fora do ar várias vezes durante esta etapa; o trabalho foi salvo na branch `etapa-s2` antes de seguir, e nada foi para a main sem conferência.
- Anotação: a pendência antiga do iPhone SE (decisão C, telas de entrada) está resolvida.

---

## Etapa T1 — Modo direção com voz (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18 da fonte da verdade. Sem banco de dados.
- [x] T1.1 Frase de cada momento da viagem, com as mesmas palavras da tela (`src/lib/voz.ts`, `fraseDaViagem`).
- [x] T1.2 Botão "Ligar a voz" / "Voz ligada" no cabeçalho da viagem em andamento; no iPhone SE, só o ícone no canto (a tela da busca rolava 38px com o botão numa linha nova; agora não rola e "Fazer parada" aparece).
- [x] T1.3 Fala em português do Brasil, só com a voz ligada; ao ligar, fala a frase do momento; desligar cala na hora; sem voz no celular, o botão não aparece.
- [x] T1.4 Conferência: 270 testes (novo `src/test/voz.test.tsx`), tipos, build; no navegador (gravando o que o app manda falar): ligar → "Próximo passageiro: Mariana Souza…"; Embarcou → "…Pedro Henrique Lima…"; Não estava no ponto → "…Ana Clara Ribeiro…"; desligar → nada; 30 telas sem erro; dia completo igual.
- Pendência: ouvir no celular de verdade (o ambiente de teste não tem alto-falante).

## Etapa T2 — Pix com valor e cobrar quem está devendo (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados.
- [x] T2.1 Código Pix copia e cola com o valor (`src/lib/pix.ts`), no padrão do Banco Central; confere com o exemplo do manual (número de conferência 1D3D). Chave de 11 números soltos não gera código (CPF ou celular?).
- [x] T2.2 Passageiro: "Pagar com Pix" ganhou "Copiar Pix copia e cola (R$ X)"; o "Copiar" da chave virou "Copiar só a chave". Sem código possível, a tela fica como antes.
- [x] T2.3 Vanzeiro: "Cobrar quem está devendo (N)" no Financeiro, só com alguém devendo; uma linha por pessoa com total; cada "Cobrar" abre o WhatsApp com as cobranças em atraso, o total, a chave e o Pix copia e cola; a linha vira "Enviado".
- [x] T2.4 Conferência: 277 testes (novos `pix.test.ts` e `cobrar-devedores.test.tsx`), tipos, build; no navegador em 390×844, 360×740 e 375×667: Financeiro não rola (só a lista), as duas janelas cabem na tela, o código copiado bate com o valor (R$ 280,00), sem erros.
- Não pode quebrar: conferido — cores, palavras (Devendo/Pendente/Pago), cobranças não são editadas, o passageiro continua sem marcar como pago.
- Pendência: pagar de verdade com o código num app de banco, no celular, com a chave real do vanzeiro do piloto. Quando o banco entrar, o perfil do vanzeiro pode ganhar a cidade dele (hoje o código usa a cidade de origem do destino).

## Etapa T3 — "Vou sempre" e "Não vou de… até…" (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados. Decisões do dono de 16/11: conta como "Vou"; desconta; vanzeiro vê só "Vou"; um destino por vez.
- [x] T3.1 Regra em `src/lib/respostas-fixas.ts`: resposta do dia vale mais; período de "Não vou" vale mais que "Vou sempre"; só conta se foi marcado antes do prazo; desligar/tirar depois do prazo não muda aquele dia; "Vou" automático só com lugar livre.
- [x] T3.2 Os dois painéis leem as mesmas respostas (`respostas-store`): Início e Viagem do vanzeiro, lugares, avisos de prazo e faltas veem o "Vou"/"Não vou" automático; ao iniciar a viagem, as respostas do dia ficam guardadas.
- [x] T3.3 Desconto: dia do período vira falta avisada no prazo, com a hora em que o período foi marcado (`avisouEm`).
- [x] T3.4 Tela: aba Viagens do passageiro, "Para não esquecer de responder", um cartão por destino com "Vou sempre", períodos com "Tirar" e "Não vou de… até…" (janela com Primeiro dia / Último dia, Salvar em cima e Voltar embaixo, como as outras janelas).
- [x] T3.5 Conferência: 285 testes (novo `respostas-fixas.test.ts`), tipos, build; no navegador em 390×844, 360×740 e 375×667: ligar "Vou sempre" pôs "Vou" na viagem de hoje com prazo aberto e não mexeu na que já tinha passado do prazo; período 16/11–17/11 virou "Não vou" no dia 16; sem datas, mostra "Escolha o primeiro e o último dia."; a janela cabe na tela; sem erros. Telas abertas sem erro; o único 404 é do roteiro antigo de conferência ("/vanzeiro/pedidos" não existe mais), não do app.
- Não pode quebrar: conferido — Início do passageiro igual (não rola), palavras Vou / Não vou / Sem resposta, cores, regra do prazo.
- Pendência (sugestão, não feita): avisar o vanzeiro no sininho quando alguém marca "Não vou de… até…". Só se o dono quiser.

## Etapa T4 — Resumo do dia para o grupo da van (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados. Decisões do dono de 16/11: nome e cidade; lista quem não respondeu com o prazo; botão na aba Viagem.
- [x] T4.1 Texto pronto (`src/lib/resumo-do-grupo.ts`): dia e destino, saída e volta, quantos vão (com os lugares, quando a van tem), ordem da busca com nome e cidade, sem endereço.
- [x] T4.2 "Ainda não responderam (até HH:MM)" só enquanto o prazo está aberto; depois do prazo, não aparece.
- [x] T4.3 Botão "Mandar resumo no grupo" na aba Viagem, antes de sair, no fim da lista; abre o WhatsApp sem número (o vanzeiro escolhe o grupo).
- [x] T4.4 Conferência: 288 testes (novo `resumo-do-grupo.test.ts`), tipos, build; no navegador em 390×844, 360×740 e 375×667: a página não rola (só a lista), "Iniciar viagem" continua visível, o texto das duas viagens de hoje está certo (Jacarezinho → Londrina sem "não responderam", porque o prazo passou; Cambará → UENP com Juliana e Rafael até 05:40); sem erros.
- Não pode quebrar: conferido — lista de quem vai, cores, botões "Iniciar viagem" e "Não vai ter viagem hoje" iguais.
- Pendência: mandar de verdade num grupo do WhatsApp, no celular.

## Etapa T5 — "Seu mês na van" (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados. Decisões do dono de 16/11: sem gastos; pelo Financeiro; número e nomes; este mês e os anteriores.
- [x] T5.1 Contas em `src/lib/seu-mes.ts`: Recebido, Falta receber, Viagens feitas e embarques, quem pagou em dia / atrasado / está devendo / pendente; meses disponíveis.
- [x] T5.2 Tela nova `/vanzeiro/financeiro/mes`, com Voltar, setas de mês, 4 números e os grupos de nomes (com o destino embaixo).
- [x] T5.3 Botão "Seu mês na van" no cabeçalho do Financeiro (mesmo jeito do "Viagens feitas" da aba Viagem).
- [x] T5.4 Conferência: 291 testes (novo `seu-mes.test.ts`, incluindo "Recebido igual ao do Financeiro"), tipos, build; no navegador em 390×844, 360×740 e 375×667: nenhuma página rola (só as listas); novembro: Recebido R$ 663,00 (igual ao Financeiro), Falta receber R$ 1.661,00, 2 viagens / 11 embarques, 2 de 4 em dia; outubro: R$ 2.140,00, 8 de 8 em dia; sem erros.
- Não pode quebrar: conferido — números e filtros do Financeiro iguais; cores verde/vermelho/âmbar; palavras Devendo/Pendentes/Pago.
- Observação: no iPhone SE a lista do Financeiro ficou menor (267px) por causa do botão no cabeçalho; continua rolando só a lista.
- Pendência: gastos ("sobrou R$ X") só se o dono pedir. **Atualizado em 16/11:** pedido e feito na T6.

## Etapa T6 — Gastos da van no "Seu mês na van" (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados. Decisões do dono de 16/11: lista pronta de tipos; apagar e anotar de novo; gasto do mês; Sobrou = Recebido − Gastos.
- [x] T6.1 Regras em `src/lib/gastos.ts` (tipos, o que falta para salvar, gastos do mês, total, Sobrou) e gastos na memória em `src/lib/gastos-store.ts`, com o vanzeiro dono; exemplos em `src/data/exemplo.ts` (novembro R$ 818,60; outubro R$ 1.140,00); conta nova de vanzeiro começa sem gastos.
- [x] T6.2 Cartão "Sobrou" / "Faltou" no alto do "Seu mês na van".
- [x] T6.3 "Gastos da van": lista com lixeira (confirmação "Apagar este gasto?"), "Anotar gasto" com os 5 tipos, "O que foi?" em Outros, valor e dia; mensagens quando falta algo.
- [x] T6.4 `docs/banco-de-dados.md`: seções 2.15 (respostas deixadas prontas, da T3, que faltava) e 2.16 (gastos), e as linhas da tabela da seção 4.
- [x] T6.5 Conferência: 295 testes (novo `gastos.test.tsx`), tipos, build; no navegador em 390×844, 360×740 e 375×667: a página não rola (só a lista); novembro "Faltou R$ 155,60" (R$ 663,00 − R$ 818,60); anotar "Lavagem" R$ 30,00 → "Faltou R$ 185,60"; apagar com confirmação volta; outubro "Sobrou R$ 1.000,00"; a janela de anotar cabe na tela, mesmo com "O que foi?"; sem erros.
- Não pode quebrar: conferido — números de cobranças e "Pagaram em dia" iguais à T5; Financeiro igual.
- Pendência: anotar gastos reais com o vanzeiro do piloto.

## Etapa T7 — Aviso do "Não vou de… até…" no sininho (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 18.3 da fonte da verdade. Sem banco de dados. Decisão do dono de 16/11: avisa ao marcar e ao tirar. Era a sugestão anotada na T3.
- [x] T7.1 `avisoDePeriodoDeNaoVou` em `src/lib/avisos.ts` (tipo "Resposta de passageiro", um aviso por período).
- [x] T7.2 `marcarNaoVouNoPeriodo` e `tirarNaoVouDoPeriodo` (`respostas-store.ts`) criam / trocam o aviso; tirar duas vezes não cria outro.
- [x] T7.3 Conferência: 297 testes (novo `aviso-nao-vou.test.ts`), tipos, build; no navegador (390×844): passageiro marca 16/11–17/11 → no sininho do vanzeiro "Juliana marcou "Não vou" de 16/11 até 17/11, em Cambará → UENP Jacarezinho"; passageiro tira → o aviso vira "tirou"; sem erros.
- Não pode quebrar: conferido — os outros avisos e as respostas iguais.

## Etapa U1 — Limpeza de código (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 19 da fonte da verdade. Sem banco de dados. Nada muda para quem usa o app.
- [x] U1.1 Tirar as funções sem uso: `marcarComoLido` (`avisos-store.ts`) e `limparSessao` (`sessao.ts`).
- [x] U1.2 Trocar o nome `obterRespostasParaTeste` → `obterRespostasDoDia` (é usado pelo app).
- [x] U1.3 Juntar as contas repetidas num lugar só (`src/lib/datas.ts`): lista de meses, somar dias, "hoje / dia", primeiro nome; a tela do Financeiro deixa de ter a própria lista de meses.
- [x] U1.4 Botão redondo do cabeçalho numa peça só, com o mesmo visual, nas 10 telas.
- [x] U1.5 Uma função só para criar identificadores novos, que não repete.
- [x] U1.6 Tirar a marca de "uso fora do arquivo" das funções que só são usadas dentro dele.
- [x] U1.7 Tirar as funções dos arquivos de tela do app (avisos "react-refresh" em `src/components/app`).
- [x] U1.8 Conferência: testes, tipos, build, as telas iguais a antes (comparação de imagens com a `main`), sem erros.
  - Resultado: 297 testes, tipos (também sem nada declarado e não usado nas peças do app), build. 30 telas em 390×844 e 375×667 comparadas com a `main` lado a lado: **texto igual em todas as 60**; as poucas imagens com diferença têm de 0 a 118 pontos soltos de desenho de letra, inclusive em telas não mexidas ("Entrar") e entre duas fotos da mesma versão — é ruído da captura. Botão "Voltar" igual ponto a ponto; botão da voz na viagem em andamento no mesmo lugar e tamanho (390×844 e iPhone SE, no canto), sem rolar; "Voltar" aberto direto leva a Financeiro, Viagem e Início do passageiro, como antes; sem erros.
- A mais (achado na conferência): 7 importações esquecidas (sem uso) tiradas, em `PassageiroHeader`, `ViagemEmCurso`, `avisos.ts`, `dias-sem-viagem.ts`, `passageiro.index`, `passageiro.viagens` e `vanzeiro.financeiro.$cid`.
- Não pode quebrar: conferido — nenhuma tela, texto, cor ou regra mudou.

## Etapa U2 — Tirar peças e bibliotecas sem uso (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`), com o "pode fazer a próxima etapa" do dono de 16/11. Seção 19 da fonte da verdade. Sem banco de dados. Nada muda para quem usa o app.
- [x] U2.1 Tirar de `src/components/ui` as peças prontas que o app não usa (ficam só: alert-dialog, button, checkbox, input, label, switch) e `src/hooks/use-mobile.tsx` (só a barra lateral usava).
- [x] U2.2 Tirar do `package.json` / `bun.lock` as bibliotecas que só essas peças usavam (formulários, gráficos, calendário, menus, carrossel, avisos flutuantes etc.). Fica a `@tanstack/router-plugin`, por segurança (faz parte do jeito que as telas são montadas).
- [x] U2.3 Conferência: testes, tipos, build, nenhuma biblioteca ou peça faltando, as telas iguais a antes, número de alertas de segurança antes e depois.
  - Resultado: saíram 40 peças e `use-mobile.tsx` e 31 bibliotecas; 297 testes, tipos, build; a conferência de código sem uso não acusa peça nem biblioteca faltando (sobram só os 3 arquivos que a configuração usa — `public/sw.js`, `src/server.ts`, `src/lib/error-capture.ts` — e a `@tanstack/router-plugin`, mantida de propósito). 30 telas em 390×844 e 375×667 comparadas com a `main`: texto igual nas 60; as diferenças de imagem são pontos soltos de letras (ruído, como na U1). Botão da voz, "Voltar" e rolagem iguais; sem erros. Instalação: 433 MB → 350 MB. Alertas de segurança: 26 antes e 26 depois (todos de ferramentas de trabalho, nenhum vai para o celular).
- Não pode quebrar: conferido — nenhuma tela, texto, cor ou regra mudou.


## Etapa U3 — Cada vanzeiro só vê o que é dele (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`), com o "pode fazer a próxima etapa" do dono de 16/11. Seção 19 da fonte da verdade. Sem banco de dados. Nada muda para quem usa o app.
- [x] U3.1 `src/lib/painel.ts`: `PainelDoVanzeiro` (quem está olhando) e `useSoDoMeuPainel` (só o que é dele); o painel do vanzeiro (`vanzeiro.tsx`) passa o vanzeiro da sessão. Todas as telas do vanzeiro ficam dentro desse painel (conferido na lista de telas).
- [x] U3.2 Separados por vanzeiro dentro do painel: `useDestinos`, `usePassageiros`, `usePedidos`, `useMudancasAguardando`, `useCobrancas`, `useViagensDoDia`, `useViagensEncerradasComDetalhes` (e as que dependem delas: `useDestino`, `useCobranca`, `usePassageiro`…). As regras que rodam sozinhas (relógio, avisos, faltas do prazo) continuam olhando tudo, como o servidor fará.
- [x] U3.3 Painel do passageiro sem corte aqui (ele já filtra pelas próprias matrículas).
- [x] U3.4 Conferência: 300 testes (novo `cada-vanzeiro.test.tsx`: com um segundo vanzeiro, a Rosa, o painel do Carlos não mostra nada dela, o dela só mostra o dela, e fora do painel nada é cortado), tipos, build; 30 telas em 390×844 e 375×667 comparadas com a `main`: **texto igual nas 60**; dia completo (passageiro responde, vanzeiro faz a viagem, histórico, financeiro, avisos) **igual linha por linha** à `main`; aviso do "Não vou" (T7), cobrar quem deve (T2), resumo do grupo (T4) e Seu mês (T5) iguais; sem erros.
- Não pode quebrar: conferido — nenhuma tela, texto, cor ou regra mudou para o vanzeiro e os passageiros dos exemplos.
- **Seção 19 completa (U1, U2, U3).**
## Etapa V1 — Documento do banco acertado (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 20 da fonte da verdade. Sem banco de dados. Só documento (e um comentário no código).
- [x] V1.1 Trechos antigos de `docs/banco-de-dados.md` corrigidos: ordem de busca (campo `ordem`, arrastar), pedidos guardados com a situação, registros de embarque e falta (Etapa K), os 12 tipos de aviso, linhas de `passageiros-store` e `cobrancas-store` na seção 4.
- [x] V1.2 Seção 2.17: juntar cadastro e conta pelo telefone, com confirmação do vanzeiro (decisão do dono).
- [x] V1.3 Seção 7: as 20 regras que o banco garante sozinho (quem é quem, destinos e passageiros, respostas e viagem, dinheiro, avisos e conta).
- [x] V1.4 Seção 8: método com o Supabase próprio (decisão do dono): o que o dono faz, o que o Claude faz, etapas W1 a W10.
- [x] V1.5 Comentário antigo das setas ↑ ↓ em `src/data/exemplo.ts` corrigido.
- [x] V1.6 Conferência: as regras da seção 7 batem com as seções 4, 5 e 6 do `CLAUDE.md` e com o código (`src/lib`); testes, tipos e build sem mudança (só documento e comentário).
- Achado na leitura: o tipo de aviso "pedido novo" não vira aviso na lista (só notificação no celular); anotado no documento, sem mudar o app.

## Etapa V2 — Ações com resposta (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 20 da fonte da verdade. Sem banco de dados (o dono vai conectar o Supabase depois).
- [x] V2.1 `src/lib/acoes.ts`: `Resultado` ("deu certo" ou "não deu, porque…") e `fazer(...)`, que mostra "Salvando…" (só se demorar) e a mensagem quando não dá certo, iguais no app inteiro.
- [x] V2.2 Cada ação que a pessoa faz nas telas devolve `Resultado`, com o motivo em português simples, onde hoje só para em silêncio: respostas, Vou sempre, Não vou de… até…, gastos, pago/cancelar cobrança, destinos, dias sem viagem, pausar/excluir destino, sair/remover, excluir conta, passageiros, pedidos, endereço, meus dados, perfil, viagem (iniciar, embarcou, não estava, conferência, Estou na van).
- [x] V2.3 As telas chamam as ações por `fazer(...)`; a mensagem aparece no alto da tela nos dois painéis.
- [x] V2.4 Conferência: testes (os que conferiam "true/false" passam a conferir "deu certo / motivo"), tipos, build, as telas iguais a antes quando dá certo, a mensagem aparece quando não dá, sem erros.
  - Resultado: 306 testes (novo `acoes.test.tsx`: a peça única, a mensagem na tela e os motivos de respostas, cobranças, gastos e viagem; 9 arquivos de teste passaram a conferir "deu certo / motivo" no lugar de true/false, conferindo as mesmas regras), tipos (sem nada sobrando), build. 30 telas em 390×844 e 375×667 comparadas com a `main`: texto igual nas 60; dia completo igual linha por linha; T2 a T7 iguais; roteiros antigos de cadastro, endereço e exclusão com o mesmo resultado nas duas versões; perfil salva e fecha; marcar como pago funciona; a faixa vermelha aparece nos dois painéis, por cima de uma janela aberta (que continua aberta) e some em 6 s; sem erros.
- Achado e corrigido durante a etapa: uma trava nova ("ninguém confirmou") tinha entrado sem querer em `comecarViagem`; os testes mostraram e ela foi tirada (a tela já não deixa iniciar sem ninguém).
- Não pode quebrar: conferido — quando dá certo, nenhuma tela, texto, cor ou regra mudou.

## Etapa V3 — Relógio de verdade (iniciada e feita em 16/11/2026)
**Situação:** feita (merge na `main`). Seção 20 da fonte da verdade. Sem banco de dados.
- [x] V3.1 `src/lib/agora.ts`: o app usa o dia e a hora reais de Brasília; os testes continuam no momento fixo dos exemplos (sexta, 13/11/2026, 05:10), para conferirem sempre as mesmas contas.
- [x] V3.2 Os exemplos andam junto: todas as datas de `src/data/exemplo.ts` andam em semanas inteiras até a sexta mais recente (cada dia de exemplo continua no mesmo dia da semana); vencimentos de Mensal e Quinzenal ficam no mês certo; o histórico começa no mês certo.
- [x] V3.3 Conferência: testes, tipos, build; no navegador com o relógio de hoje e com outras datas (outro mês, virada de ano, fim de semana, noite): telas sem erro, viagens de hoje são de hoje, números batendo entre Início e Financeiro.
  - Resultado: 306 testes (sem mudar nenhum: nos testes o relógio continua fixo), tipos, build. No navegador, 5 momentos — hoje de verdade (seg 16/11/2026 09:16), qua 02/12 06:00, dom 20/12 14:00, sex 01/01/2027 23:30, seg 15/03/2027 05:20: "Hoje" é o dia certo em Viagem e nas Viagens do passageiro (domingo mostra a viagem de domingo); prazo aberto às 05:20 e encerrado depois; "A receber" igual no Início e no Financeiro nos 5; Início do vanzeiro e do passageiro sem rolar; histórico com as datas andadas e os mesmos dias da semana (qui e dom); "Seu mês" no mês certo. Dia completo com o relógio do navegador em 13/11/2026 05:10: as 13 linhas iguais às da `main`. O único aviso é o "hydration" do próprio teste (servidor no dia de verdade, navegador num dia simulado), que se acerta sozinho.
- Não pode quebrar: conferido — telas, textos, cores e regras iguais; só o dia e a hora passaram a ser os de verdade.


## Etapa V4 — Guardar no celular (cancelada em 16/11/2026)
**Situação:** cancelada pelo dono: o banco entra agora, então não precisa.

## Etapa W1 — Login e conta no banco (iniciada em 16/11/2026, com o "pode colocar o banco" do dono)
**Situação:** código feito e conferido (merge na `main`); **falta o dono rodar o SQL no Supabase e testar no celular.**
- [x] W1.1 `supabase/migrations/20261116120000_w1_contas.sql`: tabela `contas`, regra "cada um só vê a própria conta", conta criada sozinha no cadastro com nome e aceite (e-mail sem aceite é recusado), `escolher_papel`, `excluir_minha_conta`.
- [x] W1.2 `src/lib/supabase.ts` (ligação, chave pública, `USA_BANCO` — nos testes tudo continua na memória) e `src/lib/conta.ts` (entrar, criar conta, Google, esqueci a senha, senha nova, papel, sair, excluir; motivos em português).
- [x] W1.3 Telas: Entrar, Criar conta (com "Confirme seu e-mail"), Esqueci minha senha, nova tela Criar senha nova, Como você vai usar, Sair, Excluir minha conta; painéis só com login (`ExigeConta`); faixa vermelha também nas telas de login.
- [x] W1.4 Conferência aqui: 311 testes (novo `w1-conta.test.ts`, com o Supabase simulado: senha errada, entrar, criar conta com aceite, confirmar e-mail, papel, excluir, sair, senha nova), tipos, build; no navegador: sem login, Vanzeiro, Passageiro e Como vai usar mandam para Entrar; entrar sem conexão mostra "Sem conexão com o servidor…"; Criar conta, Esqueci minha senha e Criar senha nova abrem sem rolar; sem erros.
- [ ] W1.5 Dono: rodar o SQL no SQL Editor; em Authentication → URL Configuration, colocar o endereço do app; testar no celular: criar conta, confirmar e-mail, entrar, escolher o papel, sair, entrar de novo (abre o último painel), esqueci a senha.
- [ ] W1b Google: ligar o Google no Supabase (precisa de uma conta Google Cloud) e gravar o aceite dos Termos de quem entra pelo Google.
- Observação: a partir da W1, quem entra começa com o app vazio; até W2–W8, o que for criado some ao recarregar.

## Banco completo (W2 a W8) num arquivo só — preparado em 16/11/2026
**Situação:** feito e testado aqui; **falta o dono colar no Supabase.** O dono pediu para colar uma vez só e não mexer mais no Supabase; o app vai sendo ligado ao banco pelo Claude no GitHub, parte por parte (W2 a W8).
- [x] `supabase/migrations/20261116130000_w2_w8_dados.sql`: tabelas de perfil, destinos, dias sem viagem, matrículas, pedidos, mudanças de endereço, juntar pelo telefone, respostas, Vou sempre, Não vou de… até…, viagens, embarques, faltas, cobranças, avisos, gastos, cidades, celulares; quem vê o quê em todas; regras da seção 7 (convite único, avulsa não no passado, telefone único no destino, Mensal/Quinzenal com vencimento, responder só até o prazo e antes da viagem, van lotada, cobrança nunca editada, só o vanzeiro paga/cancela, gasto até hoje, "Estou na van" só por si, juntar pelo telefone só com o vanzeiro).
- [x] `supabase/COLAR-NO-SUPABASE.sql`: W1 + W2–W8 juntos, para colar uma vez.
- [x] Conferência num Postgres 16 que imita o Supabase (auth.users, auth.uid(), papéis): o arquivo roda duas vezes seguidas sem erro; 51 testes de regras com 3 pessoas (vanzeira Rosa, passageiro Beto, outra vanzeira Carla, mais Dani para juntar pelo telefone): tudo o que devia passar passou e tudo o que devia ser recusado foi recusado (ex.: Carla não vê nada da Rosa; Beto não muda o próprio valor nem responde pela Dani; van lotada; prazo passou; cobrança paga não muda; gasto no futuro); excluir a conta da vanzeira apaga os dados dela sem erro.
- [ ] Dono: colar `supabase/COLAR-NO-SUPABASE.sql` no SQL Editor e clicar em Run; em Authentication → URL Configuration, Site URL = https://van-and-pin-logo-studio.lovable.app.
- Pendente (segundo arquivo, depois): tarefas automáticas no servidor (W9) e notificações com o app fechado (W10).


## Formatação do que é digitado (feita em 16/11/2026)
**Situação:** feita (merge na `main`). Decisão do dono: "Mariana Souza"; textos do app como estão.
- [x] `src/lib/formatos.ts`: `nomeDePessoa`, `nomeProprio` (lugares, com siglas), `emailPadrao`, `placaPadrao`, `frase`, `chavePixPadrao`.
- [x] Aplicada ao salvar: destino (origem, destino, paradas), passageiro (nome, endereço), meus dados, pedir para entrar, mudar onde embarco, perfil do vanzeiro (nome, telefone, Pix, modelo, placa), criar conta e entrar (nome, e-mail), esqueci a senha (e-mail), motivo do dia sem viagem e do cancelamento, descrição do gasto.
- [x] Conferência: 316 testes (novo `formatos.test.ts`), tipos, build.

## Correção pontual da busca do convite — 16/11/2026
- [x] Diagnóstico: o login real limpa os destinos locais; a tela procurava o convite somente nessa lista vazia, sem chamar a consulta já existente no banco.
- [x] A busca de contas reais chama `destino_pelo_convite`, conserva o destino retornado e mostra `vanzeiro_nome`, sem substituir pelo perfil de exemplo ou pelo usuário atual. Nenhuma migração ou permissão alterada.
- [x] Falhas na consulta mostram erro de conexão, não "Código não encontrado". A pesquisa aguarda a resposta antes de liberar outra tentativa.
- [x] 319 testes passando, incluindo VAN-6187 com serviço simulado, destino de outro vanzeiro, resposta vazia e erro de consulta; última compilação registrada sem erro. A tela protegida abre o login sem erros no navegador.
- [ ] Conferir VAN-6187 com a conta real: não há sessão disponível do serviço externo; a consulta sem login retorna acesso negado, como previsto. A existência do convite e a busca autenticada real permanecem não verificadas. O envio e aceite de pedidos continuam fora desta correção.


## Segurança do banco (auditoria do Lovable de 16/11/2026) — feita em 16/11/2026
**Situação:** feita e testada aqui; **o dono precisa colar `supabase/SO-SQL-2-SEGURANCA.sql` no SQL Editor (uma vez).**
- [x] `supabase/migrations/20261116140000_seguranca.sql`: horário válido; convite único sem diferenciar maiúscula; destino excluído só é marcado (`excluido_em`); quem saiu do destino não vê mais o destino; conta só muda por funções (`aceitar_termos` para o Google); conta ligada à matrícula só por pedido aceito (`aceitar_pedido`) ou telefone confirmado; uma conta por destino; ponto com latitude e longitude juntas; pedido e mudança respondidos só por funções (`recusar_pedido`, `responder_mudanca`); distância do endereço calculada pelo banco; juntar pelo telefone confere de novo; responder só em dia com viagem, destino ativo e sem disputa da última vaga; Vou sempre / Não vou de… até… só por funções (`ligar_vou_sempre`, `marcar_nao_vou`, `tirar_nao_vou`); uma viagem em andamento por vanzeiro; fases conhecidas; passageiro vê só a própria situação (`minha_viagem_de_hoje`); "Estou na van" só na viagem do próprio destino, durante a conferência, para quem está nela; cancelamento sempre com motivo; avisos só entre quem tem a ver com o destino, e lidos só por `marcar_avisos_lidos`; cidade nova nunca "conferida" pelo app; excluir a conta do passageiro apaga os dados pessoais; ninguém sem login chama funções nem lê tabelas.
- [x] Conferência num Postgres 16 que imita o Supabase: os três arquivos rodam duas vezes seguidas sem erro; colar 1 + colar 2 sem erro; 33 checagens das falhas da auditoria: todas recusadas como deviam.
- Pendente (com as tarefas automáticas, W9): cobranças criadas só pelo servidor e desconto de falta com prova; seguir a parada só com todos conferidos (hoje o app confere).

## W2 e W3 — Perfil e destinos no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`); **o dono testa no celular depois de colar o arquivo 2 e publicar.**
- [x] `src/lib/banco/destinos.ts`: ao entrar, carrega do banco os perfis que a pessoa pode ver e os destinos (com os dias sem viagem, sem os excluídos); salvar destino (com novo código se o convite já for de outro vanzeiro), pausar/ativar, dia sem viagem e desfazer, excluir destino (marcado no banco) e salvar perfil gravam no banco primeiro e só então mudam a tela; erro do banco aparece na faixa vermelha e nada muda.
- [x] Telas: assistente de destino, Pausar, Dias sem viagem, Excluir destino, Perfil do vanzeiro.
- [x] Conferência: 325 testes (novo `w2-w3-destinos.test.ts`, com o Supabase simulado), tipos, build.

## W4 — Convite, pedidos e passageiros no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`, publicado); **o dono testa com dois celulares (ou duas contas).** Motivo: o pedido para entrar dava "Não achamos este destino" porque ainda ia para a memória.
- [x] `src/lib/banco/passageiros.ts`: ao entrar, carrega matrículas, pedidos e mudanças de endereço que a pessoa pode ver; a identidade do passageiro é a conta; sem van, o último pedido da conta diz se está aguardando ou recusado; novidades dos outros celulares a cada 30 segundos e quando o app volta para a tela.
- [x] Passageiro: pedir para entrar pelo código (`pedir_para_entrar`), mudar onde embarca (o banco mede a distância), meus dados, sair do destino.
- [x] Vanzeiro: aceitar pedido (a matrícula nasce com a conta da pessoa, `aceitar_pedido`), recusar, cadastrar e editar passageiro, reordenar (arrastar), remover, aceitar/recusar mudança de endereço; excluir destino tira os passageiros e recusa os pedidos que esperavam.
- [x] Siglas de estado sempre maiúsculas nos lugares ("Jacarezinho PR").
- [x] Conferência: 329 testes (novos `w4-pedidos.test.ts` e casos de estado em `formatos.test.ts`), tipos, build.
- Pendente: respostas (Vou / Não vou), viagem, cobranças, gastos e avisos ainda na memória (próximas partes).

## W5 — Respostas no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`, publicado); o dono testa no celular.
- [x] `src/lib/banco/respostas.ts`: ao entrar e a cada 30 s, carrega as respostas dos últimos 60 dias em diante, o "Vou sempre" e os "Não vou de… até…"; horários guardados em Brasília.
- [x] "Vou" / "Não vou" (`responder`: só a própria pessoa, até o prazo, em dia com viagem, com lugar), "Vou sempre" (`ligar_vou_sempre`), "Não vou de… até…" (`marcar_nao_vou`, com o número do banco) e "Tirar" (`tirar_nao_vou`): o banco confere primeiro; o motivo da recusa aparece na faixa vermelha; o celular do vanzeiro vê as respostas em até 30 s.
- [x] Conferência: 333 testes (novo `w5-respostas.test.ts`), tipos, build.
- Pendente: o aviso no sininho do vanzeiro quando alguém responde ainda é da memória (vai com os avisos, W8); fechar as respostas ao iniciar a viagem passa a valer no banco com a viagem (W6).

## W6 — Viagem no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`, publicado); o dono testa no celular.
- [x] `src/lib/banco/viagem.ts`: iniciar viagem grava a viagem inteira (uma em andamento por vanzeiro); cada toque (Embarcou, Não estava no ponto, parada, conferência, chegada, volta, Desceu, encerrar) é salvo na hora; se o banco recusar, a tela volta como estava; ao entrar e a cada 30 s, carrega a viagem de hoje (continua de onde parou) e o histórico dos dias anteriores.
- [x] Passageiro: vê só o próprio lugar na viagem (`minha_viagem_de_hoje`: a van saiu, embarcou, conferência), nunca os outros; "Estou na van" pelo banco (`estou_na_van`).
- [x] Conferência: 338 testes (novo `w6-viagem.test.ts`), tipos, build.
- Pendente: embarques e faltas que viram cobrança/desconto vão com o dinheiro (W7); "a van saiu" no sininho vai com os avisos (W8).

## W7 — Dinheiro no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`, publicado); o dono testa no celular.
- [x] `src/lib/banco/dinheiro.ts`: ao entrar e a cada 30 s, carrega cobranças, embarques, faltas e gastos; o que o celular do vanzeiro criou e ainda não salvou vai primeiro, para não se perder.
- [x] Cobranças criadas sozinhas (viagem feita, próxima mensalidade, desconto de falta avisada no prazo) salvas no banco logo em seguida; só o vanzeiro dono grava.
- [x] "Marcar como pago" e "Cancelar" (com motivo): salvos no banco primeiro; o motivo da recusa aparece na faixa vermelha.
- [x] Gastos da van: anotar e apagar no banco.
- [x] Regras conferidas numa cópia do banco (19 checagens): cobrança nunca editada; paga não muda mais; cancelar exige motivo; gasto não pode ser depois de hoje; o passageiro vê só as dele e não marca pago nem cria cobrança; outra pessoa não vê nem apaga nada.
- [x] Conferência: 343 testes (novo `w7-dinheiro.test.ts`), tipos, build.
- Pendente: o teste no Supabase de verdade ficou esperando a licença do dono (a pergunta do conector não teve resposta); cobranças criadas com o app fechado ficam para a W9 (tarefas no servidor); avisos de cobrança no sininho vão com a W8.

## W8 — Avisos do sininho no banco (feita em 16/11/2026)
**Situação:** código feito e testado (merge na `main`, publicado); o SQL novo espera a licença do dono no Supabase (ou ser colado: `supabase/SO-SQL-3-AVISOS.sql`).
- [x] `supabase/migrations/20261116170000_w8_avisos.sql`: função `salvar_aviso` (só quem é do destino, só para alguém do destino, mesma chave não repete ou troca o texto); ninguém grava direto na tabela.
- [x] `src/lib/banco/avisos.ts`: cada aviso criado vai para o banco logo em seguida; ao entrar e a cada 30 s, carrega os avisos da pessoa; abrir o sininho marca como lido no banco (`marcar_avisos_lidos`).
- [x] Regras conferidas numa cópia do banco (12 checagens): resposta trocada vira um aviso só; aviso repetido não duplica; ninguém de fora do destino cria aviso nem manda para quem não é do destino; cada um vê só os seus; marcar lido.
- [x] Conferência: 346 testes (novo `w8-avisos.test.ts`), tipos, build.
- Pendente: aplicar o SQL no Supabase de verdade; avisos criados com o app fechado (prazo chegando, cobrança vencendo) ficam para a W9; notificação no celular com o app fechado é a W10.

## W9 — Tarefas do relógio no banco (feita em 16/11/2026)
**Situação:** SQL feito e testado numa cópia do banco (merge na `main`); o dono cola `supabase/SO-SQL-4-RELOGIO.sql` no Supabase (ou dá a licença).
- [x] `tarefas_do_relogio` a cada 5 minutos (pg_cron): faltas no prazo e desconto; próxima cobrança Mensal/Quinzenal; avisos de prazo chegando, cobrança vencendo e vencida.
- [x] Mesmas contas do app conferidas lado a lado: vencimentos (dia 31 em novembro, quinzenas 5/20, 15/30, fevereiro), nomes das cobranças ("Mensalidade de novembro", "Quinzena de 06/11 a 20/11"), período das faltas, valores ("R$ 1.234,56"), datas ("sáb, 28 de nov").
- [x] Teste da tarefa numa cópia do banco: falta só depois do prazo; desconto na cobrança; rodar de novo não repete nada; prazo chegando para quem não respondeu; cobrança vencendo e vencida; próxima mensalidade criada; o app não consegue chamar a tarefa.
- [x] Conferência: 346 testes, tipos, build (o app não mudou nesta etapa).
- Pendente: notificação no celular com o app fechado (W10).

## W10 — Avisos na tela do celular (feita em 16/11/2026)
**Situação:** função `avisos-no-celular` publicada no Supabase; app com merge na `main`, publicado; o dono cola `supabase/SO-SQL-5-CELULAR.sql` e testa no celular.
- [x] `supabase/functions/avisos-no-celular`: cria as chaves uma vez (guardadas no banco), entrega avisos e pedidos novos, cada um uma vez só, nos celulares da pessoa; esquece celular que desligou.
- [x] SQL: endereço de entrega por celular (`guardar_celular`), aviso/pedido novo chama a entrega, aviso trocado é entregue de novo; ninguém pelo app lê as chaves.
- [x] App: ao entrar na conta (com notificações ativadas) e ao tocar em "Ativar", o celular guarda o endereço; a mesma notificação nunca aparece duas vezes (mesma marca).
- [x] Regras conferidas numa cópia do banco (8 checagens). Conferência: 348 testes (novo `w10-celular.test.ts`), tipos, build.
- Pendente: teste real no celular do dono (Android: Chrome; iPhone: só com o app na tela inicial).
- [x] (16/11, pedido do dono) Cada notificação vibra e toca o som de notificação do celular, também quando troca um aviso antigo.

## Sem sinal na van, com o banco (feita em 16/11/2026)
**Situação:** feito e testado (merge na `main`, publicado); o dono testa no celular com o modo avião.
- [x] `src/lib/banco/fila.ts`: os toques da viagem sem sinal ficam guardados no celular (sobrevivem a fechar o app) e vão para o banco quando o sinal volta (ao voltar a internet, a cada 30 s e ao abrir).
- [x] `src/lib/banco/viagem.ts`: iniciar e cada toque continuam funcionando sem sinal; ao abrir, o que espera sinal vale mais que o banco; recusa de verdade do banco continua voltando a tela.
- [x] `public/sw.js`: cópia dos últimos dados lidos do banco, para abrir sem sinal; apagada ao sair ou excluir a conta.
- [x] Conferência: 350 testes (novo `sem-sinal-viagem.test.ts`), tipos, build.
- [x] (16/11, pedido do dono) Com o app na tela: aviso novo do servidor vibra forte (3 vezes) e toca dois bipes altos, e já aparece no sininho (`src/lib/alerta.ts`); minimizado, tela apagada ou app fechado: a notificação do celular (som e vibração seguem o ajuste de notificações do celular). Conferido no banco: notificações entregues ao celular do vanzeiro (Google confirmou). 351 testes.
- [x] (16/11, pedido do dono) Vibração nova em todo aviso: uma forte, depois toques devagar que vão ficando mais longos (`VIBRACAO` em `src/lib/alerta.ts`, a mesma na notificação); se o celular recusar vibrar antes de um toque na tela, vibra no próximo toque. Com o app fechado, quem decide vibrar é o ajuste de notificações do celular (Android 8 ou mais novo).

## Sininho mais bonito e "Limpar" (16/11/2026, pedido do dono)
- [x] Cada aviso num cartão com ícone colorido da situação (verde, vermelho, âmbar, azul; van para "Van saiu"; carteira para cobrança), o tipo, o texto e "Hoje", "Ontem" ou o dia; os novos com fundo azul-claro e um ponto.
- [x] Botão "Limpar" (lixeira) com confirmação: os avisos saem da lista e do número do sininho; ficam guardados escondidos no banco (`apagar_avisos`), para o mesmo aviso não voltar; resposta nova do passageiro aparece de novo.
- [x] Passageiro: o título "Avisos" não fica mais por cima do cabeçalho.
- [x] Conferência: 353 testes (novo `limpar-avisos.test.ts`), tipos, build; telas conferidas em tamanho de celular; regras do SQL numa cópia do banco.
- Pendente: o dono cola `supabase/SO-SQL-6-LIMPAR-AVISOS.sql` no Supabase.

## Vagas da van (16/11/2026, pedido do dono)
- [x] Conferido no banco: a Monica respondeu "Vou" para 17/11 (o prazo de 16/11 já tinha passado), por isso 16/11 mostrava "sem resposta" e "0 de 15".
- [x] O "Vou" é recusado com a van lotada ("A van lotou"); agora o "Vou sempre" também ocupa lugar (`supabase/migrations/20261116210000_vagas.sql`, aplicado direto no Supabase); quem sai do destino ou responde "Não vou" libera a vaga. Testado numa cópia do banco (lotada recusa; alguém saiu, aceita).

## Varredura do dinheiro (16/11/2026, pedido do dono)
- [x] Banco de verdade conferido: 1 passageira (Diário, R$ 150,00), nenhuma viagem feita ainda, então nenhuma cobrança (certo: Diário e Por viagem só cobram quando embarca); Pix do vanzeiro preenchido.
- [x] Teste novo de ponta a ponta (`dinheiro-ponta-a-ponta.test.ts`): passageiro Mensal novo ganha a cobrança do mês; "Embarcou" de Diário cria a cobrança do dia e o embarque; pago (Pix) e cancelado (motivo) ficam no banco; cobrança paga não muda; o celular do passageiro lê pago/cancelado e o total devido.
- [x] Já conferidos antes: regras no banco (W7, 19 checagens), tarefa do relógio (faltas, próxima mensalidade, avisos de cobrança, rodando sem erro), gastos. 357 testes.

## Destino excluído e código de convite (16/11/2026, pedido do dono)
- [x] Conferido no banco: o destino antigo ficou excluído e a Monica saiu dele; a matrícula nova está certa.
- [x] Corrigido: o passageiro sem van digitava o código e a tela voltava sozinha a cada 30 s (o app pegava o pedido antigo, aceito no destino excluído). Agora só um pedido "aguardando" muda a tela; um pedido aceito de destino que não existe mais volta para a tela do código.
- [x] Aviso novo "Destino excluído" no sininho (e no celular) para cada passageiro quando o vanzeiro exclui o destino, feito pelo banco (`20261116220000_destino_excluido.sql`, testado numa cópia do banco).
- Pendente: o dono cola `supabase/SO-SQL-7-DESTINO-EXCLUIDO.sql` (o Supabase pediu licença e não teve resposta).

## E1 — Lugares da van no destino (feita em 16/11/2026)
Decisão do dono (16/11): os lugares da van (Perfil) limitam quem está no destino. Quem entra primeiro com o código entra; com a van cheia ninguém mais entra; quem sai libera a vaga. (Substitui o aviso antigo "Nem todos vão poder ir na mesma viagem".)
- [x] Banco (`20261116230000_lugares_no_destino.sql`, aplicado direto no Supabase): pedir para entrar com a van cheia é recusado ("A van está cheia. Fale com o vanzeiro."); aceitar pedido, cadastrar direto e voltar para o destino também ("A van está cheia: não tem mais lugar neste destino."); uma vaga de cada vez (sem duas pessoas pegarem a última). Testado numa cópia do banco (8 checagens).
- [x] Início: "Passageiros confirmados 1 de 15 lugares", com a barra enchendo até os lugares (sem lugares no Perfil, continua "1 de 4").
- [x] Destino: "3 de 15 lugares ocupados"; cadastro de passageiro com a van cheia mostra o aviso vermelho e não salva.
- [x] O "Vou" de cada viagem continua limitado aos lugares (já era assim; agora o "Vou sempre" também conta).
- [x] Conferência: 359 testes (novo `e1-lugares-no-destino.test.ts`), tipos, build.

## E2 — Financeiro coerente (feita em 16/11/2026)
Decisão do dono (16/11): Diário e Por viagem continuam como estão: a cobrança só nasce no "Embarcou" (sem valor "previsto").
- [x] Conferido: Início e Financeiro do vanzeiro usam a mesma conta (`resumoDoMes`); Início e Pagamentos do passageiro usam a mesma (`totalDevido`); teste de ponta a ponta do dinheiro passando.
- [x] Corrigido: passageiro sem nenhuma cobrança via "R$ 0,00 · Pago · Tudo pago. Obrigado!" (parecia que tinha pago algo). Agora: "R$ 0,00 · Nenhuma cobrança ainda." (Início e Pagamentos), sem o selo "Pago".
- [x] Conferência: 359 testes, tipos, build.

## E3 — Varredura ponta a ponta no banco de verdade (feita em 16/11/2026)
- [x] Teste `supabase/testes/e3-ponta-a-ponta.sql` rodado no Supabase de verdade (pelo dono, no SQL Editor): 28 de 28 certos. Vanzeiro e 2 passageiros de teste: contas, perfil, destino, código, pedido, aceite, van cheia (aceitar e pedir), recusar, "Vou", sininho, ninguém vê os dados dos outros, viagem, embarque, cobrança de R$ 150, passageiro não marca pago nem lê a viagem inteira, cobrança paga não muda, gasto, sair do destino libera a vaga, Mensal, destino excluído avisa e tira todos, tarefa do relógio.
- [x] Conferido depois: nada do teste ficou no banco (0 contas, 0 destino, 0 função de teste).

## E4 — Login com o Google (código feito em 16/11/2026)
- [x] App: "Continuar com Google" em Criar conta (só com o aceite marcado) grava o aceite dos Termos na volta do Google (`aceitar_termos`); conta do Google sem aceite (ex.: tocou direto em "Entrar com Google" sem ter conta) não entra e vê: "Para criar sua conta com o Google, toque em Criar conta, marque o aceite dos Termos e toque em Continuar com Google." (LGPD).
- [x] Conferência: 361 testes (novo `e4-google.test.ts`), tipos, build.
- Pendente (dono): criar a chave no Google Cloud e ligar o Google no Supabase (passo a passo enviado no chat).
