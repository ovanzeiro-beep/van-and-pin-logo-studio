#!/usr/bin/env python3
"""Ensaio da implantação da Correção 6 sobre uma cópia dos dados de produção (backup lógico), num PostgreSQL LOCAL.

O backup (JSON com dados pessoais) fica FORA do repositório. Este script:
  1. monta um banco igual ao de hoje (sem a Correção 6) e restaura o backup (md5 igual ao da produção);
  2. cola supabase/SO-SQL-17-correcao-6.sql: só o código dos destinos não excluídos muda; o resto fica igual;
  3. cola de novo: nada muda;
  4. desfaz (SO-SQL-17b): as regras voltam às de hoje, menos as duas funções de juntar (continuam fechadas);
  5. cola outra vez depois de desfazer: funciona.
Uso: LAB_PGPORT=54329 .venv-lab/bin/python scripts/correcao6-ensaio.py /caminho/backup.json
"""
import json, re, runpy, sys
arquivo = sys.argv[1]; sys.argv = [sys.argv[0]]
lab = runpy.run_path(str(__import__("pathlib").Path(__file__).with_name("auditoria-laboratorio.py")), run_name="lab")
ROOT = lab["ROOT"]; backup = json.load(open(arquivo)); md5p, dados = backup["md5_producao"], backup["tabelas"]
C6 = "20261121150000_correcao6_convites_e_telefones.sql"
lab["IGNORAR"].add(C6)
c = lab["nova_db"](lab["montar_base"]("vz_c6_hoje"), "ensaio_c6")
c.execute("set timezone = 'UTC'")
c.execute(open(ROOT / "supabase/testes/espelho-producao-4-funcoes-20261121.sql").read())
c.execute("set session_replication_role = replica")
for i in {x["id"] for x in dados["contas"]}:
    c.execute("insert into auth.users (id, aud, role) values (%s, 'authenticated', 'authenticated') on conflict do nothing", (i,))
for t, linhas in dados.items():
    c.execute(f"insert into public.{t} overriding system value select * from jsonb_populate_recordset(null::public.{t}, %s::jsonb)", (json.dumps(linhas),))
c.execute("set session_replication_role = origin")
NOVAS = "- 'excluida_em' - 'conta_excluida_em' - 'saiu_do_app_em'"


def tabelas(sem_convite=False):
    tira = " - 'convite'" if sem_convite else ""
    return {t: c.execute(f"select md5(coalesce(string_agg((to_jsonb(x) {NOVAS}{tira})::text, E'\\n' order by (to_jsonb(x) {NOVAS}{tira})::text),'')) from public.{t} x").fetchone()[0] for t in md5p}


def estrutura():
    return dict(c.execute(r"""
      select 'funcao ' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
             md5(regexp_replace(p.prosrc, '\s+', '', 'g') || coalesce(array_to_string(p.proconfig, ','), '') || p.prosecdef::text || p.provolatile::text
                 || coalesce((select string_agg(a, ',' order by a) from unnest(p.proacl::text[]) a), ''))
      from pg_proc p where p.pronamespace = 'public'::regnamespace and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      union all select 'gatilho ' || c.relname || '.' || g.tgname, md5(pg_get_triggerdef(g.oid)) from pg_trigger g join pg_class c on c.oid = g.tgrelid
      where not g.tgisinternal and c.relnamespace = 'public'::regnamespace
      union all select 'regra ' || tablename || '.' || policyname, md5(coalesce(qual, '') || coalesce(with_check, '')) from pg_policies where schemaname = 'public'
      union all select 'tabela ' || relname, '' from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'""").fetchall())


def convites():
    return dict(c.execute("select id, convite || case when excluido_em is null then '' else ' (excluído)' end from public.destinos order by id").fetchall())


r = {}
hoje = tabelas()
r["1 backup restaurado"] = f"{sum(hoje[t] == md5p[t] for t in md5p)} de {len(md5p)} tabelas iguais à produção"
e0, k0, s0 = estrutura(), convites(), tabelas(True)
colar = (ROOT / "supabase/SO-SQL-17-correcao-6.sql").read_text()
c.execute(colar)
k1 = convites(); d1 = tabelas(); s1 = tabelas(True)
trocados = {i: (k0[i], k1[i]) for i in k0 if k0[i] != k1[i]}
r["2 códigos trocados"] = trocados
r["2 códigos dos ativos no formato novo"] = all(re.match(r"^VAN-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$", k1[i]) for i in trocados)
r["2 excluídos sem mudança"] = all(k0[i] == k1[i] for i in k0 if "excluído" in k0[i])
r["2 tabelas que mudaram"] = [t for t in md5p if d1[t] != hoje[t]]
r["2 sem contar o código, todas as tabelas"] = "iguais" if s1 == s0 else [t for t in s0 if s0[t] != s1[t]]
c.execute(colar)
r["3 colar de novo"] = "nada mudou" if convites() == k1 and tabelas() == d1 else "MUDOU"
c.execute((ROOT / "supabase/SO-SQL-17b-desfazer-correcao-6.sql").read_text())
e2 = estrutura()
r["4 desfazer: diferenças com hoje"] = sorted({k for k in set(e0) | set(e2) if e0.get(k) != e2.get(k)})
r["4 desfazer: dados"] = "iguais aos de depois da Correção 6" if tabelas() == d1 else "MUDOU"
c.execute(colar)
r["5 colar depois de desfazer"] = "ok, códigos mantidos" if convites() == k1 else "MUDOU"
for k, v in r.items():
    print(k, ":", v)
ok = (r["1 backup restaurado"].startswith(f"{len(md5p)} de") and len(trocados) >= 1 and r["2 códigos dos ativos no formato novo"]
      and r["2 excluídos sem mudança"] and r["2 tabelas que mudaram"] == ["destinos"] and r["2 sem contar o código, todas as tabelas"] == "iguais" and r["3 colar de novo"] == "nada mudou"
      and r["4 desfazer: dados"].startswith("iguais") and r["5 colar depois de desfazer"].startswith("ok"))
print("ENSAIO:", "PASSOU" if ok else "FALHOU")
