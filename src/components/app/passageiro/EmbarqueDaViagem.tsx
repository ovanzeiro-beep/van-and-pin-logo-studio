import { textoDoEmbarque, type EmbarqueDaViagem as Embarque } from "@/lib/embarque";
import { cn } from "@/lib/utils";

/** REV-09: "3 de 8 já embarcaram", the initials of who boarded and "Faltam 2 antes de você". */
export function EmbarqueDaViagem({
  e,
  mostrarMinhaPosicao = true,
}: {
  e: Embarque | null;
  /** CORREÇÃO 4: off on the map screen, where the card's title already says the person's place. */
  mostrarMinhaPosicao?: boolean;
}) {
  if (!e || e.total === 0) return null;
  const t = textoDoEmbarque(e);
  const mostrar = e.iniciais.slice(0, 6);
  const resto = e.iniciais.length - mostrar.length;
  return (
    <div className="mt-2 rounded-2xl bg-surface px-3.5 py-2" role="status">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{t.titulo}</p>
        <div className="flex -space-x-1.5">
          {mostrar.map((ini, i) => (
            <span
              key={i}
              className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-card bg-success-soft px-1 text-[0.65rem] font-bold text-success"
            >
              {ini.replace(/\s/g, "")}
            </span>
          ))}
          {resto > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-card bg-muted px-1 text-[0.65rem] font-bold text-muted-foreground">
              +{resto}
            </span>
          )}
        </div>
      </div>
      {mostrarMinhaPosicao && t.minha && (
        <p
          className={cn(
            "mt-1 text-xs font-bold",
            e.euEmbarquei ? "text-success" : e.faltamAntes === 0 ? "text-warning" : "text-primary",
          )}
        >
          {t.minha}
        </p>
      )}
    </div>
  );
}
