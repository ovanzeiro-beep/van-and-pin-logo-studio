#!/usr/bin/env python3
import runpy, sys, datetime as dt
"""Proteção de descontos (SO-SQL-17): o celular do vanzeiro chega ANTES da tarefa automática do banco.

Num PostgreSQL LOCAL e descartável (dados fictícios). O app aberto confere o prazo a cada minuto
(src/lib/viagem-store.ts, registrarFaltasDoPrazo) e grava a falta e o desconto; a tarefa do banco roda a cada 5 minutos
e, quando a falta já existe, não desconta de novo (supabase/migrations/20261120130000_correcao2_cobrancas_preservadas.sql).
Resultado esperado de um banco correto: o desconto fica (1 falta) com e sem a proteção.
Uso: LAB_PGPORT=54329 .venv-lab/bin/python scripts/teste-desconto-celular-primeiro.py
"""
lab = runpy.run_path(str(__import__("pathlib").Path(__file__).with_name("auditoria-laboratorio.py")), run_name="lab")
q, como, admin, tenta = lab["q"], lab["como"], lab["admin"], lab["tenta"]
base = lab["montar_base"]("vz_corrida")
for nome, com17 in (("sem_17", False), ("com_17", True)):
    c = lab["nova_db"](base, "corrida_" + nome)
    if com17: c.execute(open(str(__import__("pathlib").Path(__file__).parents[1] / "supabase/SO-SQL-17-DESCONTO-PROTEGIDO.sql")).read())
    u = lab["cenario"](c); h = u["hoje"]
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    cid = q(c, "select id from public.cobrancas where matricula_id='m2' and pagamento_data is null")[0][0]
    como(c, u["P2"]); q(c, "select public.responder('m2', %s, 'nao-vai')", (h,))
    admin(c); prazo = q(c, "select public.prazo_da_viagem(d, %s) from public.destinos d where id='d1'", (h,))[0][0]
    # O CELULAR do vanzeiro (app aberto) chega primeiro: grava a falta e o desconto (como src/lib/banco/dinheiro.ts faz)
    como(c, u["V"])
    r1 = tenta(c, "insert into public.faltas (matricula_id, data, avisou_no_prazo, avisou_em) values ('m2', %s, true, now()) on conflict do nothing", (h,))
    r2 = tenta(c, "update public.cobrancas set faltas = 1, valor_falta = 1000 where id = %s", (cid,))
    # depois roda a tarefa automática do banco
    admin(c); q(c, "select public.tarefas_do_relogio(%s)", (prazo + dt.timedelta(minutes=1),)); q(c, "select public.tarefas_do_relogio(%s)", (prazo + dt.timedelta(minutes=6),))
    f = q(c, "select faltas, valor_falta from public.cobrancas where id=%s", (cid,))[0]
    print(nome, "celular primeiro:", r1[0], r2[0], "→ desconto final (faltas, valor):", f)
    c.close()
