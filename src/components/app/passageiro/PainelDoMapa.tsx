import { Coffee, Info } from "lucide-react";
import { EmbarqueDaViagem } from "@/components/app/passageiro/EmbarqueDaViagem";
import type { EmbarqueDaViagem as Embarque } from "@/lib/embarque";
import { AVISO_DA_POSICAO } from "@/lib/painel-do-mapa";
import type { SituacaoParaPassageiro } from "@/lib/viagem";
import { cn } from "@/lib/utils";

/**
 * CORREÇÃO 4: the card under the passenger's map. The same "Situação da van" as the Início, the real boarding
 * ("3 de 8 já embarcaram", "Faltam 2 antes de você" only when the order is known), the coffee stop and an honest note
 * that the van's position is not on the map.
 */
export function PainelDoMapa({
  van,
  embarque,
  cafe,
  semPonto,
}: {
  van: SituacaoParaPassageiro;
  embarque: Embarque | null;
  /** "Parada do café: Posto X (20 min)", when the destino has one. */
  cafe: string | null;
  /** The person has not marked their point on the map yet. */
  semPonto: boolean;
}) {
  return (
    <section
      className="shrink-0 rounded-3xl bg-card p-4 shadow-card"
      role="status"
      aria-live="polite"
      aria-label="Situação da viagem"
    >
      <p
        className={cn(
          "font-display text-lg font-bold leading-tight",
          van.alerta ? "text-destructive" : "text-foreground",
        )}
      >
        {van.situacao}
      </p>
      <p className="text-sm text-muted-foreground">{van.detalhe}</p>
      <EmbarqueDaViagem e={embarque} mostrarMinhaPosicao={false} />
      {cafe && (
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Coffee className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" /> {cafe}
        </p>
      )}
      {semPonto && (
        <p className="mt-2 text-sm font-semibold text-warning">
          Você ainda não marcou o seu ponto no mapa.
        </p>
      )}
      <p className="mt-3 flex items-start gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {AVISO_DA_POSICAO}
      </p>
    </section>
  );
}
