#!/usr/bin/env python3
"""Backup lógico + ensaio da implantação das Correções 1 a 3 do banco, num PostgreSQL LOCAL e descartável.

O arquivo de backup (JSON: {"md5_producao": {...}, "tabelas": {...}}) é exportado da produção SÓ com consultas de
leitura e fica fora do repositório (tem dados pessoais). Este script:
  1. monta um banco igual à produção de hoje (migrations do repositório, menos as 3 das correções);
  2. restaura o backup e compara a impressão digital (md5) de cada tabela com a da produção;
  3. aplica as 3 migrations na ordem e confere que nenhum dado existente mudou;
  4. faz as operações sensíveis com os dados restaurados (encerrar viagem parada, tarefa automática 2x);
  5. reverte tudo (ordem inversa) e confere que funções e gatilhos voltam idênticos aos de hoje.
Ficam de fora do backup, de propósito: auth.users (senhas: guardadas pelo Supabase Auth, que a implantação não toca),
chaves_push (chave secreta das notificações), celulares e entregas_push (endereços dos aparelhos).

Uso: .venv-lab/bin/python scripts/backup-ensaio-implantacao.py /caminho/backup.json
(precisa do mesmo PostgreSQL local de scripts/auditoria-laboratorio.py)
"""
import json
import runpy
import sys

if len(sys.argv) != 2:
    raise SystemExit(__doc__)
arquivo = sys.argv[1]
sys.argv = [sys.argv[0]]
lab = runpy.run_path(str(__import__("pathlib").Path(__file__).with_name("auditoria-laboratorio.py")), run_name="lab")
psycopg, ROOT = lab["psycopg"], lab["ROOT"]
backup = json.load(open(arquivo))
md5p, dados = backup["md5_producao"], backup["tabelas"]
NOVAS = ["20261120120000_correcao1_avisos_seguros.sql", "20261120130000_correcao2_cobrancas_preservadas.sql",
         "20261120140000_correcao3_cobranca_no_embarque.sql"]
REVERTER = ["correcao3-reverter.sql", "correcao2-reverter.sql", "correcao1-reverter.sql"]

lab["IGNORAR"].update(NOVAS)
base = lab["montar_base"]("vz_producao_hoje")
c = lab["nova_db"](base, "ensaio_implantacao")
c.execute("set timezone = 'UTC'")


def md5_das_tabelas():
    return {t: c.execute(f"select md5(coalesce(string_agg(to_jsonb(x)::text, E'\\n' order by to_jsonb(x)::text),'')) "
                         f"from public.{t} x").fetchone()[0] for t in md5p}


def impressao():
    f = c.execute(r"""select string_agg(proname||':'||md5(regexp_replace(prosrc,E'\\s+','','g')), ',' order by proname,
                      md5(regexp_replace(prosrc,E'\\s+','','g'))) from pg_proc p where pronamespace='public'::regnamespace
                      and prokind='f' and not exists (select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')""").fetchone()[0]
    g = c.execute("select string_agg(tgrelid::regclass::text||'.'||tgname, ',' order by 1) from pg_trigger t "
                  "join pg_class r on r.oid=t.tgrelid where not tgisinternal and r.relnamespace='public'::regnamespace").fetchone()[0]
    return f, g


r = {}
c.execute("set session_replication_role = replica")
for i in {x["id"] for x in dados.get("contas", [])}:
    c.execute("insert into auth.users (id, aud, role) values (%s, 'authenticated', 'authenticated') on conflict do nothing", (i,))
for t, linhas in dados.items():
    c.execute(f"insert into public.{t} overriding system value select * from jsonb_populate_recordset(null::public.{t}, %s::jsonb)",
              (json.dumps(linhas),))
c.execute("set session_replication_role = origin")
restaurado = md5_das_tabelas()
r["1 restauração"] = f"{sum(restaurado[t] == md5p[t] for t in md5p)} de {len(md5p)} tabelas idênticas à produção"
antes_f, antes_g = impressao()
for m in NOVAS:
    c.execute(open(ROOT / "supabase/migrations" / m).read())
r["2 migrações aplicadas"] = len(NOVAS)
depois = md5_das_tabelas()
r["3 dados existentes depois das migrações"] = "inalterados" if depois == restaurado else [t for t in md5p if depois[t] != restaurado[t]]
n_cob = c.execute("select count(*) from public.cobrancas").fetchone()[0]
for vid, in c.execute("select id from public.viagens where fase <> 'encerrada'").fetchall():
    c.execute("update public.viagens set fase='encerrada', estado=jsonb_set(estado,'{fase}','\"encerrada\"'), terminou_em=now() where id=%s", (vid,))
c.execute("select public.tarefas_do_relogio(now())")
c.execute("select public.tarefas_do_relogio(now())")
r["4 encerrar viagens paradas + tarefa automática 2x"] = {
    "cobranças": f"{n_cob} → {c.execute('select count(*) from public.cobrancas').fetchone()[0]}",
    "avisos duplicados": c.execute("select count(*) from (select 1 from public.avisos group by para, chave having count(*)>1) x").fetchone()[0],
}
for s in REVERTER:
    c.execute(open(ROOT / "supabase/testes" / s).read())
depois_f, depois_g = impressao()
r["5 reversão completa"] = "funções e gatilhos idênticos aos de hoje" if (depois_f, depois_g) == (antes_f, antes_g) else "DIFERENTE"
print(json.dumps(r, ensure_ascii=False, indent=1))
ok = r["1 restauração"].startswith(f"{len(md5p)} de") and r["3 dados existentes depois das migrações"] == "inalterados" \
    and r["5 reversão completa"].startswith("funções")
print("ENSAIO: PASSOU" if ok else "ENSAIO: FALHOU")
sys.exit(0 if ok else 1)
