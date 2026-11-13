import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { passageiroExemplo } from "@/data/exemplo";

export const Route = createFileRoute("/passageiro/viagens")({
  head: () => ({
    meta: [
      { title: "Viagens — O Vanzeiro" },
      { name: "description", content: "Viagens no O Vanzeiro." },
      { property: "og:title", content: "Viagens — O Vanzeiro" },
      { property: "og:description", content: "Viagens no O Vanzeiro." },
    ],
  }),
  component: () => <PlaceholderTab titulo="Viagens" nome={passageiroExemplo.nome} icon={CalendarDays} />,
});
