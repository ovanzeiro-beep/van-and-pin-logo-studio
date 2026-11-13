# Fonte da verdade — O Vanzeiro

**O que é este arquivo:** a descrição de como o app está hoje e de como ele deve ser. Tela por tela, regra por regra, número por número. Escrito em 13/11/2026, depois de ler todo o código e abrir todas as telas, sem corrigir nada.

**Como ele convive com os outros dois arquivos:**

| Arquivo | Responde |
| --- | --- |
| `CLAUDE.md` | Como trabalhar (regras de ouro, ciclo, etapas). |
| `docs/contraprova.md` | O que já foi feito e o que falta (checklist). |
| `docs/fonte-da-verdade.md` (este) | O que o app é: o que cada tela faz, cada regra, cada número, cada palavra. |

Quando este arquivo e o código discordarem, o certo é o que está aqui, depois de o dono do projeto aprovar. Quando uma decisão da seção 7 for tomada, ela entra aqui e sai da lista.

---

## 0. A situação de referência (os dados de exemplo)

Sem banco de dados, o app vive de exemplos. "Hoje" é **sexta-feira, 13/11/2026, 05:10**, sempre. Tudo o que se vê nasce disso:

- **O vanzeiro de exemplo:** Carlos Pereira, (43) 99955-1234, Pix `carlos.vanzeiro@email.com`, Sprinter ABC-1D23.
- **Três destinos:**
  - **Jacarezinho → Londrina**, rota fixa, sex/sáb/dom, saída 06:00, volta 18:30, parada em Santo Antônio da Platina, código VAN-4821, confirmar até 1 h antes. **Hoje tem viagem; o prazo (05:00) já fechou.** 6 passageiros, 2 pedidos para entrar (Larissa e João Vitor).
  - **Cambará → UENP Jacarezinho**, rota fixa, seg a sex, saída 06:40, volta 17:50, parada em Jacarezinho, código VAN-3175, confirmar até 1 h antes. **Hoje tem viagem; o prazo (05:40) ainda está aberto.** 6 passageiros.
  - **Jacarezinho → Beto Carrero World**, viagem avulsa em sáb 28/11, saída 04:30, volta 19:00, paradas em Curitiba e Joinville, código VAN-9064, confirmar na noite anterior às 20h. 4 passageiros.
- **A passageira de exemplo:** Juliana Alves, que está em dois destinos (Cambará → UENP, mensal R$ 280, e Jacarezinho → Londrina, mensal R$ 180).
- **Respostas de hoje:** só para a viagem de Cambará: Gabriel, Fernanda e Thiago disseram "Vou"; Camila disse "Não vou"; Juliana e Rafael não responderam. Para Londrina: Mariana, Pedro, Ana e Lucas disseram "Vou"; Beatriz e Juliana (Londrina) não responderam.
- **Histórico:** as cobranças começam em 01/10/2026. Tudo o que venceu até 31/10 está pago por Pix no dia do vencimento. Em novembro há algumas pagas, algumas vencidas e uma cancelada ("Dia de cortesia").

**Recarregar a página volta tudo aos exemplos.** Isso é esperado enquanto não há banco.

**Quem usa "Entrar"** vê o painel do Carlos e o painel da Juliana. **Quem usa "Criar conta"** nasce sem nada: como vanzeiro, painel vazio (se "Sou vanzeiro" for a primeira escolha); como passageiro, a tela do código de convite.

---

## 1. As telas de acesso (antes de escolher o painel)

### 1.1 Abertura (`/`)
Logo, nome "O Vanzeiro", frase "Sua van organizada, do embarque à cobrança." e uma barra que se enche. Depois de 2,6 segundos, ou ao tocar em qualquer lugar, abre **Entrar**.

### 1.2 Entrar (`/entrar`)
- Campos: E-mail, Senha. Link "Esqueci minha senha". Botão **Entrar**. Divisor "ou". Botão **Entrar com Google**. Rodapé "Ainda não tem conta? Criar conta".
- O que faz: os dois botões abrem **"Como você vai usar o app?"** sem conferir nada (não há login real). Entrar por aqui mantém os dados de exemplo.
- Vazio/erro: não existe. Nenhuma mensagem de e-mail ou senha errada.

### 1.3 Criar conta (`/criar-conta`)
- Campos: Nome, E-mail, Senha (mínimo 8, com o olhinho para mostrar), Confirmar senha (com olhinho), caixinha "Li e aceito os Termos de Uso e a Política de Privacidade" (os dois são links). Botão **Criar conta**. Divisor "ou". Botão **Continuar com Google**. Rodapé "Já tem conta? Entrar".
- Regras: os dois botões ficam apagados até marcar a caixinha. Ao tocar em Criar conta, cada campo errado mostra uma mensagem curta ("Digite seu nome", "E-mail inválido", "A senha precisa ter pelo menos 8 caracteres", "As senhas não são iguais", "Digite a senha de novo"). O que foi digitado fica guardado enquanto a pessoa vai ler os Termos e volta.
- O que faz: cria uma **conta nova** e abre "Como você vai usar o app?". Pelo Google, a conta nasce sem nome.

### 1.4 Esqueci minha senha (`/esqueci-senha`)
Campo E-mail e botão **Enviar link**. Com e-mail válido, mostra "Se esse e-mail tiver conta, você vai receber um link para criar uma senha nova" e o botão **Voltar para Entrar**. Nada é enviado de verdade.

### 1.5 Como você vai usar o app? (`/como-vai-usar`)
Dois cartões: **Sou vanzeiro** (azul, em destaque) e **Sou passageiro**. Texto: "Você poderá mudar isso depois no seu perfil." Também é a tela de **trocar de perfil**, vinda do Perfil dos dois painéis.
- "Sou vanzeiro" numa conta nova (primeira escolha): o painel do vanzeiro começa vazio, com o nome da pessoa.
- "Sou passageiro" numa conta nova: abre "Entrar na van".

### 1.6 Termos de Uso (`/termos`) e Política de Privacidade (`/privacidade`)
Cabeçalho azul com **Voltar** e o selo "Versão provisória", depois seções em cartões. Rolam a tela inteira (é texto; esperado).
- Os Termos dizem que "durante a viagem, a localização da van é mostrada aos passageiros" e que a pessoa "pode pedir para apagar a conta". **As duas coisas ainda não existem no app** (GPS é do "Depois"; excluir conta é o item 6 da Etapa B).
- A Política lista os dados guardados, explica as estatísticas de visitas do Lovable e as fontes do Google, e tem o **contato do responsável como "(a definir)"** (pendência do dono do projeto).

