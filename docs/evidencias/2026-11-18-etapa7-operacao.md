# Etapa 7 — conferência técnica da versão candidata

Base: `f4bddee6e7b1c59dfee7cdeeb1cc3a832621d41c` (PR 8 integrado). A sequência técnica e o roteiro manual foram autorizados pelo dono; o teste físico foi deixado para depois. Nenhuma implementação do app ou configuração de produção foi alterada.

## Provas realizadas

| Verificação | Resultado e limite |
| --- | --- |
| Publicação | `/entrar`, manifesto, service worker e três ícones responderam HTTP 200. Manifesto válido, `start_url: /`, modo `fullscreen`, ícones declarados disponíveis. Isso não comprova instalação ou atualização num celular. |
| Correção da etapa 5 | `/passageiro/viagens` segue referenciando `viagem-COmA4avK.js`, já conferido com o campo `nao_estava`. O código da aplicação não mudou nas entregas documentais/de testes posteriores. Não afirma que uma jornada autenticada foi repetida. |
| Telas no navegador | Chromium 156, sem sessão de usuário, no servidor local da versão candidata: 8 rotas × 3 tamanhos (390×844, 360×740, 375×667), 24 verificações passaram. Entrar, criar conta, recuperar/criar senha, termos e privacidade renderizaram; painéis protegidos redirecionaram para Entrar. Sem corte horizontal ou exceção JavaScript observados. Requisições que gravam foram bloqueadas pelo laboratório. |
| Limite do navegador | A primeira tentativa de Chromium contra o site público foi bloqueada por `ERR_CERT_AUTHORITY_INVALID` no ambiente. A validação TLS não foi desativada; a navegação automatizada foi feita localmente. A publicação foi consultada separadamente por HTTP com a confiança configurada do cliente. Os primeiros seis resultados negativos do teste local eram uma espera incompleta pela renderização depois do redirecionamento; após esperar o formulário visível, as 24 verificações passaram. Nenhum reparo foi feito no app. |
| Banco disponível | Consulta da integração retornou projeto `ovanzeiro` em `ACTIVE_HEALTHY`, PostgreSQL 17.11. O consultor de saúde não retornou avisos na consulta desta execução. Não é certificação de ausência de falhas. |
| Tarefas | Conforme a consulta da etapa 6: relógio a cada cinco minutos e reenvio push a cada minuto ativos; 72 execuções bem-sucedidas na hora anterior. Esse dado não comprova recebimento de um aviso no aparelho. |
| Restauração de laboratório | `python3 scripts/testar-financeiro-local.py --restaurar` passou. Reaplicou as 26 migrations em PostgreSQL 18.6, executou as vinte verificações financeiras, persistiu somente as fichas fictícias naquele banco descartável sem rede, gerou dump customizado e restaurou em outro banco local. Contagens e hashes coincidiram: quatro matrículas, seis cobranças e um gasto, com o mesmo histórico e valores. Containers e arquivos internos descartados. |
| Limite da restauração | Auth, agendador e transporte externo são simulados no laboratório. **Não foi acessado, exportado nem restaurado backup de produção.** Ainda é preciso confirmar a retenção/plano efetivos e demonstrar recuperação de produção em ambiente separado, com autorização específica. |

Os resultados das 24 verificações e dos recursos HTTP estão em [JSON](2026-11-18-etapa7-preflight.json). É uma fotografia desta execução, sem estado de aprovação dos testes manuais.

## Avisos operacionais reais ainda acompanhados

O consultor de segurança retornou: dois informativos de RLS sem política, um aviso de extensão `pg_net` em `public`, 31 funções privilegiadas disponíveis para usuários autenticados e proteção contra senhas vazadas desligada. São itens para avaliação pelo propósito, sem revogação em massa ou exposição de tabelas de chaves para apagar alertas.

- [RLS sem política](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy): tabelas exclusivas do serviço podem permanecer sem política de acesso pelo app.
- [Extensão em public](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public): melhoria opcional já registrada, sem mover automaticamente nesta conferência.
- [Funções privilegiadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable): manter revisão por função e pelo papel permitido.
- [Proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection): configuração ainda pendente de decisão/condições do serviço; nenhum plano foi contratado.

## Como repetir

```sh
python3 scripts/testar-financeiro-local.py --restaurar
npm run dev -- --host 127.0.0.1 --port 4176
# Em outro terminal; requer Python Playwright e Chromium:
python3 scripts/conferir-telas-publicas.py --url http://127.0.0.1:4176
```

O utilitário de banco usa somente Docker no socket local e não recebe credencial ou URL de banco externo. O de telas usa contexto novo sem login e bloqueia métodos de escrita. A restauração passou antes do acréscimo da ajuda de linha de comando; essa última alteração é apenas texto. Sintaxe dos dois utilitários conferida.

## Situação da entrega

Conferência técnica concluída dentro dos limites acima; **aceite final em aberto**. O [roteiro manual](../roteiro-testes-celular.md) cobre os aparelhos, avisos, viagens, perda de sinal, troca de conta e financeiro. A política/recuperação de backup de produção e a revisão jurídica também permanecem pendentes. Nenhuma dessas provas foi substituída por uma contagem de testes.
