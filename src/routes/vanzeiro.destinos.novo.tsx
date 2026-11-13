import { createFileRoute } from "@tanstack/react-router";
import { DestinoWizard } from "@/components/app/DestinoWizard";

export const Route = createFileRoute("/vanzeiro/destinos/novo")({
  head: () => ({
    meta: [
      { title: "Novo destino — O Vanzeiro" },
      { name: "description", content: "Cadastre uma rota fixa ou uma viagem avulsa em 3 passos." },
      { property: "og:title", content: "Novo destino — O Vanzeiro" },
      { property: "og:description", content: "Cadastre uma rota fixa ou uma viagem avulsa em 3 passos." },
    ],
  }),
  component: () => <DestinoWizard />,
});
