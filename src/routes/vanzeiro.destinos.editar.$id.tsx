import { createFileRoute } from "@tanstack/react-router";
import { DestinoNaoEncontrado } from "@/components/app/DestinoNaoEncontrado";
import { DestinoWizard } from "@/components/app/DestinoWizard";
import { useDestino } from "@/lib/destinos-store";

export const Route = createFileRoute("/vanzeiro/destinos/editar/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Editar destino — O Vanzeiro" },
      { name: "description", content: "Altere os dias, horários e paradas deste destino." },
      { property: "og:title", content: "Editar destino — O Vanzeiro" },
      { property: "og:description", content: "Altere os dias, horários e paradas deste destino." },
    ],
  }),
  component: EditarDestino,
});

function EditarDestino() {
  const { id } = Route.useParams();
  const destino = useDestino(id);
  if (!destino) return <DestinoNaoEncontrado />;
  return <DestinoWizard key={destino.id} inicial={destino} />;
}
