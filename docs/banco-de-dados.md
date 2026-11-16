# O Vanzeiro — o que o banco de dados vai guardar

**Este documento não cria o banco.** Ele descreve o que o banco vai guardar, quem pode ver cada coisa e o que muda no app quando o banco entrar. O banco só entra quando o dono do projeto mandar.

Escrito em 15/11/2026, conferido com o código de hoje (os tipos em `src/data/exemplo.ts` e `src/lib/cobrancas.ts`, e as funções em `src/lib/`). Complementa a seção 8 e a seção 11 de `docs/fonte-da-verdade.md`.

---

## 0. Dinheiro sempre em centavos

Todo valor em dinheiro (plano, falta, cobrança, total) é guardado em **centavos, número inteiro**: R$ 280,50 = 28050. Assim uma soma nunca ganha nem perde um centavo. O app já trabalha assim (`src/lib/dinheiro.ts`): só vira "R$ 280,50" na tela e só é lido do que a pessoa digita em `lerValor`. No banco, os campos de dinheiro são inteiros (nunca número com vírgula).

## 0.1 Datas e horas sempre no horário de Brasília

Dias e horas do app (viagem do dia, prazo de confirmação, vencimentos, "hoje") são contados no **horário de Brasília** ("America/Sao_Paulo"), não no do servidor nem no do mundo (UTC). O banco guarda os momentos completos (com fuso), e o app transforma em data e hora de Brasília em `emBrasilia` (`src/lib/agora.ts`). As tarefas do servidor (seção 3) também contam o dia em Brasília.

## 1. Regra geral de quem vê o quê

- **Cada vanzeiro só vê o que é dele:** os seus destinos, os passageiros desses destinos, as cobranças, as viagens, os pedidos e os avisos que são para ele.
- **Cada passageiro só vê o que é dele:** as próprias matrículas (uma por destino), as próprias respostas, cobranças, histórico e avisos. Do vanzeiro, vê só nome, telefone, chave Pix e van.
- **Ninguém vê os dados de outro passageiro.** Nem o telefone, nem as cobranças, nem as respostas.
- Quem confere isso é o banco, não a tela: mesmo que alguém mexa no app, o banco não entrega o que não é da pessoa.

---

## 2. Os conjuntos de dados

Para cada conjunto: os campos, quem pode ver e quem pode mudar. "Vanzeiro dono" é o vanzeiro do destino.

### 2.1 Contas
| Campo | O que é |
| --- | --- |
| identificador | número da conta, feito pelo banco |
| e-mail | para entrar |
| senha | guardada protegida (nunca o texto da senha), ou entrada pelo Google |
| nome | nome da pessoa |
| aceite dos Termos e da Política | data e hora do aceite (LGPD) |
| papéis | vanzeiro, passageiro ou os dois na mesma conta (decisão do dono, 16/11): troca de painel no Perfil; o último painel usado abre primeiro |
| criada em | data |

**Quem vê e muda:** só a própria pessoa.

### 2.2 Vanzeiros (perfil)
Hoje: `PerfilVanzeiro` em `src/lib/vanzeiro-store.ts`.
| Campo | O que é |
| --- | --- |
| conta | de qual conta é |
| nome, telefone | aparecem para os passageiros |
| chave Pix | aparece para os passageiros na hora de pagar |
| van | modelo, placa e lugares para passageiros (em branco = não informado) |

**Quem vê:** o próprio vanzeiro; os passageiros dele veem nome, telefone, Pix e van. **Quem muda:** só o próprio vanzeiro. **Um perfil por vanzeiro** (hoje, em `vanzeiro-store.ts`, por `vanzeiroId`): o passageiro sempre vê o vanzeiro do destino ou da cobrança, nunca o de outro.

### 2.3 Destinos
Hoje: tipo `Destino`.
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono | |
| origem, destino | nomes das cidades |
| tipo | rota fixa ou viagem avulsa |
| dias | rota fixa: dias da semana |
| data | viagem avulsa: a data (nunca no passado) |
| saída | horário |
| volta | horário, ou sem volta |
| data da volta | viagem avulsa que volta em outro dia |
| paradas | em ordem |
| código de convite | **único no app inteiro**, conferido pelo banco |
| prazo de confirmação | 30 min, 1 h, 2 h antes ou noite anterior às 20h |
| ativo | ativo ou pausado |

