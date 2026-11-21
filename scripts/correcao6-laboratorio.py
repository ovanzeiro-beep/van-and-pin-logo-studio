#!/usr/bin/env python3
"""Correção 6 (convites e telefones) — testes num PostgreSQL LOCAL e descartável. Nunca em produção. Dados fictícios.

Cada pessoa age com o próprio login (papel authenticated + regras de acesso), como no app.
  Parte A: banco igual ao de hoje (sem a Correção 6) com destinos, passageiros e pedidos; aplica a Correção 6 e confere
           a troca dos códigos sem perder passageiros nem vínculos.
  Parte B: banco com a Correção 6: criação do código, formato, limite de tentativas, alarme, pedidos, acessos.
Uso: LAB_PGPORT=54329 .venv-lab/bin/python scripts/correcao6-laboratorio.py [--saida resultado.json]
"""
import json, pathlib, re, runpy, sys, time

saida = sys.argv[sys.argv.index("--saida") + 1] if "--saida" in sys.argv else None
sys.argv = [sys.argv[0]]
lab = runpy.run_path(str(pathlib.Path(__file__).with_name("auditoria-laboratorio.py")), run_name="lab")
q, tenta, como, admin, anon, registra, usuario, cenario, nova_db, montar_base = (
    lab[k] for k in ("q", "tenta", "como", "admin", "anon", "registra", "usuario", "cenario", "nova_db", "montar_base"))
RES, ROOT = lab["RES"], lab["ROOT"]
C6 = "20261121150000_correcao6_convites_e_telefones.sql"
FORMATO = re.compile(r"^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$")
NAO_EXISTE = "VAN-ZZZZZZ"


def md5(c, tabela, colunas="*"):
    admin(c)
    return q(c, f"select md5(coalesce(string_agg(t::text, '|' order by t::text), '')) from (select {colunas} from public.{tabela}) t")[0][0]


def pessoa(c, nome):
    u = usuario(c, nome); como(c, u); q(c, "select public.escolher_papel('passageiro')")
    return u


def acha(c, u, codigo):
    como(c, u); return tenta(c, "select id from public.destino_pelo_convite(%s)", (codigo,))


