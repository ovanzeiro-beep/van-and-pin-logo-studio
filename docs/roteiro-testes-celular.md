# O Vanzeiro — roteiro de testes no celular

**Preparado em 18/11/2026, após as conferências técnicas.** Este é o roteiro para executar; nenhum item abaixo está automaticamente aprovado. A situação oficial continua na [fonte da verdade, seção 22.12](fonte-da-verdade.md#execucao-controlada); os resultados devem ser acrescentados à [contraprova](contraprova.md).

Use o app publicado: <https://van-and-pin-logo-studio.lovable.app>.

## Antes de começar

- Separe dois celulares: um como **vanzeiro** e outro como **passageiro**. Se só tiver um, faça os testes de tela, mas deixe a prova entre aparelhos pendente.
- Use contas/e-mails de teste que você controla, nomes fictícios e destinos identificados como **TESTE**. Não use passageiros, dívidas ou viagens reais.
- Para e-mail ou Google, conclua o acesso normalmente. Não envie senhas, códigos de acesso ou links de recuperação pelo chat.
- No passageiro, ative as notificações no Perfil e permita no celular. No iPhone, instale na tela inicial e abra por esse ícone. Notificação bloqueada no sistema não comprova falha de envio do app.
- Abra a versão atual com internet antes de testar modo avião. Anote Android/iPhone e o navegador de cada aparelho.
- Aqui, **marcar pago é só um registro de teste**. Não transfira dinheiro ou faça Pix real. Confira a chave e o valor exibidos sem concluir uma transferência bancária.

Faça um bloco por vez. Se algo falhar, pare aquele caso, anote o número e o que apareceu. Não apague o cenário para “começar do zero” antes de registrarmos o erro.

## Bloco A — Entrar e preparar uma viagem

| Caso | O que fazer | O que deve acontecer |
| --- | --- | --- |
| A1 | Abra Entrar, Criar conta e Esqueci minha senha nos dois aparelhos. | Campos e botões legíveis, sem corte lateral. Senhas ficam ocultas. Voltar não leva a uma tela quebrada. |
| A2 | Entre na conta de teste de cada papel. Feche e abra o app com internet. | Volta à conta/painel esperado; vanzeiro e passageiro não se misturam. |
| A3 | Se quiser conferir a recuperação, peça uma senha nova para seu e-mail de teste, abra o link e escolha outra senha. | E-mail chega em português e o link permite entrar com a senha nova. Não compartilhar o link. Esse envio é feito por você no teste, não pela IA. |
| A4 | No vanzeiro, preencha o perfil com dados de teste e lugares da van. Crie um destino TESTE para hoje, com saída pelo menos duas horas à frente e prazo que ainda permita confirmar. | Destino e perfil continuam iguais depois de sair da tela e voltar. Se o app impedir alguma data/horário, registre a mensagem; não altere o relógio do celular ou do banco. |
| A5 | No passageiro, digite o convite desse destino. No vanzeiro, aceite o pedido. | Passageiro aparece uma vez no destino correto e vê a própria matrícula. Nome, plano e valor combinam nos dois painéis. |
| A6 | Faça um destino separado com um lugar, aceite um passageiro de teste e tente entrar com outra conta de teste. | O destino cheio recusa uma entrada adicional com mensagem clara. Não reduzir a capacidade de uma van real para este teste. |
| A7 | Tente convite inexistente e depois volte ao convite correto. | Erro compreensível; não abre dados de outro destino nem perde a conta. |

## Bloco B — Confirmar, viajar e receber os avisos

| Caso | O que fazer | O que deve acontecer |
| --- | --- | --- |
| B1 | Passageiro toca Vou e confirma. Depois testa Não vou e confirma; por fim, volta a Vou enquanto o prazo permitir. | Motorista vê a resposta correta; a contagem de vagas acompanha. Cancelar a janelinha de confirmação não muda a resposta. |
| B2 | Nos perfis separados, abra os avisos. Inicie a viagem de teste quando o app permitir. | Cada pessoa vê os avisos destinados ao próprio papel. O primeiro da busca recebe o aviso de que a van está chegando. |
| B3 | Com notificações permitidas, feche a página/app do passageiro, sem desativar as notificações ou forçar a parada do navegador no sistema. No vanzeiro, marque Embarcou na viagem de teste. | O passageiro recebe a notificação esperada, como Boa viagem!, no aparelho correto. Anote texto, horário e Android/iPhone. A entrega no sininho sozinha não aprova este caso. |
| B4 | Reabra o app do passageiro e confira sua situação; toque novamente no mesmo comando apenas se a tela ainda o oferecer. | Embarque aparece uma vez; não cria outra cobrança nem aviso igual. |
| B5 | Em outro cenário de viagem de teste, marque Não estava no ponto para o passageiro. | Essa pessoa vê Não estava no ponto no próprio histórico do dia. Não use uma falta real só para fazer a prova. |
| B6 | Faça paradas, conferência, café se configurado, chegada e volta. Use os comandos permitidos para conferir quem está na van e quem desceu. | Só avança com a conferência necessária; lista de bordo, situação individual e resumo final concordam. A ordem e o histórico ficam preservados. |
| B7 | Abra/atualize as duas telas depois de cada ação principal. | O outro aparelho acompanha sem confundir pessoas. Se a atualização demorar, registre o atraso; não aprovar como “instantâneo” por suposição. |

## Bloco C — Perda de sinal e troca de conta

Faça somente com uma viagem de teste carregada previamente com internet.

| Caso | O que fazer | O que deve acontecer |
| --- | --- | --- |
| C1 | No aparelho do vanzeiro, ative modo avião e marque um embarque permitido pela viagem. | A marcação fica guardada no aparelho ou aparece uma mensagem fiel de que não foi possível guardar. Não deve anunciar “salvo no servidor” sem conexão. |
| C2 | Ainda offline, feche e reabra o app. | A viagem e a marcação guardada reaparecem. Se a cópia do app não abrir, registre a tela e o que havia sido aberto antes. |
| C3 | Desative o modo avião, aguarde o retorno da conexão e reabra os dois painéis. | Um embarque e a cobrança prevista, sem duplicação; situação final igual nos dois aparelhos. |
| C4 | Com uma pendência fictícia, saia da conta A e entre em outra conta B no mesmo aparelho. Depois volte a A e reconecte. | B não vê nem envia a viagem de A. Ao voltar a A, a pendência continua recuperável e é conciliada uma vez. |
| C5 | Sem internet, tente responder Vou/Não vou ou marcar uma cobrança como paga. | São ações que ainda exigem conexão. O app informa a falha sem inventar confirmação ou pagamento. O offline financeiro completo continua melhoria adiada. |

Armazenamento cheio e recusa temporária do servidor já foram simulados nos testes técnicos. **Não encha nem danifique o armazenamento do celular para reproduzir esses casos.**

## Bloco D — Conferência do dinheiro

Para os quatro planos, use matrículas/destinos de teste separados. Uma pessoa só tem uma matrícula ativa por destino. Pode usar a mesma conta de passageiro em destinos diferentes. Não altere plano/valor de um passageiro real.

| Caso | Ficha de teste | O que conferir |
| --- | --- | --- |
| D1 | Diário: R$ 30,00. | Vou entra na previsão de pendentes, mas a cobrança real nasce no Embarcou. Para a mesma matrícula, embarques do mesmo dia não duplicam a diária; vencimento sete dias após o dia do embarque. |
| D2 | Por viagem: R$ 40,00. | Uma cobrança por viagem completa. Repetir toque ou fazer a volta da mesma viagem não cobra novamente; duas viagens distintas geram duas cobranças. |
| D3 | Mensal: R$ 300,00, vencimento dia 20, desconto de R$ 15,00 por falta avisada no prazo. | Confira valor e vencimento. Uma falta válida no período deixa R$ 285,00; duas, R$ 270,00. Só conte faltas realmente dentro do prazo e período. Sem resposta ou ausência no ponto não gera desconto. |
| D4 | Quinzenal: R$ 150,00, vencimento escolhido dia 20, desconto de R$ 10,00. | Datas fixas 5 e 20. Uma falta válida no período deixa R$ 140,00. Não é uma contagem móvel de 15 em 15 dias. |
| D5 | Marque uma cobrança fictícia como paga por Pix e outra por Dinheiro. | Vanzeiro e passageiro veem Pago, mesmo valor e forma. Passageiro não tem permissão para marcar pago. Nada exige transferência real. |
| D6 | Cancele uma cobrança fictícia com motivo. Tente pagar/cancelar uma já encerrada. | Cancelada sai dos totais a receber; a encerrada não muda nem recebe desconto posterior. Motivo vazio é recusado. |
| D7 | Recebido R$ 30,00 e gasto de combustível R$ 12,50 no mês. | Seu mês na van mostra Sobrou R$ 17,50 nesse conjunto de teste. Havendo outras cobranças/gastos, registre-os e some antes de comparar. Gasto futuro deve ser recusado. |
| D8 | Saia de um destino de teste que tenha dívida vencida. | A dívida anterior continua disponível. Pendentes são canceladas conforme a regra; pagas continuam no histórico. Não use dívida real como prova. |
| D9 | Feche e reabra os dois apps depois de pagar/cancelar. | O estado continua salvo e os totais coincidem com o conjunto de cobranças. Passageiro só consulta as próprias matrículas. |

**Datas especiais:** fevereiro, dia 31, virada do ano e criação da próxima mensalidade/quinzena já foram verificados em ambiente isolado. Não altere o relógio real para simular essas datas. A repetição em aparelho deve usar datas que o próprio app permita.

## Bloco E — Instalação e separação entre pessoas

| Caso | O que fazer | O que deve acontecer |
| --- | --- | --- |
| E1 | Instale/abra pela tela inicial. Depois de uma publicação, reabra e aceite a atualização se ela for oferecida. | App abre normalmente e usa a versão publicada. No iPhone, essa instalação é necessária para notificações. |
| E2 | Na conta A de teste, saia. Entre na conta B, com dados diferentes, no mesmo aparelho. | Não aparecem nome, viagens, cobranças, fila ou avisos da conta A. |
| E3 | Em cenário controlado, confira um novo aviso de A depois de A ter saído daquele aparelho. | O aparelho já vinculado a B não mostra aviso privado de A. Faça só com contas fictícias e registre a sequência. |
| E4 | Confira as telas no menor aparelho disponível, teclado aberto e fechado. | Botões principais continuam alcançáveis, sem corte lateral. Listas rolam; teclado não esconde uma ação sem forma de alcançá-la. |

## O que ainda precisa de verificação operacional

Estes itens não são resolvidos por “testar um botão” e continuam pendentes no controle:

- Confirmar a política real de backup do Supabase e os pontos disponíveis para restauração. A prova local de dump/restore passou; **não é restauração de um backup de produção**.
- Definir e demonstrar uma restauração de produção em ambiente separado, com autorização específica e sem substituir o banco em uso.
- Registrar a decisão sobre proteção de senhas vazadas e revisar os termos/política antes da abertura comercial. Não contratar plano ou serviço automaticamente.
- Validar paginação/totais por API antes de uso com grande volume. O histórico/avisos têm limite de 300 itens; cobranças sem paginação explícita exigem avaliação própria.
- Concluir o aceite dos testes acima. Passar nos testes automáticos não aprova os itens manuais.

## Como me devolver o resultado

Use este modelo, um caso por vez:

```text
Caso: B3
Celular do motorista: Android ou iPhone / navegador
Celular do passageiro: Android ou iPhone / navegador
App do passageiro: aberto, fechado ou instalado na tela inicial
Ação feita:
Horário aproximado:
Esperado:
O que apareceu:
Resultado: passou / falhou / não consegui testar
```

Se falhar, envie uma captura sem e-mail, telefone, chave Pix ou outros dados de pessoas reais. Não envie senhas ou links de acesso. A IA registra a ocorrência na contraprova e reproduz o problema antes de propor uma mudança.

**Comece pelo Bloco A e depois pelo B3**, que fecha a principal prova física pendente da etapa 5. Os demais blocos podem ser executados por partes. O resultado final será aprovado caso a caso, sem apagar os registros anteriores.
