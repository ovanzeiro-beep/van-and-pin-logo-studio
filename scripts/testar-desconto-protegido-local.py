#!/usr/bin/env python3
"""P0 de descontos: SOMENTE PostgreSQL local descartável, sem credenciais de produção.

Requer laboratório local de auditoria-laboratorio.py e psycopg; Auth/cron/HTTP simulados.
PYTHONDONTWRITEBYTECODE=1 python3 scripts/testar-desconto-protegido-local.py --saida /tmp/desconto.json
"""
import argparse
import datetime as dt
import importlib.util
import json
from pathlib import Path
import threading
import uuid
import psycopg

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("lab", ROOT / "scripts/auditoria-laboratorio.py")
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)
SQL = ROOT / "supabase/SO-SQL-17-DESCONTO-PROTEGIDO.sql"
RESULTADOS = []


def verificar(nome, esperado, obtido):
    ok = esperado == obtido
    RESULTADOS.append(dict(teste=nome, esperado=esperado, obtido=obtido, passou=ok))
    print(("PASSOU " if ok else "FALHOU ") + nome + " | " + str(obtido), flush=True)
    if not ok:
        raise AssertionError(f"{nome}: esperado {esperado!r}; obtido {obtido!r}")


def desconto(c, cid):
    lab.admin(c)
    return lab.q(c, "select faltas, valor_falta, valor_base-faltas*valor_falta from public.cobrancas where id=%s", (cid,))[0]


