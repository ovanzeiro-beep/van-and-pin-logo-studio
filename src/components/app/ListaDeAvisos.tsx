import type { Aviso } from "@/data/exemplo";
import { StatusBadge } from "@/components/app/InfoCard";
import { diaMes } from "@/lib/cobrancas";

/** The notices of one person, newest first, with "Novo" on the ones not seen before. */
export function ListaDeAvisos({ avisos, novos, tipos }: { avisos: Aviso[]; novos: Set<string>; tipos: Record<string, { label: string; cor: string }> }) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      {avisos.map((aviso) => (
        <div key={aviso.id} className="border-b border-border px-4 py-3 last:border-b-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-xs font-semibold uppercase tracking-wider ${tipos[aviso.tipo]?.cor || "text-muted-foreground"}`}>
              {tipos[aviso.tipo]?.label || aviso.tipo}
            </p>
            {novos.has(aviso.id) && <StatusBadge status="info">Novo</StatusBadge>}
          </div>
          <p className="mt-1 font-semibold text-foreground">{aviso.textoResumido}</p>
          <p className="text-xs text-muted-foreground">{diaMes(aviso.dataCriacao)}</p>
        </div>
      ))}
    </section>
  );
}