**Quem vê:** o vanzeiro dono; o passageiro vê os destinos em que está. **Quem muda:** só o vanzeiro dono.

### 2.4 Matrículas (passageiro em um destino)
Hoje: tipo `Passageiro`. Uma pessoa pode ter várias matrículas, uma por destino, com plano e valor próprios.
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono, destino | |
| pessoa | a conta do passageiro, quando ele tem conta (hoje `pessoaId`) |
| nome, telefone | telefone **não se repete no mesmo destino** |
| cidade e endereço de embarque | |
| ponto de embarque no mapa | latitude e longitude marcadas no mapa (opcional; sem ele, o centro da cidade) |
| **ordem de busca na cidade** | campo próprio, `ordem` (1, 2, 3…), mudado arrastando o nome na lista (**atualizado em 16/11, V1**: as setas ↑ ↓ saíram) |
| plano | por viagem, diário, quinzenal, mensal |
| valor | maior que zero |
| dia do vencimento | quinzenal e mensal |
| desconta faltas, valor da falta | só mensal e quinzenal |
| entrou em, saiu em | datas; quem saiu continua existindo para o histórico e as cobranças (hoje a lista `saidas`) |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** o vanzeiro (cadastro, plano, valor, ordem, remover); a pessoa muda só nome, telefone e endereço de embarque e pode sair do destino.

### 2.5 Pedidos para entrar
Hoje: tipo `PedidoEntrada` (a lista `aceitos` é só uma conta feita a partir da situação de cada pedido).
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono, destino | |
| pessoa | conta de quem pediu |
| nome, telefone | |
| onde embarca | cidade, endereço e ponto no mapa, preenchidos pela pessoa no pedido |
| situação | aguardando, aceito ou recusado. O pedido nunca é apagado: fica guardado com a situação (**atualizado em 16/11, V1**: já é assim na memória desde a Etapa K) |
| matrícula criada | quando aceito |
| pedido em, respondido em | datas |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** a pessoa cria; o vanzeiro aceita ou recusa.

### 2.5.1 Mudanças de endereço
Hoje: `MudancaDeEndereco` em `passageiros-store.ts`.
| Campo | O que é |
| --- | --- |
| identificador, vanzeiro dono, destino, matrícula | |
| de, para | cidade, endereço e ponto no mapa (antes e o pedido) |
| distância | km do ponto combinado |
| situação | aguardando, aceita ou recusada, com datas |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** a pessoa cria; o vanzeiro aceita ou recusa. Até 1 km do ponto combinado não cria mudança: o endereço muda na hora.

### 2.6 Respostas (Vou / Não vou)
Hoje: `respostas-store.ts`, mais a lista escondida `fechadas`.
| Campo | O que é |
| --- | --- |
| matrícula, destino, data da viagem | |
| resposta | Vou ou Não vou |
| respondida em | data e hora (Brasília) da última resposta; hoje em `obterMomentoDaResposta` |
| prazo | o prazo que valia no momento da resposta |
| mudanças | a resposta pode mudar até o prazo; vale a última |

"Respostas fechadas" deixa de ser uma lista escondida: o banco recusa resposta depois do prazo ou depois que a viagem começou.

**Quem vê:** o vanzeiro dono; a própria pessoa (só a dela). **Quem muda:** só a própria pessoa, até o prazo.

### 2.7 Viagens
Hoje: `ViagemDoDia` na memória (`viagem-store.ts`) e `ViagemEncerrada` (`viagens-encerradas-store.ts`).
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono, destino, data | |
| foto do destino | nome, saída e volta do dia (para o Histórico não mudar se o destino mudar ou for excluído) |
| tem volta | |
| fase | busca, parada, conferência, chegada, conferência da volta, volta, encerrada |
| ordem da busca | quem vai, na ordem das paradas |
| começou em, terminou em | data e hora |
| paradas da ida, paradas da volta | quantas |

**Hoje a viagem em andamento some se o app fechar.** Com o banco, cada passo é salvo na hora e a viagem continua de onde parou.

**Quem vê:** o vanzeiro dono; o passageiro vê a situação da viagem dele (aguardando, saiu, na van). **Quem muda:** só o vanzeiro (o passageiro só confirma "Estou na van").

