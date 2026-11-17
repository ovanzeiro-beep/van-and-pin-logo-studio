import { Users } from "lucide-react";
import { vagasDaViagem } from "@/lib/lugares";
import { useLugaresDaViagem } from "@/lib/banco/lugares";
import { cn } from "@/lib/utils";

/** REV-08: "4 de 15 lugares ocupados · 11 livres", with a bar, inside the trip card. */
export function VagasDaViagem(a: {
  matriculaId: string;
  destinoId: string;
  vanzeiroId: string;
  data: string;
}) {
  const l = useLugaresDaViagem(a);
  if (!l) return null;
  const v = vagasDaViagem(l.vao, l.lugares, l.euVou);
  const cor =
    v.tom === "lotada" ? "text-destructive" : v.tom === "poucas" ? "text-warning" : "text-success";
  const barra =
    v.tom === "lotada" ? "bg-destructive" : v.tom === "poucas" ? "bg-warning" : "bg-success";
  return (
    <div className="mt-2 rounded-2xl bg-surface px-3.5 py-2" role="status">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Users className={cn("h-4 w-4 shrink-0", cor)} /> {v.titulo}
      </p>
      {l.lugares !== null && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", barra)}
            style={{ width: `${Math.round(v.ocupacao * 100)}%` }}
          />
        </div>
      )}
      {v.detalhe && (
        <p className={cn("mt-1 text-xs font-semibold", l.euVou ? "text-success" : cor)}>
          {v.detalhe}
        </p>
      )}
    </div>
  );
}
