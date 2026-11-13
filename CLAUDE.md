# O Vanzeiro — Instruções para o Claude Code

Leia este arquivo inteiro antes de qualquer mudança. Ele é a regra do projeto.

## 1. O que é o app

O Vanzeiro é um app de celular para **donos de van** (o "vanzeiro") organizarem passageiros, rotas e cobranças, e para o **passageiro** confirmar se vai, acompanhar a van e ver o que deve.

- Piloto: um vanzeiro real de Jacarezinho (PR), que hoje anota tudo num caderno e usa o Google Maps. Depois o app será vendido para outros vanzeiros por mensalidade.
- Serve para qualquer tipo de serviço de van: faculdade, trabalho, escolar, visitas, excursões.
- Android primeiro. Hoje é um site feito para a tela do celular.
- O dono do projeto **não é programador**. Tudo o que for explicado para ele deve ser em português simples, sem termos técnicos.

## 2. Regras de ouro (nunca quebrar)

1. **NÃO coloque banco de dados.** Nada de Supabase, Firebase, API, servidor ou login real. O app usa só **dados de exemplo** em memória. O banco só entra quando o dono do projeto mandar, com essas palavras. Se alguma tarefa parecer precisar de banco, pare e avise em vez de fazer.
2. **Não mude o que já está aprovado** além do que foi pedido: logo, cores, ícones, visual dos cards, barra de navegação, textos e regras. Se achar que algo aprovado deveria mudar, sugira e espere a resposta.
3. **Uma etapa por vez.** Termine, teste, explique e espere a aprovação antes da próxima.
4. **O Início dos dois painéis nunca rola** num celular comum (num celular muito pequeno, como o iPhone SE, uma rolagem leve é aceita). Telas de lista rolam só na lista, com cabeçalho e barra parados. Formulários longos viram passos ("Passo 1 de 3"), sem rolagem.
5. **Fácil e intuitivo**: textos curtos, botões grandes, uma ação principal por tela, a mesma palavra sempre com o mesmo sentido. O vanzeiro usa com uma mão só, dentro da van. Quem nunca usou o app deve entender cada tela sem ajuda.
6. **Não invente nada.** Faça somente o que está neste arquivo e o que o dono do projeto pedir. Nada de telas, botões, regras, textos ou funções que ninguém pediu. Se algo não estiver claro, pergunte antes de fazer, em vez de supor.
7. O projeto também é editado no Lovable. Faça mudanças pequenas e nunca reescreva arquivos inteiros sem necessidade.

## 2.1. Como trabalhar: direto pelo GitHub, por etapas, com merge

Todo o trabalho é feito direto no repositório do GitHub, **uma etapa por vez**, sempre neste ciclo:

1. **Antes de começar a etapa:** puxe a versão mais recente da branch principal (`main`), porque o Lovable também mexe no projeto. Leia de novo este arquivo e o `docs/contraprova.md`.
2. **Análise ponta a ponta:** antes de escrever código, leia todos os arquivos que a etapa vai tocar e os que dependem deles. Confira o que já existe, para não duplicar nem quebrar nada. Escreva na contraprova o que vai ser feito nesta etapa, item por item.
3. **Faça a etapa** numa branch própria (ex.: `etapa-a-revisao`), só com o que a etapa pede.
4. **Confira:** rode os testes e o build. Confira item por item contra a contraprova e contra a seção 6 (regras). Abra as telas num tamanho de celular. Nada pode ter mudado fora do que foi pedido.
5. **Merge:** com tudo passando, faça o merge da branch na `main` e envie (push). **Nunca comece a próxima etapa sem ter feito o merge da anterior.**
6. **Atualize a contraprova:** marque a etapa como feita, com data, o que mudou e qualquer pendência.
7. **Avise o dono do projeto** em português simples: o que mudou em cada tela, como testar no celular e qual é a próxima etapa. Espere o "pode seguir" antes de começar a próxima.

Se um teste falhar, o build quebrar ou algo não bater com a contraprova, **não faça o merge**: corrija primeiro ou avise o dono do projeto.

## 2.2. Contraprova (`docs/contraprova.md`)

A contraprova é o checklist que confirma que cada etapa foi feita certa. Crie esse arquivo no começo da Etapa A e consulte-o **no começo e no fim de cada etapa**. Ele deve ter:

