# O Vanzeiro — o que o banco de dados vai guardar

**Este documento não cria o banco.** Ele descreve o que o banco vai guardar, quem pode ver cada coisa e o que muda no app quando o banco entrar. O banco só entra quando o dono do projeto mandar.

Escrito em 15/11/2026, conferido com o código de hoje (os tipos em `src/data/exemplo.ts` e `src/lib/cobrancas.ts`, e as funções em `src/lib/`). Complementa a seção 8 e a seção 11 de `docs/fonte-da-verdade.md`.

---

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
| papel escolhido | vanzeiro ou passageiro (dá para trocar no Perfil) |
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

**Quem vê:** o próprio vanzeiro; os passageiros dele veem nome, telefone, Pix e van. **Quem muda:** só o próprio vanzeiro.

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
| **ordem de busca na cidade** | **campo novo.** Hoje a ordem das setas ↑ ↓ é só a posição na lista |
| plano | por viagem, diário, quinzenal, mensal |
| valor | maior que zero |
| dia do vencimento | quinzenal e mensal |
| desconta faltas, valor da falta | só mensal e quinzenal |
| entrou em, saiu em | datas; quem saiu continua existindo para o histórico e as cobranças (hoje a lista `saidas`) |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** o vanzeiro (cadastro, plano, valor, ordem, remover); a pessoa muda só nome, telefone e endereço de embarque e pode sair do destino.

### 2.5 Pedidos para entrar
Hoje: tipo `PedidoEntrada`, mais a lista `aceitos`.
| Campo | O que é |
| --- | --- |
| identificador | feito pelo banco |
| vanzeiro dono, destino | |
| pessoa | conta de quem pediu |
| nome, telefone | |
| situação | aguardando, aceito ou recusado (**hoje o pedido some da lista; com o banco, fica guardado com a situação**) |
| matrícula criada | quando aceito |
| pedido em, respondido em | datas |

**Quem vê:** o vanzeiro dono; a própria pessoa. **Quem muda:** a pessoa cria; o vanzeiro aceita ou recusa.

### 2.6 Respostas (Vou / Não vou)
Hoje: `respostas-store.ts`, mais a lista escondida `fechadas`.
| Campo | O que é |
| --- | --- |
| matrícula, destino, data da viagem | |
| resposta | Vou ou Não vou |
| respondida em | data e hora |
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

### 2.8 Acontecimentos da viagem (embarques, faltas, conferências)
Hoje não existem como registro: ao marcar "Embarcou" o app cria a cobrança e esquece (lista escondida `registrados`), e o histórico antigo vem dos exemplos (`embarquesExemplo`, `faltasExemplo`).
| Campo | O que é |
| --- | --- |
| viagem, matrícula | |
| o que aconteceu | embarcou, não estava no ponto, está na van, ficou aqui, desceu, avisou "Não vou" no prazo |
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
| tipo | resposta de passageiro, cobrança vencida, prazo chegando, van saiu, cobrança vencendo, pedido aceito, pedido recusado |
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

---

## 3. O que roda sozinho no servidor

Hoje isso roda no celular, só com o app aberto (`passarDoTempo` em `src/lib/viagem-store.ts`, a cada minuto). Com o banco, roda no servidor, mesmo com todos os celulares desligados:

1. **Criar as próximas cobranças** quando uma vence (mensal, quinzenal). Hoje: `criarProximasCobrancas`.
2. **Registrar as faltas do prazo:** quem avisou "Não vou" no prazo ganha o desconto quando o prazo passa, mesmo que a viagem não seja iniciada no app. Hoje: `registrarFaltasDoPrazo`.
3. **Avisos do relógio:** cobrança vencida (vanzeiro), cobrança vencendo em 3 dias e prazo chegando em 30 minutos (passageiro). Hoje: `avisosDoRelogio` em `src/lib/avisos.ts`.
4. **Fechar as respostas** quando o prazo passa.

---

## 4. O que muda em cada arquivo de `src/lib/` quando o banco entrar

As telas não mudam: continuam chamando as mesmas funções. Muda só o que essas funções fazem por dentro.

| Arquivo | Hoje | Com o banco |
| --- | --- | --- |
| `sessao.ts`, `acesso.ts` | pessoa e papel na memória; Entrar aceita qualquer coisa | login real (e-mail e senha, ou Google), "Esqueci a senha" de verdade |
| `vanzeiro-store.ts` | perfil na memória | lê e grava o perfil do vanzeiro |
| `destinos-store.ts` | lista na memória, começa com os exemplos | lê e grava destinos; o código de convite é conferido pelo banco |
| `passageiros-store.ts` | matrículas e pedidos na memória; `aceitos` e `saidas` escondidos | lê e grava matrículas e pedidos com situação e datas; ordem de busca em campo próprio |
| `respostas-store.ts` | respostas na memória; `fechadas` escondida | lê e grava respostas; o banco recusa depois do prazo |
| `viagem-store.ts` | viagem do dia na memória; o relógio roda no celular | cada passo da viagem salvo na hora; o relógio vai para o servidor |
| `viagens-encerradas-store.ts` | exemplos mais as de hoje | lê as viagens encerradas |
| `cobrancas-store.ts` | cobranças geradas dos exemplos; `registrados` escondido | lê cobranças, pagamentos e cancelamentos; embarques e faltas viram registros |
| `avisos-store.ts` | avisos na memória | lê e grava avisos; marca como lido |
| `exclusoes.ts` | apaga da memória | apaga no banco, guardando o que a lei manda guardar |
| `agora.ts` | data e hora fixas (13/11, 05:10) | relógio real |
| `convite.ts` | confere o código só no celular | o banco garante que nenhum código se repete |

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
