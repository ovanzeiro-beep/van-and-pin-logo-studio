# Contraprova — O Vanzeiro

Checklist que confirma que cada etapa foi feita certa. Consultar **no começo e no fim de cada etapa**.
Este arquivo nunca é apagado nem reescrito do zero: só ganha marcações e anotações.

## Situação das etapas

| Etapa | Situação |
| --- | --- |
| A — Revisão do que existe | Feita e aprovada em 13/11/2026 |
| B — Fluxos que faltam | Em andamento (itens 1 a 4 feitos em 13/11/2026; aguardando aprovação para o item 5) |
| C — Preparar o código para o banco (sem colocar o banco) | A fazer |
| D — Acabamento visual | A fazer |

---

## Não pode quebrar (conferir a cada etapa)

Visual (seção 4)
- [ ] Cor principal azul-marinho; amarelo-âmbar só em botões principais e avisos; fundo branco e cinza bem claro.
- [ ] Cores de situação: verde = pago / embarcou / na van; vermelho = devendo / faltando / não estava no ponto; âmbar = pendente / sem resposta.
- [ ] Logo: van de lado com pino de localização. Ícone de van (nunca ônibus) em todo o app.
- [ ] O mesmo ícone de carteira para dinheiro nos dois painéis.
- [ ] Cards arredondados, sombra suave, ícone à esquerda, informação principal grande.
- [ ] Cabeçalho azul com saudação e sininho.
- [ ] Barra de navegação de baixo igual à aprovada (vanzeiro: Início, Destinos, Viagem, Financeiro, Perfil; passageiro: Início, Viagens, Pagamentos, Perfil).

Palavras (seção 5)
- [ ] Vou / Não vou · Sem resposta · Pendente · Devendo · Pago · Embarcou / Não estava no ponto · Está na van / Ficou aqui — sempre com o mesmo sentido.

Telas (seção 2)
- [ ] O Início dos dois painéis não rola num celular comum.
- [ ] Telas de lista rolam só na lista, com cabeçalho e barra parados.
- [ ] Formulários longos em passos ("Passo 1 de 3").

Regras (seção 6)
- [ ] Cadastro com e-mail e senha (com confirmar senha) ou Google, os dois exigindo o aceite dos Termos e da Política.
- [ ] Escolha "Sou vanzeiro" / "Sou passageiro", com troca no Perfil.
- [ ] Destino: rota fixa (dias da semana) ou viagem avulsa (uma data); ida, volta opcional, paradas em ordem; código de convite; "Confirmar até" (padrão 1 hora antes).
- [ ] Passageiro entra pelo código e o vanzeiro aceita ou recusa; o vanzeiro também cadastra direto.
- [ ] Uma pessoa pode estar em mais de um destino, com plano e valor próprios em cada um.
- [ ] Passageiro responde Vou / Não vou até o prazo e pode mudar até lá.
- [ ] Quem não confirmar até o prazo não entra na busca.
- [ ] Busca na ordem das paradas, com Embarcou / Não estava no ponto.
- [ ] Em toda parada a viagem só segue com todos conferidos; "Estou na van" pelo celular do passageiro; "Ficou aqui" só do vanzeiro.
- [ ] Volta na ordem inversa da ida, com "Desceu".
- [ ] Planos: Por viagem (ida e volta contam como uma), Diário, Quinzenal, Mensal.
- [ ] Cobrança nunca é editada: só "marcada como paga" (Dinheiro ou Pix) ou "cancelada" com motivo.
- [ ] O total que alguém deve é a soma das cobranças não pagas.
- [ ] Desconto de faltas só em Mensal e Quinzenal, só para quem avisou "Não vou" no prazo.
- [ ] "A receber" inclui atrasados de meses anteriores.
- [ ] O passageiro nunca marca como pago; só avisa pelo WhatsApp.
- [ ] Sem banco de dados: só dados de exemplo.

Conferência técnica
- [ ] Testes automáticos passando.
- [ ] Build passando.

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
- [ ] 5. Excluir destino (com confirmação e aviso) e sair de um destino (passageiro).
- [ ] 6. Excluir minha conta nos dois perfis (LGPD), com confirmação clara.
- [ ] 7. Avisos no sininho (vanzeiro: pedido novo, resposta de passageiro, cobrança vencida; passageiro: prazo chegando, van saiu, cobrança vencendo).
- [ ] 8. Histórico de viagens do vanzeiro, com resumo de cada uma.
- [ ] 9. Mensagens de erro e confirmação em toda ação que não dá para desfazer.

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
**Situação:** a fazer.
- [ ] 1. Toda tela lê e grava dados só por funções em `src/lib/`.
- [ ] 2. Data e hora atuais de uma única função.
- [ ] 3. Todo dado leva o identificador do vanzeiro dono.
- [ ] 4. Usuário logado e papel num lugar só.
- [ ] 5. Códigos de convite que não se repetem.
- [ ] 6. Testes para todas as regras da seção 6.
- [ ] 7. `docs/banco-de-dados.md` com os dados e quem vê o quê (só o documento).

## Etapa D — Acabamento visual
**Situação:** a fazer.
- [ ] Espaços vazios das telas da viagem.
- [ ] Nenhum Início rola.
- [ ] Todos os textos em português simples.
- [ ] Mesmas palavras e cores em todo o app.

---

## Pendências que dependem do dono do projeto
- [ ] Contato do responsável para a Política de Privacidade (nome, e-mail, telefone). Hoje está "(a definir)".
- [ ] Dados reais do vanzeiro do piloto (rotas, horários, van, Pix).
- [ ] Revisão dos Termos e da Política por um advogado antes de lançar ao público.
- [ ] Respostas às 15 decisões pendentes da seção 7 de `docs/fonte-da-verdade.md` (inclui as dúvidas da Etapa A).