### 1.7 Telas de erro
"404 — Página não encontrada" (botão Voltar ao início) e "Esta tela não carregou" (Tentar de novo / Voltar ao início). Dentro dos painéis: "Destino não encontrado — Ele pode ter sido apagado" (Ver destinos), "Passageiro não encontrado" (Voltar ao destino) e "Cobrança não encontrada".

---

## 2. O painel do vanzeiro

**Cabeçalho (igual em todas as abas):** bolinha com a inicial, saudação ("Bom dia" / "Boa tarde" / "Boa noite", **pelo relógio do celular**, não pela hora dos exemplos), primeiro nome do perfil, título da tela, subtítulo e o **sininho**, que mostra o número de pedidos para entrar e abre a tela Pedidos. Com zero pedidos, o sininho fica sem número.

**Barra de baixo:** Início · Destinos · Viagem · Financeiro · Perfil.

**Sem nenhum destino (conta nova):** Início, Destinos, Viagem e Financeiro mostram a mesma tela: "Você ainda não tem destinos.", a ajuda "Como funciona" em 3 passos (Crie um destino → Convide os passageiros → Faça a viagem) e o único botão **Crie seu primeiro destino**.

### 2.1 Início (`/vanzeiro`)
Resumo do dia em três cartões e um botão. Não rola num celular comum (no Android 360 × 740 rola 26px; no iPhone SE, 77px).

1. **Viagem de hoje** (toque abre a aba Viagem): nome do destino, a van (modelo · placa), selo âmbar "Às HH:MM", linha "Saída HH:MM · Volta HH:MM/Sem volta". Qual viagem: a mesma da aba Viagem (a escolhida lá, ou a primeira do dia por horário). Destino pausado nunca aparece. **Sem viagem hoje:** "Nenhuma viagem hoje" e "Próxima: Sex, 20 de nov, Jacarezinho → Ourinhos" (ou "Nenhuma viagem marcada.").
2. **Passageiros confirmados:** "3 de 6", barra verde, selos "3 confirmados" / "2 sem resposta" / "1 não vão". Conta todos os passageiros do destino de hoje. **Sem passageiros:** "Nenhum passageiro ainda — Toque para convidar pelo código de convite." (toque abre o destino). Some quando não há viagem hoje.
3. **Valores a receber** (toque abre o Financeiro): "R$ 1.811,00", "Total a receber" e três contagens: Pagos 9 · Pendentes 6 · Devendo 6. São os números do mês (ver seção 5).
4. Botão amarelo **Novo destino**.

Limites de hoje: o Início **não acompanha a viagem** (depois de encerrada, continua "Às 06:40" e "3 de 6"); e com duas viagens no dia mostra a escolhida na aba Viagem, que começa sendo a das 06:40 (Cambará), não a das 06:00.

### 2.2 Destinos — lista (`/vanzeiro/destinos`)
Botão **Novo destino** no cabeçalho. Lista rolável de cartões: tipo (Rota fixa / Viagem avulsa), nome "Origem → Destino", "dias · saída HH:MM", selo **Ativo** (verde) ou **Pausado** (cinza, cartão esmaecido), e "N passageiros". Toque abre o detalhe. Destino novo entra no topo.

### 2.3 Novo destino e Editar destino (`/vanzeiro/destinos/novo`, `/vanzeiro/destinos/editar/ID`)
Formulário em passos ("Passo X de 3" + Resumo), com Voltar e Continuar/Salvar fixos embaixo. Continuar só liga quando o passo está completo.
- **Passo 1 — "De onde sai e para onde vai?":** De onde sai?, Para onde vai?, tipo (Rota fixa "Repete toda semana" / Viagem avulsa "Uma data só").
- **Passo 2 — "Quando e em que horário?":** dias da semana (rota fixa) ou data (avulsa); "Tem volta?" Sim/Não; Saída da ida e Horário da volta (lado a lado quando tem volta); **Confirmar até:** 30 min antes / 1 h antes (padrão) / 2 h antes / Noite anterior, 20h.
- **Passo 3 — "Por onde a van passa?":** o caminho desenhado (Saída, Paradas, Chegada) com Subir, Descer e Remover em cada parada, e o campo "Nova parada" + Adicionar.
- **Resumo — "Confira antes de salvar":** tipo, nome, Dias/Data, Ida, Volta, Confirmar até, caminho. Botão **Salvar destino**.
- Ao salvar um destino novo: nasce **Ativo**, com um **código VAN-NNNN sorteado** (hoje pode repetir, ver 7.11). Editar mantém o código e o estado. Voltar no passo 1 sai sem salvar, sem perguntar.

### 2.4 Detalhe do destino (`/vanzeiro/destinos/ID`)
Cabeçalho com o nome e o botão "Todos os destinos". Rola a tela inteira, com o cabeçalho junto. Cartões, em ordem:
1. **Como funciona:** selo Ativo/Pausado, Tipo, Dias (ou Data), Saída da ida, Volta, Confirmar até.
2. **Caminho:** Saída → Paradas → Chegada.
3. **Código de convite:** o código grande, **Copiar** (vira "Copiado" por 2 s), "Envie para quem quer entrar nesta rota." e **Enviar pelo WhatsApp** (abre o WhatsApp com a mensagem "Oi! Para entrar na minha van (Origem → Destino), abra o app O Vanzeiro e use o código VAN-NNNN.").
4. **Pedidos para entrar** (só aparece se houver): borda amarela, contador, cada pedido com nome, telefone, **Aceitar** (abre o cadastro de passageiro já com nome e telefone) e **Recusar** (o pedido some na hora, sem perguntar).
5. **Passageiros deste destino:** "N passageiros" ou "Nenhum passageiro ainda."; lista com inicial, nome, "cidade · endereço", "Plano · R$ valor"; botão **Adicionar passageiro**.
6. **Editar** e **Pausar / Ativar** (troca na hora, sem confirmação). Pausado: some das viagens do dia e do Início; passageiros e cobranças continuam. **Não existe "Excluir destino"** (item 5 da Etapa B).

