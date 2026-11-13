import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Plus, Repeat, Users } from "lucide-react";
import { InfoCard, StatusBadge } from "@/components/app/InfoCard";
import { VanzeiroHeader } from "@/components/app/VanzeiroHeader";
import { TIPO_ROTULO, nomeDestino, quandoAcontece } from "@/lib/destinos";
import { useDestinos } from "@/lib/destinos-store";
import { contarPassageiros } from "@/lib/passageiros";
import { usePassageiros } from "@/lib/passageiros-store";

export const Route = createFileRoute("/vanzeiro/destinos/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Destinos — O Vanzeiro" },
      { name: "description", content: "As rotas fixas e viagens avulsas que a sua van faz." },
      { property: "og:title", content: "Destinos — O Vanzeiro" },
      { property: "og:description", content: "As rotas fixas e viagens avulsas que a sua van faz." },
    ],
  }),
  component: ListaDestinos,
});

function ListaDestinos() {
  const destinos = useDestinos();
  const passageiros = usePassageiros();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <VanzeiroHeader compacto titulo="Destinos" subtitulo="As rotas e viagens que você faz.">
        <Link
          to="/vanzeiro/destinos/novo"
          className="relative mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent font-display text-base font-bold text-accent-foreground shadow-cta transition-transform active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" /> Novo destino
        </Link>
      </VanzeiroHeader>

      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4 pt-4">
        {destinos.map((d) => {
          const total = contarPassageiros(passageiros, d.id);
          return (
          <li key={d.id}>
            <Link
              to="/vanzeiro/destinos/$id"
              params={{ id: d.id }}
              className="block rounded-3xl transition-transform active:scale-[0.98]"
            >
              <InfoCard
                compacto
                icon={d.tipo === "fixa" ? Repeat : CalendarDays}
                tone={d.ativo ? "primary" : undefined}
                className={d.ativo ? "" : "opacity-75"}
                label={TIPO_ROTULO[d.tipo]}
                value={nomeDestino(d)}
                detail={`${quandoAcontece(d)} · saída ${d.saida}`}
                aside={
                  d.ativo ? (
                    <StatusBadge status="pago">Ativo</StatusBadge>
                  ) : (
                    <StatusBadge status="neutro">Pausado</StatusBadge>
                  )
                }
              >
                <div className="flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-foreground">{total}</span>
                  <span className="flex-1 text-muted-foreground">
                    {total === 1 ? "passageiro" : "passageiros"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </InfoCard>
            </Link>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
