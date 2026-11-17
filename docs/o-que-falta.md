# O Vanzeiro — pendências registradas antes da revisão REV-00

> **Registro histórico preservado.** O acompanhamento vigente está na [fonte da verdade, seção 22](fonte-da-verdade.md#controle-atual). Os números, aprovações e instruções abaixo pertencem à varredura anterior; não são uma nova validação nem uma ordem para executar limpezas, contratar serviços ou conceder permissões amplas. As pendências entram no plano atual com uma prova e uma etapa responsável.

Varredura de 17/11/2026: app, banco de dados (Supabase) e avisos do próprio Supabase.

## Como está hoje

- **Funcionando e conferido:**
  - conta: e-mail, ou Google com o aceite dos Termos;
  - perfil, destinos, código de convite, pedidos e "Ligar ao cadastro";
  - lugares da van, "Vou" e "Não vou", "Vou sempre" e "Não vou de… até…";
  - viagem (com e sem sinal);
  - cobranças, pagamentos, descontos e gastos;
  - sininho, notificação no celular (com vibração) e tempo real;
  - tarefa automática a cada 5 minutos;
  - sair, excluir destino e excluir conta.
- **Teste no banco de verdade:** 28 de 28 certos.
- **Testes automáticos do app:** 364 passando.
- **Banco agora:**
  - 2 contas (Rafael e Mônica) e nenhum destino;
  - tarefa automática rodando sem erro;
  - tempo real ligado em 14 tabelas;
  - nenhuma notificação com erro nas últimas 24 horas.

---

## Parte A — Só você pode fazer

- [ ] **A1. Terminar a G6.** Ainda não entrou no banco: a tabela de cidades continua lá e uma função interna continua aberta para o app. Cole `supabase/SO-SQL-11-LIMPEZA-G6.sql` no SQL Editor e clique em **Run**.
- [ ] **A2. E-mails do login (G3).** Hoje o Supabase manda poucos e-mails por hora, e os textos estão em inglês.
  1. No Gmail ovanzeiro@gmail.com, ligue a **verificação em duas etapas** e crie uma **senha de app** (myaccount.google.com/apppasswords).
  2. No Supabase, em **Authentication → Emails → SMTP Settings**, coloque:
     - Host: `smtp.gmail.com`
     - Porta: `465`
     - Usuário: `ovanzeiro@gmail.com`
     - Senha: a senha de app
     - Remetente: "O Vanzeiro"
  3. Ainda em **Authentication → Emails → Templates**, cole os textos prontos:
     - `docs/emails/confirmar-cadastro.html`, em **Confirm signup**;
     - `docs/emails/nova-senha.html`, em **Reset password**.
     
     Assuntos: "Confirme seu e-mail — O Vanzeiro" e "Criar senha nova — O Vanzeiro".
  4. Em **Authentication → Rate Limits**, aumente "emails per hour" para **100**.
- [ ] **A3. Plano do Supabase.**
  - No plano grátis, o projeto **pausa depois de 7 dias sem uso** e **não tem cópia de segurança diária**. Para uso real, passe para o **Pro** (US$ 25 por mês).
  - Depois, ligue **Authentication → Attack Protection → Leaked password protection** (só existe no Pro).
- [ ] **A4. Licença do Supabase para o Claude.** Quando aparecer o pedido do Supabase no Claude, toque em **"Permitir sempre"**. Assim eu coloco as mudanças no banco sozinho, sem você precisar colar SQL.
- [ ] **A5. Parte legal (LGPD).** Colocar o contato do responsável na Política de Privacidade (hoje está "(a definir)"). Pedir para um advogado revisar os Termos e a Política antes de abrir para o público.
- [ ] **A6. Teste real com 2 celulares** (uns 10 minutos), um como vanzeiro e outro como passageiro. Pelo endereço https://van-and-pin-logo-studio.lovable.app:
  1. Vanzeiro: preencher o Perfil (Pix e lugares), ativar as notificações e criar um destino.
  2. Passageiro: criar a conta, entrar pelo código, ativar as notificações.
  3. Vanzeiro: aceitar. O passageiro recebe "Pedido aceito" na hora.
  4. Passageiro: "Vou". O vanzeiro vê na hora e "1 de 15 lugares" no Início.
  5. Vanzeiro: iniciar a viagem e marcar "Embarcou". O passageiro vê "A van saiu" e "Embarcou".
  6. Vanzeiro: Financeiro → marcar como pago. O passageiro vê "Pago".
  7. Repetir os passos 5 e 6 com o celular do vanzeiro no **modo avião**. Tudo é enviado quando o sinal volta.
  8. Passageiro: "Sair do destino". A vaga abre.
  
  Se qualquer passo falhar, mande um print. Eu acompanho pelo banco e corrijo.

## Parte B — Eu faço (código e banco), por etapas

- [ ] **B1. Desempenho do banco.** São avisos do próprio Supabase: nada está quebrado, mas o banco fica lento com muitos vanzeiros. Faço antes de crescer.
  - 19 ligações entre tabelas sem índice.
  - 18 regras de acesso que recalculam "quem é a pessoa" em cada linha.
  - 13 tabelas com duas regras de leitura que dá para juntar numa só.
- [ ] **B2. Registro de erros dos celulares.** Hoje, se der um erro no celular de alguém, ninguém fica sabendo. Gravar os erros numa tabela do banco, só o texto do erro e a tela, sem dados pessoais, para eu ver e corrigir.
- [ ] **B3. Sem sinal em mais coisas.** Hoje só a viagem funciona sem internet. "Marcar como pago" e "Anotar gasto" também podem ficar guardados e ser enviados quando o sinal voltar. Precisa da sua decisão.
- [ ] **B4. Documentação em dia.** Registrar na fonte da verdade (`docs/fonte-da-verdade.md`) o que foi feito de E1 a E5, G1, G2, tempo real e Google. Hoje está só na contraprova. Apagar do projeto os arquivos `SO-SQL-*.sql` que já foram aplicados.
- [ ] **B5. Teste automático das telas com o banco de verdade.** Hoje os testes das telas usam um banco simulado. Para testar com o real, o ambiente onde eu trabalho precisa ter acesso ao Supabase. Isso sai de uma permissão sua no ambiente (eu peço na hora).
- [ ] **B6. Listas longas.** O app lê as últimas 300 viagens e os últimos 300 avisos. Serve para o piloto. Com muito uso, o histórico vai precisar de "ver mais".

## Parte C — Limites que não são erro (saber explicar ao vanzeiro)

- **iPhone:** só recebe notificação com o app instalado na tela inicial. É uma regra da Apple.
- **Som e vibração com o app fechado:** quem decide é o ajuste de notificações do celular (Configurações → Apps → O Vanzeiro → Notificações).
- **Sem internet:** responder "Vou" e "Não vou", aceitar pedidos e fazer cadastros precisam de internet. Aparece o aviso e nada muda.
- **Diário e Por viagem:** a cobrança só nasce no "Embarcou" (decisão sua de 16/11).

## Parte D — Depois (não faz parte dos 100% de agora)

- Mapa e GPS: localização da van ao vivo.
- App Android na Play Store.
- Domínio próprio (ex.: ovanzeiro.com.br), que deixa o endereço profissional e libera serviços de e-mail como o Resend.

---

**Ordem sugerida:** A1 → A2 → A4 → A6 (teste real) → B4 → B2 → B1 → A3 → A5. A B3 e a B6 ficam quando você quiser.