### 2.5 Novo passageiro e Editar passageiro (`.../passageiros/novo`, `.../passageiros/ID/editar`)
Mesmos passos do destino.
- **Passo 1 — "Nome e WhatsApp.":** no cadastro novo, dois botões: **Passageiro novo** ou **Já é meu passageiro** (abre uma lista com as pessoas que estão em outros destinos; nome e telefone vêm travados). Nome do passageiro; Telefone (WhatsApp) "Com DDD" (10 ou 11 números). Vindo de um pedido, nome e telefone já vêm preenchidos.
- **Passo 2 — "Onde a pessoa embarca?":** a cidade, escolhida entre os pontos do caminho do destino (origem, paradas e destino), e o endereço ou ponto de embarque.
- **Passo 3 — "Como a pessoa paga?":** plano (Por viagem "Ida + volta: 1 cobrança, mesmo noutro dia." / Diário "1 cobrança por dia que embarcou." / Quinzenal "A cada 15 dias" / Mensal "Uma vez por mês"); valor (aceita vírgula); Dia do vencimento (1 a 31, só quinzenal e mensal); **Descontar faltas?** Não (padrão) / Sim, com a frase "Só desconta quem avisar 'Não vou' dentro do prazo." e, no Sim, "Valor de cada falta".
- **Resumo:** destino, nome, telefone, Embarca em, Plano, Vencimento, "Desconta faltas: R$ X por falta" ou "Não desconta faltas". Botão **Salvar passageiro**.
- Ao salvar: mensal e quinzenal ganham na hora a **próxima cobrança** (o primeiro vencimento de hoje em diante). Vindo de um pedido, o pedido sai da lista e a pessoa passa a ver o painel dela. A mesma pessoa não entra duas vezes no mesmo destino (o app simplesmente não salva, sem avisar). Editar e **mudar o plano** cria a próxima cobrança do plano novo; as antigas ficam como estão.

### 2.6 Detalhe do passageiro (`.../passageiros/ID`)
Cabeçalho com o nome e o botão com o nome do destino (volta). Rola a tela inteira.
1. **Contato e embarque:** WhatsApp, "Embarca em" cidade e endereço.
2. **Plano de pagamento:** plano e valor, Vencimento "Todo dia N" (quando tem), Desconto de faltas "R$ X por falta" ou "Não".
3. **Destinos deste passageiro:** um link por destino em que a pessoa está, com plano e valor.
4. **Pagamentos:** "Deve no total" (verde se zero, vermelho se algo venceu, âmbar se só pendente) e a lista das cobranças da pessoa, da mais nova para a mais velha. Vazio: "As cobranças aparecem quando a pessoa embarcar." (Por viagem/Diário) ou "Nenhuma cobrança ainda."
5. **Chamar no WhatsApp**, **Editar**, **Remover deste destino** (pergunta "Remover Fulano? A pessoa sai da lista de passageiros de Origem → Destino." Cancelar/Remover). Ao remover, **as cobranças ficam** (continuam no Financeiro e no "A receber"; ver 7.2).

### 2.7 Pedidos para entrar (`/vanzeiro/pedidos`)
Abre pelo sininho. Lista todos os pedidos de todos os destinos: nome, telefone, "Quer entrar em Origem → Destino", **Aceitar** / **Recusar**. Vazio: "Nenhum pedido novo — Quando alguém usar o seu código de convite, aparece aqui." + **Ver destinos**.

### 2.8 Viagem (`/vanzeiro/viagem`)
A tela de dentro da van. Uma viagem de cada vez. Subtítulo "Hoje, sex, 13 de nov".

**Antes de sair:** se há mais de uma viagem hoje, dois botões no alto para escolher (06:00 Jacarezinho → Londrina / 06:40 Cambará → UENP), com o selo "Feita" na que já acabou. Cartão "Viagem de hoje" com "Saída · volta" e o selo verde "N vão". Depois, três listas: **Quem vai · na ordem da busca** (numerada; a ordem é a das cidades no caminho; dentro da mesma cidade, a ordem em que foram cadastrados), **Sem resposta** e **Não vão**. Botão **Iniciar viagem** (apagado se ninguém vai). Sem passageiros no destino: "Este destino ainda não tem passageiros." + **Convidar passageiros**. Sem viagem hoje: "Nenhuma viagem hoje — Próxima: Sáb, 28 de nov" + **Ver destinos**.

**Ao tocar Iniciar viagem:** as respostas daquela viagem **fecham** (ninguém mais muda "Vou"/"Não vou"), quem disse "Não vou" no prazo tem a **falta registrada** (vale desconto se o plano desconta), e a lista "Quem vai" vira a ordem da busca. Quem não respondeu **não entra**.

**Fases, uma tela por momento** (o título do cabeçalho muda):
1. **Buscando passageiros:** "X de Y embarcados" com barra (e "N faltou" em vermelho); cartão "Próximo passageiro" (nome, endereço, cidade, "1º de 3", **Abrir no mapa** — abre o Google Maps com o endereço e a cidade); botões **Embarcou** (verde) e **Não estava no ponto** (vermelho); embaixo, **Fazer parada**. Quando todos foram tratados: "Todos buscados — seguir para o destino" e o botão **Cheguei ao destino**.
2. **Parada:** "Parada em andamento — Antes de seguir, você confere quem está na van." e **Retomar viagem**. Se ninguém está a bordo, retomar volta direto para a busca.
3. **Conferência:** "X de Y conferidos"; um cartão por pessoa a bordo (vermelho = "Falta conferir", verde = "Na van", apagado = "Ficou aqui"), cada um com **Está na van** e **Ficou aqui**; embaixo da pessoa, "Confirmou pelo celular" ou "Conferido pelo vanzeiro". **Seguir viagem** só liga com todos conferidos ("Confira todos para seguir."). Quem "ficou" sai das próximas conferências e da volta.
4. **Chegou ao destino:** resumo da ida (Embarcaram X de Y; Não estavam no ponto, com os nomes; Paradas) e **Iniciar volta** (ou **Encerrar viagem**, se o destino não tem volta).
5. **Conferência da volta:** quem embarcou na ida e não ficou pelo caminho; mesmos botões. Se ninguém fica "Na van", a viagem encerra.
6. **Levando de volta:** "X de Y deixados em casa"; "Próxima descida" na **ordem inversa** da busca, com Abrir no mapa; botão **Desceu**; **Fazer parada** (com conferência igual).
7. **Viagem encerrada:** resumo (Ida; Volta "Levados para casa" e Paradas; "Ficaram (desceram de propósito)" com nomes) e **Voltar ao início**. A viagem fica marcada como "Feita" e não pode ser refeita nem desfeita. Não existe histórico de viagens (item 8).

