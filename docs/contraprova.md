# Contraprova — O Vanzeiro

Checklist que confirma que cada etapa foi feita certa. Consultar **no começo e no fim de cada etapa**.
Este arquivo nunca é apagado nem reescrito do zero: só ganha marcações e anotações.

## Situação das etapas

| Etapa | Situação |
| --- | --- |
| A — Revisão do que existe | Feita em 13/11/2026 (lista entregue, aguardando aprovação) |
| B — Fluxos que faltam | A fazer |
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
**Situação:** a fazer.
- [ ] 1. Primeiro uso do vanzeiro (tela vazia amigável, "Crie seu primeiro destino", ajuda de 3 passos).
- [ ] 2. Primeiro uso do passageiro (tela do código, com explicação de onde conseguir).
- [ ] 3. Telas vazias com mensagem e botão útil (destino sem passageiros, dia sem viagem, sem cobranças, sem pedidos, histórico vazio).
- [ ] 4. Editar perfil (vanzeiro e passageiro): nome, telefone, chave Pix, van, endereço de embarque.
- [ ] 5. Excluir destino (com confirmação e aviso) e sair de um destino (passageiro).
- [ ] 6. Excluir minha conta nos dois perfis (LGPD), com confirmação clara.
- [ ] 7. Avisos no sininho (vanzeiro: pedido novo, resposta de passageiro, cobrança vencida; passageiro: prazo chegando, van saiu, cobrança vencendo).
- [ ] 8. Histórico de viagens do vanzeiro, com resumo de cada uma.
- [ ] 9. Mensagens de erro e confirmação em toda ação que não dá para desfazer.

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
- [ ] Respostas às dúvidas da Etapa A (acima).
