# Implantação das Correções 1 a 4 (preparada em 20/11/2026, NÃO executada)

Este documento é o plano. Nada aqui foi feito em produção: o Supabase `ovanzeiro`, a `main` (`1206cbd`) e o app publicado continuam como estavam. Cada passo marcado com 🔒 só pode ser feito depois da autorização do dono.

## 1. O que vai junto

| Correção | O que resolve | Banco | App |
| --- | --- | --- | --- |
| 1 · Avisos seguros | Ninguém consegue mandar aviso falso para outra pessoa; os textos são montados pelo banco. | `20261120120000_correcao1_avisos_seguros.sql` | sim |
| 2 · Cobranças preservadas | Quem sai (ou é removido) não apaga cobranças de viagem feita nem de período já iniciado. | `20261120130000_correcao2_cobrancas_preservadas.sql` | sim |
| 3 · Cobrança no embarque | O banco cria a cobrança no momento em que a viagem grava o embarque, mesmo que a internet caia. | `20261120140000_correcao3_cobranca_no_embarque.sql` | sim |
| 4 · Mapa real | Tela «Situação da van» sem van simulada; fim do erro `_leaflet_pos`. | nenhuma | sim |

- Branch de integração: `claude/integracao-correcoes-1-a-4`. Ela contém, em sequência, a auditoria, as Correções 1, 2, 3 e 4 e este pacote.
- A `main` é ancestral direta da branch. Por isso, o merge é um simples avanço, sem conflitos.
- As 3 migrações só criam ou trocam funções e gatilhos. Nenhuma altera, apaga ou cria dados.

## 2. Backup antes de implantar

- **Arquivo:** `backup-ovanzeiro-2026-11-20.json`. Foi entregue ao dono no chat e **não** foi colocado no GitHub, porque contém dados pessoais.
- **Tamanho:** 94.824 bytes, com 180 linhas de 16 tabelas.
- **sha256:** `b573d3753b8581c171261f8e419bedf25351df788f772dcdbdc78128af5d1841`. Serve para conferir se o arquivo guardado continua íntegro.
- **O que fica de fora:**
  - as contas de login (`auth.users`), que são guardadas pelo próprio Supabase;
  - `chaves_push`, porque é um segredo;
  - `celulares` e `entregas_push`, que são inscrições de notificação e se refazem quando a pessoa ativa de novo.
- **Restauração provada:** `scripts/backup-ensaio-implantacao.py` monta um banco igual ao de hoje e restaura o arquivo. Resultado: as 20 de 20 impressões digitais ficaram idênticas às da produção. A prova foi repetida depois do reinício do ambiente, com o mesmo resultado.
- **Limite:** o plano gratuito do Supabase não faz backup automático. A solução definitiva é o plano Pro, com backup diário que inclui as contas.

## 3. Sequência de implantação (🔒 tudo depende de autorização)

1. 🔒 **Novo backup no dia.** Se algum dado mudou desde 20/11, refazer a exportação, só em leitura, e entregar ao dono.
2. 🔒 **Aplicar no Supabase, nesta ordem e uma por vez:** C1 → C2 → C3. Usar a ferramenta de migração, com o texto exato dos arquivos da branch. Se uma falhar, parar: a migração falha inteira e não deixa nada pela metade.
3. **Conferir:** rodar `supabase/testes/implantacao-verificar.sql`, que é só leitura. Antes, trocar o `marco` pela hora da implantação. As 9 linhas têm que bater com a coluna «esperado».
4. 🔒 **Merge na `main`:** avanço direto da `main` para o último commit da branch de integração.
5. **O Lovable recebe sozinho:** ele acompanha a `main` do GitHub e puxa o commit novo em alguns minutos. Conferir com `get_project` que o `latest_commit_sha` mudou. Não é preciso pedir nada ao agente do Lovable, e não se deve pedir.
6. 🔒 **Publicar:** `deploy_project`. O resultado «pendente» não confirma que já está no ar. Conferir abrindo o app.
7. **Celulares:** o vanzeiro e os passageiros fecham o app por completo e abrem de novo, para carregar a versão nova.
8. **Roteiro do celular:** seguir o [roteiro](roteiro-celular-correcoes-1-a-4.md).

