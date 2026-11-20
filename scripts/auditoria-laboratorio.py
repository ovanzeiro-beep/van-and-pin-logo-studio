#!/usr/bin/env python3
"""Auditoria (Fases 4 e seguintes) — testes de segurança e integridade num PostgreSQL LOCAL e descartável.

Nunca conecta em produção: recusa qualquer host que não seja local. Dados 100% fictícios.
Recria um banco base com as migrations de supabase/migrations e roda cada grupo de testes num banco
copiado desse base. O login do Supabase, pg_net e pg_cron são simulados (scripts/testar-financeiro-local.py).

Preparar (uma vez): um PostgreSQL 16+ ouvindo só em 127.0.0.1 e o pacote psycopg:
  initdb -D /caminho/pg -U postgres --auth=trust
  pg_ctl -D /caminho/pg -o "-c listen_addresses=127.0.0.1 -c port=55432" start
  python3 -m venv .venv-lab && .venv-lab/bin/pip install "psycopg[binary]==3.2.3"
Rodar:
  .venv-lab/bin/python scripts/auditoria-laboratorio.py --saida resultado.json
Resultado esperado: cada linha diz PASSOU/FALHOU com o valor obtido. Registro: docs/evidencias/.
"""
import json, os, pathlib, re, sys, threading, time, uuid, datetime as dt
import importlib.util
import psycopg

HOST = os.environ.get("LAB_PGHOST", "127.0.0.1")
PORTA = os.environ.get("LAB_PGPORT", "55432")
if HOST not in ("127.0.0.1", "localhost", "::1"):
    raise SystemExit("Este laboratório só aceita um PostgreSQL local descartável (LAB_PGHOST=127.0.0.1).")
DSN = f"host={HOST} port={PORTA} user=postgres dbname={{db}}"
RES = []


def conectar(db):
    return psycopg.connect(DSN.format(db=db), autocommit=True)


def admin(c):
    c.execute("reset role; select set_config('request.jwt.claims', '', false)")


def como(c, uid):
    admin(c)
    c.execute("select set_config('request.jwt.claims', %s, false)", (json.dumps({"sub": str(uid), "role": "authenticated"}),))
    c.execute("set role authenticated")


def anon(c):
    admin(c)
    c.execute("set role anon")


def q(c, sql, p=None):
    cur = c.execute(sql, p or ())
    return cur.fetchall() if cur.description else cur.rowcount


def tenta(c, sql, p=None):
    try:
        return ("ok", q(c, sql, p))
    except psycopg.Error as e:
        return ("erro", (e.diag.message_primary or str(e)).strip())


def registra(teste, descricao, esperado, obtido, passou):
    RES.append({"teste": teste, "descricao": descricao, "esperado": esperado, "obtido": str(obtido)[:220], "passou": bool(passou)})
    print(("PASSOU " if passou else "FALHOU ") + teste + " — " + descricao + " | obtido: " + str(obtido)[:160], flush=True)


# ---------------------------------------------------------------- cenário
def usuario(c, nome):
    uid = uuid.uuid4()
    admin(c)
    q(c, "insert into auth.users (id, email, aud, role, raw_user_meta_data) values (%s, %s, 'authenticated', 'authenticated', %s)",
      (uid, f"{nome.lower().replace(' ', '.')}@exemplo.invalid", json.dumps({"nome": nome, "aceite_termos_em": "2026-11-20T00:00:00Z"})))
    return uid


def hoje(c):
    admin(c)
    return q(c, "select public.hoje_em_brasilia()")[0][0]


