#!/usr/bin/env python3
"""Recria SOMENTE um banco Docker descartável; nunca recebe URL de produção.

Uso: python3 scripts/testar-financeiro-local.py [--restaurar]
Requer Docker no socket local. Auth, pg_cron e transporte HTTP são simulados.
As migrations originais são lidas, nunca alteradas. Nenhum aviso sai do container.
"""
import os
import argparse
from pathlib import Path
import re
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
NAME = 'vanzeiro-financeiro-' + uuid.uuid4().hex[:12]
ENV = {k: v for k, v in os.environ.items() if k not in (
    'DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH')}
DOCKER = ['docker', '--host=unix:///var/run/docker.sock']


def run(args, text=None):
    r = subprocess.run(DOCKER + args, input=text, text=True, capture_output=True, env=ENV)
    if r.returncode:
        raise RuntimeError(r.stdout[-2000:] + r.stderr[-6000:])
    return r.stdout


def sql(text, database='vanzeiro_etapa6'):
    return run(['exec', '-i', NAME, 'psql', '-X', '-A', '-t', '-U', 'postgres', '-d', database,
                '-v', 'ON_ERROR_STOP=1'], text)


BOOTSTRAP = r'''
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, aud text, role text,
 raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),
 nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, service_role;
create schema net;
create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}',
 headers jsonb default '{}', timeout_milliseconds int default 5000) returns bigint
 language sql as $$ select 1::bigint $$;
create schema cron;
create table cron.job (jobid bigserial primary key, jobname text unique, schedule text, command text, active boolean default true);
create function cron.schedule(job_name text, expression text, command_text text) returns bigint
 language sql as $$ insert into cron.job (jobname,schedule,command) values (job_name,expression,command_text)
 on conflict (jobname) do update set schedule=excluded.schedule,command=excluded.command returning jobid $$;
create function cron.unschedule(id bigint) returns boolean language sql as $$
 with gone as (delete from cron.job where jobid=id returning *) select exists(select 1 from gone) $$;
create publication supabase_realtime;
'''

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--restaurar', action='store_true',
                        help='também testa dump/restore dos dados fictícios em outro banco local')
    options = parser.parse_args()
    try:
        run(['run', '--rm', '-d', '--network', 'none', '--name', NAME,
             '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:18.6'])
        for attempt in range(100):
            r = subprocess.run(DOCKER + ['exec', NAME, 'pg_isready', '-U', 'postgres'],
                               capture_output=True, env=ENV)
            if r.returncode == 0:
                break
            time.sleep(0.2)
        else:
            raise RuntimeError('PostgreSQL local não ficou pronto')
        sql('create database vanzeiro_etapa6;', 'postgres')
        sql(BOOTSTRAP)
        for path in sorted((ROOT / 'supabase/migrations').glob('*.sql')):
            script = re.sub(r'create extension if not exists (?:pg_net|pg_cron);',
                            '-- extensão externa simulada somente neste laboratório', path.read_text(), flags=re.I)
            sql(script)
            print('MIGRATION:', path.name, flush=True)
        fingerprints = sql(r"""select jsonb_agg(jsonb_build_object('name',p.proname,
            'source_md5',md5(regexp_replace(regexp_replace(p.prosrc,E'--[^\n]*','','g'),E'\\s+','','g'))))
            from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
            and p.proname in ('cobranca_nunca_editada','r_vencimentos','r_nova_cobranca','tarefas_do_relogio','gasto_ate_hoje');""")
        print('FINGERPRINTS: ' + fingerprints.strip(), flush=True)
        matrix = (ROOT / 'supabase/testes/etapa6-financeiro.sql').read_text()
        if options.restaurar:
            # Só no banco Docker criado acima, sem rede. Mantém as fichas para o dump.
            assert matrix.rstrip().endswith('rollback;')
            matrix = matrix.rstrip()[:-len('rollback;')] + 'commit;\n'
        output = sql(matrix)
        print(output, flush=True)
        if options.restaurar:
            snapshot = """select jsonb_build_object(
              'cobrancas', (select count(*) from public.cobrancas),
              'matriculas', (select count(*) from public.matriculas),
              'gastos', (select count(*) from public.gastos),
              'valores_e_historico', (select md5(jsonb_agg(to_jsonb(t) order by id)::text) from public.cobrancas t),
              'matriculas_hash', (select md5(jsonb_agg(to_jsonb(t) order by id)::text) from public.matriculas t),
              'gastos_hash', (select md5(jsonb_agg(to_jsonb(t) order by id)::text) from public.gastos t));"""
            before = sql(snapshot).strip()
            run(['exec', NAME, 'pg_dump', '-U', 'postgres', '-Fc',
                 '-f', '/tmp/fixture.dump', 'vanzeiro_etapa6'])
            sql('create database vanzeiro_etapa7_restore;', 'postgres')
            run(['exec', NAME, 'pg_restore', '-U', 'postgres', '--exit-on-error',
                 '-d', 'vanzeiro_etapa7_restore', '/tmp/fixture.dump'])
            after = sql(snapshot, 'vanzeiro_etapa7_restore').strip()
            if before != after:
                raise RuntimeError('Restauração divergiu das fichas originais')
            print('RESTORE PASS: contagens e hashes idênticos: ' + after, flush=True)
        print('PostgreSQL local 18.6: fichas financeiras concluídas; container sem rede removido.', flush=True)
    finally:
        # NAME é gerado por esta execução; nunca remove outro container.
        subprocess.run(DOCKER + ['rm', '-f', NAME], capture_output=True, env=ENV)