# ------------------------------------------------------------------ Parte A: aplicar sobre dados que já existem
def parte_a():
    lab["IGNORAR"].add(C6)
    base = montar_base("vz_c6_antes")
    lab["IGNORAR"].discard(C6)
    c = nova_db(base, "c6_migracao"); u = cenario(c)
    admin(c)
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo, excluido_em)
            values ('d9', %s, 'Cidade Y', 'Cidade Z', 'fixa', array['seg'], '07:00', '1h', 'VAN-9999', array['Cidade Y','Cidade Z'], false, now())""", (u["V"],))
    q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('mman', %s, 'd1', 'Cadastro Manual', '43999990555', 'viagem', 3000)", (u["V"],))
    q(c, "insert into public.juntar_conta (matricula_id, conta_id, telefone) values ('mman', %s, '43999990555')", (u["X"],))
    antes = {t: md5(c, t) for t in ("matriculas", "pedidos", "cobrancas", "juntar_conta", "respostas", "embarques")}
    antes["destinos sem o código"] = md5(c, "destinos", "id, vanzeiro_id, origem, destino, ativo, excluido_em, paradas")
    cod = dict(q(c, "select id, convite from public.destinos"))
    c.execute((ROOT / "supabase/migrations" / C6).read_text())
    novo = dict(q(c, "select id, convite from public.destinos"))
    registra("A1", "Códigos dos destinos não excluídos trocados para o formato novo", "d1 e d2 novos",
             {k: (cod[k], novo[k]) for k in ("d1", "d2")},
             all(FORMATO.match(novo[k]) and novo[k] != cod[k] for k in ("d1", "d2")))
    registra("A2", "Destino excluído não muda (e não volta a valer)", "VAN-9999", novo["d9"], novo["d9"] == "VAN-9999")
    depois = {t: md5(c, t) for t in ("matriculas", "pedidos", "cobrancas", "juntar_conta", "respostas", "embarques")}
    depois["destinos sem o código"] = md5(c, "destinos", "id, vanzeiro_id, origem, destino, ativo, excluido_em, paradas")
    registra("A3", "Passageiros, pedidos, cobranças, respostas, embarques e pedidos de juntar continuam iguais", "tudo igual",
             [t for t in antes if antes[t] != depois[t]] or "tudo igual", antes == depois)
    como(c, u["P1"]); vis = q(c, "select convite from public.destinos where id='d1'")
    registra("A4", "Passageiro já vinculado continua vendo o destino (com o código novo)", novo["d1"], vis, vis == [(novo["d1"],)])
    como(c, u["V"]); vis = q(c, "select convite from public.destinos where id='d1'")
    registra("A5", "Vanzeiro consulta o código novo do seu destino", novo["d1"], vis, vis == [(novo["d1"],)])
    y = pessoa(c, "Novo Passageiro")
    registra("A6", "Código antigo VAN-4821 não vale mais", "vazio", acha(c, y, "VAN-4821"), acha(c, y, "VAN-4821") == ("ok", []))
    registra("A7", "Código novo funciona", "d1", acha(c, y, novo["d1"]), acha(c, y, novo["d1"]) == ("ok", [("d1",)]))
    c.close()


# ------------------------------------------------------------------ Parte B: banco com a Correção 6
def criacao(base):
    c = nova_db(base, "c6_criacao"); u = cenario(c)
    admin(c)
    cods = [r[0] for r in q(c, "select public.gerar_convite() from generate_series(1, 10000)")]
    letras = {}
    for x in cods:
        for ch in x[4:]:
            letras[ch] = letras.get(ch, 0) + 1
    media = 60000 / 31
    # Sorteios soltos (não gravados) podem repetir por acaso: ~0,06 repetição esperada em 10.000 (paradoxo do aniversário).
    registra("B1", "10.000 códigos sorteados soltos: todos no formato e letras equilibradas", "ok",
             f"distintos={len(set(cods))}, fora do formato={sum(not FORMATO.match(x) for x in cods)}, letras={len(letras)}, "
             f"menor={min(letras.values())}, maior={max(letras.values())} (média {media:.0f})",
             len(set(cods)) >= 9997 and all(FORMATO.match(x) for x in cods) and len(letras) == 31
             and min(letras.values()) > media * 0.85 and max(letras.values()) < media * 1.15)
    como(c, u["V2"])
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            select 'massa-' || i, %s, 'A', 'B', 'fixa', array['seg'], '07:00', '1h', 'VAN-4821', array['A','B'], true
            from generate_series(1, 2000) i""", (u["V2"],))
    admin(c); gravados = q(c, "select count(*), count(distinct upper(convite)), count(*) filter (where convite !~ '^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$') from public.destinos where id like 'massa-%%'")[0]
    registra("B1b", "2.000 destinos criados pelo celular: 2.000 códigos diferentes, todos no formato", "(2000, 2000, 0)", gravados, gravados == (2000, 2000, 0))
    registra("B2", "Código do cenário (criado pelo celular do vanzeiro) é do banco, não o que o celular mandou", "formato novo",
             u["convite"], FORMATO.match(u["convite"]) is not None)
    como(c, u["V"])
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            values ('d5', %s, 'A', 'B', 'fixa', array['seg'], '07:00', '1h', 'VAN-ABCDEF', array['A','B'], true)""", (u["V"],))
    d5 = q(c, "select convite from public.destinos where id='d5'")[0][0]
    registra("B3", "Celular tenta escolher o próprio código", "recusado (banco sorteia outro)", d5, d5 != "VAN-ABCDEF" and FORMATO.match(d5))
    r = tenta(c, "update public.destinos set convite='VAN-222222' where id='d1'")
    agora = q(c, "select convite from public.destinos where id='d1'")[0][0]
    registra("B4", "Celular tenta trocar o código de um destino", "código continua o mesmo", (r[0], agora), agora == u["convite"])
    q(c, """insert into public.destinos (id, vanzeiro_id, origem, destino, tipo, dias, saida, prazo, convite, paradas, ativo)
            values ('d1', %s, 'Cidade A2', 'Cidade B', 'fixa', array['seg'], '23:50', '30min', 'VAN-333333', array['Cidade A2','Cidade B'], true)
            on conflict (id) do update set origem = excluded.origem, convite = excluded.convite""", (u["V"],))
    r = q(c, "select origem, convite from public.destinos where id='d1'")[0]
    registra("B5", "Salvar o destino de novo (como o app faz) muda os dados mas não o código", ("Cidade A2", u["convite"]), r,
             r == ("Cidade A2", u["convite"]))
    admin(c)
    norm = {t: q(c, "select public.r_codigo_do_convite(%s)", (t,))[0][0] for t in
            ("van 7k2q9m", "7K2Q9M", "VAN-7K2Q9M", " van-7k2q-9m ", "VAN-4821", "VAN-7K2Q9O", "VAN-7K2Q91", "VAN-7K2Q9", "")}
    esperado = {"van 7k2q9m": "VAN-7K2Q9M", "7K2Q9M": "VAN-7K2Q9M", "VAN-7K2Q9M": "VAN-7K2Q9M", " van-7k2q-9m ": "VAN-7K2Q9M",
                "VAN-4821": None, "VAN-7K2Q9O": None, "VAN-7K2Q91": None, "VAN-7K2Q9": None, "": None}
    registra("B6", "Jeitos de digitar: minúsculas, sem traço, com espaços valem; 0/O, 1/I/L, tamanho errado e formato antigo não",
             "ok", norm, norm == esperado)
    y = pessoa(c, "Passageiro Digitando")
    digitado = u["convite"].lower().replace("-", " ")
    registra("B7", "Passageiro acha a van digitando o código em minúsculas e com espaço", "d1", acha(c, y, digitado), acha(c, y, digitado) == ("ok", [("d1",)]))
    c.close()


def limite(base):
    c = nova_db(base, "c6_limite"); u = cenario(c)
    a, b, d = pessoa(c, "Pessoa A"), pessoa(c, "Pessoa B"), pessoa(c, "Pessoa D")
    erros = [acha(c, a, NAO_EXISTE) for _ in range(10)]
    r11 = acha(c, a, u["convite"])
    registra("L1", "10 códigos errados e, na 11ª, até o código certo é recusado", "recusado com aviso",
             (sum(e == ("ok", []) for e in erros), r11), all(e == ("ok", []) for e in erros) and r11[0] == "erro" and "Muitos códigos" in r11[1])
    como(c, a); r = tenta(c, "select public.pedir_para_entrar(%s, 'Pessoa A', '43999990901', 'Cidade A', 'Rua', null, null)", (u["convite"],))
    registra("L2", "Bloqueado também para pedir para entrar", "recusado", r, r[0] == "erro" and "Muitos códigos" in r[1])
    registra("L3", "Outra conta não é afetada", "acha d1", acha(c, b, u["convite"]), acha(c, b, u["convite"]) == ("ok", [("d1",)]))
    ok = [acha(c, d, u["convite"]) for _ in range(30)]
    registra("L4", "Quem usa o código certo várias vezes nunca é bloqueado (30 consultas)", "30 acertos",
             sum(x == ("ok", [("d1",)]) for x in ok), all(x == ("ok", [("d1",)]) for x in ok))
    admin(c); q(c, "update public.tentativas_de_convite set em = em - interval '61 minutes' where conta = %s", (a,))
    registra("L5", "Passada 1 hora, a conta volta a funcionar", "acha d1", acha(c, a, u["convite"]), acha(c, a, u["convite"]) == ("ok", [("d1",)]))
    e = pessoa(c, "Pessoa E"); como(c, e)
    res = [tenta(c, "select public.pedir_para_entrar(%s, 'Pessoa E', '43999990902', 'Cidade A', 'Rua', null, null)", (NAO_EXISTE,)) for _ in range(10)]
    r11 = acha(c, e, u["convite"])
    registra("L6", "Pedir para entrar com código errado: resposta vazia, tentativa anotada; na 11ª, bloqueio", "10 vazias + bloqueio",
             (sum(x == ("ok", [(None,)]) for x in res), r11[0]), all(x == ("ok", [(None,)]) for x in res) and r11[0] == "erro")
    f = pessoa(c, "Pessoa F")
    for _ in range(5): acha(c, f, NAO_EXISTE)
    como(c, f)
    for _ in range(5): tenta(c, "select public.pedir_para_entrar(%s, 'Pessoa F', '43999990903', 'Cidade A', 'Rua', null, null)", (NAO_EXISTE,))
    r = acha(c, f, u["convite"])
    registra("L7", "Erros nas duas telas somam (5 + 5 = 10)", "bloqueado", r, r[0] == "erro")
    admin(c); q(c, "insert into public.tentativas_de_convite (conta, em) values (%s, now() - interval '2 days')", (f,))
    acha(c, b, NAO_EXISTE)
    admin(c); velhas = q(c, "select count(*) from public.tentativas_de_convite where em < now() - interval '1 day'")[0][0]
    registra("L8", "Registros com mais de 1 dia são apagados", "0", velhas, velhas == 0)
    admin(c); guardado = q(c, "select array_agg(column_name::text order by column_name) from information_schema.columns where table_name='tentativas_de_convite'")[0][0]
    registra("L9", "O registro guarda só conta e hora (nenhum código, telefone ou nome)", "conta, em, id", guardado, guardado == ["conta", "em", "id"])
    c.close()


def alarme(base):
    c = nova_db(base, "c6_alarme"); u = cenario(c)
    contas = [pessoa(c, f"Robo {i}") for i in range(12)]
    t0 = time.time()
    for x in contas:
        for _ in range(9): acha(c, x, NAO_EXISTE)
    r = acha(c, contas[0], NAO_EXISTE)
    registra("D1", "12 contas com 9 erros cada (108 no total): o alarme deixa cada uma com 3 por hora", "10º erro recusado",
             f"{r[0]} ({time.time() - t0:.1f}s)", r[0] == "erro")
    legit = pessoa(c, "Pessoa Legitima")
    registra("D2", "Durante o alarme, quem não errou acha a van normalmente", "acha d1", acha(c, legit, u["convite"]),
             acha(c, legit, u["convite"]) == ("ok", [("d1",)]))
    errou = [acha(c, legit, NAO_EXISTE) for _ in range(3)]
    r = acha(c, legit, u["convite"])
    registra("D3", "Durante o alarme, 3 erros bastam para esperar 1 hora", "4ª recusada", ([e[0] for e in errou], r[0]),
             all(e == ("ok", []) for e in errou) and r[0] == "erro")
    admin(c); q(c, "update public.tentativas_de_convite set em = em - interval '61 minutes'")
    registra("D4", "Passada 1 hora o alarme some sozinho", "acha d1", acha(c, legit, u["convite"]), acha(c, legit, u["convite"]) == ("ok", [("d1",)]))
    c.close()


def pedidos(base):
    c = nova_db(base, "c6_pedidos"); u = cenario(c, lugares=4)
    como(c, u["P4"]); p1 = q(c, "select public.pedir_para_entrar(%s, 'P4 Teste', '43999990004', 'Cidade A', 'Rua', null, null)", (u["convite"],))[0][0]
    r = tenta(c, "select public.pedir_para_entrar(%s, 'P4 Teste', '43999990004', 'Cidade A', 'Rua', null, null)", (u["convite"],))
    registra("P1", "Mesmo pedido repetido para a mesma van enquanto espera resposta", "recusado", r, r[0] == "erro" and "já foi enviado" in r[1])
    como(c, u["V"]); q(c, "select public.recusar_pedido(%s)", (p1,))
    como(c, u["P4"]); r = tenta(c, "select public.pedir_para_entrar(%s, 'P4 Teste', '43999990004', 'Cidade A', 'Rua', null, null)", (u["convite"],))
    registra("P2", "Depois de recusado, pode pedir de novo", "pedido criado", r, r[0] == "ok" and r[1][0][0] and not r[1][0][0].startswith("#"))
    como(c, u["V"]); q(c, "select public.recusar_pedido(%s)", (r[1][0][0],))
    q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('mman', %s, 'd1', 'Cadastro Manual', '43999990555', 'viagem', 3000)", (u["V"],))
    como(c, u["X"]); r = tenta(c, "select public.pedir_para_entrar(%s, 'Estranho', '43999990099', 'Cidade A', 'Rua', null, null)", (u["convite"],))
    admin(c); anot = q(c, "select count(*) from public.tentativas_de_convite where conta=%s", (u["X"],))[0][0]
    registra("P3", "Van cheia e telefone não cadastrado: resposta 'cheia' e tentativa anotada", "#cheia, 1 tentativa", (r, anot),
             r == ("ok", [("#cheia",)]) and anot == 1)
    z = pessoa(c, "Titular do Cadastro"); como(c, z)
    r = tenta(c, "select public.pedir_para_entrar(%s, 'Titular', '43999990555', 'Cidade A', 'Rua', null, null)", (u["convite"],))
    registra("P4", "Van cheia, mas quem já está cadastrado (mesmo telefone) consegue pedir", "pedido criado", r, r[0] == "ok" and not r[1][0][0].startswith("#"))
    como(c, u["V"]); lig = tenta(c, "select public.ligar_pedido_ao_cadastro(%s)", (r[1][0][0],))
    registra("P5", "'Ligar ao cadastro' continua funcionando", "mman", lig, lig == ("ok", [("mman",)]))
    w = pessoa(c, "Testador de Telefones"); como(c, w)
    res = [tenta(c, "select public.pedir_para_entrar(%s, 'T', %s, 'Cidade A', 'Rua', null, null)", (u["convite"], f"439999906{i:02d}")) for i in range(12)]
    registra("P6", "Testar vários telefones com a van cheia esbarra no limite (10 por hora)", "10 'cheia' e depois bloqueio",
             [x[1][0][0] if x[0] == "ok" else "bloqueado" for x in res],
             [x[1][0][0] if x[0] == "ok" else "bloqueado" for x in res] == ["#cheia"] * 10 + ["bloqueado"] * 2)
    c.close()


def acessos(base):
    c = nova_db(base, "c6_acessos"); u = cenario(c)
    admin(c); q(c, "insert into public.matriculas (id, vanzeiro_id, destino_id, nome, telefone, plano, valor) values ('mman', %s, 'd1', 'Cadastro Manual', '43999990555', 'viagem', 3000)", (u["V"],))
    anon(c)
    r = [tenta(c, s, p)[1][:40] for s, p in (("select * from public.destino_pelo_convite(%s)", (u["convite"],)),
                                       ("select public.pedir_para_entrar(%s, 'a', '43999990001', 'b', 'c', null, null)", (u["convite"],)),
                                       ("select public.gerar_convite()", None))]
    registra("S1", "Sem login: consultar, pedir e sortear código", "sem permissão", r, all("permission denied" in x for x in r))
    como(c, u["X"])
    r = {s.split("(")[0][7:]: tenta(c, s)[1] for s in ("select public.pedir_juntar_pelo_telefone('43999990555')",
                                     "select public.confirmar_juntar_conta('mman', gen_random_uuid(), true)",
                                     "select count(*) from public.tentativas_de_convite",
                                     f"select public.r_convite_liberado('{u['X']}')",
                                     f"select public.r_anotar_tentativa('{u['X']}')",
                                     "select public.r_codigo_do_convite('VAN-222222')")}
    registra("S2", "Conta comum: funções de juntar pelo telefone, registro de tentativas e funções internas", "tudo recusado", r,
             all("permission denied" in str(v) for v in r.values()))
    vis = q(c, "select count(*) from public.destinos where convite = %s", (u["convite"],))[0][0]
    ins = tenta(c, "insert into public.pedidos (vanzeiro_id, destino_id, pessoa_id, nome, telefone) values (%s, 'd1', %s, 'X', '43999990099')", (u["V"], u["X"]))
    registra("S3", "Conta comum procura destino direto na tabela pelo código, ou grava pedido direto", "0 e recusado", (vis, ins[0]), vis == 0 and ins[0] == "erro")
    como(c, u["V"]); q(c, "update public.destinos set ativo=false where id='d1'")
    y = pessoa(c, "Pessoa Y")
    registra("S4", "Destino pausado não aparece pelo código", "vazio", acha(c, y, u["convite"]), acha(c, y, u["convite"]) == ("ok", []))
    admin(c); dados = q(c, "select count(*) from public.juntar_conta")[0][0]
    registra("S5", "Funções de juntar fechadas sem apagar dados (tabela continua)", "tabela existe", dados, dados == 0)
    c.close()


if __name__ == "__main__":
    parte_a()
    base = montar_base("vz_c6_depois")
    for g in (criacao, limite, alarme, pedidos, acessos):
        try:
            g(base)
        except Exception as e:
            registra(g.__name__, "erro no próprio teste", "-", repr(e), False)
    if saida:
        json.dump(RES, open(saida, "w"), ensure_ascii=False, indent=1, default=str)
    print(f"\nTOTAL {len(RES)} | passaram {sum(r['passou'] for r in RES)} | falharam {sum(not r['passou'] for r in RES)}")