Por que o banco vem antes do app: o app novo (C3) espera que o banco crie a cobrança do embarque. Com o banco novo e o app antigo, tudo continua funcionando: o banco cria a cobrança, e a tentativa do app de criar a mesma é ignorada, sem duplicar (teste C3.8). Com o app novo e o banco antigo, a cobrança do embarque poderia faltar.

## 4. Celulares com a versão antiga

- Celular aberto com o app de antes da Correção 2: se ele tentar apagar uma cobrança de período iniciado, o banco recusa. Os dados ficam protegidos, mas a sincronização daquele aparelho pode ficar travada até a pessoa fechar e abrir o app.
- Celular com versão anterior a 17/11: o texto do aviso de resposta («Vou» / «Não vou») pode ser recusado. O risco é baixo.
- Em ambos os casos, basta fechar e abrir o app.

## 5. Monitoramento depois de publicar

- Rodar `implantacao-verificar.sql` em três momentos: logo depois, 1 hora depois e no dia seguinte, depois da primeira viagem real.
- O que cada linha confere:
  - 1 a 3: as funções e os gatilhos certos estão no lugar e nenhuma função interna está aberta ao app;
  - 4: erros enviados pelos celulares depois da implantação (a lista vem no fim do arquivo, sem dados pessoais);
  - 5 e 6: tarefas automáticas e envios de notificação com falha;
  - 7: passageiro embarcado sem cobrança (Por viagem e Diário);
  - 8: cancelamento automático que não deveria ter acontecido;
  - 9: aviso duplicado.
- Qualquer número fora do esperado: parar, não publicar mais nada e avaliar a reversão.

## 6. Reversão (🔒 também depende de autorização)

1. **Banco, na ordem inversa:**
   - `supabase/testes/correcao3-reverter.sql`;
   - `supabase/testes/correcao2-reverter.sql`;
   - `supabase/testes/correcao1-reverter.sql`.
   - Cada um roda inteiro ou não roda nada.
   - Os três só voltam as funções e os gatilhos: nenhum dado é apagado.
   - Cobranças criadas pela C3 nesse meio-tempo continuam válidas, porque são de embarques reais.
2. **App:** um commit novo na `main` que desfaz o merge (`git revert`), sem reescrever o histórico. Depois, publicar de novo.
3. **Prova:** o ensaio aplicou C1 → C3 e reverteu C3 → C1 sobre a cópia dos dados reais. A impressão digital de funções e gatilhos voltou idêntica à de hoje. Durante esse ensaio, foi corrigida uma falha do roteiro da C2, que deixava 5 funções internas para trás.
4. **Não usar** `correcao3-recuperar-embarques.sql` para os 2 embarques de 17/11, que eram testes fictícios.

## 7. Provas da integração (20/11/2026)

| Conferência | Resultado |
| --- | --- |
| App: testes automáticos | 472/472 |
| App: tipos e build | sem erro |
| App: lint | 1.733 erros de formatação herdados e 5 avisos, os mesmos de antes (nada novo) |
| Banco (laboratório, dados fictícios) | 110 de 117. C1 26/26, C2 17/17, C3 14/14, financeiro 20/20, E3 28/28. Os 7 que falham são das correções futuras (T1.10, T3.2–T3.4, T4.2, T9.4, T10.11), iguais aos de antes. |
| Navegador (Chromium) | Percurso do passageiro 17/17; fechar o mapa durante o zoom: 0 erros em 60 vezes |
| Compatibilidade | As 28 funções e as 18 tabelas usadas pelo app estão presentes |
| Ensaio sobre a cópia dos dados reais | Restauração idêntica; dados inalterados após as migrações; nenhuma cobrança nova (8 → 8); 0 avisos duplicados; reversão idêntica |
| Verificação pós-implantação no laboratório | 9 de 9 no valor esperado |
| Produção conferida (só leitura) | 71 funções e regras de acesso iguais às da auditoria |

## 8. O que continua pendente (fora destas correções)

- As Correções 5 e 6 e os problemas P1/P2 da auditoria.
- Teste em celular físico.
- O plano Pro, para ter backup automático.
- A viagem `destino-mwm9ildz-13_2026-11-18` parada em «chegada». Enquanto ela não for encerrada, o vanzeiro não consegue iniciar outra; quem encerra é o vanzeiro, no app.
- Os 2 embarques fictícios de 17/11, sem cobrança, que ficam assim por decisão do dono.