### 2.7.1 Dias sem viagem (feriado)
Decisão do dono (16/11/2026): o vanzeiro pode cancelar a viagem de um dia só; o mensalista não ganha desconto.
| Campo | O que é |
| --- | --- |
| destino, data | o dia que não vai ter viagem |
| motivo | ex.: "Feriado", "Sem aula" |
| cancelado em, por quem | data e o vanzeiro |

**Quem vê:** o vanzeiro dono; os passageiros do destino (o dia some das viagens deles, com aviso). **Quem muda:** só o vanzeiro, até o dia.

### 2.8 Acontecimentos da viagem (embarques, faltas, conferências)
Hoje: os registros `Embarque` e `Falta` em `cobrancas-store.ts` (**atualizado em 16/11, V1**: desde a Etapa K ficam guardados, e o histórico antigo começa com os exemplos `embarquesExemplo` e `faltasExemplo`). Os toques da conferência ("Está na van", "Ficou aqui") e o "Desceu" ainda ficam só dentro da viagem do dia.
| Campo | O que é |
| --- | --- |
| viagem, matrícula | |
| o que aconteceu | embarcou, não estava no ponto, está na van, ficou aqui, desceu, avisou "Não vou" no prazo |
| avisou em | para a falta com desconto: quando a pessoa disse "Não vou" (hoje o campo `avisouEm` da falta) |
| quem marcou | vanzeiro ou o próprio passageiro pelo celular ("Estou na van") |
| hora | |

Daqui saem: o histórico do passageiro, o resumo da viagem, as cobranças de Por viagem e Diário, e o desconto de faltas.

**Quem vê:** o vanzeiro dono; a própria pessoa (só os dela). **Quem muda:** o vanzeiro; o passageiro só marca "Estou na van" para si.

### 2.9 Cobranças
Hoje: tipo `Cobranca`. **Uma cobrança nunca é editada.**
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono, matrícula, destino | |
| viagem | só Por viagem |
| nome e telefone | como estavam no dia da criação |
| tipo, referência | ex.: "Mensalidade de novembro" |
| vencimento | |
| valor base, faltas, valor da falta, período das faltas | |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem cria:** o servidor, sozinho (ver seção 3). **Ninguém edita.**

### 2.10 Pagamentos e cancelamentos
Hoje: campos `pagamento` e `cancelamento` dentro da cobrança.
| Campo | O que é |
| --- | --- |
| cobrança | |
| pagamento | data, forma (Dinheiro ou Pix), quem marcou (sempre o vanzeiro) |
| cancelamento | data e motivo (ex.: "Destino excluído", "Saiu do destino", "Dia de cortesia") |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** só o vanzeiro. **O passageiro nunca marca como pago.**

### 2.11 Avisos (sininho)
Hoje: tipo `Aviso`.
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| para quem | o vanzeiro ou a pessoa |
| tipo | os 12 tipos de hoje (`TipoAviso` em `src/data/exemplo.ts`, **atualizado em 16/11, V1**). Para o vanzeiro: pedido novo (só como notificação no celular; o pedido em si aparece em "Pedidos para entrar", não na lista de avisos), resposta de passageiro (inclui "Não vou de… até…" marcado ou tirado), cobrança vencida. Para o passageiro: prazo chegando, van saiu, cobrança vencendo, pedido aceito, pedido recusado, mudança de endereço aceita, mudança de endereço recusada, sem viagem (dia cancelado), vai ter viagem (cancelamento desfeito) |
| texto | sempre cita o destino |
| chave | para o mesmo acontecimento nunca virar dois avisos |
| destino, matrícula, cobrança | quando houver |
| criado em, lido | |

**Quem vê e marca como lido:** só o destinatário.

### 2.12 Exclusão de conta (LGPD)
| Campo | O que é |
| --- | --- |
| conta, data | |
| o que foi apagado | dados pessoais |
| o que ficou | cobranças já pagas ou devendo, que precisam ficar como registro |

**Quem vê:** só a própria pessoa (e o responsável pelos dados, para cumprir a lei).

### 2.13 Cidades no mapa
Hoje: `coordenadas-store.ts` (começa com as cidades dos exemplos; as outras são procuradas no OpenStreetMap e ficam guardadas só naquele celular, até recarregar).
| Campo | O que é |
| --- | --- |
| nome da cidade | como aparece nos destinos (ex.: "Ourinhos", "UENP Jacarezinho") |
| latitude e longitude | onde ela fica no mapa |
| achada em | data da busca |
| conferida | se o vanzeiro confirmou que é a cidade certa (nomes repetidos em outros estados, ex.: Cambará PR e RS) |