def cenario(c, lugares=4):
    u = {k: usuario(c, n) for k, n in [("V", "Vanzeiro Teste"), ("V2", "Outro Vanzeiro"), ("P1", "Ana Teste"), ("P2", "Bruno Teste"),
                                         ("P3", "Carla Teste"), ("P4", "Davi Teste"), ("X", "Estranho Teste")]}
    for k in ("V", "V2"):
        como(c, u[k]); q(c, "select public.escolher_papel('vanzeiro')")
        q(c, "update public.perfis_vanzeiro set van_lugares=%s, pix='pix-ficticio' where id=%s", (lugares, u[k]))
    for k in ("P1", "P2", "P3", "P4", "X"):
        como(c, u[k]); q(c, "select public.escolher_papel('passageiro')")
    como(c, u["V"])
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            values ('d1', %s, 'Cidade A', 'Cidade B', 'fixa', array['seg','ter','qua','qui','sex','sab','dom'], '23:50', '30min', 'VAN-4821', array['Cidade A','Cidade B'], true)""", (u["V"],))
    como(c, u["V2"])
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            values ('d2', %s, 'Cidade C', 'Cidade D', 'fixa', array['seg'], '07:00', '1h', 'VAN-7310', array['Cidade C','Cidade D'], true)""", (u["V2"],))
    planos = {"P1": ("m1", "viagem", 3000, None, False, None, "43999990001"),
              "P2": ("m2", "mensal", 30000, 10, True, 1000, "43999990002"),
              "P3": ("m3", "diario", 2000, None, False, None, "43999990003")}
    for k, (mid, plano, valor, venc, desc, vfalta, tel) in planos.items():
        como(c, u[k])
        ped = q(c, "select public.pedir_para_entrar('VAN-4821', %s, %s, 'Cidade A', 'Rua Ficticia 1', null, null)", (k + " Teste", tel))[0][0]
        como(c, u["V"])
        q(c, "select public.aceitar_pedido(%s, %s)", (ped, json.dumps({"id": mid, "nome": k + " Teste", "telefone": tel, "plano": plano, "valor": valor,
                                                                    "vencimento": venc, "desconta_faltas": desc, "valor_falta": vfalta})))
    u["hoje"] = hoje(c)
    return u


def nova_db(base, nome):
    c = psycopg.connect(DSN.format(db="postgres"), autocommit=True)
    c.execute(f"drop database if exists {nome}")
    c.execute(f"create database {nome} template {base}")
    c.close()
    return conectar(nome)


