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
    # Correção 6: o banco é quem cria o código; os testes usam o código que ficou gravado.
    admin(c); u["convite"] = q(c, "select convite from public.destinos where id='d1'")[0][0]
    planos = {"P1": ("m1", "viagem", 3000, None, False, None, "43999990001"),
              "P2": ("m2", "mensal", 30000, 10, True, 1000, "43999990002"),
              "P3": ("m3", "diario", 2000, None, False, None, "43999990003")}
    for k, (mid, plano, valor, venc, desc, vfalta, tel) in planos.items():
        como(c, u[k])
        ped = q(c, "select public.pedir_para_entrar(%s, %s, %s, 'Cidade A', 'Rua Ficticia 1', null, null)", (u["convite"], k + " Teste", tel))[0][0]
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
            values (%s, %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem de hoje', %s, 3000) on conflict (id) do nothing""", (f"m1_{h}", u["V"], h + dt.timedelta(days=7)))
    # ↑ mesmo identificador do app; com a Correção 3 o banco já criou esta cobrança junto com o embarque
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('m1_antiga', %s, 'm1', 'd1', 'P1 Teste', '43999990001', 'viagem', 'Viagem antiga', %s, 3000)""", (u["V"], h - dt.timedelta(days=2)))
    como(c, u["P1"]); r = tenta(c, "select public.sair_do_destino('m1')")
    admin(c)
    linhas = dict(q(c, "select id, coalesce(cancelamento_motivo,'valendo') from public.cobrancas where matricula_id='m1'"))
    registra("T1.1", "Passageiro sai do destino: cobrança de viagem FEITA ainda não vencida continua valendo", "valendo",
             linhas.get(f"m1_{h}"), linhas.get(f"m1_{h}") == "valendo")
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
    anon(c); r = tenta(c, "select * from public.destino_pelo_convite(%s)", (u["convite"],))
    registra("T3.1", "Sem login, consultar convite", "recusado", r[0], r[0] == "erro")
    y = usuario(c, "Adivinho Teste"); como(c, y); q(c, "select public.escolher_papel('passageiro')")
    t0 = time.time(); achados = []; bloqueio = None
    for n in range(1000, 10000):
        r = tenta(c, "select * from public.destino_pelo_convite(%s)", (f"VAN-{n}",))
        if r[0] == "ok" and r[1]:
            achados.append(r[1][0])
        elif r[0] == "erro" and bloqueio is None:
            bloqueio = (n - 1000, r[1])
    seg = time.time() - t0
    registra("T3.2", "Conta comum testa todos os 9.000 códigos VAN-1000…VAN-9999", "bloqueado após poucas tentativas",
             f"{len(achados)} destinos achados em {seg:.1f}s; bloqueio: {bloqueio}; exemplo: {achados[:1]}",
             len(achados) == 0 and bloqueio is not None and bloqueio[0] <= 10)
    como(c, u["X"]); ok = 0
    for i in range(30):
        if tenta(c, "select public.pedir_para_entrar(%s, 'Estranho Teste', '43999990099', 'Cidade A', 'Rua', null, null)", (u["convite"],))[0] == "ok":
            ok += 1
    registra("T3.3", "Mesma conta manda 30 pedidos repetidos para o mesmo destino", "1 pedido aguardando", f"{ok} pedidos criados", ok <= 1)
    como(c, u["V"])
    q(c, """insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('mman', %s, 'd1', 'Cadastro Manual', '43999990555', 'viagem', 3000)""", (u["V"],))
    como(c, u["X"])
    a = tenta(c, "select public.pedir_juntar_pelo_telefone('43999990555')")
    b = tenta(c, "select public.pedir_juntar_pelo_telefone('43999990777')")
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
        como(c, u[k]); pedidos.append(q(c, "select public.pedir_para_entrar(%s, %s, %s, 'Cidade A', 'Rua', null, null)", (u["convite"], k, tel))[0][0])
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
    como(c, u["P4"]); ped = q(c, "select public.pedir_para_entrar(%s, 'P4', '43999990004', 'Cidade A', 'Rua', null, null)", (u["convite"],))[0][0]
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


# ---------------------------------------------------------------- C1: Correção 1 (avisos seguros)
SEMANA_CHEIA = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]  # date.weekday()
MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def quando_vai(dia, hoje):
    """Mesma frase de quandoVai() em src/lib/avisos.ts (terceira implementação, só para os fluxos do teste)."""
    if dia == hoje:
        return "hoje"
    return ("no " if dia.weekday() >= 5 else "na ") + f"{SEMANA_CHEIA[dia.weekday()]}, {dia.day} de {MESES_CURTOS[dia.month - 1]}"


def aviso(id, destino, para, tipo, texto, chave=None, mid=None, cid=None, criado=None):
    a = {"id": id, "destino_id": destino, "para": str(para), "tipo": tipo, "texto": texto, "chave": chave or id}
    if mid: a["matricula_id"] = mid
    if cid: a["cobranca_id"] = cid
    if criado: a["criado_em"] = str(criado)
    return json.dumps(a)


def salvar(c, uid, a, trocar=False):
    como(c, uid)
    return tenta(c, "select public.salvar_aviso(%s, %s)", (a, trocar))


def c1(base):
    c = nova_db(base, "c1"); u = cenario(c); h = u["hoje"]
    admin(c)
    tem_correcao = q(c, "select count(*) from pg_proc where proname='r_textos_da_resposta'")[0][0] == 1
    registra("C1.0", "Banco do laboratório tem a Correção 1 aplicada", "sim", tem_correcao, tem_correcao)
    if not tem_correcao:
        return
    # (a) o banco monta exatamente os textos que o app escreve (arquivo gerado pelo próprio app)
    casos = json.load(open(ROOT / "supabase/testes/correcao1-textos-dos-avisos.json"))
    erradas = []
    for k in casos:
        if k["tipo"] == "resposta":
            ok = q(c, "select %s = any(public.r_textos_da_resposta(%s, %s, %s, %s, %s, %s))",
                   (k["texto"], k["nome"], k["origem"], k["destino"], k["dia"], k["resposta"], k["hoje"]))[0][0]
        else:
            ok = q(c, "select %s = any(public.r_textos_do_periodo(%s, %s, %s, %s, %s))",
                   (k["texto"], k["nome"], k["origem"], k["destino"], k["de"], k["ate"]))[0][0]
        if not ok:
            erradas.append(k["texto"])
    registra("C1.1", f"Os {len(casos)} textos escritos pelo app são aceitos pelo banco", "0 diferenças", f"{len(erradas)} diferenças {erradas[:2]}", not erradas)

    V, P1, P2, P3, X, V2 = u["V"], u["P1"], u["P2"], u["P3"], u["X"], u["V2"]
    nome1, nome2 = "P1", "P2"  # primeiro nome das matrículas do cenário ("P1 Teste")
    # ---- ataques (todos precisam ser recusados)
    ataques = [
        ("C1.A1", P1, aviso("g1", "d1", P2, "cobranca_vencida", "Mensalidade mudou: pague no Pix golpe@exemplo.invalid", mid="m1"), False,
         "Passageiro manda 'cobrança vencida' com Pix falso a outro passageiro"),
        ("C1.A2", P1, aviso("g2", "d1", V, "pedido_novo", "Pedido novo falso", mid="m1"), False, "Passageiro manda 'pedido novo' falso ao vanzeiro"),
        ("C1.A3", P1, aviso("g3", "d1", V, "resposta_passageiro", "URGENTE: sua conta será suspensa, pague a taxa no Pix", chave=f"resposta_m1_{h}", mid="m1"), True,
         "Passageiro manda 'resposta' com texto inventado ao vanzeiro"),
        ("C1.A4", P1, aviso("g4", "d1", V, "resposta_passageiro", f"{nome2} confirmou que hoje vai de Cidade A a Cidade B.", chave=f"resposta_m2_{h}", mid="m2"), True,
         "Passageiro manda 'resposta' usando a matrícula de outra pessoa"),
        ("C1.A5", P1, aviso("g5", "d1", V, "resposta_passageiro", f"{nome1} confirmou que hoje vai de Cidade A a Cidade B.", chave=f"resposta_m1_{h}", mid="m1"), True,
         "Passageiro manda 'resposta' de um dia em que não respondeu"),
        ("C1.A6", P1, aviso("g6", "d1", P2, "presenca_confirmada", "Você confirmou...", chave=f"presenca_m2_{h}", mid="m1"), True,
         "Passageiro manda aviso de presença para outra pessoa"),
        ("C1.A7", P1, aviso("proxima_x", "d1", P1, "prazo_chegando", "x", chave=f"proxima_vg_m1", mid="m1"), False,
         "Passageiro usa chave reservada ao banco ('proxima_')"),
        ("C1.A8", P1, aviso("g8", "d1", V, "resposta_passageiro", f"{nome1} marcou \"Não vou\" em 01/01, em Cidade A → Cidade B", chave="nao_vou_periodo_naoexiste", mid="m1"), True,
         "Passageiro manda aviso de período 'Não vou' que não existe"),
        ("C1.A9", V2, aviso("g9", "d1", P1, "pedido_aceito", "Seu pedido foi aceito", mid="m1"), False, "Outro vanzeiro avisa passageiro alheio"),
        ("C1.A10", V, aviso("g10", "d1", P1, "boa_viagem", "Boa viagem", mid="m1"), False, "Vanzeiro cria tipo que só o banco cria ('boa viagem')"),
        ("C1.A11", V, aviso("g11", "d1", P1, "cobranca_vencida", "Você está devendo", chave="cobranca_vencida_x", mid="m1"), False,
         "Vanzeiro manda 'cobrança vencida' (aviso do vanzeiro) para passageiro"),
        ("C1.A12", V, aviso("g12", "d1", P2, "pedido_aceito", "Seu pedido foi aceito", mid="m1"), False,
         "Vanzeiro manda aviso de uma matrícula para outra pessoa"),
        ("C1.A13", X, aviso("g13", "d1", P1, "prazo_chegando", "x", mid="m1"), False, "Pessoa de fora do destino cria aviso"),
        ("C1.A14", V, aviso("g14", "d1", P1, "van_saiu", "x" * 401, chave=f"van_saiu_m1_{h}", mid="m1"), False, "Aviso com texto de 401 letras"),
        ("C1.A15", P1, aviso("g15", "d1", P1, "presenca_confirmada", "x", chave=f"presenca_m1_{h}"), True, "Passageiro manda aviso sem dizer a matrícula"),
    ]
    for teste, quem, a, trocar, desc in ataques:
        r = salvar(c, quem, a, trocar)
        admin(c); gravado = q(c, "select count(*) from public.avisos where id=%s", (json.loads(a)["id"],))[0][0]
        registra(teste, desc, "recusado e nada gravado", f"{r[0]}: {r[1]}", r[0] == "erro" and gravado == 0)

    # ---- sobrescrever avisos existentes (precisa ficar como estava)
    r = salvar(c, V, aviso("legit-p2", "d1", P2, "pedido_aceito", "O vanzeiro aceitou seu pedido para Cidade A → Cidade B", mid="m2"))
    admin(c); antes = q(c, "select texto from public.avisos where id='legit-p2'")
    salvar(c, P1, aviso("legit-p2b", "d1", P2, "pedido_aceito", "Pague a taxa no Pix golpe", chave="legit-p2", mid="m1"), True)
    admin(c); depois = q(c, "select texto from public.avisos where chave='legit-p2' and para=%s", (str(P2),))
    registra("C1.B1", "Passageiro tenta trocar o texto de um aviso do vanzeiro para outra pessoa", "texto original", depois, depois == antes and len(antes) == 1)
    admin(c)
    q(c, """insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
            values ('sis', %s, %s, 'destino_excluido', 'Texto do sistema', 'destino_excluido_d1', 'd1', 'm1', current_date)""", (V, str(P1)))
    q(c, """insert into public.avisos (id, vanzeiro_id, para, tipo, texto, chave, destino_id, matricula_id, criado_em)
            values ('sis-prazo', %s, %s, 'prazo_chegando', 'Prazo do sistema', %s, 'd1', 'm1', current_date)""", (V, str(P1), f"prazo_m1_{h}"))
    r1 = salvar(c, V, aviso("sis2", "d1", P1, "van_saiu", "Trocado", chave="destino_excluido_d1", mid="m1"), True)
    r2 = salvar(c, V, aviso("sis3", "d1", P1, "prazo_chegando", "Trocado", chave=f"prazo_m1_{h}", mid="m1"), True)
    admin(c); st = q(c, "select texto from public.avisos where para=%s and chave in ('destino_excluido_d1', %s) order by texto", (str(P1), f"prazo_m1_{h}"))
    registra("C1.B2", "Vanzeiro tenta trocar avisos já existentes do passageiro (chave reservada e chave comum)", "textos originais mantidos",
             f"{r1[0]}, {r2[0]}; {st}", st == [("Prazo do sistema",), ("Texto do sistema",)])

    # ---- fluxos legítimos (como o app faz): precisam continuar funcionando
    como(c, P1); q(c, "select public.responder('m1', %s, 'vai')", (h,))
    txt_vou = f"{nome1} confirmou que {quando_vai(h, h)} vai de Cidade A a Cidade B."
    r1 = salvar(c, P1, aviso("r1", "d1", V, "resposta_passageiro", txt_vou, chave=f"resposta_m1_{h}", mid="m1", criado=h), True)
    r2 = salvar(c, P1, aviso("pr1", "d1", P1, "presenca_confirmada", "Você confirmou que hoje vai de Cidade A a Cidade B. Se desistir, avise no app até as 23:20.",
                             chave=f"presenca_m1_{h}", mid="m1", criado=h), True)
    como(c, P1); q(c, "select public.responder('m1', %s, 'nao-vai')", (h,))
    txt_cancel = f"{nome1} cancelou a participação na viagem de Cidade A a Cidade B ({h.strftime('%d/%m')}). A vaga foi liberada."
    r3 = salvar(c, P1, aviso("r2", "d1", V, "resposta_passageiro", txt_cancel, chave=f"resposta_m1_{h}", mid="m1", criado=h), True)
    r4 = salvar(c, P1, aviso("pr2", "d1", P1, "ausencia_registrada", "Você cancelou sua participação...", chave=f"presenca_m1_{h}", mid="m1", criado=h), True)
    como(c, V); vis = q(c, "select texto from public.avisos where chave=%s", (f"resposta_m1_{h}",))
    como(c, P1); pres = q(c, "select tipo from public.avisos where chave=%s", (f"presenca_m1_{h}",))
    registra("C1.L1", "Passageiro responde 'Vou' e depois desiste: o vanzeiro vê só a última resposta; presença trocada",
             "4 ok; vanzeiro vê o cancelamento; presença = ausência registrada", f"{[r1[0], r2[0], r3[0], r4[0]]}; {vis}; {pres}",
             [r1[0], r2[0], r3[0], r4[0]] == ["ok"] * 4 and vis == [(txt_cancel,)] and pres == [("ausencia_registrada",)])
    r = salvar(c, P1, aviso("r3", "d1", V, "resposta_passageiro", "URGENTE: pague a taxa no Pix golpe@exemplo.invalid", chave=f"resposta_m1_{h}", mid="m1", criado=h), True)
    como(c, V); vis2 = q(c, "select texto from public.avisos where chave=%s", (f"resposta_m1_{h}",))
    registra("C1.A16", "Com uma resposta verdadeira gravada, passageiro troca o texto do aviso por um golpe", "recusado; vanzeiro vê o texto certo",
             f"{r[0]}: {r[1]}; {vis2}", r[0] == "erro" and vis2 == [(txt_cancel,)])
    como(c, P2); per = q(c, "select public.marcar_nao_vou('m2', %s, %s)", (h, h + dt.timedelta(days=2)))[0][0]
    dias = f"de {h.strftime('%d/%m')} até {(h + dt.timedelta(days=2)).strftime('%d/%m')}"
    r5 = salvar(c, P2, aviso("np1", "d1", V, "resposta_passageiro", f'{nome2} marcou "Não vou" {dias}, em Cidade A → Cidade B', chave=f"nao_vou_periodo_{per}", mid="m2", criado=h), True)
    como(c, P2); q(c, "select public.tirar_nao_vou(%s)", (per,))
    r6 = salvar(c, P2, aviso("np2", "d1", V, "resposta_passageiro", f'{nome2} tirou o "Não vou" {dias}, em Cidade A → Cidade B', chave=f"nao_vou_periodo_{per}", mid="m2", criado=h), True)
    como(c, V); vis = q(c, "select texto from public.avisos where chave=%s", (f"nao_vou_periodo_{per}",))
    registra("C1.L2", "Passageiro marca e tira 'Não vou de… até…': o vanzeiro vê o aviso trocado", "2 ok; texto 'tirou'", f"{[r5[0], r6[0]]}; {vis}",
             [r5[0], r6[0]] == ["ok", "ok"] and len(vis) == 1 and "tirou" in vis[0][0])
    como(c, V)
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
            values ('cv1', %s, 'm3', 'd1', 'P3 Teste', '43999990003', 'diario', 'Diária', %s, 2000)""", (V, h + dt.timedelta(days=2)))
    do_vanzeiro = [
        aviso("v1", "d1", P3, "pedido_aceito", "O vanzeiro aceitou seu pedido para Cidade A → Cidade B", mid="m3"),
        aviso("v2", "d1", P3, "endereco_aceito", "O vanzeiro aceitou seu novo endereço: Rua 2", mid="m3"),
        aviso("v3", "d1", P3, "viagem_cancelada", "Não vai ter viagem", mid="m3"),
        aviso("v4", "d1", P3, "viagem_de_volta", "Vai ter viagem", mid="m3"),
        aviso("v5", "d1", P3, "van_saiu", "A van saiu", chave=f"van_saiu_m3_{h}", mid="m3"),
        aviso("v6", "d1", P3, "prazo_chegando", "Responda até 23:20", chave=f"prazo_m3_{h}", mid="m3"),
        aviso("v7", "d1", P3, "cobranca_vencendo", "Diária vence", chave="cobranca_vencendo_cv1", mid="m3", cid="cv1"),
        aviso("v8", "d1", V, "cobranca_vencida", "P3 está devendo", chave="cobranca_vencida_cv1", mid="m3", cid="cv1"),
        aviso("v9", "d1", P3, "endereco_recusado", "O vanzeiro não aceitou o novo endereço", mid="m3"),
    ]
    res = [salvar(c, V, a)[0] for a in do_vanzeiro]
    registra("C1.L3", "Os 9 tipos de aviso que o app do vanzeiro cria continuam aceitos", "9 ok", res, res == ["ok"] * 9)
    res = [salvar(c, P3, aviso("s1", "d1", P3, "prazo_chegando", "Responda até 23:20", chave=f"prazo_m3_{h + dt.timedelta(days=1)}", mid="m3"))[0],
           salvar(c, P3, aviso("s2", "d1", P3, "cobranca_vencendo", "Diária vence", chave="cobranca_vencendo_cv1", mid="m3", cid="cv1"))[0]]
    registra("C1.L4", "Avisos que o passageiro cria para si mesmo (prazo, cobrança vencendo)", "2 ok", res, res == ["ok", "ok"])
    a = aviso("v1b", "d1", P3, "van_saiu", "A van saiu", chave=f"van_saiu_m3_{h}", mid="m3")
    r = salvar(c, V, a); admin(c); n = q(c, "select count(*) from public.avisos where chave=%s", (f"van_saiu_m3_{h}",))[0][0]
    registra("C1.L5", "Mesmo aviso enviado de novo (reenvio do celular) não duplica", "ok e 1 aviso", (r[0], n), r[0] == "ok" and n == 1)
    admin(c); q(c, "select public.tarefas_do_relogio(now())")
    como(c, V); q(c, "update public.destinos set excluido_em=now(), ativo=false where id='d1'")
    admin(c); n = q(c, "select count(*) from public.avisos where tipo='destino_excluido' and chave like 'destino_excluido_d1'")[0][0]
    registra("C1.L6", "Avisos criados pelo próprio banco (tarefa automática e destino excluído) continuam funcionando", "aviso de destino excluído criado", n, n >= 1)
    c.close()

