#!/usr/bin/env python3
"""Backup lógico + ensaio da implantação da Correção 5, num PostgreSQL LOCAL e descartável (nunca em produção).

O backup (JSON {"md5_producao": {...}, "tabelas": {...}}) é exportado da produção SÓ com consultas de leitura e fica
FORA do repositório (tem dados pessoais). Este script:
  1. monta um banco igual à produção de hoje (migrations do repositório, menos a da Correção 5, mais as 4 funções
     espelhadas da produção em supabase/testes/espelho-producao-4-funcoes-20261121.sql);
  2. restaura o backup e compara a impressão digital (md5) de cada tabela com a da produção;
  3. aplica a Correção 5 e confere que nenhum dado existente mudou;
  4. roda a tarefa de fim de finalidade e a tarefa automática 2x (nada pode mudar: ninguém excluiu a conta);
  5. reverte a Correção 5 e confere que as regras voltam às de hoje (menos excluir_minha_conta, de propósito) e que
     nenhuma ligação em cascata a partir de contas volta.
Fica de fora do backup: auth.users (Supabase Auth), chaves_push, celulares e entregas_push.

Uso: .venv-lab/bin/python scripts/backup-ensaio-correcao5.py /caminho/backup.json
"""
import json
import runpy
import sys

if len(sys.argv) != 2:
    raise SystemExit(__doc__)
arquivo = sys.argv[1]
sys.argv = [sys.argv[0]]
lab = runpy.run_path(str(__import__("pathlib").Path(__file__).with_name("auditoria-laboratorio.py")), run_name="lab")
ROOT = lab["ROOT"]
backup = json.load(open(arquivo))
md5p, dados = backup["md5_producao"], backup["tabelas"]
C5 = "20261121120000_correcao5_exclusao_de_contas.sql"
lab["IGNORAR"].add(C5)
base = lab["montar_base"]("vz_producao_hoje_c5")
c = lab["nova_db"](base, "ensaio_correcao5")
c.execute("set timezone = 'UTC'")
c.execute(open(ROOT / "supabase/testes/espelho-producao-4-funcoes-20261121.sql").read())


# Colunas que a Correção 5 cria (vazias): ficam fora da comparação, para medir só os dados que já existiam.
NOVAS_COLUNAS = "- 'excluida_em' - 'conta_excluida_em' - 'saiu_do_app_em'"


def md5_das_tabelas():
    return {t: c.execute(f"select md5(coalesce(string_agg((to_jsonb(x) {NOVAS_COLUNAS})::text, E'\\n' "
                         f"order by (to_jsonb(x) {NOVAS_COLUNAS})::text),'')) from public.{t} x").fetchone()[0] for t in md5p}


def funcoes():
    return dict(c.execute(r"""select proname, md5(regexp_replace(prosrc,E'\\s+','','g')) from pg_proc p
                 where pronamespace='public'::regnamespace and prokind='f'
                 and not exists (select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')""").fetchall())


def gatilhos():
    return {x for x, in c.execute("select tgrelid::regclass::text||'.'||tgname from pg_trigger t join pg_class r on r.oid=t.tgrelid "
                                   "where not tgisinternal and r.relnamespace='public'::regnamespace").fetchall()}


r = {}
c.execute("set session_replication_role = replica")
for i in {x["id"] for x in dados.get("contas", [])}:
    c.execute("insert into auth.users (id, aud, role) values (%s, 'authenticated', 'authenticated') on conflict do nothing", (i,))
for t, linhas in dados.items():
    c.execute(f"insert into public.{t} overriding system value select * from jsonb_populate_recordset(null::public.{t}, %s::jsonb)",
              (json.dumps(linhas),))
c.execute("set session_replication_role = origin")
restaurado = md5_das_tabelas()
r["1 restauração"] = f"{sum(restaurado[t] == md5p[t] for t in md5p)} de {len(md5p)} tabelas idênticas à produção " \
                     f"({sum(len(v) for v in dados.values())} linhas)"
antes_f, antes_g = funcoes(), gatilhos()
c.execute(open(ROOT / "supabase/migrations" / C5).read())
depois = md5_das_tabelas()
r["2 dados depois da Correção 5"] = "inalterados" if depois == restaurado else [t for t in md5p if depois[t] != restaurado[t]]
c.execute("select public.encerrar_finalidade_dos_contatos()")
c.execute("select public.tarefas_do_relogio(now())")
c.execute("select public.tarefas_do_relogio(now())")
depois2 = md5_das_tabelas()
mudou = [t for t in md5p if depois2[t] != restaurado[t]]
r["3 fim de finalidade + tarefa automática 2x"] = "nada mudou" if not mudou else f"mudou: {mudou}"
r["3b cobranças"] = f"{len(dados.get('cobrancas', []))} → {c.execute('select count(*) from public.cobrancas').fetchone()[0]}"
r["3c avisos duplicados"] = c.execute("select count(*) from (select 1 from public.avisos group by para, chave having count(*)>1) x").fetchone()[0]
c.execute(open(ROOT / "supabase/testes/correcao5-reverter.sql").read())
dif = sorted(k for k in set(antes_f) | set(funcoes()) if antes_f.get(k) != funcoes().get(k))
r["4 reversão: funções diferentes das de hoje"] = dif
r["4b reversão: gatilhos iguais aos de hoje"] = gatilhos() == antes_g
r["4c reversão: ligações em cascata a partir de contas"] = c.execute(
    "select count(*) from pg_constraint where contype='f' and confdeltype='c' and confrelid='public.contas'::regclass "
    "and conrelid::regclass::text in ('destinos','matriculas','viagens','cobrancas','pedidos','perfis_vanzeiro')").fetchone()[0]
r["4d dados depois da reversão"] = "inalterados" if md5_das_tabelas() == depois2 else "MUDOU"
print(json.dumps(r, ensure_ascii=False, indent=1))
ok = r["1 restauração"].startswith(f"{len(md5p)} de") and r["2 dados depois da Correção 5"] == "inalterados" \
    and r["3c avisos duplicados"] == 0 and dif == ["excluir_minha_conta"] and r["4b reversão: gatilhos iguais aos de hoje"] \
    and r["4c reversão: ligações em cascata a partir de contas"] == 0 and r["4d dados depois da reversão"] == "inalterados"
print("ENSAIO: PASSOU" if ok else "ENSAIO: FALHOU")
sys.exit(0 if ok else 1)