Durante a viagem, trocar de aba e voltar não perde nada. Não há como **desfazer** um toque errado (Embarcou / Não estava).

**O que a viagem manda para o Financeiro:** "Embarcou" cria a cobrança do dia para Por viagem e Diário (uma só por viagem/dia); "Não vou" no prazo, ao iniciar, soma uma falta na próxima cobrança em aberto de quem tem desconto. "Não estava no ponto" e "sem resposta" **não mexem** em dinheiro.

### 2.9 Financeiro (`/vanzeiro/financeiro`)
Subtítulo "Resumo de novembro." Três cartões fixos: **A receber** R$ 1.811,00 · **Recebido** R$ 663,00 · **Devendo** R$ 631,00. Filtros **Todas / Pendentes / Devendo / Pagas**. Lista rolável, do vencimento mais novo para o mais velho: nome, destino, referência ("Mensalidade de novembro", "Quinzena de 15/11 a 29/11", "Diária de 12/11", "Viagem de 08/11"), valor, selo da situação, e a linha da data ("Vence em 20/11", "Vence hoje", "Venceu em 05/11", "Vencimento 10/11 · Pago em 10/11 · Pix", "Vencimento 07/11 · Cancelada em 08/11"). Cobrança cancelada aparece esmaecida e riscada. Vazios: "Nenhuma cobrança ainda. — O app cria as cobranças sozinho, pelo plano de cada passageiro." + **Ver destinos**; filtros vazios ("Nenhuma cobrança pendente.", "Ninguém devendo. Muito bem!", "Nenhuma cobrança paga ainda.") + **Ver todas**.

### 2.10 Cobrança (`/vanzeiro/financeiro/ID`)
Cabeçalho com a referência e **Voltar**. Valor grande (riscado se cancelada), selo, Passageiro, Destino, Vencimento, "Pago em DD/MM · forma" (fundo verde) ou "Cancelada em DD/MM — Motivo: ...". Cartão **Desconto de faltas** quando a cobrança tem período de faltas: "Mensalidade R$ 280,00 / 2 faltas × R$ 15,00 − R$ 30,00 / Total R$ 250,00", a frase da conta e "Faltas contadas de 11/10 a 10/11." (ou "Nenhuma falta neste período."). Só em cobrança pendente ou devendo: **Marcar como pago** (pergunta "Como foi pago?" Dinheiro / Pix → **Confirmar pagamento**; a data do pagamento é hoje), **Cobrar no WhatsApp** (mensagem pronta com valor e vencimento, dizendo "que venceu" se já venceu) e **Cancelar cobrança** (pede o motivo, obrigatório, até 60 letras; o botão de desistir se chama "Voltar" para não confundir). Paga ou cancelada: só leitura.

### 2.11 Perfil (`/vanzeiro/perfil`)
**Você:** Nome, Telefone, "Chave Pix (os passageiros veem esta)". **Sua van:** modelo e "Placa X". Conta nova mostra "Não informado". **Editar:** nome, telefone, chave Pix, modelo e placa, todos obrigatórios, Cancelar/Salvar; o nome novo vai para o cabeçalho e o Pix novo para o passageiro. **Trocar para passageiro**, **Termos de Uso**, **Política de Privacidade**, **Sair** (pergunta "Quer mesmo sair? Você volta para a tela Entrar."). Não existe "Excluir minha conta" (item 6). Rola um pouco (o "Sair" fica cortado num celular comum).

---

## 3. O painel do passageiro

**Cabeçalho:** inicial, saudação, primeiro nome, título, subtítulo e o **sininho com uma bolinha amarela sempre acesa, que não faz nada** (os avisos são o item 7).

**Barra de baixo:** Início · Viagens · Pagamentos · Perfil. Só aparece quando a pessoa está em alguma van.

### 3.1 Entrar na van (quem ainda não está em nenhuma van)
- **Código:** "Digite o código de convite da sua van.", campo grande (aceita "VAN-4821", "van 4821" ou só "4821"), **Procurar van**. Errado: "Código não encontrado". Embaixo, no primeiro uso, "Onde consigo o código? — Peça ao seu vanzeiro. Ele envia o código pelo WhatsApp." Link **Sair** (sai direto para Entrar, sem perguntar).
- **Van encontrada:** cartão com o vanzeiro, o destino, dias e saída; Seu nome; Seu WhatsApp; **Pedir para entrar**; **Usar outro código**.
- **Aguardando o vanzeiro aceitar:** "Assim que ele aceitar, o seu painel abre aqui." e o cartão da van. Quando o vanzeiro aceita, o painel abre sozinho.
- **O vanzeiro não aceitou o pedido:** "Fale com ele ou tente outro código." + **Tentar outro código**.

### 3.2 Início (`/passageiro`)
Três cartões. Não rola num celular comum.
1. **Próxima viagem** (destino, "Hoje, 13 de nov · saída 06:00", selo Vou / Não vou / Confirmar): a linha do prazo muda com a situação — "Confirme até 05:40" (âmbar, sem resposta e prazo aberto), "Dá para mudar até 05:40" (já respondeu), "Prazo encerrado. Você respondeu: Vou", "Prazo encerrado — a van não vai passar" (vermelho, sem resposta), "A viagem já começou."; botões **Vou** / **Não vou** enquanto o prazo está aberto; **Falar com o vanzeiro** (WhatsApp) quando perdeu o prazo. **Qual viagem aparece:** a primeira dos próximos 7 dias, por data e horário. Por isso a Juliana vê Londrina (06:00, prazo fechado, "a van não vai passar") e não Cambará (06:40, que ainda dá para confirmar) — ela só acha essa na aba Viagens. **Durante uma conferência**, este cartão dá lugar ao aviso "Conferência da van — você está na van?" com **Estou na van**, e depois "Confirmado — boa viagem!".
2. **Situação da van** (placa no selo; verde, ou vermelho quando é alerta) com a barra "Saiu da garagem / A caminho / No seu ponto". Textos possíveis: "Aguardando o dia da viagem — Próxima viagem: ...", "Aguardando a saída — A van sai às 06:40", "Você não vai hoje — O vanzeiro já sabe", "A van não vai passar — Você não confirmou a tempo", "Viagem começou — Faltam 2 pessoas antes de você", "Você é o próximo — Fique pronto no seu ponto", "Na van — Boa viagem!", "Você não estava no ponto — A van passou e seguiu viagem", "Viagem encerrada — Até a próxima!". Tudo segue a aba Viagem do vanzeiro, na hora.
3. **Valor em aberto:** soma de tudo o que não está pago, em todos os destinos; embaixo, a cobrança mais próxima de vencer ("Mensalidade de novembro · vence em 20/11") e o selo dela; "Tudo pago. Obrigado!" quando é zero.