**Uma lista só, compartilhada por todos:** cada cidade é procurada **uma vez** (pelo servidor, respeitando o limite do serviço gratuito de no máximo uma busca por segundo) e todos os celulares usam o resultado. Não tem dado pessoal: são só nomes de cidades.

**Quem vê:** todos (só leitura). **Quem muda:** só o servidor (e, no futuro, o vanzeiro corrigindo uma cidade que caiu no lugar errado).

### 2.14 Celulares para notificar
Hoje: não existe (a notificação sai do próprio app aberto; ver `src/lib/notificacoes.ts`).
| Campo | O que é |
| --- | --- |
| conta | de quem é o celular |
| endereço de notificação | o "endereço" que o celular dá quando a pessoa toca em **Ativar** no Perfil |
| criado em | data |

**Quem vê:** só a própria pessoa. **Quem muda:** a própria pessoa (ativar e desativar); o servidor apaga o que o celular deixar de aceitar.

### 2.15 Respostas deixadas prontas ("Vou sempre" e "Não vou de… até…")
**Atualizado em 16/11 (T3).** Hoje: `respostas-store.ts` (na memória) e as regras em `src/lib/respostas-fixas.ts`.
| Campo | O que é |
| --- | --- |
| matrícula | vale um destino por vez |
| "Vou sempre": ligado em, desligado em | horários (Brasília); só vale para o dia se foi ligado antes do prazo e desligado depois dele |
| "Não vou": primeiro dia, último dia, marcado em, tirado em | o dia vira "Não vou" avisado no prazo (dá o desconto) se foi marcado antes do prazo daquele dia |

Nada é apagado: desligar ou tirar guarda o horário, para que os dias com prazo já passado fiquem como estavam (e a prova do desconto continue certa). **Quem vê e muda:** o próprio passageiro. **O vanzeiro** vê só o resultado ("Vou" / "Não vou"), não a escolha.

### 2.16 Gastos da van
**Atualizado em 16/11 (T6).** Hoje: `gastos-store.ts` (na memória, começa com os exemplos) e as regras em `src/lib/gastos.ts`.
| Campo | O que é |
| --- | --- |
| vanzeiro dono | cada vanzeiro vê só os seus |
| tipo | Combustível, Manutenção, Pedágio, Documentos e seguro ou Outros |
| o que foi | só em "Outros" |
| valor | em centavos |
| dia | do gasto (não pode ser depois de hoje) |

O gasto é do mês, não de um destino. Não é editado: se estiver errado, é apagado e anotado de novo. **Quem vê e muda:** só o vanzeiro dono. Passageiros nunca veem.

### 2.17 Juntar o cadastro feito pelo vanzeiro com a conta da pessoa
**Decisão do dono (16/11/2026, V1): pelo telefone.** Quando o vanzeiro cadastra um passageiro direto, a matrícula nasce sem conta (hoje `pessoaId` é o próprio identificador da matrícula). Quando essa pessoa cria a conta no app com **o mesmo telefone**, o app encontra a matrícula e pede ao vanzeiro para confirmar com um toque ("Esta conta é da Mariana Souza?"). Confirmado, a matrícula passa a ser da conta: a pessoa vê as viagens, responde e vê as cobranças. Telefone diferente: entra pelo código de convite, como hoje.
| Campo | O que é |
| --- | --- |
| matrícula, conta | qual cadastro e qual conta |
| telefone | o que bateu |
| situação | aguardando o vanzeiro, confirmada ou recusada, com datas |

**Quem vê:** o vanzeiro dono e a própria pessoa. **Quem confirma:** só o vanzeiro. O banco confere que o telefone é o mesmo e que a conta ainda não está nesse destino.

---

## 3. O que roda sozinho no servidor

Hoje isso roda no celular, só com o app aberto (`passarDoTempo` em `src/lib/viagem-store.ts`, a cada minuto). Com o banco, roda no servidor, mesmo com todos os celulares desligados:

