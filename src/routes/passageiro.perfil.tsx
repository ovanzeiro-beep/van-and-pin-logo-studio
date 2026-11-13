import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { PlaceholderTab } from "@/components/app/PlaceholderTab";
import { passageiroExemplo } from "@/data/exemplo";

export const Route = createFileRoute("/passageiro/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — O Vanzeiro" },
      { name: "description", content: "Perfil no O Vanzeiro." },
      { property: "og:title", content: "Perfil — O Vanzeiro" },
      { property: "og:description", content: "Perfil no O Vanzeiro." },
    ],
  }),
  component: () => <PlaceholderTab titulo="Perfil" nome={passageiroExemplo.nome} icon={User} />,
});
