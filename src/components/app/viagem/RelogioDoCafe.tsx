import { useEffect, useState } from "react";
import { Coffee } from "lucide-react";
import { horaDeAgora } from "@/lib/agora";
import { minutosAte } from "@/lib/viagem";
import { cn } from "@/lib/utils";

/** Coffee stop: where, until when, and a clock with the minutes left (the same on the vanzeiro's and the passenger's phone). */
export function RelogioDoCafe({
  onde,
  voltaAs,
  passageiro = false,
}: {
  onde?: string | undefined;
  voltaAs: string;
  passageiro?: boolean;
}) {
  const [agora, setAgora] = useState(horaDeAgora);
  useEffect(() => {
    const t = setInterval(() => setAgora(horaDeAgora()), 15_000);
    return () => clearInterval(t);
  }, []);
  const faltam = minutosAte(voltaAs, agora);
  const acabou = faltam === 0;
  return (
    <section
      className={cn(
        "rounded-3xl border-2 bg-card p-4 shadow-card",
        acabou ? "border-destructive" : "border-warning",
      )}
      role="status"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            acabou ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning",
          )}
        >
          <Coffee className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Parada do café{onde ? ` · ${onde}` : ""}
          </p>
          <p className="font-display text-lg font-bold leading-tight text-foreground">
            {acabou
              ? "Hora de voltar para a van!"
              : passageiro
                ? `Volte para a van até as ${voltaAs}`
                : `Volta às ${voltaAs}`}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "mt-3 text-center font-display text-4xl font-bold tabular-nums",
          acabou ? "text-destructive" : "text-foreground",
        )}
      >
        {acabou ? "0 min" : `${faltam} min`}
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {acabou
          ? "O tempo do café acabou."
          : faltam === 1
            ? "falta 1 minuto"
            : `faltam ${faltam} minutos`}
      </p>
    </section>
  );
}
