-- Sininho: "Limpar" os avisos. Eles saem da lista, mas ficam guardados (escondidos), para o mesmo aviso não
-- ser criado de novo (pelo app ou pela tarefa do relógio). Uma resposta nova do passageiro aparece de novo.
alter table public.avisos add column if not exists apagado boolean not null default false;

create or replace function public.apagar_avisos(ids text[]) returns void
language sql security definer set search_path = '' as $$
  update public.avisos set apagado = true, lido = true where para = auth.uid()::text and id = any(ids)
$$;
revoke all on function public.apagar_avisos(text[]) from public, anon;
grant execute on function public.apagar_avisos(text[]) to authenticated;

-- Aviso trocado (a pessoa mudou a resposta) é novidade: volta a aparecer.
create or replace function public.aviso_trocado_de_novo() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id then
    new.enviado_em := null;
    new.apagado := false;
  end if;
  return new;
end $$;
