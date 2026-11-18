# Fonte da verdade — O Vanzeiro

> **Para executar uma etapa, comece pelo [roteiro de autorização e contraprova](#execucao-controlada).** Consulte o último registro em [contraprova.md](contraprova.md) antes de agir.

> **Comece aqui:** [controle atual, evidências e plano por etapas — seção 22](#controle-atual). Revisão iniciada em 17/11/2026, a pedido do dono. O app já tem integração com banco; os textos sobre protótipo sem banco são históricos.

**O que é este arquivo:** reúne a descrição das telas, as regras aprovadas e o acompanhamento do trabalho. O levantamento original foi registrado em 13/11/2026; as verificações daquela data não foram todas repetidas na revisão atual.

**Como ler (atualizado em 17/11/2026):** as seções 0 a 9 descrevem o app de 13/11; as seções 10 a 21 registram sua evolução. A seção 22 reúne a situação observada nesta revisão e o plano vigente. Uma regra aprovada não muda só porque o código está diferente; registre a divergência. Para a situação de uma entrega, use a evidência mais recente com data e versão, sem transformar uma marcação histórica em validação atual.

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

- **O vanzeiro de exemplo:** Carlos Pereira, (43) 99955-1234, Pix `carlos.vanzeiro@email.com`, Sprinter ABC-1D23. **Atualizado em 16/11:** a van tem 15 lugares para passageiros (seção 12).
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
- Os Termos dizem que "durante a viagem, a localização da van é mostrada aos passageiros" e que a pessoa "pode pedir para apagar a conta". **As duas coisas ainda não existem no app** (GPS é do "Depois"; excluir conta é o item 6 da Etapa B). **Atualizado em 16/11:** "Excluir minha conta" existe nos dois Perfis; os Termos foram reescritos na R1 (faltas e descontos, van lotada, onde embarca, regras das cobranças) e a Política na P3 (ponto no mapa, notificações, OpenStreetMap, cópia no celular). Falta o contato "(a definir)" e o advogado.
- A Política lista os dados guardados, explica as estatísticas de visitas do Lovable e as fontes do Google, e tem o **contato do responsável como "(a definir)"** (pendência do dono do projeto).

### 1.7 Telas de erro
"404 — Página não encontrada" (botão Voltar ao início) e "Esta tela não carregou" (Tentar de novo / Voltar ao início). Dentro dos painéis: "Destino não encontrado — Ele pode ter sido apagado" (Ver destinos), "Passageiro não encontrado" (Voltar ao destino) e "Cobrança não encontrada".

---

## 2. O painel do vanzeiro

**Cabeçalho (igual em todas as abas):** bolinha com a inicial, saudação ("Bom dia" / "Boa tarde" / "Boa noite", **pelo relógio do celular**, não pela hora dos exemplos), primeiro nome do perfil, título da tela, subtítulo e o **sininho**, que mostra o número de pedidos para entrar e abre a tela Pedidos. Com zero pedidos, o sininho fica sem número. **Atualizado em 16/11:** o número do sininho soma pedidos para entrar + mudanças de endereço para aprovar + avisos não lidos, e ele abre **Notificações** (ver 2.7).

**Barra de baixo:** Início · Destinos · Viagem · Financeiro · Perfil.

**Sem nenhum destino (conta nova):** Início, Destinos, Viagem e Financeiro mostram a mesma tela: "Você ainda não tem destinos.", a ajuda "Como funciona" em 3 passos (Crie um destino → Convide os passageiros → Faça a viagem) e o único botão **Crie seu primeiro destino**.

### 2.1 Início (`/vanzeiro`)
Resumo do dia em três cartões e um botão. Não rola num celular comum (no Android 360 × 740 rola 26px; no iPhone SE, 77px). **Atualizado em 16/11:** não rola no Android 360 × 740; no iPhone SE rola 13px.

1. **Viagem de hoje** (toque abre a aba Viagem): nome do destino, a van (modelo · placa), selo âmbar "Às HH:MM", linha "Saída HH:MM · Volta HH:MM/Sem volta". Qual viagem: a mesma da aba Viagem (a escolhida lá, ou a primeira do dia por horário). **Atualizado em 16/11:** mostra a viagem em andamento ou a próxima de hoje que ainda não foi feita; a aba Viagem abre nessa mesma (Etapa G); com todas feitas, "Viagens de hoje feitas". Destino pausado nunca aparece. **Sem viagem hoje:** "Nenhuma viagem hoje" e "Próxima: Sex, 20 de nov, Jacarezinho → Ourinhos" (ou "Nenhuma viagem marcada.").
2. **Passageiros confirmados:** "3 de 6", barra verde, selos "3 confirmados" / "2 sem resposta" / "1 não vão". Conta todos os passageiros do destino de hoje. **Sem passageiros:** "Nenhum passageiro ainda — Toque para convidar pelo código de convite." (toque abre o destino). Some quando não há viagem hoje.
3. **Valores a receber** (toque abre o Financeiro): "R$ 1.811,00", "Total a receber" e três contagens: Pagos 9 · Pendentes 6 · Devendo 6. São os números do mês (ver seção 5). **Atualizado em 16/11:** hoje é "R$ 1.661,00" e Pagos 9 · Pendentes 9 · Devendo 2 (Por viagem e Diário passaram a vencer 7 dias depois; ver seção 5).
4. Botão amarelo **Novo destino**.

Limites de hoje: o Início **não acompanha a viagem** (depois de encerrada, continua "Às 06:40" e "3 de 6"); e com duas viagens no dia mostra a escolhida na aba Viagem, que começa sendo a das 06:40 (Cambará), não a das 06:00. **Atualizado em 16/11:** os dois limites foram corrigidos (Etapas E e G).

### 2.2 Destinos — lista (`/vanzeiro/destinos`)
Botão **Novo destino** no cabeçalho. Lista rolável de cartões: tipo (Rota fixa / Viagem avulsa), nome "Origem → Destino", "dias · saída HH:MM", selo **Ativo** (verde) ou **Pausado** (cinza, cartão esmaecido), e "N passageiros". Toque abre o detalhe. Destino novo entra no topo.

### 2.3 Novo destino e Editar destino (`/vanzeiro/destinos/novo`, `/vanzeiro/destinos/editar/ID`)
Formulário em passos ("Passo X de 3" + Resumo), com Voltar e Continuar/Salvar fixos embaixo. Continuar só liga quando o passo está completo.
- **Passo 1 — "De onde sai e para onde vai?":** De onde sai?, Para onde vai?, tipo (Rota fixa "Repete toda semana" / Viagem avulsa "Uma data só").
- **Passo 2 — "Quando e em que horário?":** dias da semana (rota fixa) ou data (avulsa); "Tem volta?" Sim/Não; **Atualizado em 16/11:** "Tem volta?" é Sim/Não na rota fixa e Não / Mesmo dia / Outro dia (com a data da volta) na avulsa; a data da avulsa não aceita dia que já passou ("Essa data já passou."). Saída da ida e Horário da volta (lado a lado quando tem volta); **Confirmar até:** 30 min antes / 1 h antes (padrão) / 2 h antes / Noite anterior, 20h.
- **Passo 3 — "Por onde a van passa?":** o caminho desenhado (Saída, Paradas, Chegada) com Subir, Descer e Remover em cada parada, e o campo "Nova parada" + Adicionar.
- **Resumo — "Confira antes de salvar":** tipo, nome, Dias/Data, Ida, Volta, Confirmar até, caminho. Botão **Salvar destino**.
- Ao salvar um destino novo: nasce **Ativo**, com um **código VAN-NNNN sorteado** (hoje pode repetir, ver 7.11). **Atualizado em 16/11:** o código nunca se repete (Etapa C); ao salvar, o mapa procura as cidades que ainda não conhece (P3). Editar mantém o código e o estado. Voltar no passo 1 sai sem salvar, sem perguntar.

### 2.4 Detalhe do destino (`/vanzeiro/destinos/ID`)
Cabeçalho com o nome e o botão "Todos os destinos". Rola a tela inteira, com o cabeçalho junto. Cartões, em ordem:
1. **Como funciona:** selo Ativo/Pausado, Tipo, Dias (ou Data), Saída da ida, Volta, Confirmar até.
2. **Caminho:** Saída → Paradas → Chegada.
3. **Código de convite:** o código grande, **Copiar** (vira "Copiado" por 2 s), "Envie para quem quer entrar nesta rota." e **Enviar pelo WhatsApp** (abre o WhatsApp com a mensagem "Oi! Para entrar na minha van (Origem → Destino), abra o app O Vanzeiro e use o código VAN-NNNN.").
4. **Pedidos para entrar** (só aparece se houver): borda amarela, contador, cada pedido com nome, telefone, **Aceitar** (abre o cadastro de passageiro já com nome e telefone) e **Recusar** (o pedido some na hora, sem perguntar). **Atualizado em 16/11:** Aceitar abre o cadastro já com nome, telefone, cidade, endereço e ponto no mapa preenchidos pelo passageiro (seção 13); Recusar pergunta antes e a pessoa recebe aviso.
5. **Passageiros deste destino:** "N passageiros" ou "Nenhum passageiro ainda."; lista com inicial, nome, "cidade · endereço", "Plano · R$ valor"; botão **Adicionar passageiro**. **Atualizado em 16/11:** no lugar da inicial aparece o número da ordem fixa da busca; sem setas: segurar e arrastar muda a ordem dentro da cidade (seções 14 e 15).
6. **Editar** e **Pausar / Ativar** (troca na hora, sem confirmação). **Atualizado em 16/11:** Pausar pede confirmação e não deixa pausar com a viagem do destino em andamento (Etapa G). Pausado: some das viagens do dia e do Início; passageiros e cobranças continuam.
7. **Excluir destino** (vermelho, embaixo): pergunta antes, dizendo quantos passageiros saem, quantos pedidos são recusados, quantas cobranças pendentes são canceladas e quantas que estão devendo continuam a receber, e que não dá para desfazer. Ao excluir: some o destino, seus passageiros e pedidos; as pendentes viram "Cancelada — Destino excluído"; devendo, pagas e canceladas ficam; volta para a lista. Com a viagem de hoje daquele destino em andamento: "Termine a viagem antes de excluir." (decisão 6)

### 2.5 Novo passageiro e Editar passageiro (`.../passageiros/novo`, `.../passageiros/ID/editar`)
Mesmos passos do destino.
- **Passo 1 — "Nome e WhatsApp.":** no cadastro novo, dois botões: **Passageiro novo** ou **Já é meu passageiro** (abre uma lista com as pessoas que estão em outros destinos; nome e telefone vêm travados). Nome do passageiro; Telefone (WhatsApp) "Com DDD" (10 ou 11 números). Vindo de um pedido, nome e telefone já vêm preenchidos.
- **Passo 2 — "Onde a pessoa embarca?":** a cidade, escolhida entre os pontos do caminho do destino (origem, paradas e destino), e o endereço ou ponto de embarque. **Atualizado em 16/11:** vindo de um pedido, cidade e endereço vêm do passageiro e não mudam ("Preenchido pelo passageiro"); se o vanzeiro muda a cidade de quem tem ponto no mapa, o ponto é apagado, com aviso.
- **Passo 3 — "Como a pessoa paga?":** plano (Por viagem "Ida + volta: 1 cobrança, mesmo noutro dia." / Diário "1 cobrança por dia que embarcou." / Quinzenal "A cada 15 dias" / Mensal "Uma vez por mês"); valor (aceita vírgula); Dia do vencimento (1 a 31, só quinzenal e mensal); **Descontar faltas?** Não (padrão) / Sim, com a frase "Só desconta quem avisar 'Não vou' dentro do prazo." e, no Sim, "Valor de cada falta".
- **Resumo:** destino, nome, telefone, Embarca em, Plano, Vencimento, "Desconta faltas: R$ X por falta" ou "Não desconta faltas". Botão **Salvar passageiro**.
- Ao salvar: mensal e quinzenal ganham na hora a **próxima cobrança** (o primeiro vencimento de hoje em diante). Vindo de um pedido, o pedido sai da lista e a pessoa passa a ver o painel dela. A mesma pessoa não entra duas vezes no mesmo destino (o app simplesmente não salva, sem avisar). **Atualizado em 16/11:** o mesmo telefone no mesmo destino mostra "Já tem um passageiro com este telefone neste destino."; valor zero não passa; o resumo avisa quando o destino passa do número de lugares da van. Editar e **mudar o plano** cria a próxima cobrança do plano novo; as antigas ficam como estão.

### 2.6 Detalhe do passageiro (`.../passageiros/ID`)
Cabeçalho com o nome e o botão com o nome do destino (volta). Rola a tela inteira.
1. **Contato e embarque:** WhatsApp, "Embarca em" cidade e endereço.
2. **Plano de pagamento:** plano e valor, Vencimento "Todo dia N" (quando tem), Desconto de faltas "R$ X por falta" ou "Não".
3. **Destinos deste passageiro:** um link por destino em que a pessoa está, com plano e valor.
4. **Pagamentos:** "Deve no total" (verde se zero, vermelho se algo venceu, âmbar se só pendente) e a lista das cobranças da pessoa, da mais nova para a mais velha. Vazio: "As cobranças aparecem quando a pessoa embarcar." (Por viagem/Diário) ou "Nenhuma cobrança ainda."
5. **Chamar no WhatsApp**, **Editar**, **Remover deste destino** (pergunta "Remover Fulano? A pessoa sai da lista de passageiros de Origem → Destino." Cancelar/Remover). Ao remover, **as cobranças ficam** (continuam no Financeiro e no "A receber"; ver 7.2).

### 2.7 Pedidos para entrar (`/vanzeiro/pedidos`)
Abre pelo sininho. Lista todos os pedidos de todos os destinos: nome, telefone, "Quer entrar em Origem → Destino", **Aceitar** / **Recusar**. Vazio: "Nenhum pedido novo — Quando alguém usar o seu código de convite, aparece aqui." + **Ver destinos**. **Atualizado em 16/11:** esta tela saiu; o sininho abre **Notificações** (`/vanzeiro/notificacoes`) com três partes: Pedidos para entrar, Mudanças de endereço (Aceitar / Recusar com confirmação) e Avisos (resposta de passageiro, cobrança vencida).

### 2.8 Viagem (`/vanzeiro/viagem`)
A tela de dentro da van. Uma viagem de cada vez. Subtítulo "Hoje, sex, 13 de nov".

**Antes de sair:** se há mais de uma viagem hoje, dois botões no alto para escolher (06:00 Jacarezinho → Londrina / 06:40 Cambará → UENP), com o selo "Feita" na que já acabou. Cartão "Viagem de hoje" com "Saída · volta" e o selo verde "N vão". **Atualizado em 16/11:** o selo mostra "N de M lugares" (verde com lugar, âmbar lotada, vermelho se passou). Depois, três listas: **Quem vai · na ordem da busca** (numerada; a ordem é a das cidades no caminho; dentro da mesma cidade, a ordem em que foram cadastrados), **Sem resposta** e **Não vão**. **Atualizado em 16/11:** a lista se chama "Quem vai · na ordem de hoje" e, dentro da cidade, segue a ordem fixa do destino (a que o vanzeiro arrasta). Botão **Iniciar viagem** (apagado se ninguém vai). Sem passageiros no destino: "Este destino ainda não tem passageiros." + **Convidar passageiros**. Sem viagem hoje: "Nenhuma viagem hoje — Próxima: Sáb, 28 de nov" + **Ver destinos**.

**Ao tocar Iniciar viagem:** as respostas daquela viagem **fecham** (ninguém mais muda "Vou"/"Não vou"), quem disse "Não vou" no prazo tem a **falta registrada** (vale desconto se o plano desconta), e a lista "Quem vai" vira a ordem da busca. Quem não respondeu **não entra**.

**Fases, uma tela por momento** (o título do cabeçalho muda):
1. **Buscando passageiros:** "X de Y embarcados" com barra (e "N faltou" em vermelho); cartão "Próximo passageiro" (nome, endereço, cidade, "1º de 3", **Abrir no mapa** — abre o Google Maps com o endereço e a cidade); **Atualizado em 16/11:** Abrir no mapa usa o ponto marcado pelo passageiro, quando existe. botões **Embarcou** (verde) e **Não estava no ponto** (vermelho); embaixo, **Fazer parada**. Quando todos foram tratados: "Todos buscados — seguir para o destino" e o botão **Cheguei ao destino**.
2. **Parada:** "Parada em andamento — Antes de seguir, você confere quem está na van." e **Retomar viagem**. Se ninguém está a bordo, retomar volta direto para a busca.
3. **Conferência:** "X de Y conferidos"; um cartão por pessoa a bordo (vermelho = "Falta conferir", verde = "Na van", apagado = "Ficou aqui"), cada um com **Está na van** e **Ficou aqui**; embaixo da pessoa, "Confirmou pelo celular" ou "Conferido pelo vanzeiro". **Seguir viagem** só liga com todos conferidos ("Confira todos para seguir."). Quem "ficou" sai das próximas conferências e da volta.
4. **Chegou ao destino:** resumo da ida (Embarcaram X de Y; Não estavam no ponto, com os nomes; Paradas) e **Iniciar volta** (ou **Encerrar viagem**, se o destino não tem volta).
5. **Conferência da volta:** quem embarcou na ida e não ficou pelo caminho; mesmos botões. Se ninguém fica "Na van", a viagem encerra.
6. **Levando de volta:** "X de Y deixados em casa"; "Próxima descida" na **ordem inversa** da busca, com Abrir no mapa; botão **Desceu**; **Fazer parada** (com conferência igual).
7. **Viagem encerrada:** resumo (Ida; Volta "Levados para casa" e Paradas; "Ficaram (desceram de propósito)" com nomes) e **Voltar ao início**. A viagem fica marcada como "Feita" e não pode ser refeita nem desfeita. Não existe histórico de viagens (item 8). **Atualizado em 16/11:** existe o histórico **Viagens feitas** (no cabeçalho da aba Viagem), com nome e horários do dia de cada viagem.

Durante a viagem, trocar de aba e voltar não perde nada. Não há como **desfazer** um toque errado (Embarcou / Não estava).

**O que a viagem manda para o Financeiro:** "Embarcou" cria a cobrança do dia para Por viagem e Diário (uma só por viagem/dia); "Não vou" no prazo, ao iniciar, soma uma falta na próxima cobrança em aberto de quem tem desconto. "Não estava no ponto" e "sem resposta" **não mexem** em dinheiro.

### 2.9 Financeiro (`/vanzeiro/financeiro`)
Subtítulo "Resumo de novembro." Três cartões fixos: **A receber** R$ 1.811,00 · **Recebido** R$ 663,00 · **Devendo** R$ 631,00. **Atualizado em 16/11:** hoje A receber R$ 1.661,00 · Recebido R$ 663,00 · Devendo R$ 530,00. Filtros **Todas / Pendentes / Devendo / Pagas**. Lista rolável, do vencimento mais novo para o mais velho: nome, destino, referência ("Mensalidade de novembro", "Quinzena de 15/11 a 29/11", "Diária de 12/11", "Viagem de 08/11"), valor, selo da situação, e a linha da data ("Vence em 20/11", "Vence hoje", "Venceu em 05/11", "Vencimento 10/11 · Pago em 10/11 · Pix", "Vencimento 07/11 · Cancelada em 08/11"). Cobrança cancelada aparece esmaecida e riscada. Vazios: "Nenhuma cobrança ainda. — O app cria as cobranças sozinho, pelo plano de cada passageiro." + **Ver destinos**; filtros vazios ("Nenhuma cobrança pendente.", "Ninguém devendo. Muito bem!", "Nenhuma cobrança paga ainda.") + **Ver todas**.

### 2.10 Cobrança (`/vanzeiro/financeiro/ID`)
Cabeçalho com a referência e **Voltar**. Valor grande (riscado se cancelada), selo, Passageiro, Destino, Vencimento, "Pago em DD/MM · forma" (fundo verde) ou "Cancelada em DD/MM — Motivo: ...". Cartão **Desconto de faltas** quando a cobrança tem período de faltas: "Mensalidade R$ 280,00 / 2 faltas × R$ 15,00 − R$ 30,00 / Total R$ 250,00", a frase da conta e "Faltas contadas de 11/10 a 10/11." (ou "Nenhuma falta neste período."). Só em cobrança pendente ou devendo: **Marcar como pago** (pergunta "Como foi pago?" Dinheiro / Pix → **Confirmar pagamento**; a data do pagamento é hoje), **Cobrar no WhatsApp** (mensagem pronta com valor e vencimento, dizendo "que venceu" se já venceu) e **Cancelar cobrança** (pede o motivo, obrigatório, até 60 letras; o botão de desistir se chama "Voltar" para não confundir). Paga ou cancelada: só leitura.

### 2.11 Perfil (`/vanzeiro/perfil`)
**Você:** Nome, Telefone, "Chave Pix (os passageiros veem esta)". **Sua van:** modelo e "Placa X". Conta nova mostra "Não informado". **Editar:** nome, telefone, chave Pix, modelo e placa, todos obrigatórios, Cancelar/Salvar; **Atualizado em 16/11:** só nome e telefone são obrigatórios; Editar ganhou "Lugares para passageiros"; o Perfil ganhou o cartão "Notificações no celular". o nome novo vai para o cabeçalho e o Pix novo para o passageiro. **Trocar para passageiro**, **Termos de Uso**, **Política de Privacidade**, **Sair** (pergunta "Quer mesmo sair? Você volta para a tela Entrar."). Não existe "Excluir minha conta" (item 6). Rola um pouco (o "Sair" fica cortado num celular comum). **Atualizado em 16/11:** "Excluir minha conta" existe.

---

## 3. O painel do passageiro

**Cabeçalho:** inicial, saudação, primeiro nome, título, subtítulo e o **sininho com uma bolinha amarela sempre acesa, que não faz nada** (os avisos são o item 7). **Atualizado em 16/11:** o sininho mostra o número de avisos não lidos e abre Notificações (prazo chegando, van saiu, cobrança vencendo, pedido aceito ou não aceito, endereço aceito ou não aceito).

**Barra de baixo:** Início · Viagens · Pagamentos · Perfil. Só aparece quando a pessoa está em alguma van.

### 3.1 Entrar na van (quem ainda não está em nenhuma van)
- **Código:** "Digite o código de convite da sua van.", campo grande (aceita "VAN-4821", "van 4821" ou só "4821"), **Procurar van**. Errado: "Código não encontrado". Embaixo, no primeiro uso, "Onde consigo o código? — Peça ao seu vanzeiro. Ele envia o código pelo WhatsApp." Link **Sair** (sai direto para Entrar, sem perguntar). **Atualizado em 16/11:** Sair pergunta antes. Quem saiu do último destino e ainda deve vê o cartão "Em aberto" e a barra Início / Pagamentos (A3).
- **Van encontrada:** cartão com o vanzeiro, o destino, dias e saída; Seu nome; Seu WhatsApp; **Pedir para entrar**; **Usar outro código**. **Atualizado em 16/11:** o pedido tem 2 passos: dados (nome, WhatsApp) e "Onde você embarca" (cidade, endereço e ponto no mapa, obrigatório quando o mapa conhece o destino) (seção 13).
- **Aguardando o vanzeiro aceitar:** "Assim que ele aceitar, o seu painel abre aqui." e o cartão da van. Quando o vanzeiro aceita, o painel abre sozinho.
- **O vanzeiro não aceitou o pedido:** "Fale com ele ou tente outro código." + **Tentar outro código**.

### 3.2 Início (`/passageiro`)
Três cartões. Não rola num celular comum.
1. **Próxima viagem** (destino, "Hoje, 13 de nov · saída 06:00", selo Vou / Não vou / Confirmar): a linha do prazo muda com a situação — "Confirme até 05:40" (âmbar, sem resposta e prazo aberto), "Dá para mudar até 05:40" (já respondeu), "Prazo encerrado. Você respondeu: Vou", "Prazo encerrado — a van não vai passar" (vermelho, sem resposta), "A viagem já começou."; botões **Vou** / **Não vou** enquanto o prazo está aberto; **Falar com o vanzeiro** (WhatsApp) quando perdeu o prazo. **Qual viagem aparece:** a primeira dos próximos 7 dias, por data e horário. Por isso a Juliana vê Londrina (06:00, prazo fechado, "a van não vai passar") e não Cambará (06:40, que ainda dá para confirmar) — ela só acha essa na aba Viagens. **Atualizado em 16/11:** aparece a primeira viagem que ainda dá para responder, está em andamento ou tem "Vou"; por isso a Juliana vê Cambará (06:40). Com a van lotada, o "Vou" vira "Van lotada" (apagado). **Durante uma conferência**, este cartão dá lugar ao aviso "Conferência da van — você está na van?" com **Estou na van**, e depois "Confirmado — boa viagem!".
2. **Situação da van** (placa no selo; verde, ou vermelho quando é alerta) com a barra "Saiu da garagem / A caminho / No seu ponto". **Atualizado em 16/11:** a barra é "Saiu da garagem / A caminho / Na van"; o detalhe termina com "· Ver no mapa", que abre "Onde está a van" (seção 12). Textos possíveis: "Aguardando o dia da viagem — Próxima viagem: ...", "Aguardando a saída — A van sai às 06:40", "Você não vai hoje — O vanzeiro já sabe", "A van não vai passar — Você não confirmou a tempo", "Viagem começou — Faltam 2 pessoas antes de você", "Você é o próximo — Fique pronto no seu ponto", "Na van — Boa viagem!", "Você não estava no ponto — A van passou e seguiu viagem", "Viagem encerrada — Até a próxima!". Tudo segue a aba Viagem do vanzeiro, na hora.
3. **Valor em aberto:** soma de tudo o que não está pago, em todos os destinos; embaixo, a cobrança mais próxima de vencer ("Mensalidade de novembro · vence em 20/11") e o selo dela; "Tudo pago. Obrigado!" quando é zero.

### 3.3 Viagens (`/passageiro/viagens`)
**Próximos 7 dias:** um cartão por viagem de cada destino (dia, destino, saída, selo, linha do prazo, Vou/Não vou enquanto aberto). Vazio: "Nenhuma viagem nos próximos 7 dias. A próxima é sáb, 28 de nov." e, se o histórico também está vazio, **Falar com o vanzeiro**. **Histórico:** os últimos 14 dias e hoje (quando a viagem já tem o resultado da pessoa), cada dia com **Embarcou** (verde) ou **Faltou** (vermelho). Por viagem e Diário mostram só os dias em que embarcaram; mensal e quinzenal mostram todos os dias de viagem como "Embarcou", menos os dias de falta. Vazio: "Suas viagens feitas aparecem aqui."

### 3.4 Pagamentos (`/passageiro/pagamentos`)
Cartão **Você deve** (soma; "Soma das cobranças ainda não pagas." ou "Tudo pago. Obrigado!") **Atualizado em 16/11:** o cartão se chama "Em aberto". e a lista de todas as cobranças da pessoa, de todos os destinos (destino, referência, valor, selo, data e, quando há desconto, a conta). Vazio: "Nenhuma cobrança ainda. — Quando houver, ela aparece aqui." + **Falar com o vanzeiro**.

### 3.5 Minha cobrança (`/passageiro/pagamentos/ID`)
Igual à do vanzeiro, sem o nome e sem as ações dele. Em cobrança pendente ou devendo: **Pagar com Pix** (mostra "Chave Pix de Carlos Pereira", com **Copiar**), **Atualizado em 16/11:** o Pix é sempre o do vanzeiro daquela cobrança (Q1). **Já paguei — avisar o vanzeiro** (WhatsApp com a mensagem "Já paguei a mensalidade de novembro da van, no valor de R$ 280,00. Pode conferir e marcar como pago?") e o aviso "Quem marca como pago é o vanzeiro, depois de conferir." A pessoa só abre as próprias cobranças.

### 3.6 Perfil (`/passageiro/perfil`)
**Você:** Nome, Telefone e, para cada destino, "Destino" e "Onde embarca". **Seu vanzeiro:** nome, van, **Chamar no WhatsApp**. **Editar** (nome, telefone, um "Onde embarca" por destino; cidade, plano e valor não mudam; Cancelar/Salvar). **Atualizado em 16/11:** Editar ficou só com nome e telefone; cada destino tem "Mudar onde embarco" (até 1 km muda na hora; mais longe, o vanzeiro aprova); o Perfil ganhou "Notificações no celular". **Entrar em outro destino**. **Trocar para vanzeiro**, Termos, Política, **Sair** (com confirmação). Rola a tela inteira. Embaixo de cada destino, **Sair deste destino** (vermelho): pergunta antes ("Você deixa de ver as viagens deste destino", quantas pendentes são canceladas, quantas que estão devendo continuam nos Pagamentos, "Para voltar, peça um código novo ao vanzeiro"). Ao sair: as pendentes dali viram "Cancelada — Saiu do destino"; as devendo continuam e aparecem nos Pagamentos; se era o único destino, o painel volta para "Entrar na van". Com a viagem de hoje daquele destino já começada, não deixa sair. Não existe "Excluir minha conta" (item 6). **Atualizado em 16/11:** "Excluir minha conta" existe; quem sai do último destino e ainda deve continua vendo os Pagamentos (A3).

### 3.7 Entrar em outro destino (`/passageiro/entrar-destino`)
Mesma tela do código, com "Voltar ao perfil". Avisa "Você já está neste destino." quando é o caso. Depois de pedir, mostra "Aguardando o vanzeiro aceitar" ali mesmo. Se o vanzeiro recusa, **não há aviso**: a tela volta ao campo do código. Para uma pessoa que **entrou por conta nova e pedido** (não a Juliana dos exemplos), pedir um segundo destino **quebra o painel**: a pessoa cai em "Entrar na van / Aguardando" sem a barra de baixo, como se não estivesse em van nenhuma (confirmado no app). **Atualizado em 16/11:** recusar avisa a pessoa no sininho, e o painel não quebra mais ao pedir um segundo destino (corrigido e testado).

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
| Cada destino tem um código de convite | **Certa, com ressalva** | "VAN-" + 4 números sorteados. **Pode repetir** entre destinos (ver 7.11; é o item 5 da Etapa C). **Atualizado em 16/11:** o código nunca se repete (Etapa C). |
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
| O app cria as cobranças sozinho | **Certa, com duas ressalvas** | (a) **Por viagem e Diário vencem no próprio dia do embarque**; no dia seguinte, sem pagar, já ficam "Devendo" (ver 7.8). (b) Hoje as cobranças futuras de mensal/quinzenal nascem só nos exemplos e ao salvar o passageiro; **não existe quem crie a do mês seguinte quando o tempo passar** (não há relógio). É assunto da Etapa C (ver 7.9). **Atualizado em 16/11:** Por viagem e Diário vencem 7 dias depois do embarque (decisão do dono, Etapa E). |
| Quinzenal | **Diferente** | "A cada 15 dias" é contado a partir do dia do vencimento: Pedro (dia 15) vence em 15/10, 30/10, **14/11, 29/11, 14/12**... As datas vão andando; não é "dia 15 e dia 30". Ver 7.10. |
| Mensal | **Certa** | Um vencimento por mês no dia escolhido (dia 31 vira o último dia do mês). O nome é o mês do vencimento: "Mensalidade de novembro" vence 10/11 e cobre as faltas de 11/10 a 10/11. Ver 7.3. |
| Uma cobrança nunca é editada: só paga (Dinheiro/Pix) ou cancelada com motivo | **Certa** | Valor, nome e telefone ficam congelados na criação. |
| O total que alguém deve é a soma das não pagas | **Certa** | Cancelada não conta. |
| Desconto de faltas só em Mensal e Quinzenal, escolhido por passageiro | **Certa** | Por viagem e Diário nunca guardam desconto. |
| Só desconta quem avisou "Não vou" dentro do prazo | **Certa, com ressalva** | A falta só é **registrada quando o vanzeiro toca "Iniciar viagem"**. Se naquele dia ele não iniciar a viagem no app, ninguém ganha desconto. Ver 7.7. O desconto entra na próxima cobrança ainda não vencida; cobrança vencida, paga ou cancelada nunca muda. **Atualizado em 16/11:** a falta passa a contar quando o prazo fecha, mesmo que a viagem não seja iniciada no app, e guarda quando a pessoa avisou (Q5). |
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
| **A receber** (R$ 1.811,00) | Pendentes do mês (R$ 1.180) + Devendo (R$ 631). Devendo mais antigo entra mesmo de outro mês. Cancelada nunca conta. | Financeiro (cartão) e Início do vanzeiro ("Valores a receber"). **Atualizado em 16/11:** hoje R$ 1.661,00 (Devendo R$ 530). |
| **Recebido** (R$ 663,00) | Soma das pagas com vencimento neste mês. (Pagas em outubro não entram.) | Financeiro. |
| **Devendo** (R$ 631,00) | Soma das vencidas e não pagas, de qualquer mês. | Financeiro. É também o nome do selo vermelho de cada cobrança. **Atualizado em 16/11:** hoje R$ 530,00. |
| **Pagos 9 / Pendentes 6 / Devendo 6** | Contagem das cobranças do mês por situação (as mesmas regras acima). | Início do vanzeiro. **Não bate com o filtro "Pagas"** do Financeiro, que lista 19 (todas as pagas, de todos os meses). **Atualizado em 16/11:** hoje Pagos 9 / Pendentes 9 / Devendo 2. |
| **Deve no total** | Soma das não pagas daquela pessoa naquele destino (uma matrícula). | Detalhe do passageiro (vanzeiro). |
| **Valor em aberto** / **Você deve** (R$ 460,00 para a Juliana) | Soma das não pagas da pessoa **em todos os destinos** (280 + 180). | Início e Pagamentos do passageiro. São o mesmo número com dois nomes; o vanzeiro vê a mesma coisa como "Deve no total", mas por destino. |
| **Valor de uma cobrança com desconto** | Valor do plano − faltas × valor da falta, nunca abaixo de zero. Faltas: só "Não vou" no prazo, dentro do período (mensal: do dia seguinte ao vencimento anterior até o vencimento; quinzenal: os 15 dias), uma por dia. | Lista, detalhe e cartão "Desconto de faltas", nos dois painéis, com a mesma conta. |
| **Passageiros confirmados** ("3 de 6") | Entre os passageiros do destino de hoje: quantos disseram "Vou" / total. "Sem resposta" = total − vou − não vou. | Início do vanzeiro. A aba Viagem mostra as mesmas pessoas em listas ("3 vão"). |
| **"X de Y embarcados"**, **"N faltou"**, **"X de Y conferidos"**, **"X de Y deixados em casa"** | Contagens da viagem em andamento. Y da busca = quem disse "Vou". Y da volta = quem estava na van na conferência da volta. | Aba Viagem. |
| **Situação de uma cobrança** | Cancelada se tem cancelamento; Pago se tem pagamento; senão Devendo se o vencimento já passou, Pendente se não. "Vence hoje" ainda é Pendente. | Todos os selos. |
| **Sininho do vanzeiro** | Número de pedidos para entrar. | Cabeçalho. |

**Onde os números não batem (já apontados na revisão):** Início "9 Pagos" × Financeiro "Pagas" 19; "Boa noite" pelo relógio do celular enquanto o resto do app está em 05:10; Início mostrando a viagem das 06:40 enquanto a das 06:00 ainda não foi feita. **Atualizado em 16/11:** estes pontos foram tratados nas Etapas D a G; a saudação continua pelo relógio do app (hoje 05:10).

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

**Atualizado em 16/11:** todas as decisões desta seção foram respondidas pelo dono em 14/11 (lista "Respostas do dono do projeto", mais abaixo) e feitas nas Etapas E e seguintes. As decisões que ainda estão em aberto ficam na seção 17.2.

As de 1 a 5 vêm da revisão (Etapa A). As outras apareceram nesta análise.

1. **Iniciar viagem antes do prazo.** Hoje o vanzeiro pode tocar "Iniciar viagem" a qualquer hora, e isso fecha as respostas na hora: às 05:10 ele inicia a das 06:40 (prazo 05:40) e quem ia responder passa a ver "a van não vai passar". Opções: (a) deixar como está; (b) só liberar o botão depois do prazo; (c) liberar antes, mas com um aviso "Ainda faltam N responder. Iniciar mesmo assim?".
2. **Cobranças de quem foi removido.** Quando o vanzeiro remove um passageiro do destino, as cobranças dele continuam (inclusive a mensalidade de 20/11, que ainda não venceu) e seguem contando no "A receber". Devem continuar, ou as que ainda não venceram devem ser canceladas sozinhas (com o motivo "Removido do destino")?
3. **Nome e período da mensalidade.** "Mensalidade de novembro" vence 10/11 e desconta as faltas de 11/10 a 10/11. Ou seja, o mês da mensalidade é o mês do vencimento, e as faltas são do período anterior a ele. Está certo assim, ou a mensalidade de novembro deveria cobrir as viagens de novembro?
4. **Telas de detalhe rolando inteiras.** Detalhe do destino, do passageiro, da cobrança e os dois Perfis rolam com o cabeçalho junto. Pode ficar assim (são telas de leitura), ou devem rolar só o conteúdo, com o cabeçalho parado?
5. **Duas viagens no mesmo dia e a viagem que acabou.** O Início mostra a viagem escolhida na aba Viagem; hoje a escolha nasce na das 06:40 e não na das 06:00. Sugestão: o Início mostra **a próxima que ainda não foi feita** e, quando todas acabaram, "Viagens de hoje feitas" com o resumo. Combinado?
6. ✅ **Decidido em 13/11/2026: pagas e canceladas ficam no histórico; devendo continuam a receber; pendentes são canceladas sozinhas, com o motivo registrado. O botão do passageiro se chama "Sair deste destino".** Pergunta original — **Excluir destino e sair de um destino (item 5 da Etapa B).** O que acontece com as cobranças **em aberto** (pendentes e devendo) do destino excluído, ou da pessoa que saiu? E as pagas ficam no histórico? Sugestão: pagas e canceladas ficam no histórico; devendo continuam a receber; pendentes são canceladas sozinhas com motivo. E o nome do botão do passageiro: "Sair deste destino" (para não confundir com "Sair" da conta).
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

**Atualizado em 16/11:** a lista completa e atual está em `docs/banco-de-dados.md` (inclui o que entrou depois: lugares da van, ponto no mapa, mudanças de endereço, cidades no mapa, celulares para notificar, dinheiro em centavos e horário de Brasília).

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

**Atualizado em 16/11:** os itens 6, 7, 8 e 9, a Etapa C e a Etapa D desta lista estão feitos (ver `docs/contraprova.md`). O que falta hoje está na seção 17.

- ~~**Etapa B, item 5:** Excluir destino e Sair de um destino.~~ Feito em 13/11/2026.
- **Item 6:** Excluir minha conta nos dois perfis.
- **Item 7:** Sininho com avisos de verdade, nos dois painéis.
- **Item 8:** Histórico de viagens do vanzeiro.
- **Item 9:** Confirmação em toda ação que não desfaz (Recusar pedido, Pausar, Sair da tela do código, Voltar no passo 1).
- **Etapa C:** relógio único, dados com o dono, usuário logado num lugar só, código único, testes das regras, `docs/banco-de-dados.md`.
- **Etapa D:** acabamento visual, rolagens, plurais e palavras (seção 6 acima).

### Respostas do dono do projeto (14/11/2026)
- 1. Iniciar viagem antes do prazo: **pode, com aviso** "Ainda faltam N responder. Iniciar mesmo assim?".
- 2. Cobranças de quem foi removido: **as que ainda não venceram são canceladas** ("Removido do destino"); devendo continuam a receber; pagas ficam no histórico (igual à decisão 6).
- 3. Nome e período da mensalidade: **está certo assim** (nada muda).
- 4. Telas de detalhe e Perfis: **rolar só o conteúdo**, com cabeçalho e barra parados.
- 5. Duas viagens no mesmo dia: o Início mostra **a próxima que ainda não foi feita**; quando todas acabam, "Viagens de hoje feitas" com o resumo.
- 7. Falta: o "Não vou" no prazo **conta como falta quando o prazo passa**, mesmo sem a viagem ser iniciada no app.
- 8. Por viagem e Diário: **vencem 7 dias depois do embarque** (até lá, "Pendente").
- 9. Próxima cobrança: **nasce quando a atual vence**.
- 10. Quinzenal: **duas datas fixas por mês, o dia cadastrado e 15 dias depois** (dia 5 → 5 e 20; dia 20 → 20 e 5 do mês seguinte; dia 15 → 15 e 30, em fevereiro o último dia).
- 11. Código de convite: **um por destino, vale para sempre** (nada muda).
- 12. Ordem da busca: **o vanzeiro arruma na mão** a ordem dos passageiros de cada cidade, até o GPS chegar.
- 13. Perfil do vanzeiro: **só nome e telefone obrigatórios**; Pix e van podem ficar em branco ("Não informado").
- 14. Pausar destino: **pede confirmação**.
- 15. Termos e Política: **tirar o trecho do GPS** até ele existir (o advogado revisa antes de lançar).
Da revisão da Etapa A:
- Pedido recusado: a pessoa recebe **aviso no sininho** e vê a mensagem "O vanzeiro não aceitou".
- "9 Pagos" × 19 no Financeiro: **o Financeiro mostra o mês**; "Devendo" inclui os atrasados de meses anteriores.

## 10. Análise completa de 15/11/2026 (depois das Etapas A a E)

Pedido do dono do projeto: percorrer tudo de novo, listar os erros que faltam e organizar por etapas. Método: as 40 telas abertas no navegador em tamanho de celular (texto, rolagem e erros escondidos), todos os fluxos de ação refeitos de ponta a ponta, números conferidos entre telas. Nada foi corrigido nesta análise.

### 10.1 O que foi conferido e está certo
- Nenhuma tela quebra e nenhuma tem erro escondido; endereços inexistentes caem em telas amigáveis.
- Os números batem: Início = Financeiro (A receber R$ 1.661,00 · Recebido R$ 663,00 · Devendo R$ 530,00 · 9 pagas · 9 pendentes · 2 devendo); Juliana "Em aberto" R$ 460,00 = 280 + 180 nas três telas; Mariana R$ 530,00 = 280 (dez) + 250 (nov com 2 faltas × R$ 15); Fernanda "Quinzena de 21/10 a 05/11" R$ 130,00 (1 falta); Pedro "Quinzena de 31/10 a 15/11"; Por viagem e Diário vencendo 7 dias depois do embarque.
- Viagem completa certa: "Não estava no ponto" não desconta (Mariana segue R$ 250,00); "Ficou aqui" aparece no resumo ("Ficaram 1 — Lucas"); "Desceram" conta certo; a viagem terminada entra no Histórico na hora; os embarques criam as cobranças do dia na hora (Ana + R$ 45, Lucas + R$ 80).
- "Estou na van" pelo celular chega ao vanzeiro como "Confirmou pelo celular"; quem não confirmou fica fora da busca, vê "A van não vai passar" e NÃO vê o botão.
- Pagar (Dinheiro/Pix) e cancelar (com motivo) funcionam e o Início acompanha na hora; cobrança de outra pessoa não abre ("Cobrança não encontrada").
- Editar destino vale na hora para a passageira (saída nova e prazo novo); excluir destino e remover passageiro são bloqueados com a viagem em andamento.
- Links certos: "Abrir no mapa" (endereço + cidade no Google Maps), "Cobrar no WhatsApp", "Já paguei", convite por WhatsApp.
- Código de convite errado avisa; "Esqueci minha senha" confirma o envio; responder depois do prazo continua bloqueado.

### 10.2 Erros e faltas encontrados (numerados)
1. **Início e aba Viagem abrem em viagens diferentes.** Ao abrir o app, o Início mostra a das 06:00 (próxima a sair), mas a aba Viagem abre na das 06:40, porque a "viagem escolhida" dos exemplos aponta para ela. Só ficam iguais se a pessoa tocar no card do Início. O certo: sem escolha feita pelo vanzeiro, a aba Viagem abre na mesma viagem que o Início.
2. **Excluir um destino apaga as viagens feitas dele do Histórico.** Tinha 2 viagens; excluí o destino e ficou 1. O texto "Destino removido", que existe no código para esse caso, nunca aparece. O certo: a viagem feita guarda o nome e os horários do dia em que aconteceu.
3. **O Histórico mostra os horários atuais do destino, não os do dia da viagem.** Se o vanzeiro mudar a saída de 06:40 para 07:10, as viagens antigas passam a mostrar 07:10. Mesmo conserto do erro 2: congelar os dados na viagem encerrada.
4. **Pausar um destino com a viagem dele em andamento não avisa.** Excluir avisa "Termine a viagem antes"; Pausar pausa direto, com a viagem rolando.
5. **Viagem avulsa aceita data no passado** (dá para criar uma excursão para 01/01/2026).
6. **Os avisos do sininho são quase todos de mentira (exemplo).** O app só cria de verdade o aviso de pedido recusado. "Resposta de passageiro", "cobrança vencida" (vanzeiro), "prazo chegando", "van saiu" e "cobrança vencendo" (passageiro) nunca nascem dos acontecimentos — são os dados de exemplo. Isso era a segunda metade do item 7 da Etapa B, que ficou só na vitrine. Junto: os avisos deviam citar o destino ("Prazo para confirmar: 30 minutos" não diz de qual viagem), e o pedido **aceito** também não avisa a pessoa (decidir se deve).
7. **Cobrança que vence hoje mostra "Vence em 13/11"** em vez de "Vence hoje".
8. **Perfil do passageiro com subtítulo "Seus dados e a sua van."** — do ponto de vista do passageiro, melhor "Seus dados e o seu vanzeiro".
9. **Cadastro de passageiro aceita valor R$ 0,00** e aceita cadastrar duas vezes a mesma pessoa (mesmo telefone) no mesmo destino, sem avisar.
10. **Resumo do "Novo destino" rola 22px no iPhone SE** quando o destino tem 3 ou mais paradas (quanto mais paradas, mais comprido).
11. **Telas de entrada rolam um pouco só no iPhone SE**: Criar conta passo 1 (70px), Entrar (39px), "Como você vai usar o app?" (69px). Zerar exige diminuir o cabeçalho azul (decisão C, pendente do dono).

### 10.3 Plano por etapas (fazer uma por vez, com conferência e merge)
- **Etapa G — Viagem e Histórico:** erros 1, 2, 3 e 4. **Feita em 15/11/2026:** sem escolha do vanzeiro, a aba Viagem abre na mesma viagem do Início; cada viagem guarda o nome e os horários do destino do dia em que começou, e o Histórico mostra esses dados (mudar ou excluir o destino depois não muda nem apaga as viagens feitas); "Pausar" com a viagem do destino em andamento avisa "Termine a viagem antes de pausar." e não pausa.
- **Etapa H — Avisos de verdade no sininho:** erro 6 (avisos nascem dos acontecimentos, citando o destino; decidir sobre o aviso de pedido aceito). **Feita em 15/11/2026:** os avisos de exemplo saíram; agora todos nascem do que acontece e citam o destino. Vanzeiro: **Resposta de passageiro** (quando alguém responde ou muda a resposta; a nova troca a antiga, ex.: Juliana respondeu "Vou" para hoje, em Cambará → UENP Jacarezinho) e **Cobrança vencida** (no dia seguinte ao vencimento não pago: "Beatriz está devendo R$ 280,00, em Jacarezinho → Londrina"). Pedido novo continua aparecendo em "Pedidos para entrar", no topo das Notificações, e conta no sininho. Passageiro: **Prazo chegando** (30 minutos antes do prazo, só para quem ainda não respondeu: "Responda até 05:40 se vai hoje, em …"), **Van saiu** (quando o vanzeiro toca "Iniciar viagem", só para quem vai) e **Cobrança vencendo** (3 dias antes do vencimento: "Quinzena de R$ 150,00 vence em 15/11, em …"). Nenhum aviso se repete. **Decidido pelo dono em 15/11/2026:** o pedido **aceito** avisa a pessoa no sininho ("Pedido aceito — O vanzeiro aceitou seu pedido para Cambará → UENP Jacarezinho"); cadastrar direto não avisa. Os tempos (30 minutos e 3 dias) ficam como estão.
- **Etapa I — Cadastros e textos:** erros 5, 7, 8 e 9. **Feita em 15/11/2026:** viagem avulsa não aceita data que já passou (o calendário começa em hoje e, se a data for digitada, o título do campo vira "Essa data já passou." e o Continuar fica desligado); cobrança que vence hoje diz "vence hoje" no Início do passageiro (e "Vence hoje" nas listas); Perfil do passageiro com o subtítulo "Seus dados e o seu vanzeiro."; cadastro de passageiro não aceita valor zero (nem escrito "0,001") e não aceita o mesmo telefone duas vezes no mesmo destino ("Já tem um passageiro com este telefone neste destino."; editar a própria pessoa continua funcionando).
- **Dependem do dono (não entram nas etapas):** erro 10 (aceitar como está ou mexer no desenho), erro 11 (decisão C), dados reais do piloto, contato da Política de Privacidade, revisão do advogado, pagamentos de quem saiu do último destino, documento do banco (item 7 da Etapa C).

---

## 11. Preparar para o banco (análise de 15/11/2026, pedida pelo dono)

O dono perguntou o que falta arrumar, corrigir e remover para o banco poder entrar. **O banco não entra agora.** Esta seção é a lista e o plano.

### 11.1 O que já está pronto
- Nenhuma tela lê os dados de exemplo direto: tudo passa pelas funções de `src/lib/`. Quando o banco entrar, muda só a parte de dentro dessas funções.
- Cada destino, passageiro, pedido, aviso e viagem guarda o vanzeiro dono.
- A hora atual vem de um lugar só (`src/lib/agora.ts`); o usuário e o papel também (`src/lib/sessao.ts`).
- 202 testes automáticos cobrem as regras.

### 11.2 O que precisa arrumar antes do banco (numerado)
1. **Embarques e faltas não ficam guardados como registro.** Ao marcar "Embarcou", o app já cria ou desconta a cobrança e esquece o resto; o histórico do passageiro dos dias anteriores vem só dos exemplos.
2. **A viagem em andamento só existe na memória.** Se o app fechar no meio da busca, tudo volta do zero. Cada toque precisa ser um registro.
3. **Memória escondida:** respostas já fechadas, "embarque já cobrado", pedidos aceitos e quem saiu de um destino ficam em listas internas que somem ao recarregar. Precisam virar dados de verdade.
4. **Tarefas que só rodam com o app aberto:** criar as próximas cobranças, registrar faltas quando o prazo passa e criar os avisos do relógio. Com o banco, precisam rodar sozinhas no servidor.
5. **Esperar o banco responder:** hoje tudo é instantâneo. Com o banco, cada ação demora um instante e pode falhar sem sinal: as telas vão precisar de "carregando" e de mensagem de erro.
6. **Dois celulares ao mesmo tempo:** "Estou na van" e "a van saiu" precisam aparecer na hora no outro celular.
7. **Números e códigos:** os identificadores são feitos pela hora (`Date.now`) e o código de convite só é conferido dentro do celular. Passam a ser feitos e conferidos pelo banco.
8. **Relógio real:** hoje fixo em 13/11, 05:10.
9. **Ordem de busca dentro da cidade:** as setas ↑ ↓ guardam a ordem só pela posição na lista. Precisa de um campo "ordem" próprio.

### 11.3 O que precisa remover (no dia do banco)
- Os dados de exemplo dentro do app (ficam só para os testes).
- O login de mentira (Entrar aceita qualquer coisa; Google e "Esqueci a senha" não fazem nada de verdade).
- As funções de "limpar" que simulam uma conta nova.

### 11.4 Decisões do dono
1. Sem internet dentro da van: o app deve funcionar sem sinal e mandar tudo quando o sinal voltar?
2. Avisos com o app fechado: notificação no celular (como o WhatsApp)?
3. Pagamentos de quem saiu do último destino (decisão já pendente).
4. Contato da Política de Privacidade e revisão do advogado.

### 11.4.1 Respostas do dono (15/11/2026)
- **A1 (sem sinal na van): sim, o app deve funcionar sem internet.** O dono pediu para fazer por etapas: A1, depois A2 (notificação no celular), depois A3 (pagamentos de quem saiu), cada uma só depois da coordenada dele.
- **A1 feita em 15/11/2026 (parte sem banco):** o app guarda uma cópia de si no celular (`public/sw.js`, ligado por `src/lib/sem-sinal.ts`). Com internet, sempre usa a versão nova; sem sinal, usa a cópia. Abre pelo ícone, recarrega, troca de aba, faz a viagem e abre o painel do passageiro sem internet. A cópia não é guardada na edição nem na prévia do Lovable. **Fica para o dia do banco:** guardar no celular o que foi feito sem sinal e mandar ao banco quando o sinal voltar (seção 6 de `docs/banco-de-dados.md`).
- **A2 (notificação no celular): sim. Feita em 15/11/2026 (parte sem banco):** no Perfil dos dois painéis, o cartão "Notificações no celular" com **Ativar** (pede a permissão do celular), "Ativadas" (verde) ou "Bloqueadas. Para ativar, libere nas configurações do celular."; o cartão some onde o celular não permite notificações. Com o app aberto mas fora da tela (minimizado), cada aviso novo do sininho para quem usa o celular (e cada pedido novo, para o vanzeiro) vira notificação, com as mesmas palavras do sininho; tocar nela abre a tela de Notificações. Com o app na tela, não notifica (o sininho já mostra). **Fica para o dia do banco:** com o app totalmente fechado, quem manda a notificação é o servidor; o celular já está pronto para recebê-la (`public/sw.js`).
- **A3 (pagamentos de quem saiu do último destino): opção 1 — continua vendo. Feita em 15/11/2026:** quem sai do último destino (ou é removido, ou o destino é excluído) e ainda deve vê, na tela do código de convite, o cartão **"Em aberto"** (valor e selo Devendo/Pendente, "De destino que você saiu. Toque para ver e pagar.") e a barra com **Início** e **Pagamentos**, onde vê as cobranças, **Pagar com Pix** e **Já paguei — avisar o vanzeiro**. Quando tudo está pago, volta a ser só a tela do código. Lembrete (decisão 6): ao sair, as pendentes são canceladas; o que fica é o que já está devendo. Antes, isso só funcionava para quem ainda tinha outro destino.

### 11.5 Plano por etapas
- **Etapa J — Documento do banco:** `docs/banco-de-dados.md` com tudo o que o banco guarda, quem vê o quê, o que roda sozinho no servidor e o que muda em cada função. É o item 7 da Etapa C. **Só o documento.** **Feita em 15/11/2026.**
- **Etapa K — Guardar o que hoje some (sem banco):** itens 1, 2, 3 e 9 da lista 11.2. **Feita em 15/11/2026, sem mudar nada na tela:** embarques e faltas avisadas no prazo viram registros (o histórico do passageiro lê deles, não mais dos exemplos); a viagem ganha número próprio e hora de início e de fim, e todo passo passa por uma função só; as respostas fechadas viram registro; os pedidos nunca somem (ficam "aguardando", "aceito" com a matrícula criada, ou "recusado", com datas); quem sai de um destino continua guardado com o dia da saída; a ordem de busca na cidade virou um número próprio (1, 2, 3…), trocado pelas setas.
- **Depois das decisões do dono (11.4) e só quando ele mandar:** banco, login real, tarefas no servidor (item 4), espera e erro de internet (item 5), dois celulares (item 6), números do banco (item 7), relógio real (item 8) e remoção dos exemplos (11.3).

---

## 12. Mapa da van em tempo real e lugares na van (análise de 15/11/2026, pedida pelo dono)

O dono pediu: o passageiro ver onde a van está, em tempo real, com informação de onde ela está passando; e o controle de quantos lugares a van tem.

### 12.1 O que já existe
- No Início do passageiro: "Aguardando a saída", "Saiu da garagem", "A caminho", "Você é o próximo — fique pronto no seu ponto", "Na van".
- No vanzeiro: "Abrir no mapa" (Google Maps no endereço do próximo passageiro).
- A van tem só modelo e placa; não existe número de lugares.

### 12.2 Mapa da van em tempo real (o que daria)
- **Passageiro:** mapa com a van andando e o ponto de embarque dele; "A van está em <cidade/rua>"; "Chega no seu ponto em uns N minutos" e "Faltam N paradas antes da sua"; notificação "A van está chegando"; sem sinal, "Última posição há N minutos"; na volta, "Você é o próximo a descer".
- **Vanzeiro:** a localização liga sozinha em "Iniciar viagem" e desliga ao encerrar, com o aviso "Sua localização está sendo mostrada aos passageiros desta viagem".
- **Limites:** (1) precisa do banco e de um servidor para a posição sair de um celular e chegar no outro; (2) como site instalado, o GPS só funciona com o app aberto na tela (dá para impedir a tela de apagar); com a tela apagada, só como app Android; (3) sem sinal, a posição não chega; (4) para calcular quanto falta, cada ponto de embarque precisa estar marcado no mapa (hoje é só texto).
- **Privacidade (LGPD):** localização só com a viagem em andamento, só para os passageiros dessa viagem, some ao encerrar; a Política de Privacidade precisa dizer isso.
- **Custo:** sugestão de usar mapa gratuito (OpenStreetMap) em vez do Google Maps, que cobra por uso.

### 12.3 Lugares na van (o que daria)
- Campo "Lugares para passageiros" no Perfil, junto de modelo e placa.
- Na Viagem do vanzeiro: "N de M lugares" e aviso quando lotar.
- No passageiro: "Van lotada" no lugar do "Vou", quando lotar.
- Ao aceitar pedido ou cadastrar passageiro: aviso quando o destino passa do número de lugares.
- Levar mais gente que os lugares é infração de trânsito: o controle protege o vanzeiro.
- **Decisões do dono:** (1) lotou: impedir novos "Vou" ou só avisar; (2) quem tem prioridade no lugar; (3) lista de espera; (4) uma van ou mais de uma por vanzeiro.

### 12.4 Plano por etapas
1. **Lugares na van** — agora, sem banco. **Decisões do dono (15/11/2026):** lotou → impede novos "Vou"; o lugar é de quem respondeu primeiro; sem lista de espera; uma van só. **Feita em 15/11/2026:** campo "Lugares para passageiros" no Editar do Perfil do vanzeiro (1 a 60; em branco = não informado, nada limita) e "Placa … · 15 lugares" no cartão Sua van; na Viagem, o selo "N de M lugares" (verde com lugar livre, âmbar lotada, vermelho se passou; sem lugares informados continua "N vão"); no passageiro (Início e aba Viagens), "Van lotada" apagado no lugar do "Vou" quando todos os lugares daquela viagem têm "Vou" — quem já disse "Vou" mantém o lugar, "Não vou" sempre funciona e libera o lugar; no resumo do cadastro de passageiro (e ao aceitar pedido), o aviso âmbar "Este destino fica com N passageiros e a van tem M lugares. Nem todos vão poder ir na mesma viagem." (só avisa). Exemplo: Sprinter com 15 lugares.
2. **Tela do mapa com van simulada** — agora, sem banco, para o dono ver e aprovar (inclui marcar o ponto de embarque no mapa). **Feita em 15/11/2026:** tocar no cartão "Situação da van" do Início do passageiro ("… · Ver no mapa") abre a tela **"Onde está a van"**: mapa (Leaflet + OpenStreetMap, gratuito) com o caminho da viagem (cidades em ordem), o **ponto de embarque da própria pessoa** (pino âmbar; os pontos dos outros nunca aparecem) e a **van** (círculo azul-marinho) durante a viagem; embaixo, a situação da van (a mesma do Início), "Está passando por <cidade>", "Chega no seu ponto em uns N min" (distância até o ponto, passando pelos pontos antes, a 40 km/h) e o aviso "Posição simulada. A posição de verdade, pelo GPS do vanzeiro, entra com o banco de dados."; **Marcar meu ponto no mapa** (tocar no mapa → Salvar ponto / Cancelar). A van simulada anda do último ponto atendido até o próximo passageiro conforme o vanzeiro marca "Embarcou"; no destino, fica lá; antes de começar e depois de encerrar, não aparece. Por enquanto o mapa só conhece as cidades dos exemplos (`coordenadasExemplo`); destino com cidade desconhecida mostra "O mapa deste destino ainda não está disponível." **Antes de lançar:** o mapa padrão do OpenStreetMap não é feito para uso comercial pesado; escolher um fornecedor (há opções gratuitas e pagas) e uma busca de endereço para as cidades novas.
3. **Tempo real de verdade** — junto com o banco (posição do vanzeiro chegando no passageiro; notificação "a van está chegando").
4. **App Android** — depois, para o GPS funcionar com a tela apagada.

---

## 13. Endereço preenchido pelo passageiro, com regra de distância (15/11/2026)

**Pedido do dono:** quem coloca o endereço é o passageiro (não o vanzeiro), e ele pode editar, mas com uma regra de distância, porque muito longe do combinado a van não passa.

**Decisões do dono:** ponto no mapa **obrigatório** no pedido; distância medida **a partir do ponto combinado**; limite de **1 km**; passou disso, **o vanzeiro aprova** (até lá vale o endereço antigo).

**Como ficou (feito em 15/11/2026):**
- **Pedido para entrar em 2 passos** (o passo aparece no subtítulo do cabeçalho): Passo 1 de 2 · Seus dados (nome, WhatsApp, Continuar); Passo 2 de 2 · Onde você embarca (cidade do caminho, "Seu endereço ou ponto de embarque" e o mapa "Toque no mapa onde você espera a van"; **Voltar** e **Pedir para entrar** lado a lado). Pedir só liga com cidade, endereço e ponto. Se o mapa não conhece as cidades do destino, o ponto não é exigido.
- **Vanzeiro ao aceitar:** no passo "Onde embarca", "Preenchido pelo passageiro, com o ponto marcado no mapa." — cidade e endereço só para conferir (não dá para mudar); ele define plano e valor. **Cadastrar direto** (sem pedido) continua: o vanzeiro preenche cidade e endereço (sem ponto; a regra usa o centro da cidade).
- **Passageiro muda onde embarca:** "Mudar onde embarco" em cada destino do Perfil e no mapa da van abre **"Onde você embarca"** (cidade, endereço, mapa). Até 1 km do ponto combinado (ou do centro da cidade, se não houver ponto): **Salvar** e muda na hora. Mais longe (ou outra cidade): o título do mapa avisa "A N km do ponto combinado (mais de 1 km): o vanzeiro precisa aceitar." e o botão vira **Enviar ao vanzeiro** → "Mudança enviada ao vanzeiro. Até ele aceitar, a van continua passando em: <endereço atual>." O endereço saiu do "Editar" do Perfil (lá ficam só nome e telefone).
- **Vanzeiro:** em Notificações, a seção **"Mudanças de endereço"** (nome, destino, distância, "Hoje" e "Quer mudar para", **Recusar** / **Aceitar**); conta no número do sininho. A pessoa recebe aviso "Endereço aceito" ou "Endereço não aceito" no sininho.
- **Notificação no celular (feita em 15/11/2026):** com o app minimizado e as notificações ativadas, o vanzeiro recebe "Mudança de endereço — <nome> quer mudar onde embarca em <destino> (N km do ponto combinado)"; tocar abre as Notificações. Mudança perto (até 1 km) não notifica, porque salva direto.

---

## 14. Ordem da busca na tela do destino: número e arrastar (15/11/2026)

**Pedido do dono:** em "Passageiros deste destino", mostrar quem é o 1º, 2º, 3º a ser buscado e trocar as setas ↑ ↓ por arrastar com o dedo (segurar no passageiro e mover para cima ou para baixo).

**Como ficou (feito em 15/11/2026):**
- O círculo de cada passageiro mostra o **número da busca no destino inteiro** (1, 2, 3…): as cidades seguem a ordem do caminho e, dentro de cada cidade, a ordem escolhida. **Correção (análise de 15/11/2026, item 3 da seção 15):** só é o mesmo número da aba Viagem quando todos vão; a aba Viagem numera só quem disse "Vou".
- **Sem setas.** Dica no alto da lista: "Ordem fixa da busca, com todos os passageiros. Segure e arraste para mudar." (texto mudado na Etapa P2) e o ícone de arrastar (⋮⋮) em cada passageiro.
- **Segurar um instante e arrastar** muda a ordem (só dentro da mesma cidade: as cidades seguem o caminho). Um **toque rápido** continua abrindo o passageiro; **deslizar rápido** continua rolando a tela. No computador, funciona com o mouse.

---

## 15. Análise de lacunas ponta a ponta (15/11/2026, pedida pelo dono)

Cada item foi confirmado rodando o app (não é suposição).

### 15.1 Erros (o app faz algo errado)
1. **Mudança de endereço "fantasma":** se o passageiro sai do destino, é removido ou o destino é excluído com uma mudança de endereço aguardando, ela continua para o vanzeiro; "Aceitar" muda o endereço de quem já saiu e avisa essa pessoa.
2. **Vanzeiro troca a cidade, o ponto no mapa fica na cidade antiga:** o mapa, o "chega em uns N min" e a regra de 1 km passam a usar o lugar errado.
3. **Número da ordem diferente entre telas:** no destino a Fernanda é a 3ª; na Viagem do dia, a 1ª (lá só aparece quem vai). **Decisão do dono:** manter cada tela com o seu sentido e explicar, ou mostrar a ordem fixa nas duas.

### 15.2 Faltas de proteção ou clareza
4. **Recusar mudança de endereço sem confirmação** (Recusar pedido pergunta antes).
5. **"Seu ponto" no centro da cidade** para quem foi cadastrado pelo vanzeiro e nunca marcou; e marcar pela primeira vez a mais de 1 km do centro exige aprovação do vanzeiro, à toa.
6. **"Abrir no mapa" do vanzeiro ignora o ponto marcado** (abre pelo endereço escrito).

### 15.3 Faltas que pesam no piloto real
7. **O mapa só conhece as 8 cidades dos exemplos:** com outras cidades, o mapa some, o ponto deixa de ser obrigatório e a regra de 1 km quase não funciona. Precisa de busca de cidade/endereço.
8. **Política de Privacidade desatualizada:** não fala do ponto no mapa (localização), das notificações no celular nem do servidor do mapa (OpenStreetMap recebe o endereço de internet).

### 15.4 Plano
- **Etapa P1:** itens 1, 2, 4 e 5. **Feita em 15/11/2026:** (1) a mudança de endereço aguardando vira "cancelada" quando a pessoa sai, é removida ou o destino é excluído, some das Notificações do vanzeiro e nunca é aplicada a quem não está mais no destino; (2) quando o vanzeiro muda a cidade de embarque de um passageiro, o ponto no mapa é apagado, com o aviso "Mudou a cidade: o ponto que o passageiro marcou no mapa será apagado. Ele marca de novo." (mudar só o endereço mantém o ponto); (4) "Recusar" mudança de endereço pergunta "Recusar a mudança de <nome>? Continua valendo: <endereço>. Não dá para desfazer."; (5) sem ponto marcado, o mapa da van não mostra pino falso: aparece "Você ainda não marcou o seu ponto no mapa." e o botão "Marcar meu ponto no mapa"; marcar pela primeira vez na mesma cidade salva direto (outra cidade continua indo para o vanzeiro).
- **Etapa P2:** item 3 (depois da decisão do dono) e item 6. **Decisão do dono: A** (cada tela com o seu sentido, com explicação). **Feita em 15/11/2026:** na tela do destino, a dica diz "Ordem fixa da busca, com todos os passageiros. Segure e arraste para mudar."; na aba Viagem, a lista é "Quem vai · na ordem de hoje" (numera só quem disse "Vou"); "Abrir no mapa" na busca abre o Google Maps no ponto marcado pelo passageiro (coordenadas) e, sem ponto, no endereço escrito.
- **Etapa P3 (antes do piloto real):** itens 7 e 8. **Feita em 15/11/2026:** (7) o mapa aprende cidades novas: ao salvar um destino, e ao abrir uma tela com mapa, o app procura no mapa gratuito do OpenStreetMap (Nominatim) as cidades que ainda não conhece, só no Brasil, uma por segundo, dando preferência à que fica perto da primeira cidade já conhecida do caminho; o que acha fica guardado; sem internet, tenta de novo depois; cidade não achada (erro de digitação) não é procurada de novo. **Limites:** se a **origem** for uma cidade nova com nome repetido em outro estado (ex.: Cambará PR e RS), ela pode cair no lugar errado, porque é a primeira procurada (vale conferir no mapa); o serviço gratuito é para uso leve: serve para o piloto, mas para vender a muitos vanzeiros será preciso um serviço pago. (8) A Política de Privacidade passou a dizer: ponto de embarque no mapa (o que é, para que serve, que o vanzeiro vê e que nenhum passageiro vê o de outro), notificações no celular (só se ativar no Perfil), mapa e busca de cidades (OpenStreetMap recebe IP, navegador e o nome da cidade procurada, com link para a política deles) e a cópia do app no celular para abrir sem internet. **Quando o GPS ao vivo entrar, a Política precisa dizer isso também.** O contato do responsável continua "(a definir)" e o texto precisa da revisão do advogado.

---

## 16. O que falta para deixar pronto para o banco (análise de 16/11/2026, só leitura)

O código já está quase todo pronto para o banco (seções 11 e `docs/banco-de-dados.md`). Esta análise olhou o que quebraria com **vários vanzeiros, contas reais e o relógio de verdade**.

### 16.1 Ajustes de código antes do banco (um por vez)
- **Q1. Um perfil por vanzeiro.** O app guardava um único perfil de vanzeiro, e o painel do passageiro usava esse perfil para nome, van, **chave Pix**, WhatsApp e **lugares** da "Van lotada". Com dois vanzeiros, o passageiro veria o Pix e a van do outro. **Feito em 16/11/2026:** um perfil por vanzeiro; o painel do vanzeiro usa o próprio; cada tela do passageiro usa o vanzeiro **do destino ou da cobrança** (e, para quem saiu do último destino, o do destino de que saiu); vanzeiro desconhecido aparece em branco, nunca o de outro; a "Van lotada" usa os lugares da van do vanzeiro do destino. Para quem usa o app, nada muda na tela.
- **Q2. Lista de cidades do mapa no documento do banco** (para ficar guardada e compartilhada; sem isso cada celular procura de novo e gasta o limite do serviço gratuito). **Feito em 16/11/2026:** `docs/banco-de-dados.md` ganhou os conjuntos 2.13 Cidades no mapa (lista única para todos, procurada uma vez pelo servidor, com "conferida" para nomes repetidos em outros estados) e 2.14 Celulares para notificar; o servidor ganhou as tarefas "procurar cidades novas" e "mandar as notificações"; a tabela da seção 4 ganhou `coordenadas-store.ts` e `notificacoes.ts`. Só documento.
- **Q3. Dinheiro em centavos** (decidir e escrever no documento; hoje os valores são números com vírgula e as contas saem certas porque a tela arredonda). **Feito em 16/11/2026:** todo dinheiro do app é guardado em centavos (número inteiro: R$ 280,50 = 28050) — valor do plano, valor da falta e valores das cobranças, inclusive nos exemplos; só vira "R$ 280,50" na tela (`formatarReais`) e é lido do que a pessoa digita em `lerValor`; as contas usam só números inteiros. Na tela nada mudou (Financeiro R$ 1.661,00 / R$ 663,00 / R$ 530,00, Juliana R$ 460,00, desconto da Mariana R$ 250,00). Escrito no `docs/banco-de-dados.md` (seção 0).
- **Q4. Fuso de Brasília** na função única da hora (com o relógio real, depois das 21h outro fuso já seria o dia seguinte: prazo "noite anterior", vencimentos e viagem do dia sairiam errados). **Feito em 16/11/2026:** `src/lib/agora.ts` ganhou `emBrasilia` (qualquer momento → data e hora de Brasília, "America/Sao_Paulo") e um ponto único de onde vem o "agora" (`relogio`). Hoje continua fixo em 13/11, 05:10; com o banco, só essa linha muda para `emBrasilia(new Date())`. Testado nos horários perigosos (20:30, 22:30, 23:59 e meia-noite; virada do mês e do ano) e com o computador em outros fusos (Japão e UTC). Nada muda na tela.
- **Q5. Guardar a hora da resposta "Vou / Não vou"** (prova de que avisou dentro do prazo, que dá o desconto da falta). **Feito em 16/11/2026:** cada resposta aceita guarda o momento em que foi dada e qual era o prazo ("AAAA-MM-DD HH:MM", Brasília; se a pessoa muda, vale o da última); resposta recusada (prazo fechado, van lotada) não guarda nada; a falta com desconto passa a levar "avisou em" (`src/lib/respostas-store.ts`, `src/lib/cobrancas-store.ts`). Nada muda na tela. **Com o Q5, os ajustes de código da seção 16.1 estão todos feitos.**

### 16.2 Decisões do dono antes do banco
- Cancelar a viagem de um dia (feriado): vai ter? O mensalista ganha desconto?
- Uma mesma conta pode ser vanzeiro **e** passageiro, ou cada conta é uma coisa só?
- Contato do responsável na Política de Privacidade e revisão do advogado.

### 16.3 Cuidado para o dia do banco
- Ao **sair da conta**, apagar a cópia do app guardada no celular (ela vai ter dados pessoais nas telas).

### 16.4 O que só acontece junto com o banco
Login real; relógio real; números feitos pelo banco; tirar os exemplos; "carregando" e aviso de sem internet; os dois celulares se atualizando na hora; tarefas automáticas no servidor; fila do que foi feito sem sinal; notificação com o app fechado e GPS ao vivo; segurança de quem vê o quê conferida pelo banco.

---

## 17. Análise do que falta finalizar antes do banco (16/11/2026, pedida pelo dono)

Nada quebrado no código. O que falta:

### 17.1 Eu faço (sem banco), uma etapa por vez
- **R1. Termos de Uso atualizados (feito em 16/11/2026; falta a revisão do advogado):** faltam as regras que mexem com dinheiro e com o lugar na van — desconto de falta só para quem avisou "Não vou" no prazo; ao sair do destino, pendentes canceladas e devendo continua; van lotada (o lugar é de quem respondeu "Vou" primeiro); mudar onde embarca (até 1 km na hora, mais longe o vanzeiro aprova); cobrança nunca é editada (só paga ou cancelada).
- **R2. Fonte da verdade e contraprova iguais ao app de hoje (feito em 16/11/2026: aviso "Como ler" no topo, trechos antigos marcados com "Atualizado em 16/11:", caixinhas velhas anotadas):** as seções do começo (13/11) ainda dizem, por exemplo, que o sininho do passageiro "não faz nada", que recusar pedido "não avisa" e que "não existe histórico de viagens"; a contraprova tem caixinhas velhas sem marcar de coisas já feitas.
- **R3. Limpeza e bibliotecas (feito em 16/11/2026: saíram a função das setas `moverPassageiro`/`moverNaCidade` e o dado `viagemHoje`; a "seroval" e a "seroval-plugins" foram fixadas na 1.6.12 em `package.json` (overrides), o que tira o único alerta de segurança que ia para o app; os alertas que sobraram são de ferramentas de trabalho que não vão para o celular; a formatação não foi mexida de propósito):** tirar o que sobrou sem uso (função das setas ↑ ↓, dado de exemplo `viagemHoje`); atualizar com cuidado as bibliotecas com alerta de segurança (das 28, só a que monta as páginas — "seroval", moderado — vai para o app de verdade; as outras, inclusive a crítica, são ferramentas de trabalho). Os 1.204 avisos de formatação **não** serão arrumados de uma vez (reescreveria 134 arquivos e atrapalharia o Lovable).

### 17.1.1 Decisões do dono (16/11/2026)
- **Feriado: SIM, sem desconto.** O vanzeiro pode cancelar a viagem de um dia só (feriado, faculdade sem aula); os passageiros recebem aviso; o mensalista **não** ganha desconto (o feriado já está dentro do valor do mês). Quem paga por viagem ou diário não paga, porque não embarca.
- **Uma conta com dois papéis: SIM.** A mesma conta pode ser vanzeiro e passageiro e troca de painel no Perfil (como hoje).
- **iPhone SE (decisão C): SIM, diminuir** o cabeçalho azul de Entrar, Criar conta e "Como você vai usar o app?" só em celulares pequenos, para não rolar.

**Plano (uma etapa por vez, depois do "pode seguir" do dono):**
- **Etapa S1 — Cancelar a viagem de um dia** (sem banco; **feita em 16/11/2026**: no destino, o cartão "Dias sem viagem" com **Cancelar a viagem de um dia** (escolhe o dia entre os próximos com viagem e o motivo, até 60 letras; a janela avisa "Os passageiros recebem um aviso. Quem paga por mês ou quinzena não ganha desconto.") e a lista dos dias cancelados com **Desfazer**; na aba Viagem, antes de sair, o atalho **Não vai ter viagem hoje**; o dia cancelado some do Início, da aba Viagem, das viagens do passageiro e dos avisos de prazo, e não gera falta nem cobrança; os passageiros recebem o aviso "Sem viagem — Não vai ter viagem hoje, em <destino>. Motivo: <motivo>" e, ao desfazer, "Vai ter viagem"; viagem já começada não pode ser cancelada; editar o destino mantém os dias cancelados). Plano original: botão na aba Viagem e no destino para "Não vai ter viagem neste dia", com confirmação e motivo; a viagem some do Início, da aba Viagem e das Viagens do passageiro naquele dia; os passageiros recebem aviso; nada de desconto; dá para desfazer antes do dia.
- **Etapa S2 — Cabeçalho menor no iPhone SE** nas 3 telas de entrada. **Feita em 16/11/2026:** só em telas com até 700 de altura (iPhone SE), menos espaço em volta do título no bloco do alto de Entrar e Criar conta e no topo e nos cartões de "Como você vai usar o app?". Antes, no iPhone SE: Entrar rolava 39px, Criar conta 70px, "Como você vai usar o app?" 69px; agora nenhuma rola em nenhum dos três tamanhos (390×844, 360×740, 375×667). Nos celulares comuns, o visual aprovado ficou igual (fotos de antes e depois idênticas). **Com isso, o erro 11 da seção 10.2 está resolvido.**
- Depois: banco de dados, quando o dono mandar.

### 17.2 Depende do dono
- **Decisões:** feriado (cancelar a viagem de um dia? o mensalista ganha desconto?); uma conta pode ser vanzeiro e passageiro?; iPhone SE (decisão C, cabeçalho das telas de entrada). **Respondidas em 16/11 (ver 17.1.1).**
- **Política e Termos:** contato do responsável e revisão do advogado (depois do R1).
- **Testar no celular de verdade, de preferência com o vanzeiro do piloto:** app instalado em tela cheia (Android e iPhone), abrir sem sinal, notificações, mapa com ruas e busca de cidade nova, arrastar a ordem com o dedo.

---

## 18. Novidades que encantam (análise de 16/11/2026, pedida pelo dono)

Pensado no dia real: o vanzeiro dirige com uma mão, cedo, em estrada com pouco sinal, e resolve tudo pelo WhatsApp; o passageiro quer saber se a van vem, não quer lembrar de responder todo dia e precisa pagar sem errar.

### 18.1 Já, sem banco
1. **Modo direção com voz (vanzeiro):** o app fala quem é o próximo ("Próximo passageiro: Mariana Souza, Praça Rui Barbosa, em Jacarezinho"), a próxima descida na volta, a parada, a conferência e a chegada. Segurança: não precisa ler a tela dirigindo. Voz do próprio celular, sem internet.
2. **"Vou sempre" e "Não vou de… até…" (passageiro):** acaba com o "esqueci de responder e a van não passou". **Precisa de decisão do dono** (mexe no jeito de cumprir a regra "quem não confirma até o prazo não entra na busca"). **Atualizado em 16/11:** decidido pelo dono e feito na T3 (ver 18.3).
3. **Pix com o valor certo (copia e cola) + "Cobrar quem está devendo" no WhatsApp, um por um, com a mensagem pronta.**
4. **Resumo do dia para o grupo da van** (texto pronto: saída, quantos vão, ordem). **Atualizado em 16/11:** feito na T4 (ver 18.3).
5. **"Seu mês na van"** (recebido, viagens, quem paga em dia, falta receber; com gastos, "sobrou R$ X"). **Atualizado em 16/11:** feito na T5, sem gastos por enquanto (ver 18.3). **Atualizado em 16/11:** gastos feitos na T6 (ver 18.3).
6. **Responder Vou / Não vou pela própria notificação** (com o app fechado, só com o banco).

### 18.2 Carro-chefe, junto com o banco
7. **"Compartilhar minha viagem":** a família acompanha a van no mapa por um link, sem instalar nada; recebe "embarcou" e "chegou". Confiança e segurança (decisivo no transporte escolar).

### 18.3 Plano
- **T1. Modo direção com voz** — **feito em 16/11/2026:** na viagem em andamento, o botão "Ligar a voz" / "Voz ligada" no cabeçalho (no iPhone SE, só o ícone de alto-falante no canto, para a tela da busca continuar cabendo); com a voz ligada, o celular fala em português do Brasil a frase do momento, com as mesmas palavras da tela — ao ligar, a cada "Embarcou" / "Não estava no ponto", na volta ("Próxima descida: …"), na parada e na conferência ("Confira quem está na van") e na chegada ("Chegamos em <destino>"); desligada, não fala nada; começa desligada e fica ligada até recarregar a página; onde o celular não tem voz, o botão não aparece.
- **T2. Pix com valor + cobrar quem está devendo** — **feito em 16/11/2026:** (1) Passageiro, na cobrança, "Pagar com Pix": botão "Copiar Pix copia e cola (R$ X)" — o código já leva o valor, a chave e o nome do vanzeiro; a pessoa cola no app do banco, na opção Pix copia e cola. Continua "Copiar só a chave". Quando a chave são 11 números soltos (pode ser CPF ou celular, não dá para saber), o app não cria o código e mostra só a chave, como antes. (2) Vanzeiro, no Financeiro: botão "Cobrar quem está devendo (N)", só quando alguém está devendo (vencida e não paga; pendente não entra). Abre a lista das pessoas, uma por linha, com o total e "Cobrar"; cada toque abre o WhatsApp com a mensagem pronta (as cobranças em atraso, o total, a chave Pix e o Pix copia e cola com o total) e a linha fica "Enviado". O vanzeiro envia uma por vez; o app nunca envia sozinho. O código Pix é feito no próprio celular, pelo padrão do Banco Central, sem servidor. A cidade no código é a origem do destino (o perfil do vanzeiro ainda não tem cidade).
- **T3. "Vou sempre" e "Não vou de… até…"** — **feito em 16/11/2026.** Decisões do dono (16/11): (a) "Vou sempre" conta como "Vou" em todo dia de viagem, e a pessoa ainda pode trocar para "Não vou" até o prazo; (b) os dias de "Não vou de… até…" contam como "Não vou" avisado no prazo, então dão o desconto de faltas (só Mensal e Quinzenal com desconto, como hoje); (c) o vanzeiro vê só "Vou" / "Não vou", igual a quem respondeu na hora; (d) vale um destino por vez. Como funciona: na aba Viagens do passageiro, a parte "Para não esquecer de responder" tem um cartão por destino com a chave "Vou sempre" e o botão "Não vou de… até…" (primeiro e último dia; não pode começar antes de hoje). Os períodos marcados aparecem com "Tirar". O que a pessoa responde no dia sempre vale mais; um período de "Não vou" vale mais que o "Vou sempre". Uma escolha só conta para um dia se foi feita antes do prazo daquele dia; desligar ou tirar depois do prazo não muda aquele dia; quando o vanzeiro inicia a viagem, as respostas daquele dia ficam guardadas como estavam. Van lotada: o "Vou" automático só pega lugar livre (quem ligou o "Vou sempre" primeiro fica com o lugar); quem não couber fica "sem resposta" e recebe o aviso de sempre. A regra "quem não confirma até o prazo não entra na busca" continua igual: o "Vou sempre" é uma confirmação deixada pronta.
- **T4. Resumo do dia para o grupo da van** — **feito em 16/11/2026.** Decisões do dono (16/11): só nome e cidade (ninguém do grupo vê o endereço dos outros); lista quem ainda não respondeu, com o prazo; botão na aba Viagem, antes de sair. Como funciona: na tela da viagem de hoje, no fim da lista (acima de "Não vai ter viagem hoje"), o botão "Mandar resumo no grupo" abre o WhatsApp com o texto pronto, sem número, para o vanzeiro escolher o grupo: "Viagem de hoje (dia): destino", "Saída · volta", "Vão: N pessoas (a van tem X lugares)", "Ordem da busca" (1. Nome (Cidade)…) e, só enquanto o prazo está aberto, "Ainda não responderam (até HH:MM): …" com o lembrete "Quem não confirmar até o prazo fica fora da busca". Mostra o primeiro nome; quando dois têm o mesmo primeiro nome, o nome completo. O app nunca envia sozinho.
- **T5. "Seu mês na van"** — **feito em 16/11/2026.** Decisões do dono (16/11): sem gastos por enquanto; abre pelo Financeiro; "quem paga em dia" com o número e os nomes; este mês e os anteriores. Como funciona: no Financeiro, o botão "Seu mês na van" no cabeçalho abre uma tela própria, com setas para trocar de mês (do mês mais antigo com cobrança ou viagem até o atual). Mostra: Recebido (cobranças pagas que vencem no mês — o mesmo número do "Recebido" do Financeiro), Falta receber (cobranças do mês ainda não pagas), Viagens feitas e quantos embarques, e "Pagaram em dia: X de Y". Embaixo, os nomes em grupos: Devendo (com o valor), Pagaram atrasado, Pagaram em dia e Pendentes (ainda não venceu), cada um com o destino embaixo do nome. Cada passageiro é contado por destino (quem está em dois destinos aparece duas vezes). Cobranças canceladas não entram. Y conta só quem já pagou ou já venceu; quem só tem cobrança pendente fica em "Pendentes".
- **T6. Gastos da van no "Seu mês na van"** — **feito em 16/11/2026.** Decisões do dono (16/11): lista pronta de tipos (Combustível, Manutenção, Pedágio, Documentos e seguro, Outros — em "Outros" o vanzeiro escreve o que foi); errou, apaga e anota de novo (não edita); o gasto é do mês, não de um destino; "Sobrou" = Recebido − Gastos. Como funciona: no alto do "Seu mês na van", o cartão "Sobrou R$ X" em verde (ou "Faltou R$ X" em vermelho, quando os gastos passam do recebido), com "Recebido R$ … − gastos R$ …" embaixo. Depois dos números, "Gastos da van · total", com cada gasto (tipo, dia, valor e lixeira para apagar, com confirmação) e o botão "Anotar gasto": escolhe o tipo, o valor e o dia (até hoje). Os meses com gasto também aparecem nas setas. Os gastos são só do vanzeiro; passageiros nunca veem.
- **T7. Aviso no sininho do vanzeiro para o "Não vou de… até…"** — **feito em 16/11/2026.** Decisão do dono (16/11): avisa quando o passageiro marca e também quando tira. Texto: "Juliana marcou "Não vou" de 16/11 até 17/11, em <destino>" (um dia só: "em 20/11"); ao tirar, o mesmo aviso vira "Juliana tirou o "Não vou" de 16/11 até 17/11, em <destino>" (um aviso por período, para o vanzeiro não ficar com a informação velha). Usa o tipo de aviso que já existe, "Resposta de passageiro". O "Vou sempre" não gera aviso (o vanzeiro vê só "Vou").
- **Com o banco:** "Compartilhar minha viagem".

## 19. Limpeza e organização antes do banco (análise de 16/11/2026, pedida pelo dono)

**Como está:** as regras de preparo para o banco (seção 7, Etapa C) estão cumpridas: nenhuma tela lê `src/data/exemplo.ts` direto; a data e a hora vêm só de `src/lib/agora.ts`; todo dado leva o vanzeiro dono; `docs/banco-de-dados.md` lista tudo (seções 2.1 a 2.16). 297 testes, tipos e build sem erro.

### 19.1 O que falta arrumar
1. **Código morto e desorganizado (não muda nada na tela):** funções sem uso (`marcarComoLido`, `limparSessao`); nome enganoso (`obterRespostasParaTeste` é usado pelo app → `obterRespostasDoDia`); contas repetidas (lista de meses em 3 lugares, uma delas numa tela; "somar dias" em 2; "hoje / dia" em 2; "primeiro nome" em 2); o botão redondo do cabeçalho (Voltar, Viagens feitas, Seu mês na van) copiado em 10 telas; identificadores novos criados de 5 jeitos diferentes, com a hora (dois no mesmo instante podem repetir); cerca de 30 funções marcadas para uso fora do arquivo sem precisar; funções misturadas em arquivos de tela (avisos do "react-refresh"). Os 1.368 avisos de formatação continuam **sem mexer** (decisão da R3).
2. **Peças e bibliotecas do Lovable nunca usadas:** 40 peças visuais prontas (`src/components/ui`) e 33 bibliotecas instaladas sem uso. Não vão para o celular, mas pesam na instalação e aparecem nos alertas de segurança. **Precisa da decisão do dono.**
3. **"Cada vanzeiro só vê o que é dele" já nas funções:** hoje só gastos e exclusões separam por vanzeiro; destinos, passageiros, cobranças, viagens e avisos mostram tudo da memória (não aparece porque os exemplos têm um vanzeiro só). Com o banco quem separa é o banco, mas fazer já nas funções deixa as telas prontas e testáveis com dois vanzeiros.

### 19.2 Plano (uma etapa por vez)
- **U1. Limpeza de código** (item 1) — **feito em 16/11/2026.** Saíram as funções sem uso (`marcarComoLido`, `limparSessao`) e 7 importações esquecidas em 7 arquivos; `obterRespostasParaTeste` virou `obterRespostasDoDia`; datas e nomes ficaram num lugar só, `src/lib/datas.ts` (lista de meses, somar dias, "hoje / sex, 13 de nov", nome do mês, primeiro nome), usado no lugar das 9 cópias (a tela do Financeiro não tem mais a própria lista de meses); o botão redondo do cabeçalho virou uma peça só, `src/components/app/PilulaDoCabecalho.tsx` (`PilulaDoCabecalho` e `BotaoVoltar`), nas 11 telas; identificadores novos saem de uma função só, `novoId` em `src/lib/ids.ts`, que não repete; 30 funções e constantes deixaram de ser marcadas para uso fora do próprio arquivo (os tipos de dados continuam marcados, de propósito: descrevem o que o banco vai guardar); os avisos de "react-refresh" das peças do app sumiram (sobram só nas peças prontas do Lovable, assunto da U2). Nada mudou para quem usa o app.
- **U2. Tirar peças e bibliotecas sem uso** (item 2) — **feito em 16/11/2026, com a aprovação do dono.** Em `src/components/ui` ficaram só as 6 peças que o app usa (alert-dialog, button, checkbox, input, label, switch); saíram as outras 40 e `src/hooks/use-mobile.tsx`. Saíram 31 bibliotecas sem uso do `package.json` / `bun.lock` (formulários, gráficos, calendário, menus, carrossel, avisos flutuantes, `zod`, `date-fns` etc.); ficou a `@tanstack/router-plugin`, por segurança. Os arquivos instalados caíram de 433 MB para 350 MB. Os alertas de segurança continuam 26: todos são de ferramentas de trabalho (montar, testar e conferir o código), nenhum vai para o celular (a `zod` com alerta vem junto com as ferramentas que montam as telas). Se o Lovable precisar de alguma peça no futuro, ele instala de novo. Nada mudou para quem usa o app.
- **U3. Cada vanzeiro vê só o que é dele nas funções** (item 3) — **feito em 16/11/2026.** O painel do vanzeiro (`src/routes/vanzeiro.tsx`) diz quem está olhando (`PainelDoVanzeiro`, em `src/lib/painel.ts`); lá dentro, as funções de leitura devolvem só o que é desse vanzeiro: destinos, passageiros, pedidos, mudanças de endereço, cobranças, viagens do dia e viagens feitas (os gastos e os avisos já eram separados). O painel do passageiro não é cortado por isso: as funções dele já mostram só as matrículas da própria pessoa. Com o banco, quem faz esse corte é o banco, e as telas continuam iguais. Para o vanzeiro dos exemplos nada mudou (todos os exemplos são dele).

**Seção 19 completa (U1, U2, U3).** O código está limpo e organizado para o banco. O que falta antes do banco são as pendências do dono (acima).

Pendências do dono (não dependem do código): contato da Política de Privacidade; advogado revisar Termos e Política; teste no celular com o vanzeiro do piloto; dados reais do piloto; (opcional) cidade no perfil do vanzeiro, para o Pix copia e cola.

## 20. Leitura profunda: deixar o app "liso" e o banco fácil (análise de 16/11/2026, pedida pelo dono)

**Como está:** código limpo (seção 19), as mesmas regras em todas as telas, números batendo entre as telas, 300 testes.

### 20.1 O que foi achado
1. **Documento do banco com trechos antigos** (ordem de busca, pedido aceito, embarques e faltas, tipos de aviso) e um comentário antigo no código sobre as setas ↑ ↓. Faltava a lista única das regras que o banco precisa garantir sozinho.
2. **Relógio parado** em 13/11 às 05:10: num teste de verdade, "hoje" é sempre 13/11 e o prazo nunca passa.
3. **Recarregar apaga tudo**, até a viagem no meio.
4. **As ações não dizem quando não deram certo.** Hoje as telas escondem o que não pode ser feito; com o banco, toda ação demora e pode falhar (sem sinal, prazo passou, van lotou).
5. O que só fica de verdade com o banco (normal): login aceita qualquer e-mail; o Google só avança; "Esqueci a senha" só mostra a mensagem; o mapa de "Onde está a van" é uma animação; notificação só com o app aberto.

### 20.2 Decisões do dono (16/11/2026)
- Fazer V1, V2, V3 e V4 (abaixo), uma por vez.
- Juntar o cadastro feito pelo vanzeiro com a conta da pessoa **pelo telefone**, com confirmação do vanzeiro (`docs/banco-de-dados.md`, seção 2.17).
- O banco será um **Supabase próprio** do dono (`docs/banco-de-dados.md`, seção 8), só quando o dono disser "pode colocar o banco".

### 20.3 Plano (uma etapa por vez)
- **V1. Documento do banco acertado** — **feito em 16/11/2026:** trechos antigos corrigidos (ordem de busca, pedidos, embarques e faltas, os 12 tipos de aviso — "pedido novo" é só notificação no celular); seções novas 2.17 (juntar pelo telefone), 7 (as 20 regras que o banco garante sozinho) e 8 (método com o Supabase próprio: o que o dono faz, o que o Claude faz, e a entrada em 10 etapas, W1 a W10, uma parte por vez, com volta para a memória se algo der errado). Comentário das setas ↑ ↓ corrigido em `src/data/exemplo.ts`. Só documento: nada mudou no app.
- **V2. Ações com resposta** — **feito em 16/11/2026.** Peça única `src/lib/acoes.ts`: cada ação devolve `Resultado` ("deu certo" ou "não deu, porque…") e as telas chamam as ações por `fazer(...)`. Quando não dá certo, aparece no alto da tela, nos dois painéis, uma faixa vermelha com o motivo em português simples (ex.: "O prazo para responder já passou.", "A van lotou. Não tem mais lugar nesta viagem.", "Esta cobrança já estava paga.", "A viagem de hoje deste destino está acontecendo. Espere ela terminar."); some sozinha em 6 segundos ou no X, e fica por cima de uma janela aberta. "Salvando…" só aparece se a ação demorar (com o banco); hoje, na memória, nunca aparece. Se a ação quebrar (sem sinal, com o banco): "Não deu para salvar. Confira o sinal e tente de novo." As telas que salvam e seguem (perfil, meus dados, destino, passageiro, endereço, gasto, "Não vou de… até…", excluir conta) só seguem quando deu certo; se não deu, a janela fica aberta. Ações com resposta: respostas, Vou sempre, Não vou de… até…, gastos, pago e cancelar cobrança, salvar destino (código de convite repetido), dia sem viagem e desfazer, pausar e excluir destino, sair e remover do destino, excluir conta, salvar passageiro (aceitar pedido), reordenar, recusar pedido, aceitar/recusar endereço, mudar onde embarco, pedir para entrar, meus dados, perfil do vanzeiro, iniciar viagem e cada passo da viagem. Quando dá certo, nada mudou nas telas.
- **V3. Relógio de verdade** — **feito em 16/11/2026.** O app usa o dia e a hora reais de Brasília (`src/lib/agora.ts`): o prazo passa de verdade, a cobrança vence, a viagem de hoje é de hoje, o "Bom dia / Boa tarde / Boa noite" segue a hora. Os testes automáticos continuam no momento fixo dos exemplos (sexta, 13/11/2026, 05:10), para conferirem sempre as mesmas contas. **Os exemplos andam junto:** cada data de `src/data/exemplo.ts` anda semanas inteiras até a sexta mais recente (o "hoje" dos exemplos), para continuar no mesmo dia da semana (o domingo de exemplo continua domingo); os pagamentos de Mensal e Quinzenal ficam no dia do mês certo; o histórico começa no 1º do mês anterior; tudo o que venceu até o fim do mês anterior está pago. Perto da virada do mês, as mensalidades do mês dos exemplos que já venceram aparecem como "Devendo" (ninguém marcou como pago) — é o que aconteceria de verdade. Respostas de exemplo ("Vou" / "Não vou") valem para o dia de hoje de verdade. Observação: quando o celular abre a cópia guardada sem sinal de outro dia, ou bem na virada de um minuto, a página se acerta sozinha no celular (aviso técnico "hydration", sem efeito para quem usa).
- **V4. Guardar no celular durante o teste:** os dados não somem ao recarregar (não é banco: cada celular só vê o que é dele). **Atualizado em 16/11: cancelada pelo dono** — o banco entra agora, então não precisa guardar no celular.

## 21. Banco de dados (Supabase próprio) — iniciado em 16/11/2026 com o "pode colocar o banco" do dono

Projeto Supabase do dono: `ovanzeiro` (organização `ovanzeiro-oficial`), endereço `https://rnziztwicggdekmpwpgy.supabase.co`. A chave pública (publishable) fica no app (`src/lib/supabase.ts`); a chave secreta nunca. Como esta sessão de trabalho não alcança o Supabase (rede do ambiente), o dono aplica cada arquivo de `supabase/migrations/` no **SQL Editor** do Supabase (colar e clicar em Run), e o teste com o banco é feito no celular. As etapas seguem `docs/banco-de-dados.md`, seção 8.3 (W1 a W10), uma por vez.

- **W1. Login e conta** — **feito no código em 16/11/2026** (falta o dono rodar o SQL e testar no celular). Tabela `contas` (nome, aceite dos Termos, papéis, último papel), criada sozinha no cadastro; cada pessoa só vê a própria (regra 1); cadastro por e-mail sem aceite é recusado. Telas: Entrar com e-mail e senha de verdade (o último painel usado abre primeiro); Criar conta de verdade (se o Supabase pedir, aparece "Confirme seu e-mail"); Esqueci minha senha manda o e-mail de verdade, e o link abre a tela nova **Criar senha nova**; Sou vanzeiro / Sou passageiro fica guardado na conta; Sair e Excluir minha conta de verdade. Sem login, os painéis mandam para Entrar. Os problemas aparecem na faixa vermelha (também nas telas de login). **Atenção:** a partir da W1, quem entra começa com o app vazio (os exemplos eram do vanzeiro de exemplo); até cada parte ir para o banco (W2 a W8), o que for criado some ao recarregar. **Google:** o botão já chama o Google, mas só funciona depois que o dono ligar o Google no Supabase (W1b), e aí o aceite dos Termos do Google também é gravado.

- **Formatação do que é digitado** — **feito em 16/11/2026.** Decisões do dono (16/11): nomes, cidades e endereços no formato "Mariana Souza"; os textos do app continuam como estão. Regras em `src/lib/formatos.ts`, usadas em todo lugar que salva: **nome de pessoa** sempre "Mariana Souza" (mesmo digitado "mariana SOUZA"); **lugares, endereços, destinos, paradas e modelo da van** no mesmo formato, mas siglas curtas digitadas em maiúscula continuam ("UENP Jacarezinho", "VW"); palavras como da, de, do, dos, e ficam minúsculas no meio ("Santo Antônio da Platina"); **telefone** só números (mostrado "(43) 99812-3456"); **placa** "ABC-1D23"; **e-mail** minúsculo (também ao entrar e no "Esqueci a senha"); **chave Pix** de e-mail minúscula; **motivos e descrições** com a primeira letra maiúscula ("Feriado"); valores em centavos (já era assim).

- **W7. Dinheiro** — **feito em 16/11/2026.** O app continua criando as cobranças sozinho, com as mesmas regras (viagem feita, próximo mês, "Não vou" no prazo); cada cobrança nova, embarque e falta vai para o banco logo em seguida, só pelo celular do vanzeiro dono. "Marcar como pago" (Dinheiro ou Pix), "Cancelar" (com motivo) e os gastos da van (anotar e apagar) são salvos no banco primeiro e depois aparecem. O banco recusa editar cobrança, mexer em cobrança paga ou cancelada e gasto com data depois de hoje. O passageiro só lê as cobranças dele (nunca marca como pago); outra pessoa não vê nada. Desde 16/11 esta sessão alcança o Supabase pelo conector: o SQL não precisa mais ser colado pelo dono.

- **W8. Avisos do sininho** — **feito em 16/11/2026.** O app continua criando os avisos sozinho (resposta do passageiro, "Não vou de… até…", a van saiu, prazo chegando, cobrança vencendo ou vencida, pedido aceito, dia cancelado ou de volta). Cada aviso vai para o banco logo em seguida, pela função `salvar_aviso`: só cria aviso quem é do destino, só para alguém do destino, e o mesmo aviso nunca aparece duas vezes. Quando o passageiro muda a resposta, o aviso do vanzeiro é trocado pelo novo. Cada pessoa lê só os próprios avisos, ao entrar e a cada 30 s (no outro celular eles aparecem nesse tempo); abrir o sininho marca como lido no banco. SQL: `supabase/migrations/20261116170000_w8_avisos.sql` (cópia para colar: `supabase/SO-SQL-3-AVISOS.sql`).

- **W9. Tarefas do relógio no banco** — **feito em 16/11/2026.** A cada 5 minutos, mesmo com o app fechado em todos os celulares, o banco (`tarefas_do_relogio`, agendada pelo pg_cron do Supabase) faz o que depende da hora, com as mesmas regras e os mesmos identificadores do app (se o app já fez, não repete): (1) quando o prazo passa, quem avisou "Não vou" no prazo (no dia ou pelo "Não vou de… até…") ganha a falta e, se o plano tiver desconto, ela entra na próxima cobrança aberta; (2) Mensal e Quinzenal: quando uma cobrança vence, a próxima é criada (uma à frente de hoje); (3) avisos no sininho: prazo chegando (30 min antes, para quem não respondeu), cobrança vencendo (3 dias antes, para o passageiro) e cobrança vencida (para o vanzeiro). O app continua fazendo o mesmo quando está aberto. Ninguém pelo app consegue rodar essa tarefa. SQL: `supabase/migrations/20261116180000_w9_relogio.sql` e `20261116180100_w9_agendar.sql` (cópia para colar: `supabase/SO-SQL-4-RELOGIO.sql`).

- **W10. Avisos na tela do celular (push)** — **feito em 16/11/2026.** Quem toca em "Ativar" as notificações (Perfil) passa a receber os avisos na tela do celular mesmo com o app fechado. O celular guarda no banco o endereço de entrega dele (`guardar_celular`; um celular é de uma conta só: quem entra por último recebe). Quando nasce um aviso no sininho, ou um pedido para entrar, o banco chama a função do Supabase `avisos-no-celular` (`supabase/functions/avisos-no-celular`), que entrega a notificação nos celulares da pessoa (cada aviso uma vez só; se a pessoa mudou a resposta, o aviso novo é entregue). Tocar na notificação abre a tela de Notificações. As chaves das notificações são criadas pela própria função e ficam numa tabela que ninguém lê pelo app (nenhuma senha passa por pessoas). Celular que desligou as notificações é esquecido sozinho. **iPhone:** só recebe com o app instalado na tela inicial (regra da Apple). SQL: `supabase/migrations/20261116190000_w10_celular.sql` (cópia para colar: `supabase/SO-SQL-5-CELULAR.sql`).

- **Sem sinal na van (com o banco)** — **feito em 16/11/2026.** (1) A viagem continua sem internet: iniciar a viagem e cada toque (Embarcou, Não estava no ponto, paradas, conferência, chegada, volta, Desceu, encerrar) funcionam na tela e ficam guardados no celular, mesmo se o app for fechado; quando o sinal volta, vão para o banco sozinhos (só a versão mais nova da viagem, que já tem todos os toques). (2) O app abre sem sinal com os últimos dados lidos (destinos, passageiros, cobranças…): o celular guarda uma cópia do que leu do banco, apagada quando a pessoa sai da conta ou exclui a conta. (3) Cobranças, embarques, faltas e avisos criados sem sinal já esperavam e iam depois (W7 e W8). Ainda precisam de internet: responder Vou/Não vou, marcar como pago, pedidos e cadastros (aparece o aviso de sem resposta e nada muda).

---

<a id="controle-atual"></a>

## 22. Controle atual — revisão funcional por etapas

**Controle atualizado em 18/11/2026.** As conferências técnicas das etapas 6 e 7 estão registradas na [contraprova](contraprova.md#etapa-7-tecnica-e-roteiro). A análise para 100 motoristas e 1.500 passageiros identificou risco de somar somente a primeira página de cobranças. A correção lê todas as páginas e passou no cenário de 1.005 cobranças de R$ 30, total de R$ 30.150. O arquivo do financeiro publicado no Lovable foi conferido e corresponde à compilação corrigida. O botão «Não vou» distingue o cancelamento de uma presença confirmada do primeiro aviso de ausência. [Confirmação e avisos de cancelamento](contraprova.md#avisos-de-cancelamento). Os próximos pontos incluem carga em horário de pico, operação e recuperação do banco, seguidos pelo [roteiro no celular](roteiro-testes-celular.md) quando o dono decidir iniciá-lo. [Contraprova da paginação](contraprova.md#paginacao-financeiro).

**Aviso de chegada ao ponto.** O Lovable está publicado com o código do botão e do painel do passageiro. Com autorização do dono, a função de entrega foi atualizada e o Supabase de produção liberou o botão para contas autenticadas. Na busca, o botão aparece no cartão do próximo passageiro vinculado a uma conta. O teste de entrega com o app fechado continua na rodada final em celular. [Contraprova da ativação](contraprova.md#aviso-de-chegada-ativado).

**Chegada ao destino no painel do passageiro.** Ao registrar a chegada da ida, o Início mostra um cartão com a rota e o horário previsto de volta, quando configurado. O relógio usa a data da volta e chega a uma espera pelo motorista, que continua responsável por iniciar o retorno. A notificação da chegada ao destino ficou para outra etapa. [Contraprova do cartão de chegada](contraprova.md#cartao-chegada-ao-destino).

> **Para qualquer IA que for trabalhar aqui (Claude, GPT, Lovable ou outra):** leia esta seção 22 inteira, depois `CLAUDE.md` e o último registro de `docs/contraprova.md`. Trabalhe uma etapa de 22.6 por vez, registre a prova (22.8) e atualize 22.6 e a contraprova no fim. O que já está pronto está em 22.4a; como mexer no banco está em 22.1a.

### 22.1 Projeto, objetivo e limites da revisão

- **Único repositório deste trabalho:** `ovanzeiro-beep/van-and-pin-logo-studio`. Não usar diagnósticos de outro repositório como prova deste.
- **Versão de referência do código:** `c97607c466fd7b7c1607a9b6e26cfde752e5efba`, branch `main`, consultada em 17/11/2026. Se a `main` avançar, registrar a nova versão antes da próxima etapa; o Lovable também faz alterações.
- **App indicado pelo README:** <https://van-and-pin-logo-studio.lovable.app>. Esta revisão não confirmou que a versão publicada corresponde ao commit acima.
- **Banco apontado pelo código e acessível pela integração:** Supabase `ovanzeiro`, referência `rnziztwicggdekmpwpgy`; ligação em `src/lib/supabase.ts`.
- **Objetivo:** validar os fluxos essenciais já existentes de ponta a ponta e corrigir falhas comprovadas, preservando o visual e as regras aprovadas. Não reconstruir o app nem adicionar funções por suposição.
- **O que significa pronto:** cumprir os critérios das etapas do escopo, com evidências atuais e sem falhas críticas conhecidas. Não significa garantia de ausência de erros futuros nem um percentual calculado pela quantidade de telas.

### 22.1a Como mexer no banco (decisão do dono, vale para qualquer IA)

- O banco é o **Supabase próprio do dono** (`ovanzeiro`, `rnziztwicggdekmpwpgy`), **não** o banco embutido do Lovable (Lovable Cloud). O Lovable não administra este banco.
- **Não pedir mudanças ao agente do Lovable** (ele gasta créditos do dono; decisão de 16/11/2026). O Lovable só sincroniza o código com o GitHub e publica o app.
- **Toda mudança de estrutura do banco** fica registrada como arquivo em `supabase/migrations/` (nome `AAAAMMDDhhmmss_nome.sql`, uma etapa por arquivo, escrito para poder rodar de novo sem quebrar) e é aplicada no Supabase de um destes jeitos: (1) pela ferramenta do Supabase da IA (`apply_migration`), quando o dono autoriza; ou (2) pelo dono, colando o arquivo `supabase/SO-SQL-*.sql` correspondente no **SQL Editor** e clicando em **Run**. Depois de aplicar, conferir no banco (consulta de leitura) e registrar na contraprova.
- **Antes de aplicar:** testar o SQL numa cópia (Postgres local com as migrations) ou dentro de uma transação desfeita no final; nunca rodar scripts de limpeza ou de teste que gravam dados no banco real sem pedido do dono.
- **Nunca** colocar senha, chave secreta (service_role, `sb_secret_`, senha de app do Gmail) no código, nos documentos ou no chat. A chave pública (`sb_publishable_`) já está no app de propósito.
- A regra do bloco do Lovable em `AGENTS.md` ("não editar `supabase/migrations/`") vale para projetos com o banco do Lovable; **neste projeto prevalece esta decisão do dono**, porque o banco é dele.
- Publicar o app: depois do merge na `main`, publicar pelo Lovable (botão Publish, ou `deploy_project` pela integração, que não gasta créditos).

### 22.2 Como registrar uma situação sem confundir o dono

| Situação | Significado |
| --- | --- |
| A fazer | Ainda não começou nesta revisão; não significa que a função não existe. |
| Em análise | Estamos conferindo código, regras e comportamento. |
| Em correção | Há um problema reproduzido e uma mudança pequena em trabalho. |
| Aguardando validação | Parte pronta, mas falta uma prova indicada: banco, navegador ou celular. |
| Concluída | Todos os critérios aplicáveis foram verificados e a entrega foi registrada. |
| Bloqueada | Uma dependência concreta impede continuar; registrar o motivo e o responsável. |
| Adiada | Fora do escopo atual por decisão registrada do dono. |

Para cada função, separar quatro provas: **código presente**, **teste automático**, **comportamento no banco real** e **uso no celular**. Uma não substitui as outras. Consultar tabelas como administrador não prova que o passageiro ou o vanzeiro têm as permissões certas.

### 22.3 O que foi verificado agora

Ambiente: Node.js `24.22.1`, npm `11.9.0`; instalação com Bun `1.3.13` e `bun.lock` congelado, sem alterar dependências. Execução local sobre a versão de referência; somente documentação mudou na branch de trabalho.

| Evidência | Conferência de 17/11/2026 | Resultado e limite |
| --- | --- | --- |
| EV-01 | Repositório, `main` e instruções locais | Repositório e versão acima confirmados; `AGENTS.md` e `CLAUDE.md` lidos. |
| EV-02 | `bun install --frozen-lockfile` com Bun 1.3.13 | Instalação concluída; `package.json` e `bun.lock` preservados. |
| EV-03 | `npm test` | **364 testes em 70 arquivos passaram.** Os testes usam simulações; `src/test/setup.ts` bloqueia chamadas de rede e o modo `test` desliga o banco real. |
| EV-04 | `./node_modules/.bin/tsc --noEmit` | Passou, sem erro de tipos. |
| EV-05 | `npm run build` | Passou, gerou o build de produção. Não publicou o app. |
| EV-06 | `npm run lint` | **Falhou na base, antes das mudanças:** 1.645 erros `prettier/prettier` e 2 avisos `react-refresh/only-export-components`. Não houve formatação geral nem alteração de código para ocultar o resultado. |
| EV-07 | `list_tables`, esquema `public`, por integração Supabase | 21 tabelas informadas, todas com RLS habilitada. Habilitar RLS não prova que todas as políticas estão corretas. A listagem informou 2 contas e nenhum destino, matrícula, viagem ou cobrança; é uma fotografia da consulta, não uma regra do app. |
| EV-08 | Consulta somente de leitura a metadados do banco | `tarefas-do-relogio` cadastrada e ativa com `*/5 * * * *`; 14 tabelas na publicação Realtime. Não foi conferido o resultado das execuções nem a entrega entre dois celulares. |
| EV-09 | Mesma consulta de metadados | `cidades` ainda existe. `criar_conta_do_login` é `SECURITY DEFINER`, executável por `authenticated`, não por `anon`. A pendência histórica G6 continua aberta; não foi aplicado SQL. |
| EV-10 | Consultores de segurança, desempenho e saúde do Supabase | Avisos registrados em 22.5; consulta de saúde não retornou alertas naquele momento. Isso não certifica todo o sistema. |
| EV-11 | Tentativa de criar `docs/controle-funcional-2026-11-17` no GitHub (pela outra IA) | **Resolvido:** o Claude Code aplicou o pacote e publicou na `main` em 17/11/2026. Registro original: recusada com HTTP 403, `Resource not accessible by integration`. A listagem de contas com o aplicativo GitHub instalado retornou vazia. Acesso a metadados públicos e `permissions.push = true` da conta não comprovaram permissão de gravação da integração. Nenhuma branch, commit ou PR remoto foi criado nesta entrega. |

As evidências de banco EV-08 a EV-10 foram consultadas por volta de `2026-11-17 01:33 UTC`. Não foram lidos conteúdos de chaves privadas, criadas contas de teste, enviados e-mails ou executados scripts que gravam ou apagam dados.

**Histórico preservado, sem revalidação nesta entrega:** a contraprova relata 28 verificações E3 no banco de verdade e testes anteriores de várias etapas. Os 364 testes do app foram repetidos agora; as 28 verificações E3 não foram. Não executar `supabase/testes/e3-ponta-a-ponta.sql` ou arquivos de limpeza no banco real só para atualizar uma caixinha.

### 22.4 Mapa dos fluxos para a revisão

Esta tabela localiza o que já existe. Os nomes de testes indicam cobertura disponível, não uma garantia de que todo o fluxo foi coberto. As execuções com banco real e celular abaixo ainda precisam da revisão correspondente.

| Fluxo | Onde está no código | Banco envolvido | Validação essencial que falta repetir |
| --- | --- | --- | --- |
| Conta e acesso | `src/routes/entrar.tsx`, `criar-conta.tsx`, `esqueci-senha.tsx`, `nova-senha.tsx`, `src/lib/conta.ts`, `ExigeConta.tsx`; testes `w1-conta`, `e4-google`, `g2-sair-celular` | Auth, `contas`, funções de papel e aceite | Cadastro, confirmação, recuperação e Google completos; sessão expirada, sair e trocar de conta sem trazer dados nem avisos da conta anterior. |
| Perfil e destinos | Rotas `vanzeiro.perfil`, `vanzeiro.destinos.*`, `DestinoWizard.tsx`, `src/lib/banco/destinos.ts`; testes `w2-w3-destinos` | `perfis_vanzeiro`, `destinos`, `dias_sem_viagem` | Criar, editar, pausar, cancelar um dia e excluir com confirmação; reler depois de fechar e abrir o app. |
| Convite e passageiros | `EntrarNaVan.tsx`, `PassageiroWizard.tsx`, `src/lib/banco/passageiros.ts`, `sessao-passageiro.ts`; testes `convite-real`, `w4-pedidos`, `g1-ligar-ao-cadastro` | `matriculas`, `pedidos`, `mudancas_endereco`, `juntar_conta`; funções de convite e aceite | Vanzeiro e passageiro em contas distintas; aceitar, recusar, ligar cadastro manual sem duplicar, segundo destino e saída mantendo débitos antigos. |
| Confirmações e vagas | `BotaoVou.tsx`, `RespostasFixas.tsx`, `src/lib/respostas-store.ts`, `src/lib/banco/respostas.ts`; testes `w5-respostas`, `e1-lugares-no-destino`, `lugares` | `respostas`, `vou_sempre`, `nao_vou_periodos`, funções de capacidade | Antes e depois do prazo de Brasília, dias sem viagem, lotação, última vaga disputada por duas pessoas e liberação após saída. |
| Viagem e histórico | `vanzeiro.viagem.tsx`, `components/app/viagem/`, `src/lib/viagem.ts`, `banco/viagem.ts`; testes `viagem`, `w6-viagem`, `chegada-volta` | `viagens`, `embarques`, `faltas`, `viagem_sinais` | Busca → paradas/conferência → chegada → volta → encerramento; repetir toques, recarregar e consultar apenas a própria situação como passageiro. |
| Sem internet | `src/lib/banco/fila.ts`, `sem-sinal.ts`, `public/sw.js`; testes `sem-sinal-viagem`, `sem-sinal` | Fila no aparelho e sincronização com `viagens` e registros financeiros | Modo avião, fechar/reabrir, recuperar sinal, recusa do servidor e troca de conta com fila pendente; provar que nada se perde, duplica ou aparece para outra conta. |
| Cobranças e gastos | Rotas `vanzeiro.financeiro.*`, `passageiro.pagamentos.*`, `src/lib/cobrancas.ts`, `banco/dinheiro.ts`, `pix.ts`; testes `dinheiro-ponta-a-ponta`, `w7-dinheiro`, `centavos` | `cobrancas`, `embarques`, `faltas`, `gastos` | Planos, descontos e vencimentos; totais iguais nos dois painéis; pagar/cancelar sem duplicar ou alterar valor congelado; passageiro não pode marcar pago. |
| Avisos e atualização entre aparelhos | Rotas de notificações, `src/lib/banco/avisos.ts`, `banco/passageiros.ts`, `banco/celular.ts`, `notificacoes.ts`; testes `w8-avisos`, `w10-celular`, `g2-sair-celular` | `avisos`, `celulares`, `chaves_push`, Realtime, Edge Function `avisos-no-celular` | Dois celulares, aviso com app aberto/fechado, permissão recusada, limpar sem reaparecer, não duplicar e desligar aviso ao sair. |
| Trabalho automático | SQL histórico W9 e referências em `docs/banco-de-dados.md` | `cron.job`, `tarefas_do_relogio`, cobranças e avisos | Execução bem-sucedida, horário correto e repetição segura sem duas cobranças, com os apps fechados. |
| Mapa, instalação e privacidade | `passageiro.van.tsx`, `src/lib/mapa.ts`, `MapaDaVan.tsx`, `public/manifest.webmanifest`, rotas legais | Coordenadas e permissões do navegador | Instalação/atualização e tela pequena; mapa identifica corretamente sua limitação; preencher contato do responsável e testar direitos de exclusão com contas de teste. |

### 22.4a O que já está pronto (resumo, com a prova que existe)

Cada etapa abaixo tem registro detalhado na contraprova, com a data. "Banco real" = conferido no Supabase de verdade; "celular" = o dono testou no aparelho.

| O quê | Etapa | Prova que existe |
| --- | --- | --- |
| Conta com e-mail e senha, papéis, sair, excluir conta | W1 | Testes; banco real; celular |
| Login com Google com aceite dos Termos na hora (LGPD) | E4 | Testes; celular (dono, 17/11) |
| Perfil do vanzeiro e destinos (criar, editar, pausar, dia sem viagem, excluir) | W2/W3 | Testes; banco real (E3) |
| Convite, pedidos, aceitar/recusar, mudança de endereço | W4 | Testes; banco real (E3) |
| Passageiro cadastrado direto pelo vanzeiro entra no app ("Ligar") | G1 | Testes; banco (cópia, 9 checagens) |
| "Vou"/"Não vou", "Vou sempre", "Não vou de… até…", prazo | W5 | Testes; banco real (E3) |
| Lugares da van limitam o destino e o "Vou" de cada viagem | E1 | Testes; banco (cópia, 8 checagens) |
| Viagem completa (busca, paradas, conferência, volta) e sem sinal | W6, sem sinal | Testes; banco real (E3) |
| Cobranças, pago/cancelado, descontos, gastos | W7, E2 | Testes; banco real (E3 e ponta a ponta) |
| Sininho no banco, "Limpar", destino excluído avisa | W8 | Testes; banco (cópia); celular |
| Tarefas automáticas a cada 5 min (faltas, próxima cobrança, avisos) | W9 | Banco real (rodando sem erro) |
| Notificação no celular com o app fechado, vibração | W10 | Banco real (entregas com sucesso); celular |
| Sair da conta desliga as notificações daquele celular | G2 | Testes |
| Tempo real entre os celulares (1–2 s) | Tempo real | Banco real (14 tabelas) |
| Teste ponta a ponta no banco real (vanzeiro + 2 passageiros) | E3 | 28 de 28 (16/11) |

**Provado em conjunto (17/11, REV-03):** a viagem completa com celulares de verdade, do "Vou" até a cobrança paga.

**Limites já identificados no código:** a posição da van em `passageiro.van.tsx` vem de `vanSimulada`, em `src/lib/mapa.ts`; não é rastreamento GPS real. As consultas de histórico de viagens e avisos têm limite de 300 registros. O escopo offline é parcial: não prometer que qualquer ação funciona sem internet. Esses limites não devem ser escondidos nem tratados como funções novas aprovadas.

### 22.5 Pendências e divergências com evidência

As prioridades indicam a ordem da investigação. Um aviso automático não é, sozinho, prova de vazamento ou de erro funcional; não mudar permissões em massa para apagar avisos.

| ID | O que foi observado | Próxima ação e etapa |
| --- | --- | --- |
| P-01 | `CLAUDE.md`, `AGENTS.md` e documentos de banco ainda tinham instruções da fase sem banco; fonte e contraprova trazem situações de datas diferentes. | REV-00 (concluída) contextualizou o histórico, criou este controle e o resumo 22.4a; as regras E1–E5, G1–G6 e tempo real estão em 22.4a. Original: REV-01 deveria reconciliar as regras atuais E1–E5, G1–G6 e Realtime sem apagar decisões anteriores. |
| P-02 | **Resolvido em 17/11 (REV-01).** G6 constava pendente e EV-09 confirma a tabela e a permissão de função ainda presentes. | REV-01. A limpeza já foi **aprovada pelo dono** (17/11): o app não usa `cidades` (conferido no código). Aplicar `supabase/migrations/20261117020000_limpeza_g6.sql` e conferir. |
| P-03 | Segurança: 2 funções `SECURITY DEFINER` (`lugares_do_destino` e `ocupados_no_destino`) executáveis sem login; 32 executáveis com login. | REV-01 fecha as 2 sem login (P-13); as com login são as funções que o app chama de propósito (cada uma confere quem chama) — revisar em REV-04: autenticação, dono dos registros, argumentos e dados retornados. Funções legítimas podem precisar de privilégios; verificar proteção de cada uma. [Sem login](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [com login](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). |
| P-04 | Segurança: `pg_net` em `public` (aviso), proteção de senhas vazadas desligada (aviso), `chaves_push` sem política com RLS ligada (informativo). | REV-06 (senhas vazadas, plano Pro) e REV-07 (`pg_net`): avaliar correções e configuração disponível. Não criar uma política que libere as chaves para eliminar o informativo. [Extensão](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [RLS sem política](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). |
| P-05 | Desempenho: 19 relações sem índice, 18 ocorrências de cálculo de autenticação nas políticas e 13 ocorrências de políticas permissivas múltiplas. | REV-04: medir e priorizar; preservar o resultado das regras de acesso. Não são 50 funções quebradas. [Índices](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [cálculo de autenticação](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan), [políticas](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies). |
| P-06 | Testes automáticos repetidos com sucesso, porém sem novo teste completo entre navegadores, banco real e dois celulares. | REV-03: roteiro com dois celulares, acompanhado pelo banco; o teste E3 (28/28, 16/11) já cobre o banco real. Não executar testes que gravam em contas reais. |
| P-07 | Conferência de estilo falhou na versão de referência (EV-06). | Só formatação (prettier), não é erro de funcionamento; corrigir apenas em tarefa própria, se o dono quiser. Documentação não justifica reformatar os arquivos do app. |
| P-08 | E-mails, Google e capacidade de recuperação/backup foram relatados em documentos antigos, mas suas configurações e uso completo não foram verificados agora. | Google: funcionando (dono, 17/11). E-mails: REV-02. Cópia de segurança: REV-06. Conferir funcionamento antes de recomendar contratação ou pedir configuração. Não solicitar senhas no chat ou no repositório. |
| P-09 | **Resolvido em 17/11:** contato publicável informado pelo dono (Rafael Atencia, contato@ovanzeiro.com.br, (14) 99773-2018) já está na Política e nos Termos. | REV-06: dono informa contato publicável; revisão jurídica permanece uma pendência externa. Não inventar dados nem certificar conformidade apenas pelo código. |
| P-10 | Observabilidade de erros nos celulares e paginação aparecem como pendências antigas; código mostra limites de leitura e captura de erros de infraestrutura. | REV-05 (registro de erros) e REV-07 (paginação): conferir o que já é registrado e quais dados faltam, medir uso e definir necessidade de alertas/paginação. Não afirmar que não há registro algum. |
| P-11 | Mapa da van simulado; histórico descreve GPS real, loja Android e domínio próprio como futuros. | Manter fora da conclusão do núcleo atual; só transformar em implementação com escopo decidido pelo dono. |
| P-12 | A integração da outra IA recusou criar uma branch (EV-11). | **Resolvido** em 17/11: publicado pelo Claude Code na `main`. |
| P-13 | **Resolvido em 17/11 (REV-01).** Banco: as funções `lugares_do_destino` e `ocupados_no_destino` (criadas na E1) podem ser chamadas sem login; revelam só o número de lugares e de passageiros de um destino, nunca nomes ou dados pessoais. | REV-01: tirar a permissão de quem não tem login e conferir que pedir para entrar e aceitar continuam funcionando. |

### 22.6 Plano de trabalho vigente

Os códigos `REV-*` identificam esta revisão; não renomeiam nem apagam etapas antigas. **São etapas de validação e correção do que já existe**, não uma ordem para refazer funções aprovadas. Resolver o risco mais urgente encontrado na análise antes de continuar a sequência, registrando a mudança de prioridade.

| Etapa | Objetivo | Situação atual | Condição de conclusão |
| --- | --- | --- | --- |
| REV-00 | Organizar documentação e ponto de partida | **Concluída (17/11)** — publicada na `main` | Fonte única (esta seção), histórico preservado, regras de banco corretas (22.1a). |
| REV-01 | Segurança rápida e limpeza G6 | **Concluída (17/11)** — conferido no banco real: 0 funções chamáveis sem login; tabela `cidades` apagada | P-13 resolvido (funções sem login fechadas); G6 aplicada (P-02); `criar_conta_do_login` fechada para o app; pedir/aceitar/cadastro continuam funcionando (teste no banco real em transação desfeita); 364+ testes e build passam. |
| REV-02 | E-mails do login em português (G3) | **Concluída (17/11)** — SMTP do Gmail `ovanzeiro@gmail.com` ligado pelo dono; modelos "Confirm sign up" e "Reset password" em português; teste do "Esqueci minha senha" chegou na caixa de entrada, em português, remetente "O Vanzeiro" | SMTP próprio configurado no Supabase pelo dono; modelos `docs/emails/*.html` colados; cadastro novo recebe "Confirme seu e-mail" e "Esqueci a senha" recebe "Criar senha nova", em português; limite de e-mails por hora ajustado. Nunca pedir a senha no chat. |
| REV-03 | Teste real com 2 celulares e correção do que aparecer | **Concluída (17/11)** — dono fez a viagem completa; conferido no banco real: viagem encerrada com 3 de 3 embarcados, avisos "Van saiu" e "A van está chegando" entregues, 3 cobranças "Por viagem" pagas por Pix | Roteiro de `docs/o-que-falta.md` (A6) feito pelo dono, com a IA acompanhando pelo banco; cada falha vira registro e correção pequena; repetir o passo que falhou até passar. Cobre os fluxos de 22.4: conta, destino, convite, "Vou", lotação, viagem com e sem sinal, pagamento, avisos e tempo real, sair do destino. |
| REV-04 | Desempenho do banco | **Concluída (17/11)** — 19 índices e 18 regras de acesso otimizadas, aplicados no Supabase real; testes de segurança e de regras idênticos antes e depois. Ficam, de propósito: 13 avisos de "duas regras de leitura" (regra do dono + regra da própria pessoa, mantidas separadas por clareza; juntar só se houver lentidão medida) e avisos de "índice ainda não usado" (normal: acabaram de ser criados) | Avisos de desempenho do Supabase zerados ou explicados, sem mudar quem vê o quê. |
| REV-05 | Registro de erros dos celulares | **Concluída (17/11)** — app publicado; tabela `erros_do_app` criada no Supabase real (conferido: celulares gravam, ninguém lê pelo app). Para ver os erros: SQL Editor → `select * from erros_do_app order by criado_em desc limit 50;` | Erros de tela e de rede gravados no banco (só texto do erro, tela e navegador; sem dados pessoais); a IA consulta; nada muda para o usuário. |
| REV-11 | Recuperar marcações pendentes da viagem | **Correções integradas nas etapas 2 e 3; aceite final pendente.** A publicação do cliente da etapa 5 foi confirmada; o aceite final aguarda a prova em celular físico. O fechamento financeiro permanece no roteiro da etapa 6. | Critérios e ordem de entrega em [22.11](#revisao-integral). |
| REV-06 | Preparar a operação real | Conferência técnica em 18/11 registrada; aceite físico, backup/recuperação de produção e revisão jurídica pendentes. [Roteiro](roteiro-testes-celular.md). | Plano Pro do Supabase (sem pausa e com cópia de segurança diária); proteção de senhas vazadas ligada; contato do responsável na Política de Privacidade; revisão dos Termos e da Política por advogado; app publicado conferido com a última versão da `main`. |
| REV-07 | Melhorias opcionais | Adiada — só com decisão do dono | "Marcar como pago" e "Anotar gasto" sem sinal; "ver mais" no histórico (limite de 300); extensão `pg_net` fora do esquema `public` (P-04). |

| REV-08 | **Lugares da viagem visíveis ao passageiro** (pedido do dono, 17/11) | **Concluída (17/11)** — função `lugares_da_viagem` aplicada no Supabase real; card no Início e em Viagens | Ver 22.10, item A. |
| REV-09 | **Acompanhamento do embarque pelo passageiro** (pedido do dono, 17/11) | **Concluída (17/11)** — função `embarque_da_viagem` aplicada no Supabase real; quadro no card "Situação da van" | Ver 22.10, item B. |
| REV-10 | **Aviso "A próxima é você"** (pedido do dono, 17/11) | **Concluída (17/11)** — gatilho `avisar_proximo_da_busca` aplicado no Supabase real; título "A van está chegando" no celular | Ver 22.10, item C. |
| N1 | **Capturar o ponto de embarque** (pedido do dono, 17/11) | **Concluída (17/11)** | Botões "Estou no ponto agora" (GPS) e "Achar no mapa" (busca do endereço na cidade escolhida) na tela "Onde você embarca"; mapa abre na cidade ou no pino. Próximas: N2 (navegar até cada passageiro: "Ir até lá", "Rota completa") e N3 ("Organizar pela distância"). |
| N2 | **Navegar até cada passageiro** (pedido do dono, 17/11) | **Concluída (17/11)** | Na viagem (busca e volta): "Ir até lá" abre o Google Maps navegando até o ponto marcado; "Rota completa" abre os que faltam na ordem (até 10, limite do Google). Próxima: N3 ("Organizar pela distância"). |
| N3 | **Organizar pela distância** (pedido do dono, 17/11) | **Concluída (17/11)** | Na tela do destino, por cidade: ordem da busca em que cada um fica perto do próximo (linha reta, pelos pontos do mapa), vindo da cidade anterior; sem ponto vai para o fim; o vanzeiro ainda arrasta. |
| PD | **Completar o perfil antes do primeiro destino** (pedido do dono, 17/11) | **Concluída (17/11)** | Card com telefone, Pix e van (modelo, placa, lugares) em "Pronto"/"Falta"; "Completar meu perfil" abre o Perfil editando e, ao salvar, segue para criar o destino. |
| CAFÉ | **Parada do café** (pedido do dono, 17/11) | **Concluída (17/11)** — SQL aplicado e conferido | Uma parada do destino marcada como café (15–45 min), fora das cidades de embarque; botão "Café" na viagem com relógio para vanzeiro e passageiro; depois, conferência de quem está na van. |
| VOU-PENDENTE | **"Vou" já conta como pendente** (decisão do dono, 17/11) | **Concluída (17/11)** | No Início, "A receber" e "Pendentes" somam quem confirmou "Vou" hoje (Por viagem e Diário) até o "Embarcou", quando nasce a cobrança de verdade; "Não vou" tira. Sem criar nem editar cobrança. |

Fora do núcleo (decisão do dono, ver 22.9): GPS real, app na Play Store, domínio próprio.

### 22.7 Como executar cada etapa com cuidado

1. **Retomar:** ler `AGENTS.md`, `CLAUDE.md`, esta seção e o último registro da contraprova; conferir a `main` mais recente e a entrega anterior. Não depender da memória do chat.
2. **Delimitar:** escrever o resultado esperado, os caminhos afetados e o que deve permanecer igual. Consultar também quem usa os arquivos envolvidos; preservar alterações que vieram do Lovable.
3. **Diagnosticar antes de corrigir:** reproduzir o problema, registrar esperado/observado e distinguir erro, limitação conhecida e decisão de negócio pendente. Se não houver falha comprovada, validar e preservar.
4. **Isolar:** uma branch e uma mudança pequena por objetivo. Não alterar logo, cores, navegação ou regra aprovada sem necessidade do escopo e decisão registrada. Antes de mudança de banco, seguir 22.1a: arquivo em `supabase/migrations/`, teste numa cópia ou em transação desfeita, aplicação com autorização do dono e conferência depois.
5. **Conferir:** testes relevantes e regressões, tipos e build para código; conferir o fluxo no navegador quando mudar comportamento ou tela. Comparar as telas aprovadas nos tamanhos 390 × 844, 360 × 740 e 375 × 667; testar erros, ausência de dados e retorno após fechar o app. Para banco/permissões/concorrência, usar contas e dados de teste isolados.
6. **Revisar a diferença:** somente arquivos necessários, sem segredos nem dados pessoais; instrução concreta para desfazer a mudança se necessário. Mudança apenas documental exige revisão de texto, links e escopo; não exige alterar código para fazer a conferência de estilo herdada passar.
7. **Registrar e entregar:** atualizar esta seção e a contraprova com commit/PR, testes e pendências; integrar apenas a etapa conferida, sem reescrever histórico. Confirmar a publicação separadamente quando houver mudança funcional. Explicar ao dono em português simples e respeitar a revisão por etapas do projeto.

### 22.8 Registro obrigatório de cada entrega

Copiar o modelo para o fim de `docs/contraprova.md`; manter aqui somente o resumo atual e as pendências. Não apagar registros antigos nem mudar uma situação para "concluída" sem preencher as provas aplicáveis.

```text
Etapa / data / situação:
Versão de partida e versão entregue (commit/PR):
Pedido e regra esperada:
Problema reproduzido ou parte validada:
Arquivos e fluxos afetados:
O que mudou e o que foi preservado:
Testes automáticos (comando, resultado e versão):
Banco real (ambiente, papéis testados, resultado; ou não executado):
Navegador / celular (cenários e evidências; ou pendente):
Pendências, motivo e responsável:
Como testar e como desfazer:
Próximo passo:
```

### 22.9 O que depende do dono e o que posso conduzir

Posso conduzir a leitura do código e dos metadados acessíveis, os testes, o diagnóstico, as correções de código autorizadas, a documentação e as entregas pequenas. Mudanças de estrutura do banco seguem 22.1a (Supabase do dono; nunca pelo agente do Lovable).

O dono entra quando faltar uma **decisão do negócio**, um **contato publicável**, acesso/configuração externa que a integração realmente não alcance ou uma **validação em aparelho físico**. Pedir somente a informação necessária naquele momento, com explicação simples. A tarefa atual já autoriza organizar esta documentação; não pede criar regras novas nem apagar dados.

**Fora do núcleo desta revisão:** GPS real, publicação na Play Store, domínio próprio e assinatura comercial de novos serviços. Não apresentar esses itens como requisito automático para as funções atuais, nem implementar sem definir seu escopo.

### 22.10 Especificação dos pedidos de 17/11/2026 (REV-08 a REV-10)

Pedido do dono, em resumo: o passageiro precisa ver **quantas vagas restam** na viagem (para saber que, se não confirmar, outro pega), **acompanhar o embarque** (quantos já entraram, com as iniciais) e receber **"A próxima é você"** quando a van estiver chegando nele. Tudo coerente com as regras já aprovadas (lugares da van, prazo, privacidade). Trabalhar uma etapa por vez (22.7), sem mudar o visual aprovado além do card novo.

**Privacidade (vale para A, B e C):** o passageiro **nunca** lê a viagem inteira nem os dados dos outros (regra já existente: só `minha_viagem_de_hoje`). As novas informações vêm de **funções do banco** (`security definer`, só para quem está no destino) que devolvem **apenas números e iniciais** (ex.: "M. H."), nunca nome completo, telefone ou endereço. Registrar na Política de Privacidade que as iniciais de quem embarcou são mostradas aos outros passageiros da mesma viagem (REV-06).

**A. Lugares da viagem (REV-08)**
- Banco: função `lugares_da_viagem(matricula text, dia date)` → `lugares int` (do Perfil do vanzeiro; null = sem limite), `vao int` (mesma conta da lotação: `r_resposta(...) = 'vai'` de quem está no destino, igual a `responder`), `eu_vou boolean`. Só responde se a matrícula é da pessoa logada (`pessoa_id = auth.uid()`, `saiu_em is null`).
- App: `src/lib/banco/` chama a função (em memória/testes, usar `contarVou` e `obterPerfilDoVanzeiro`); atualizar junto com o tempo real (tabela `respostas` já está na publicação).
- Tela (Início do passageiro, no card "Próxima viagem", e em Viagens): linha "**4 de 15 lugares ocupados · 11 livres**" com uma barra (verde com vaga; âmbar quando faltarem 3 ou menos: "**Restam 2 lugares**"; "Van lotada" já existe). Quem disse "Vou" vê "**Você está entre os 4 confirmados**". Sem lugares no Perfil: "4 confirmados". Não rolar o Início (regra 4 do CLAUDE.md).
- Testes: contagem igual à do banco; "Vou sempre" conta; quem saiu não conta; o texto de cada situação.

**B. Acompanhamento do embarque (REV-09)**
- Banco: estender `minha_viagem_de_hoje(matricula)` (ou nova `embarque_da_viagem(matricula)`) para devolver também: `total int` (quantos estão na ordem da busca), `embarcaram int`, `iniciais text[]` (de quem embarcou, na ordem; iniciais do nome e do último sobrenome), `minha_posicao int` (posição da pessoa na ordem) e `faltam_antes int` (quantos ainda não foram tratados antes dela: nem "Embarcou" nem "Não estava no ponto").
- App: o card da viagem em andamento do passageiro mostra "**3 de 8 já embarcaram**" com as bolinhas das iniciais e "**Faltam 2 antes de você**" / "**Você é o próximo**" / "**Você embarcou**". Atualiza em tempo real pelo sinal `viagem_sinais` (já existe).
- Testes: contas de posição com "Não estava no ponto" e com quem ficou; o passageiro nunca recebe nomes completos.

**C. Aviso "A próxima é você" (REV-10)**
- Banco: gatilho na tabela `viagens` (depois de cada atualização do estado na fase `busca`): achar o próximo da ordem ainda não tratado e criar o aviso `proxima_parada` para ele (chave `proxima_<viagem>_<matricula>`, uma vez só): "**Você é o próximo. Aguarde no ponto: a van está chegando.**" Feito pelo banco para funcionar mesmo com a fila sem sinal do vanzeiro. Chega no sininho e no celular (o programa `avisos-no-celular` precisa do título "A van está chegando"; acrescentar o tipo em `TipoAviso`, `ListaDeAvisos`, `notificacoes.ts`, `passageiro.notificacoes.tsx` e no teste de contagem).
- Também ao iniciar a viagem (o primeiro da ordem recebe o aviso na hora).
- Testes: o primeiro recebe ao iniciar; ao marcar "Embarcou" ou "Não estava no ponto", o seguinte recebe; ninguém recebe duas vezes; quem disse "Não vou" nunca recebe.

**Como aplicar o banco:** seguir 22.1a (arquivo em `supabase/migrations/`, testar numa cópia, aplicar com autorização do dono, conferir). Ao terminar cada etapa, registrar na contraprova (22.8) e atualizar a tabela de 22.6.


<a id="revisao-integral"></a>

### 22.11 Diagnóstico ponta a ponta e próxima entrega

> **Contexto atualizado em 18/11:** o diagnóstico abaixo é histórico. As correções das etapas 2 e 3 já foram integradas; não refazê-las com base na descrição antiga da falha. O cliente da etapa 5 já foi publicado e conferido. A sequência vigente está em 22.12 e no último registro da contraprova.

**Parecer em 17/11/2026.** O motorista já consegue organizar uma viagem, receber confirmações, conferir embarques e fechar cobranças. A REV-03 registra uma viagem encerrada com três embarques e três cobranças marcadas como pagas por Pix. A prioridade é garantir que um embarque feito sem sinal sobreviva a uma falha no envio. Para liberar uma versão para uso diário, o critério é conseguir repetir as jornadas abaixo na versão publicada, inclusive após uma interrupção, mantendo os passageiros e os valores corretos.

#### Base desta revisão

| Verificação | Resultado | Alcance |
| --- | --- | --- |
| Código | [Commit d4d4dd9 no GitHub](https://github.com/ovanzeiro-beep/van-and-pin-logo-studio/tree/d4d4dd9ef134e66b640419f7d0648af04eacc4ff), cópia isolada com o arquivo de dependências travado | A revisão executou testes locais e só fez leituras nos serviços publicados. |
| Aplicativo | 423 testes em 85 arquivos passaram. TypeScript e build de produção passaram. O lint encontrou 1.762 erros de formatação e 5 avisos de atualização de componentes. | Os testes usam simulações. A formatação tem tratamento separado, conforme P-07. |
| Publicação | A [tela de entrada](https://van-and-pin-logo-studio.lovable.app/entrar) respondeu HTTP 200 com formulário de senha e recuperação. Os nomes dos 31 arquivos JavaScript e CSS referenciados aparecem no build local. | Evidência da tela de entrada. O identificador da publicação inteira e as jornadas autenticadas nesta versão ainda precisam de conferência. |
| Supabase | Projeto `ovanzeiro`, referência `rnziztwicggdekmpwpgy`. As 21 tabelas públicas têm controle por linha. Há 14 tabelas publicadas em tempo real, cinco viagens e cinco cobranças. Na hora anterior à consulta, o agendador registrou 12 execuções com sucesso e zero falhas. | As contagens indicam atividade. O teste de recebimento no aparelho e a restauração do backup exigem provas próprias. |
| Segurança e operação | O consultor de saúde retornou zero avisos. O de segurança apontou proteção contra senhas vazadas desligada, 31 funções privilegiadas disponíveis a usuários logados, extensão pg_net no esquema público e uma tabela de chaves com acesso por linha ativo e sem política. | Revisar por finalidade. A tabela de chaves deve continuar restrita. A REV-06 acompanha recuperação, acesso, publicação e revisão dos textos legais. |

#### Primeiro conserto · REV-11

**Falha reproduzida.** Executei o código de [fila.ts](https://github.com/ovanzeiro-beep/van-and-pin-logo-studio/blob/d4d4dd9ef134e66b640419f7d0648af04eacc4ff/src/lib/banco/fila.ts#L53) com uma viagem fictícia, armazenamento local em memória e respostas controladas do servidor. Com erro de rede, sobrou uma pendência. Com resposta de indisponibilidade do servidor, sobraram zero, apesar de o envio ter falhado. Com sucesso também sobraram zero, como esperado. O motorista pode perder o registro de que alguém embarcou. A simulação reproduziu a perda da pendência, sem demonstrar perda em viagens reais.

**Dois limites do mesmo fluxo.** A gravação no aparelho ignora a falha se o armazenamento estiver cheio. A fila usa uma chave comum no aparelho e tenta enviar seus itens sem filtrá-los pela conta ativa. O efeito de trocar de conta com uma viagem pendente precisa ser medido com contas fictícias. A leitura de viagens também retorna cedo se o banco falhar, antes de carregar as pendências locais. É preciso testar fechar e reabrir o app ainda sem rede. [Gravação local](https://github.com/ovanzeiro-beep/van-and-pin-logo-studio/blob/d4d4dd9ef134e66b640419f7d0648af04eacc4ff/src/lib/banco/fila.ts#L28) · [Leitura da viagem](https://github.com/ovanzeiro-beep/van-and-pin-logo-studio/blob/d4d4dd9ef134e66b640419f7d0648af04eacc4ff/src/lib/banco/viagem.ts#L91)

**Entrega em três passos pequenos.** Primeiro, manter uma marcação recuperável quando falta confirmação do servidor e indicar ao motorista quando ela precisa de atenção. Repetir um erro definitivo não pode gerar tentativas infinitas. Depois, testar e corrigir apenas as falhas reproduzidas na reabertura e na troca de conta. Por fim, conferir a viagem nos dois aparelhos e o resultado financeiro. Aceite da etapa:

1. Em modo avião, registrar um embarque e uma falta. Fechar e abrir com e sem conexão. Ver os registros novamente ou um aviso fiel de qual ação exige recuperação.
2. Simular armazenamento cheio e servidor temporariamente indisponível. A interface distingue “guardado no aparelho”, “salvo” e “precisa de atenção”. A ação aceita pelo aparelho permanece recuperável até confirmação do banco.
3. Com pendência da conta A, entrar na conta B no mesmo aparelho. B só vê e envia os próprios registros. Voltar a A e recuperar os seus.
4. Reconectar, repetir o envio e abrir os dois painéis. Conferir uma viagem, um embarque por passageiro e as cobranças previstas pelo plano, sem duplicação. Repetir o trajeto normal com sinal e comparar totais e avisos.

#### Jornadas de aceitação e ordem de trabalho

| Ordem e situação | O que já tem evidência | Condição para encerrar |
| --- | --- | --- |
| 1. Viagem com falha de sinal · corrigir | Viagem com sinal já exercitada em celulares. A suíte cobre perda e retorno normais da rede. | Fechar a REV-11 pelos quatro critérios acima. |
| 2. Conta, perfil e destinos · regressão | Cadastro, recuperação, Google, capacidade, convite, cadastro manual e associação ao passageiro têm registros nas etapas anteriores. | Em contas de teste, entrar nos dois papéis, recuperar acesso e reler o destino após reabrir. Aceitar um convite deve produzir uma só matrícula. Testar recusa, mudança de endereço e saída sem apagar dívida anterior. |
| 3. Da confirmação à volta · regressão | Há confirmações, vagas, posição de embarque, ordem de busca, navegação, parada do café, conferência e desembarque. | Dois passageiros disputam a última vaga. Só um confirma. Quem desistiu no prazo sai da busca. Embarcar, marcar ausência, conferir a parada e encerrar a volta. A lista final deve bater com o histórico e o painel de cada passageiro. |
| 4. Dinheiro · regressão | Banco e código registram cobranças, pagamentos, faltas e gastos. Há restrição contra pagamento e cancelamento simultâneos e gatilho de proteção na atualização. | Em cópia com dados fictícios, conferir os quatro planos, desconto por falta no prazo, vencimento e virada do mês. Repetir um toque e atualizar dois aparelhos. O valor final deve coincidir, sem mudar cobrança encerrada. Conferir gasto e saldo. |
| 5. Avisos, acesso e privacidade · validar na versão candidata | Existe envio de avisos, função publicada e atualização entre aparelhos. O projeto registra teste do dono. | Com dois usuários distintos, verificar último embarque, aviso no painel correto, app fechado, notificação desativada e saída da conta. Conferir no próprio aparelho o que chegou. Revisar as permissões das funções chamadas pelos fluxos afetados. |
| 6. Operação e publicação · REV-06 aberta | Login publicado acessível, agendador ativo, termos e política já escritos. | Registrar publicação e commit, repetir o percurso curto em dois celulares e instalar/atualizar o app. Confirmar política de backup e demonstrar restauração em ambiente separado. Registrar decisão sobre senhas vazadas e revisão jurídica. |

**Limites de produto.** O GPS do ponto de embarque e a navegação até o passageiro já existem. O mapa do passageiro simula a posição da van. Rastreamento ao vivo, Play Store e domínio próprio estão fora do núcleo aprovado. O histórico de viagens e avisos carrega até 300 itens, e registrar pagamentos e gastos sem conexão é melhoria adiada na REV-07. Para operações com grande volume, conferir também os totais financeiros com um conjunto acima do limite de linhas por consulta, pois a leitura atual busca cobranças sem paginação explícita. A divergência com volume alto ainda precisa ser testada.

**Controle de cada entrega.** Abrir uma alteração isolada a partir de um commit identificado. Antes de corrigir, registrar a entrada, o resultado observado e o resultado esperado. Depois, repetir o cenário, a jornada que já funcionava e a suíte. Anotar na contraprova a versão, o ambiente, os resultados e a forma de reverter. Em caso de regressão, interromper a promoção e voltar à versão validada. Fechar a etapa só depois de verificar o resultado no ambiente a que a mudança se destina. Testes de gravação e restauração usam dados de teste em ambiente isolado.

<a id="execucao-controlada"></a>

### 22.12 Roteiro para a IA que vai executar o trabalho

**Comece aqui a cada sessão.** A fonte da verdade define o comportamento esperado. A contraprova registra o que realmente aconteceu. Use o último registro para retomar o trabalho. Se ele divergir do que você encontrou no código, registre os dois fatos e confira a versão antes de editar.

**Estado e autorização vigentes em 18/11/2026.** O dono autorizou seguir as etapas técnicas 6 e 7 e preparar depois o plano de testes. A etapa 6 foi integrada no PR 8: nove fichas novas, 440 testes e vinte verificações PostgreSQL, sem reparo na implementação. A conferência técnica da etapa 7 e o [roteiro de celular](roteiro-testes-celular.md) estão registrados na [última contraprova](contraprova.md#etapa-7-tecnica-e-roteiro). A publicação da correção da etapa 5 já foi confirmada; sua prova física continua pendente. **Não declarar o app 100% aprovado:** faltam os resultados reais do roteiro e a política/recuperação de produção, além das pendências jurídicas e de operação. O dono deixou as verificações no celular para o final e autorizou integrar a correção da paginação das cobranças e conferir a publicação. O próximo trabalho técnico será apresentado antes de iniciar. As regras de autorização abaixo permanecem aplicáveis a trabalho novo fora da sequência já autorizada.

**Regra permanente do dono. Não mexer na branch `claude/visualizar-main-1gamow`.** Antes de cada etapa, confira a branch local com `git branch --show-current` e o destino de qualquer operação no GitHub. Se a cópia estiver nessa branch, deixe-a intacta e trabalhe em outra cópia a partir da base autorizada. Essa proteção vale também para documentação, commits, push, merge, rebase, renomeação e exclusão. A autorização para avançar de etapa mantém esta regra em vigor.

#### Regra de autorização do dono

1. Leia este roteiro e o último registro de `docs/contraprova.md`. Localize a primeira etapa em aberto.
2. Confira na conversa se o dono autorizou aquela etapa. Uma resposta afirmativa à pergunta sobre a etapa numerada vale só para ela. Se faltar essa resposta, diga o que será feito, pergunte **“Posso iniciar a etapa N — [nome]?”** e encerre a mensagem. Aguarde.
3. Com autorização, trabalhe somente no objetivo da etapa. Use uma cópia isolada para testes. Dados e contas de teste devem ser fictícios. O dono autorizou o merge e a publicação de cada etapa após a validação. Escrever no banco real ou enviar avisos a passageiros reais exige autorização específica.
4. Se a verificação passar, preserve a implementação. Se um teste falhar, registre o resultado antes de tentar corrigir. Na etapa 2 o reparo descrito já faz parte do escopo. Nas etapas de verificação, apresente a falha e peça autorização para o conserto específico. Mantenha a etapa aberta até repetir a prova.
5. Quando a etapa passar, registre a contraprova, faça o merge da branch da etapa na `main` pelo GitHub e confira o commit integrado. O Lovable sincroniza a `main`. Verifique a sincronização e, se a publicação precisar de acionamento, use o controle de publicação já autorizado pelo dono, sem acionar o agente do Lovable. Confirme o resultado antes de afirmar que foi publicado. Se a etapa for só documental, explique que a entrega registra as verificações e que seu efeito se limita à documentação.
6. Explique em linguagem simples o que a etapa faz no aplicativo, quem se beneficia e o que se percebe na tela, quando houver efeito visível. Informe o resultado dos testes e o estado do merge e da publicação. Depois do fechamento, pergunte **“Posso iniciar a etapa N — [nome da próxima]?”** e aguarde. Se faltar prova, acesso de escrita ou confirmação da publicação aplicável, registre o bloqueio e mantenha a etapa aberta. O pedido de explicação, o silêncio ou uma nova conversa mantêm a etapa seguinte em espera. Depois da última etapa, peça o aceite de encerramento.

#### Procedimento para uma correção autorizada

- Confira `git remote -v`, `git rev-parse HEAD` e `git status --short`. Registre o commit e os arquivos que já estavam alterados. Se a base avançou, releia as mudanças do fluxo. Preserve o trabalho existente e teste o comportamento atual antes de decidir se o reparo ainda se aplica.
- Escreva a contraprova em três linhas: ação, resultado observado, resultado esperado. Reproduza com dados fictícios. Se o erro deixou de ocorrer, registre o cenário testado e mantenha o código.
- Para um erro reproduzido, primeiro faça um teste que falhe pelo motivo observado. Altere apenas o trecho responsável. Repita o teste que falhou **e** um cenário vizinho que já funcionava. Preserve textos, aparência e regras aprovadas que não fazem parte do defeito.
- Para uma mudança no app, execute na raiz `npm test`, `./node_modules/.bin/tsc --noEmit`, `npm run build` e compare o lint com a base. Confira `git diff --stat` e `git diff --check`. Registre falhas herdadas e novas separadamente. Se aparecer uma regressão, pare a promoção e isole ou reverta somente a mudança desta etapa na cópia de trabalho. Preserve alterações de outras pessoas.
- Mostre a prova no nível certo. Um teste simulado comprova aquele cenário no código. Uma leitura do Supabase comprova o estado consultado. Recebimento de aviso e reabertura no aparelho exigem observação no celular. Identifique claramente toda verificação que ficou pendente.

#### Fichas de execução

Execute somente a ficha autorizada. A numeração é a ordem de execução deste roteiro. Os códigos REV continuam identificando as entregas históricas do projeto.

| Etapa | O que fazer | Prova de aceite e comportamento que deve continuar funcionando |
| --- | --- | --- |
| **1 · Conferir a base** | Em cópia isolada, ler `AGENTS.md`, `CLAUDE.md`, as seções 22.11 e 22.12 e a última contraprova. Identificar commit e dependências. Se necessário, instalar com `bun install --frozen-lockfile`. Rodar suíte, tipos, build e lint. | Registrar comandos, resultados e diferenças para a referência de 17/11. As diferenças precisam estar explicadas antes de usar a base para avaliar uma correção. Integrar a documentação na `main`, explicar o efeito da etapa e pedir autorização para a etapa 2. |
| **2 · Impedir descarte da marcação (REV-11)** | Começar por `src/lib/banco/fila.ts` e `src/test/sem-sinal-viagem.test.ts`. Com um embarque fictício na fila, simular falta de rede, retorno da rede com recusa temporária e, por último, confirmação do servidor. Comparar a fila antes e depois de cada resposta. Corrigir somente se o descarte indevido for reproduzido. | Quantidades esperadas após cada tentativa: **1, 1, 0**. A confirmação final grava um único embarque. Uma recusa definitiva deixa a pendência recuperável e identificável, sem reenvio infinito. Repetir o envio depois do sucesso e o embarque normal com sinal. Pedir autorização para a etapa 3. |
| **3 · Recuperar a viagem no aparelho (REV-11)** | Ler `src/lib/banco/viagem.ts` e a fila. Em ambiente de teste, marcar um embarque e uma falta offline. Fechar e reabrir ainda offline. Testar armazenamento cheio. Em separado, trocar da conta A para B com uma pendência de A e reconectar como A. | Uma ação indicada como guardada reaparece. Se o aparelho não conseguir guardar, o motorista recebe aviso fiel. B só vê e transmite os próprios registros. Ao retornar a A, reconciliar um embarque, uma falta e as cobranças previstas, sem duplicação. Registrar qual parte foi observada em celular. Pedir autorização para a etapa 4. |
| **4 · Conta, convite e vagas** | Usar usuários fictícios distintos. Criar ou recuperar acesso, conferir o perfil e um destino, aceitar um convite ligado a um cadastro existente e atualizar os dois painéis. Em uma viagem com uma vaga livre, dois passageiros tentam confirmar. Conferir desistência dentro do prazo. Testes de referência: `w1-conta`, `convite-real`, `e1-lugares-no-destino`. | Uma matrícula por pessoa naquele destino. Só um passageiro fica com a última vaga. Após desistência no prazo, a vaga fica disponível e a lista de busca reflete a mudança. Conferir que a saída mantém dívidas anteriores. Se passou, registrar e pedir autorização para a etapa 5. |
| **5 · Viagem e avisos** | Com motorista e passageiro em aparelhos distintos, seguir busca, embarque, ausência, parada, conferência, volta e encerramento. Repetir um toque. Observar o aviso esperado com o app fechado e permissão concedida. Depois de sair da conta, verificar o destinatário dos avisos. Referências: `w6-viagem`, `w8-avisos`, `w10-celular`, `g2-sair-celular`. | Histórico, lista de bordo e situação individual concordam. O passageiro vê apenas as informações previstas para o seu papel. O aviso chega ao destinatário certo. Anotar o aparelho em que apareceu. Pedir autorização para a etapa 6. |
| **6 · Cobranças e fechamento** | Montar fichas fictícias para os planos por viagem, diário, quinzenal e mensal. Anotar valor, vencimento, embarques e faltas antes de rodar. Calcular o esperado pelas regras aprovadas. Incluir falta avisada no prazo, virada do mês, pagamento, cancelamento, toque repetido e gasto. Referências: `dinheiro-ponta-a-ponta`, `w7-dinheiro` e seção 22.4. | Para cada ficha, registrar valor esperado e observado, situação e total mensal. Pagamento e cancelamento conservam as regras da cobrança encerrada. Reabrir ambos os painéis e conferir que um passageiro só consulta a própria cobrança. Pedir autorização para a etapa 7. |
| **7 · Verificar a versão candidata (REV-06)** | Identificar versão candidata, endereço e data. Em dois celulares com contas de teste, instalar ou atualizar e repetir uma viagem curta até a cobrança. Conferir itens operacionais da REV-06, inclusive política de cópia de segurança e restauração em ambiente separado. Registrar qualquer dependência do dono. | Identificar qual versão foi testada, quais passos passaram nos aparelhos e quais ficaram bloqueados. Integrar a etapa validada na `main` e conferir a publicação no Lovable quando aplicável. Pedir aceite final quando todos os critérios do escopo estiverem atendidos. |

#### Mensagem de entrega obrigatória

Copie a ficha de registro no final de `docs/contraprova.md` para cada execução. Preencha somente o que observou. Inclua o caminho do arquivo, o nome do teste ou a referência à verificação feita no celular, sem dados pessoais. O último registro preenchido indica o ponto de retomada.

**Resposta ao dono em até seis linhas**

1. Etapa e resultado: passou, falhou ou falta prova.
2. O que foi testado e em qual ambiente.
3. Resultado esperado e resultado observado.
4. Efeito para quem usa o aplicativo e comportamento conferido novamente.
5. Commit do merge, resultado da publicação e pendência concreta, se houver.
6. Pergunta de autorização para a próxima etapa, ou para o reparo da etapa atual, conforme o resultado. Aguarde a resposta.

**Texto para iniciar outra conversa com uma IA**

> Trabalhe no O Vanzeiro. Leia a seção 22.12 de docs/fonte-da-verdade.md e o último registro de docs/contraprova.md. Diga qual foi a última etapa aceita, qual é a próxima e qual prova será feita. Se faltar minha autorização para essa etapa, peça e pare. Execute uma etapa por vez. Depois de validar, faça o merge na main, confira o Lovable e mostre a contraprova e o efeito no aplicativo antes de pedir autorização para continuar.