### 3.3 Viagens (`/passageiro/viagens`)
**Próximos 7 dias:** um cartão por viagem de cada destino (dia, destino, saída, selo, linha do prazo, Vou/Não vou enquanto aberto). Vazio: "Nenhuma viagem nos próximos 7 dias. A próxima é sáb, 28 de nov." e, se o histórico também está vazio, **Falar com o vanzeiro**. **Histórico:** os últimos 14 dias e hoje (quando a viagem já tem o resultado da pessoa), cada dia com **Embarcou** (verde) ou **Faltou** (vermelho). Por viagem e Diário mostram só os dias em que embarcaram; mensal e quinzenal mostram todos os dias de viagem como "Embarcou", menos os dias de falta. Vazio: "Suas viagens feitas aparecem aqui."

### 3.4 Pagamentos (`/passageiro/pagamentos`)
Cartão **Você deve** (soma; "Soma das cobranças ainda não pagas." ou "Tudo pago. Obrigado!") e a lista de todas as cobranças da pessoa, de todos os destinos (destino, referência, valor, selo, data e, quando há desconto, a conta). Vazio: "Nenhuma cobrança ainda. — Quando houver, ela aparece aqui." + **Falar com o vanzeiro**.

### 3.5 Minha cobrança (`/passageiro/pagamentos/ID`)
Igual à do vanzeiro, sem o nome e sem as ações dele. Em cobrança pendente ou devendo: **Pagar com Pix** (mostra "Chave Pix de Carlos Pereira", com **Copiar**), **Já paguei — avisar o vanzeiro** (WhatsApp com a mensagem "Já paguei a mensalidade de novembro da van, no valor de R$ 280,00. Pode conferir e marcar como pago?") e o aviso "Quem marca como pago é o vanzeiro, depois de conferir." A pessoa só abre as próprias cobranças.

### 3.6 Perfil (`/passageiro/perfil`)
**Você:** Nome, Telefone e, para cada destino, "Destino" e "Onde embarca". **Seu vanzeiro:** nome, van, **Chamar no WhatsApp**. **Editar** (nome, telefone, um "Onde embarca" por destino; cidade, plano e valor não mudam; Cancelar/Salvar). **Entrar em outro destino**. **Trocar para vanzeiro**, Termos, Política, **Sair** (com confirmação). Rola a tela inteira. Não existe "Sair de um destino" (item 5) nem "Excluir minha conta" (item 6).

### 3.7 Entrar em outro destino (`/passageiro/entrar-destino`)
Mesma tela do código, com "Voltar ao perfil". Avisa "Você já está neste destino." quando é o caso. Depois de pedir, mostra "Aguardando o vanzeiro aceitar" ali mesmo. Se o vanzeiro recusa, **não há aviso**: a tela volta ao campo do código. Para uma pessoa que **entrou por conta nova e pedido** (não a Juliana dos exemplos), pedir um segundo destino **quebra o painel**: a pessoa cai em "Entrar na van / Aguardando" sem a barra de baixo, como se não estivesse em van nenhuma (confirmado no app).

---

## 4. As regras da seção 6, conferidas no código

Legenda: **Certa** = funciona como a regra diz. **Diferente** = funciona, mas não exatamente assim. **Faltando** = ainda não existe.

### Acesso
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Cadastro com e-mail e senha (com confirmar) ou Google, os dois com aceite dos Termos e da Política | **Certa** | Botões apagados sem a caixinha; senha mínima 8; confirmar precisa ser igual. Login real não existe (esperado). |
| Escolher vanzeiro ou passageiro, com troca no Perfil | **Certa** | "Como você vai usar o app?" e "Trocar para ..." nos dois Perfis. |

### Destinos
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Rota fixa (dias) ou avulsa (data); ida, volta opcional, paradas em ordem | **Certa** | Passos 1 a 3 do destino. |
| Cada destino tem um código de convite | **Certa, com ressalva** | "VAN-" + 4 números sorteados. **Pode repetir** entre destinos (ver 7.11; é o item 5 da Etapa C). |
| Prazo "Confirmar até", padrão 1 hora antes | **Certa** | 30 min / 1 h / 2 h / noite anterior às 20h. Exemplo: saída 06:40 → prazo 05:40. |

### Passageiros
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Entram pelo código; o vanzeiro aceita ou recusa | **Certa** | Aceitar abre o cadastro com nome e telefone; Recusar apaga o pedido na hora, sem confirmação. |
| O vanzeiro também cadastra direto | **Certa** | "Adicionar passageiro" no destino. |
| Uma pessoa em mais de um destino, com plano e valor próprios | **Certa, com uma falha** | Juliana tem dois planos. "Já é meu passageiro" reaproveita a pessoa. **Falha:** passageiro de conta nova que pede um segundo destino perde o painel (3.7). |

### Confirmação
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Responde Vou/Não vou até o prazo e pode mudar até lá | **Certa** | Depois do prazo, ou depois que a viagem começou, o app não aceita mais resposta. |
| Quem não confirmar até o prazo não entra na busca | **Certa, com ressalva** | A lista da busca é montada quando o vanzeiro toca **Iniciar viagem**, e ele **pode iniciar antes do prazo** (hoje, às 05:10, pode iniciar a das 06:40, cujo prazo é 05:40). Nesse caso quem ainda ia responder perde a vez. Ver 7.1. |

### Viagem
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Busca na ordem das paradas, com Embarcou / Não estava no ponto | **Certa** | A ordem é pela **cidade** no caminho; dentro da mesma cidade, pela ordem de cadastro (a ordem das ruas é do GPS, "Depois"). |
| Em toda parada, só segue com todos conferidos | **Certa** | "Confira todos para seguir." Se ninguém está a bordo, não há conferência. |
| O passageiro confirma "Estou na van" pelo celular; o vanzeiro também marca; "Ficou aqui" só o vanzeiro | **Certa** | O toque do vanzeiro vale mais que o do celular. Depois que o vanzeiro marcou, o celular não muda mais. |
| Volta na ordem inversa, com Desceu | **Certa** | A volta começa com uma conferência de quem embarcou no destino. |
| (não está na regra) | **Faltando** | Não dá para desfazer um toque errado. Não há histórico de viagens (item 8). |