1. **Criar as próximas cobranças** quando uma vence (mensal, quinzenal). Hoje: `criarProximasCobrancas`.
2. **Registrar as faltas do prazo:** quem avisou "Não vou" no prazo ganha o desconto quando o prazo passa, mesmo que a viagem não seja iniciada no app. Hoje: `registrarFaltasDoPrazo`.
3. **Avisos do relógio:** cobrança vencida (vanzeiro), cobrança vencendo em 3 dias e prazo chegando em 30 minutos (passageiro). Hoje: `avisosDoRelogio` em `src/lib/avisos.ts`.
4. **Fechar as respostas** quando o prazo passa.
5. **Procurar as cidades novas no mapa** quando um destino é salvo (seção 2.13), uma por segundo, e guardar para todos. Hoje: `procurarCidades` em `src/lib/coordenadas-store.ts`, feito pelo celular.
6. **Mandar as notificações** para os celulares da seção 2.14 sempre que nasce um aviso, um pedido novo ou uma mudança de endereço.

---

## 4. O que muda em cada arquivo de `src/lib/` quando o banco entrar

As telas não mudam: continuam chamando as mesmas funções. Muda só o que essas funções fazem por dentro.

| Arquivo | Hoje | Com o banco |
| --- | --- | --- |
| `sessao.ts`, `acesso.ts` | pessoa e papel na memória; Entrar aceita qualquer coisa | login real (e-mail e senha, ou Google), "Esqueci a senha" de verdade |
| `vanzeiro-store.ts` | perfil na memória | lê e grava o perfil do vanzeiro |
| `destinos-store.ts` | lista na memória, começa com os exemplos | lê e grava destinos; o código de convite é conferido pelo banco |
| `passageiros-store.ts` | matrículas, pedidos e mudanças de endereço na memória; `aceitos` e `saidas` são contas feitas a partir da situação e do "saiu em" | lê e grava matrículas e pedidos com situação e datas; ordem de busca em campo próprio |
| `respostas-store.ts` | respostas na memória; `fechadas` escondida; respostas deixadas prontas (seção 2.15) | lê e grava respostas e as respostas deixadas prontas; o banco recusa depois do prazo |
| `viagem-store.ts` | viagem do dia na memória; o relógio roda no celular | cada passo da viagem salvo na hora; o relógio vai para o servidor |
| `viagens-encerradas-store.ts` | exemplos mais as de hoje | lê as viagens encerradas |
| `cobrancas-store.ts` | cobranças geradas dos exemplos; registros `Embarque` e `Falta` na memória | lê cobranças, pagamentos e cancelamentos; embarques e faltas viram registros |
| `avisos-store.ts` | avisos na memória | lê e grava avisos; marca como lido |
| `exclusoes.ts` | apaga da memória | apaga no banco, guardando o que a lei manda guardar |
| `agora.ts` | data e hora fixas (13/11, 05:10) | relógio real |
| `convite.ts` | confere o código só no celular | o banco garante que nenhum código se repete |
| `coordenadas-store.ts` | lista de cidades na memória; cada celular procura as que faltam | lê a lista única do banco; quem procura as novas é o servidor |
| `notificacoes.ts` | mostra a notificação com o app aberto em segundo plano | guarda o endereço de notificação do celular (seção 2.14); quem manda é o servidor |
| `gastos-store.ts` | gastos na memória, começa com os exemplos | lê, grava e apaga os gastos do vanzeiro (seção 2.16) |
| `ids.ts` | `novoId` cria o identificador de cada dado novo no celular | quem cria o identificador é o banco; só esta função muda |
| `painel.ts` | o painel do vanzeiro corta, na memória, o que não é dele (seção 1) | o banco só entrega o que é do vanzeiro logado; esta peça pode continuar como segunda garantia |

Além disso, com o banco:
- cada ação demora um instante e pode falhar sem sinal: as telas ganham "carregando" e mensagem de erro;
- o que um celular muda aparece na hora no outro (ex.: "Estou na van", "a van saiu").

---

## 5. O que precisa ser feito antes (sem banco)

**Feito na Etapa K (15/11/2026).** Hoje o app já guarda, ainda na memória, do jeito que o banco vai guardar: os itens abaixo. Os campos novos estão nos tipos `Passageiro` (`ordem`, `saiuEm`), `PedidoEntrada` (`situacao`, `matriculaId`, `pedidoEm`, `respondidoEm`) e `ViagemDoDia` (`id`, `comecouEm`, `terminouEm`), e os registros em `cobrancas-store.ts` (`Embarque`, `Falta`) e `respostas-store.ts` (`RespostasFechadas`).

