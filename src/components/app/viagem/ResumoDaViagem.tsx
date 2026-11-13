import type { ReactNode } from "react";
import { Coffee, UserCheck, UserMinus, UserX, type LucideIcon } from "lucide-react";
import type { Passageiro } from "@/data/exemplo";
import { cn } from "@/lib/utils";
import type { ViagemDoDia } from "@/lib/viagem";

function Linha({ icon: Icon, rotulo, valor, tom, children }: { icon: LucideIcon; rotulo: string; valor: ReactNode; tom: string; children?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tom)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-foreground">{rotulo}</p>
          <p className="font-display text-lg font-bold text-foreground">{valor}</p>
        </div>
        {children && <p className="text-sm text-muted-foreground">{children}</p>}
      </div>
    </div>
  );
}

const nomes = (ids: string[], nome: (id: string) => string) => ids.map(nome).join(", ");

/** Summary of the ida (on arrival) or of the whole day (when the trip ends). */
export function ResumoDaViagem({ v, passageiros, completo }: { v: ViagemDoDia; passageiros: Passageiro[]; completo: boolean }) {
  const nome = (id: string) => passageiros.find((p) => p.id === id)?.nome.split(" ")[0] ?? "Passageiro removido";
  const teveVolta = completo && v.naVolta.length > 0;
  return (
    <div className="space-y-3">
      <section className="rounded-3xl bg-card px-4 py-1.5 shadow-card">
        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ida</p>
        <div className="divide-y divide-border">
          <Linha icon={UserCheck} rotulo="Embarcaram" valor={`${v.embarcaram.length} de ${v.ordem.length}`} tom="bg-success-soft text-success" />
          <Linha icon={UserX} rotulo="Não estavam no ponto" valor={v.naoEstavam.length} tom="bg-destructive-soft text-destructive">
            {v.naoEstavam.length ? nomes(v.naoEstavam, nome) : "Ninguém faltou."}
          </Linha>
          <Linha icon={Coffee} rotulo="Paradas" valor={v.paradasIda} tom="bg-primary-soft text-primary" />
        </div>
      </section>
      {teveVolta && (
        <section className="rounded-3xl bg-card px-4 py-1.5 shadow-card">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Volta</p>
          <div className="divide-y divide-border">
            <Linha icon={UserCheck} rotulo="Levados para casa" valor={v.desceram.length} tom="bg-success-soft text-success" />
            <Linha icon={Coffee} rotulo="Paradas" valor={v.paradasVolta} tom="bg-primary-soft text-primary" />
          </div>
        </section>
      )}
      {v.ficaram.length > 0 && (
        <section className="rounded-3xl bg-card px-4 py-1.5 shadow-card">
          <Linha icon={UserMinus} rotulo="Ficaram (desceram de propósito)" valor={v.ficaram.length} tom="bg-muted text-muted-foreground">
            {nomes(v.ficaram, nome)}
          </Linha>
        </section>
      )}
    </div>
  );
}
