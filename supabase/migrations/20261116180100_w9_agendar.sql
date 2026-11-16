-- W9: roda a tarefa do relógio a cada 5 minutos (pg_cron, do próprio Supabase).
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'tarefas-do-relogio';
select cron.schedule('tarefas-do-relogio', '*/5 * * * *', 'select public.tarefas_do_relogio()');