def executar(base, plano):
    db = "desconto_" + uuid.uuid4().hex[:12]
    c = lab.nova_db(base, db)
    u = lab.cenario(c)
    h = u["hoje"]
    lab.admin(c)
    lab.q(c, "update public.matriculas set plano=%s, entrou_em=%s where id='m2'", (plano, h-dt.timedelta(days=2)))
    lab.q(c, "select public.tarefas_do_relogio(now())")
    cid = lab.q(c, "select id from public.cobrancas where matricula_id='m2' order by vencimento limit 1")[0][0]
    periodos = lab.q(c, "select periodo_de, periodo_ate from public.cobrancas where id=%s", (cid,))[0]
    # Respostas da ficha antes do prazo; o relógio valida e conta, não o aparelho.
    for dia in (h-dt.timedelta(days=1), h):
        prazo = lab.q(c, "select public.prazo_da_viagem(d,%s) from public.destinos d where id='d1'", (dia,))[0][0]
        lab.q(c, "insert into public.respostas(matricula_id,data,resposta,respondida_em,prazo) values('m2',%s,'nao-vai',%s,%s)", (dia, prazo-dt.timedelta(minutes=10),prazo))
    ontem = lab.q(c, "select public.prazo_da_viagem(d,%s) from public.destinos d where id='d1'", (h-dt.timedelta(days=1),))[0][0]
    hoje = lab.q(c, "select public.prazo_da_viagem(d,%s) from public.destinos d where id='d1'", (h,))[0][0]
    lab.q(c, "select public.tarefas_do_relogio(%s)", (ontem+dt.timedelta(minutes=1),))
    verificar(plano+": relógio conta primeira falta", (1,1000,29000), desconto(c,cid))
    lab.como(c,u["V"])
    lab.q(c, "update public.cobrancas set faltas=0,valor_falta=0,periodo_de=null,periodo_ate=null where id=%s", (cid,))
    verificar(plano+": aparelho antigo não apaga R$ 10", (1,1000,29000), desconto(c,cid))
    verificar(plano+": período preservado", periodos, lab.q(c,"select periodo_de,periodo_ate from public.cobrancas where id=%s",(cid,))[0])
    lab.como(c,u["V"])
    lab.q(c,"select set_config('vanzeiro.anonimizar','sim',false)")
    lab.q(c,"update public.cobrancas set faltas=50,valor_falta=9999 where id=%s",(cid,))
    verificar(plano+": configuração não autoriza desconto", (1,1000,29000), desconto(c,cid))
    lab.q(c,"select set_config('vanzeiro.anonimizar','',false)")

    # Relógio bloqueia a linha e conta segunda falta; aparelho chega antes do COMMIT.
    server = lab.conectar(db)
    server.execute("begin")
    server.execute("select public.tarefas_do_relogio(%s)",(hoje+dt.timedelta(minutes=1),))
    iniciado, finalizado = threading.Event(), threading.Event()
    erros = []
    def aparelho():
        try:
            with lab.conectar(db) as celular:
                lab.como(celular,u["V"])
                celular.execute("set statement_timeout='10s'")
                iniciado.set()
                celular.execute("update public.cobrancas set faltas=0,valor_falta=0 where id=%s",(cid,))
        except Exception as e:
            erros.append(str(e))
        finally:
            finalizado.set()
    thread = threading.Thread(target=aparelho)
    thread.start()
    try:
        assert iniciado.wait(3)
        verificar(plano+": aparelho aguarda linha bloqueada", False, finalizado.wait(0.2))
    finally:
        server.execute("commit")
        server.close()
    thread.join(12)
    verificar(plano+": envio concorrente termina", [], erros+(['aparelho ainda em execução'] if thread.is_alive() else []))
    verificar(plano+": duas faltas mantêm R$ 20", (2,1000,28000), desconto(c,cid))
    lab.q(c,"select public.tarefas_do_relogio(%s)",(hoje+dt.timedelta(minutes=6),))
    verificar(plano+": relógio repetido não duplica", (2,1000,28000), desconto(c,cid))
    erros_relogio=[]
    def repetir_relogio():
        try:
            with lab.conectar(db) as interno:
                interno.execute("select public.tarefas_do_relogio(%s)",(hoje+dt.timedelta(minutes=8),))
        except Exception as e:
            erros_relogio.append(str(e))
    relogios=[threading.Thread(target=repetir_relogio) for _ in range(2)]
    for t in relogios:
        t.start()
    for t in relogios:
        t.join(12)
    verificar(plano+": dois relógios terminam sem erro",[],erros_relogio+['relógio ainda em execução' for t in relogios if t.is_alive()])
    verificar(plano+": dois relógios não duplicam desconto",(2,1000,28000),desconto(c,cid))
    lab.como(c,u["P2"])
    rows = lab.q(c,"update public.cobrancas set faltas=0 where id=%s",(cid,))
    verificar(plano+": passageiro não altera cobrança", 0, rows)
    verificar(plano+": desconto após tentativa do passageiro", (2,1000,28000), desconto(c,cid))
    lab.como(c,u["V"])
    lab.q(c,"update public.cobrancas set faltas=0,valor_falta=0,pagamento_data=%s,pagamento_forma='pix' where id=%s",(h,cid))
    verificar(plano+": pagamento antigo mantém desconto", (2,1000,28000), desconto(c,cid))
    verificar(plano+": Pix registrado", (h,'pix'), lab.q(c,"select pagamento_data,pagamento_forma from public.cobrancas where id=%s",(cid,))[0])
    lab.como(c,u["V"])
    r = lab.tenta(c,"update public.cobrancas set faltas=0 where id=%s",(cid,))
    verificar(plano+": paga continua imutável", 'erro', r[0])
    lab.admin(c)
    copia=cid+'_cancelamento'
    lab.q(c,"insert into public.cobrancas(id,vanzeiro_id,matricula_id,destino_id,nome,telefone,tipo,referencia,vencimento,valor_base,faltas,valor_falta,periodo_de,periodo_ate) select %s,vanzeiro_id,matricula_id,destino_id,nome,telefone,tipo,referencia,vencimento,valor_base,faltas,valor_falta,periodo_de,periodo_ate from public.cobrancas where id=%s",(copia,cid))
    lab.como(c,u['V'])
    lab.q(c,"update public.cobrancas set faltas=0,valor_falta=0,cancelamento_data=%s,cancelamento_motivo='Cortesia' where id=%s",(h,copia))
    verificar(plano+": cancelamento antigo mantém desconto",(2,1000,28000),desconto(c,copia))
    lab.como(c,u['V'])
    r=lab.tenta(c,"update public.cobrancas set faltas=0 where id=%s",(copia,))
    verificar(plano+": cancelada continua imutável",'erro',r[0])
    c.close()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--saida',required=True)
    args=parser.parse_args()
    base=lab.montar_base("desconto_base_"+uuid.uuid4().hex[:12])
    c=lab.conectar(base)
    c.execute(SQL.read_text())
    c.close()
    for plano in ('mensal','quinzenal'):
        executar(base,plano)
    # Reaplicação sobre fichas existentes e impressão digital de todas as cobranças.
    c=lab.nova_db(base,'desconto_reaplicacao_'+uuid.uuid4().hex[:12])
    lab.cenario(c)
    lab.admin(c)
    c.execute('select public.tarefas_do_relogio()')
    fingerprint="select md5(coalesce(jsonb_agg(to_jsonb(k) order by id)::text,'')) from public.cobrancas k"
    antes=lab.q(c,fingerprint)[0][0]
    c.execute(SQL.read_text())
    c.execute(SQL.read_text())
    verificar("SQL reaplicado preserva linhas",antes,lab.q(c,fingerprint)[0][0])
    verificar("função sem SECURITY DEFINER",False,lab.q(c,"select prosecdef from pg_proc where oid='public.cobranca_desconto_do_banco()'::regprocedure")[0][0])
    verificar("função interna fechada ao app",False,lab.q(c,"select has_function_privilege('authenticated','public.cobranca_desconto_do_banco()','execute')")[0][0])
    c.close()
    financeiro=lab.nova_db(base,'vanzeiro_etapa6')
    cursor=financeiro.execute((ROOT/'supabase/testes/etapa6-financeiro.sql').read_text())
    checks=[]
    while True:
        if cursor.description:
            checks.extend(row[0] for row in cursor.fetchall() if isinstance(row[0],str) and row[0].startswith('PASS:'))
        if not cursor.nextset():
            break
    verificar("matriz financeira existente: 20 verificações",20,len(checks))
    financeiro.close()
    c=lab.nova_db(base,'desconto_c5_'+uuid.uuid4().hex[:12])
    c.execute((ROOT/'supabase/testes/correcao5-exclusao-de-contas.sql').read_text())
    try:
        c.execute('select public.c5_teste()')
        raise AssertionError('C5 não devolveu o resultado esperado')
    except psycopg.Error as e:
        texto=e.diag.message_primary or str(e)
        if not texto.startswith('RESULTADO C5'):
            raise
        verificar("Correção 5 sem falhas",False,'FALHOU' in texto)
        verificar("Correção 5: 45 verificações",45,sum(l.startswith('OK ') for l in texto.splitlines()))
        print(texto)
    c.close()
    Path(args.saida).write_text(json.dumps(RESULTADOS,ensure_ascii=False,indent=2,default=str)+'\n')
    print(f'TOTAL {len(RESULTADOS)}: todos passaram')


if __name__=='__main__':
    main()