- A lista de todas as etapas da seção 7, com situação: a fazer, em andamento ou feita (com data).
- Para cada etapa: os itens pedidos, cada um com uma caixinha `[ ]` marcada só depois de conferido funcionando.
- Uma lista "Não pode quebrar", com o que já está aprovado (seções 4, 5 e 6), conferida a cada etapa.
- Pendências e dúvidas para o dono do projeto.

A contraprova nunca é apagada nem reescrita do zero: só ganha marcações e anotações.

## 3. Como o código está organizado

- `src/routes/` — uma tela por arquivo (ex.: `vanzeiro.perfil.tsx`, `passageiro.index.tsx`).
- `src/lib/` — as regras do app (viagem, cobranças, passageiros, convite, respostas, sessão). **As regras ficam aqui, não nas telas.**
- `src/data/exemplo.ts` — todos os dados de exemplo num lugar só.
- `src/components/app/` — peças visuais do app (cabeçalho, cards, campos).
- Testes automáticos já existem (vitest). Mantenha-os passando e crie testes para toda regra nova.

Os dois painéis usam os mesmos dados de exemplo: o que o vanzeiro faz aparece para o passageiro, e o contrário também. Recarregar a página volta os exemplos ao início (é esperado, porque não há banco).

## 4. Identidade visual

- Cor principal: azul-marinho profundo. Destaque: amarelo-âmbar (só botões principais e avisos). Fundo branco e cinza bem claro.
- Situação: **verde** = pago / embarcou / na van; **vermelho** = devendo / faltando / não estava no ponto; **âmbar** = pendente / sem resposta.
- Logo: van de lado com pino de localização. Ícone de van (nunca ônibus) em todo o app. O mesmo ícone de carteira para dinheiro nos dois painéis.
- Cards arredondados, sombra suave, ícone à esquerda, informação principal grande. Cabeçalho azul com saudação e sininho.

## 5. Palavras do app (sempre com o mesmo sentido)

| Palavra | Significado |
| --- | --- |
| Vou / Não vou | Resposta do passageiro para uma viagem |
| Sem resposta | Não respondeu ainda |
| Pendente | Cobrança não paga que ainda não venceu |
| Devendo | Cobrança vencida e não paga |
| Pago | Cobrança paga |
| Embarcou / Não estava no ponto | O que o vanzeiro marca na busca |
| Está na van / Ficou aqui | Conferência nas paradas |

## 6. Regras de negócio decididas

**Acesso**
- Cadastro com e-mail e senha (com confirmar senha) ou Google. Os dois exigem marcar o aceite dos Termos de Uso e da Política de Privacidade (LGPD).
- Depois a pessoa escolhe: "Sou vanzeiro" ou "Sou passageiro". Dá para trocar no Perfil.

**Destinos**
- Rota fixa (dias da semana) ou viagem avulsa (uma data). Ida, volta opcional, paradas em ordem.
- Cada destino tem um código de convite e um prazo "Confirmar até" (padrão: 1 hora antes da saída).

**Passageiros**
- Entram pelo código de convite; o vanzeiro aceita ou recusa. O vanzeiro também pode cadastrar direto.
- Uma pessoa pode estar em mais de um destino do mesmo vanzeiro, com plano e valor próprios em cada um.

**Confirmação**
- O passageiro responde "Vou" ou "Não vou" até o prazo e pode mudar até lá.
- **Quem não confirmar até o prazo não entra na busca: a van não passa.**

**Viagem**
- A busca segue a ordem das paradas. "Embarcou" ou "Não estava no ponto" em cada um.
- Em toda parada, a viagem só segue com todos conferidos. O passageiro pode confirmar "Estou na van" pelo próprio celular; o vanzeiro também pode marcar na mão. "Ficou aqui" é só do vanzeiro.
- A volta é na ordem inversa da ida, com "Desceu" em cada endereço.

