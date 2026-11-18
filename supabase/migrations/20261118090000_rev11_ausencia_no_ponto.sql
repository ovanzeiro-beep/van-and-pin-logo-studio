-- Expõe somente a ausência da matrícula do próprio passageiro na viagem de hoje.
drop function if exists public.minha_viagem_de_hoje(text);
create function public.minha_viagem_de_hoje(matricula text)
returns table (
  viagem_id text, fase text, na_ordem boolean, embarcou boolean, conferencia text,
  comecou_em timestamptz, volta_as text, nao_estava boolean
)
language sql stable security definer set search_path = '' as $$
  select v.id, v.fase,
         (v.estado -> 'ordem') ? matricula,
         (v.estado -> 'embarcaram') ? matricula,
         v.estado -> 'conferencia' ->> matricula,
         v.comecou_em,
         v.estado ->> 'voltaAs',
         coalesce((v.estado -> 'naoEstavam') ? matricula, false)
  from public.viagens v join public.matriculas m on m.destino_id = v.destino_id
  where m.id = matricula and m.pessoa_id = (select auth.uid()) and m.saiu_em is null
    and v.data = public.hoje_em_brasilia()
$$;
revoke all on function public.minha_viagem_de_hoje(text) from public, anon;
grant execute on function public.minha_viagem_de_hoje(text) to authenticated;
