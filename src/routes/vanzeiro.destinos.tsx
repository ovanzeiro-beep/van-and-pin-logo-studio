import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { vanzeiroExemplo } from "@/data/exemplo";

export const Route = createFileRoute("/vanzeiro/destinos")({
  head: () => ({
    meta: [
      { title: "Destinos — O Vanzeiro" },
      { name: "description", content: "Destinos no O Vanzeiro." },
      { property: "og:title", content: "Destinos — O Vanzeiro" },
      { property: "og:description", content: "Destinos no O Vanzeiro." },
    ],
  }),
  component: () => <PlaceholderTab titulo="Destinos" nome={vanzeiroExemplo.nome} icon={MapPin} />,
});
