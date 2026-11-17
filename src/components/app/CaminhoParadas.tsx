import type { ReactNode } from "react";
import { Coffee, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function rotuloDoPonto(i: number, total: number) {
  return i === 0 ? "Saída" : i === total - 1 ? "Chegada" : "Parada";
}

/** One point of the path, drawn as a dot on a vertical line (top to bottom). */
export function PontoDoCaminho({
  nome,
  indice,
  total,
  acoes,
  compacto = false,
  cafe,
  local,
}: {
  nome: string;
  indice: number;
  total: number;
  acoes?: ReactNode;
  /** Same drawing with less space between points, for forms that must fit without scrolling. */
  compacto?: boolean;
  /** This parada is the coffee stop: minutes, shown with a cup. */
  cafe?: number | undefined;
  /** Name of the coffee place, under the city. */
  local?: string | undefined;
}) {
  const primeiro = indice === 0;
  const ultimo = indice === total - 1;
  return (
    <li className={cn("relative flex items-start gap-3 last:pb-0", compacto ? "pb-1.5" : "pb-4")}>
      {!ultimo && <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-0.5 bg-border" />}
      <span
        className={cn(
          "relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          primeiro && "bg-primary text-primary-foreground",
          ultimo && "bg-accent text-accent-foreground",
          !primeiro && !ultimo && !cafe && "border-2 border-primary bg-card",
          cafe && "bg-warning-soft text-warning",
        )}
      >
        {cafe && <Coffee className="h-4 w-4" />}
        {primeiro && <span className="h-2.5 w-2.5 rounded-full bg-current" />}
        {ultimo && <MapPin className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {cafe ? `Parada do café · ${cafe} min` : rotuloDoPonto(indice, total)}
        </p>
        <p className={cn("break-words font-semibold text-foreground", compacto ? "text-sm leading-tight" : "leading-snug")}>{nome}</p>
        {local && <p className="text-sm text-muted-foreground">{local}</p>}
      </div>
      {acoes && <div className="flex shrink-0 items-center gap-1">{acoes}</div>}
    </li>
  );
}

export function CaminhoParadas({ pontos, compacto = false, cafe }: { pontos: string[]; compacto?: boolean; cafe?: { parada: string; minutos: number; local?: string | undefined } | null | undefined }) {
  return (
    <ol>
      {pontos.map((p, i) => (
        <PontoDoCaminho
          key={`${i}-${p}`}
          nome={p}
          indice={i}
          total={pontos.length}
          compacto={compacto}
          cafe={i > 0 && i < pontos.length - 1 && cafe?.parada === p ? cafe.minutos : undefined}
          local={i > 0 && i < pontos.length - 1 && cafe?.parada === p ? cafe.local : undefined}
        />
      ))}
    </ol>
  );
}