Para o banco entrar mais fácil, a **Etapa K** (seção 11 da fonte da verdade) guarda como registro, ainda na memória, o que hoje some:
1. embarques e faltas (seção 2.8 deste documento);
2. cada passo da viagem em andamento (seção 2.7);
3. a memória escondida: respostas fechadas, embarques já cobrados, pedidos aceitos e quem saiu (seções 2.4, 2.5, 2.6);
4. a ordem de busca na cidade num campo próprio (seção 2.4).

---

## 6. Decisões do dono que mudam este documento
1. **Sem internet dentro da van — decidido: SIM (15/11/2026).** Já feito (sem banco): o app abre e funciona sem sinal (cópia do app no celular, `public/sw.js`). **No dia do banco:** cada ação feita sem sinal fica numa fila no celular, na ordem em que aconteceu, e é mandada quando o sinal voltar; a tela mostra que ainda falta mandar. Regras para o que chegar atrasado: os toques da viagem valem pela hora em que foram feitos; uma resposta "Vou / Não vou" feita antes do prazo vale mesmo que chegue depois; uma cobrança nunca é editada (pagamento ou cancelamento repetido não conta duas vezes).
2. **Notificação no celular com o app fechado — decidido: SIM (15/11/2026).** Já feito (sem banco): permissão no Perfil e notificação com o app minimizado; o celular já recebe notificação mandada pelo servidor (`public/sw.js`, no formato { titulo, corpo, url }). **No dia do banco:** guardar, para cada conta, o "endereço de notificação" de cada celular (conjunto novo: **Celulares para notificar** — conta, endereço, data; só a própria pessoa vê) e o servidor manda a notificação sempre que cria um aviso da seção 2.11 ou chega um pedido novo.
3. **Pagamentos de quem saiu do último destino — decidido: continua vendo (15/11/2026).** Por isso a pessoa precisa continuar podendo ver, mesmo sem matrícula ativa, as cobranças das matrículas de que saiu (seção 2.4, "saiu em"), e só delas.
4. **Contato da Política de Privacidade e revisão do advogado** antes de guardar dados reais.

---

## 7. Regras que o banco garante sozinho
**Escrito em 16/11/2026 (V1).** Hoje quem confere estas regras é o celular (`src/lib`). Com o banco, **o banco também confere todas**, para que ninguém consiga burlar mexendo no app. Se o celular pedir algo fora da regra, o banco recusa e devolve o motivo (a tela mostra a mensagem; ver V2 na seção 20 da fonte da verdade).

**Quem é quem**
1. Cada pessoa só vê e muda a própria conta; o aceite dos Termos e da Política é obrigatório para criar a conta.
2. O vanzeiro só vê e muda o que é dele (destinos, matrículas, pedidos, viagens, cobranças, gastos, avisos dele). O passageiro só vê o que é dele (matrículas, respostas, histórico, cobranças, avisos) e, do vanzeiro, só nome, telefone, Pix e van.

**Destinos e passageiros**
3. Código de convite único no app inteiro.
4. Viagem avulsa nunca no passado; prazo só 30 min, 1 h, 2 h ou noite anterior às 20h.
5. Telefone não se repete no mesmo destino; valor maior que zero; vencimento de 1 a 31 só em Mensal e Quinzenal; desconto de faltas só em Mensal e Quinzenal.
6. O passageiro só muda o próprio nome, telefone e endereço de embarque. Endereço até 1 km do ponto combinado muda na hora; mais longe vira pedido para o vanzeiro aprovar.
7. Pedido para entrar só com código válido; só o vanzeiro aceita ou recusa; pedido e mudança de endereço nunca são apagados.
8. Juntar cadastro e conta (2.17) só com o mesmo telefone e a confirmação do vanzeiro.

**Respostas e viagem**
9. Só a própria pessoa responde "Vou" / "Não vou", e só até o prazo e antes de a viagem começar.
10. "Vou" só com lugar livre na van; quem respondeu primeiro fica com o lugar. "Vou sempre" e "Não vou de… até…" só valem para os dias cujo prazo ainda não tinha passado quando foram marcados.
11. Quem não confirmou "Vou" até o prazo não entra na busca.
12. Só o vanzeiro faz a viagem; uma viagem em andamento por vanzeiro de cada vez; numa parada, a viagem só segue com todos conferidos. "Estou na van" só o próprio passageiro, para si; "Ficou aqui" só o vanzeiro.
13. Dia sem viagem: só o vanzeiro, até o próprio dia; o mensalista não ganha desconto.