# ---------------------------------------------------------------- C2: Correção 2 (cobranças preservadas na saída)
H2 = dt.date(2026, 11, 18)  # "hoje" fixo do banco de teste (quarta-feira), para os resultados não dependerem do dia
AGORA2 = dt.datetime(2026, 11, 18, 15, 0, tzinfo=dt.timezone.utc)  # 12:00 em Brasília


def cobranca(c, vz, id, mid, destino, tipo, venc, valor=10000, de=None, ate=None, pago=None):
    como(c, vz)
    q(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base, periodo_de, periodo_ate)
            values (%s, %s, %s, %s, 'Nome Teste', '43999990000', %s, 'Ref', %s, %s, %s, %s)""", (id, vz, mid, destino, tipo, venc, valor, de, ate))
    if pago:
        q(c, "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id=%s", (pago, id))


def estado(c, *ids):
    admin(c)
    rows = q(c, "select id, case when pagamento_data is not null then 'paga' when cancelamento_data is not null then 'cancelada: ' || cancelamento_motivo else 'valendo' end from public.cobrancas where id = any(%s)", (list(ids),))
    return dict(rows)


def matricula_manual(c, vz, id, destino, plano, valor, venc=None, tel=None):
    como(c, vz)
    q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor, vencimento) values (%s,%s,%s,'Manual Teste',%s,%s,%s,%s)",
      (id, vz, destino, tel or ("4399990" + str(abs(hash(id)) % 10000).zfill(4)), plano, valor, venc))


def c2(base):
    c = nova_db(base, "c2"); u = cenario(c, lugares=12)
    admin(c); q(c, "create or replace function public.hoje_em_brasilia() returns date language sql stable as $$ select date '2026-11-18' $$")
    V, H = u["V"], H2
    d = lambda n: H + dt.timedelta(days=n)
    # P4 entra como Quinzenal (dias 5 e 20)
    como(c, u["P4"]); ped = q(c, "select public.pedir_para_entrar(%s, 'P4 Teste', '43999990004', 'Cidade A', 'Rua', null, null)", (u["convite"],))[0][0]
    como(c, V); q(c, "select public.aceitar_pedido(%s, %s)", (ped, json.dumps({"id": "m4", "nome": "P4 Teste", "telefone": "43999990004", "plano": "quinzenal", "valor": 15000, "vencimento": 5})))
    matricula_manual(c, V, "m7", "d1", "mensal", 30000, 18, "43999990007")
    como(c, V)
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            values ('d3', %s, 'Cidade E', 'Cidade F', 'fixa', array['seg'], '07:00', '1h', 'VAN-5555', array['Cidade E','Cidade F'], true)""", (V,))
    matricula_manual(c, V, "m5", "d3", "mensal", 30000, 10, "43999990005")
    matricula_manual(c, V, "m6", "d3", "viagem", 3000, None, "43999990006")

    # Por viagem (m1): feita e ainda não vencida, vencida, paga
    cobranca(c, V, "A_pend", "m1", "d1", "viagem", d(7)); cobranca(c, V, "A_venc", "m1", "d1", "viagem", d(-2)); cobranca(c, V, "A_paga", "m1", "d1", "viagem", d(3), pago=H)
    # Diário (m3)
    cobranca(c, V, "B_pend", "m3", "d1", "diario", d(7)); cobranca(c, V, "B_venc", "m3", "d1", "diario", d(-1))
    # Mensal com desconto (m2, dia 10): período atual 11/11–10/12 (já começou), futuro 11/12–10/01, vencida 10/11
    cobranca(c, V, "C_atual", "m2", "d1", "mensal", dt.date(2026, 12, 10), 30000, dt.date(2026, 11, 11), dt.date(2026, 12, 10))
    cobranca(c, V, "C_futura", "m2", "d1", "mensal", dt.date(2027, 1, 10), 30000, dt.date(2026, 12, 11), dt.date(2027, 1, 10))
    cobranca(c, V, "C_venc", "m2", "d1", "mensal", dt.date(2026, 11, 10), 30000, dt.date(2026, 10, 11), dt.date(2026, 11, 10))
    # Quinzenal sem desconto (m4, dias 5 e 20): atual 06/11–20/11, futura 21/11–05/12
    cobranca(c, V, "D_atual", "m4", "d1", "quinzenal", dt.date(2026, 11, 20), 15000); cobranca(c, V, "D_futura", "m4", "d1", "quinzenal", dt.date(2026, 12, 5), 15000)
    # Mensal dia 18 (m7): vence hoje (período 19/10–18/11) e a próxima (19/11–18/12) começa amanhã
    cobranca(c, V, "G_hoje", "m7", "d1", "mensal", dt.date(2026, 11, 18)); cobranca(c, V, "G_prox", "m7", "d1", "mensal", dt.date(2026, 12, 18))
    # Destino d3: mensal (dia 10) atual e futura, e uma viagem feita
    cobranca(c, V, "E_atual", "m5", "d3", "mensal", dt.date(2026, 12, 10)); cobranca(c, V, "E_futura", "m5", "d3", "mensal", dt.date(2027, 1, 10))
    cobranca(c, V, "E_viagem", "m6", "d3", "viagem", d(7))
    admin(c); total_antes = q(c, "select count(*) from public.cobrancas")[0][0]

    # 1. Passageiro (Por viagem) sai do destino
    como(c, u["P1"]); r = tenta(c, "select public.sair_do_destino('m1')")
    e = estado(c, "A_pend", "A_venc", "A_paga")
    registra("C2.1", "Por viagem: sai do destino com viagem feita ainda não vencida, vencida e paga", "valendo, valendo, paga",
             f"{r[0]}; {e}", e == {"A_pend": "valendo", "A_venc": "valendo", "A_paga": "paga"})
    # 2. Passageiro (Diário) exclui a conta
    como(c, u["P3"]); r = tenta(c, "select public.excluir_minha_conta()")
    e = estado(c, "B_pend", "B_venc"); admin(c); vinculo = q(c, "select matricula_id, destino_id from public.cobrancas where id='B_pend'")
    registra("C2.2", "Diário: exclui a conta; cobranças continuam valendo e ligadas à matrícula e ao destino", "valendo, valendo; (m3, d1)",
             f"{r[0]}; {e}; {vinculo}", e == {"B_pend": "valendo", "B_venc": "valendo"} and vinculo == [("m3", "d1")])
    # 3. Mensal sai no meio do período
    como(c, u["P2"]); r = tenta(c, "select public.sair_do_destino('m2')")
    e = estado(c, "C_atual", "C_futura", "C_venc")
    registra("C2.3", "Mensal: sai no meio do período; período iniciado e vencida ficam; só o período futuro é cancelado",
             "valendo, cancelada: Saiu do destino, valendo", f"{r[0]}; {e}",
             e == {"C_atual": "valendo", "C_futura": "cancelada: Saiu do destino", "C_venc": "valendo"})
    # 4. Quinzenal removido pelo vanzeiro (como o app faz: marca a saída na matrícula)
    como(c, V); q(c, "update public.matriculas set saiu_em=%s where id='m4'", (H,))
    e = estado(c, "D_atual", "D_futura")
    registra("C2.4", "Quinzenal: vanzeiro remove o passageiro; quinzena iniciada fica, a que começa depois é cancelada",
             "valendo, cancelada: Removido do destino", e, e == {"D_atual": "valendo", "D_futura": "cancelada: Removido do destino"})
    # 5. Saída no dia do vencimento (limite)
    como(c, V); q(c, "update public.matriculas set saiu_em=%s where id='m7'", (H,))
    e = estado(c, "G_hoje", "G_prox")
    registra("C2.5", "Mensal: sai no dia do vencimento; a cobrança do dia fica; a do período que começa amanhã é cancelada",
             "valendo, cancelada: Removido do destino", e, e == {"G_hoje": "valendo", "G_prox": "cancelada: Removido do destino"})
    # 6. Vanzeiro exclui um destino
    como(c, V); q(c, "update public.destinos set excluido_em=now(), ativo=false where id='d3'")
    e = estado(c, "E_atual", "E_futura", "E_viagem")
    registra("C2.6", "Destino excluído: período iniciado e viagem feita ficam; só o período futuro é cancelado",
             "valendo, cancelada: Destino excluído, valendo", e, e == {"E_atual": "valendo", "E_futura": "cancelada: Destino excluído", "E_viagem": "valendo"})
    # 7. Celular antigo tenta o cancelamento automático de um período já iniciado
    como(c, V); r = tenta(c, "update public.cobrancas set cancelamento_data=%s, cancelamento_motivo='Saiu do destino' where id='C_atual'", (H,))
    e = estado(c, "C_atual")
    registra("C2.7", "Celular com versão antiga cancela automaticamente um período já iniciado", "recusado; continua valendo", f"{r}; {e}",
             r[0] == "erro" and e == {"C_atual": "valendo"})
    # 8. Cancelamento manual justificado continua possível (D1-C)
    como(c, V); r = tenta(c, "update public.cobrancas set cancelamento_data=%s, cancelamento_motivo='Combinado com a família: só pagou metade do mês' where id='E_atual'", (H,))
    e = estado(c, "E_atual")
    registra("C2.8", "Vanzeiro cancela à mão, com motivo próprio, uma cobrança de quem saiu", "permitido",
             f"{r[0]}; {e}", r[0] == "ok" and e["E_atual"].startswith("cancelada: Combinado"))
    # 9. Nada de cobrança nova de período futuro para quem saiu (celular antigo ou tarefa automática)
    cobranca_futura = tenta(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                    values ('C_nova', %s, 'm2', 'd1', 'Nome', '43999990000', 'mensal', 'Ref', '2027-02-10', 30000)""", (V,))
    viagem_atrasada = tenta(c, """insert into public.cobrancas (id, vanzeiro_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                    values ('A_atrasada', %s, 'm1', 'd1', 'Nome', '43999990000', 'viagem', 'Ref', %s, 3000)""", (V, d(5)))
    admin(c); q(c, "select public.tarefas_do_relogio(%s)", (AGORA2,))
    existe_atrasada = q(c, "select count(*) from public.cobrancas where id='A_atrasada'")[0][0]
    nova = q(c, "select count(*) from public.cobrancas where id='C_nova'")[0][0]
    registra("C2.9", "Depois da saída: celular antigo não cria mensalidade futura; viagem feita antes da saída ainda pode ser lançada",
             "mensalidade futura não gravada; viagem atrasada gravada", f"mensalidade futura={nova}; viagem atrasada={existe_atrasada} ({cobranca_futura[0]}, {viagem_atrasada[0]})",
             nova == 0 and existe_atrasada == 1)
    # 10. Avisos de dívida de quem saiu (T1.8), sem duplicar
    admin(c); q(c, "select public.tarefas_do_relogio(%s)", (AGORA2,)); q(c, "select public.tarefas_do_relogio(%s)", (AGORA2,))
    av = q(c, "select cobranca_id, count(*) from public.avisos where tipo='cobranca_vencida' and para=%s group by 1 order by 1", (str(V),))
    passag = q(c, "select count(*) from public.avisos where tipo='cobranca_vencendo' and matricula_id in ('m1','m2','m3')")[0][0]
    registra("C2.10", "Vanzeiro recebe 'cobrança vencida' das dívidas de quem saiu, uma vez só; quem saiu não recebe 'vencendo'",
             "A_venc, B_venc, C_venc (1 cada); 0 para passageiros que saíram", f"{av}; vencendo para quem saiu={passag}",
             av == [("A_venc", 1), ("B_venc", 1), ("C_venc", 1)] and passag == 0)
    # 9b. 40 dias depois (os períodos atuais já venceram): a tarefa automática não cria período novo para quem saiu
    admin(c); q(c, "select public.tarefas_do_relogio(%s)", (AGORA2 + dt.timedelta(days=40),))
    novas = q(c, "select id from public.cobrancas where matricula_id in ('m2','m4','m7','m5') and id not in ('C_atual','C_futura','C_venc','D_atual','D_futura','G_hoje','G_prox','E_atual','E_futura') order by 1")
    registra("C2.9b", "40 dias depois: a tarefa automática não cria mensalidade ou quinzena nova para quem saiu", "nenhuma nova", novas, novas == [])
    # 11. Integridade: nenhuma cobrança apagada, todas ligadas
    admin(c)
    total = q(c, "select count(*) from public.cobrancas where id <> 'A_atrasada'")[0][0]
    orfas = q(c, "select count(*) from public.cobrancas k where not exists (select 1 from public.matriculas m where m.id=k.matricula_id) or not exists (select 1 from public.destinos x where x.id=k.destino_id)")[0][0]
    registra("C2.11", "Nenhuma cobrança apagada e nenhuma sem matrícula ou destino", f"{total_antes} cobranças, 0 órfãs", f"{total}, {orfas}",
             total == total_antes and orfas == 0)
    como(c, u["P2"]); vis = q(c, "select count(*) from public.cobrancas")[0][0]
    registra("C2.12", "Quem saiu continua vendo as próprias cobranças", "3", vis, vis == 3)
    c.close()


def c2_concorrencia(base):
    """Saída e pagamento ao mesmo tempo; saída repetida; queda no meio da saída."""
    c = nova_db(base, "c2b"); u = cenario(c, lugares=12)
    admin(c); q(c, "create or replace function public.hoje_em_brasilia() returns date language sql stable as $$ select date '2026-11-18' $$")
    V = u["V"]
    cobranca(c, V, "X_atual", "m2", "d1", "mensal", dt.date(2026, 12, 10), 30000, dt.date(2026, 11, 11), dt.date(2026, 12, 10))
    cobranca(c, V, "X_futura", "m2", "d1", "mensal", dt.date(2027, 1, 10), 30000, dt.date(2026, 12, 11), dt.date(2027, 1, 10))
    # queda no meio da saída: nada muda
    c2c = psycopg.connect(DSN.format(db="c2b")); como(c2c, u["P2"]); q(c2c, "select public.sair_do_destino('m2')"); c2c.close()
    admin(c); st = q(c, "select saiu_em from public.matriculas where id='m2'")[0][0]
    e = estado(c, "X_atual", "X_futura")
    registra("C2.13", "Conexão cai no meio da saída do destino", "nada muda (matrícula ativa, cobranças valendo)", f"saiu_em={st}; {e}",
             st is None and e == {"X_atual": "valendo", "X_futura": "valendo"})
    # saída e pagamento ao mesmo tempo
    r = em_paralelo("c2b", [(u["P2"], "select public.sair_do_destino('m2')", None),
                            (V, "update public.cobrancas set pagamento_data='2026-11-18', pagamento_forma='pix' where id='X_futura'", None),
                            (V, "update public.cobrancas set pagamento_data='2026-11-18', pagamento_forma='dinheiro' where id='X_atual'", None)])
    e = estado(c, "X_atual", "X_futura")
    registra("C2.14", "Passageiro sai enquanto o vanzeiro marca pagamentos", "período iniciado pago; futuro pago ou cancelado (nunca os dois)",
             f"{[x[0] for x in r]}; {e}", e["X_atual"] == "paga" and e["X_futura"] in ("paga", "cancelada: Saiu do destino"))
    como(c, u["P2"]); r = tenta(c, "select public.sair_do_destino('m2')")
    admin(c); n = q(c, "select count(*) from public.cobrancas where matricula_id='m2'")[0][0]
    registra("C2.15", "Toque repetido em 'Sair do destino'", "recusado, nada muda", f"{r[0]}; cobranças={n}", r[0] == "erro" and n == 2)
    r = em_paralelo("c2b", [(None, "select public.tarefas_do_relogio('2026-11-18 15:00+00')", None)] * 3)
    admin(c); dup = q(c, "select count(*) from public.avisos group by para, chave having count(*) > 1")
    registra("C2.16", "Tarefa automática rodando 3 vezes ao mesmo tempo depois da saída", "nenhum aviso duplicado", f"{[x[0] for x in r]}; duplicados={dup}", dup == [])
    c.close()

# ---------------------------------------------------------------- C3: Correção 3 (cobrança do embarque no banco)
def viagem_estado(id, destino, data, embarcaram, fase="busca", ordem=None):
    return json.dumps({"id": id, "destinoId": destino, "data": str(data), "fase": fase, "ordem": ordem or embarcaram,
                       "embarcaram": embarcaram, "naoEstavam": [], "ficaram": [], "conferencia": {}})


def c3(base):
    c = nova_db(base, "c3"); u = cenario(c, lugares=12)
    admin(c); q(c, "create or replace function public.hoje_em_brasilia() returns date language sql stable as $$ select date '2026-11-18' $$")
    tem = q(c, "select count(*) from pg_trigger where tgname='viagem_registra_embarques'")[0][0] == 1
    registra("C3.0", "Banco do laboratório tem a Correção 3 aplicada", "sim", tem, tem)
    V, H = u["V"], H2
    vid = f"d1_{H}"
    # (a) contrato: a cobrança do banco é igual à do app (arquivo gerado pelo próprio app)
    if tem:
        casos = json.load(open(ROOT / "supabase/testes/correcao3-cobrancas-do-embarque.json"))
        admin(c)
        for k in {x["matricula"]: x for x in casos}.values():
            l = k["linha"]
            q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values (%s,%s,'d1',%s,%s,%s,%s)",
              (k["matricula"], V, l["nome"], l["telefone"], l["tipo"], l["valor_base"]))
        dif = []
        campos = ["id", "viagem_id", "matricula_id", "destino_id", "nome", "telefone", "tipo", "referencia", "vencimento", "valor_base",
                  "faltas", "valor_falta", "periodo_de", "periodo_ate", "pagamento_data", "pagamento_forma", "cancelamento_data", "cancelamento_motivo"]
        for k in casos:
            q(c, "select public.r_cobranca_do_embarque(%s, %s, %s)", (k["matricula"], k["data"], k["viagem"]))
            row = q(c, f"select {', '.join(campos)}, vanzeiro_id from public.cobrancas where id=%s", (k["linha"]["id"],))
            if not row:
                dif.append((k["linha"]["id"], "não criada")); continue
            r = dict(zip(campos + ["vanzeiro_id"], [str(v) if isinstance(v, (dt.date, uuid.UUID)) else v for v in row[0]]))
            esperado = {**k["linha"], "vanzeiro_id": str(V)}
            for f in campos + ["vanzeiro_id"]:
                if r[f] != esperado[f]:
                    dif.append((k["linha"]["id"], f, r[f], esperado[f]))
        q(c, "delete from public.cobrancas where matricula_id in ('mx1','mx2','mx3')"); q(c, "delete from public.matriculas where id in ('mx1','mx2','mx3')")
        registra("C3.1", f"As {len(casos)} cobranças de embarque do banco são idênticas às do app (identificador e valores)", "0 diferenças", dif[:3], not dif)

    def contar(mid):
        admin(c)
        return (q(c, "select count(*) from public.embarques where matricula_id=%s and data=%s", (mid, H))[0][0],
                q(c, "select count(*) from public.cobrancas where matricula_id=%s", (mid,))[0][0])

    # (b) com sinal: o app grava só a viagem e fecha (nenhum envio de embarque ou cobrança)
    como(c, V)
    q(c, "insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s,%s,'d1',%s,'busca',%s)", (vid, V, H, viagem_estado(vid, "d1", H, [])))
    q(c, "update public.viagens set estado=%s where id=%s", (viagem_estado(vid, "d1", H, ["m1"], ordem=["m1", "m3", "m2"]), vid))
    admin(c); cob = q(c, "select id, tipo, referencia, vencimento, valor_base, viagem_id from public.cobrancas where matricula_id='m1'")
    registra("C3.2", "Por viagem: 'Embarcou' com sinal e o app fecha na hora — o banco já tem embarque e cobrança", "1 embarque; cobrança m1_d1_2026-11-18 de R$ 30, vence 25/11",
             f"{contar('m1')}; {cob}", contar("m1") == (1, 1) and cob and cob[0][0] == f"m1_{vid}" and cob[0][3] == dt.date(2026, 11, 25) and cob[0][4] == 3000)
    como(c, V); q(c, "update public.viagens set estado=%s where id=%s", (viagem_estado(vid, "d1", H, ["m1", "m3", "m2"]), vid))
    admin(c); cob3 = q(c, "select id, referencia from public.cobrancas where matricula_id='m3'")
    registra("C3.3", "Diário: embarque gera a diária do dia", "1 embarque; cobrança m3_2026-11-18 'Diária de 18/11'", f"{contar('m3')}; {cob3}",
             contar("m3") == (1, 1) and cob3 == [("m3_2026-11-18", "Diária de 18/11")])
    admin(c); cob2 = q(c, "select count(*) from public.cobrancas where matricula_id='m2' and tipo='mensal' and id like %s", (f"m2_{H}%",))[0][0]
    registra("C3.4", "Mensal: embarque é registrado, mas não gera cobrança por viagem", "1 embarque; 0 cobranças do dia", (contar("m2")[0], cob2),
             contar("m2")[0] == 1 and cob2 == 0)
    # (c) repetições: mesma viagem reenviada, toques repetidos e o envio do próprio app
    como(c, V)
    for _ in range(3):
        q(c, "update public.viagens set estado=%s where id=%s", (viagem_estado(vid, "d1", H, ["m1", "m3", "m2"]), vid))
    linha = (f"m1_{vid}", V, vid, "m1", "d1", "P1 Teste", "43999990001", "viagem", "Viagem de 18/11", dt.date(2026, 11, 25), 3000)
    for _ in range(2):
        q(c, """insert into public.cobrancas (id, vanzeiro_id, viagem_id, matricula_id, destino_id, nome, telefone, tipo, referencia, vencimento, valor_base)
                values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) on conflict (id) do nothing""", linha)
        q(c, "insert into public.embarques (matricula_id, data, viagem_id) values ('m1', %s, %s) on conflict (matricula_id, data) do nothing", (H, vid))
    registra("C3.5", "Viagem reenviada 3 vezes e o app envia embarque e cobrança 2 vezes", "1 embarque e 1 cobrança por pessoa",
             [contar("m1"), contar("m3")], contar("m1") == (1, 1) and contar("m3") == (1, 1))
    # (d) cobrança paga ou cancelada não muda quando a viagem é reenviada
    como(c, V); q(c, "update public.cobrancas set pagamento_data=%s, pagamento_forma='pix' where id=%s", (H, f"m1_{vid}"))
    q(c, "update public.cobrancas set cancelamento_data=%s, cancelamento_motivo='Cortesia' where id='m3_2026-11-18'", (H,))
    q(c, "update public.viagens set estado=%s, fase='encerrada' where id=%s", (viagem_estado(vid, "d1", H, ["m1", "m3", "m2"], fase="encerrada"), vid))
    e = estado(c, f"m1_{vid}", "m3_2026-11-18")
    registra("C3.6", "Paga e cancelada continuam assim quando a viagem é reenviada", "paga; cancelada: Cortesia", e,
             e == {f"m1_{vid}": "paga", "m3_2026-11-18": "cancelada: Cortesia"})
    # (e) sem sinal: a fila do celular envia a viagem inteira depois (insert com 'on conflict do update')
    H3 = H + dt.timedelta(days=1); vid3 = f"d1_{H3}"
    como(c, V)
    q(c, """insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s,%s,'d1',%s,'encerrada',%s)
            on conflict (id) do update set fase=excluded.fase, estado=excluded.estado""", (vid3, V, H3, viagem_estado(vid3, "d1", H3, ["m1", "m3"], fase="encerrada")))
    admin(c); n = q(c, "select id from public.cobrancas where id in (%s, %s) order by 1", (f"m1_{vid3}", f"m3_{H3}"))
    registra("C3.7", "Sem sinal: quando a fila envia a viagem, embarques e cobranças nascem juntos", f"m1_{vid3} e m3_{H3}", n, len(n) == 2)
    # (f) embarque gravado sem cobrança (T5.1, celular antigo)
    H4 = H + dt.timedelta(days=2)
    como(c, V); q(c, "insert into public.embarques (matricula_id, data) values ('m3', %s)", (H4,))
    admin(c); n = q(c, "select count(*) from public.cobrancas where id=%s", (f"m3_{H4}",))[0][0]
    registra("C3.8", "Embarque gravado sozinho (versão antiga do app) ganha a cobrança", "1", n, n == 1)
    # (g) identificadores estranhos em 'embarcaram' são ignorados
    como(c, u["V2"])
    q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('x2', %s, 'd2', 'Outro Teste', '43999990777', 'viagem', 9999)", (u["V2"],))
    H5 = H + dt.timedelta(days=3); vid5 = f"d1_{H5}"
    como(c, V)
    q(c, "insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s,%s,'d1',%s,'encerrada',%s)",
      (vid5, V, H5, viagem_estado(vid5, "d1", H5, ["x2", "nao-existe", "m1"], fase="encerrada")))
    admin(c); est = q(c, "select (select count(*) from public.embarques where matricula_id in ('x2','nao-existe')), (select count(*) from public.cobrancas where matricula_id='x2'), (select count(*) from public.cobrancas where id=%s)", (f"m1_{vid5}",))[0]
    registra("C3.9", "Viagem com matrícula de outro vanzeiro e identificador inexistente", "ignorados (0, 0); m1 cobrado (1)", est, est == (0, 0, 1))
    # (h) passageiro não grava viagem
    como(c, u["P1"]); r = tenta(c, "update public.viagens set estado=%s where id=%s", (viagem_estado(vid, "d1", H, ["m1", "m2", "m3", "m4"]), vid))
    registra("C3.10", "Passageiro tenta gravar a viagem para gerar cobranças", "nenhuma linha alterada", r, r[0] == "erro" or r[1] == 0)
    # (i) queda no meio da gravação da viagem: nada pela metade
    H6 = H + dt.timedelta(days=4); vid6 = f"d1_{H6}"
    c2c = psycopg.connect(DSN.format(db="c3")); como(c2c, V)
    q(c2c, "insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s,%s,'d1',%s,'encerrada',%s)", (vid6, V, H6, viagem_estado(vid6, "d1", H6, ["m1"], fase="encerrada")))
    c2c.close()
    admin(c); est = q(c, "select (select count(*) from public.viagens where id=%s), (select count(*) from public.embarques where data=%s), (select count(*) from public.cobrancas where id=%s)", (vid6, H6, f"m1_{vid6}"))[0]
    registra("C3.11", "Conexão cai antes de confirmar a gravação da viagem", "nada gravado (0, 0, 0): a viagem fica na fila do celular", est, est == (0, 0, 0))
    # (j) quem embarcou e depois saiu do destino continua devendo a viagem (Correção 2)
    como(c, u["P1"]); q(c, "select public.sair_do_destino('m1')")
    admin(c); e = q(c, "select count(*) from public.cobrancas where matricula_id='m1' and cancelamento_data is null and pagamento_data is null")[0][0]
    registra("C3.12", "Passageiro que embarcou sai do destino: as viagens feitas continuam cobradas", "2 em aberto", e, e == 2)
    c.close()


def c3_concorrencia(base):
    c = nova_db(base, "c3b"); u = cenario(c, lugares=12)
    V, H = u["V"], H2; vid = f"d1_{H}"
    como(c, V); q(c, "insert into public.viagens (id, vanzeiro_id, destino_id, data, fase, estado) values (%s,%s,'d1',%s,'busca',%s)", (vid, V, H, viagem_estado(vid, "d1", H, [])))
    tarefas = [(V, "update public.viagens set estado=%s where id=%s", (viagem_estado(vid, "d1", H, ["m1", "m3"]), vid))] * 3
    tarefas += [(V, "insert into public.embarques (matricula_id, data, viagem_id) values ('m1', %s, %s) on conflict do nothing", (H, vid))] * 2
    r = em_paralelo("c3b", tarefas)
    admin(c); est = q(c, "select (select count(*) from public.embarques where data=%s), (select count(*) from public.cobrancas where matricula_id in ('m1','m3'))", (H,))[0]
    registra("C3.13", "Três celulares/toques gravam a mesma viagem e o app envia o embarque ao mesmo tempo", "2 embarques e 2 cobranças",
             f"{[x[0] for x in r]}; {est}", est == (2, 2))
    c.close()

ROOT = pathlib.Path(__file__).resolve().parents[1]


IGNORAR = set()  # migrations deixadas de fora (ex.: rodar os testes "antes" de uma correção)


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
        if p.name in IGNORAR:
            print("IGNORADA:", p.name, flush=True)
            continue
        c.execute(re.sub(r"create extension if not exists (?:pg_net|pg_cron)[^;]*;", "-- simulada", p.read_text(), flags=re.I))
    c.close()
    return nome


GRUPOS = {"t1": t1, "t2": t2, "t3": t3, "t4": t4_t5, "t6": t6_t7, "t8": t8_t9_t10, "c1": c1, "c2": c2, "c2b": c2_concorrencia, "c3": c3, "c3b": c3_concorrencia}

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--saida", help="arquivo JSON com esperado/obtido de cada teste")
    ap.add_argument("--grupos", default=",".join(GRUPOS), help="ex.: t2 (só os testes de avisos)")
    ap.add_argument("--ignorar", default="", help="migrations a deixar de fora, separadas por vírgula")
    a = ap.parse_args()
    IGNORAR.update(x for x in a.ignorar.split(",") if x)
    base = montar_base()
    for g in a.grupos.split(","):
        try:
            GRUPOS[g](base)
        except Exception as e:  # registra e segue
            registra(g, "erro no próprio teste", "-", repr(e), False)
    if a.saida:
        json.dump(RES, open(a.saida, "w"), ensure_ascii=False, indent=1, default=str)
    print(f"\nTOTAL {len(RES)} | passaram {sum(r['passou'] for r in RES)} | falharam {sum(not r['passou'] for r in RES)}")
