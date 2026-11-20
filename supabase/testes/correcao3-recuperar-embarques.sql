-- RECUPERAÇÃO dos embarques que ficaram sem registro e sem cobrança antes da Correção 3.
-- SÓ com autorização do dono, e DEPOIS de aplicar supabase/migrations/20261120140000_correcao3_cobranca_no_embarque.sql.
-- Grava dados reais: cria o registro de embarque e, para "Por viagem" e "Diário", a cobrança (vence 7 dias depois do
-- embarque, igual ao app). Não mexe em cobrança existente (paga, cancelada ou em aberto). Pode rodar de novo: não duplica.
-- Em 20/11/2026 uma consulta de leitura achou 2 casos em produção (17/11, "Por viagem", matrículas já encerradas).
begin;

-- Antes: quem aparece como embarcado na viagem e não tem registro de embarque.
select v.data, m.plano, count(*) as casos
from public.viagens v cross join lateral jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]'::jsonb)) as x(mid)
join public.matriculas m on m.id = x.mid and m.destino_id = v.destino_id and m.vanzeiro_id = v.vanzeiro_id
where not exists (select 1 from public.embarques e where e.matricula_id = x.mid and e.data = v.data)
group by 1, 2 order by 1;

-- Recupera os embarques (o gatilho da Correção 3 cria a cobrança de cada um).
insert into public.embarques (matricula_id, data, viagem_id)
select x.mid, v.data, v.id
from public.viagens v cross join lateral jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]'::jsonb)) as x(mid)
join public.matriculas m on m.id = x.mid and m.destino_id = v.destino_id and m.vanzeiro_id = v.vanzeiro_id
on conflict (matricula_id, data) do nothing;

-- Embarques antigos que já existiam sem a cobrança.
select count(*) as conferidos from (select public.r_cobranca_do_embarque(e.matricula_id, e.data, e.viagem_id) from public.embarques e) t;

-- Depois: deve dar zero.
select count(*) as embarcados_sem_registro
from public.viagens v cross join lateral jsonb_array_elements_text(coalesce(v.estado -> 'embarcaram', '[]'::jsonb)) as x(mid)
join public.matriculas m on m.id = x.mid and m.destino_id = v.destino_id and m.vanzeiro_id = v.vanzeiro_id
where not exists (select 1 from public.embarques e where e.matricula_id = x.mid and e.data = v.data);

commit;
