# Auditoria de 20/11/2026 — Fases 1 a 4 (registro das provas)

Base auditada: `main` = `1206cbdeccecf8b9c5a51e3b6b17f94540b37d5b`. Fases 1 a 3 foram só leitura (código e banco de produção, consultas de leitura). A Fase 4 rodou num PostgreSQL **local e descartável**, sem rede externa, com dados 100% fictícios. Nada foi escrito no Supabase de produção.

## Como reproduzir

- Banco: `scripts/auditoria-laboratorio.py` (recusa qualquer host que não seja local; as instruções estão no topo do arquivo). Resultado completo, com esperado e obtido de cada teste: [`2026-11-20-auditoria-fase4-resultado.json`](2026-11-20-auditoria-fase4-resultado.json).
- App: [`2026-11-20-fase4-cobranca-com-sinal.test.ts.txt`](2026-11-20-fase4-cobranca-com-sinal.test.ts.txt) (fica fora da suíte porque documenta um defeito ainda aberto).

## O laboratório é equivalente à produção

Comparação por impressão digital (md5 do código de cada função e de cada regra de acesso), feita em leitura na produção:

- 38 de 38 regras de acesso (RLS) idênticas.
- 71 funções: 67 idênticas; 4 (`conta_so_por_funcao`, `destino_com_lugar`, `mudar_meu_embarque`, `responder`) diferem só por comentários. A lógica é a mesma.
- O histórico de migrations do Supabase (14 registros) não bate com o repositório (27 arquivos), mas as 27 migrations recriam um banco equivalente.

## Resultado: 60 testes de banco, 45 passaram, 15 falharam

| Teste | Situação | Esperado | Obtido |
| --- | --- | --- | --- |
| T1.1 | Sair do destino com cobrança "Por viagem" de viagem feita | valendo | **cancelada** |
| T1.5 | Mensal exclui a conta no meio do período | valendo (D1-C) | **cancelada** |
| T1.8 | Dívida vencida de quem saiu | vanzeiro avisado | **0 avisos** |
| T1.10 | Vanzeiro exclui a conta | histórico preservado (D2) | **tudo apagado (3,3,1 → 0,0,0)** |
| T2.1 | Passageiro manda aviso "cobrança vencida" com Pix falso a outro | recusado | **aceito e visível** |
| T2.2 | Passageiro troca o texto de um aviso do vanzeiro | recusado | **trocado** |
| T2.3 | Passageiro manda "pedido novo" falso ao vanzeiro | recusado | **aceito** |
| T2.7 | Aviso falso entra no envio ao celular | não | **gravado (mesmo gatilho de envio)** |
| T3.2 | Testar os 9.000 códigos de convite | bloqueio | **2 rotas achadas em ~2–3 s** |
| T3.3 | 30 pedidos repetidos | 1 | **30** |
| T3.4 | Telefone revela cadastro | mesma resposta | **1 × 0** |
| T4.2 | Gravar `faltas=0` por cima do desconto | recusado | **aceito** |
| T5.1 | Embarque sem cobrança | banco cria/aponta | **nada** |
| T9.4 | Pago com data 60 dias no futuro | recusado | **aceito** |
| T10.11 | 200 "erros" falsos sem login | limite | **200** |

Passaram: concorrência e toque duplo (T6.1–T6.6), última vaga (T7.1–T7.3), queda no meio de "Aceitar pedido" (T8.1), imutabilidade das cobranças (T9.1–T9.3, T9.5–T9.8), separação de dados (T10.1–T10.10), desconto do "Não vou" sem duplicar (T4.1), reenvio da mesma cobrança (T5.2).

## Teste do app: cobrança perdida quando a internet cai logo depois do "Embarcou" (P0-3)

| Cenário | Resultado |
| --- | --- |
| A — viagem e embarque chegam ao banco; a cobrança falha; o app é fechado e aberto | **cobrança nunca criada** (a viagem no servidor mostra o embarque) |
| B — app fechado menos de 400 ms depois do toque | **embarque e cobrança perdidos** |
| C — controle, sem queda | cobrança criada |

Causa: com sinal, a cobrança fica só na memória e é enviada ~400 ms depois (`src/lib/banco/viagem.ts`, `src/lib/banco/dinheiro.ts`); a fila guardada no celular (`src/lib/banco/fila.ts`) só cobre o caso sem sinal desde o início; o banco não cria cobrança a partir de viagens ou embarques.

## Regressão nesta data

- 20 de 20 verificações de `supabase/testes/etapa6-financeiro.sql` passaram no mesmo laboratório.
- 451 de 451 testes do app passaram; tipos e build sem erro.

## Classificação depois da Fase 4

- **P0:** cobranças canceladas na saída e nas exclusões (T1.1, T1.5); avisos falsos (T2.1–T2.7); cobrança perdida na queda de sinal (A, B, T5.1); exclusão do vanzeiro apaga o histórico (T1.10); sem backup (plano free); van simulada no mapa do passageiro.
- **P1:** varredura de convites (T3.2); telefone revela cadastro (T3.4); vanzeiro não é avisado da dívida de quem saiu (T1.8); dados pessoais nas cobranças após exclusão (D3); erro `_leaflet_pos` em produção; proteção de senhas vazadas desligada.
- **P2:** desconto sobrescrito (T4.2; no app depende de ficar sem sinal em dois dias de falta); pagamento com data futura (T9.4); pedidos repetidos (T3.3); registro de erros sem limite (T10.11); histórico de migrations fora de ordem.

## Limites

Login do Supabase, pg_net e pg_cron simulados; PostgreSQL 16 no laboratório e 17 em produção; sem celular físico, sem entrega real de notificação e sem acesso ao site publicado a partir deste ambiente.

## Decisões do dono registradas para as correções (20/11/2026)

- D1: opção C — períodos já iniciados e viagens feitas nunca perdem a cobrança automaticamente; ajuste ou cancelamento só manual e justificado; nada de cobrança por serviço futuro não prestado.
- D2: B + C — desativação, 30 dias para recuperar, preservação controlada dos registros financeiros; consequências e critérios legais antes de implementar.
- D3: preservar só o necessário para obrigação legal ou exercício de direitos, com prazo e base legal a definir; eliminar ou anonimizar o resto; não apagar o histórico financeiro legítimo.
- D4: retirar a localização fictícia da van; só informação real e verificável.
- D5: considerar o plano Pro do Supabase antes do lançamento; nenhuma contratação nesta etapa.