### Dinheiro
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| Planos: Por viagem (ida e volta contam como uma), Diário, Quinzenal, Mensal | **Certa** | Por viagem: uma cobrança por viagem, mesmo que a volta seja noutro dia; duas viagens no mesmo dia cobram duas vezes. Diário: uma por dia, mesmo com duas viagens no dia. |
| O app cria as cobranças sozinho | **Certa, com duas ressalvas** | (a) **Por viagem e Diário vencem no próprio dia do embarque**; no dia seguinte, sem pagar, já ficam "Devendo" (ver 7.8). (b) Hoje as cobranças futuras de mensal/quinzenal nascem só nos exemplos e ao salvar o passageiro; **não existe quem crie a do mês seguinte quando o tempo passar** (não há relógio). É assunto da Etapa C (ver 7.9). |
| Quinzenal | **Diferente** | "A cada 15 dias" é contado a partir do dia do vencimento: Pedro (dia 15) vence em 15/10, 30/10, **14/11, 29/11, 14/12**... As datas vão andando; não é "dia 15 e dia 30". Ver 7.10. |
| Mensal | **Certa** | Um vencimento por mês no dia escolhido (dia 31 vira o último dia do mês). O nome é o mês do vencimento: "Mensalidade de novembro" vence 10/11 e cobre as faltas de 11/10 a 10/11. Ver 7.3. |
| Uma cobrança nunca é editada: só paga (Dinheiro/Pix) ou cancelada com motivo | **Certa** | Valor, nome e telefone ficam congelados na criação. |
| O total que alguém deve é a soma das não pagas | **Certa** | Cancelada não conta. |
| Desconto de faltas só em Mensal e Quinzenal, escolhido por passageiro | **Certa** | Por viagem e Diário nunca guardam desconto. |
| Só desconta quem avisou "Não vou" dentro do prazo | **Certa, com ressalva** | A falta só é **registrada quando o vanzeiro toca "Iniciar viagem"**. Se naquele dia ele não iniciar a viagem no app, ninguém ganha desconto. Ver 7.7. O desconto entra na próxima cobrança ainda não vencida; cobrança vencida, paga ou cancelada nunca muda. |
| "A receber" inclui atrasados de meses anteriores | **Certa** | Soma pendentes e devendo do mês + qualquer devendo mais antiga. |
| O passageiro paga direto e nunca marca como pago; só avisa pelo WhatsApp | **Certa** | "Pagar com Pix" só mostra a chave; "Já paguei — avisar o vanzeiro". |

### Regras do `CLAUDE.md` fora da seção 6
| Regra | Situação | O que foi visto |
| --- | --- | --- |
| O Início dos dois painéis nunca rola num celular comum | **Certa em 390 × 844; diferente em Android 360 × 740** | Início do vanzeiro rola 26px em 360 × 740 (o botão Novo destino some). iPhone SE: 77px (aceito). |
| Listas rolam só na lista; cabeçalho e barra parados | **Diferente em telas de detalhe** | Destinos, Financeiro, Pedidos, Viagem e Viagens rolam só na lista. Detalhe do destino, do passageiro, da cobrança e os dois Perfis rolam inteiros, com o cabeçalho junto. Ver 7.4. |
| Formulários longos em passos, sem rolagem | **Certa** | Destino e passageiro em 3 passos + resumo. No iPhone SE, o passo 3 do destino com 3+ paradas e o resumo rolam um pouco; o Editar do Perfil do vanzeiro rola 59px. |

---

## 5. Os números: como são calculados e onde aparecem

**As 32 cobranças de exemplo** (vencimento, pessoa, referência, valor, situação):

| Situação | Quantas | Quais |
| --- | --- | --- |
| **Pagas em outubro** | 10 | Beatriz, Fernanda (2), Mariana, Gabriel, Pedro (2), Juliana (2), Thiago |
| **Pagas em novembro** | 9 | Lucas 01/11 e 06/11, Fernanda 04/11 (R$ 130, com 1 falta), Ana 06/11, Rafael 09/11 e 10/11, Camila 09/11 e 11/11, Gabriel 10/11 |
| **Devendo** | 6 | Beatriz 05/11 R$ 280, Ana 08/11 R$ 45, Mariana 10/11 R$ 250 (2 faltas), Rafael 11/11 e 12/11 R$ 22 cada, Camila 12/11 R$ 12 |
| **Pendentes** | 6 | Pedro 14/11 R$ 150, Fernanda 19/11 R$ 140, Juliana 20/11 R$ 280 e R$ 180, Thiago 20/11 R$ 280, Pedro 29/11 R$ 150 |
| **Cancelada** | 1 | Lucas, Diária de 07/11, "Dia de cortesia" |

**Cada número do app:**

| Número | Como é calculado | Onde aparece |
| --- | --- | --- |
| **A receber** (R$ 1.811,00) | Pendentes do mês (R$ 1.180) + Devendo (R$ 631). Devendo mais antigo entra mesmo de outro mês. Cancelada nunca conta. | Financeiro (cartão) e Início do vanzeiro ("Valores a receber"). |
| **Recebido** (R$ 663,00) | Soma das pagas com vencimento neste mês. (Pagas em outubro não entram.) | Financeiro. |
| **Devendo** (R$ 631,00) | Soma das vencidas e não pagas, de qualquer mês. | Financeiro. É também o nome do selo vermelho de cada cobrança. |
| **Pagos 9 / Pendentes 6 / Devendo 6** | Contagem das cobranças do mês por situação (as mesmas regras acima). | Início do vanzeiro. **Não bate com o filtro "Pagas"** do Financeiro, que lista 19 (todas as pagas, de todos os meses). |
| **Deve no total** | Soma das não pagas daquela pessoa naquele destino (uma matrícula). | Detalhe do passageiro (vanzeiro). |
| **Valor em aberto** / **Você deve** (R$ 460,00 para a Juliana) | Soma das não pagas da pessoa **em todos os destinos** (280 + 180). | Início e Pagamentos do passageiro. São o mesmo número com dois nomes; o vanzeiro vê a mesma coisa como "Deve no total", mas por destino. |
| **Valor de uma cobrança com desconto** | Valor do plano − faltas × valor da falta, nunca abaixo de zero. Faltas: só "Não vou" no prazo, dentro do período (mensal: do dia seguinte ao vencimento anterior até o vencimento; quinzenal: os 15 dias), uma por dia. | Lista, detalhe e cartão "Desconto de faltas", nos dois painéis, com a mesma conta. |
| **Passageiros confirmados** ("3 de 6") | Entre os passageiros do destino de hoje: quantos disseram "Vou" / total. "Sem resposta" = total − vou − não vou. | Início do vanzeiro. A aba Viagem mostra as mesmas pessoas em listas ("3 vão"). |
| **"X de Y embarcados"**, **"N faltou"**, **"X de Y conferidos"**, **"X de Y deixados em casa"** | Contagens da viagem em andamento. Y da busca = quem disse "Vou". Y da volta = quem estava na van na conferência da volta. | Aba Viagem. |
| **Situação de uma cobrança** | Cancelada se tem cancelamento; Pago se tem pagamento; senão Devendo se o vencimento já passou, Pendente se não. "Vence hoje" ainda é Pendente. | Todos os selos. |
| **Sininho do vanzeiro** | Número de pedidos para entrar. | Cabeçalho. |