**Dinheiro**
14. Cobranças são criadas só pelo servidor, pelo plano de cada matrícula. **Nunca são editadas.**
15. Só o vanzeiro marca como pago (Dinheiro ou Pix) ou cancela (com motivo). O passageiro nunca marca como pago.
16. Desconto de falta só para quem avisou "Não vou" no prazo; "Não estava no ponto" e "sem resposta" não descontam.
17. O total que alguém deve é sempre a soma das cobranças não pagas (nunca um número guardado à parte).
18. Gastos: só o vanzeiro dono; valor maior que zero; dia até hoje; não são editados (apaga e anota de novo).

**Avisos e conta**
19. Só o destinatário vê e marca como lido; um aviso por acontecimento (`chave`).
20. Excluir a conta apaga os dados pessoais e guarda só as cobranças pagas ou devendo, como registro (LGPD).

---

## 8. Método para colocar o banco (Supabase próprio)
**Decisão do dono (16/11/2026, V1): Supabase próprio** (uma conta do dono no Supabase, ligada ao app). Só começa quando o dono disser **"pode colocar o banco"**.

### 8.1 O que o dono faz (uma vez só, com o passo a passo do Claude)
1. Criar a conta no Supabase e um projeto na região **São Paulo** (mais rápido aqui e os dados ficam no Brasil).
2. Passar para o Claude, pelo lugar seguro de chaves (nunca pelo chat), o endereço do projeto e a chave pública ("anon"). A chave secreta ("service role") nunca vai para o app.
3. Ligar o "Entrar com Google" (o Claude passa o caminho; precisa de uma conta Google do projeto).
4. Antes de usar com dados reais: escolher o plano pago (o gratuito pausa o projeto parado há uma semana) e configurar o envio de e-mails do "Esqueci a senha".

### 8.2 O que o Claude faz, tudo em arquivos no GitHub
- `supabase/migrations/`: as tabelas da seção 2, quem vê o quê (seção 1) e as regras da seção 7, em arquivos que podem ser refeitos do zero.
- `supabase/functions/` e tarefas agendadas: tudo da seção 3 (cobranças, faltas do prazo, avisos do relógio, fechar respostas, procurar cidades, notificações).
- `supabase/seed.sql`: uma **conta de teste com os mesmos dados de exemplo** de hoje, para o primeiro dia com banco parecer o app de hoje.
- No app: cada parte (`*-store.ts`) ganha **duas fontes, memória e banco**, escolhidas num lugar só. As telas não mudam: continuam chamando as mesmas funções, que já devolvem "deu certo" ou "não deu, porque…" pela peça `src/lib/acoes.ts` (V2, feito em 16/11/2026). Com o banco, cada função passa a esperar a resposta do Supabase e devolve o motivo que o banco der (seção 7); `fazer(...)` já espera e já mostra "Salvando…" e a mensagem.

### 8.3 Ordem de entrada: uma parte por etapa
| Etapa | Parte | O que passa a ser de verdade |
| --- | --- | --- |
| W1 | Login e conta | e-mail e senha, Google, "Esqueci a senha", aceite dos Termos, papéis |
| W2 | Perfis | perfil do vanzeiro e dados do passageiro |
| W3 | Destinos | destinos, código de convite único, dias sem viagem |
| W4 | Passageiros e pedidos | matrículas, pedidos, mudanças de endereço, juntar pelo telefone (2.17) |
| W5 | Respostas | Vou / Não vou, Vou sempre, Não vou de… até…, lugares |
| W6 | Viagem | cada toque salvo na hora; **fila sem sinal** (seção 6, decisão 1) |
| W7 | Dinheiro | cobranças, pagamentos, cancelamentos, gastos |
| W8 | Avisos | sininho dos dois painéis |
| W9 | Tarefas automáticas | seção 3, rodando no servidor no horário certo |
| W10 | Notificações | no celular, com o app fechado (seção 2.14) |

Em cada etapa: conferir com os testes e no celular, merge, contraprova. Se uma parte der problema, ela volta para a memória sem quebrar o resto. Os testes automáticos continuam rodando com a memória.