# ---------------------------------------------------------------- T1 cobranças na saída / exclusões
def t1(base):
    c = nova_db(base, "t1"); u = cenario(c); h = u["hoje"]
    como(c, u["V"])
    # embarque de hoje (Por viagem) e a cobrança que o app cria no "Embarcou": vence em 7 dias
    q(c, "insert into public.embarques (matricula_id, data) values ('m1', %s)", (h,))
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('m1_v1', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem de hoje', %s, 3000)""", (u["V"], h + dt.timedelta(days=7)))
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('m1_antiga', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem antiga', %s, 3000)""", (u["V"], h - dt.timedelta(days=2)))
    como(c, u["P1"]); r = tenta(c, "select public.sair_do_destino('m1')")
    admin(c)
    linhas = dict(q(c, "select id, coalesce(cancelamento_motivo,'valendo') from public.cobrancas where matricula_id='m1'"))
    registra("T1.1", "Passageiro sai do destino: cobrança de viagem FEITA ainda não vencida continua valendo", "valendo",
             linhas.get("m1_v1"), linhas.get("m1_v1") == "valendo")
    registra("T1.2", "Passageiro sai do destino: cobrança vencida (devendo) continua valendo", "valendo", linhas.get("m1_antiga"), linhas.get("m1_antiga") == "valendo")
    como(c, u["P1"]); vis = q(c, "select count(*) from public.cobrancas")[0][0]
    registra("T1.3", "Depois de sair, o passageiro ainda vê as próprias cobranças", "2", vis, vis == 2)

    # mensal: tarefa cria a cobrança do período; P2 exclui a conta no meio do período
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    mens = q(c, "select id, vencimento, referencia from public.cobrancas where matricula_id='m2'")
    registra("T1.4", "Tarefa automática cria a mensalidade seguinte de quem é Mensal", "1 cobrança", mens, len(mens) == 1)
    como(c, u["P2"]); r = tenta(c, "select public.excluir_minha_conta()")
    admin(c)
    st = q(c, "select coalesce(cancelamento_motivo,'valendo'), nome, telefone from public.cobrancas where matricula_id='m2'")
    registra("T1.5", "Passageiro Mensal exclui a conta no meio do período: mensalidade do período já iniciado é preservada (D1-C)", "valendo",
             st, bool(st) and st[0][0] == "valendo")
    registra("T1.6", "LGPD: depois de excluir a conta, a cobrança ainda guarda nome e telefone (observação para D3)", "decisão D3",
             st and st[0][1:], True)
    mat = q(c, "select nome, endereco, pessoa_id from public.matriculas where id='m2'")
    registra("T1.7", "Exclusão do passageiro anonimiza a matrícula", "nome 'Conta excluída', sem conta", mat, mat and mat[0][0] == "Conta excluída" and mat[0][2] is None)

    # cobrança vencida de quem saiu: o vanzeiro continua sendo lembrado?
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    lemb = q(c, "select count(*) from public.avisos where tipo='cobranca_vencida' and cobranca_id='m1_antiga'")[0][0]
    registra("T1.8", "Dívida de quem saiu: o vanzeiro continua recebendo o aviso 'cobrança vencida'", "1 aviso", lemb, lemb == 1)

    # exclusão do destino pelo vanzeiro (no banco é 'marcar excluído')
    como(c, u["V"])
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('m3_x', %s, 'm3', 'd1', 'P3 Teste', '43999990003', 'diario', 'Diária', %s, 2000)""", (u["V"], h))
    q(c, "update public.destinos set excluido_em=now(), ativo=false where id='d1'")
    admin(c); st = q(c, "select coalesce(cancelamento_motivo,'valendo') from public.cobrancas where id='m3_x'")
    registra("T1.11", "Excluir destino: o banco sozinho mantém a cobrança (o cancelamento vem do app, src/lib/exclusoes.ts)", "valendo", st, st == [("valendo",)])
    admin(c)
    saiu = q(c, "select count(*) from public.matriculas where destino_id='d1' and saiu_em is null")[0][0]
    aviso = q(c, "select count(*) from public.avisos where tipo='destino_excluido'")[0][0]
    registra("T1.9", "Excluir destino no banco: matrículas encerradas e passageiros avisados; cobranças não são tocadas pelo banco", "0 ativas, avisos>0",
             (saiu, aviso), saiu == 0 and aviso > 0)

    # exclusão da conta do vanzeiro
    antes = q(c, "select (select count(*) from public.cobrancas), (select count(*) from public.matriculas), (select count(*) from public.embarques)")[0]
    como(c, u["V"]); r = tenta(c, "select public.excluir_minha_conta()")
    admin(c)
    depois = q(c, "select (select count(*) from public.cobrancas where vanzeiro_id=%s), (select count(*) from public.matriculas where vanzeiro_id=%s), (select count(*) from public.embarques)", (u["V"], u["V"]))[0]
    registra("T1.10", "Vanzeiro exclui a conta: histórico financeiro dos passageiros é preservado (D2 B+C)",
             "cobranças preservadas", f"antes {antes} → depois {depois} ({r[0]})", depois[0] > 0)
    c.close()


# ---------------------------------------------------------------- T2 avisos
def t2(base):
    c = nova_db(base, "t2"); u = cenario(c)
    como(c, u["V"])
    q(c, "select public.salvar_aviso(%s, false)", (json.dumps({"id": "a-legit", "destino_id": "d1", "para": str(u["P2"]), "tipo": "pedido_aceito",
                                                              "texto": "Seu pedido foi aceito.", "chave": "pedido_aceito_m2"}),))
    como(c, u["P1"])
    r = tenta(c, "select public.salvar_aviso(%s, false)", (json.dumps({"id": "a-golpe", "destino_id": "d1", "para": str(u["P2"]), "tipo": "cobranca_vencida",
                                                                      "texto": "Mensalidade mudou: pague R$ 500 no Pix golpe@exemplo.invalid", "chave": "golpe1"}),))
    como(c, u["P2"]); vis = q(c, "select texto from public.avisos where id='a-golpe'")
    registra("T2.1", "Passageiro cria aviso falso (tipo 'cobrança vencida', texto livre) para outro passageiro", "recusado",
             f"{r[0]}; P2 vê: {vis}", r[0] == "erro" and not vis)
    como(c, u["P1"])
    r = tenta(c, "select public.salvar_aviso(%s, true)", (json.dumps({"id": "a-legit2", "destino_id": "d1", "para": str(u["P2"]), "tipo": "pedido_aceito",
                                                                     "texto": "Pedido aceito. Pague a taxa de matrícula no Pix golpe@exemplo.invalid", "chave": "pedido_aceito_m2"}),))
    como(c, u["P2"]); vis = q(c, "select texto from public.avisos where chave='pedido_aceito_m2'")
    registra("T2.2", "Passageiro sobrescreve um aviso legítimo do vanzeiro para outra pessoa", "recusado; texto original mantido",
             f"{r[0]}; P2 vê: {vis}", vis == [("Seu pedido foi aceito.",)])
    como(c, u["P1"])
    r = tenta(c, "select public.salvar_aviso(%s, false)", (json.dumps({"id": "a-v", "destino_id": "d1", "para": str(u["V"]), "tipo": "pedido_novo",
                                                                      "texto": "Pedido novo falso", "chave": "falso_v"}),))
    registra("T2.3", "Passageiro cria aviso de tipo do vanzeiro ('pedido novo') para o vanzeiro", "recusado", r, r[0] == "erro")
    como(c, u["X"])
    r = tenta(c, "select public.salvar_aviso(%s, false)", (json.dumps({"id": "a-x", "destino_id": "d1", "para": str(u["P2"]), "tipo": "x", "texto": "x", "chave": "x"}),))
    registra("T2.4", "Pessoa de fora do destino cria aviso", "recusado", r, r[0] == "erro")
    admin(c); ids = [x[0] for x in q(c, "select id from public.avisos where para=%s", (str(u["P2"]),))]
    como(c, u["P1"]); q(c, "select public.apagar_avisos(%s)", (ids,))
    admin(c); apag = q(c, "select count(*) from public.avisos where para=%s and apagado", (str(u["P2"]),))[0][0]
    registra("T2.5", "Passageiro tenta apagar avisos de outra pessoa", "0 apagados", apag, apag == 0)
    como(c, u["P1"]); outros = q(c, "select count(*) from public.avisos where para<>%s", (str(u["P1"]),))[0][0]
    registra("T2.6", "Passageiro lê avisos de outras pessoas", "0", outros, outros == 0)
    admin(c); fila = q(c, "select count(*) from public.avisos where id in ('a-golpe')")[0][0]
    registra("T2.7", "Aviso falso entra na fila de notificação do celular (gatilho entregar_aviso)", "não entra", f"aviso gravado: {fila}", fila == 0)
    c.close()


# ---------------------------------------------------------------- T3 convites
def t3(base):
    c = nova_db(base, "t3"); u = cenario(c)
    anon(c); r = tenta(c, "select * from public.destino_pelo_convite('VAN-4821')")
    registra("T3.1", "Sem login, consultar convite", "recusado", r[0], r[0] == "erro")
    como(c, u["X"]); t0 = time.time(); achados = []
    for n in range(1000, 10000):
        rows = q(c, "select * from public.destino_pelo_convite(%s)", (f"VAN-{n}",))
        if rows:
            achados.append(rows[0])
    seg = time.time() - t0
    registra("T3.2", "Conta comum testa todos os 9.000 códigos VAN-1000…VAN-9999", "bloqueado após poucas tentativas",
             f"{len(achados)} destinos achados em {seg:.1f}s, sem bloqueio; exemplo: {achados[:1]}", len(achados) == 0)
    como(c, u["X"]); ok = 0
    for i in range(30):
        if tenta(c, "select public.pedir_para_entrar('VAN-4821', 'Estranho Teste', '43999990099', 'Cidade A', 'Rua', null, null)")[0] == "ok":
            ok += 1
    registra("T3.3", "Mesma conta manda 30 pedidos repetidos para o mesmo destino", "1 pedido aguardando", f"{ok} pedidos criados", ok <= 1)
    como(c, u["V"])
    q(c, """insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('mman', %s, 'd1', 'Cadastro Manual', '43999990555', 'viagem', 3000)""", (u["V"],))
    como(c, u["X"])
    a = q(c, "select public.pedir_juntar_pelo_telefone('43999990555')")[0][0]
    b = q(c, "select public.pedir_juntar_pelo_telefone('43999990777')")[0][0]
    registra("T3.4", "Conta qualquer descobre se um telefone está cadastrado (pedir_juntar_pelo_telefone)", "mesma resposta para os dois",
             f"telefone cadastrado → {a}; inexistente → {b}", a == b)
    como(c, u["V"]); pend = q(c, "select conta_id, telefone from public.juntar_conta where matricula_id='mman'")
    registra("T3.5", "O pedido de 'assumir' o cadastro de outra pessoa chega ao vanzeiro sem verificação do telefone", "observação",
             pend, True)
    como(c, u["V2"])
    vis = q(c, "select (select count(*) from public.destinos where id='d1'), (select count(*) from public.matriculas where destino_id='d1')")[0]
    registra("T3.6", "Outro vanzeiro lê destino e passageiros alheios", "(0, 0)", vis, vis == (0, 0))
    c.close()


# ---------------------------------------------------------------- T4 faltas / descontos  e  T5 cobranças após embarque
def t4_t5(base):
    c = nova_db(base, "t4"); u = cenario(c); h = u["hoje"]
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    cid = q(c, "select id from public.cobrancas where matricula_id='m2'")[0][0]
    como(c, u["P2"]); q(c, "select public.responder('m2', %s, 'nao-vai')", (h,))
    admin(c)
    prazo = q(c, "select public.prazo_da_viagem(d, %s) from public.destinos d where id='d1'", (h,))[0][0]
    q(c, "select public.tarefas_do_relogio(%s)", (prazo + dt.timedelta(minutes=1),))
    q(c, "select public.tarefas_do_relogio(%s)", (prazo + dt.timedelta(minutes=6),))
    f = q(c, "select faltas, valor_falta from public.cobrancas where id=%s", (cid,))[0]
    nf = q(c, "select count(*) from public.faltas where matricula_id='m2'")[0][0]
    registra("T4.1", "'Não vou' no prazo vira falta e desconto na mensalidade aberta; tarefa repetida não duplica", "faltas=1, valor_falta=1000, 1 falta",
             (f, nf), f == (1, 1000) and nf == 1)
    como(c, u["V"]); r = tenta(c, "update public.cobrancas set faltas=0 where id=%s", (cid,))
    admin(c); f2 = q(c, "select faltas from public.cobrancas where id=%s", (cid,))[0][0]
    registra("T4.2", "Celular do vanzeiro com dado antigo grava 'faltas=0' por cima do desconto feito pelo banco", "recusado (desconto mantido)",
             f"{r[0]}; faltas agora = {f2}", f2 == 1)
    como(c, u["V"]); r = tenta(c, "update public.cobrancas set valor_base=1 where id=%s", (cid,))
    registra("T4.3", "Vanzeiro altera o valor de uma cobrança aberta", "recusado", r, r[0] == "erro")
    como(c, u["P2"]); r = tenta(c, "update public.cobrancas set faltas=5 where id=%s", (cid,))
    admin(c); f3 = q(c, "select faltas from public.cobrancas where id=%s", (cid,))[0][0]
    registra("T4.4", "Passageiro tenta aumentar o próprio desconto", "nenhuma linha alterada", f"{r}; faltas = {f3}", f3 == f2)

    # T5: embarque gravado, cobrança não chegou (celular perdeu conexão entre os dois envios)
    como(c, u["V"]); q(c, "insert into public.embarques (matricula_id, data) values ('m1', %s), ('m3', %s)", (h, h))
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    n = q(c, "select count(*) from public.cobrancas where matricula_id in ('m1','m3')")[0][0]
    registra("T5.1", "Embarque 'Por viagem'/'Diário' gravado sem a cobrança: o banco cria ou aponta a falta", "cobrança criada ou pendência apontada",
             f"{n} cobranças para 2 embarques", n == 2)
    como(c, u["V"])
    linha = ("m1_" + str(h), u["V"], "m1", "d1", "P1 Teste", "43999990001", "viagem", "Viagem", h + dt.timedelta(days=7), 3000)
    sql = "insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) on conflict (id) do nothing"
    q(c, sql, linha); q(c, sql, linha); q(c, sql, linha)
    admin(c); n = q(c, "select count(*) from public.cobrancas where matricula_id='m1'")[0][0]
    registra("T5.2", "Mesma cobrança enviada 3 vezes pelo celular (reenvio após falha)", "1 cobrança", n, n == 1)
    c.close()


# ---------------------------------------------------------------- T6/T7 concorrência e última vaga
def em_paralelo(db, tarefas):
    """Dispara as tarefas ao mesmo tempo em conexões separadas; devolve os resultados."""
    out = [None] * len(tarefas); barreira = threading.Barrier(len(tarefas))
    def roda(i, uid, sql, p):
        cc = conectar(db); como(cc, uid) if uid else admin(cc); barreira.wait()
        out[i] = tenta(cc, sql, p); cc.close()
    ts = [threading.Thread(target=roda, args=(i, *t)) for i, t in enumerate(tarefas)]
    [t.start() for t in ts]; [t.join() for t in ts]
    return out


def t6_t7(base):
    c = nova_db(base, "t6"); u = cenario(c, lugares=4); h = u["hoje"]
    # T7.1 duas pessoas disputam a última vaga do destino (4 lugares, 3 ocupados)
    pedidos = []
    for k, tel in (("P4", "43999990004"), ("X", "43999990005")):
        como(c, u[k]); pedidos.append(q(c, "select public.pedir_para_entrar('VAN-4821', %s, %s, 'Cidade A', 'Rua', null, null)", (k, tel))[0][0])
    r = em_paralelo("t6", [(u["V"], "select public.aceitar_pedido(%s, %s)", (pedidos[0], json.dumps({"nome": "P4", "telefone": "43999990004", "plano": "viagem", "valor": 3000}))),
                           (u["V"], "select public.aceitar_pedido(%s, %s)", (pedidos[1], json.dumps({"nome": "X", "telefone": "43999990005", "plano": "viagem", "valor": 3000})))])
    admin(c); ativos = q(c, "select count(*) from public.matriculas where destino_id='d1' and saiu_em is null")[0][0]
    registra("T7.1", "Vanzeiro aceita dois pedidos ao mesmo tempo para a última vaga", "só 1 aceito; 4 matrículas", f"{[x[0] for x in r]}; ativas={ativos}",
             sorted(x[0] for x in r) == ["erro", "ok"] and ativos == 4)
    # T7.2 última vaga da viagem do dia: vanzeiro diminui a van para 2; P3 já disse "Vou"; P1 e P2 disputam
    como(c, u["P3"]); q(c, "select public.responder('m3', %s, 'vai')", (h,))
    como(c, u["V"]); q(c, "update public.perfis_vanzeiro set van_lugares=2 where id=%s", (u["V"],))
    r = em_paralelo("t6", [(u["P1"], "select public.responder('m1', %s, 'vai')", (h,)), (u["P2"], "select public.responder('m2', %s, 'vai')", (h,))])
    admin(c); vao = q(c, "select count(*) from public.respostas where data=%s and resposta='vai'", (h,))[0][0]
    registra("T7.2", "Dois passageiros tocam 'Vou' ao mesmo tempo na última vaga da viagem", "só 1 confirmado (2 no total)", f"{[x[0] for x in r]}; vão={vao}",
             sorted(x[0] for x in r) == ["erro", "ok"] and vao == 2)
    # T7.3 quem desiste no prazo libera a vaga
    como(c, u["P3"]); q(c, "select public.responder('m3', %s, 'nao-vai')", (h,))
    perdedor = "m1" if r[0][0] == "erro" else "m2"; pk = "P1" if perdedor == "m1" else "P2"
    como(c, u[pk]); r2 = tenta(c, "select public.responder(%s, %s, 'vai')", (perdedor, h))
    registra("T7.3", "Desistência no prazo libera a vaga para quem ficou de fora", "ok", r2, r2[0] == "ok")

    # T6.1 toque duplo no "Vou"
    r = em_paralelo("t6", [(u[pk], "select public.responder(%s, %s, 'vai')", (perdedor, h))] * 2)
    admin(c); n = q(c, "select count(*) from public.respostas where matricula_id=%s and data=%s", (perdedor, h))[0][0]
    registra("T6.1", "Toque duplo no 'Vou'", "1 resposta", n, n == 1)
    # T6.2 pagar duas vezes ao mesmo tempo (Pix e Dinheiro) e pagar x cancelar
    como(c, u["V"])
    for cid in ("c-pg", "c-pc"):
        q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                values (%s, %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, 3000)""", (cid, u["V"], h))
    r = em_paralelo("t6", [(u["V"], "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id='c-pg'", (h,)),
                           (u["V"], "update public.cobrancas set pagamento_data=%s, pagamento_forma='dinheiro' where id='c-pg'", (h,))])
    admin(c); forma = q(c, "select pagamento_forma from public.cobrancas where id='c-pg'")[0][0]
    registra("T6.2", "Marcar como pago em dois celulares ao mesmo tempo (Pix e Dinheiro)", "1 vence, o outro é recusado", f"{r}; ficou {forma}",
             sorted(x[0] for x in r) == ["erro", "ok"])
    r = em_paralelo("t6", [(u["V"], "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id='c-pc'", (h,)),
                           (u["V"], "update public.cobrancas set cancelamento_data=%s, cancelamento_motivo='Teste' where id='c-pc'", (h,))])
    admin(c); st = q(c, "select pagamento_data is not null, cancelamento_data is not null from public.cobrancas where id='c-pc'")[0]
    registra("T6.3", "Pagar e cancelar a mesma cobrança ao mesmo tempo", "só uma das duas", f"{[x[0] for x in r]}; pago,cancelado={st}", st in [(True, False), (False, True)])
    # T6.4 duas tarefas automáticas ao mesmo tempo
    r = em_paralelo("t6", [(None, "select public.tarefas_do_relogio(now())", None)] * 3)
    admin(c); dup = q(c, "select count(*) from (select matricula_id, vencimento from public.cobrancas where tipo='mensal' group by 1,2 having count(*)>1) x")[0][0]
    men = q(c, "select count(*) from public.cobrancas where tipo='mensal'")[0][0]
    registra("T6.4", "Três execuções simultâneas da tarefa automática", "1 mensalidade, sem duplicar", f"{[x[0] for x in r]}; mensais={men}; duplicadas={dup}",
             men == 1 and dup == 0)
    # T6.5 duas viagens no mesmo dia / iniciar duas vezes
    r = em_paralelo("t6", [(u["V"], "insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s, %s, 'd1', %s, 'busca', '{}')", (f"vg{i}", u["V"], h)) for i in range(2)])
    admin(c); nv = q(c, "select count(*) from public.viagens where destino_id='d1' and data=%s", (h,))[0][0]
    registra("T6.5", "Toque duplo em 'Iniciar viagem' (dois envios)", "1 viagem", f"{[x[0] for x in r]}; viagens={nv}", nv == 1)
    # T6.6 responder depois que a viagem começou
    como(c, u["P3"]); r = tenta(c, "select public.responder('m3', %s, 'vai')", (h,))
    registra("T6.6", "Responder depois que a viagem começou", "recusado", r, r[0] == "erro")
    c.close()


# ---------------------------------------------------------------- T8/T9/T10
def t8_t9_t10(base):
    c = nova_db(base, "t8"); u = cenario(c); h = u["hoje"]
    # T8.1 interrupção no meio de uma ação: transação desfeita não deixa pedido 'aceito' sem matrícula
    como(c, u["P4"]); ped = q(c, "select public.pedir_para_entrar('VAN-4821', 'P4', '43999990004', 'Cidade A', 'Rua', null, null)")[0][0]
    c2 = psycopg.connect(DSN.format(db="t8")); como(c2, u["V"])
    q(c2, "select public.aceitar_pedido(%s, %s)", (ped, json.dumps({"nome": "P4", "telefone": "43999990004", "plano": "viagem", "valor": 3000})))
    c2.close()  # conexão cai antes de confirmar
    admin(c); st = q(c, "select situacao, matricula_id from public.pedidos where id=%s", (ped,))[0]
    registra("T8.1", "Conexão cai no meio do 'Aceitar pedido'", "pedido continua 'aguardando', sem matrícula pela metade", st, st == ("aguardando", None))
    # T9 integridade
    como(c, u["V"])
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('c9', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, 3000)""", (u["V"], h))
    q(c, "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id='c9'", (h,))
    for teste, sql, desc in [("T9.1", "update public.cobrancas set pagamento_data=null, pagamento_forma=null where id='c9'", "Desfazer um pagamento"),
                             ("T9.2", "update public.cobrancas set cancelamento_data=current_date, cancelamento_motivo='x' where id='c9'", "Cancelar cobrança já paga"),
                             ("T9.3", "delete from public.cobrancas where id='c9'", "Apagar cobrança")]:
        r = tenta(c, sql); admin(c); ainda = q(c, "select pagamento_forma from public.cobrancas where id='c9'"); como(c, u["V"])
        registra(teste, desc, "recusado; pagamento intacto", f"{r}; {ainda}", ainda == [("pix",)] and (r[0] == "erro" or r[1] == 0))
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('c9b', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, 3000)""", (u["V"], h))
    r = tenta(c, "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id='c9b'", (h + dt.timedelta(days=60),))
    registra("T9.4", "Marcar como pago com data no futuro", "recusado", r, r[0] == "erro")
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('c9e', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, 3000)""", (u["V"], h))
    r = tenta(c, "update public.cobrancas set pagamento_data=%s, pagamento_forma='cheque' where id='c9e'", (h,))
    registra("T9.5", "Forma de pagamento inválida ('cheque')", "recusado", r, r[0] == "erro")
    r = tenta(c, "update public.cobrancas set cancelamento_data=%s, cancelamento_motivo='' where id='c9e'", (h,))
    registra("T9.8", "Cancelar sem motivo (motivo vazio)", "recusado", r, r[0] == "erro")
    r = tenta(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                    values ('c9c', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, -500)""", (u["V"], h))
    registra("T9.6", "Cobrança com valor negativo", "recusado", r, r[0] == "erro")
    como(c, u["V2"]); r = tenta(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                    values ('c9d', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem', %s, 500)""", (u["V2"], h))
    registra("T9.7", "Outro vanzeiro cria cobrança para passageiro alheio", "recusado", r, r[0] == "erro")

    # T10 separação de dados
    tabelas = ["contas", "perfis_vanzeiro", "destinos", "dias_sem_viagem", "matriculas", "pedidos", "mudancas_endereco", "juntar_conta", "respostas",
               "vou_sempre", "nao_vou_periodos", "viagens", "embarques", "faltas", "cobrancas", "avisos", "gastos", "celulares", "chaves_push",
               "viagem_sinais", "erros_do_app", "entregas_push", "avisos_de_chegada"]
    anon(c); vaz = {}
    for t in tabelas:
        r = tenta(c, f"select count(*) from public.{t}")
        vaz[t] = r[1][0][0] if r[0] == "ok" else "sem acesso"
    registra("T10.1", "Sem login, ler as 23 tabelas", "nada", vaz, all(v in (0, "sem acesso") for v in vaz.values()))
    como(c, u["V2"]); vis = {t: q(c, f"select count(*) from public.{t} where true")[0][0] for t in ["destinos", "matriculas", "pedidos", "respostas", "cobrancas", "avisos"]}
    registra("T10.2", "Outro vanzeiro só vê os próprios dados", "só d2 e nada de d1", vis, vis["matriculas"] == 0 and vis["pedidos"] == 0 and vis["cobrancas"] == 0 and vis["destinos"] == 1)
    como(c, u["P1"]); vis = {t: q(c, f"select count(*) from public.{t}")[0][0] for t in ["matriculas", "cobrancas", "respostas", "viagens", "pedidos"]}
    registra("T10.3", "Passageiro só vê a própria matrícula e não lê a tabela de viagens", "matriculas=1, viagens=0", vis, vis["matriculas"] == 1 and vis["viagens"] == 0)
    for teste, sql, desc in [("T10.4", "update public.matriculas set valor=1 where id='m1'", "Passageiro muda o próprio valor"),
                             ("T10.5", "insert into public.embarques (matricula_id, data) values ('m1', current_date)", "Passageiro grava o próprio embarque"),
                             ("T10.6", "insert into public.faltas (matricula_id, data, avisou_no_prazo) values ('m1', current_date, true)", "Passageiro grava falta com desconto"),
                             ("T10.7", "select public.estou_na_van('vg', 'm2')", "Passageiro marca 'Estou na van' por outra pessoa"),
                             ("T10.8", "select public.sair_do_destino('m2')", "Passageiro tira outra pessoa do destino"),
                             ("T10.9", "select public.responder('m2', current_date, 'nao-vai')", "Passageiro responde por outra pessoa")]:
        r = tenta(c, sql)
        registra(teste, desc, "recusado", r, r[0] == "erro" or r[1] == 0)
    como(c, u["P1"]); r = q(c, "select * from public.embarque_da_viagem('m2')")
    registra("T10.10", "Passageiro consulta o embarque usando a matrícula de outra pessoa", "nada", r, r == [])
    anon(c); n = 0
    for i in range(200):
        if tenta(c, "insert into public.erros_do_app (mensagem, tela, navegador, papel) values ('lixo', '/x', 'robo', 'passageiro')")[0] == "ok":
            n += 1
    registra("T10.11", "Sem login, gravar 200 'erros' falsos seguidos", "limitado", f"{n} gravados", n < 200)
    como(c, u["P1"]); q(c, "select public.sair_do_destino('m1')")
    vis = q(c, "select (select count(*) from public.perfis_vanzeiro), (select count(*) from public.destinos)")[0]
    registra("T10.12", "Ex-passageiro continua vendo o perfil (Pix/telefone) do vanzeiro, mas não o destino", "observação", vis, True)
    c.close()


ROOT = pathlib.Path(__file__).resolve().parents[1]


def montar_base(nome="vz_auditoria_base"):
    """Banco base: papéis e esquemas simulados do Supabase + todas as migrations do repositório, na ordem."""
    spec = importlib.util.spec_from_file_location("lab_financeiro", ROOT / "scripts/testar-financeiro-local.py")
    lab = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(lab)
    adm = psycopg.connect(DSN.format(db="postgres"), autocommit=True)
    adm.execute(f"drop database if exists {nome}")
    adm.execute(f"create database {nome}")
    for papel, extra in (("anon", ""), ("authenticated", ""), ("service_role", " bypassrls")):
        adm.execute(f"do $$ begin create role {papel} nologin{extra}; exception when duplicate_object then null; end $$")
    adm.close()
    c = conectar(nome)
    c.execute(re.sub(r"create role [a-z_]+ nologin( bypassrls)?;", "", lab.BOOTSTRAP))
    for p in sorted((ROOT / "supabase/migrations").glob("*.sql")):
        c.execute(re.sub(r"create extension if not exists (?:pg_net|pg_cron)[^;]*;", "-- simulada", p.read_text(), flags=re.I))
    c.close()
    return nome


GRUPOS = {"t1": t1, "t2": t2, "t3": t3, "t4": t4_t5, "t6": t6_t7, "t8": t8_t9_t10}

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--saida", help="arquivo JSON com esperado/obtido de cada teste")
    ap.add_argument("--grupos", default=",".join(GRUPOS), help="ex.: t2 (só os testes de avisos)")
    a = ap.parse_args()
    base = montar_base()
    for g in a.grupos.split(","):
        try:
            GRUPOS[g](base)
        except Exception as e:  # registra e segue
            registra(g, "erro no próprio teste", "-", repr(e), False)
    if a.saida:
        json.dump(RES, open(a.saida, "w"), ensure_ascii=False, indent=1, default=str)
    print(f"\nTOTAL {len(RES)} | passaram {sum(r['passou'] for r in RES)} | falharam {sum(not r['passou'] for r in RES)}")