**Onde os números não batem (já apontados na revisão):** Início "9 Pagos" × Financeiro "Pagas" 19; "Boa noite" pelo relógio do celular enquanto o resto do app está em 05:10; Início mostrando a viagem das 06:40 enquanto a das 06:00 ainda não foi feita.

---

## 6. As palavras do app

| Palavra (seção 5) | Onde aparece certa | Onde está com outro sentido ou trocada |
| --- | --- | --- |
| **Vou / Não vou** | Botões e selos no Início e em Viagens do passageiro; listas "Quem vai" / "Não vão" na aba Viagem; "Você respondeu: Vou". | Início do vanzeiro: "1 **não vão**" (plural errado com 1). Selo **"Confirmar"** aparece em viagem cujo prazo já fechou, onde não dá mais para confirmar. |
| **Sem resposta** | Selo âmbar na aba Viagem e no Início do vanzeiro. | — |
| **Pendente** | Selo âmbar; filtro "Pendentes"; contagem no Início. | Selo âmbar "Às 06:40" no Início do vanzeiro usa a cor de pendente para um horário. |
| **Devendo** | Selo vermelho; filtro; cartão do Financeiro; contagem no Início. | Para o passageiro, o cartão chama-se "Você deve" mesmo quando nada venceu (só pendente), o que soa como "Devendo". |
| **Pago** | Selo verde; "Pago em DD/MM · Pix". | Mesmo conceito com três nomes no app: "Pago" (selo), "Pagas" (filtro), "Pagos" (Início) e "Recebido" (cartão). |
| **Embarcou / Não estava no ponto** | Botões da busca; resumo "Embarcaram" / "Não estavam no ponto". | Busca: "**1 faltou**" (e "2 faltou"): plural errado e palavra fora da lista. Histórico do passageiro: **"Faltou"** serve tanto para quem avisou "Não vou" no prazo quanto para quem não estava no ponto — são coisas diferentes (uma desconta, a outra não). |
| **Está na van / Ficou aqui** | Conferência (botões e estados "Na van" / "Ficou aqui"). | Resumo: "Ficaram (**desceram de propósito**)" aparece também para quem ficou no destino na volta. |

Outras palavras repetidas com sentido próximo, para decidir uma só: o valor devido do passageiro é "Valor em aberto" (Início), "Você deve" (Pagamentos) e "Deve no total" (vanzeiro); a volta diz "Levados para casa" (resumo) e "deixados em casa" (progresso); a barra da van termina em "No seu ponto", mas acende quando a pessoa já está **na van**. Os botões de WhatsApp têm quatro nomes por quatro ações diferentes, o que é correto: "Chamar no WhatsApp" (conversar), "Cobrar no WhatsApp" (lembrar do pagamento), "Enviar pelo WhatsApp" (o código) e "Falar com o vanzeiro" (passageiro). "Sair" hoje significa sair da conta; o item 5 vai criar "sair de um destino", que precisa de outro nome (ver 7.6).

Palavras que não são do Brasil ou são difíceis: "noutro dia" (plano Por viagem).

---

## 7. Decisões pendentes (para o dono do projeto responder)

As de 1 a 5 vêm da revisão (Etapa A). As outras apareceram nesta análise.

1. **Iniciar viagem antes do prazo.** Hoje o vanzeiro pode tocar "Iniciar viagem" a qualquer hora, e isso fecha as respostas na hora: às 05:10 ele inicia a das 06:40 (prazo 05:40) e quem ia responder passa a ver "a van não vai passar". Opções: (a) deixar como está; (b) só liberar o botão depois do prazo; (c) liberar antes, mas com um aviso "Ainda faltam N responder. Iniciar mesmo assim?".
2. **Cobranças de quem foi removido.** Quando o vanzeiro remove um passageiro do destino, as cobranças dele continuam (inclusive a mensalidade de 20/11, que ainda não venceu) e seguem contando no "A receber". Devem continuar, ou as que ainda não venceram devem ser canceladas sozinhas (com o motivo "Removido do destino")?
3. **Nome e período da mensalidade.** "Mensalidade de novembro" vence 10/11 e desconta as faltas de 11/10 a 10/11. Ou seja, o mês da mensalidade é o mês do vencimento, e as faltas são do período anterior a ele. Está certo assim, ou a mensalidade de novembro deveria cobrir as viagens de novembro?
4. **Telas de detalhe rolando inteiras.** Detalhe do destino, do passageiro, da cobrança e os dois Perfis rolam com o cabeçalho junto. Pode ficar assim (são telas de leitura), ou devem rolar só o conteúdo, com o cabeçalho parado?
5. **Duas viagens no mesmo dia e a viagem que acabou.** O Início mostra a viagem escolhida na aba Viagem; hoje a escolha nasce na das 06:40 e não na das 06:00. Sugestão: o Início mostra **a próxima que ainda não foi feita** e, quando todas acabaram, "Viagens de hoje feitas" com o resumo. Combinado?
6. **Excluir destino e sair de um destino (item 5 da Etapa B).** O que acontece com as cobranças **em aberto** (pendentes e devendo) do destino excluído, ou da pessoa que saiu? E as pagas ficam no histórico? Sugestão: pagas e canceladas ficam no histórico; devendo continuam a receber; pendentes são canceladas sozinhas com motivo. E o nome do botão do passageiro: "Sair deste destino" (para não confundir com "Sair" da conta).
7. **Falta só conta se a viagem for iniciada no app.** O desconto de "Não vou" no prazo é registrado quando o vanzeiro toca "Iniciar viagem". Se ele esquecer de iniciar naquele dia, ninguém ganha o desconto. Tudo bem, ou a falta deve contar no prazo, mesmo sem viagem iniciada?
8. **Por viagem e Diário vencem no dia do embarque.** No dia seguinte, sem pagar, a cobrança já aparece como "Devendo" (Ana, viagem de 08/11, por exemplo). É o combinado, ou deve haver alguns dias para pagar?
9. **Quem cria a cobrança do mês seguinte.** Hoje a próxima mensalidade/quinzena nasce só ao cadastrar (ou nos exemplos). Com o relógio real (Etapa C), o app vai precisar criar a próxima cobrança quando a atual vencer. Pode ser assim: ao vencer uma, nasce a próxima?
10. **Quinzenal com datas que andam.** Dia do vencimento 15 gera 15/10, 30/10, 14/11, 29/11, 14/12... Deve ser assim ("a cada 15 dias") ou "dia 15 e dia 30 de cada mês"?
11. **Código de convite repetido.** Hoje é sorteado e pode repetir. Vai ser único (item 5 da Etapa C). Só confirmar: o código é por destino (não por vanzeiro) e vale para sempre, sem trocar?
12. **Ordem da busca dentro da mesma cidade.** Hoje é a ordem de cadastro. Até o GPS chegar, o vanzeiro precisa poder arrumar a ordem na mão?
13. **Perfil do vanzeiro com tudo obrigatório.** Para salvar o Editar, Pix, modelo e placa são obrigatórios. Numa conta nova sem van ainda, pode continuar assim?
14. **Pausar sem confirmação.** "Pausar" tira o destino das viagens na hora. Precisa de confirmação (entra no item 9)?
15. **Os Termos prometem GPS e exclusão de conta.** O GPS fica para "Depois"; excluir conta é o item 6. Tudo bem os Termos já falarem disso, ou tirar até existir?