**Dinheiro**
- Planos: Por viagem (um valor pela viagem completa; ida e volta contam como uma), Diário (um valor por dia em que embarcou), Quinzenal e Mensal.
- O app cria as cobranças sozinho. **Uma cobrança nunca é editada**: só "marcada como paga" (Dinheiro ou Pix) ou "cancelada" com motivo. O total que alguém deve é a soma das cobranças não pagas.
- Desconto de faltas (só Mensal e Quinzenal) é escolhido pelo vanzeiro em cada passageiro. **Só desconta quem avisou "Não vou" dentro do prazo.** "Não estava no ponto" e "sem resposta" não descontam.
- "A receber" inclui atrasados de meses anteriores.
- O passageiro paga direto ao vanzeiro (Pix ou dinheiro) e nunca marca como pago; ele só avisa pelo WhatsApp.

## 7. Plano: deixar todos os fluxos prontos antes do banco

Faça nesta ordem, uma etapa por vez, sempre sem banco, seguindo o ciclo da seção 2.1 (análise → etapa → conferência → merge → contraprova).

### Etapa A — Revisão do que existe
Percorra todos os caminhos do app como vanzeiro e como passageiro, num tamanho de celular, e entregue uma lista simples de: telas quebradas, textos confusos, botões que não fazem nada, números que não batem entre telas e telas que rolam sem precisar. **Só a lista, sem corrigir.** Espere a aprovação.

### Etapa B — Fluxos que faltam
Complete o que ainda não existe, um por um:
1. **Primeiro uso do vanzeiro**: conta nova, sem destinos. Início e abas mostram uma tela vazia amigável com um só caminho ("Crie seu primeiro destino") e uma ajuda curta de 3 passos: criar destino → convidar passageiros → fazer a viagem.
2. **Primeiro uso do passageiro**: sem van ainda → tela do código de convite, com explicação de onde conseguir o código.
3. **Telas vazias** com mensagem e um botão útil: destino sem passageiros, dia sem viagem, sem cobranças, sem pedidos, histórico vazio.
4. **Editar perfil** (vanzeiro e passageiro): nome, telefone, chave Pix, van, endereço de embarque.
5. **Excluir destino** (com confirmação e aviso do que acontece com passageiros e cobranças) e **sair de um destino** (passageiro).
6. **Excluir minha conta** nos dois perfis (exigência da LGPD), com confirmação clara.
7. **Avisos dentro do app** no sininho: pedido novo, resposta de passageiro, cobrança vencida (vanzeiro); prazo chegando, van saiu, cobrança vencendo (passageiro).
8. **Histórico de viagens do vanzeiro**: viagens feitas, com o resumo de cada uma.
9. **Mensagens de erro e confirmação** em toda ação que não dá para desfazer.

### Etapa C — Preparar o código para o banco (sem colocar o banco)
1. Toda tela lê e grava dados **só por funções em `src/lib/`**, nunca direto em `src/data/exemplo.ts`. Assim, depois, só a parte de dentro dessas funções muda.
2. A data e a hora atuais vêm de **uma única função** (hoje fixa em 13/11, 05:10, nos exemplos), para depois trocar pelo relógio real.
3. Todo dado (destino, passageiro, cobrança, viagem, pedido) leva o **identificador do vanzeiro dono**, para que cada vanzeiro veja só os seus dados no futuro.
4. O usuário logado e o papel dele (vanzeiro ou passageiro) ficam num lugar só.
5. Códigos de convite gerados de forma que não se repitam.
6. Testes para todas as regras da seção 6.
7. Escreva em `docs/banco-de-dados.md` a lista de dados que o banco vai precisar guardar (contas, papéis, destinos, passageiros por destino, respostas, viagens, embarques, conferências, cobranças, pagamentos, pedidos, avisos) e o que cada pessoa pode ver. **Só o documento — não crie o banco.**

### Etapa D — Acabamento visual
Ajuste os espaços vazios das telas da viagem, confirme que nenhum Início rola, revise todos os textos em português simples e confira que as mesmas palavras e cores são usadas em todo o app.

### Depois (só quando o dono do projeto mandar)
- Banco de dados e login real.
- Mapa e GPS: localização da van ao vivo e a ordem das ruas dentro de cada cidade.
- App Android.

## 8. Pendências que dependem do dono do projeto

- Contato do responsável para a Política de Privacidade (nome, e-mail, telefone). Hoje está "(a definir)".
- Dados reais do vanzeiro do piloto (rotas, horários, van, Pix).
- Revisão dos Termos e da Política por um advogado antes de lançar ao público.
