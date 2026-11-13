import { createFileRoute } from "@tanstack/react-router";
import { DestinoWizard } from "@/components/app/DestinoWizard";

export const Route = createFileRoute("/vanzeiro/destinos/novo")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Novo destino — O Vanzeiro" },
      { name: "description", content: "Cadastre uma rota fixa ou uma viagem avulsa em 3 passos." },
      { property: "og:title", content: "Novo destino — O Vanzeiro" },
      { property: "og:description", content: "Cadastre uma rota fixa ou uma viagem avulsa em 3 passos." },
    ],
  }),
  component: () => <DestinoWizard />,
});