**Problemas novos encontrados (não são decisões; vão para a lista de correções):** o passageiro de conta nova que pede um segundo destino perde o painel (3.7); a recusa de um pedido de "outro destino" não avisa a pessoa; o cadastro silencioso quando a mesma pessoa já está no destino.

---

## 8. O que o banco de dados vai precisar guardar (só a lista)

Quando o dono do projeto mandar colocar o banco, é isto que ele precisa guardar. Nada disso é criado agora.

| Conjunto | O que guarda | Quem pode ver |
| --- | --- | --- |
| **Contas** | e-mail, senha (protegida) ou Google, nome, data de aceite dos Termos e da Política, data de criação. | Só a própria pessoa. |
| **Papéis** | qual painel a conta usa (vanzeiro, passageiro, os dois). | A própria pessoa. |
| **Vanzeiros** | nome, telefone, chave Pix, van (modelo, placa), e qual conta é. | O próprio vanzeiro; o passageiro vê nome, telefone, Pix e van do **seu** vanzeiro. |
| **Destinos** | vanzeiro dono, origem, destino, tipo, dias ou data, saída, volta, paradas em ordem, código de convite (único), prazo de confirmação, ativo/pausado. | O vanzeiro dono; o passageiro vê os destinos em que está. |
| **Passageiros por destino (matrículas)** | destino, pessoa (conta ou identidade), nome, telefone, cidade e endereço de embarque, plano, valor, dia do vencimento, desconta faltas, valor da falta, data de entrada e de saída. | O vanzeiro dono; a própria pessoa. |
| **Pedidos para entrar** | destino, pessoa, nome, telefone, situação (aguardando, aceito, recusado), datas. | O vanzeiro dono; a própria pessoa. |
| **Respostas** | matrícula, data da viagem, Vou/Não vou, hora da resposta, se foi no prazo. | O vanzeiro dono; a própria pessoa (só a dela). |
| **Viagens** | destino, data, fase, hora de início e de fim, número de paradas da ida e da volta. | O vanzeiro dono; o passageiro vê a situação da viagem do dia dele. |
| **Embarques e faltas** | viagem, matrícula, o que aconteceu (embarcou, não estava no ponto, desceu, ficou), hora. | O vanzeiro dono; a própria pessoa (histórico). |
| **Conferências** | viagem, parada, matrícula, está na van / ficou aqui, quem marcou (vanzeiro ou celular), hora. | O vanzeiro dono; a própria pessoa (só a dela). |
| **Cobranças** | matrícula, destino, nome e telefone na criação, tipo, referência, vencimento, valor, faltas, valor da falta, período das faltas, viagem (Por viagem). **Nunca editadas.** | O vanzeiro dono; a própria pessoa. |
| **Pagamentos** | cobrança, data, forma (Dinheiro/Pix), quem marcou. | O vanzeiro dono; a própria pessoa. |
| **Cancelamentos** | cobrança, data, motivo. | O vanzeiro dono; a própria pessoa. |
| **Avisos (item 7)** | para quem, tipo (pedido novo, resposta, cobrança vencida, prazo chegando, van saiu, cobrança vencendo), texto, data, lido ou não. | Só o destinatário. |
| **Exclusão de conta (item 6)** | pedido, data, o que foi apagado e o que ficou (cobranças por obrigação de registro). | Só a própria pessoa. |

**Regras de quem vê o quê:** cada vanzeiro só vê os dados dos seus destinos; cada passageiro só vê as próprias matrículas, respostas, cobranças e o vanzeiro de cada uma; ninguém vê dados de outro passageiro. Isso é o que a Política de Privacidade promete.

---

## 9. Resumo do que falta no app (os próximos itens, em uma linha cada)

- **Etapa B, item 5:** Excluir destino (com aviso do que acontece com passageiros e cobranças) e Sair de um destino (passageiro). Depende da decisão 6.
- **Item 6:** Excluir minha conta nos dois perfis.
- **Item 7:** Sininho com avisos de verdade, nos dois painéis.
- **Item 8:** Histórico de viagens do vanzeiro.
- **Item 9:** Confirmação em toda ação que não desfaz (Recusar pedido, Pausar, Sair da tela do código, Voltar no passo 1).
- **Etapa C:** relógio único, dados com o dono, usuário logado num lugar só, código único, testes das regras, `docs/banco-de-dados.md`.
- **Etapa D:** acabamento visual, rolagens, plurais e palavras (seção 6 acima).
